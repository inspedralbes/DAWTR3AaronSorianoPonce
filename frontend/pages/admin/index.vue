<template>
  <div class="min-h-screen bg-gray-950 text-white font-sans p-8">
    <div class="max-w-7xl mx-auto">
      <header class="flex justify-between items-center mb-10">
        <div>
           <h1 class="text-3xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">Admin Dashboard</h1>
           <p class="text-gray-400 text-sm mt-1">Visió global en temps real de vendes, clients i sistema operatiu.</p>
        </div>
        <div class="flex items-center gap-4">
           <UButton @click="showCreateModal = true" color="blue" size="lg" icon="i-heroicons-plus">Crear Esdeveniment</UButton>
           <NuxtLink to="/" class="text-gray-400 hover:text-white transition-colors bg-gray-900 border border-white/10 px-4 py-2 flex items-center h-[38px] rounded-lg text-sm">Tornar al Web</NuxtLink>
        </div>
      </header>

      <div v-if="pending" class="flex justify-center p-10"><div class="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div></div>
      <div v-else>
        <!-- Gràfica Numèrica Superior -->
        <div class="grid grid-cols-2 md:grid-cols-5 gap-4 mb-12">
            <!-- Usuaris Connectats Live (Nou) -->
            <div class="bg-gray-900 border border-white/5 rounded-2xl p-6 relative overflow-hidden group">
               <div class="absolute inset-0 bg-blue-500/5 group-hover:bg-blue-500/10 transition-colors"></div>
               <div class="relative z-10">
                   <h3 class="text-gray-400 text-[0.65rem] uppercase tracking-widest font-medium mb-1 flex items-center gap-2">
                       <span class="relative flex h-2 w-2"><span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span><span class="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span></span>
                       Connectats
                   </h3>
                   <div class="text-4xl font-extrabold text-white">{{ usersConnected }}</div>
               </div>
            </div>

            <div class="bg-gray-900 border border-white/5 rounded-2xl p-6 relative overflow-hidden group">
                <div class="absolute inset-0 bg-indigo-500/5 group-hover:bg-indigo-500/10 transition-colors"></div>
                <div class="relative z-10">
                    <h3 class="text-gray-400 text-[0.65rem] uppercase tracking-widest font-medium mb-1">Seients Venuts</h3>
                    <div class="text-4xl font-extrabold text-indigo-400">{{ stats.venuts || 0 }}</div>
                </div>
            </div>
            
            <div class="bg-gray-900 border border-white/5 rounded-2xl p-6 relative overflow-hidden group">
                <div class="absolute inset-0 bg-yellow-500/5 group-hover:bg-yellow-500/10 transition-colors"></div>
                <div class="relative z-10">
                    <h3 class="text-gray-400 text-[0.65rem] uppercase tracking-widest font-medium mb-1">En Curs</h3>
                    <div class="text-4xl font-extrabold text-yellow-400">{{ stats.reservats || 0 }}</div>
                </div>
            </div>

            <div class="bg-gray-900 border border-white/5 rounded-2xl p-6 relative overflow-hidden group">
                <div class="absolute inset-0 bg-green-500/5 group-hover:bg-green-500/10 transition-colors"></div>
                <div class="relative z-10">
                    <h3 class="text-gray-400 text-[0.65rem] uppercase tracking-widest font-medium mb-1">Lliures totals</h3>
                    <div class="text-4xl font-extrabold text-green-400">{{ stats.lliures || 0 }}</div>
                </div>
            </div>

            <div class="bg-gray-900 border border-white/5 rounded-2xl p-6 relative overflow-hidden group">
                <div class="absolute inset-0 bg-purple-500/5 group-hover:bg-purple-500/10 transition-colors"></div>
                <div class="relative z-10 flex flex-col justify-between h-full">
                    <div>
                        <h3 class="text-gray-400 text-[0.65rem] uppercase tracking-widest font-medium mb-1">Ingressos</h3>
                        <div class="text-3xl font-extrabold text-purple-400 flex items-end gap-1">
                            {{ Number(stats.recaptacio).toLocaleString() }} <span class="text-xl text-purple-600 mb-1">€</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            <!-- Columna Esquerra: Estat de les Sales -->
            <div class="lg:col-span-2">
                <h2 class="text-xl font-bold mb-4 flex items-center gap-2"><UIcon name="i-heroicons-building-office" /> Monitoratge de Sales</h2>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div v-for="ev in eventStats" :key="ev.id" @click="router.push('/admin/event/' + ev.id)" class="bg-gray-900 border border-white/5 rounded-xl flex overflow-hidden cursor-pointer hover:border-blue-500/50 hover:shadow-[0_0_15px_rgba(59,130,246,0.2)] transition-all group relative">
                        <!-- Botó per Esborrar Ocult fins hover -->
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
                            <div class="flex justify-between text-xs text-gray-500 mb-3">
                                <span>{{ ev.ocupacio }}% ocupat</span>
                                <span>Aforament: {{ ev.aforament }}</span>
                            </div>

                            <div class="flex gap-4 text-sm mt-3">
                                <div class="flex flex-col">
                                    <span class="text-gray-500 text-xs">Lliures</span>
                                    <span class="font-mono text-green-400 font-bold">{{ ev.lliures }}</span>
                                </div>
                                <div class="flex flex-col text-center">
                                    <span class="text-gray-500 text-xs">Curs</span>
                                    <span class="font-mono text-yellow-400 font-bold">{{ ev.reservats }}</span>
                                </div>
                                <div class="flex flex-col text-right ml-auto">
                                    <span class="text-gray-500 text-xs">Venuts</span>
                                    <span class="font-mono text-blue-400 font-bold">{{ ev.venuts }}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Columna Dreta: Últimes Compres -->
            <div class="lg:col-span-1 space-y-8">
                
                <!-- Bloc 1: Resum -->
                <div>
                    <h2 class="text-xl font-bold mb-4 flex items-center gap-2"><UIcon name="i-heroicons-chart-pie" /> Resum Finances</h2>
                    <div class="bg-gray-900 border border-white/5 rounded-xl p-5 mb-4">
                        <ul v-if="reports && reports.categories && reports.categories.length > 0" class="space-y-4 divide-y divide-white/5">
                            <li v-for="cat in reports.categories" :key="cat.categoria" class="pt-2 first:pt-0">
                                <div class="flex justify-between items-center mb-1">
                                    <div class="font-bold text-sm text-gray-200">{{ cat.categoria }}</div>
                                    <div class="font-bold text-purple-400">{{ cat.total_recapte }}€</div>
                                </div>
                                <div class="text-xs text-gray-500">{{ cat.entrades_venudes }} entrades venudes globalment</div>
                            </li>
                        </ul>
                        <div v-else class="text-center py-4 text-gray-500 text-sm">Cap informe generat.</div>
                    </div>
                </div>

                <!-- Bloc 2: Historial Clients -->
                <div>
                    <h2 class="text-xl font-bold mb-4 flex items-center gap-2"><UIcon name="i-heroicons-users" /> Historial de Clients</h2>
                    <div class="bg-gray-900 border border-white/5 rounded-xl p-4 max-h-[500px] overflow-y-auto custom-scrollbar">
                        <ul v-if="groupedPurchases.length > 0" class="space-y-4 divide-y divide-white/5">
                            <li v-for="g in groupedPurchases" :key="g.id" class="pt-4 first:pt-0">
                                <!-- Header Clicable -->
                                <div class="flex justify-between items-start mb-1 cursor-pointer hover:bg-white/5 p-2 -mx-2 rounded transition-colors group" @click="toggleGroup(g.id)">
                                    <div>
                                        <div class="font-bold text-sm text-gray-200 group-hover:text-blue-400 transition-colors">{{ g.client_nom }}</div>
                                        <div class="text-xs text-gray-500 truncate" style="max-width: 150px;">{{ g.email }}</div>
                                        <div class="text-xs text-blue-400/80 mt-1">🎟 {{ g.event_nom }}</div>
                                    </div>
                                    <div class="flex flex-col items-end gap-1">
                                       <span class="bg-blue-500/10 text-blue-400 text-[0.65rem] px-2 py-0.5 rounded font-bold border border-blue-500/20">
                                           {{ g.tickets.length }} entrades
                                       </span>
                                       <UIcon :name="expandedGroup === g.id ? 'i-heroicons-chevron-up' : 'i-heroicons-chevron-down'" class="w-4 h-4 text-gray-500 transition-transform" />
                                    </div>
                                </div>
                                
                                <!-- Llista Desplegable -->
                                <div v-show="expandedGroup === g.id" class="mt-2 pl-3 border-l-2 border-blue-500/30 space-y-1.5 py-1">
                                    <div v-for="ticket in g.tickets" :key="ticket.id" class="text-[0.65rem] text-gray-400 flex justify-between bg-gray-800/50 p-1.5 rounded pr-3">
                                       <span class="uppercase tracking-widest text-[0.6rem]">{{ ticket.categoria }}</span>
                                       <span class="font-mono text-gray-300">Fila {{ ticket.fila }} · Nº {{ ticket.numero }}</span>
                                    </div>
                                </div>
                            </li>
                        </ul>
                        <div v-else class="text-center py-10 text-gray-500 text-sm">No hi ha cap compra enregistrada.</div>
                    </div>
                </div>
            </div>
        </div>

      </div>
    </div>

    <!-- Modal Confirmació Esborrar -->
    <UModal v-model="showConfirmModal">
        <div class="p-8">
            <div class="flex items-center gap-4 mb-4">
                <div class="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center flex-shrink-0">
                    <UIcon name="i-heroicons-trash" class="w-6 h-6 text-red-500" />
                </div>
                <div>
                    <h3 class="text-xl font-bold">Eliminar Esdeveniment</h3>
                    <p class="text-gray-400 text-sm">Aquesta acció és irreversible</p>
                </div>
            </div>
            <p class="text-gray-300 mb-6 bg-red-500/5 border border-red-500/20 rounded-lg p-4 text-sm">
                Estàs a punt d'eliminar <span class="text-white font-bold">"{{ confirmEventName }}"</span>.<br/>
                S'esborraran tots els seients, categories i compres associades permanentment.
            </p>
            <div class="flex gap-3 justify-end">
                <UButton color="gray" variant="ghost" @click="showConfirmModal = false">Cancel·lar</UButton>
                <UButton color="red" icon="i-heroicons-trash" :loading="isDeleting" @click="confirmDelete">Sí, eliminar</UButton>
            </div>
        </div>
    </UModal>

    <!-- Modal Crear Event -->
    <UModal v-model="showCreateModal">
       <div class="p-8">
           <h3 class="text-2xl font-bold mb-4">Nou Esdeveniment</h3>
           <p class="text-sm text-gray-400 mb-6">En crear l'esdeveniment, el sistema generarà la sala automàticament a la base de dades (categories i seients matrix).</p>
           
           <form @submit.prevent="submitCreateEvent" class="space-y-4">
              <div class="grid grid-cols-2 gap-4">
                 <div class="col-span-2">
                     <label class="text-xs text-gray-400 block mb-1">Nom de l'Esdeveniment</label>
                     <input v-model="newEvent.nom" required class="w-full bg-gray-950 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500" />
                 </div>
                 <div class="col-span-2">
                     <label class="text-xs text-gray-400 block mb-1">URL Imatge</label>
                     <input v-model="newEvent.imatge" required placeholder="/img/teatre.webp" class="w-full bg-gray-950 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500" />
                 </div>
                 <div>
                     <label class="text-xs text-gray-400 block mb-1">Dia i Hora</label>
                     <input v-model="newEvent.data" type="datetime-local" required class="w-full bg-gray-950 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500" />
                 </div>
                 <div>
                     <label class="text-xs text-gray-400 block mb-1">TAG Categoria</label>
                     <input v-model="newEvent.tag" placeholder="MÚSICA" required class="w-full bg-gray-950 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500 uppercase" />
                 </div>
                 <div class="col-span-2">
                     <label class="text-xs text-gray-400 block mb-1">Descripció</label>
                     <textarea v-model="newEvent.descripcio" rows="2" placeholder="Quin és el contingut de l'esdeveniment?" required class="w-full bg-gray-950 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"></textarea>
                 </div>
              </div>

              <div class="my-6 border-t border-white/10 pt-4 grid grid-cols-2 gap-4">
                 <div>
                     <label class="text-xs text-gray-400 block mb-1">Preu General (€)</label>
                     <input v-model="newEvent.preuGeneral" type="number" required class="w-full bg-gray-950 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500" />
                 </div>
                 <div>
                     <label class="text-xs text-gray-400 block mb-1">Preu VIP Frontal (€)</label>
                     <input v-model="newEvent.preuVip" type="number" required class="w-full bg-gray-950 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500" />
                 </div>
                 <div>
                     <label class="text-xs text-yellow-500 block mb-1 font-bold">Total Files (Lletres)</label>
                     <input v-model="newEvent.files" type="number" min="1" max="26" required class="w-full bg-gray-950 border border-yellow-500/30 rounded-lg px-4 py-2 focus:outline-none focus:border-yellow-500" />
                 </div>
                 <div>
                     <label class="text-xs text-yellow-500 block mb-1 font-bold">Seients per Fila</label>
                     <input v-model="newEvent.numSeientsPerFila" type="number" min="1" required class="w-full bg-gray-950 border border-yellow-500/30 rounded-lg px-4 py-2 focus:outline-none focus:border-yellow-500" />
                 </div>
              </div>
              
              <UButton type="submit" block color="blue" size="lg" :loading="isCreating">Generar Sala al Backend</UButton>
           </form>
       </div>
    </UModal>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRuntimeConfig } from '#imports'
import { useToast } from '#imports'
import { io } from 'socket.io-client'

const config = useRuntimeConfig()
const router = useRouter()
const toast = useToast()

const stats = ref({ lliures: 0, venuts: 0, reservats: 0, recaptacio: 0 })
const eventStats = ref([])
const reports = ref(null)
const purchases = ref([])
const pending = ref(true)
let timer

// Socket stats connectats
let socketAdmin = null
const usersConnected = ref(0)
const expandedGroup = ref(null)

const toggleGroup = (id) => {
    if (expandedGroup.value === id) expandedGroup.value = null
    else expandedGroup.value = id
}

const groupedPurchases = computed(() => {
    const groups = {}
    purchases.value.forEach(p => {
        const key = `${p.email}_${p.event_nom}`
        if (!groups[key]) {
            groups[key] = { id: key, client_nom: p.client_nom, email: p.email, event_nom: p.event_nom, tickets: [] }
        }
        groups[key].tickets.push(p)
    })
    return Object.values(groups)
})

const showCreateModal = ref(false)
const isCreating = ref(false)
const newEvent = ref({
    nom: '', descripcio: '', data: '', imatge: '/img/teatre.webp', tag: 'TEATRE',
    preuGeneral: 45, preuVip: 90, files: 10, numSeientsPerFila: 30
})

const fetchStats = async () => {
    try {
        const [globalStats, events, rep, sales] = await Promise.all([
            $fetch(`${config.public.socketUrl}/api/admin/stats`),
            $fetch(`${config.public.socketUrl}/api/admin/events-stats`),
            $fetch(`${config.public.socketUrl}/api/admin/reports`),
            $fetch(`${config.public.socketUrl}/api/admin/purchases`)
        ])
        stats.value = globalStats
        eventStats.value = events
        reports.value = rep
        purchases.value = sales
    } catch(err) {
        console.error(err)
    } finally {
        pending.value = false
    }
}

const submitCreateEvent = async () => {
    isCreating.value = true
    try {
        await $fetch(`${config.public.socketUrl}/api/admin/events`, {
            method: 'POST',
            body: newEvent.value
        })
        showCreateModal.value = false
        fetchStats()
        toast.add({ title: 'Sala creada!', description: `"${newEvent.value.nom}" ja és visible a la plataforma.`, icon: 'i-heroicons-check-circle', color: 'green', timeout: 4000 })
        newEvent.value = { nom: '', descripcio: '', data: '', imatge: '/img/teatre.webp', tag: 'TEATRE', preuGeneral: 45, preuVip: 90, files: 10, numSeientsPerFila: 30 }
    } catch(err) {
        toast.add({ title: 'Error en crear la sala', description: err?.data?.error || err.message, icon: 'i-heroicons-x-circle', color: 'red', timeout: 5000 })
    } finally {
        isCreating.value = false
    }
}

// Confirm modal per esborrar
const showConfirmModal = ref(false)
const confirmEventName = ref('')
const confirmEventId = ref(null)
const isDeleting = ref(false)

const deleteEvent = (id, nom) => {
    confirmEventId.value = id
    confirmEventName.value = nom
    showConfirmModal.value = true
}

const confirmDelete = async () => {
    isDeleting.value = true
    try {
        await $fetch(`${config.public.socketUrl}/api/admin/events/${confirmEventId.value}`, { method: 'DELETE' })
        showConfirmModal.value = false
        fetchStats()
        toast.add({ title: 'Esdeveniment eliminat', description: `"${confirmEventName.value}" ha estat esborrat correctament.`, icon: 'i-heroicons-trash', color: 'orange', timeout: 4000 })
    } catch(err) {
        toast.add({ title: 'Error en eliminar', description: err?.data?.error || err.message, icon: 'i-heroicons-x-circle', color: 'red', timeout: 5000 })
    } finally {
        isDeleting.value = false
    }
}

onMounted(() => {
    fetchStats()
    timer = setInterval(fetchStats, 3000)
    
    socketAdmin = io(config.public.socketUrl)
    socketAdmin.on('users_count', (count) => {
        usersConnected.value = count
    })
})

onUnmounted(() => {
    if (timer) clearInterval(timer)
    if (socketAdmin) socketAdmin.disconnect()
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
