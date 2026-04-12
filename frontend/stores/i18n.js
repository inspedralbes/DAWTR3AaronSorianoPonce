// stores/i18n.js — Language Switcher Store (FEAT-001)
// Implementació seguint specs/plan.md

import { defineStore } from 'pinia'

const translations = {
  ca: {
    // AppHeader
    'nav.login': 'Inicia Sessió',
    'nav.tickets': 'Les meves entrades',
    'nav.logout': 'Sortir',
    'nav.lang': 'CA',
    'nav.lang_flag': '🏴‍☠️',

    // Pàgina d'inici
    'home.hero_title': 'Sensacions en Directe.',
    'home.hero_subtitle': 'Reserva el teu lloc per als esdeveniments més esperats amb la plataforma en temps real més veloç.',
    'home.events_title': 'Pròxims Esdeveniments',

    // Pàgina de compra (event/[id])
    'event.select_seat': 'Selecciona el teu seient',
    'event.confirm': 'Confirmar compra',
    'event.seats_available': 'Lliures',
    'event.seats_reserved': 'Reservats',
    'event.seats_sold': 'Venuts',
    'event.legend': 'Llegenda',
    'event.back': 'Tornar',
    'event.capacity': 'Aforament',

    // Talonari (mytickets)
    'tickets.title': 'El meu Talonari',
    'tickets.subtitle': 'Organitzador d\'accessos personals vinculats a',
    'tickets.empty_title': 'Encara no tens cap entrada!',
    'tickets.empty_sub': 'El teu llistat es troba buit. Quan facis una compra la veuràs llistada aquí.',
    'tickets.explore': 'Explorar Cartellera',
    'tickets.restricted_title': 'Àrea Restringida',
    'tickets.restricted_sub': 'Per poder visualitzar el teu historial de bitllets procedents i el seu codi de lliurament és obligatori iniciar sessió.',
    'tickets.identify': 'Identificar-me ara',
    'tickets.row': 'Fila',
    'tickets.seat': 'Seient',
  },
  es: {
    // AppHeader
    'nav.login': 'Iniciar Sesión',
    'nav.tickets': 'Mis entradas',
    'nav.logout': 'Salir',
    'nav.lang': 'ES',
    'nav.lang_flag': '🇪🇸',

    // Pàgina d'inici
    'home.hero_title': 'Sensaciones en Directo.',
    'home.hero_subtitle': 'Reserva tu lugar en los eventos más esperados con la plataforma en tiempo real más rápida.',
    'home.events_title': 'Próximos Eventos',

    // Pàgina de compra (event/[id])
    'event.select_seat': 'Selecciona tu asiento',
    'event.confirm': 'Confirmar compra',
    'event.seats_available': 'Libres',
    'event.seats_reserved': 'Reservados',
    'event.seats_sold': 'Vendidos',
    'event.legend': 'Leyenda',
    'event.back': 'Volver',
    'event.capacity': 'Aforo',

    // Talonari (mytickets)
    'tickets.title': 'Mis Entradas',
    'tickets.subtitle': 'Organizador de accesos personales vinculados a',
    'tickets.empty_title': '¡Todavía no tienes ninguna entrada!',
    'tickets.empty_sub': 'Tu lista está vacía. Cuando hagas una compra la verás listada aquí.',
    'tickets.explore': 'Explorar Cartelera',
    'tickets.restricted_title': 'Área Restringida',
    'tickets.restricted_sub': 'Para poder ver tu historial de entradas es obligatorio iniciar sesión.',
    'tickets.identify': 'Identificarme ahora',
    'tickets.row': 'Fila',
    'tickets.seat': 'Asiento',
  }
}

export const useI18nStore = defineStore('i18n', {
  state: () => ({
    lang: 'ca' // Idioma per defecte: Català (REQ-002)
  }),
  getters: {
    // Funció traductora: retorna el text o la clau com fallback (REQ-003)
    t: (state) => (key) => {
      return translations[state.lang]?.[key] ?? key
    }
  },
  actions: {
    // REQ-002: Inicialitzar des de localStorage (amb guard per SSR)
    init() {
      if (import.meta.client) {
        const saved = localStorage.getItem('tix_lang')
        if (saved && ['ca', 'es'].includes(saved)) {
          this.lang = saved
        }
      }
    },
    // REQ-001: Alternar entre idiomes
    toggle() {
      this.lang = this.lang === 'ca' ? 'es' : 'ca'
      if (import.meta.client) {
        localStorage.setItem('tix_lang', this.lang) // REQ-002: Persistència
      }
    }
  }
})
