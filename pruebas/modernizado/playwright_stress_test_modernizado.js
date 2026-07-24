/**
 * Prueba de estres de FRONTEND para el PetClinic MODERNIZADO (React + API REST).
 *
 * Simula usuarios reales usando un navegador (Chromium) que:
 *   1. Entran a la SPA (bucket S3 estatico)
 *   2. Buscan por apellido (RQ-01, vía GET /api/owners)
 *   3. Entran al detalle del primer dueño encontrado (GET /api/owners/{id})
 *   4. Abren el formulario de "Nueva visita" para su primera mascota
 *   5. Llenan y envian el formulario de visita (RQ-06, vía POST /api/owners/{id}/pets/{id}/visits)
 *
 * A diferencia del script equivalente para el legado (Thymeleaf, con
 * navegacion de pagina completa), esta es una SPA: no hay recargas de
 * pagina despues de la carga inicial, asi que los pasos se sincronizan
 * esperando las respuestas de red de la API (waitForResponse) en vez de
 * waitForNavigation.
 *
 * Pensado para correrse EN PARALELO con la prueba de carga de JMeter
 * (que ataca /api/** directamente), para observar si la interfaz sigue
 * respondiendo bien mientras el backend esta bajo presion.
 *
 * Uso:
 *   node playwright_stress_test_modernizado.js
 *
 * Configuracion: ver el bloque CONFIG mas abajo, o sobreescribir por
 * variables de entorno.
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// ───────────────────────────── CONFIG ─────────────────────────────
const CONFIG = {
  // URL base de la SPA (bucket S3 estatico del frontend modernizado)
  baseUrl: process.env.BASE_URL || 'http://petclinic-frontend-696021927549.s3-website-us-east-1.amazonaws.com',

  // Cuantos usuarios (navegadores) simulados en paralelo
  users: parseInt(process.env.USERS || '10', 10),

  // En cuantos segundos se van "encendiendo" todos los usuarios
  rampUpSeconds: parseInt(process.env.RAMP_UP_SECONDS || '60', 10),

  // Cuanto tiempo total (en segundos) debe durar la prueba
  durationSeconds: parseInt(process.env.DURATION_SECONDS || '180', 10),

  // Apellido a buscar (igual que en el .jmx, para que los resultados sean comparables)
  lastName: process.env.LAST_NAME || 'Davis',

  // true = no se ve el navegador (mas liviano, recomendado para la corrida real)
  headless: (process.env.HEADLESS || 'true') === 'true',

  // Archivo donde se guardan los resultados detallados
  outputCsv: process.env.OUTPUT_CSV || path.join(__dirname, 'resultados_frontend_modernizado.csv'),
};
// ────────────────────────────────────────────────────────────────

const csvRows = [];
csvRows.push('timestamp,usuario,iteracion,paso,duracion_ms,exito,error');

function logRow({ usuario, iteracion, paso, duracionMs, exito, error }) {
  const row = [
    new Date().toISOString(),
    usuario,
    iteracion,
    paso,
    duracionMs,
    exito,
    error ? String(error).replace(/[\n,]/g, ' ') : '',
  ].join(',');
  csvRows.push(row);
}

/**
 * Ejecuta un flujo completo de usuario: buscar dueno por apellido,
 * entrar al detalle y registrar una visita para su primera mascota.
 */
async function runUserFlow(context, usuario, iteracion) {
  const page = await context.newPage();

  try {
    // Paso 1: cargar la SPA
    let start = Date.now();
    await page.goto(CONFIG.baseUrl + '/', { waitUntil: 'networkidle' });
    logRow({ usuario, iteracion, paso: '1_home', duracionMs: Date.now() - start, exito: true });

    // Paso 2: llenar el apellido y buscar (espera la respuesta de GET /api/owners)
    start = Date.now();
    const apellidoInput = page.getByLabel('Apellido');
    await apellidoInput.fill('');
    await apellidoInput.fill(CONFIG.lastName);
    await Promise.all([
      page.waitForResponse((res) => res.url().includes('/api/owners?') && res.request().method() === 'GET'),
      page.getByRole('button', { name: 'Buscar' }).click(),
    ]);
    logRow({ usuario, iteracion, paso: '2_buscar_apellido', duracionMs: Date.now() - start, exito: true });

    // Paso 3: entrar al primer dueno de la lista de resultados (espera GET /api/owners/{id})
    start = Date.now();
    const primerDueno = page.getByRole('button', { name: new RegExp(CONFIG.lastName) }).first();
    await Promise.all([
      page.waitForResponse((res) => /\/api\/owners\/\d+$/.test(res.url()) && res.request().method() === 'GET'),
      primerDueno.click(),
    ]);
    logRow({ usuario, iteracion, paso: '3_ver_detalle_dueno', duracionMs: Date.now() - start, exito: true });

    // Paso 4: abrir el formulario de "Nueva visita" para la primera mascota
    start = Date.now();
    const botonNuevaVisita = page.getByRole('button', { name: 'Nueva visita' }).first();
    await botonNuevaVisita.click();
    await page.getByLabel('Descripción').waitFor({ state: 'visible' });
    logRow({ usuario, iteracion, paso: '4_abrir_form_visita', duracionMs: Date.now() - start, exito: true });

    // Paso 5: llenar y enviar el formulario de visita (espera POST /api/owners/{id}/pets/{id}/visits)
    start = Date.now();
    const descripcion = `Chequeo de rutina - prueba de estres frontend (${usuario} #${iteracion})`;
    await page.getByLabel('Descripción').fill(descripcion);
    const [postResponse] = await Promise.all([
      page.waitForResponse((res) => /\/api\/owners\/\d+\/pets\/\d+\/visits$/.test(res.url()) && res.request().method() === 'POST'),
      page.getByRole('button', { name: 'Registrar' }).click(),
    ]);

    const exito = postResponse.status() === 201;
    let confirmado = false;
    if (exito) {
      confirmado = await page.getByText(descripcion).first()
        .waitFor({ state: 'visible', timeout: 5000 })
        .then(() => true)
        .catch(() => false);
    }

    logRow({
      usuario,
      iteracion,
      paso: '5_registrar_visita',
      duracionMs: Date.now() - start,
      exito: exito && confirmado,
      error: exito ? (confirmado ? '' : 'POST 201 pero la visita no aparecio en el historial') : `POST devolvio status ${postResponse.status()}`,
    });
  } catch (err) {
    logRow({ usuario, iteracion, paso: 'error_flujo', duracionMs: 0, exito: false, error: err.message });
  } finally {
    await page.close();
  }
}

/**
 * Un "usuario virtual": repite el flujo completo en bucle hasta que
 * se acabe el tiempo total de la prueba (tiempoFin).
 */
async function virtualUser(browser, usuarioId, tiempoFin) {
  const context = await browser.newContext();
  let iteracion = 0;

  while (Date.now() < tiempoFin) {
    iteracion += 1;
    await runUserFlow(context, usuarioId, iteracion);
  }

  await context.close();
}

async function main() {
  console.log('=== Prueba de estres de frontend - PetClinic Modernizado (React) ===');
  console.log(`URL base:        ${CONFIG.baseUrl}`);
  console.log(`Usuarios:        ${CONFIG.users}`);
  console.log(`Ramp-up:         ${CONFIG.rampUpSeconds}s`);
  console.log(`Duracion total:  ${CONFIG.durationSeconds}s`);
  console.log(`Modo headless:   ${CONFIG.headless}`);
  console.log('---------------------------------------------------------');

  const browser = await chromium.launch({ headless: CONFIG.headless });

  const inicioPrueba = Date.now();
  const tiempoFin = inicioPrueba + CONFIG.durationSeconds * 1000;

  const delayEntreUsuariosMs = (CONFIG.rampUpSeconds * 1000) / Math.max(CONFIG.users, 1);

  const promesasUsuarios = [];
  for (let i = 1; i <= CONFIG.users; i += 1) {
    const delay = (i - 1) * delayEntreUsuariosMs;
    const promesa = new Promise((resolve) => {
      setTimeout(async () => {
        await virtualUser(browser, `usuario_${i}`, tiempoFin);
        resolve();
      }, delay);
    });
    promesasUsuarios.push(promesa);
  }

  await Promise.all(promesasUsuarios);
  await browser.close();

  fs.writeFileSync(CONFIG.outputCsv, csvRows.join('\n'), 'utf-8');
  console.log('---------------------------------------------------------');
  console.log(`Prueba finalizada. Resultados guardados en: ${CONFIG.outputCsv}`);

  imprimirResumen();
}

function imprimirResumen() {
  const datos = csvRows.slice(1).map((linea) => {
    const [timestamp, usuario, iteracion, paso, duracionMs, exito, error] = linea.split(',');
    return { paso, duracionMs: Number(duracionMs), exito: exito === 'true' };
  });

  const pasos = [...new Set(datos.map((d) => d.paso))];
  console.log('\nResumen por paso:');
  console.log('paso'.padEnd(24), 'ejecuciones'.padEnd(12), 'promedio_ms'.padEnd(12), 'errores');

  pasos.forEach((paso) => {
    const delPaso = datos.filter((d) => d.paso === paso);
    const promedio = Math.round(delPaso.reduce((acc, d) => acc + d.duracionMs, 0) / delPaso.length);
    const errores = delPaso.filter((d) => !d.exito).length;
    console.log(
      paso.padEnd(24),
      String(delPaso.length).padEnd(12),
      String(promedio).padEnd(12),
      errores,
    );
  });
}

main().catch((err) => {
  console.error('Error fatal en la prueba:', err);
  process.exit(1);
});
