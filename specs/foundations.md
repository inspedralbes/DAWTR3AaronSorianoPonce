# foundations.md — Canvi d'Idioma (Language Switcher)

## Context
TixCore Live és una plataforma de venda d'entrades en temps real construïda amb Nuxt 3 (frontend) i Node.js + Express (backend). Actualment tota la interfície d'usuari es mostra en **català** de forma estàtica. L'aplicació és usada per un públic potencialment multilingüe (català i castellà).

## Objectius
- Permetre a l'usuari canviar l'idioma de la interfície entre **Català (CA)** i **Castellà (ES)** amb un sol clic.
- L'idioma seleccionat ha de **persistir** entre pàgines i recarregues (localStorage).
- No s'ha d'usar cap llibreria externa d'i18n (com `@nuxtjs/i18n`) per mantenir la simplicitat arquitectural del projecte.

## Restriccions
- La solució ha de ser **lleugera**: un store Pinia + un objecte de traduccions.
- El botó de canvi d'idioma ha d'estar visible a la **barra de navegació superior** (`AppHeader.vue`).
- Els textos a traduir es limiten a la **interfície d'usuari principal** (header, botons principals, pàgina d'inici, talonari).
- El backend **no es modifica**: els noms d'esdeveniments i categories provenen de la base de dades i no es traduiran.
- La implementació ha de ser compatible amb el sistema d'autenticació existent (Pinia `auth.js`).
