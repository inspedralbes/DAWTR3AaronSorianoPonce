<template>
  <div class="min-h-screen bg-gray-950 text-white font-sans p-8">
    <div class="max-w-7xl mx-auto">
      <!-- Capçalera del panell: Gestió d'esdeveniments i navegació. -->
      <header class="flex justify-between items-center mb-10">
        <div>
           <h1 class="text-3xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">Panell d'Administració</h1>
           <p class="text-gray-400 text-sm mt-1">Visió global en temps real de vendes, clients i sistema operatiu.</p>
        </div>
        <div class="flex items-center gap-4">
           <UButton @click="showCreateModal = true" color="blue" size="lg" icon="i-heroicons-plus">Crear Esdeveniment</UButton>
           <NuxtLink to="/" class="text-gray-400 hover:text-white transition-colors bg-gray-900 border border-white/10 px-4 py-2 flex items-center h-[38px] rounded-lg text-sm">Tornar al Web</NuxtLink>
        </div>
      </header>

      <div v-if="pending" class="flex justify-center p-10"><div class="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div></div>
      <div v-else>
        <!-- Resum de Kpis: Mètriques de negoci aglutinades per a l'administrador. -->
        <div class="grid grid-cols-2 md:grid-cols-5 gap-4 mb-12">
            <!-- Estat de seients i ingressos recaptats. -->
            <div v-for="stat in statsList" :key="stat.label" class="bg-gray-900 border border-white/5 rounded-2xl p-6 relative overflow-hidden group">
                <div :class="['absolute inset-0 transition-colors', stat.bgClass]"></div>
                <div class="relative z-10">
                    <h3 class="text-gray-400 text-[0.65rem] uppercase tracking-widest font-medium mb-1">{{ stat.label }}</h3>
                    <div :class="['text-4xl font-extrabold', stat.textClass]">{{ stat.value }}<span v-if="stat.isEuro" class="text-xl ml-1">€</span></div>
                </div>
            </div>
        </div>

        <!-- Monitoratge de Sales i Historial de Transaccions. -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            <div class="lg:col-span-2">
                <h2 class="text-xl font-bold mb-4 flex items-center gap-2"><UIcon name="i-heroicons-building-office" /> Monitoratge de Sales</h2>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <!-- Targeta d'Estat per Esdeveniment amb barra de progrés d'ocupació. -->
                    <div v-for="ev in eventStats" :key="ev.id" @click="router.push('/admin/esdeveniment/' + ev.id)" class="bg-gray-900 border border-white/5 rounded-xl flex overflow-hidden cursor-pointer hover:border-blue-500/50 hover:shadow-[0_0_15px_rgba(59,130,246,0.2)] transition-all group relative">
                        <button @click.stop="deleteEvent(ev.id, ev.nom)" class="absolute top-2 right-2 flex items-center justify-center p-1.5 bg-red-500/20 text-red-500 hover:bg-red-500 hover:text-white rounded transition-colors opacity-0 group-hover:opacity-100 z-10" title="Eliminar totalment l'Esdeveniment">
                            <UIcon name="i-heroicons-trash" class="w-4 h-4" />
                        </button>
                        <div class="w-24 bg-gray-800 relative">
                            <img :src="ev.imatge || '/img/concert.webp'" class="w-full h-full object-cover opacity-80" />
                            <div class="absolute inset-0 bg-gradient-to-r from-transparent to-gray-900"></div>
                        </div>
                        <div class="p-4 flex-1">
                            <span class="text-[0.6rem] uppercase tracking-widest text-blue-400 font-bold">{{ ev.tag }}</span>
                            <h4 class="font-bold mb-3 truncate" :title="ev.nom">{{ ev.nom }}</h4>
                            <div class="w-full h-1.5 bg-gray-800 rounded-full mb-1">
                                <div class="h-full bg-blue-500 rounded-full" :style="{ width: ev.ocupacio + '%' }"></div>
                            </div>
                            <div class="flex justify-between text-xs text-gray-500">
                                <span>{{ ev.ocupacio }}% ocupat</span>
                                <span>{{ ev.venuts }}/{{ ev.aforament }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Columna d'Informes i Clients: Separació clara de la informació analítica. -->
            <div class="lg:col-span-1 space-y-8">
                <div>
                    <h2 class="text-xl font-bold mb-4 flex items-center gap-2"><UIcon name="i-heroicons-chart-pie" /> Resum Finances</h2>
                    <div class="bg-gray-900 border border-white/5 rounded-xl p-5">
                        <ul v-if="reports && reports.categories" class="space-y-4 divide-y divide-white/5">
                            <li v-for="cat in reports.categories" :key="cat.categoria" class="pt-2 first:pt-0">
                                <div class="flex justify-between items-center mb-1">
                                    <div class="font-bold text-sm text-gray-200">{{ cat.categoria }}</div>
                                    <div class="font-bold text-purple-400">{{ cat.total_recapte }}€</div>
                                </div>
                                <div class="text-xs text-gray-500">{{ cat.entrades_venudes }} entrades venudes</div>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>

    <!-- Mòdul de Creació d'Esdeveniments: Formulari per gestionar l'inventari comercial. -->
    <UModal v-model="showCreateModal">
       <div class="p-8">
           <h3 class="text-2xl font-bold mb-4">Nou Esdeveniment</h3>
           <p class="text-sm text-gray-400 mb-6">El sistema generarà la sala automàticament a la base de dades a partir d'aquests paràmetres.</p>
           <form @submit.prevent="submitCreateEvent" class="space-y-4">
              <div class="grid grid-cols-2 gap-4">
                 <div class="col-span-2">
                     <label class="text-xs text-gray-400 block mb-1">Nom de l'Esdeveniment</label>
                     <input v-model="newEvent.nom" required class="w-full bg-gray-950 border border-white/10 rounded-lg px-4 py-2" />
                 </div>
                 <div class="col-span-2">
                     <label class="text-xs text-gray-400 block mb-1">Descripció</label>
                     <textarea v-model="newEvent.descripcio" rows="2" required class="w-full bg-gray-950 border border-white/10 rounded-lg px-4 py-2"></textarea>
                 </div>
                 <div>
                     <label class="text-xs text-gray-400 block mb-1">Dia i Hora</label>
                     <input v-model="newEvent.data" type="datetime-local" required class="w-full bg-gray-950 border border-white/10 rounded-lg px-4 py-2" />
                 </div>
                 <div>
                     <label class="text-xs text-gray-400 block mb-1">Preu General (€)</label>
                     <input v-model="newEvent.preuGeneral" type="number" required class="w-full bg-gray-950 border border-white/10 rounded-lg px-4 py-2" />
                 </div>
              </div>
              <UButton type="submit" block color="blue" size="lg" :loading="isCreating">Generar Sala i Publicar</UButton>
           </form>
       </div>
    </UModal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRuntimeConfig, useToast } from '#imports'

const config = useRuntimeConfig()
const router = useRouter()
const toast = useToast()

const stats = ref({ lliures: 0, venuts: 0, reservats: 0, recaptacio: 0 })
const eventStats = ref([])
const reports = ref(null)
const pending = ref(true)
let timer

/**
 * Organització de les dades per al renderitzat reactiu de la part superior.
 */
const statsList = computed(() => [
    { label: 'Venuts', value: stats.value.venuts, bgClass: 'bg-indigo-500/5', textClass: 'text-indigo-400' },
    { label: 'Bloquejats', value: stats.value.reservats, bgClass: 'bg-yellow-500/5', textClass: 'text-yellow-400' },
    { label: 'Lliures', value: stats.value.lliures, bgClass: 'bg-green-500/5', textClass: 'text-green-400' },
    { label: 'Ingressos', value: Number(stats.value.recaptacio).toLocaleString(), bgClass: 'bg-purple-500/5', textClass: 'text-purple-400', isEuro: true }
])

const showCreateModal = ref(false)
const isCreating = ref(false)
const newEvent = ref({
    nom: '', descripcio: '', data: '', imatge: '/img/teatre.webp', tag: 'TEATRE',
    preuGeneral: 45, preuVip: 90, files: 10, numSeientsPerFila: 30
})

/**
 * Recupera l'estat actual de tota la plataforma des del backend d'administració.
 */
const fetchStats = async () => {
    try {
        const [globalStats, events, rep] = await Promise.all([
            $fetch(`${config.public.socketUrl}/api/admin/stats`),
            $fetch(`${config.public.socketUrl}/api/admin/events-stats`),
            $fetch(`${config.public.socketUrl}/api/admin/reports`)
        ])
        stats.value = globalStats
        eventStats.value = events
        reports.value = rep
    } catch(err) {
        console.error("Error en la càrrega de dades d'administració.")
    } finally {
        pending.value = false
    }
}

onMounted(() => {
    fetchStats()
    // Implementació de "Polling" per actualitzar el panell cada 3 segons.
    timer = setInterval(fetchStats, 3000)
})

onUnmounted(() => {
    if (timer) clearInterval(timer)
})

const submitCreateEvent = async () => {
    isCreating.value = true
    try {
        await $fetch(`${config.public.socketUrl}/api/admin/events`, {
            method: 'POST',
            body: newEvent.value
        })
        showCreateModal.value = false
        fetchStats()
        toast.add({ title: 'Configuració realitzada', icon: 'i-heroicons-check-circle', color: 'green' })
    } finally {
        isCreating.value = false
    }
}
</script>
