import { defineStore } from 'pinia'
import { useRuntimeConfig } from '#app'

export const useAutenticacioStore = defineStore('autenticacio', {
  state: () => ({
    user: null, // { id: '..', nom: '...', email: '...' }
    isLoginModalOpen: false,
    authError: null
  }),
  actions: {
    init() {
      if (import.meta.client || typeof window !== 'undefined') {
        const stored = localStorage.getItem('tix_user')
        if (stored) {
          try {
            this.user = JSON.parse(stored)
          } catch(e) {}
        }
      }
    },
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
              if (import.meta.client || typeof window !== 'undefined') localStorage.setItem('tix_user', JSON.stringify(res.user))
              this.isLoginModalOpen = false
              return true
          }
      } catch(err) {
          this.authError = err.data?.error || "Error de connexió en intentar accedir."
          return false
      }
    },
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
              if (import.meta.client || typeof window !== 'undefined') localStorage.setItem('tix_user', JSON.stringify(res.user))
              this.isLoginModalOpen = false
              return true
          }
      } catch(err) {
          this.authError = err.data?.error || "Aquest correu electrònic no està disponible."
          return false
      }
    },
    logout() {
      this.user = null
      this.authError = null
      if (import.meta.client || typeof window !== 'undefined') localStorage.removeItem('tix_user')
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
