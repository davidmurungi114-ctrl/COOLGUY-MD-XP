const express = require('express');
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const pino = require('pino');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
let sock = null;

async function initBot(){
  const { state, saveCreds } = await useMultiFileAuthState('./session');
  sock = makeWASocket({
    logger: pino({ level: 'silent' }),
    auth: state,
    printQRInTerminal: false,
    browser: ['COOLGUY-MD-XP', 'Chrome', '1.0.0']
  });
  sock.ev.on('creds.update', saveCreds);
  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect } = update;
    if(connection === 'close'){
      const shouldReconnect = (lastDisconnect?.error)?.output?.statusCode !== DisconnectReason.loggedOut;
      console.log('Connection closed, reconnecting:', shouldReconnect);
      if(shouldReconnect) initBot();
    } else if(connection === 'open'){
      console.log('✅ COOLGUY-MD-XP CONNECTED! POWERED BY PROFESSOR COOLGUY');
    }
  });
  sock.ev.on('messages.upsert', async ({ messages }) => {
    const msg = messages[0];
    if(!msg.message || msg.key.fromMe) return;
    const from = msg.key.remoteJid;
    const body = msg.message.conversation || msg.message.extendedTextMessage?.text || '';
    const cmd = body.trim().toLowerCase();
    if(cmd === '.menu' || cmd === 'menu'){
      await sock.sendMessage(from, { text: `🔥 *COOLGUY-MD-XP MENU* 🔥\n\n.menu - Show menu\n.ping - Check speed\n.alive - Check bot alive\n.owner - Owner info\n\n⚡ POWERED BY PROFESSOR COOLGUY - Fort Portal, Uganda ⚡` });
    }
    if(cmd === '.ping' || cmd === 'ping'){
      await sock.sendMessage(from, { text: `🏓 Pong! COOLGUY-MD-XP is FAST! ⚡\nPOWERED BY PROFESSOR COOLGUY` });
    }
    if(cmd === '.alive' || cmd === 'alive'){
      await sock.sendMessage(from, { text: `✅ I'm ALIVE! COOLGUY-MD-XP is Online!\n👑 Owner: PROFESSOR COOLGUY\n📍 Fort Portal, Uganda` });
    }
    if(cmd === '.owner' || cmd === 'owner'){
      await sock.sendMessage(from, { text: `👑 OWNER: PROFESSOR COOLGUY\n📍 Fort Portal, Uganda\n🔥 COOLGUY-MD-XP` });
    }
  });
}

// HOME PAGE
app.get('/', (req,res)=>{
  res.send(`<html><head><meta name="viewport" content="width=device-width, initial-scale=1"><style>body{background:#000;color:#fff;text-align:center;font-family:Arial;padding:10px}img{width:95%;max-width:500px;border-radius:25px;border:4px solid red;margin-top:15px}a{display:inline-block;background:red;color:#fff;padding:15px 30px;border-radius:15px;text-decoration:none;font-size:22px;font-weight:bold;margin-top:20px}</style></head><body><img src="https://files.catbox.moe/5kxxcs.jpg" /><h1>🔥 COOLGUY-MD-XP 🔥</h1><p>Original WhatsApp Bot By PROFESSOR COOLGUY</p><p><b>⚡ POWERED BY PROFESSOR COOLGUY ⚡</b></p><a href="/pair">📲 TAP TO PAIR</a><p>👑 Owner: PROFESSOR COOLGUY<br>📍 Fort Portal, Uganda</p></body></html>`);
});

// PAIR PAGE
app.get('/pair', (req,res)=>{
  res.send(`<html><head><meta name="viewport" content="width=device-width, initial-scale=1"><style>body{background:#000;color:#fff;text-align:center;font-family:Arial;padding:10px}img{width:95%;max-width:500px;border-radius:25px;border:4px solid red;margin-top:15px}input{padding:15px;font-size:20px;width:90%;max-width:400px;border-radius:15px;border:2px solid red;text-align:center;margin:15px 0}button{background:red;color:#fff;padding:15px 30px;font-size:20px;border:none;border-radius:15px;font-weight:bold}</style></head><body><img src="https://files.catbox.moe/5kxxcs.jpg" /><h1>🔥 PAIR COOLGUY-MD-XP 🔥</h1><p>Enter your WhatsApp number with country code<br>Example: 2567XXXXXXXX</p><form action="/code" method="GET"><input type="text" name="number" placeholder="2567XXXXXXXX" required /><br><button type="submit">GET PAIRING CODE</button></form><p>⚡ POWERED BY PROFESSOR COOLGUY - Fort Portal, Uganda ⚡</p></body></html>`);
});

// CODE PAGE - ONLY FONT FIXED HERE 38px
app.get('/code', async (req,res)=>{
  let number = (req.query.number || '').replace(/[^0-9]/g,'');
  if(!number || number.length < 10){
    return res.send('<h1 style="color:red;text-align:center">❌ ENTER NUMBER FIRST!<br><a href="/pair">Go Back</a></h1>');
  }
  if(!sock){ await initBot(); await new Promise(r=>setTimeout(r,5000)); }
  try{
    let code = await sock.requestPairingCode(number);
    res.send(`<html><head><meta name="viewport" content="width=device-width, initial-scale=1"><style>
body{background:#000;color:#fff;text-align:center;font-family:Arial;padding:10px;margin:0;overflow-x:hidden}
img{width:95%;max-width:500px;border-radius:25px;border:4px solid red;box-shadow:0 0 35px red;margin-top:15px}
h1.code{font-size:38px;letter-spacing:1px;color:white;border:4px solid lime;padding:20px 5px;border-radius:20px;background:#111;box-shadow:0 0 30px lime;max-width:95%;margin:20px auto;word-break:break-all;box-sizing:border-box}
p{padding:0 10px;word-wrap:break-word}
</style></head><body>
<img src="https://files.catbox.moe/5kxxcs.jpg" />
<h1 style="color:lime;font-size:32px">YOUR CODE:</h1>
<h1 class="code">${code}</h1>
<p style="font-size:19px">WhatsApp > Linked Devices > Link with phone number > Paste NOW!</p>
<p style="color:yellow;font-size:18px">It WILL say "Logging in" - Be FAST 20 sec!<br>WhatsApp makes code expire in 20 sec!</p>
<p style="color:#aaa;font-size:15px">⚡ POWERED BY PROFESSOR COOLGUY - Fort Portal, Uganda ⚡</p>
</body></html>`);
  }catch(e){
    res.send(`<h1 style="text-align:center;color:red">❌ FAILED: ${e.message}<br><br><a href="/clear">Tap to Clear and try again</a></h1>`);
  }
});

// CLEAR SESSION
app.get('/clear', (req,res)=>{
  try{ fs.rmSync('./session', { recursive: true, force: true }); }catch(e){}
  sock = null;
  res.send('<h1 style="text-align:center">✅ Cleared! <a href="/pair">Pair Again</a></h1>');
});

app.listen(PORT, async ()=>{
  console.log('Server running on ' + PORT);
  await initBot();
});
