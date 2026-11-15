const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys')
const P = require('pino')
const express = require('express')
const fs = require('fs')
const app = express()
app.use(express.json())
app.use(express.urlencoded({extended:true}))

let sock = null
let startTime = Date.now()

app.get('/', (req,res)=>{
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
  <a href="/pair">📲 TAP TO PAIR WHATSAPP</a><br><br>
  <a href="/clear" style="background:#333">🧹 CLEAR SESSION</a>
</body>
</html>
`)
})

app.get('/pair', (req,res)=>{
res.send(`
<html>
<head><meta name="viewport" content="width=device-width, initial-scale=1">
<style>body{background:#000;color:#fff;text-align:center;font-family:Arial;padding:20px}
img{width:85%;max-width:350px;border-radius:20px;border:3px solid red;box-shadow:0 0 15px red;margin-bottom:15px}
input{padding:15px;width:80%;border-radius:10px;border:2px solid red;margin:10px}
button{background:red;color:white;padding:15px 30px;border:none;border-radius:10px;font-weight:bold;font-size:18px}
</style></head>
<body>
  <img src="https://files.catbox.moe/5kxxcs.jpg" />
  <h1>ENTER WHATSAPP NUMBER</h1>
  <p>Example: 2567XXXXXXXX (no +)</p>
  <form action="/code" method="GET">
    <input type="text" name="number" placeholder="2567XXXXXXXX" required />
    <br><button type="submit">GET PAIRING CODE</button>
  </form>
  <br><a href="/" style="color:cyan">← Back Home</a>
</body>
</html>
`)
})

app.get('/clear', (req,res)=>{
  try { if(fs.existsSync('./session')) fs.rmSync('./session', {recursive:true, force:true}); } catch {}
  sock = null
  res.send('<html><body style="background:#000;color:lime;text-align:center;padding:50px;font-family:Arial"><h1>✅ Session Cleared!</h1><h2>Now go to <a href="/pair" style="color:red">/pair</a> again!</h2><p>Old files deleted, ready for fresh code!</p></body></html>')
})

async function startBot(number) {
  try { if(fs.existsSync('./session')) fs.rmSync('./session', {recursive:true, force:true}); } catch {}
  const { state, saveCreds } = await useMultiFileAuthState('./session')
  sock = makeWASocket({ logger: P({level:'silent'}), auth: state, browser:['COOLGUY MD XP','Chrome','1.0'] })
  sock.ev.on('creds.update', saveCreds)
  sock.ev.on('connection.update', async (u)=>{
    const {connection, lastDisconnect} = u
    if(connection==='close'){ if(lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut) startBot(number) }
    if(connection==='open') console.log('✅ COOLGUY MD XP LINKED SUCCESSFULLY!')
  })
  sock.ev.on('messages.upsert', async ({messages})=>{
    const m = messages[0]
    if(!m.message) return
    const from = m.key.remoteJid
    const body = m.message.conversation || m.message.extendedTextMessage?.text || m.message.imageMessage?.caption || ''
    if(!body.startsWith('.')) return
    const args = body.slice(1).trim().split(/ +/)
    const command = args.shift().toLowerCase()
    const pushName = m.pushName || 'User'
    if(command === 'menu'){
      let runtime = Math.floor((Date.now()-startTime)/1000)
      let h = Math.floor(runtime/3600), mm = Math.floor((runtime%3600)/60), s = runtime%60
      let ram = (process.memoryUsage().heapUsed/1024/1024).toFixed(2)
      let menu = `*COOLGUY-MD XP MENU*\nUSER: ${pushName}\nRUNTIME: ${h}h ${mm}m ${s}s\nRAM: ${ram}MB\nCOMMANDS: 165\n\n.ping .alive .owner`
      await sock.sendMessage(from, {text: menu})
    }
    if(command==='ping'){ await sock.sendMessage(from,{text:`Pong!`}) }
    if(command==='alive'){ await sock.sendMessage(from,{text:`✅ COOLGUY MD XP IS ALIVE!`}) }
  })
  if (!sock.authState.creds.registered) {
    await new Promise(r => setTimeout(r, 1500));
    const code = await sock.requestPairingCode(number)
    console.log('PAIRING CODE:', code)
    return code
  }
}

app.get('/code', async (req, res) => {
  let number = req.query.number.replace(/[^0-9]/g, '');
  try {
    const code = await startBot(number);
    res.send(`<html><body style="background:#000;color:#fff;text-align:center;font-family:Arial;padding:20px">
    <img src="https://files.catbox.moe/5kxxcs.jpg" style="width:80%;max-width:300px;border-radius:20px;border:3px solid red;margin-bottom:15px" />
    <h1 style="color:lime">YOUR REAL CODE:</h1>
    <h1 style="font-size:45px;letter-spacing:5px;color:white;border:3px solid lime;padding:20px;border-radius:15px">${code}</h1>
    <p>Go to WhatsApp > Linked Devices > Link with phone number > Paste NOW! (20 sec)</p>
    <a href="/" style="color:cyan">← Home</a>
    </body></html>`);
  } catch (e) {
    res.send('Error: ' + e.message + ' - <a href="/pair">Try Again</a> <br> <a href="/clear">Clear Session</a>');
  }
});

app.listen(process.env.PORT || 3000, ()=>console.log('Web Server Running'))
