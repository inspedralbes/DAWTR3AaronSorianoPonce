# plan.md — Estratègia d'Implementació: Language Switcher

## Decisió Arquitectural
S'usa **Pinia** (ja al projecte) per gestionar l'estat de l'idioma actiu. Les traduccions es defineixen com un **objecte constant** al mateix store. Els components consumidors accediran a través d'un computed `t` (translator function).

**S'evita `@nuxtjs/i18n`** per: (1) evitar dependències externes, (2) alineació amb les restriccions de `foundations.md`.

---

## Fitxers a Crear/Modificar

| Fitxer | Acció | Descripció |
|---|---|---|
| `stores/i18n.js` | **[NOU]** | Store Pinia amb idioma actiu, traduccions i funció `t()` |
| `components/AppHeader.vue` | **[MODIFICA]** | Afegir botó de toggle d'idioma i usar `t()` per als textos |
| `pages/index.vue` | **[MODIFICA]** | Títol de secció i CTAs traduïts |
| `pages/mytickets.vue` | **[MODIFICA]** | Títol i missatge buit traduïts |
| `pages/event/[id].vue` | **[MODIFICA]** | Textos del selector de seients |

---

## Pas 1 — Store `stores/i18n.js`
```js
// Estructura del store
{
  state: { lang: 'ca' },
  getters: { t: (key) => translations[lang][key] },
  actions: { toggle(), init() }
}
```

## Pas 2 — Integrar al Header
- Importar `useI18nStore` 
- Afegir `<button @click="i18n.toggle()">🌐 {{ i18n.lang.toUpperCase() }}</button>`
- Substituir textos estàtics per `{{ i18n.t('key') }}`

## Pas 3 — Propagar als components
- Cada component importa el store i usa `i18n.t('clau')` als templates

## Pas 4 — Persistència
- Al `init()` del store: llegir `localStorage.getItem('tix_lang')`
- Al `toggle()`: escriure `localStorage.setItem('tix_lang', newLang)`
- Cridar `init()` al `onMounted` del `AppHeader`

---

## Ordre d'Execució
1. Crear `stores/i18n.js` amb totes les traduccions
2. Modificar `AppHeader.vue`
3. Modificar `pages/index.vue`
4. Modificar `pages/mytickets.vue`
5. Modificar `pages/event/[id].vue`
6. Verificar que el botó és visible, el canvi és immediat i persiteix

---

## Riscos i Mitigació
| Risc | Mitigació |
|---|---|
| SSR hidration mismatch (localStorage no disponible al servidor) | Usar `import.meta.client` guard al `init()` |
| Oblidar textos no traduïts | Fallback: si la clau no existeix, retornar la clau com a text |
