import { defineStore } from 'pinia'

/**
 * Gestor de la internacionalització (i18n) personalitzat.
 * Centralitza les traduccions i l'estat de l'idioma per a tota l'aplicació.
 */
export const useI18nStore = defineStore('i18n', {
  state: () => ({
    lang: 'ca', // Idioma per defecte: Català.
    locales: {
      ca: {
        nav: { login: 'Accedir', logout: 'Eixir', tickets: 'Les meves entrades' },
        home: { 
            hero_title: 'Viu moments inoblidables', 
            hero_subtitle: 'Reserva ara les teves entrades per als millors espectacles en viu amb total seguretat.',
            events_title: 'Propers Espectacles' 
        },
        tickets: {
            title: 'Entrades Adquirides',
            subtitle: 'Sessió vinculada a ',
            empty_title: 'Encara no tens cap entrada',
            empty_sub: 'Explora la cartellera i troba el teu proper esdeveniment.',
            explore: 'Explorar Espectacles',
            restricted_title: 'Zona de Seguretat',
            restricted_sub: 'Has d\'identificar-te per poder consultar l\'historial de les teves entrades.',
            identify: 'Identificar-me'
        }
      },
      es: {
        nav: { login: 'Acceder', logout: 'Salir', tickets: 'Mis entradas' },
        home: { 
            hero_title: 'Vive momentos inolvidables', 
            hero_subtitle: 'Reserva ahora tus entradas para los mejores espectáculos en vivo con total seguridad.',
            events_title: 'Próximos Espectáculos' 
        },
        tickets: {
            title: 'Entradas Adquiridas',
            subtitle: 'Sesión vinculada a ',
            empty_title: 'Aún no tienes ninguna entrada',
            empty_sub: 'Explora la cartelera i encuentra tu próximo evento.',
            explore: 'Explorar Espectáculos',
            restricted_title: 'Zona de Seguridad',
            restricted_sub: 'Debes identificarte para poder consultar el historial de tus entradas.',
            identify: 'Identificarme'
        }
      }
    }
  }),
  
  actions: {
    /**
     * Inicialitza l'idioma des del LocalStorage per a una experiència persistent.
     */
    init() {
        if (import.meta.client || typeof window !== 'undefined') {
            const saved = localStorage.getItem('tix_lang')
            if (saved) this.lang = saved
        }
    },

    /**
     * Commuta entre els idiomes disponibles i guarda la preferència.
     */
    toggle() {
      this.lang = this.lang === 'ca' ? 'es' : 'ca'
      if (import.meta.client || typeof window !== 'undefined') {
          localStorage.setItem('tix_lang', this.lang)
      }
    },

    /**
     * Funció d'utilitat per obtenir una cadena traduïda mitjançant notació de punts.
     * Ejemplo: t('nav.login')
     */
    t(key) {
      const keys = key.split('.')
      let result = this.locales[this.lang]
      for (const k of keys) {
        if (!result[k]) return key // Si no existeix la clau, retornem la pròpia clau.
        result = result[k]
      }
      return result
    }
  }
})
