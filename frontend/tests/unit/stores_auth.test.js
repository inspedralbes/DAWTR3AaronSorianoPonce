import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '../../stores/auth.js'

// Mock `useRuntimeConfig` i `$fetch`
vi.stubGlobal('useRuntimeConfig', () => ({
  public: { socketUrl: 'http://localhost:3001' }
}))

const mockFetch = vi.fn()
vi.stubGlobal('$fetch', mockFetch)

// Mock LocalStorage
const mockLocalStorage = (() => {
  let store = {}
  return {
    getItem: vi.fn(key => store[key] || null),
    setItem: vi.fn((key, value) => { store[key] = value.toString() }),
    removeItem: vi.fn(key => { delete store[key] }),
    clear: () => { store = {} }
  }
})()
vi.stubGlobal('localStorage', mockLocalStorage)
// També falsegem `import.meta.client` d'esquemes tipus Nuxt
vi.stubGlobal('import', { meta: { client: true } })

describe('Pinia Store: auth.js', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    mockLocalStorage.clear()
    
    // Per suportar import.meta.client a Vitest de manera simple (com si fos navegador)
    globalThis.import = { meta: { client: true } }
  })

  // 5.3 Inicialització
  it('inicialitza l\'usuari nul·l i el procés de login tancat', () => {
    const store = useAuthStore()
    expect(store.user).toBeNull()
    expect(store.isLoginModalOpen).toBe(false)
  })

  // 5.3 Inicialització d'estat des de localstorage
  it('reanima l\'usuari des del localstorage a init()', () => {
    const store = useAuthStore()
    mockLocalStorage.setItem('tix_user', JSON.stringify({ id: 10, nom: 'Test User' }))
    
    store.init()
    expect(store.user).toEqual({ id: 10, nom: 'Test User' })
  })

  // 5.3 Accions de l'usuari (Login correcte)
  it('modifica l\'estat de user quan es fa un login correctament', async () => {
    const store = useAuthStore()
    // Preparem la resposta simulada del servidor
    mockFetch.mockResolvedValueOnce({
      success: true,
      user: { id: 1, nom: 'Usuari Connectat' }
    })

    const loginResult = await store.login('test@test.com', 'password123')
    
    expect(loginResult).toBe(true)
    expect(store.user.nom).toBe('Usuari Connectat')
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('tix_user', expect.any(String))
    expect(store.isLoginModalOpen).toBe(false)
  })

  // 5.3 Accions de l'usuari (Logout)
  it('borra l\'estat donat al fer logout', () => {
    const store = useAuthStore()
    store.user = { id: 1, nom: 'test' }
    
    store.logout()
    
    expect(store.user).toBeNull()
    expect(store.authError).toBeNull()
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('tix_user')
  })
})
