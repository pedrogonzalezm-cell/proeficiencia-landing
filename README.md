# ProeficiencIA — Landing Page

Landing page de ProeficiencIA, consultora de automatización con IA para PYMEs.

## Stack

- **Framework:** Astro 5 + React (componentes interactivos)
- **Estilos:** Tailwind CSS v4
- **Deploy:** Vercel
- **Email:** Resend (`onboarding@resend.dev` → migrar a dominio propio cuando esté verificado)
- **Agendamiento:** cal.com/proeficiencia

## Estructura

```
src/
├── components/
│   ├── Navbar.astro
│   ├── Hero.astro
│   ├── Services.astro        # Cards por departamento (Ventas, Finanzas, Marketing)
│   ├── HowItWorks.astro
│   ├── Pricing.astro         # Evaluación por área y Bundle integral
│   ├── FAQ.astro
│   ├── CTAFinal.astro
│   ├── Footer.astro
│   ├── Quiz.tsx              # Quiz interactivo (React)
│   ├── QuizModal.astro       # Modal contenedor del quiz
│   ├── WhatsAppButton.astro  # Botón flotante WhatsApp (desktop)
│   └── MobileStickyBar.astro # Barra fija inferior (mobile)
├── data/
│   └── quiz.ts               # Preguntas, scoring y quick wins
├── pages/
│   ├── index.astro
│   └── api/
│       └── quiz-submit.ts    # Endpoint: envía email al completar quiz
└── layouts/
    └── Layout.astro
```

## Flujo del quiz

1. Usuario completa 6 preguntas
2. Recibe resultado (Perfil A / B / C) con quick wins personalizados
3. Ingresa nombre y email → botones para agendar llamada gratuita (WhatsApp o cal.com)
4. Se envían dos emails via Resend:
   - **Pedro** (`pedro@proeficiencia.cl`): notificación con todos los datos del lead
   - **Cliente**: su diagnóstico + opciones de agendamiento

## Modelo de negocio

- **Llamada gratuita 15 min** → filtro inicial (`cal.com/proeficiencia/15min`)
- **Evaluación 45 min** → con pago anticipado (link enviado directamente por Pedro)

## Variables de entorno

```
RESEND_API_KEY=re_...
```

## Comandos

```bash
npm run dev       # Servidor local en localhost:4321
npm run build     # Build de producción
npm run preview   # Preview del build
```

## Pendiente

- [ ] Verificar dominio `proeficiencia.cl` en Resend (requiere plan pago) para usar `contacto@proeficiencia.cl` como remitente
- [ ] Configurar pago anticipado para Evaluación 45 min (MercadoPago u otro medio local)
- [ ] Conectar Google Calendar en cal.com
