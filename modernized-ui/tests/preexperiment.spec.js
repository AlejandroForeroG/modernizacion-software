import { expect, test } from '@playwright/test'

const evidence = 'test-results'

test.describe.configure({ mode: 'serial' })

test('RQ-01 searches owners and resolves a unique match to detail', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/')

  await expect(page.getByRole('heading', { name: 'A quién atendemos hoy?' })).toBeVisible()
  await expect(page.getByText('Betty Davis')).toBeVisible()
  await expect(page.getByText('Harold Davis')).toBeVisible()

  await page.getByLabel('Apellido').fill('Franklin')
  await page.getByRole('button', { name: 'Buscar' }).click()

  await expect(page.getByRole('heading', { name: 'George Franklin' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Leo' })).toBeVisible()
  await page.screenshot({ path: `${evidence}/rq01-owner-search.png`, fullPage: true })
})

test('RQ-06 registers a future visit and refreshes the history', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/')
  await page.getByLabel('Apellido').fill('Franklin')
  await page.getByRole('button', { name: 'Buscar' }).click()
  await expect(page.getByRole('heading', { name: 'George Franklin' })).toBeVisible()

  await page.getByRole('button', { name: 'Nueva visita' }).click()
  await page.getByLabel('Descripción').fill('Control pre-experimento UI')
  await page.getByRole('button', { name: 'Registrar' }).click()

  await expect(page.getByText('Visita registrada y agregada al historial.')).toBeVisible()
  await expect(page.getByText('Control pre-experimento UI').first()).toBeVisible()
  await page.screenshot({ path: `${evidence}/rq06-visit-created.png`, fullPage: true })
})

test('the operational UI remains coherent on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')
  await page.getByLabel('Apellido').fill('Davis')
  await page.getByRole('button', { name: 'Buscar' }).click()
  await expect(page.getByText('Betty Davis')).toBeVisible()
  const bodyOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1)
  expect(bodyOverflow).toBe(false)
  await page.screenshot({ path: `${evidence}/react-mobile.png`, fullPage: true })
})

test('all Week 7 presentation slides fit the desktop viewport', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/slides/semana-7')
  await expect(page.getByText(/Spring PetClinic/)).toBeVisible()

  for (let index = 0; index < 14; index += 1) {
    const dimensions = await page.locator('.slide-frame').evaluate((element) => ({
      clientHeight: element.clientHeight,
      scrollHeight: element.scrollHeight,
      clientWidth: element.clientWidth,
      scrollWidth: element.scrollWidth,
    }))
    expect(dimensions.scrollHeight, `vertical overflow on Week 7 slide ${index + 1}`).toBeLessThanOrEqual(dimensions.clientHeight + 1)
    expect(dimensions.scrollWidth, `horizontal overflow on Week 7 slide ${index + 1}`).toBeLessThanOrEqual(dimensions.clientWidth + 1)

    if (index === 3) await page.screenshot({ path: `${evidence}/semana7-codescene.png`, fullPage: true })
    if (index === 6) await page.screenshot({ path: `${evidence}/semana7-to-be.png`, fullPage: true })
    if (index === 8) await page.screenshot({ path: `${evidence}/semana7-preexperiment.png`, fullPage: true })
    if (index === 11) await page.screenshot({ path: `${evidence}/semana7-code-examples.png`, fullPage: true })
    if (index < 13) await page.keyboard.press('ArrowRight')
  }
})

test('Week 7 presentation navigation works on mobile without page overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/slides')
  await expect(page.getByText(/Spring PetClinic/)).toBeVisible()

  for (let index = 0; index < 14; index += 1) {
    const bodyOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1)
    expect(bodyOverflow, `page overflow on mobile Week 7 slide ${index + 1}`).toBe(false)
    if (index === 1) {
      await expect(page.getByText('La restricción es arquitectónica')).toBeVisible()
      await page.screenshot({ path: `${evidence}/semana7-mobile.png`, fullPage: true })
    }
    if (index < 13) await page.keyboard.press('ArrowRight')
  }
})

test('the comprehensive Week 8 working deck remains available', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/slides/semana-8')
  await expect(page.getByText('Spring PetClinic', { exact: true })).toBeVisible()
  await expect(page.locator('.deck-controls')).toContainText('1 / 19')
})
