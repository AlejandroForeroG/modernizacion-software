/**
 * Prueba de estres de FRONTEND para Spring PetClinic (legado).
 *
 * Simula usuarios reales usando un navegador (Chromium) que:
 *   1. Entran a la pagina principal
 *   2. Van al formulario de busqueda de duenos
 *   3. Buscan por apellido (RQ-01, pero navegando como un usuario real)
 *   4. Entran al detalle de uno de los duenos encontrados
 *   5. Registran una visita para una de sus mascotas (RQ-06, vía la interfaz)
 *
 * Pensado para correrse EN PARALELO con la prueba de carga de JMeter
 * (que ataca el backend directamente), para observar si la interfaz
 * sigue respondiendo bien mientras el servidor esta bajo presion.
 *
 * Uso:
 *   node playwright_stress_test.js
 *
 * Configuracion: ver el bloque CONFIG mas abajo, o sobreescribir por
 * variables de entorno (ver README dentro del propio bloque CONFIG).
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// ───────────────────────────── CONFIG ─────────────────────────────
const CONFIG = {
  // URL base de la aplicacion bajo prueba
  baseUrl: process.env.BASE_URL || 'http://localhost:8080',

  // Cuantos usuarios (navegadores) simulados en paralelo
  users: parseInt(process.env.USERS || '10', 10),

  // En cuantos segundos se van "encendiendo" todos los usuarios
  // (arranque gradual, igual que el ramp-up de JMeter)
  rampUpSeconds: parseInt(process.env.RAMP_UP_SECONDS || '30', 10),

  // Cuanto tiempo total (en segundos) debe durar la prueba
  durationSeconds: parseInt(process.env.DURATION_SECONDS || '120', 10),

  // Apellido a buscar (igual que en el .jmx, para que los resultados sean comparables)
  lastName: process.env.LAST_NAME || 'Davis',

  // true = no se ve el navegador (mas liviano, recomendado para la corrida real)
  // false = se ven las ventanas de Chromium abriendose (util para depurar)
  headless: (process.env.HEADLESS || 'true') === 'true',

  // Archivo donde se guardan los resultados detallados
  outputCsv: process.env.OUTPUT_CSV || path.join(__dirname, 'resultados_frontend_legado.csv'),
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
    // Paso 1: pagina principal
    let start = Date.now();
    await page.goto(CONFIG.baseUrl + '/', { waitUntil: 'networkidle' });
    logRow({ usuario, iteracion, paso: '1_home', duracionMs: Date.now() - start, exito: true });

    // Paso 2: ir al formulario de busqueda
    start = Date.now();
    await page.goto(CONFIG.baseUrl + '/owners/find', { waitUntil: 'networkidle' });
    logRow({ usuario, iteracion, paso: '2_form_busqueda', duracionMs: Date.now() - start, exito: true });

    // Paso 3: llenar el apellido y buscar
    start = Date.now();
    await page.fill('#lastName', CONFIG.lastName);
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle' }),
      page.click('button:has-text("Find Owner")'),
    ]);
    logRow({ usuario, iteracion, paso: '3_buscar_apellido', duracionMs: Date.now() - start, exito: true });

    // Paso 4: entrar al primer dueno de la lista de resultados
    start = Date.now();
    const primerDueno = page.locator('table.table tbody tr td a').first();
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle' }),
      primerDueno.click(),
    ]);
    logRow({ usuario, iteracion, paso: '4_ver_detalle_dueno', duracionMs: Date.now() - start, exito: true });

    // Paso 5: ir al formulario de registrar visita para la primera mascota
    start = Date.now();
    const linkAddVisit = page.locator('a:has-text("Add Visit")').first();
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle' }),
      linkAddVisit.click(),
    ]);
    logRow({ usuario, iteracion, paso: '5_abrir_form_visita', duracionMs: Date.now() - start, exito: true });

    // Paso 6: llenar y enviar el formulario de visita
    start = Date.now();
    const fechaFutura = '2026-08-15';
    await page.fill('#date', fechaFutura);
    await page.fill('#description', 'Chequeo de rutina - prueba de estres frontend');
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle' }),
      page.click('button:has-text("Add Visit")'),
    ]);

    const confirmado = await page.locator('text=Your visit has been booked').count();
    logRow({
      usuario,
      iteracion,
      paso: '6_registrar_visita',
      duracionMs: Date.now() - start,
      exito: confirmado > 0,
      error: confirmado > 0 ? '' : 'No se encontro mensaje de confirmacion',
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
  console.log('=== Prueba de estres de frontend - Spring PetClinic ===');
  console.log(`URL base:        ${CONFIG.baseUrl}`);
  console.log(`Usuarios:        ${CONFIG.users}`);
  console.log(`Ramp-up:         ${CONFIG.rampUpSeconds}s`);
  console.log(`Duracion total:  ${CONFIG.durationSeconds}s`);
  console.log(`Modo headless:   ${CONFIG.headless}`);
  console.log('---------------------------------------------------------');

  const browser = await chromium.launch({ headless: CONFIG.headless });

  const inicioPrueba = Date.now();
  const tiempoFin = inicioPrueba + CONFIG.durationSeconds * 1000;

  // Arranque gradual: cada usuario nuevo se lanza espaciado en el tiempo,
  // hasta completar todos dentro de rampUpSeconds (igual logica que el
  // ramp-up de JMeter).
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

/**
 * Calcula y muestra en consola un resumen rapido: cuantos pasos
 * fallaron y el tiempo promedio de cada paso, para tener una
 * primera lectura sin necesidad de abrir el CSV.
 */
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
