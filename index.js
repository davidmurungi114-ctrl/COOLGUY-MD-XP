const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys')
const P = require('pino')
const express = require('express')
const fs = require('fs')
const app = express()
app.use(express.json())
app.use(express.urlencoded({extended:true}))

let sock = null

async function initBot() {
  const { state, saveCreds } = await useMultiFileAuthState('./session')
  sock = makeWASocket({ 
    logger: P({level:'silent'}), 
    auth: state, 
    browser:['COOLGUY-MD','Chrome','1.0'],
    printQRInTerminal: false
  })
  sock.ev.on('creds.update', saveCreds)
  sock.ev.on('connection.update', async (u)=>{
    const {connection, lastDisconnect} = u
    if(connection==='close'){
      if(lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut) initBot()
    }
    if(connection==='open') console.log('✅ LINKED SUCCESSFULLY!')
  })
  sock.ev.on('messages.upsert', async ({messages})=>{
    const m = messages[0]
    if(!m.message) return
    const from = m.key.remoteJid
    const body = m.message.conversation || m.message.extendedTextMessage?.text || m.message.imageMessage?.caption || ''
    if(!body.startsWith('.')) return
    const cmd = body.slice(1).trim().split(/ +/)[0].toLowerCase()
    if(cmd==='menu'){ await sock.sendMessage(from, {text:`*🔥 COOLGUY-MD-XP MENU 🔥*\n\n.ping\n.alive\nType .menu`}) }
    if(cmd==='ping'){ await sock.sendMessage(from,{text:'Pong! 🏓'}) }
    if(cmd==='alive'){ await sock.sendMessage(from,{text:'✅ COOLGUY MD XP IS ALIVE!'}) }
  })
}
initBot()

app.get('/', (req,res)=>{
res.send(`<html><head><meta name="viewport" content="width=device-width, initial-scale=1"><style>body{background:#000;color:#fff;text-align:center;font-family:Arial;padding:15px}img{width:95%;max-width:500px;border-radius:25px;border:4px solid red;box-shadow:0 0 30px red}h1{font-size:36px;color:red}a{margin:10px;display:inline-block}</style></head><body>
<img src="https://files.catbox.moe/5kxxcs.jpg" />
<h1>🔥 COOLGUY-MD-XP 🔥</h1><h2>BY PROFESSOR COOLGUY</h2>
<a href="/pair" style="background:red;color:white;padding:20px 40px;border-radius:15px;text-decoration:none;font-weight:bold;font-size:22px;box-shadow:0 0 20px red;margin-top:20px">📲 TAP TO PAIR WHATSAPP</a><br><br>
<a href="/clear" style="color:gray">Clear Session</a></body></html>`)
})

app.get('/pair', (req,res)=>{
res.send(`<html><head><meta name="viewport" content="width=device-width, initial-scale=1"><style>
body{background:#000;color:#fff;text-align:center;font-family:Arial;padding:15px;margin:0}
img{width:95%;max-width:500px;border-radius:25px;border:4px solid red;box-shadow:0 0 35px red;margin-top:20px;margin-bottom:25px}
h1{font-size:30px} p{color:#aaa;font-size:18px}
input{padding:24px;width:92%;max-width:420px;border-radius:15px;border:3px solid red;margin:15px 0;font-size:22px;text-align:center;background:#111;color:white}
button{background:red;color:white;padding:24px 50px;border:none;border-radius:15px;font-weight:bold;font-size:24px;margin-top:15px;box-shadow:0 0 20px red;width:92%;max-width:420px}
</style></head><body>
<img src="https://files.catbox.moe/5kxxcs.jpg" />
<h1>ENTER WHATSAPP NUMBER</h1><p>2567XXXXXXXX (no +)</p>
<form action="/code" method="GET">
<input type="text" name="number" placeholder="2567XXXXXXXX" required /><br>
<button type="submit">🔥 GET PAIRING CODE 🔥</button>
</form></body></html>`)
})

app.get('/clear', async (req,res)=>{
  try { if(fs.existsSync('./session')) fs.rmSync('./session', {recursive:true, force:true}); } catch {}
  sock = null
  await initBot()
  res.send('<h1>✅ Cleared! Go to <a href="/pair">/pair</a></h1>')
})

app.get('/code', async (req,res)=>{
  let number = req.query.number.replace(/[^0-9]/g,'')
  if(!sock){ await initBot(); await new Promise(r=>setTimeout(r,2000)) }
  try{
    let code = await sock.requestPairingCode(number)
    console.log('CODE:', code, 'for', number)
    res.send(`<html><head><meta name="viewport" content="width=device-width, initial-scale=1"><style>
body{background:#000;color:#fff;text-align:center;font-family:Arial;padding:15px;margin:0;overflow-x:hidden}
img{width:90%;max-width:420px;border-radius:25px;border:4px solid red;box-shadow:0 0 30px red;margin-bottom:20px}
h1.code{font-size:28px;letter-spacing:1px;color:white;border:4px solid lime;padding:30px 10px;border-radius:20px;background:#111;box-shadow:0 0 30px lime;max-width:420px;margin:20px auto;box-sizing:border-box;word-break:break-all}
button.copy{background:lime;color:#000;padding:18px 40px;border:none;border-radius:15px;font-weight:bold;font-size:22px;margin:10px auto;display:block}
p{padding:0 15px;word-wrap:break-word;box-sizing:border-box}
</style></head><body>
<img src="https://files.catbox.moe/5kxxcs.jpg" />
<h1 style="color:lime;font-size:32px">YOUR CODE:</h1>
<h1 class="code" id="myCode">${code}</h1>
<button class="copy" onclick="copyCode()">📋 TAP TO COPY CODE</button>
<p id="copied" style="color:lime;font-size:20px;font-weight:bold"></p>
<p style="font-size:19px">WhatsApp > Linked Devices > Link with phone number > Paste Code</p>
<p style="color:yellow;font-size:18px">It WILL say "Logging in" - Wait 50 seconds, DON'T cancel!<br>It takes 50 sec to log in!</p>
<script>
function copyCode(){
  let t = document.getElementById('myCode').innerText;
  navigator.clipboard.writeText(t).then(()=>{ document.getElementById('copied').innerText='✅ COPIED! Now go paste in WhatsApp!'; });
}
</script>
</body></html>`)
  }catch(e){
    res.send('Error: '+e.message+'<br><a href="/clear">Click to Clear and try again</a>')
  }
})

app.listen(process.env.PORT || 3000, ()=>console.log('BIG MODE Running'))
