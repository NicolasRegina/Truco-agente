---
name: Truco Argentino Pro
version: alpha
colors:
  primary: "#1B4332"
  on-primary: "#FFFFFF"
  secondary: "#5C2C16"
  on-secondary: "#FFFFFF"
  tertiary: "#F39C12"
  on-tertiary: "#081C15"
  surface: "#0E3B24"
  on-surface: "#FFFFFF"
  surface-container: "#160C06"
  neutral: "#0A0503"
  on-neutral: "#F8FAFC"
  card-bg: "#FAF6EE"
  card-text: "#18181B"
  accent-sword: "#1D4ED8"
  accent-basto: "#15803D"
  error: "#DC2626"
  on-error: "#FFFFFF"
typography:
  headline-display:
    fontFamily: Cinzel
    fontSize: 36px
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Cinzel
    fontSize: 24px
    fontWeight: 600
    lineHeight: 1.3
  body-lg:
    fontFamily: Public Sans
    fontSize: 18px
    fontWeight: 400
    lineHeight: 1.5
  body-md:
    fontFamily: Public Sans
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.5
  body-sm:
    fontFamily: Public Sans
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.4
  label-caps:
    fontFamily: Space Grotesk
    fontSize: 12px
    fontWeight: 600
    lineHeight: 1.0
    letterSpacing: 0.08em
rounded:
  none: 0px
  sm: 4px
  md: 8px
  lg: 16px
  xl: 24px
  full: 9999px
spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  xxl: 48px
components:
  table-felt:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    padding: "{spacing.md}"
    rounded: "{rounded.xl}"
  table-wood-border:
    backgroundColor: "{colors.secondary}"
    textColor: "{colors.on-secondary}"
    padding: "{spacing.sm}"
    rounded: "{rounded.xl}"
  glass-panel:
    backgroundColor: "{colors.surface-container}"
    textColor: "{colors.on-neutral}"
    padding: "{spacing.md}"
    rounded: "{rounded.lg}"
  button-primary:
    backgroundColor: "{colors.tertiary}"
    textColor: "{colors.on-tertiary}"
    rounded: "{rounded.md}"
    padding: "{spacing.sm}"
  button-primary-hover:
    backgroundColor: "{colors.tertiary}"
    textColor: "{colors.on-tertiary}"
  button-action-cantos:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.md}"
    padding: "{spacing.sm}"
  button-action-fold:
    backgroundColor: "{colors.error}"
    textColor: "{colors.on-error}"
    rounded: "{rounded.md}"
    padding: "{spacing.sm}"
  card-container:
    backgroundColor: "{colors.card-bg}"
    textColor: "{colors.card-text}"
    rounded: "{rounded.md}"
    padding: "{spacing.xs}"
    width: 80px
    height: 120px
  card-macho-badge:
    backgroundColor: "{colors.accent-sword}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.sm}"
    padding: "{spacing.xs}"
  card-basto-badge:
    backgroundColor: "{colors.accent-basto}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.sm}"
    padding: "{spacing.xs}"
---

## Overview

Truco Argentino Pro conjuga la mística tradicional del juego criollo de bar y estancia con la sofisticación visual de un simulador digital premium. La atmósfera evoca una mesa de paño verde esmeralda profundo enmarcada por madera maciza lustrada, con acentos dorados que simbolizan el Sol de Mayo y los puntos en disputa.

La interfaz está concebida para transmitir tactilez, tensión de juego y elegancia criolla: las cartas poseen el tacto cálido del papel artesanal marfil, las sombras difusas aportan profundidad a las capas y las acciones de canto (Envido, Truco, Vale Cuatro) destacan con jerarquía visual inequívoca.

## Colors

La paleta cromática se organiza en torno a los elementos icónicos de la mesa de truco y la baraja española:

- **Primary (#1B4332):** Verde paño profundo (*felt*), base táctica sobre la que transcurren las manos.
- **On-Primary (#FFFFFF):** Blanco de alta legibilidad para indicadores sobre el paño.
- **Secondary (#5C2C16):** Madera de caoba lustrada que confiere el marco físico de la mesa de bar o pulpería.
- **On-Secondary (#FFFFFF):** Contraste claro sobre la carpintería.
- **Tertiary (#F39C12):** Oro brillante inspirado en las monedas de oro de la baraja y el Sol de Mayo; se reserva para llamadas a la acción estelares, victoria y cantos decisivos.
- **On-Tertiary (#081C15):** Tinta carbón vegetal que garantiza un contraste WCAG AA superior (8.2:1) sobre el fondo dorado.
- **Surface (#0E3B24):** Zona focal del tapete donde reposan las cartas jugadas en cada baza.
- **Surface-Container (#160C06):** Vidrio ahumado con efecto glassmorphism para paneles de tanteador y registro de cantos.
- **Neutral (#0A0503):** Fondo exterior en penumbra que centra toda la atención en la mesa iluminada.
- **Card Background (#FAF6EE):** Marfil cálido envejecido para el papel de los naipes españoles.
- **Card Text (#18181B):** Tinta negra tipográfica para numerales e índices de palo.
- **Accent Sword (#1D4ED8):** Azul cobalto toledano que identifica al Ancho de Espada (Macho) y los triunfos de espada.
- **Accent Basto (#15803D):** Verde bosque vibrante para el As de Bastos (Hembra).
- **Error (#DC2626):** Carmesí para la acción de irse al mazo o rechazar un canto.

## Typography

La jerarquía tipográfica fusiona la herencia clásica y el rigor numérico del juego:

- **Headlines (Cinzel):** Tipografía display serif monumental con raíces clásicas para títulos de victoria, nombres de rondas y cabeceras ceremoniales.
- **Body & Acciones (Public Sans):** Tipografía sans-serif neutral, limpia y de excelente legibilidad en pantallas móviles para instrucciones, diálogos del coach y reglas.
- **Labels & Metadatos (Space Grotesk):** Letra monoespaciada/geométrica en mayúsculas sostenidas para el tanteador de tantos (malas y buenas), tiempos de turno y badges de triunfo.

## Layout

La distribución espacial adopta un modelo centrado de mesa oval con zonas espaciales protegidas:

- **Contención de Mesa:** La mesa ocupa el área visible principal adaptándose a safe-areas de dispositivos táctiles (`100dvh` sin saltos de scroll).
- **Escala de Espaciado:** Se utiliza una escala modular basada en múltiplos de 8px (4px para ajustes mínimos de badges, 16px para pads de panel y 32px para separación de zonas de jugadores).
- **Separación de Bazas:** El centro de mesa es la zona exclusiva para cartas tiradas en primera, segunda y tercera vuelta, garantizando que nunca se superpongan a los botones de canto ni a la mano del jugador.

## Elevation & Depth

La profundidad se logra mediante capas tonales enriquecidas con iluminación focal:

- **Luz Cenital de Mesa:** Un degradé radial centrado sobre el paño (`radial-gradient`) simula la lámpara baja de un club o pulpería tradicional.
- **Glassmorphism Táctico:** Los paneles flotantes (tanteador, panel del asistente/coach) usan una superficie translúcida oscura (`rgba(22, 12, 6, 0.75)`) con desenfoque de fondo (`backdrop-filter: blur(16px)`) y filete perimetral sutil dorado.
- **Sombras de Naipes:** Las cartas poseen elevación física proyectada mediante sombras difusas suaves en reposo y un desplazamiento ascendente con halo lumínico al pasar el cursor o seleccionarlas.

## Shapes

- **Mesa y Contenedores Mayores:** Esquinas generosamente redondeadas (`rounded.xl: 24px`) que suavizan el límite entre la madera y el paño.
- **Naipes Españoles:** Proporción áurea clásica vertical con radio sutil de 8px (`rounded.md`) fiel al formato real de las barajas de naipe español.
- **Botones de Decisión:** Píldoras con esquinas moderadas (`rounded.md: 8px`) y microinteracciones de hundimiento táctil (`translateY(1px)`) al presionar.

## Components

- **Table Felt (`table-felt`):** Núcleo de tela verde con textura de paño que alberga la disputa de cartas.
- **Wood Border (`table-wood-border`):** Moldura de madera perimetral con biselado que enmarca la mesa.
- **Glass Panel (`glass-panel`):** Contenedor translúcido para el registro de tantos y el historial de jugadas.
- **Button Primary (`button-primary`):** Botón principal dorado con texto oscuro contrastado para cantar "Quiero", "Truco" o aceptar desafíos.
- **Button Action Cantos (`button-action-cantos`):** Botones secundarios con tono esmeralda sobrio para proponer envidos o flor.
- **Button Action Fold (`button-action-fold`):** Botón de emergencia para irse al mazo, señalado en carmesí sobrio.
- **Card Container (`card-container`):** Naipe interactivo con fondo marfil, textura de grabado y borde pulido.
- **Badges de Triunfo (`card-macho-badge`, `card-basto-badge`):** Micro-etiquetas indicadoras del rango de las cartas bravas (Ancho de Espadas, Ancho de Bastos, Siete Bravo).

## Do's and Don'ts

- **Do** reservar el color dorado (`tertiary: #F39C12`) exclusivamente para momentos cumbre (victorias, cantos de falta envido, botón principal de acción).
- **Do** preservar una proporción de contraste de al menos 4.5:1 (WCAG AA) en todos los textos y cifras sobre paño o madera.
- **Do** utilizar el fondo de naipe marfil cálido (`#FAF6EE`) en lugar de blanco puro (#FFFFFF) para evitar fatiga visual y preservar el toque nostálgico.
- **Don't** aplicar gradientes violetas o efectos neón estridentes ("AI purple") que rompan la ambientación criolla tradicional.
- **Don't** permitir que los naipes jugados en el centro de mesa tapen el marcador de puntos o las opciones de canto.
- **Don't** utilizar fuentes genéricas de sistema sin jerarquía ni fuentes serif condensadas ilegibles en pantallas móviles.
