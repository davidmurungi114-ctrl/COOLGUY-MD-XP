const express = require('express');
const { default: makeWASocket, useMultiFileAuthState, Browsers } = require('@whiskeysockets/baileys');
const pino = require('pino');
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let sock;
let pairingCode = '';

app.get('/', (req, res) => {
  res.send(`
    <html>
    <head><meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
      body{background:#0a0a0a;color:white;text-align:center;font-family:Arial;padding:20px}
      img{width:90%;max-width:400px;border-radius:20px;border:3px solid red;box-shadow:0 0 20px red}
      h1{color:red;text-shadow:0 0 10px red}
      a{background:red;color:white;padding:15px 30px;border-radius:10px;text-decoration:none;font-weight:bold;display:inline-block;margin-top:20px;box-shadow:0 0 15px red}
    </style></head>
    <body>
      <h1>🔥 COOLGUY-MD-XP 🔥</h1>
      <img src="https://files.catbox.moe/5kxxcs.jpg" />
      <h2>BY PROFESSOR COOLGUY</h2>
      <p>165+ COMMANDS | ANTI-DELETE | AUTO VIEW STATUS</p>
      <a href="/pair">📲 TAP TO PAIR WHATSAPP</a>
    </body>
    </html>
  `);
});

app.get('/pair', (req, res) => {
  res.send(`
    <html>
    <head><meta name="viewport" content="width=device-width, initial-scale=1">
    <style>body{background:#000;color:#fff;text-align:center;font-family:Arial;padding:20px}
    input{padding:15px;width:80%;border-radius:10px;border:2px solid red;margin:10px}
    button{background:red;color:white;padding:15px 30px;border:none;border-radius:10px;font-weight:bold}</style>
    </head>
    <body>
      <h1>ENTER WHATSAPP NUMBER</h1>
      <p>Example: 2567XXXXXXXX (no +)</p>
      <form action="/code" method="GET">
        <input type="text" name="number" placeholder="2567XXXXXXXX" required />
        <br><button type="submit">GET PAIRING CODE</button>
      </form>
    </body>
    </html>
  `);
});

async function startBot(number) {
  const { state, saveCreds } = await useMultiFileAuthState('./auth');
  sock = makeWASocket({
    logger: pino({ level: 'silent' }),
    browser: Browsers.macOS('Chrome'),
    auth: state,
    printQRInTerminal: false
  });
  sock.ev.on('creds.update', saveCreds);
  
  if (!sock.authState.creds.registered) {
    await new Promise(r => setTimeout(r, 2000));
    const code = await sock.requestPairingCode(number);
    pairingCode = code;
    console.log('PAIRING CODE:', code);
    return code;
  }
}

app.get('/code', async (req, res) => {
  let number = req.query.number.replace(/[^0-9]/g, '');
  try {
    const code = await startBot(number);
    res.send(`<html><body style="background:#000;color:#fff;text-align:center;font-family:Arial;padding:20px">
    <h1 style="color:lime">YOUR REAL CODE:</h1>
    <h1 style="font-size:50px;letter-spacing:5px;color:white;border:3px solid lime;padding:20px;border-radius:15px">${code}</h1>
    <p>Go to WhatsApp > Linked Devices > Link with phone number > Paste this code NOW! (Expires in 30 sec)</p>
    <p>Check Render Logs for confirmation!</p>
    </body></html>`);
  } catch (e) {
    res.send('Error: ' + e.message + ' - Try again');
  }
});

app.listen(3000, () => console.log('Server running on 3000'));
