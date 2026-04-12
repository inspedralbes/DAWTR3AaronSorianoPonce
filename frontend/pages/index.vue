<template>
  <div class="min-h-screen bg-gray-950 text-white font-sans selection:bg-purple-500/30">
    <CapcaleraWeb transparent />
    
    <main class="max-w-7xl mx-auto px-4 py-12">
      <!-- Hero Section -->
      <section class="mb-16 relative">
          <div class="absolute inset-0 bg-purple-500/20 blur-[100px] rounded-full pointer-events-none"></div>
          <h2 class="text-5xl lg:text-7xl font-extrabold tracking-tight mb-4 relative z-10">{{ i18n.t('home.hero_title') }}</h2>
          <p class="text-xl text-gray-400 max-w-2xl relative z-10">{{ i18n.t('home.hero_subtitle') }}</p>
      </section>

      <!-- Events list -->
      <h3 class="text-2xl font-semibold mb-6 flex items-center gap-2">
        <span class="w-2 h-6 bg-purple-500 rounded-sm inline-block"></span>
        {{ i18n.t('home.events_title') }}
      </h3>
      
      <div v-if="pending" class="flex gap-4 p-8 justify-center">
         <div class="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
      
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div v-for="event in events" :key="event.id" class="group relative bg-gray-900 border border-white/5 rounded-2xl overflow-hidden hover:border-purple-500/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(168,85,247,0.3)] hover:-translate-y-1 block flex flex-col cursor-pointer" @click="goToEvent(event.id)">
          <div class="h-56 relative overflow-hidden">
            <!-- Imatge dinàmica via src -->
            <img :src="event.imatge || '/img/concert.webp'" class="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 opacity-80 group-hover:opacity-100" />
            
            <div class="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/20 to-transparent"></div>
            
            <div class="absolute top-4 right-4">
                <span class="px-3 py-1 bg-purple-600/90 backdrop-blur-md rounded-full text-[0.65rem] font-extrabold uppercase tracking-widest text-white shadow-lg">{{ event.tag }}</span>
            </div>
          </div>
          <div class="p-6 flex-1 flex flex-col">
            <h4 class="text-xl font-bold mb-3 group-hover:text-purple-400 transition-colors leading-tight">{{ event.nom }}</h4>
            <p class="text-gray-400 text-sm mb-4 line-clamp-3 leading-relaxed flex-1">{{ event.descripcio }}</p>
            <div class="flex justify-between items-center mt-auto pt-4 border-t border-white/5">
              <div class="text-sm text-gray-500 font-mono font-medium flex items-center gap-2">
                 <UIcon name="i-heroicons-calendar" class="w-4 h-4" />
                 {{ new Date(event.data).toLocaleDateString() }}
              </div>
              <UIcon name="i-heroicons-arrow-right" class="w-5 h-5 text-purple-500 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useI18nStore } from '@/stores/i18n'
import { onMounted } from 'vue'

const config = useRuntimeConfig()
const router = useRouter()
const i18n = useI18nStore()

onMounted(() => i18n.init())

const { data: events, pending } = useFetch(`${config.public.socketUrl}/api/events`)

const goToEvent = (id) => {
    router.push(`/esdeveniment/${id}`)
}
</script>


