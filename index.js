require('dotenv').config();
const fs = require('fs');
const express = require('express');
const TelegramBot = require('node-telegram-bot-api');

const app = express();
app.use(express.json());

const bot = new TelegramBot(process.env.TELEGRAM_TOKEN, {
  polling: true
});


console.log('🤖 Bot de ventas activo');

// ========= CONFIG =========
const imagePath = './images/bienvenida.png';
const DRIVE_LINK = "https://drive.google.com/drive/folders/1LgCA6npmP0ET18QdJqKWpq4NrZSr4MHA";
// ==========================

// Crear archivo clientes.json si no existe
if (!fs.existsSync('clientes.json')) {
  fs.writeFileSync('clientes.json', '[]');
}

// Cargar clientes
let clientes = JSON.parse(fs.readFileSync('clientes.json'));

// ====== BIENVENIDA ======
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;

  bot.sendPhoto(chatId, imagePath, {
    caption: `🚀 *Curso Digital de Inteligencia Artificial para Creadores*

Convierte la IA en tu herramienta de ingresos.

Aprenderás a crear contenido atractivo, automatizar procesos y monetizar tus ideas paso a paso.

🎥 Curso en formato digital  
🔓 Acceso inmediato  
💼 Enfoque práctico  
💰 Pago único de *$109 MXN*

Elige cómo deseas obtener tu acceso:`,
    parse_mode: 'Markdown',
    reply_markup: {
      inline_keyboard: [
        [{ text: "💳 Pagar con PayPal", callback_data: "paypal" }],
        [{ text: "🏦 Transferencia bancaria", callback_data: "transferencia" }],
        [{ text: "❓ Más información", callback_data: "info" }]
      ]
    }
  });
});

// ====== BOTONES ======
bot.on("callback_query", (query) => {
  const chatId = query.message.chat.id;
  const data = query.data;

  if (data === "paypal") {
    bot.sendMessage(chatId,
`💳 *Pago con PayPal*

Realiza tu pago aquí:
👉 https://paypal.me/tadesa198/109

Monto exacto: *$109 MXN*

Después envía tu comprobante aquí mismo.`,
{ parse_mode: "Markdown" });
  }

  if (data === "transferencia") {
    bot.sendMessage(chatId,
`🏦 *Transferencia bancaria*

Banco: BBVA  
Nombre: Erick Tadeo  
CLABE: 012180004703073785  

Monto: *$109 MXN*

Envía tu comprobante aquí mismo.`,
{ parse_mode: "Markdown" });
  }

  if (data === "info") {
    bot.sendMessage(chatId,
`📘 *¿Qué incluye el curso?*

✔ Crear contenido con IA  
✔ Automatización básica  
✔ Estrategias de monetización  
✔ Acceso inmediato  
✔ Soporte directo  

Inversión única: *$109 MXN*`,
{ parse_mode: "Markdown" });
  }

  bot.answerCallbackQuery(query.id);
});

// ====== COMANDO APROBAR ======
bot.onText(/\/aprobar (.+)/, (msg, match) => {
// ====== CUANDO ENVÍAN COMPROBANTE (FOTO) ======
bot.on("photo", (msg) => {
  const chatId = msg.chat.id;

  bot.sendMessage(chatId,
`📩 *Comprobante recibido correctamente*

Estamos validando tu pago.

En breve recibirás tu acceso al curso digital Premium.`,
  { parse_mode: "Markdown" }
  );
});
  const adminId = msg.chat.id;
  const userId = match[1];

  if (!clientes.includes(userId)) {
    clientes.push(userId);
    fs.writeFileSync('clientes.json', JSON.stringify(clientes, null, 2));
  }

  bot.sendMessage(userId,
`🎉 *Pago confirmado*

Bienvenido oficialmente al curso Premium IA.

Aquí tienes tu acceso exclusivo:
👉 ${DRIVE_LINK}

Disfrútalo y comienza hoy 🚀`,
{ parse_mode: "Markdown" });

  bot.sendMessage(adminId, "✅ Cliente aprobado y acceso enviado correctamente.");
});

const PORT = process.env.PORT || 3000;
const URL = process.env.RAILWAY_STATIC_URL;

bot.setWebHook(`${URL}/bot${process.env.TELEGRAM_TOKEN}`);

app.post(`/bot${process.env.TELEGRAM_TOKEN}`, (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

app.listen(PORT, () => {
  console.log("🚀 Bot activo 24/7 en Railway");
});
