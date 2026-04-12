<template>
  <span class="font-mono font-bold">{{ formattedTime }}</span>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'

const props = defineProps({
  expiresAt: {
    type: Number,
    required: true
  }
})

const now = ref(Date.now())
let timer

onMounted(() => {
  timer = setInterval(() => {
    now.value = Date.now()
  }, 1000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})

const formattedTime = computed(() => {
  const diff = Math.max(0, props.expiresAt - now.value)
  if (diff === 0) return '00:00'
  
  const minutes = Math.floor(diff / 60000)
  const seconds = Math.floor((diff % 60000) / 1000)
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
})
</script>
