# Configuración de las pruebas de carga JMeter — Spring PetClinic (Legado)

## 1. Objetivo de las pruebas

El propósito de estas pruebas es medir el comportamiento actual (legado) de la aplicación Spring PetClinic frente a dos flujos funcionales concretos, para luego repetir exactamente las mismas pruebas sobre la versión modernizada y comparar resultados:

- **RQ-01:** Búsqueda de dueños por apellido.
- **RQ-06:** Registro de una visita para una mascota.

Se eligió un enfoque de **ramp-up** (aumento gradual de usuarios) porque el interés no es solo saber si la aplicación responde bien con pocos usuarios, sino observar **cómo escala** su rendimiento a medida que crece la carga. Esto permite detectar en qué punto empieza a degradarse el tiempo de respuesta, lo cual es justo lo que se necesita para argumentar (o no) una mejora de escalabilidad y mantenibilidad tras la modernización.

## 2. Análisis previo del código legado

Antes de armar las pruebas, se revisó el repositorio oficial de Spring PetClinic para entender:

- **Qué endpoints existen realmente** (a través de los controladores del proyecto).
- **Qué parámetros espera cada uno** (nombres de campos de formularios).
- **Cómo está configurada la aplicación** (base de datos, puerto, seguridad).
- **Qué datos de prueba ya vienen cargados** (para no inventar datos que no existen).

Hallazgos clave de ese análisis:

| Aspecto | Hallazgo | Por qué importa |
|---|---|---|
| Framework | Spring Boot + Thymeleaf (renderiza HTML del lado del servidor) | Las respuestas son páginas HTML completas, no JSON |
| Base de datos | H2 en memoria, con datos de ejemplo precargados | Los IDs y nombres usados en las pruebas son reales y reproducibles |
| Seguridad | No tiene Spring Security habilitado | No se necesitan tokens ni login para las pruebas (simplifica el `.jmx`) |
| Puerto por defecto | 8080 | Se usó como valor por defecto configurable |

### Endpoints usados en las pruebas

| Requisito | Método | Ruta | Qué hace |
|---|---|---|---|
| RQ-01 | GET | `/owners?lastName=Davis` | Busca dueños cuyo apellido empieza por el valor indicado |
| RQ-06 | GET | `/owners/{ownerId}/pets/{petId}/visits/new` | Carga el formulario para registrar una visita |
| RQ-06 | POST | `/owners/{ownerId}/pets/{petId}/visits/new` | Envía el formulario y guarda la visita |

### Datos de prueba elegidos y por qué

Se revisaron los datos de ejemplo que trae la aplicación por defecto y se eligieron valores que garantizan un resultado predecible:

- **Apellido "Davis"**: existen dos dueños con ese apellido (Betty Davis y Harold Davis), por lo que la búsqueda no redirige directo a un solo resultado, sino que pasa por la pantalla de listado. Esto ejercita más lógica del sistema (paginación) y es un caso más representativo de uso real.
- **Dueño "Jean Coleman" (ID 6) y su mascota "Samantha" (ID 7)**: es una combinación existente en los datos de ejemplo, necesaria para que el registro de visita no falle por "mascota no encontrada".
- **Fecha de visita futura (15/08/2026)**: el sistema tiene una regla de validación que rechaza fechas que no sean posteriores al día actual, así que se usó una fecha futura fija para asegurar que la visita se registre correctamente durante toda la prueba.

## 3. Estructura del archivo `.jmx`

El plan de pruebas se organizó en JMeter de la siguiente manera:

```
Plan de Pruebas
│
├── Variables del entorno          → valores editables (host, puerto, IDs, etc.)
├── HTTP Request Defaults          → configuración común (host y puerto) para no repetirla en cada petición
├── HTTP Cookie Manager            → mantiene la sesión del navegador simulado
│
├── Grupo de Hilos: RQ-01
│   └── GET /owners?lastName=...   → con verificaciones de éxito
│
├── Grupo de Hilos: RQ-06
│   └── POST .../visits/new        → registra la visita directamente
│
└── Reportes (Summary Report, View Results Tree)
```

### 3.1 Variables del entorno

En vez de escribir valores fijos dentro de cada petición, se definieron variables reutilizables al inicio del plan. Esto permite que, al probar la versión modernizada, solo se cambien 2 valores (`HOST` y `PORT`) sin tocar nada más:

| Variable | Valor por defecto | Para qué sirve |
|---|---|---|
| `HOST` | `localhost` | Dirección del servidor a probar |
| `PORT` | `8080` | Puerto del servidor |
| `LAST_NAME` | `Davis` | Apellido usado en la búsqueda (RQ-01) |
| `OWNER_ID` | `6` | Dueño usado para registrar la visita (RQ-06) |
| `PET_ID` | `7` | Mascota usada para registrar la visita (RQ-06) |
| `VISIT_DATE` | `2026-08-15` | Fecha de la visita a registrar |
| `RQ01_USERS` / `RQ01_RAMPUP` / `RQ01_DURATION` | `50` / `60` / `180` | Usuarios, tiempo de arranque y duración de la prueba de búsqueda |
| `RQ06_USERS` / `RQ06_RAMPUP` / `RQ06_DURATION` | `20` / `60` / `180` | Usuarios, tiempo de arranque y duración de la prueba de registro de visita |

### 3.2 Grupos de hilos (Thread Groups) y el enfoque de ramp-up

Cada requisito (RQ-01 y RQ-06) tiene su **propio grupo de hilos independiente**, para poder medir cada flujo por separado y no mezclar sus resultados.

Se configuraron con:

- **Número de usuarios**: cuántos usuarios simulados participan en total.
- **Ramp-up (tiempo de arranque)**: en cuánto tiempo se van agregando esos usuarios, uno a uno, hasta llegar al total. Por ejemplo, 50 usuarios con un ramp-up de 60 segundos significa que JMeter no lanza los 50 de golpe, sino que va sumando usuarios progresivamente durante ese minuto.
- **Duración (scheduler)**: por cuánto tiempo se mantiene la prueba corriendo una vez que todos los usuarios ya están activos.

Este diseño gradual (en lugar de lanzar toda la carga de una sola vez) es justamente lo que permite observar **cómo se comporta el sistema a medida que aumenta la cantidad de usuarios concurrentes**, en vez de solo ver un único número de rendimiento bajo una carga fija.

Los valores de usuarios/tiempos vienen preconfigurados como referencia inicial y se pueden ajustar directamente en las "Variables del entorno" según la capacidad de la máquina donde se ejecute la prueba.

### 3.3 Peticiones (Samplers) y verificaciones

Cada petición HTTP tiene asociadas una o más **verificaciones automáticas (aserciones)** que confirman que la respuesta fue exitosa, no solo que el servidor respondió algo:

- **RQ-01**: se verifica que el código de respuesta sea 200 (éxito) y que el contenido de la página realmente incluya el apellido buscado.
- **RQ-06**: se verifica que el código de respuesta sea 200 y que la página final contenga el mensaje de confirmación que la propia aplicación muestra cuando una visita se registra correctamente.

> **Nota sobre RQ-06:** el flujo se implementó con un único `POST` directo al endpoint de registro de visita, sin cargar antes el formulario con un `GET`. Esto es posible porque Spring PetClinic no tiene Spring Security habilitado y, por lo tanto, no depende de un token CSRF ni de ningún otro dato que solo se genere al abrir el formulario. Se optó por esta versión "aislada" porque el objetivo de la prueba es medir específicamente el rendimiento del registro de la visita, sin mezclar esa métrica con el tiempo de otra petición.

Estas verificaciones son importantes porque, en una prueba de carga, es posible que el servidor responda "algo" pero con un error interno; sin esta validación, esas fallas podrían pasar desapercibidas en los resultados.

### 3.4 Reportes

Se incluyeron dos formas de ver los resultados:

- **Summary Report**: da un resumen numérico (tiempos de respuesta promedio, mínimo, máximo, porcentaje de errores, rendimiento). Además, guarda automáticamente los resultados en un archivo (`resultados_legado.jtl`) para poder analizarlos después o compararlos con la corrida del sistema modernizado.
- **View Results Tree**: muestra el detalle petición por petición. Viene desactivado por defecto porque consume muchos recursos y ralentiza la prueba; solo se recomienda activarlo para revisar un problema puntual, no para la corrida de carga completa.

## 4. Igualdad de condiciones: PC local vs. instancia t3.medium de AWS

Este es un punto metodológico importante que hay que resolver **antes** de correr las pruebas, porque afecta directamente la validez de la comparación.

### El problema

Una PC con una GPU RTX 5080, 64 GB de RAM y un procesador AMD Ryzen 9 9950X3D tiene muchísima más capacidad que una instancia `t3.medium` de AWS (2 CPUs y 4 GB de RAM). Si el legado se corre en la PC local y el modernizado se corre en AWS con esas especificaciones tan distintas, **cualquier diferencia de rendimiento que se observe podría deberse simplemente al hardware, no a la modernización en sí**. Eso invalidaría la comparación.

### La solución: limitar los recursos de la PC local con Docker

La forma más práctica y confiable de igualar las condiciones es correr la aplicación legado (y si se puede, también la app y el motor de base de datos) dentro de un **contenedor Docker con límites de CPU y memoria** que imiten a una `t3.medium`.

Una instancia `t3.medium` tiene 2 vCPU y 4 GB de RAM, así que el contenedor debe restringirse a esos mismos valores.

**Pasos generales:**

1. **Empaquetar la aplicación en una imagen Docker** (si el proyecto no trae ya un `Dockerfile`, se puede generar uno simple para una app Spring Boot).
2. **Correr el contenedor con límites explícitos de recursos**, por ejemplo:
   - Límite de memoria: 4 GB
   - Límite de CPU: 2 núcleos
3. **Correr JMeter desde fuera del contenedor** (en la misma PC, pero sin limitar sus propios recursos), apuntando al puerto que expone el contenedor. Así JMeter sigue teniendo la potencia necesaria para generar la carga, y solo la aplicación bajo prueba queda restringida — que es lo que se quiere comparar.
4. Verificar, antes de la corrida real, que la aplicación efectivamente respeta esos límites (por ejemplo, revisando el uso de CPU/memoria del contenedor mientras corre una prueba corta).

Con esto, tanto el legado (en la PC, dentro del contenedor limitado) como el modernizado (en la instancia `t3.medium` real de AWS) estarían compitiendo bajo la misma cantidad de CPU y memoria disponible, y la diferencia de resultados sí podría atribuirse a la arquitectura y no al hardware.

### Algo a tener en cuenta

Esta técnica iguala **CPU y RAM**, pero no puede igualar completamente otros factores como la latencia de red (en AWS hay red real; en local todo es prácticamente instantáneo) o el tipo de disco. Para el propósito de este proyecto (comparar la eficiencia de la lógica de negocio y la arquitectura del backend), limitar CPU y RAM es suficiente y es la práctica estándar en este tipo de comparaciones. Si se quisiera ser aún más riguroso, la alternativa sería correr también el legado en una instancia `t3.medium` real en AWS, pero eso implica un costo y tiempo de aprovisionamiento adicional.

## 5. Prueba de estrés de frontend con Playwright

Como se explicó en la conversación, JMeter mide backend (peticiones HTTP puras), pero **no abre un navegador real ni ejecuta JavaScript**. Para observar si la interfaz sigue respondiendo bien mientras el servidor está bajo presión, se construyó un script complementario con **Playwright**, que sí controla un navegador Chromium de verdad.

### 5.1 ¿Qué hace el script, paso a paso?

El script (`playwright_stress_test.js`) simula varios "usuarios virtuales" navegando al mismo tiempo, y cada uno repite este flujo una y otra vez hasta que se acaba el tiempo de la prueba:

1. **Entra a la página principal** de PetClinic.
2. **Va al formulario de búsqueda de dueños** (`/owners/find`).
3. **Escribe un apellido** (por defecto "Davis", el mismo que se usó en el `.jmx`, para que los resultados sean comparables) **y hace clic en "Find Owner"**.
4. **Hace clic en el primer dueño** de la lista de resultados, para entrar a su ficha de detalle.
5. **Hace clic en "Add Visit"** de la primera mascota que aparece.
6. **Llena el formulario de visita** (fecha futura y una descripción) **y lo envía**, verificando que aparezca el mensaje de confirmación "Your visit has been booked".

Cada uno de estos 6 pasos se cronometra por separado (no solo el flujo completo), para poder identificar más adelante **en qué parte específica de la navegación** se empieza a sentir la lentitud si el servidor está saturado — por ejemplo, podría pasar que la búsqueda siga siendo rápida pero el envío del formulario de visita se vuelva lento, o viceversa.

### 5.2 ¿Cómo simula "usuarios concurrentes"?

A diferencia de JMeter (que genera peticiones HTTP livianas y puede simular miles de "usuarios" fácilmente), cada usuario de Playwright es un **navegador real**, que consume CPU y memoria de verdad. Por eso el script:

- Abre **un solo proceso de Chromium**, pero dentro de él crea un **contexto independiente por cada usuario** (como si cada uno tuviera su propia ventana/perfil, con sus propias cookies, pero compartiendo el proceso base para no gastar tantos recursos).
- Lanza a los usuarios de forma **gradual (ramp-up)**, igual que en JMeter: si configuras 10 usuarios con un ramp-up de 30 segundos, el script no abre los 10 de golpe, sino que va agregando uno nuevo cada 3 segundos aproximadamente.
- Cada usuario repite su flujo completo **en bucle** mientras dure la prueba (por defecto 120 segundos), no una sola vez.

### 5.3 Configuración del script

Todo se controla desde un bloque `CONFIG` al inicio del archivo, o sobreescribiendo esos mismos valores con variables de entorno al momento de correrlo (ver sección 6.1 más abajo):

| Variable | Valor por defecto | Qué controla |
|---|---|---|
| `BASE_URL` | `http://localhost:8080` | A qué servidor apunta el navegador |
| `USERS` | `10` | Cuántos usuarios (navegadores) simulados en paralelo |
| `RAMP_UP_SECONDS` | `30` | En cuántos segundos se van "encendiendo" todos los usuarios |
| `DURATION_SECONDS` | `120` | Cuánto dura la prueba en total |
| `LAST_NAME` | `Davis` | Apellido que se busca en cada iteración |
| `HEADLESS` | `true` | Si es `false`, se ven las ventanas del navegador abriéndose (útil solo para depurar, no para la corrida real, porque consume más recursos) |
| `OUTPUT_CSV` | `resultados_frontend_legado.csv` | Archivo donde se guardan los resultados detallados |

Se usaron valores de `USERS` mucho más bajos que en JMeter (10 en vez de 50) a propósito: cada navegador real es mucho más pesado que una petición HTTP simulada, así que no es realista ni necesario simular la misma cantidad de "usuarios" que en la prueba de backend.

### 5.4 Qué genera al terminar

- Un archivo **CSV** (`resultados_frontend_legado.csv`) con el detalle de cada paso de cada iteración de cada usuario: marca de tiempo, usuario, número de iteración, paso, duración en milisegundos, si fue exitoso y el error (si lo hubo).
- Un **resumen en la consola** al finalizar, con el promedio de tiempo y la cantidad de errores por cada uno de los 6 pasos, para tener una primera lectura rápida sin necesidad de abrir el CSV.

## 6. Cómo correr JMeter y Playwright en paralelo

### 6.1 Instalar lo necesario (una sola vez)

1. Asegúrate de tener **Node.js** instalado (versión 18 o superior).
2. En una carpeta de trabajo, coloca los archivos `playwright_stress_test.js` y `package.json`.
3. Instala las dependencias y los navegadores que usa Playwright:
   ```bash
   npm install
   npx playwright install chromium
   ```
   Esto descarga una copia de Chromium controlada por el script (no usa tu navegador normal).

### 6.2 Levantar la aplicación

Si estás probando el legado dentro del contenedor Docker con recursos limitados (como se explicó en la sección de igualdad de condiciones), simplemente asegúrate de que el contenedor esté corriendo:
```bash
docker ps
```
Debe aparecer `petclinic-t3medium` con estado "Up". Si no está corriendo, vuelve a los pasos de la sección de Docker.

### 6.3 Correr las dos pruebas al mismo tiempo

La idea es que, mientras JMeter satura el backend, Playwright esté navegando la interfaz en paralelo, para ver si la experiencia de usuario se degrada. El orden recomendado es:

**Paso 1 — Abre dos terminales** (una para cada herramienta).

**Paso 2 — En la primera terminal, deja listo (pero no lo arranques todavía) el comando de JMeter en modo *no-GUI*.** Para esta corrida se usó el modo consola (`-n`) en vez de la interfaz gráfica, ya que es más liviano (no compite por recursos con Chromium) y más fácil de lanzar en background junto con Playwright:
```bash
jmeter.bat -n -t petclinic_load_test_2.jmx -l resultados_legado_paralelo.jtl -j jmeter_paralelo.log
```
- Verifica antes que las variables (`HOST`, `PORT`, etc.) definidas dentro del `.jmx` sean correctas para el entorno que vas a probar.

**Paso 3 — En la segunda terminal, ubícate en la carpeta del script de Playwright** y ten listo (pero tampoco lo arranques aún) el comando:
```bash
USERS=10 RAMP_UP_SECONDS=60 DURATION_SECONDS=180 OUTPUT_CSV=resultados_frontend_legado_paralelo.csv node playwright_stress_test.js
```
`RAMP_UP_SECONDS` y `DURATION_SECONDS` se ajustaron a **60s y 180s** (en vez de los valores por defecto del script, 30s/120s) para que coincidan exactamente con `RQ01_RAMPUP`/`RQ06_RAMPUP` (60s) y `RQ01_DURATION`/`RQ06_DURATION` (180s) del `.jmx`. Así ambas herramientas suben usuarios al mismo ritmo y corren durante la misma ventana de tiempo total, lo cual es necesario para poder cruzar los resultados de un mismo instante entre backend y frontend.

**Paso 4 — Arranca ambas pruebas casi al mismo tiempo:**
1. Ejecuta el comando de JMeter en la primera terminal.
2. Inmediatamente después, ejecuta el comando de Playwright en la segunda terminal.

No es necesario que arranquen exactamente en el mismo milisegundo — con que empiecen dentro de la misma ventana de unos pocos segundos es suficiente para que ambas cargas coincidan durante la mayor parte de la prueba.

**Paso 5 — Espera a que ambas terminen.** JMeter mostrará su resumen en el "Summary Report" dentro de la interfaz gráfica. Playwright mostrará su resumen directamente en la terminal, y además dejará el archivo `resultados_frontend_legado.csv` en la misma carpeta.


## 7. Cómo se ejecutará la comparación legado vs. modernizado

El mismo archivo `.jmx` se reutilizará sin cambios estructurales para probar la versión modernizada. Los únicos ajustes necesarios serán:

1. Cambiar las variables `HOST` y `PORT` para apuntar al nuevo sistema.
2. Cambiar el nombre del archivo de resultados (por ejemplo, a `resultados_modernizado.jtl`) para no sobrescribir los resultados del legado.

Al mantener exactamente los mismos escenarios, usuarios, tiempos de ramp-up y verificaciones, la comparación entre ambas versiones será justa y directamente atribuible a los cambios de arquitectura, no a diferencias en cómo se probó cada una.
