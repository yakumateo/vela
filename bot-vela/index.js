// bot-vela/index.js
// Bot Vela — WhatsApp via Twilio Sandbox (free)
//
// Setup rápido:
// 1. npm install express twilio dotenv node-cron
// 2. Crear .env con las variables de abajo
// 3. node index.js
// 4. Exponer con: npx localtunnel --port 3001
//    o ngrok: ngrok http 3001
// 5. En Twilio Console → Messaging → WhatsApp Sandbox
//    Webhook "When a message comes in": https://TU-URL/bot

import express from 'express';
import twilio from 'twilio';
import cron from 'node-cron';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// ============================================================
// Estado en memoria (en prod → Redis o DB)
// ============================================================
const sessions = new Map();
// sessions[phone] = {
//   state: 'IDLE' | 'WAITING_LOCATION' | 'WAITING_PLATE' | 'MONITORING' | 'CONFIRMED',
//   location: string,
//   plate: string,
//   app: string,
//   eta: number (minutos),
//   etaEnd: Date,
//   contacts: string[],
//   safWord: 'vela',
// }

// ============================================================
// Helpers
// ============================================================
function sendMessage(to, body) {
  return client.messages.create({
    from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
    to: `whatsapp:${to}`,
    body,
  });
}

function getSession(phone) {
  if (!sessions.has(phone)) {
    sessions.set(phone, { state: 'IDLE', contacts: [] });
  }
  return sessions.get(phone);
}

// ============================================================
// Webhook — recibe mensajes entrantes
// ============================================================
app.post('/bot', async (req, res) => {
  const phone = req.body.From?.replace('whatsapp:', '');
  const msg   = (req.body.Body || '').trim().toLowerCase();
  const session = getSession(phone);

  console.log(`📱 [${phone}] "${msg}" | estado: ${session.state}`);

  try {
    // ── FLUJO PRINCIPAL ──────────────────────────────────────

    // Activar retorno
    if (msg === 'voy a casa' || msg === 'saliendo' || msg === 'retorno') {
      session.state = 'WAITING_LOCATION';
      sessions.set(phone, session);

      await sendMessage(phone,
        `🕯️ *Bot Vela activado*\n\n` +
        `Hola! Voy a ayudarte a llegar a casa segura/o.\n\n` +
        `Primero, ¿desde dónde sales? (barrio, nombre del local o "compartir ubicación")`
      );
      return res.status(200).send('<Response/>');
    }

    // Estado: esperando ubicación
    if (session.state === 'WAITING_LOCATION') {
      session.location = req.body.Body.trim(); // guardar original con mayúsculas
      session.state = 'WAITING_PLATE';
      sessions.set(phone, session);

      await sendMessage(phone,
        `📍 Ubicación registrada: *${session.location}*\n\n` +
        `Ahora dime la *placa del taxi* (ej: ABC-123)\n` +
        `O escribe "uber", "indriver", "beat" si usas app.`
      );
      return res.status(200).send('<Response/>');
    }

    // Estado: esperando placa/app
    if (session.state === 'WAITING_PLATE') {
      session.plate = req.body.Body.trim().toUpperCase();
      session.state = 'WAITING_ETA';
      sessions.set(phone, session);

      await sendMessage(phone,
        `🚕 Vehículo registrado: *${session.plate}*\n\n` +
        `¿Cuántos minutos tarda tu viaje? (ej: 25)`
      );
      return res.status(200).send('<Response/>');
    }

    // Estado: esperando tiempo
    if (session.state === 'WAITING_ETA') {
      const mins = parseInt(msg, 10);
      if (isNaN(mins) || mins < 1 || mins > 180) {
        await sendMessage(phone, '⚠️ Por favor ingresa los minutos como número (ej: 25)');
        return res.status(200).send('<Response/>');
      }

      session.eta    = mins;
      session.etaEnd = new Date(Date.now() + mins * 60 * 1000 + 5 * 60 * 1000); // +5min de gracia
      session.state  = 'MONITORING';
      sessions.set(phone, session);

      await sendMessage(phone,
        `✅ *Todo registrado. Viajando segura/o.*\n\n` +
        `📍 Salida: ${session.location}\n` +
        `🚕 Vehículo: ${session.plate}\n` +
        `⏱️ Tiempo estimado: ${mins} minutos\n\n` +
        `Cuando llegues, escribe tu palabra clave: *vela*\n` +
        `Si no confirmas en ${mins + 5} minutos, alertaré a tus contactos.`
      );

      // Notificar a contactos de emergencia (si los tiene configurados)
      if (session.contacts.length > 0) {
        const alertMsg =
          `🕯️ [Vela] ${phone} inició viaje a casa.\n` +
          `Salida: ${session.location}\n` +
          `Vehículo: ${session.plate}\n` +
          `ETA: ${mins} min. Si no confirma llegada, te avisaré.`;

        for (const contact of session.contacts) {
          await sendMessage(contact, alertMsg).catch(console.error);
        }
      }

      return res.status(200).send('<Response/>');
    }

    // Estado: monitoreando — esperar confirmación
    if (session.state === 'MONITORING') {
      if (msg === 'vela' || msg === 'llegue' || msg === 'llegué' || msg === 'llegue bien') {
        session.state = 'IDLE';
        sessions.set(phone, session);

        await sendMessage(phone,
          `✅ *¡Llegada confirmada!*\n\nBuenas noches 🕯️\nQue descanses.`
        );

        // Notificar a contactos
        if (session.contacts.length > 0) {
          for (const contact of session.contacts) {
            await sendMessage(contact,
              `✅ [Vela] ${phone} confirmó su llegada a casa. Todo bien 🕯️`
            ).catch(console.error);
          }
        }

      } else if (msg === 'ayuda' || msg === 'sos' || msg === 'socorro') {
        // Emergencia manual
        await triggerAlert(phone, session, 'MANUAL');

      } else {
        await sendMessage(phone,
          `🕯️ Monitoreando tu viaje...\n\n` +
          `Cuando llegues escribe: *vela*\n` +
          `Emergencia: escribe *SOS*`
        );
      }
      return res.status(200).send('<Response/>');
    }

    // ── COMANDOS GLOBALES ────────────────────────────────────

    if (msg === 'cancelar' || msg === 'cancel') {
      session.state = 'IDLE';
      sessions.set(phone, session);
      await sendMessage(phone, '❌ Sesión cancelada. Escribe "voy a casa" cuando salgas.');
      return res.status(200).send('<Response/>');
    }

    if (msg === 'ayuda' || msg === 'help' || msg === '?') {
      await sendMessage(phone,
        `🕯️ *Comandos Vela:*\n\n` +
        `"voy a casa" → iniciar monitoreo\n` +
        `"vela" → confirmar llegada\n` +
        `"SOS" → alerta de emergencia\n` +
        `"cancelar" → cancelar sesión\n` +
        `"estado" → ver tu sesión activa`
      );
      return res.status(200).send('<Response/>');
    }

    if (msg === 'estado') {
      const s = session.state;
      await sendMessage(phone,
        s === 'IDLE'
          ? '🟡 Sin sesión activa. Escribe "voy a casa" para iniciar.'
          : `🟢 Sesión activa\nEstado: ${s}\nVehículo: ${session.plate || 'no registrado'}\nETA: ${session.eta || '?'} min`
      );
      return res.status(200).send('<Response/>');
    }

    // Mensaje no reconocido
    await sendMessage(phone,
      `No entendí eso 🤔\nEscribe *ayuda* para ver los comandos.`
    );

  } catch (error) {
    console.error('Error en bot:', error);
  }

  res.status(200).send('<Response/>');
});

// ============================================================
// Cron job: revisar sesiones vencidas cada minuto
// ============================================================
cron.schedule('* * * * *', async () => {
  const now = new Date();
  for (const [phone, session] of sessions.entries()) {
    if (session.state === 'MONITORING' && session.etaEnd && now > session.etaEnd) {
      console.log(`⚠️  Sesión vencida para ${phone} — disparando alerta`);
      await triggerAlert(phone, session, 'TIMEOUT');
      session.state = 'IDLE';
      sessions.set(phone, session);
    }
  }
});

// ============================================================
// Trigger de alerta de emergencia
// ============================================================
async function triggerAlert(phone, session, reason) {
  const reasonText = reason === 'TIMEOUT'
    ? `No confirmó su llegada en el tiempo estimado`
    : `Activó alerta de emergencia manualmente`;

  const alertMsg =
    `🚨 *ALERTA VELA — EMERGENCIA*\n\n` +
    `📱 Usuario: ${phone}\n` +
    `📍 Salida: ${session.location || 'No registrada'}\n` +
    `🚕 Vehículo: ${session.plate || 'No registrado'}\n` +
    `⚠️ Motivo: ${reasonText}\n\n` +
    `Por favor comunícate con esta persona inmediatamente.`;

  // Alertar al propio usuario
  await sendMessage(phone,
    `🚨 *Alerta activada*\n\nTus contactos fueron notificados.\n` +
    `Si estás bien, escribe *vela* para cancelar la alerta.`
  ).catch(console.error);

  // Alertar a contactos
  if (session.contacts && session.contacts.length > 0) {
    for (const contact of session.contacts) {
      await sendMessage(contact, alertMsg).catch(console.error);
    }
  } else {
    console.log('⚠️  Sin contactos de emergencia registrados para', phone);
  }
}

// ============================================================
// Health check
// ============================================================
app.get('/health', (_, res) => res.json({ status: 'ok', sessions: sessions.size }));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🕯️  Bot Vela corriendo en puerto ${PORT}`);
  console.log(`📲  Webhook URL: http://localhost:${PORT}/bot`);
  console.log(`💡  Exponer con: npx localtunnel --port ${PORT}`);
});
