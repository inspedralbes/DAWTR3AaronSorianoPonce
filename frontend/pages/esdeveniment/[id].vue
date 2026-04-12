<template>
  <div class="min-h-screen bg-gray-950 text-white font-sans flex flex-col">
    <!-- Header Temps Real -->
    <CapcaleraWeb>
       <template #left>
        <NuxtLink to="/" class="text-gray-400 hover:text-white flex items-center gap-2 transition-colors mr-4">
            <UIcon name="i-heroicons-arrow-left" class="w-5 h-5"/> Tornar
        </NuxtLink>
        <div class="h-6 w-px bg-white/10 hidden sm:block"></div>
        <h1 class="font-bold text-lg ml-4 truncate max-w-xs" v-if="event">{{ event.nom }}</h1>
       </template>
       <template #center>
         <div class="flex items-center gap-2 bg-gray-800 px-3 py-1.5 rounded-full border border-white/5 mx-auto">
             <span class="relative flex h-3 w-3">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span class="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
            <span class="text-xs font-mono text-gray-300">Live</span>
         </div>
       </template>
    </CapcaleraWeb>

    <main class="flex-1 flex overflow-hidden">
      <!-- Contingut Principal (Mapa de seients) -->
      <section class="flex-1 p-8 overflow-auto relative custom-scrollbar">
        <!-- background fx -->
        <div class="absolute inset-0 bg-radial-gradient from-purple-900/10 to-transparent pointer-events-none"></div>

        <div class="w-full max-w-7xl mx-auto px-2">
             <div class="text-center mb-10">
                 <div class="w-full h-4 bg-gradient-to-r from-gray-700 via-gray-500 to-gray-700 rounded-full mb-4 shadow-[0_0_20px_rgba(255,255,255,0.1)] relative overflow-hidden">
                     <div class="absolute inset-0 bg-white/10 animate-pulse"></div>
                 </div>
                 <span class="text-sm font-mono text-gray-500 tracking-widest uppercase">Escenari</span>
             </div>

             <!-- Mapa Seients -->
             <div class="space-y-6">
                <!-- Agrupats per Fila -->
                 <div v-for="(seientsFila, filaName) in seientsPerFila" :key="filaName" class="flex justify-center flex-nowrap gap-1 md:gap-[5px] items-center w-full pb-2">
                    <div class="flex-shrink-0 w-12 text-right mr-1 flex flex-col justify-center">
                        <span class="text-gray-500 font-bold text-lg leading-none">{{ filaName }}</span>
                        <span class="text-[0.65rem] font-mono text-purple-400 font-bold">{{ preuPerFila(seientsFila) }}€</span>
                    </div>
                    
                    <button 
                        v-for="seient in seientsFila" 
                        :key="seient.id"
                        @click="toggleSeat(seient.id)"
                        class="flex-shrink-0 w-6 h-7 md:w-7 md:h-8 rounded-t px-0.5 flex items-center justify-center font-bold text-[0.6rem] transition-all duration-300 transform relative ring-1 ring-inset ring-white/10"
                        :class="{
                            'bg-gray-800 hover:bg-gray-700 hover:-translate-y-1 cursor-pointer': seient.estat === 'Lliure',
                            'bg-purple-600 shadow-[0_0_10px_rgba(168,85,247,0.5)] border-purple-400 scale-110 z-10 text-white cursor-pointer': isMySeat(seient.id),
                            'bg-yellow-500/50 cursor-not-allowed opacity-80 ring-yellow-500': seient.estat === 'Reservat' && !isMySeat(seient.id),
                            'bg-gray-900 text-gray-700 opacity-40 cursor-not-allowed': seient.estat === 'Venut'
                        }"
                        :disabled="seient.estat !== 'Lliure' && !isMySeat(seient.id)"
                        :title="`${seient.categoria} - ${seient.preu}€ (Seient ${seient.numero})`"
                    >
                        {{ seient.numero }}
                    </button>
                    
                    <div class="flex-shrink-0 w-12 text-left ml-1 hidden lg:flex flex-col justify-center">
                        <span class="text-gray-500 font-bold text-lg leading-none">{{ filaName }}</span>
                        <span class="text-[0.65rem] font-mono text-purple-400 font-bold">{{ preuPerFila(seientsFila) }}€</span>
                    </div>
                 </div>
             </div>

             <!-- Llegenda -->
             <div class="mt-16 flex justify-center gap-8 flex-wrap text-sm text-gray-400">
                <div class="flex items-center gap-2"><div class="w-4 h-4 bg-gray-800 rounded"></div> Lliure</div>
                <div class="flex items-center gap-2"><div class="w-4 h-4 bg-purple-600 rounded"></div> La teva reserva</div>
                <div class="flex items-center gap-2"><div class="w-4 h-4 bg-yellow-500/50 rounded"></div> En procés per altre</div>
                <div class="flex items-center gap-2"><div class="w-4 h-4 bg-gray-900 border border-white/5 rounded"></div> Venut</div>
             </div>
        </div>
      </section>

      <!-- Sidebar Reserva -->
      <aside class="w-full md:w-96 bg-gray-900 border-l border-white/10 p-6 flex flex-col shadow-2xl z-20 transition-transform">
         <h3 class="text-xl font-bold mb-6">La teva Selecció</h3>
         
         <div v-if="selectedSeatsDetails.length === 0" class="flex-1 flex flex-col items-center justify-center text-gray-500 text-center">
            <UIcon name="i-heroicons-ticket" class="w-16 h-16 mb-4 opacity-20"/>
            <p>Selecciona seients al plànol per començar la teva reserva.</p>
         </div>

         <div v-else class="flex-1 flex flex-col">
            <div class="space-y-4 flex-1 overflow-auto custom-scrollbar pr-2">
                <div v-for="seat in selectedSeatsDetails" :key="seat.id" class="p-4 bg-gray-800/50 border border-purple-500/30 rounded-xl relative overflow-hidden group">
                    <div class="absolute left-0 top-0 bottom-0 w-1 bg-purple-500"></div>
                    <div class="flex justify-between items-start mb-2">
                        <div>
                            <span class="text-xs text-purple-400 font-bold uppercase tracking-wider">{{ seat.categoria }}</span>
                            <div class="font-bold text-lg mt-1">Fila {{ seat.fila }} - Seient {{ seat.numero }}</div>
                        </div>
                        <div class="text-lg font-mono">{{ seat.preu }}€</div>
                    </div>
                    <div class="flex justify-between items-center text-xs text-gray-400 mt-4 border-t border-white/10 pt-2">
                        <div class="flex items-center gap-1 text-yellow-500">
                           <UIcon name="i-heroicons-clock" class="w-4 h-4"/>
                           <CompteEnrere :expiresAt="seat.expiresAt" />
                        </div>
                        <button @click="toggleSeat(seat.id)" class="text-red-400 hover:text-red-300 transition-colors">Alliberar</button>
                    </div>
                </div>
            </div>

            <div class="mt-6 border-t border-white/10 pt-6">
               <div class="flex justify-between items-center mb-6 text-xl font-bold">
                   <span>Total</span>
                   <span class="text-purple-400">{{ store.totalPrice.toFixed(2) }}€</span>
               </div>
               
               <div v-if="auth.user" class="space-y-4">
                   <div class="bg-gray-800/80 border border-white/10 p-3 flex items-center justify-between rounded-lg">
                       <div>
                           <div class="text-xs text-gray-400">Sessió Activa:</div>
                           <div class="text-sm font-bold">{{ auth.user.nom }}</div>
                           <div class="text-xs text-purple-400">{{ auth.user.email }}</div>
                       </div>
                       <UIcon name="i-heroicons-check-circle" class="w-8 h-8 text-green-500"/>
                   </div>
                   
                   <UButton @click="handleCheckout" size="xl" block color="purple" :loading="isBuying" :disabled="selectedSeatsDetails.length === 0">
                       Reservar i Pagar amb Targeta
                   </UButton>
               </div>
               <div v-else class="text-center p-4 bg-gray-950 rounded-lg border border-white/5 space-y-4">
                   <p class="text-sm text-gray-400">Has d'identificar-te com a client per poder vincular formalment les teves reserves.</p>
                   <UButton @click="auth.openLoginModal()" size="lg" block color="gray" variant="solid" :disabled="selectedSeatsDetails.length === 0">
                       Identifica't per comprar
                   </UButton>
               </div>
            </div>
         </div>
      </aside>
    </main>

    <!-- Modal Èxit -->
    <UModal v-model="showSuccess">
      <div class="p-8 text-center">
        <div class="w-20 h-20 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <UIcon name="i-heroicons-check" class="w-10 h-10"/>
        </div>
        <h3 class="text-2xl font-bold mb-2">Compra Confirmada!</h3>
        <p class="text-gray-400 mb-8">Les teves entrades s'han reservat correctament. Rebràs un email amb el codi QR ben aviat.</p>
        <UButton color="gray" variant="solid" block @click="router.push('/')">Tornar a l'inici</UButton>
      </div>
    </UModal>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useEntradesStore } from '@/stores/entrades'
import { useAutenticacioStore } from '@/stores/autenticacio'
import CompteEnrere from '@/components/CompteEnrere.vue'

const config = useRuntimeConfig()
const route = useRoute()
const router = useRouter()
const store = useEntradesStore()
const auth = useAutenticacioStore()

const eventId = route.params.id
const { data: event } = useFetch(`${config.public.socketUrl}/api/events/${eventId}`)

const isBuying = ref(false)
const showSuccess = ref(false)

onMounted(() => {
    store.joinEvent(eventId)
})

onUnmounted(() => {
    // Si marxa de la pàgina podríem fer un clean up d'id, però ja es fa a nivell socket on disconnect
})

const isMySeat = (seatId) => {
    return store.selectedSeats.includes(seatId)
}

const toggleSeat = (seatId) => {
    store.toggleSeat(seatId, eventId)
}

// Agrupació per files
const seientsPerFila = computed(() => {
    const list = store.seats || []
    const groups = {}
    list.forEach(item => {
        if (!groups[item.fila]) groups[item.fila] = [];
        groups[item.fila].push(item);
    })
    // Ordenar per número dinte la fila
    Object.keys(groups).forEach(fila => {
        groups[fila].sort((a,b) => a.numero - b.numero)
    })
    return groups
})

const preuPerFila = (seients) => {
    if (seients && seients.length > 0) {
        // Assegurem retornar-ho net en format decimal si cal
        return parseFloat(seients[0].preu).toFixed(2);
    }
    return 0;
}

const selectedSeatsDetails = computed(() => {
    return store.selectedSeats.map(id => store.seats.find(s => s.id === id)).filter(Boolean)
})

const handleCheckout = async () => {
    if (!auth.user) {
        auth.openLoginModal()
        return
    }
    
    isBuying.value = true
    try {
        await store.proceedToBuy(eventId, auth.user)
        showSuccess.value = true
    } catch(err) {
        alert("S'ha produït un error en la compra, potser el temps ha expirat.")
    } finally {
        isBuying.value = false
    }
}
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(168, 85, 247, 0.5);
}
</style>
