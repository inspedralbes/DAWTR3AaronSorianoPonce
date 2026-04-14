# spec.md — Comportament Esperat: Language Switcher

## Feature: Canvi d'Idioma

### Identificador
`FEAT-001`

### Descripció General
L'usuari pot canviar l'idioma de la interfície prement un botó flagat a la capçalera de l'aplicació. El sistema ha de reaccionar immediatament actualitzant tots els textos visibles sense recàrrega de pàgina.

---

## Comportament Esperat

### REQ-001 — Boton de Selecció
- **Actor**: Qualsevol usuari (autenticat o no)
- **Element UI**: Botó a `AppHeader.vue` amb la bandera i codi de l'idioma actual (`🇪🇸 ES` / `🇪🇸 CA`)
- **Acció**: En clicar, alterna entre `ca` (Català) i `es` (Castellà)
- **Feedback immediat**: Tots els textos de la UI es tradueixen al vol (sense reload)

### REQ-002 — Persistència
- L'idioma seleccionat es guarda a `localStorage` amb la clau `tix_lang`
- En recarregar la pàgina, l'idioma escollit es recupera automàticament
- Si no hi ha valor guardat, l'idioma per defecte és `ca` (Català)

### REQ-003 — Textos a Traduir (Scope)
Els textos que han de canviar inclouen:
| Element | Català (ca) | Castellà (es) |
|---|---|---|
| CTA principal | "Compra les teves entrades" | "Compra tus entradas" |
| Botó iniciar sessió | "Inicia Sessió" | "Iniciar Sesión" |
| Botó "Les meves entrades" | "Les meves entrades" | "Mis entradas" |
| Botó tancar sessió | "Sortir" | "Salir" |
| Pàgina principal — títol | "Esdeveniments disponibles" | "Eventos disponibles" |
| Compra — seleccionar seient | "Selecciona el teu seient" | "Selecciona tu asiento" |
| Compra — confirmar | "Confirmar compra" | "Confirmar compra" |
| Talonari — títol | "Les meves entrades" | "Mis entradas" |
| Talonari — sense entrades | "No tens cap entrada..." | "No tienes ninguna entrada..." |

### REQ-004 — Compatibilitat
- La funcionalitat no ha d'interrompre el flux d'autenticació (auth store)
- El canvi d'idioma no ha de reiniciar l'estat de l'aplicació (sessions actives, reserves)

---

## Criteris d'Acceptació
- [ ] El botó és visible a la capçalera en tot moment
- [ ] El canvi és immediat sense recàrrega
- [ ] L'idioma persiteix en recarregar
- [ ] Mínim 8 textos de la UI es tradueixen correctament
