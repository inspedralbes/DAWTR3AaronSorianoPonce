<template>
  <div class="min-h-screen bg-gray-950 text-white font-sans flex flex-col">
    <!-- Header Admin Supervisor -->
    <header class="border-b border-white/10 bg-gray-900/80 backdrop-blur-lg sticky top-0 z-50 flex items-center justify-between px-6 py-4">
      <div class="flex items-center gap-4">
        <NuxtLink to="/admin" class="text-blue-400 hover:text-blue-300 flex items-center gap-2 transition-colors">
            <UIcon name="i-heroicons-arrow-left" class="w-5 h-5"/> Panell de Control
        </NuxtLink>
        <div class="h-6 w-px bg-white/10"></div>
        <h1 class="font-bold text-lg text-gray-300" v-if="event">Monitoratge: <span class="text-white">{{ event.nom }}</span></h1>
      </div>
      <div class="flex items-center gap-4">
         <div class="flex items-center gap-2 bg-blue-900/30 px-4 py-1.5 rounded-full border border-blue-500/30">
             <span class="relative flex h-3 w-3">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span class="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
            </span>
            <span class="text-xs font-mono text-blue-300 uppercase tracking-widest font-bold">Mode Radar (Lectura)</span>
         </div>
      </div>
    </header>

    <main class="flex-1 flex overflow-hidden">
      <!-- Contingut Principal (Mapa de seients ampliat) -->
      <section class="flex-1 p-8 overflow-auto relative custom-scrollbar flex flex-col">
        <!-- background fx -->
        <div class="absolute inset-0 bg-radial-gradient from-blue-900/10 to-transparent pointer-events-none"></div>

        <div class="w-full max-w-7xl mx-auto px-2 flex-1 flex flex-col justify-center">
             <div class="text-center mb-10">
                 <div class="w-full h-4 bg-gradient-to-r from-gray-700 via-gray-500 to-gray-700 rounded-full mb-4 shadow-[0_0_20px_rgba(255,255,255,0.1)] relative overflow-hidden">
                     <div class="absolute inset-0 bg-white/10 animate-pulse"></div>
                 </div>
                 <span class="text-sm font-mono text-gray-500 tracking-widest uppercase">Escenari Central</span>
             </div>

             <!-- Mapa Seients -->
             <div class="space-y-6">
                 <div v-for="(seientsFila, filaName) in seientsPerFila" :key="filaName" class="flex justify-center flex-nowrap gap-1 md:gap-[5px] items-center w-full pb-2">
                    <div class="flex-shrink-0 w-12 text-right mr-1 flex flex-col justify-center">
                        <span class="text-gray-500 font-bold text-lg leading-none">{{ filaName }}</span>
                    </div>
                    
                    <div 
                        v-for="seient in seientsFila" 
                        :key="seient.id"
                        class="flex-shrink-0 w-6 h-7 md:w-7 md:h-8 rounded-t px-0.5 flex items-center justify-center font-bold text-[0.6rem] transition-all transform relative ring-1 ring-inset ring-white/10 cursor-default"
                        :class="{
                            'bg-gray-800': seient.estat === 'Lliure',
                            'bg-yellow-500/80 ring-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.5)]': seient.estat === 'Reservat',
                            'bg-blue-600 text-white shadow-[0_0_10px_rgba(37,99,235,0.5)] border-blue-400': seient.estat === 'Venut'
                        }"
                        :title="`ID: ${seient.id} | Estat: ${seient.estat}`"
                    >
                        {{ seient.numero }}
                    </div>
                    
                    <div class="flex-shrink-0 w-12 text-left ml-1 hidden lg:flex flex-col justify-center">
                        <span class="text-gray-500 font-bold text-lg leading-none">{{ filaName }}</span>
                    </div>
                 </div>
             </div>

             <!-- Llegenda Admin -->
             <div class="mt-16 flex justify-center gap-8 flex-wrap text-sm text-gray-400 bg-gray-900/50 py-4 px-8 rounded-full border border-white/5 mx-auto">
                <div class="flex items-center gap-2"><div class="w-4 h-4 bg-gray-800 rounded"></div> Lliure</div>
                <div class="flex items-center gap-2"><div class="w-4 h-4 bg-yellow-500/80 rounded shadow-[0_0_10px_rgba(234,179,8,0.5)]"></div> En procés de pagament (Reservat)</div>
                <div class="flex items-center gap-2"><div class="w-4 h-4 bg-blue-600 border border-blue-400 rounded shadow-[0_0_10px_rgba(37,99,235,0.5)]"></div> Venut Permanentment</div>
             </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { io } from 'socket.io-client'

const config = useRuntimeConfig()
const route = useRoute()
const eventId = route.params.id

const { data: event } = useFetch(`${config.public.socketUrl}/api/events/${eventId}`)

const rawSeats = ref([])
let socket = null

onMounted(() => {
    socket = io(config.public.socketUrl)
    
    // Connectar-se a la mateixa sala de l'esdeveniment que els usuaris
    socket.emit('join_event', eventId)

    socket.on('init_seats', (seats) => {
        rawSeats.value = seats
    })

    socket.on('seat_updated', (data) => {
        const idx = rawSeats.value.findIndex(s => s.id == data.id)
        if (idx !== -1) {
            rawSeats.value[idx].estat = data.estat
        } else {
            // Si no s'ha carregat trigarà al requery
        }
    })
})

onUnmounted(() => {
    if (socket) socket.disconnect()
})

// Agrupació per files
const seientsPerFila = computed(() => {
    const list = rawSeats.value || []
    const groups = {}
    list.forEach(item => {
        if (!groups[item.fila]) groups[item.fila] = [];
        groups[item.fila].push(item);
    })
    Object.keys(groups).forEach(fila => {
        groups[fila].sort((a,b) => a.numero - b.numero)
    })
    return groups
})
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
</style>
