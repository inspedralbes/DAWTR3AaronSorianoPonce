# TixCore Live - Plataforma de Ticketing en Temps Real

**Curs:** 2DAW 2023-2024 (Projecte Transversal)  
**Autor:** Aaron Soriano Ponce  
**URL de Producció:** [tixcore.live](https://tixcore.live) (Exemple)

---

## 🎯 Objectiu del Projecte
L'objectiu de TixCore Live és oferir una experiència de compra d'entrades ultra-ràpida i interactiva. A diferència de les plataformes tradicionals, permet el bloqueig de seients en temps real mitjançant WebSockets, evitant col·lisions entre usuaris i garantint que la disponibilitat que es veu a la pantalla és sempre la real i actualitzada al mil·lisegon.

## 🏗️ Arquitectura i Tecnologies
El projecte segueix una arquitectura de desacoblament total entre el client i el servidor:

- **Backend (Laravel 11)**: Actua com una API REST robusta. Gestiona l'autenticació (Sanctum), la persistència de dades (Eloquent) i el motor de temps real mitjançant **Laravel Reverb**.
- **Frontend (Nuxt 3)**: Aplicació d'última generació que utilitza SSR (Server Side Rendering) i Composition API. Gestiona l'estat global amb **Pinia** i la comunicació de rutes amb **Laravel Echo**.
- **Disseny (Nuxt UI & Tailwind)**: Interfície premium de tipus "Dark Mode" amb components modulars i animacions de micro-interacció.

## 📊 Diagrames del Sistema

### 1. Casos d'Ús
```mermaid
useCaseDiagram
    actor Client
    actor Admin
    
    package "TixCore Live" {
        usecase "Veure Cartellera" as UC1
        usecase "Reservar Seients (Temps Real)" as UC2
        usecase "Comprar Entrades" as UC3
        usecase "Consultar Historial/QR" as UC4
        usecase "Gestionar Esdeveniments" as UC5
        usecase "Monitoratge de Sales Live" as UC6
    }
    
    Client --> UC1
    Client --> UC2
    Client --> UC3
    Client --> UC4
    
    Admin --> UC5
    Admin --> UC6
    Admin --> UC1
```

### 2. Procés de Reserva i Compra (Temps Real)
```mermaid
sequenceDiagram
    participant U as Usuari A
    participant F as Frontend (Nuxt)
    participant B as Backend (Laravel)
    participant R as Reverb (WS)
    participant O as Altres Usuaris

    U->>F: Clica sobre un seient lliure
    F->>B: POST /api/seat/reserve (socketId)
    B->>B: Bloqueja seient (expires_at: 10min)
    B->>R: Broadcast SeientActualitzat
    R-->>O: Seient ocupat (UI actualitzada)
    F->>U: Mostra seient seleccionat
    U->>F: Clica "Pagar i Comprar"
    F->>B: POST /api/buy (auth_token)
    B->>B: DB Transaction: Crea Reserva + Estat = 'Venut'
    B->>R: Broadcast SeientActualitzat (Venut)
    R-->>O: Seient desapareix/Venut
    B->>F: Retorna confirmació (JSON)
    F->>U: Mostra Ticket amb QR
```

### 3. Model Entitat-Relació
```mermaid
erDiagram
    USUARI ||--o{ RESERVA : realitza
    ESDEVENIMENT ||--o{ CATEGORIA : organitza
    CATEGORIA ||--o{ SEIENT : conté
    SEIENT ||--o{ RESERVA : rep
    
    USUARI {
        int id
        string nom
        string email
        string contrasenya
        boolean admin
    }
    ESDEVENIMENT {
        int id
        string nom
        datetime data
        text descripcio
    }
    CATEGORIA {
        int id
        string nom
        decimal preu
    }
    SEIENT {
        int id
        int fila
        int numero
        enum estat
        string socket_id
        datetime expires_at
    }
    RESERVA {
        int id
        datetime data_expiracio
        string estat
    }
```

---

## 🚀 Instal·lació i Desenvolupament

### Backend
1. `cd backend && composer install`
2. `cp .env.example .env` i configurar la DB
3. `php artisan migrate --seed`
4. `php artisan serve` i `php artisan reverb:start`

### Frontend
1. `cd frontend && npm install`
2. `npm run dev`
