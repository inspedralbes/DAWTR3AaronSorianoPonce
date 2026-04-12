import { defineStore } from 'pinia'
import { io } from 'socket.io-client'

export const useTicketStore = defineStore('ticket', {
  state: () => ({
    socket: null,
    socketId: null,
    seats: [], // Llista de seients
    selectedSeats: [], // IDs de seients que he seleccionat i tinc reservats temporalment
    eventInfo: null
  }),

  actions: {
    initSocket() {
      const config = useRuntimeConfig()
      this.socket = io(config.public.socketUrl)
      
      this.socket.on('connect', () => {
        this.socketId = this.socket.id
        console.log('Connectat via Socket.io', this.socketId)
      })

      this.socket.on('init_seats', (seatsData) => {
        this.seats = seatsData
      })

      this.socket.on('seat_updated', (update) => {
        const index = this.seats.findIndex(s => s.id === update.id)
        if (index !== -1) {
          this.seats[index].estat = update.estat
          this.seats[index].socketId = update.socketId
          this.seats[index].expiresAt = update.expiresAt
          
          // Si el seient se m'acaba de caducar (o cancel·lar pel server), el trec de la meva llista
          if (update.estat === 'Lliure' && this.selectedSeats.includes(update.id)) {
             this.selectedSeats = this.selectedSeats.filter(id => id !== update.id)
          }
        }
      })
      
      this.socket.on('reserve_error', (err) => {
        alert(err.message)
        // Treure'l de la llista de selecionats localment si hi era
        this.selectedSeats = this.selectedSeats.filter(id => id !== err.seatId)
      })
    },

    joinEvent(eventId) {
      if (!this.socket) this.initSocket()
      this.socket.emit('join_event', eventId)
    },

    toggleSeat(seatId, eventId) {
      const seat = this.seats.find(s => s.id === seatId)
      if (!seat) return

      if (seat.estat === 'Lliure') {
        // Reservar temporalment
        this.socket.emit('reserve_seat', { eventId, seatId })
        this.selectedSeats.push(seatId) // afegim localment optimísticament
      } else if (seat.estat === 'Reservat' && seat.socketId === this.socketId) {
        // Cancel·lar reserva
        this.socket.emit('cancel_reserve', { eventId, seatId })
        this.selectedSeats = this.selectedSeats.filter(id => id !== seatId)
      } else {
        // Altres casos (reservat per altre, o venut no fer res)
      }
    },
    
    async proceedToBuy(eventId, userData) {
      const config = useRuntimeConfig()
      try {
          const res = await $fetch(`${config.public.socketUrl}/api/buy`, {
              method: 'POST',
              body: {
                  eventId,
                  seats: this.selectedSeats,
                  user: userData
              },
              headers: {
                  'x-socket-id': this.socketId
              }
          })
          this.selectedSeats = []
          return res
      } catch (err) {
          throw err
      }
    }
  },
  
  getters: {
    totalPrice() {
        let total = 0
        this.selectedSeats.forEach(seatId => {
            const seat = this.seats.find(s => s.id === seatId)
            if (seat && seat.preu) {
                total += parseFloat(seat.preu)
            }
        })
        return total
    }
  }
})
