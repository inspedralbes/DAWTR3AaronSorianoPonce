<template>
  <!-- La Capçalera principal de l'aplicació. Gestions d'accés i canvi d'idioma. -->
  <header :class="['border-b border-white/10 sticky top-0 z-50 flex items-center justify-between px-4 sm:px-6 py-4', transparent ? 'glass-nav' : 'bg-gray-900/80 backdrop-blur-lg']">
      <div class="flex items-center gap-4">
         <!-- Zona corporativa i LOGO -->
         <slot name="left">
            <NuxtLink to="/" class="text-2xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent transform transition hover:scale-105">
              TixCore Live
            </NuxtLink>
         </slot>
      </div>
      
      <!-- Zona central per a cercadors o missatges Live -->
      <div class="flex flex-1 items-center justify-center gap-4">
         <slot name="center"></slot>
      </div>
      
      <div class="flex items-center gap-3 sm:gap-4">
         <slot name="right"></slot>
         
         <!-- Bloc d'Autenticació: Mostra les opcions segons si l'usuari està identificat o no. -->
         <div class="h-6 w-px bg-white/10 hidden sm:block"></div>
         <div v-if="auth.user" class="flex items-center gap-2 sm:gap-3">
            <span class="text-xs text-gray-400 hidden sm:block">Hola, <span class="text-white font-bold">{{ auth.user.nom }}</span></span>
            <NuxtLink to="/mytickets" class="text-sm font-medium text-white bg-purple-600 hover:bg-purple-500 transition-colors px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-lg shadow-purple-500/20">
                <UIcon name="i-heroicons-ticket" class="w-4 h-4" /> <span class="hidden sm:inline">{{ i18n.t('nav.tickets') }}</span>
            </NuxtLink>
            <button @click="handleLogout" class="text-gray-400 hover:text-red-400 transition-colors p-1" :title="i18n.t('nav.logout')">
                <UIcon name="i-heroicons-arrow-right-on-rectangle" class="w-5 h-5" />
            </button>
         </div>
         <button v-else @click="auth.openLoginModal()" class="text-sm font-medium text-gray-300 hover:text-white border border-white/10 hover:bg-white/5 transition-colors px-4 py-1.5 rounded-lg">
             {{ i18n.t('nav.login') }}
         </button>

         <!-- Commutador d'Idioma: Implementació del requeriment REQ-001 de multidioma persistent. -->
         <button
            @click="i18n.toggle()"
            class="flex items-center gap-1 text-[0.7rem] font-bold text-gray-400 hover:text-white border border-white/10 hover:border-purple-500/50 hover:bg-purple-500/10 transition-all px-2.5 py-1.5 rounded-lg"
            :title="i18n.lang === 'ca' ? 'Cambiar a Castellano' : 'Canviar a Catala'"
         >
            <span class="text-sm leading-none">{{ i18n.lang === 'ca' ? '🇪🇸' : '🏴' }}</span>
            <span>{{ i18n.lang === 'ca' ? 'ES' : 'CA' }}</span>
         </button>
         
         <NuxtLink to="/admin" class="text-xs font-mono text-gray-500 hover:text-white transition-colors ml-2">Admin</NuxtLink>
      </div>

      <!-- Diàleg Modal d'Accés: Centralitza el registre i el login en un sol punt modular. -->
      <UModal v-model="auth.isLoginModalOpen">
         <div class="p-8">
             <h3 class="text-2xl font-bold mb-2">{{ isRegisterMode ? 'Crea un nou compte' : "Identifica't per continuar" }}</h3>
             <p class="text-gray-400 text-sm mb-6">{{ isRegisterMode ? 'Introdueix les teves dades segures per poder reservar bitllets.' : 'Accedeix a la teva sessio i entrades associades.' }}</p>
             
             <form @submit.prevent="handleAuthSubmit" class="space-y-4">
                <div v-if="isRegisterMode">
                    <label class="text-xs text-gray-400 mb-1 block">Nom Complet</label>
                    <input v-model="authForm.nom" :required="isRegisterMode" type="text" class="w-full bg-gray-950 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:border-purple-500 transition-colors" placeholder="Joan Garcia" />
                </div>
                <div>
                    <label class="text-xs text-gray-400 mb-1 block">Correu Electronic</label>
                    <input v-model="authForm.email" required type="email" class="w-full bg-gray-950 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:border-purple-500 transition-colors" placeholder="hola@exemple.com" />
                </div>
                <div>
                    <label class="text-xs text-gray-400 mb-1 block">Contrasenya</label>
                    <input v-model="authForm.password" required type="password" class="w-full bg-gray-950 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:border-purple-500 transition-colors" placeholder="••••••••" />
                </div>

                <!-- Gestió d'errors provinent de l'Store. -->
                <div v-if="auth.authError" class="bg-red-500/10 text-red-400 text-sm p-3 rounded-lg border border-red-500/20">
                    {{ auth.authError }}
                </div>

                <UButton type="submit" block color="purple" class="mt-4" size="lg" :loading="isSubmitting">
                    {{ isRegisterMode ? 'Registrar-me' : 'Entrar' }}
                </UButton>
             </form>

             <div class="mt-6 text-center text-sm text-gray-400 border-t border-white/5 pt-4">
                 {{ isRegisterMode ? 'Ja tens un compte?' : 'Encara no tens compte?' }}
                 <button @click="toggleMode" type="button" class="text-purple-400 font-bold hover:underline ml-1">
                     {{ isRegisterMode ? 'Inicia sessio aqui' : "Registra't ara" }}
                 </button>
             </div>
         </div>
      </UModal>
  </header>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAutenticacioStore } from '@/stores/autenticacio'
import { useI18nStore } from '@/stores/i18n'
import { useRouter } from 'vue-router'

// Definició de props per donar més flexibilitat al disseny (ex: fons transparent al Hero).
const props = defineProps({
  transparent: { type: Boolean, default: false }
})

// Accés als stores de Pinia (Lògica de negoci i internacionalització).
const auth = useAutenticacioStore()
const i18n = useI18nStore()
const router = useRouter()

const isRegisterMode = ref(false)
const isSubmitting = ref(false)
const authForm = ref({ nom: '', email: '', password: '' })

onMounted(() => {
    // Inicialització de l'estat local i l'idioma al carregar el component.
    auth.init()
    i18n.init()
})

const toggleMode = () => {
    isRegisterMode.value = !isRegisterMode.value
    auth.authError = null
}

/**
 * Tramet les dades d'autenticació a l'Store.
 * Segueix el principi de separar la lògica de crides (Store) de la UI (Component).
 */
const handleAuthSubmit = async () => {
    isSubmitting.value = true
    try {
        if (isRegisterMode.value) {
            await auth.register(authForm.value.nom, authForm.value.email, authForm.value.password)
        } else {
            await auth.login(authForm.value.email, authForm.value.password)
        }
    } finally {
        isSubmitting.value = false
    }
}

const handleLogout = () => {
    auth.logout()
    router.push('/')
}
</script>

<style scoped>
/* Estils específics per a l'efecte de vidre esmerilat (glassmorphism). */
.glass-nav {
    background: rgba(10, 10, 10, 0.7);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
}
</style>
