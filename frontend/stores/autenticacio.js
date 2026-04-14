import { defineStore } from 'pinia'
import { useRuntimeConfig } from '#app'

/**
 * Aquest Store gestiona tota la identitat de l'usuari i la seguretat en el cantó del client.
 * Està dissenyat per modularitzar les crides d'autenticació i protegir l'estat global.
 */
export const useAutenticacioStore = defineStore('autenticacio', {
  state: () => ({
    user: null, // Conté les dades bàsiques de l'usuari { id, nom, email, admin }
    isLoginModalOpen: false, // Controla la visibilitat de la finestra d'accés
    authError: null // Emmagatzema missatges d'error per informar el client
  }),
  
  actions: {
    /**
     * Recupera la sessió de l'usuari des del LocalStorage per mantenir la persistència
     * quan es refresca la pàgina, seguint criteris de continuïtat d'experiència.
     */
    init() {
      if (import.meta.client || typeof window !== 'undefined') {
        const stored = localStorage.getItem('tix_user')
        if (stored) {
          try {
            this.user = JSON.parse(stored)
          } catch(e) {
            // Si les dades del localStorage estan corrompudes, simplement les ignorem.
          }
        }
      }
    },

    /**
     * Realitza la petició de login al servidor Laravel.
     * Implementa la separació de la comunicació amb l'API de Nuxt.
     */
    async login(email, password) {
      this.authError = null
      const config = useRuntimeConfig()
      try {
          const res = await $fetch(`${config.public.socketUrl}/api/auth/login`, {
              method: 'POST',
              body: { email, password }
          })
          if (res.success) {
              this.user = res.user
              // Guardem de manera persistent al navegador per a futures visites.
              if (import.meta.client || typeof window !== 'undefined') {
                  localStorage.setItem('tix_user', JSON.stringify(res.user))
              }
              this.isLoginModalOpen = false
              return true
          }
      } catch(err) {
          // Gestionem l'error i el passem a la presentació per avisar l'usuari.
          this.authError = err.data?.error || "Error de connexió en intentar accedir."
          return false
      }
    },

    /**
     * Crea un nou compte d'usuari a la plataforma.
     */
    async register(nom, email, password) {
      this.authError = null
      const config = useRuntimeConfig()
      try {
          const res = await $fetch(`${config.public.socketUrl}/api/auth/register`, {
              method: 'POST',
              body: { nom, email, password }
          })
          if (res.success) {
              this.user = res.user
              if (import.meta.client || typeof window !== 'undefined') {
                  localStorage.setItem('tix_user', JSON.stringify(res.user))
              }
              this.isLoginModalOpen = false
              return true
          }
      } catch(err) {
          this.authError = err.data?.error || "Aquest correu electrònic no està disponible."
          return false
      }
    },

    /**
     * Tanca la sessió de l'usuari i neteja totes les restes locals d'identitat.
     */
    logout() {
      this.user = null
      this.authError = null
      if (import.meta.client || typeof window !== 'undefined') {
          localStorage.removeItem('tix_user')
      }
    },

    openLoginModal() {
      this.authError = null
      this.isLoginModalOpen = true
    },

    closeLoginModal() {
      this.authError = null
      this.isLoginModalOpen = false
    }
  }
})
