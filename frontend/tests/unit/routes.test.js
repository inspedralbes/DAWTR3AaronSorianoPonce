// tests/unit/routes.test.js
// 5.2 - Tests de rutes: dinàmiques, paràmetres d'URL i redireccions

import { describe, it, expect } from 'vitest'

// Simulem la lògica de routing del projecte (vue-router)
// sense necessitar muntar el component complet

/**
 * Genera la URL d'un event a partir del seu ID
 */
function getEventRoute(id) {
  if (!id) return null
  return `/event/${id}`
}

/**
 * Genera la URL del mode admin d'un event (lectura)
 */
function getAdminEventRoute(id) {
  if (!id) return null
  return `/admin/event/${id}`
}

/**
 * Extreu el paràmetre ID d'una URL de event
 */
function extractEventId(url) {
  const match = url.match(/\/event\/(\d+)/)
  return match ? parseInt(match[1]) : null
}

/**
 * Determina si una ruta requereix autenticació
 */
function requiresAuth(path) {
  const protectedRoutes = ['/mytickets', '/admin', '/admin/event']
  return protectedRoutes.some(route => path.startsWith(route))
}

/**
 * Redirectció: si l'usuari no està autenticat i intenta accedir
 * a una ruta protegida, el retorna a '/'
 */
function getRedirectPath(path, isAuthenticated) {
  if (requiresAuth(path) && !isAuthenticated) {
    return '/'
  }
  return path
}

// ============================================================
// TESTS 5.2 — RUTES DINÀMIQUES
// ============================================================

describe('getEventRoute - Rutes dinàmiques d\'esdeveniments', () => {
  it('genera correctament la ruta per a un event amb id numèric', () => {
    expect(getEventRoute(1)).toBe('/event/1')
    expect(getEventRoute(42)).toBe('/event/42')
  })

  it('genera la ruta per a IDs grans (aforament gran)', () => {
    expect(getEventRoute(9999)).toBe('/event/9999')
  })

  it('retorna null si l\'id és null o undefined', () => {
    expect(getEventRoute(null)).toBeNull()
    expect(getEventRoute(undefined)).toBeNull()
  })
})

describe('getAdminEventRoute - Rutes dinàmiques d\'admin (mode lectura)', () => {
  it('genera correctament la ruta de supervisió admin', () => {
    expect(getAdminEventRoute(3)).toBe('/admin/event/3')
  })

  it('retorna null si l\'id no existeix', () => {
    expect(getAdminEventRoute(null)).toBeNull()
  })
})

// ============================================================
// TESTS 5.2 — PARÀMETRES D'URL
// ============================================================

describe('extractEventId - Extracció de paràmetres d\'URL', () => {
  it('extreu correctament l\'ID d\'una URL d\'event', () => {
    expect(extractEventId('/event/5')).toBe(5)
  })

  it('extreu correctament l\'ID d\'una URL d\'admin event', () => {
    expect(extractEventId('/admin/event/12')).toBe(12)
  })

  it('retorna null per a una URL sense ID', () => {
    expect(extractEventId('/event/')).toBeNull()
    expect(extractEventId('/')).toBeNull()
  })

  it('retorna null per a la pàgina principal', () => {
    expect(extractEventId('/')).toBeNull()
  })
})

// ============================================================
// TESTS 5.2 — REDIRECCIONS BÀSIQUES
// ============================================================

describe('requiresAuth - Detecció de rutes protegides', () => {
  it('marca /mytickets com a ruta protegida', () => {
    expect(requiresAuth('/mytickets')).toBe(true)
  })

  it('marca /admin com a ruta protegida', () => {
    expect(requiresAuth('/admin')).toBe(true)
  })

  it('marca /admin/event/1 com a ruta protegida', () => {
    expect(requiresAuth('/admin/event/1')).toBe(true)
  })

  it('NO marca / com a ruta protegida', () => {
    expect(requiresAuth('/')).toBe(false)
  })

  it('NO marca /event/1 (compra pública) com a ruta protegida', () => {
    expect(requiresAuth('/event/1')).toBe(false)
  })
})

describe('getRedirectPath - Lògica de redirecció', () => {
  it('redirigeix a / si l\'usuari no autenticat intenta anar a /mytickets', () => {
    expect(getRedirectPath('/mytickets', false)).toBe('/')
  })

  it('redirigeix a / si l\'usuari no autenticat intenta anar a /admin', () => {
    expect(getRedirectPath('/admin', false)).toBe('/')
  })

  it('permet accés a /mytickets si l\'usuari està autenticat', () => {
    expect(getRedirectPath('/mytickets', true)).toBe('/mytickets')
  })

  it('permet accés lliure a / sense autenticació', () => {
    expect(getRedirectPath('/', false)).toBe('/')
  })

  it('permet accés lliure a /event/1 sense autenticació', () => {
    expect(getRedirectPath('/event/1', false)).toBe('/event/1')
  })
})
