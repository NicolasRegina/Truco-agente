# 🗺️ Backlog & Roadmap: Monetización y Publicación en Tiendas (Truco Argentino)

Este documento define las **Épicas** y **User Stories** para el backlog del proyecto, organizadas de forma secuencial y por fases de menor a mayor complejidad.

---

## 📅 Visión General del Roadmap

```
[Fase 1: Rewarded Ads Web] ──▶ [Fase 2: Mercado Pago Web] ──▶ [Fase 3: Google Play TWA/Capacitor] ──▶ [Fase 4: AdMob & Play Billing]
  (Monedas x Video)              (Packs de Monedas en ARS)       (App Store / Descargas Android)        (Monetización Nativa Mobile)
```

---

## 🏆 ÉPICA 1: Anuncios con Recompensa en Web (Rewarded Ads)
> **Objetivo:** Permitir que los jugadores obtengan monedas virtuales de forma voluntaria viendo videos publicitarios cortos (15-30s), sin arruinar la experiencia de juego.

### 📌 User Story 1.1: Botón de Recompensa en la Tienda Criolla
* **Como** jugador que se quedó sin monedas o quiere desbloquear un dorso/mate,
* **Quiero** poder ver un anuncio de video de 15 segundos desde la Tienda,
* **Para** recibir 500 monedas virtuales de forma inmediata y gratuita.

#### Criterios de Aceptación:
1. En el modal de la Tienda (pestaña Monedas / Saldo) se muestra una tarjeta destacada: *"📺 Ver video (+500 monedas)"*.
2. Posee un límite diario de visualizaciones (ej: máximo 5 videos por día por jugador) para evitar abusos y saturación.
3. El botón tiene un contador de cooldown (ej: 5 minutos entre videos).

### 📌 User Story 1.2: Respaldo por bancarrota ("Recarga de Emergencia")
* **Como** jugador que perdió todas sus fichas en una partida,
* **Quiero** que la pantalla de fin de partida me ofrezca ver un video para recargar 300 monedas,
* **Para** poder seguir jugando una nueva partida sin quedar bloqueado.

### 📌 User Story 1.3: Integración del SDK y Validación de Recompensas
* **Como** desarrollador del juego,
* **Quiero** integrar el SDK de Google AdSense for Games (H5 Games Ads) o Unity Ads Web,
* **Para** recibir eventos `onRewardEarned` y sincronizarlos con el backend en `/api/ads/reward` mediante un token firmado.

---

## 💳 ÉPICA 2: Microtransacciones Web con Mercado Pago
> **Objetivo:** Permitir que los usuarios que quieren contenido exclusivo o monedas inmediatas puedan pagar en pesos argentinos (ARS) mediante la billetera más popular de Argentina.

### 📌 User Story 2.1: Catálogo de Paquetes en la Tienda
* **Como** jugador,
* **Quiero** ver una sección de "Comprar Monedas" con precios transparentes en pesos argentinos,
* **Para** elegir el paquete que más me convenga.

#### Paquetes sugeridos:
* **Mazo Inicial:** 2.500 monedas ➔ $600 ARS
* **Bolsa Gaucha:** 7.500 monedas ➔ $1.500 ARS
* **Baúl Criollo:** 20.000 monedas ➔ $3.200 ARS
* **Pase Libre (No Ads):** Elimina cualquier publicidad futura y regala un dorso legendario ➔ $2.000 ARS (pago único)

### 📌 User Story 2.2: Checkout Pro y Webhooks en el Servidor
* **Como** sistema,
* **Quiero** crear preferencias de pago con el SDK de Mercado Pago en Node.js (`POST /api/payments/mercadopago/create`),
* **Para** redirigir al usuario al Checkout Pro seguro y recibir la notificación de cobro exitoso vía webhook (`POST /api/payments/mercadopago/webhook`).

#### Criterios de Aceptación:
1. El backend valida el estado `approved` directo contra la API de Mercado Pago.
2. Acreditación atómica de monedas en el perfil del usuario en la base de datos (SQLite / PostgreSQL).
3. Envío de feedback en tiempo real mediante WebSocket para que la interfaz muestre una animación de monedas recibidas.

---

## 📱 ÉPICA 3: Empaquetado y Publicación en Google Play Store
> **Objetivo:** Distribuir el juego como una aplicación descargable para Android sin tener que reescribir el frontend React.

### 📌 User Story 3.1: Envoltorio Capacitor / TWA
* **Como** desarrollador,
* **Quiero** configurar Capacitor (`@capacitor/core` y `@capacitor/android`) o Trusted Web Activity (TWA con Bubblewrap),
* **Para** transformar el build de Vite en un proyecto de Android Studio nativo.

#### Tareas Técnicas:
- [ ] Configurar `capacitor.config.json` con `appId: "com.truco.argentino"`.
- [ ] Incorporar íconos adaptativos (ya generados en `client/public/icons/`).
- [ ] Configurar pantalla de carga (Splash Screen) con temática campera.
- [ ] Configurar bloqueo de orientación (Portrait / Landscape adaptativo).

### 📌 User Story 3.2: Generación del Android App Bundle (AAB) y Firma
* **Como** desarrollador,
* **Quiero** generar un Keystore de producción (`release-key.keystore`) y compilar el bundle `.aab` optimizado,
* **Para** subirlo a la Google Play Console y cumplir los requisitos de publicación de Google (API level 34+).

---

## 💎 ÉPICA 4: Monetización Nativa Móvil (AdMob & In-App Purchases)
> **Objetivo:** Maximizar el ingreso en dispositivos móviles con las redes publicitarias y pasarelas oficiales de Google Play.

### 📌 User Story 4.1: Google AdMob Nativo en Android
* **Como** desarrollador,
* **Quiero** utilizar el plugin `@capacitor-community/admob`,
* **Para** mostrar Rewarded Ads nativos de alta fidelidad y banners opcionales en el Lobby.

### 📌 User Story 4.2: Google Play Billing (IAP)
* **Como** jugador en Android,
* **Quiero** poder pagar las monedas con 1 toque usando mi cuenta de Google Play,
* **Para** no tener que ingresar tarjetas ni salir de la aplicación.

---

## 📊 Métricas de Éxito (KPIs)

1. **Retención D1 (Día 1):** > 40% de jugadores vuelven al día siguiente.
2. **Retención D7 (Día 7):** > 15% de jugadores siguen activos a la semana.
3. **Impresiones por Usuario Activo (Imp/DAU):** 1.5 a 3 Rewarded Ads por día.
4. **Tasa de Conversión a Pago (ARPPU):** 2% a 4% de los jugadores realizan al menos 1 compra en la tienda.
