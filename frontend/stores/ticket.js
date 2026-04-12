import { defineStore } from 'pinia'
import Echo from 'laravel-echo'
import Pusher from 'pusher-js'
import { v4 as uuidv4 } from 'uuid' // Or just generate a random string since we don't have socket.id

export const useTicketStore = defineStore('ticket', {
  state: () => ({
    echo: null,
    socketId: null,
    seats: [], // Llista de seients
    selectedSeats: [], // IDs de seients reservats
    eventInfo: null
  }),

  actions: {
    initSocket() {
      if (this.echo) return;
      
      this.socketId = Math.random().toString(36).substring(2, 15);

      if (typeof window !== 'undefined') {
        window.Pusher = Pusher;
      }
      
      const config = useRuntimeConfig()
      const apiUrl = config.public.socketUrl?.replace(/\/api$/, '') || 'http://localhost:8000'

      this.echo = new Echo({
        broadcaster: 'reverb',
        key: 'app-key',
        wsHost: apiUrl.replace(/^https?:\/\//, '').split(':')[0],
        wsPort: 8080,
        wssPort: 8080,
        forceTLS: false,
        enabledTransports: ['ws', 'wss'],
      })
    },

    async joinEvent(eventId) {
      if (!this.echo) this.initSocket()

      const config = useRuntimeConfig()
      try {
          const data = await $fetch(`${config.public.socketUrl}/api/events/${eventId}`)
          this.eventInfo = data
          this.seats = data.seats || []
      } catch(err){}

      this.echo.channel('event.' + eventId)
        .listen('.seat.updated', (e) => {
          const update = e.update;
          const index = this.seats.findIndex(s => s.id === update.id)
          if (index !== -1) {
            this.seats[index].estat = update.estat
            this.seats[index].socketId = update.socketId
            this.seats[index].expiresAt = update.expiresAt
            
            if (update.estat === 'Lliure' && this.selectedSeats.includes(update.id)) {
               this.selectedSeats = this.selectedSeats.filter(id => id !== update.id)
            }
          }
        })
    },

    async toggleSeat(seatId, eventId) {
      const config = useRuntimeConfig()
      const seat = this.seats.find(s => s.id === seatId)
      if (!seat) return

      if (seat.estat === 'Lliure') {
        this.selectedSeats.push(seatId) // Optimistic
        try {
            await $fetch(`${config.public.socketUrl}/api/seat/reserve`, {
                method: 'POST',
                body: { eventId, seatId, socketId: this.socketId }
            })
        } catch(err) {
            this.selectedSeats = this.selectedSeats.filter(id => id !== seatId)
            alert(err?.data?.error || 'Error reservant el seient')
        }
      } else if (seat.estat === 'Reservat' && seat.socketId === this.socketId) {
        this.selectedSeats = this.selectedSeats.filter(id => id !== seatId)
        try {
            await $fetch(`${config.public.socketUrl}/api/seat/cancel`, {
                method: 'POST',
                body: { eventId, seatId, socketId: this.socketId }
            })
        } catch(err) {
            // Revert on error
            this.selectedSeats.push(seatId)
        }
      }
    },
    
    async proceedToBuy(eventId, userData) {
      const config = useRuntimeConfig()
      const authStore = useAuthStore()
      try {
          const res = await $fetch(`${config.public.socketUrl}/api/buy`, {
              method: 'POST',
              body: {
                  eventId,
                  seats: this.selectedSeats,
                  user: userData
              },
              headers: {
                  'Authorization': `Bearer ${authStore.token}`
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
