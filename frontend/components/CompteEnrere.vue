<template>
  <!-- Component especialitzat per mostrar el temps restant de reserva. -->
  <span>{{ formattedTime }}</span>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

// Rep la data d'expiració com a prop per ser un component pur i reutilitzable.
const props = defineProps({
  expiresAt: { type: [String, Number, Date], required: true }
})

const now = ref(Date.now())
let timer = null

// Calcula els mil·lisegons que falten fins a l'expiració.
const timeLeft = computed(() => {
  const expiry = new Date(props.expiresAt).getTime()
  const diff = expiry - now.value
  return diff > 0 ? diff : 0
})

/**
 * Transforma el temps restant en un format llegible "MM:SS".
 * Centralitza la lògica de presentació del comptador.
 */
const formattedTime = computed(() => {
  const totalSeconds = Math.floor(timeLeft.value / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
})

onMounted(() => {
  // Inicialitzem el rellotge intern cada segon per actualitzar la visualització.
  timer = setInterval(() => {
    now.value = Date.now()
  }, 1000)
})

onUnmounted(() => {
  // Alliberem els recursos del temporitzador en destruir el component per evitar fuites de memòria.
  if (timer) clearInterval(timer)
})
</script>
