import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useEntradesStore } from '../../stores/entrades.js'

// Mock de `useRuntimeConfig` i `$fetch`
vi.stubGlobal('useRuntimeConfig', () => ({
  public: { socketUrl: 'http://localhost:8000' }
}))

const mockFetch = vi.fn()
vi.stubGlobal('$fetch', mockFetch)

// Mock de Laravel Echo
const mockListen = vi.fn()
const mockChannel = vi.fn(() => ({
    listen: mockListen
}))

vi.mock('laravel-echo', () => {
    return {
        default: vi.fn().mockImplementation(() => ({
            channel: mockChannel
        }))
    }
})

describe('Pinia Store: entrades.js (Laravel Echo)', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('inicialitza l\'estat per defecte buit i sense echo', () => {
    const store = useEntradesStore()
    expect(store.seats).toEqual([])
    expect(store.selectedSeats).toEqual([])
    expect(store.echo).toBeNull()
  })

  it('joinEvent carrega els seients via HTTP i obre el canal Echo', async () => {
    const store = useEntradesStore()
    const mockSeats = [{ id: 1, estat: 'Lliure', preu: 10 }]
    mockFetch.mockResolvedValueOnce({ seats: mockSeats })

    await store.joinEvent(1)

    expect(store.seats).toEqual(mockSeats)
    expect(mockChannel).toHaveBeenCalledWith('event.1')
    expect(mockListen).toHaveBeenCalledWith('.seient.actualitzat', expect.any(Function))
  })

  it('actualitza l\'estat quan arriba un event de seient actualitzat', async () => {
    const store = useEntradesStore()
    mockFetch.mockResolvedValueOnce({ seats: [{ id: 5, estat: 'Lliure' }] })
    
    await store.joinEvent(1)
    
    // Obtenim el callback del listen
    const updateCallback = mockListen.mock.calls[0][1]
    
    // Simulem l'arribada d'un event de Reverb
    updateCallback({ 
        update: { id: 5, estat: 'Venut', socketId: null, expiresAt: null } 
    })
    
    expect(store.seats[0].estat).toBe('Venut')
  })

  it('calcula correctament el preu total', () => {
    const store = useEntradesStore()
    store.seats = [
      { id: 1, estat: 'Lliure', preu: 10 },
      { id: 2, estat: 'Lliure', preu: 20 }
    ]
    store.selectedSeats = [1, 2]

    expect(store.totalPrice).toBe(30)
  })
})
