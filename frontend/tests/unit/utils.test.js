// tests/unit/utils.test.js
// 5.1 - Tests unitaris: funcions de transformació de dades i càlcul de temps

import { describe, it, expect } from 'vitest'

// --- Funcions pures que testem (extretes de la lògica del frontend) ---

/**
 * Transformació de dades rebudes del servidor (API /api/events)
 * Formata la data d'un esdeveniment per mostrar-la a la UI
 */
function formatEventDate(isoString) {
  if (!isoString) return 'Data desconeguda'
  const date = new Date(isoString)
  if (isNaN(date.getTime())) return 'Data no vàlida'
  return date.toLocaleDateString('ca-ES', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  })
}

/**
 * Transformació: calcula el percentatge d'ocupació d'un event
 */
function calcularOcupacio(venuts, aforament) {
  if (!aforament || aforament <= 0) return 0
  return Math.round((venuts / aforament) * 100)
}

/**
 * Càlcul del temps restant de reserva (en segons)
 * La reserva caduca en N minuts des de la creació
 */
function calcularTempsRestant(dataExpiracio) {
  const ara = new Date()
  const expiracio = new Date(dataExpiracio)
  const diffMs = expiracio - ara
  if (diffMs <= 0) return 0
  return Math.floor(diffMs / 1000)
}

/**
 * Gestió d'estat: filtra seients per estat
 */
function filtrarSeientPerEstat(seients, estat) {
  return seients.filter(s => s.estat === estat)
}

/**
 * Gestió d'estat: comprova si un seient és seleccionable
 */
function esSeleccionable(seient) {
  return seient.estat === 'Lliure'
}

// ============================================================
// TESTS 5.1 — TRANSFORMACIÓ DE DADES
// ============================================================

describe('formatEventDate - Transformació de dates del servidor', () => {
  it('formata correctament una data ISO vàlida', () => {
    const resultat = formatEventDate('2026-10-15T21:00:00.000Z')
    expect(resultat).toContain('2026')
    expect(resultat).toContain('15')
  })

  it('retorna text per defecte si la data és null', () => {
    expect(formatEventDate(null)).toBe('Data desconeguda')
  })

  it('retorna text de data no vàlida si el format és incorrect', () => {
    expect(formatEventDate('not-a-date')).toBe('Data no vàlida')
  })

  it('retorna text per defecte si la data és undefined', () => {
    expect(formatEventDate(undefined)).toBe('Data desconeguda')
  })
})

describe('calcularOcupacio - Transformació de dades del servidor', () => {
  it('calcula el percentatge correctament', () => {
    expect(calcularOcupacio(70, 280)).toBe(25)
  })

  it('retorna 0 si no hi ha venuts', () => {
    expect(calcularOcupacio(0, 280)).toBe(0)
  })

  it('retorna 100 si la sala és plena', () => {
    expect(calcularOcupacio(280, 280)).toBe(100)
  })

  it('retorna 0 si l\'aforament és 0 (evita divisió per zero)', () => {
    expect(calcularOcupacio(10, 0)).toBe(0)
  })
})

// ============================================================
// TESTS 5.1 — CÀLCUL DE TEMPS RESTANT DE RESERVA
// ============================================================

describe('calcularTempsRestant - Temps de reserva', () => {
  it('retorna 0 si la reserva ja ha expirat', () => {
    const passado = new Date(Date.now() - 60000).toISOString() // fa 1 minut
    expect(calcularTempsRestant(passado)).toBe(0)
  })

  it('retorna un valor positiu per a una reserva vigent', () => {
    const futur = new Date(Date.now() + 300000).toISOString() // 5 minuts
    const resultat = calcularTempsRestant(futur)
    expect(resultat).toBeGreaterThan(0)
    expect(resultat).toBeLessThanOrEqual(300)
  })

  it('retorna aproximadament 600 segons per a una reserva de 10 minuts', () => {
    const futur = new Date(Date.now() + 600000).toISOString()
    const resultat = calcularTempsRestant(futur)
    expect(resultat).toBeGreaterThan(595)
    expect(resultat).toBeLessThanOrEqual(600)
  })
})

// ============================================================
// TESTS 5.1 — GESTIÓ D'ESTAT
// ============================================================

describe('filtrarSeientPerEstat - Gestió d\'estat de seients', () => {
  const seients = [
    { id: 1, fila: 'A', numero: 1, estat: 'Lliure' },
    { id: 2, fila: 'A', numero: 2, estat: 'Venut' },
    { id: 3, fila: 'A', numero: 3, estat: 'Lliure' },
    { id: 4, fila: 'B', numero: 1, estat: 'Venut' },
  ]

  it('filtra correctament els seients lliures', () => {
    const lliures = filtrarSeientPerEstat(seients, 'Lliure')
    expect(lliures).toHaveLength(2)
    expect(lliures.every(s => s.estat === 'Lliure')).toBe(true)
  })

  it('filtra correctament els seients venuts', () => {
    const venuts = filtrarSeientPerEstat(seients, 'Venut')
    expect(venuts).toHaveLength(2)
  })

  it('retorna array buit si no hi ha cap seient de l\'estat demanat', () => {
    const reservats = filtrarSeientPerEstat(seients, 'Reservat')
    expect(reservats).toHaveLength(0)
  })
})

describe('esSeleccionable - Gestió d\'estat individual', () => {
  it('retorna true si el seient és Lliure', () => {
    expect(esSeleccionable({ estat: 'Lliure' })).toBe(true)
  })

  it('retorna false si el seient és Venut', () => {
    expect(esSeleccionable({ estat: 'Venut' })).toBe(false)
  })

  it('retorna false si el seient está en curs', () => {
    expect(esSeleccionable({ estat: 'EnCurs' })).toBe(false)
  })
})
