import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import CompteEnrere from '../../components/CompteEnrere.vue'

describe('CompteEnrere.vue', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('mostra 00:00 si el temps ha expirat (expiresAt és en el passat)', async () => {
    // Establim `now` a un valor fixat pel fakeTimer (ej: 10000)
    vi.setSystemTime(new Date(10000))
    
    // Expires at 5000 (el passat)
    const wrapper = mount(CompteEnrere, {
      props: {
        expiresAt: 5000
      }
    })
    
    expect(wrapper.text()).toBe('00:00')
  })

  it('calcula i mostra correctament els minuts i segons restants', async () => {
    // Establim `now` a un valor fixat. 10000 ms
    vi.setSystemTime(new Date(10000))

    // Volem que faltin 1 minut i 5 segons = 65000 ms -> expiresAt = 75000 ms
    const wrapper = mount(CompteEnrere, {
      props: {
        expiresAt: 75000
      }
    })
    
    // 65000ms = 1 minut i 5 segons = "01:05"
    expect(wrapper.text()).toBe('01:05')
  })

  it('actualitza el temps al passar 1 segon', async () => {
    vi.setSystemTime(new Date(10000))
    const wrapper = mount(CompteEnrere, {
      props: {
        expiresAt: 20000 // Falten 10 segons = 00:10
      }
    })
    
    expect(wrapper.text()).toBe('00:10')

    // Avancem 1 segon
    vi.advanceTimersByTime(1000)
    await wrapper.vm.$nextTick()
    
    // Ara han passat 1000ms, temps restant 9 segons = 00:09
    expect(wrapper.text()).toBe('00:09')
  })
})
