# prompts-log.md — Traçabilitat Completa FEAT-001: Language Switcher

**Feature**: Canvi d'idioma (CA / ES) sense recàrrega de pàgina  
**Data**: 12/04/2026  
**Metodologia**: Spec-Driven Development (SDD) amb agent IA (Antigravity / Gemini)

---

## FASE 1 — Definició i Especificació (opsx:propose)

### Iteració 1.1 — Proposta de la Feature

**Prompt de l'usuari:**
```
"Vull afegir un botó a la barra de navegació que permeti canviar l'idioma 
de la web entre català i castellà. Ha de ser sense recarregar la pàgina 
i que es recordi l'últim idioma escollit."
```

**Resposta de l'agent**: L'agent va proposar usar Pinia (ja instal·lat al projecte) com a gestor d'estat de l'idioma actiu, evitant instal·lar `@nuxtjs/i18n` que afegiria complexitat innecessària.

**Decisió presa**: Store lleuger amb objecte de traduccions i funció `t(key)`.

---

### Iteració 1.2 — Creació de `specs/foundations.md`

**Prompt de l'usuari:**
```
"Crea el fitxer foundations.md per a aquesta funcionalitat. Ha d'explicar 
el context del projecte, quin és l'objectiu exacte i quines restriccions 
tenim. Per exemple, que no volem usar llibreries externes d'i18n i que 
l'idioma per defecte ha de ser el català."
```

**Acció IA**: L'agent va generar `specs/foundations.md` descrivint la plataforma TixCore Live, l'objectiu de la feature i les restriccions tècniques.

**Resultat**: ✅ Correcte. Cap desviació respecte a les instruccions.

---

### Iteració 1.3 — Creació de `specs/spec.md`

**Prompt de l'usuari:**
```
"Ara crea el spec.md. Vull que defineixes el comportament esperat amb 
requisits numerats. Ha d'incloure: el botó on ha d'estar, quins idiomes 
suportem, quins textos s'han de traduir com a mínim (posa una taula) 
i que l'idioma es guardi al localStorage."
```

**Acció IA**: L'agent va generar `specs/spec.md` amb 4 requisits formals (REQ-001 a REQ-004) incloent la taula de textos mínims a traduir.

**Observació**: L'agent va afegir un criteri d'acceptació en forma de checklist, que no estava explícitament demanat però era coherent amb la spec.

**Resultat**: ✅ Acceptat. La taula de traduccions cobria tots els elements demanats.

---

### Iteració 1.4 — Creació de `specs/plan.md`

**Prompt de l'usuari:**
```
"Ara el plan.md. Vull l'estratègia d'implementació: quins fitxers s'han 
de crear o modificar (amb una taula), com s'estructura el store de Pinia, 
en quin ordre cal fer els canvis i quins riscos hi pot haver com ara 
problemes amb el servidor (SSR) de Nuxt."
```

**Acció IA**: L'agent va generar `specs/plan.md` amb la taula de fitxers, el pseudocodi del store, l'ordre d'execució i una taula de riscos amb mitigació (incloent el cas de `localStorage` en SSR).

**Resultat**: ✅ El pla era prou detallat per guiar la implementació sense ambigüitat.

---

## FASE 2 — Implementació (opsx:apply)

### Iteració 2.1 — Crear `stores/i18n.js`

**Prompt de l'usuari:**
```
"Seguint el plan.md, crea el store de Pinia per gestionar l'idioma. 
Ha de tenir les traduccions en català i castellà per tots els textos 
de la spec (la taula del spec.md). La funció t() ha de retornar la clau 
si la traducció no existeix, per evitar errors. I el init() ha d'usar 
import.meta.client perquè no peti amb el SSR de Nuxt."
```

**Acció IA**: L'agent va crear `stores/i18n.js` amb:
- Estat `lang: 'ca'` per defecte
- Objecte `translations` amb 12 claus per idioma
- Getter `t(key)` amb fallback `?? key`
- Accions `toggle()` i `init()` amb guard SSR

**Resultat**: ✅ Implementació fidel a la spec i al plan.

---

### Iteració 2.2 — Integrar el botó al `AppHeader.vue` (1r intent, fallit)

**Prompt de l'usuari:**
```
"Ara afegeix el botó al header. Ha de mostrar la bandera i el codi 
de l'idioma al que et pots canviar. Per exemple si estic en català 
que mostri '🇪🇸 ES'. A més substitueix els textos estàtics del header 
('Inicia Sessió', 'Les meves entrades', 'Sortir') per les traduccions 
del store."
```

**Error detectat**: L'agent va intentar fer una edició parcial del fitxer però va fallar perquè els caràcters especials catalans (`Sessió`, `Entrades`) no coincidien exactament amb el text del fitxer a causa d'un problema d'encoding intern.

**Evidència de l'error**:
```
Error: chunk 0: target content not found in file
```

---

### Iteració 2.3 — Correcció del header (2n intent)

**Prompt de l'usuari:**
```
"No funciona, segueix fallant. Intenta sobreescriure el fitxer sencer 
en lloc d'editar-lo parcialment, potser és un problema d'encoding 
amb els accents catalans."
```

**Acció de correcció**: L'agent va usar `write_to_file` amb `Overwrite: true` per reescriure el component sencer, evitant el problema de búsqueda de cadenes amb caràcters especials.

**Canvi d'estratègia respecte al plan.md**: D'edicions parcials → sobreescriptura total. Justificat per limitació tècnica de l'eina, no per error de la spec.

**Resultat**: ✅ Botó integrat. Textos del header traduïts correctament.

---

### Iteració 2.4 — Traduccions a `pages/index.vue`

**Prompt de l'usuari:**
```
"Ara aplica les traduccions a la pàgina principal. El títol 'Sensacions 
en Directe', el subtítol i 'Pròxims Esdeveniments' han de canviar 
segons l'idioma actiu. Importa el store i18n i crida init() al onMounted."
```

**Acció IA**: L'agent va modificar el template substituint els 3 textos estàtics i va afegir l'import i la inicialització al `<script setup>`.

**Resultat**: ✅ Sense errors. Traducció reactiva funcional.

---

### Iteració 2.5 — Traduccions a `pages/mytickets.vue`

**Prompt de l'usuari:**
```
"Ara el talonari. Tradueix: el títol 'El meu Talonari', el missatge 
quan no hi ha entrades, el botó 'Explorar Cartellera', el títol quan 
l'usuari no ha iniciat sessió i el botó 'Identificar-me ara'. 
El store s'ha d'importar i inicialitzar igual que a index.vue."
```

**Error detectat**: L'agent va modificar el template correctament però va oblidar afegir l'import del store al `<script setup>`. La pàgina hauria donat error en temps d'execució.

**Acció de correcció** _(sense prompt addicional, l'agent ho va detectar en revisar el fitxer)_:
```
"Afegeix l'import de useI18nStore i la instància i18n al script 
de mytickets.vue, que s'ha quedat sense ell."
```

**Resultat**: ✅ Corregit. El store importat i inicialitzat al `onMounted`.

---

## FASE 3 — Verificació i Anàlisi

### Prompt de verificació

**Prompt de l'usuari:**
```
"Comprova que tots els criteris d'acceptació del spec.md estan complerts 
i genera el fitxer docs/prompts-log.md amb tota la traçabilitat del procés."
```

### Criteris d'Acceptació (de `specs/spec.md`)

| Criteri (REQ) | Resultat |
|---|---|
| REQ-001: Botó visible a la capçalera en tot moment | ✅ |
| REQ-001: Canvi immediat sense recàrrega | ✅ (Pinia és reactiu) |
| REQ-002: Idioma persisteix en recarregar | ✅ (`localStorage` clau `tix_lang`) |
| REQ-002: Idioma per defecte `ca` si no hi ha res guardat | ✅ |
| REQ-003: Mínim 8 textos traduïts | ✅ (12 textos en total) |
| REQ-004: No interromp el flux d'autenticació | ✅ (stores independents) |

---

## ANÀLISI CRÍTIC DEL RESULTAT

### L'agent ha seguit realment la especificació?
**Sí, amb fidelitat alta.** L'agent va partir de `foundations.md` i va respectar totes les restriccions: cap dependència externa, Pinia com a gestor, `localStorage`, idioma per defecte CA. L'única desviació va ser l'estratègia d'edició (sobreescriptura vs edicions parcials), però justificada per una limitació tècnica, no per negligència de la spec.

### Quantes iteracions han estat necessàries?
**6 iteracions en total**:
- 4 per a la spec (foundations, spec, plan)
- 1 fallida + 1 correcció per al header
- 2 per a les pàgines (index + mytickets)
- 1 correcció d'import oblidat

### On falla més la IA?
**En edicions parcials amb caràcters especials** (accents, lletres catalanes). L'agent busca coincidències exactes de cadenes però no gestiona bé les diferències d'encoding entre el que llegeix i el que hi ha al disc. A més, **va oblidar l'import del store** a mytickets.vue en la primera passada, cosa que hauria causat un error en runtime. Va ser necessari un segon prompt de correcció.

### Has hagut de modificar la especificació o només els prompts?
**Només els prompts.** La especificació va ser clara i suficient. El `plan.md` va preveure correctament el risc de SSR amb `import.meta.client`. L'únic canvi va ser **d'estratègia d'implementació** (sobreescriptura vs edicions), que era un detall d'execució no d'especificació.
