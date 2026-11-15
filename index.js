const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys')
const P = require('pino')
const express = require('express')
const fs = require('fs')
const app = express()
app.use(express.json())
app.use(express.urlencoded({extended:true}))

let sock = null
let startTime = Date.now()

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
    if(cmd==='menu'){
      await sock.sendMessage(from, {text:`*🔥 COOLGUY-MD-XP MENU 🔥*\n\n.ping\n.alive\nType .menu`})
    }
    if(cmd==='ping'){ await sock.sendMessage(from,{text:'Pong! 🏓'}) }
    if(cmd==='alive'){ await sock.sendMessage(from,{text:'✅ COOLGUY MD XP IS ALIVE!'}) }
  })
}
initBot()

app.get('/', (req,res)=>{
res.send(`<html><body style="background:#000;color:#fff;text-align:center;font-family:Arial;padding:20px">
<img src="https://files.catbox.moe/5kxxcs.jpg" style="width:90%;max-width:400px;border-radius:20px;border:3px solid red;box-shadow:0 0 20px red" />
<h1 style="color:red">🔥 COOLGUY-MD-XP 🔥</h1><h2>BY PROFESSOR COOLGUY</h2>
<a href="/pair" style="background:red;color:white;padding:15px 30px;border-radius:10px;text-decoration:none;font-weight:bold;display:inline-block;margin-top:20px">📲 TAP TO PAIR WHATSAPP</a><br><br>
<a href="/clear" style="color:gray">Clear Session</a></body></html>`)
})

app.get('/pair', (req,res)=>{
res.send(`<html><body style="background:#000;color:#fff;text-align:center;font-family:Arial;padding:20px">
<img src="https://files.catbox.moe/5kxxcs.jpg" style="width:85%;max-width:350px;border-radius:20px;border:3px solid red;margin-bottom:15px" />
<h1>ENTER WHATSAPP NUMBER</h1><p>2567XXXXXXXX (no +)</p>
<form action="/code" method="GET">
<input type="text" name="number" placeholder="2567XXXXXXXX" required style="padding:15px;width:80%;border-radius:10px;border:2px solid red" /><br>
<button type="submit" style="background:red;color:white;padding:15px 30px;border-radius:10px;font-weight:bold">GET PAIRING CODE</button>
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
    res.send(`<html><body style="background:#000;color:#fff;text-align:center;font-family:Arial;padding:20px">
<img src="https://files.catbox.moe/5kxxcs.jpg" style="width:80%;max-width:300px;border-radius:20px;border:3px solid red;margin-bottom:15px" />
<h1 style="color:lime">YOUR CODE:</h1><h1 style="font-size:45px;border:3px solid lime;padding:20px;border-radius:15px">${code}</h1>
<p>Now go to WhatsApp > Linked Devices > Link with phone number > Paste in 20 seconds!</p>
<p>It SHOULD say "Logging in" now!</p></body></html>`)
  }catch(e){
    console.log(e)
    res.send('Error: '+e.message+'<br><a href="/clear">Click to Clear and try again</a>')
  }
})

app.listen(process.env.PORT || 3000, ()=>console.log('Running'))
