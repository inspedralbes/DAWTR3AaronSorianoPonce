import { defineStore } from 'pinia'
import Echo from 'laravel-echo'
import Pusher from 'pusher-js'

/**
 * Aquest Store és el nucli de la interactivitat en temps real de la plataforma.
 * Gestiona la connexió amb Laravel Reverb (via Echo) i l'estat dels seients.
 */
export const useEntradesStore = defineStore('entrades', {
  state: () => ({
    echo: null, // Instància de Laravel Echo
    socketId: null, // Identificador únic de la sessió del navegador per al bloqueig de seients
    seats: [], // Llistat total de seients per a l'esdeveniment actiu
    selectedSeats: [], // IDs dels seients que l'usuari té bloquejats per comprar
    eventInfo: null // Informació general de l'esdeveniment
  }),

  actions: {
    /**
     * Inicialitza la connexió WebSockets amb el servidor Reverb.
     * Defineix la configuració de domini i ports necessària per a la comunicació bidireccional.
     */
    initSocket() {
      if (this.echo) return;
      
      // Generem un ID aleatori per diferenciar les accions d'aquest navegador de les d'altres.
      this.socketId = Math.random().toString(36).substring(2, 15);

      if (typeof window !== 'undefined') {
        window.Pusher = Pusher;
      }
      
      const config = useRuntimeConfig()
      const apiUrl = config.public.socketUrl?.replace(/\/api$/, '') || 'http://localhost:8000'

      // Configuració de Laravel Echo per utilitzar el broadcaster Reverb.
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

    /**
     * S'uneix a un canal d'esdeveniment i carrega la informació inicial d'aquest.
     */
    async joinEvent(eventId) {
      if (!this.echo) this.initSocket()

      const config = useRuntimeConfig()
      try {
          // Descarreguem l'estat inicial via HTTP (Separació de responsabilitats: REST per a dades, WS per a canvis).
          const data = await $fetch(`${config.public.socketUrl}/api/events/${eventId}`)
          this.eventInfo = data
          this.seats = data.seats || []
      } catch(err){
          // Error en carregar la sala.
      }

      // Ens subscrivim al canal privat de l'esdeveniment per rebre actualitzacions de seients.
      this.echo.channel('event.' + eventId)
        .listen('.seient.actualitzat', (e) => {
          const update = e.update;
          const index = this.seats.findIndex(s => s.id === update.id)
          if (index !== -1) {
            // Actualitzem l'estat local basant-nos en el que ens diu el servidor en temps real.
            this.seats[index].estat = update.estat
            this.seats[index].socketId = update.socketId
            this.seats[index].expiresAt = update.expiresAt
            
            // Si el seient es torna lliure i el teníem seleccionat, l'eliminem de la cistella.
            if (update.estat === 'Lliure' && this.selectedSeats.includes(update.id)) {
               this.selectedSeats = this.selectedSeats.filter(id => id !== update.id)
            }
          }
        })
    },

    /**
     * Alterna la selecció d'un seient (Reservar/Alliberar).
     * Utilitza crides HTTP que desencadenen esdeveniments de WebSocket al backend.
     */
    async toggleSeat(seatId, eventId) {
      const config = useRuntimeConfig()
      const seat = this.seats.find(s => s.id === seatId)
      if (!seat) return

      if (seat.estat === 'Lliure') {
        // Bloqueig optimista a la UI mentre esperem resposta del servidor.
        this.selectedSeats.push(seatId) 
        try {
            await $fetch(`${config.public.socketUrl}/api/seat/reserve`, {
                method: 'POST',
                body: { eventId, seatId, socketId: this.socketId }
            })
        } catch(err) {
            // Revertim la selecció si el servidor ens diu que ja no és possible bloquejar-lo.
            this.selectedSeats = this.selectedSeats.filter(id => id !== seatId)
            alert(err?.data?.error || 'Error reservant el seient')
        }
      } else if (seat.estat === 'Reservat' && seat.socketId === this.socketId) {
        // Alliberament de la butaca seleccionada per l'usuari mateix.
        this.selectedSeats = this.selectedSeats.filter(id => id !== seatId)
        try {
            await $fetch(`${config.public.socketUrl}/api/seat/cancel`, {
                method: 'POST',
                body: { eventId, seatId, socketId: this.socketId }
            })
        } catch(err) {
            this.selectedSeats.push(seatId)
        }
      }
    },
    
    /**
     * Envia la petició final per comprar els seients seleccionats.
     */
    async proceedToBuy(eventId, userData) {
      const config = useRuntimeConfig()
      const authStore = useAutenticacioStore()
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
          // Netejem la selecció local després d'una compra reeixida.
          this.selectedSeats = []
          return res
      } catch (err) {
          throw err
      }
    }
  },
  
  getters: {
    /**
     * Calcula el preu acumulat de la cistella de l'usuari en temps real.
     */
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
