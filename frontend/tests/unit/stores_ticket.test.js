import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useTicketStore } from '../../stores/ticket.js'

// Mock de `useRuntimeConfig` i `socket.io` utilitzats per l\'store
vi.stubGlobal('useRuntimeConfig', () => ({
  public: { socketUrl: 'http://localhost:3001' }
}))

// Mock function socket
const mockSocketEmit = vi.fn()
const mockSocketOn = vi.fn()
vi.mock('socket.io-client', () => {
  return {
    io: () => ({
      id: 'mock-socket-id',
      on: mockSocketOn,
      emit: mockSocketEmit
    })
  }
})

describe('Pinia Store: ticket.js', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  // 5.3: Inicialització correcta de l'estat
  it('inicialitza l\'estat per defecte buit i sense socket', () => {
    const store = useTicketStore()
    expect(store.seats).toEqual([])
    expect(store.selectedSeats).toEqual([])
    expect(store.socket).toBeNull()
  })

  // 5.3: Actualització d'estat davant events Socket.IO simulats
  it('simula la connexió socket i actualitza seients (fake socket.on)', () => {
    const store = useTicketStore()
    store.initSocket()

    expect(store.socket).toBeDefined()
    expect(mockSocketOn).toHaveBeenCalledWith('init_seats', expect.any(Function))
    
    // Obtenim el callback registrat de 'init_seats' i el simulem
    const initSeatsCallback = mockSocketOn.mock.calls.find(call => call[0] === 'init_seats')[1]
    
    // Invoquem el callback com si fóssim el servidor Node
    initSeatsCallback([{ id: 1, estat: 'Lliure', preu: 10 }])
    expect(store.seats.length).toBe(1)
    expect(store.seats[0].preu).toBe(10)
  })

  // 5.3: Actualització d'estat davant events Socket.IO simulats (caducitat / alliberament)
  it('elimina un seient retingut dels seleccionats quan aquest passa a Lliure pel servidor (seat_updated)', () => {
    const store = useTicketStore()
    store.initSocket()
    
    const updateCallback = mockSocketOn.mock.calls.find(call => call[0] === 'seat_updated')[1]

    store.seats = [{ id: 5, estat: 'Reservat', socketId: 'mock-socket-id' }]
    store.selectedSeats = [5]

    // Ens avisen que s'ha caducat i queda lliure
    updateCallback({ id: 5, estat: 'Lliure', socketId: null, expiresAt: null })
    
    expect(store.seats[0].estat).toBe('Lliure')
    // El seient desapareix optimísticament de la nostra cistella local
    expect(store.selectedSeats).not.toContain(5)
  })

  // 5.3: Actualització d'estat davant accions de l'usuari
  it('permet a l\'usuari alternar un seient entre reservat i lliure (toggleSeat)', () => {
    const store = useTicketStore()
    store.initSocket()
    store.socketId = 'mock-socket-id'
    store.seats = [{ id: 2, estat: 'Lliure', preu: 15 }]

    // 1r clic: Reservar optimísticament
    store.toggleSeat(2, 'event-1')
    expect(store.selectedSeats).toContain(2)
    expect(mockSocketEmit).toHaveBeenCalledWith('reserve_seat', { eventId: 'event-1', seatId: 2 })

    // Assignem per simular que el servidor ha fet la reserva
    store.seats[0].estat = 'Reservat'
    store.seats[0].socketId = 'mock-socket-id'

    // 2n clic: Cancel·lar-la optimísticament
    store.toggleSeat(2, 'event-1')
    expect(store.selectedSeats).not.toContain(2)
    expect(mockSocketEmit).toHaveBeenCalledWith('cancel_reserve', { eventId: 'event-1', seatId: 2 })
  })

  // 5.1: Transformació de dades / lògica del getterTotalPrice
  it('calcula correctament el preu total dels seients seleccionats temporalment', () => {
    const store = useTicketStore()
    store.seats = [
      { id: 1, estat: 'Reservat', preu: 10 },
      { id: 2, estat: 'Lliure', preu: 20 },
      { id: 3, estat: 'Reservat', preu: 15 },
    ]
    // Hem seleccionat el 1 i el 3
    store.selectedSeats = [1, 3]

    // 10 + 15 = 25
    expect(store.totalPrice).toBe(25)
  })
})
