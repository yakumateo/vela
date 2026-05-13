# 🕯️ Vela — Setup Guide

## Estructura del proyecto
```
vela/
├── src/                    ← App React (PWA)
│   ├── app/
│   │   ├── screens/        ← Pantallas de la app
│   │   ├── components/     ← Layout, BottomNav, Header
│   │   └── routes.tsx
│   ├── styles/
│   │   └── theme.css       ← Tema Vela (dark mode)
│   └── main.tsx
├── public/
│   ├── manifest.json       ← PWA manifest
│   ├── sw.js               ← Service Worker
│   ├── icon-192.png        ← Ícono PWA
│   └── icon-512.png
├── bot-vela/               ← Bot de WhatsApp
│   ├── index.js
│   ├── package.json
│   └── .env.example
└── index.html              ← HTML con meta tags iOS
```

---

## 1. Correr la app (ya lo tienes)
```bash
npm run dev
# Abre http://localhost:5173
```

---

## 2. Generar íconos PWA
```bash
npm install canvas  # solo una vez
node generate-icons.mjs
```

---

## 3. Instalar en iPhone (PWA)
1. Abre Safari → `http://TU-IP-LOCAL:5173`
   > Tu IP local: `ipconfig getifaddr en0` en Mac / `ipconfig` en Windows
2. Toca el botón compartir (□↑)
3. "Añadir a pantalla de inicio"
4. Listo — se instala como app nativa 🎉

---

## 4. Configurar Bot Vela (WhatsApp)

### a) Crear cuenta Twilio (gratis)
1. Ir a https://www.twilio.com/try-twilio
2. Registrarte → obtienes ~$15 USD gratis
3. Ir a **Messaging → Try it out → Send a WhatsApp message**
4. Activar el Sandbox: mandar "join [palabra]" al +1 415 523 8886

### b) Instalar dependencias del bot
```bash
cd bot-vela
npm install
cp .env.example .env
# Editar .env con tus credenciales de Twilio Console
```

### c) Correr el bot
```bash
npm run dev
# En otra terminal:
npm run tunnel
# Copia la URL que te da localtunnel (ej: https://vela-bot.loca.lt)
```

### d) Configurar webhook en Twilio
1. Ir a Twilio Console → Messaging → Sandbox Settings
2. En "When a message comes in": `https://vela-bot.loca.lt/bot`
3. Guardar

### e) Probar
Mandar al número del sandbox: `voy a casa`

---

## 5. Deploy en Vercel (para testeo desde iPhone sin estar en la misma red)
```bash
npm install -g vercel
vercel
# Sigue las instrucciones — te da URL pública gratis
```

---

## Roadmap
- [x] PWA instalable en iPhone
- [x] Dark mode + tema Vela
- [x] Bot WhatsApp con flujo de retorno
- [ ] Auth real (Supabase)
- [ ] Datos reales (reemplazar data estática)
- [ ] Geolocalización real en Radar
- [ ] Notificaciones push reales
- [ ] Deploy bot en Railway (free tier)
