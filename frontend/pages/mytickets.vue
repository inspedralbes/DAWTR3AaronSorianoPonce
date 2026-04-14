<template>
  <div class="min-h-screen bg-gray-950 text-white font-sans selection:bg-purple-500/30">
    <CapcaleraWeb />
    
    <main class="max-w-5xl mx-auto px-4 py-12 min-h-[80vh] flex flex-col">
      <!-- Protecció de Ruta: Mostra un missatge si l'usuari no està autenticat. -->
      <div v-if="!auth.user" class="flex flex-col items-center justify-center flex-1 text-center">
          <UIcon name="i-heroicons-lock-closed" class="w-20 h-20 text-gray-800 mb-6"/>
          <h2 class="text-3xl font-bold mb-4">{{ i18n.t('tickets.restricted_title') }}</h2>
          <p class="text-gray-400 mb-8 max-w-md">{{ i18n.t('tickets.restricted_sub') }}</p>
          <UButton @click="auth.openLoginModal()" color="purple" size="xl">{{ i18n.t('tickets.identify') }}</UButton>
      </div>

      <!-- Zona d'Usuari: Mostra el llistat d'entrades agrupades. -->
      <div v-else>
         <div class="mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-white/10 pb-6">
            <div>
               <h2 class="text-3xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">{{ i18n.t('tickets.title') }}</h2>
               <p class="text-gray-400 mt-2 text-sm">{{ i18n.t('tickets.subtitle') }} <span class="text-white font-mono bg-white/5 px-2 py-0.5 rounded">{{ auth.user.email }}</span></p>
            </div>
         </div>

         <div v-if="pending" class="flex justify-center p-20">
            <div class="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
         </div>
         
         <!-- Estat quan l'usuari no té entrades vinculades encara. -->
         <div v-else-if="groupedTickets.length === 0" class="text-center py-20 bg-gray-900/50 rounded-3xl border border-white/5 border-dashed">
            <UIcon name="i-heroicons-face-frown" class="w-16 h-16 text-gray-700 mx-auto mb-4"/>
            <h3 class="text-xl font-bold text-gray-300">{{ i18n.t('tickets.empty_title') }}</h3>
            <p class="text-gray-500 mt-2 mb-6">{{ i18n.t('tickets.empty_sub') }}</p>
            <UButton to="/" color="purple" variant="outline">{{ i18n.t('tickets.explore') }}</UButton>
         </div>

         <div v-else class="space-y-6">
            <!-- Agrupació per Esdeveniment: Millora la modularitat visual mitjançant un acordió. -->
            <div v-for="group in groupedTickets" :key="group.event_nom" class="bg-gray-900 border border-white/10 rounded-2xl overflow-hidden shadow-lg">
               
               <!-- Capçalera de l'Esdeveniment: Resum de la venda. -->
               <div @click="toggleGroup(group.event_nom)" class="flex items-center cursor-pointer hover:bg-white/5 p-4 transition-colors relative">
                    <div class="w-20 h-14 md:w-24 md:h-16 rounded-lg overflow-hidden flex-shrink-0 relative bg-gray-800 border border-white/10">
                        <img :src="group.tickets[0].event_imatge || '/img/concert.webp'" class="w-full h-full object-cover opacity-80" />
                    </div>
                    <div class="ml-4 flex-1 truncate">
                        <h3 class="text-lg md:text-xl font-bold truncate">{{ group.event_nom }}</h3>
                        <p class="text-[0.65rem] md:text-xs text-gray-400 mt-1 flex items-center gap-1.5">
                            <UIcon name="i-heroicons-calendar" class="w-3 h-3"/> 
                            {{ new Date(group.tickets[0].event_data).toLocaleDateString() }}
                        </p>
                    </div>
                    <div class="flex items-center gap-4 border-l border-white/10 pl-4 ml-2">
                        <span class="text-purple-400 font-bold bg-purple-500/10 px-2 py-0.5 border border-purple-500/20 rounded text-xs">
                            {{ group.tickets.length }} entrades
                        </span>
                        <UIcon :name="expandedGroup === group.event_nom ? 'i-heroicons-chevron-up' : 'i-heroicons-chevron-down'" class="w-6 h-6 text-gray-500" />
                    </div>
               </div>
               
               <!-- Detall de les Entrades: Generació de codis QR per a la validació física. -->
               <div v-show="expandedGroup === group.event_nom" class="p-4 border-t border-white/5 bg-gray-950/80">
                  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      <div v-for="ticket in group.tickets" :key="ticket.id" class="flex bg-gray-900 rounded-lg overflow-hidden border border-white/10 shadow-sm relative">
                         <div class="w-1.5 bg-purple-600"></div>
                         <div class="flex-1 p-2.5 flex justify-between items-center">
                             <div>
                                 <span class="text-[0.5rem] uppercase tracking-widest px-1.5 py-0.5 rounded font-bold text-purple-400 bg-purple-500/10 border border-purple-500/20">
                                     {{ ticket.categoria }}
                                 </span>
                                 <div class="mt-1 flex items-baseline gap-1.5">
                                     <span class="text-[0.65rem] text-gray-500">Fila</span>
                                     <span class="text-sm font-bold text-gray-200">{{ ticket.fila }}</span>
                                     <span class="text-sm font-bold text-gray-200 ml-1">Nº {{ ticket.numero }}</span>
                                 </div>
                             </div>
                         </div>
                         <!-- Generador de QR dinàmic mitjançant API externa (Separació de serveis de presentació). -->
                         <div class="p-2 bg-gray-800/50 border-l border-dashed border-white/5 flex flex-col items-center justify-center">
                              <div class="w-10 h-10 bg-white p-0.5 rounded">
                                   <img :src="`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=TIX-${ticket.id}&color=000000`" class="w-full h-full" />
                              </div>
                         </div>
                      </div>
                  </div>
               </div>
            </div>
         </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useAutenticacioStore } from '@/stores/autenticacio'
import { useI18nStore } from '@/stores/i18n'

const config = useRuntimeConfig()
const auth = useAutenticacioStore()
const i18n = useI18nStore()

const tickets = ref([])
const pending = ref(false)
const expandedGroup = ref(null)

const toggleGroup = (event_nom) => {
    expandedGroup.value = expandedGroup.value === event_nom ? null : event_nom
}

/**
 * Recupera l'historial d'entrades del client en sessió.
 */
const fetchMyTickets = async () => {
    if (!auth.user) return;
    pending.value = true
    try {
        const response = await $fetch(`${config.public.socketUrl}/api/user/tickets`)
        tickets.value = response
    } catch(err) {
        console.error("Error recuperant l'historial d'entrades.")
    } finally {
        pending.value = false
    }
}

onMounted(() => {
    i18n.init()
    if (auth.user) fetchMyTickets()
})

// Vigilant reactiu: Si l'usuari fa login/logout, actualitzem el llistat.
watch(() => auth.user, (newVal) => {
    if (newVal) fetchMyTickets()
    else tickets.value = []
})

/**
 * Agrupa els bitllets per esdeveniment per a una presentació més modular i llegible.
 */
const groupedTickets = computed(() => {
    const map = {}
    tickets.value.forEach(t => {
        if (!map[t.event_nom]) map[t.event_nom] = { event_nom: t.event_nom, tickets: [] }
        map[t.event_nom].tickets.push(t)
    })
    return Object.values(map)
})
</script>
