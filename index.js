const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys')
const P = require('pino')
const express = require('express')
const app = express()
app.use(express.json())
app.use(express.urlencoded({extended:true}))

let sock = null
let startTime = Date.now()

// HOME PAGE WITH PAIRING BUTTON + YOUR CATBOX PIC
app.get('/', (req,res)=>{
res.send(`
<html>
<head><meta name="viewport" content="width=device-width, initial-scale=1">
<style>
body{background:#000;color:#fff;text-align:center;font-family:sans-serif}
.btn{background:red;color:white;padding:20px 40px;font-size:22px;border:none;border-radius:15px;margin:20px;text-decoration:none;display:inline-block;font-weight:bold}
img{max-width:90%;border-radius:20px;border:3px solid red}
input{padding:15px;font-size:18px;width:80%;border-radius:10px;margin:10px}
</style>
</head>
<body>
<img src="https://files.catbox.moe/5kxxcs.jpg"/><br>
<h1>COOLGUY-MD-XP 🔥</h1>
<h3>Original By PROFESSOR COOLGUY</h3>
<a href="/pair" class="btn">📲 TAP TO PAIR WHATSAPP</a>
<p>No Session ID Needed! Just Link!</p>
<p>Type <b>.menu</b> after pairing to see commands</p>
</body>
</html>
`)
})

// PAIRING PAGE
app.get('/pair', (req,res)=>{
res.send(`
<html><body style="background:#000;color:#fff;text-align:center;font-family:sans-serif;padding-top:30px">
<h2>📲 ENTER WHATSAPP NUMBER</h2>
<p>With country code, e.g 2567XXXXXXXX</p>
<form action="/pair" method="POST">
<input name="number" placeholder="2567XXXXXXXX" required><br>
<button type="submit" style="background:red;color:white;padding:15px 30px;font-size:20px;border-radius:10px;margin-top:20px;font-weight:bold">GET PAIRING CODE</button>
</form>
<br><a href="/" style="color:cyan">← Back</a>
</body></html>
`)
})

app.post('/pair', async (req,res)=>{
let phone = req.body.number.replace(/[^0-9]/g,'')
if(!sock) return res.send('Bot not started yet, refresh after 10 seconds')
try{
let code = await sock.requestPairingCode(phone)
res.send(`<html><body style="background:#000;color:#fff;text-align:center;font-family:sans-serif;padding-top:40px">
<h1 style="color:lime">YOUR CODE: ${code}</h1>
<h3>Go to WhatsApp > Linked Devices > Link with phone number</h3>
<h2>Paste this code: <b>${code}</b></h2>
<p>After linking, your bot will start working! Type .menu</p>
<a href="/" style="color:cyan">← Home</a>
</body></html>`)
}catch(e){ res.send('Error: '+e.message+'<br><a href="/pair">Try Again</a>') }
})

app.listen(process.env.PORT || 3000, ()=>console.log('Web Server Running'))

async function startBot() {
const { state, saveCreds } = await useMultiFileAuthState('session')
sock = makeWASocket({ logger: P({level:'silent'}), auth: state, browser:['COOLGUY MD XP','Chrome','1.0'] })
sock.ev.on('creds.update', saveCreds)
sock.ev.on('connection.update', async (u)=>{
const {connection, lastDisconnect} = u
if(connection==='close'){ if(lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut) startBot() }
if(connection==='open') console.log('✅ COOLGUY MD XP LINKED SUCCESSFULLY! NO SESSION ID!')
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

if(command === 'menu' || command === 'help'){
let runtime = Math.floor((Date.now()-startTime)/1000)
let h = Math.floor(runtime/3600), mm = Math.floor((runtime%3600)/60), s = runtime%60
let ram = (process.memoryUsage().heapUsed/1024/1024).toFixed(2)
let date = new Date().toLocaleString('en-US',{weekday:'long',day:'2-digit',month:'long',year:'numeric'})
let menu = `*┌───⭓ ᴄᴏᴏʟɢᴜʏ-ᴍᴅ xᴘ ⭓───*\n*│* 👤 *ᴜsᴇʀ:* ${pushName}\n*│* 👑 *ᴏᴡɴᴇʀ:* ᴘʀᴏғᴇssᴏʀ ᴄᴏᴏʟɢᴜʏ\n*│* 📅 *ᴅᴀᴛᴇ:* ${date}\n*│* ⏳ *ʀᴜɴᴛɪᴍᴇ:* ${h}h ${mm}m ${s}s\n*│* 🔑 *ᴘʀᴇғɪx:* .\n*│* 🛡️ *ᴍᴏᴅᴇ:* ᴘᴜʙʟɪᴄ\n*│* 📊 *ʀᴀᴍ:* ${ram}MB\n*│* 📂 *ᴛᴏᴛᴀʟ ᴄᴏᴍᴍᴀɴᴅs:* 165\n*│* 🟢 *sᴛᴀᴛᴜs:* *ᴏɴʟɪɴᴇ*\n*│* 📦 *ᴠᴇʀsɪᴏɴ:* 1.0.0 ORIGINAL\n*└───────────────────⭓*\n\n*┌───⭓ 🌐 ɢᴇɴᴇʀᴀʟ ⭓───*\n*│* ⬡ .ᴀʟɪᴠᴇ\n*│* ⬡ .ᴘɪɴɢ\n*│* ⬡ .ᴍᴇɴᴜ\n*│* ⬡ .ᴏᴡɴᴇʀ\n*│* ⬡ .ᴊɪᴅ\n*│* ⬡ .ɢʀᴏᴜᴘɪɴғᴏ\n*│* ⬡ .ᴡᴇᴀᴛʜᴇʀ\n*│* ⬡ .ɴᴇᴡs\n*│* ⬡ .ᴊᴏᴋᴇ\n*│* ⬡ .ǫᴜᴏᴛᴇ\n*│* ⬡ .ғᴀᴄᴛ\n*└───────────────────⭓*\n\n*┌───⭓ 👮‍♂️ ᴀᴅᴍɪɴ ⭓───*\n*│* ⬡ .ʙᴀɴ\n*│* ⬡ .ᴋɪᴄᴋ\n*│* ⬡ .ᴘʀᴏᴍᴏᴛᴇ\n*│* ⬡ .ᴅᴇᴍᴏᴛᴇ\n*│* ⬡ .ᴛᴀɢᴀʟʟ\n*│* ⬡ .ʜɪᴅᴇᴛᴀɢ\n*│* ⬡ .ᴍᴜᴛᴇ\n*│* ⬡ .ᴜɴᴍᴜᴛᴇ\n*│* ⬡ .ᴀɴᴛɪʟɪɴᴋ\n*│* ⬡ .ᴡᴇʟᴄᴏᴍᴇ\n*│* ⬡ .ɢᴏᴏᴅʙʏᴇ\n*│* ⬡ .sᴇᴛɢɴᴀᴍᴇ\n*│* ⬡ .sᴇᴛɢᴅᴇsᴄ\n*└───────────────────⭓*\n\n*┌───⭓ 🔒 ᴏᴡɴᴇʀ ⭓───*\n*│* ⬡ .ᴍᴏᴅᴇ\n*│* ⬡ .ᴀᴜᴛᴏʀᴇᴀᴅ\n*│* ⬡ .ᴀᴜᴛᴏsᴛᴀᴛᴜs\n*│* ⬡ .ᴀɴᴛɪᴄᴀʟʟ\n*│* ⬡ .sᴇᴛᴘᴘ\n*│* ⬡ .ᴄʟᴇᴀʀsᴇssɪᴏɴ\n*└───────────────────⭓*\n\n*┌───⭓ 📥 ᴅᴏᴡɴʟᴏᴀᴅᴇʀ ⭓───*\n*│* ⬡ .ᴘʟᴀʏ\n*│* ⬡ .sᴏɴɢ\n*│* ⬡ .ᴠɪᴅᴇᴏ\n*│* ⬡ .ʏᴛᴍᴘ4\n*│* ⬡ .ғᴀᴄᴇʙᴏᴏᴋ\n*│* ⬡ .ɪɴsᴛᴀɢʀᴀᴍ\n*│* ⬡ .ᴛɪᴋᴛᴏᴋ\n*│* ⬡ .sᴘᴏᴛɪғʏ\n*└───────────────────⭓*\n\n*┌───⭓ 🤖 ᴀɪ ⭓───*\n*│* ⬡ .ɢᴘᴛ\n*│* ⬡ .ᴀɪ\n*│* ⬡ .ɢᴇᴍɪɴɪ\n*│* ⬡ .ɪᴍᴀɢɪɴᴇ\n*│* ⬡ .ғʟᴜx\n*└───────────────────⭓*\n\n*┌───⭓ 🎨 sᴛɪᴄᴋᴇʀ ⭓───*\n*│* ⬡ .sᴛɪᴄᴋᴇʀ\n*│* ⬡ .ᴛᴀᴋᴇ\n*│* ⬡ .ᴇᴍᴏᴊɪᴍɪx\n*│* ⬡ .ʀᴇᴍᴏᴠᴇʙɢ\n*│* ⬡ .ᴍᴇᴍᴇ\n*└───────────────────⭓*\n\n*📢 ɴᴇᴡsʟᴇᴛᴛᴇʀ:* COOLGUY-MD XP V1.0\n*୨୧ ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴘʀᴏғᴇssᴏʀ ᴄᴏᴏʟɢᴜʏ ୨୧*`
await sock.sendMessage(from, {text: menu})
}
if(command==='ping'){
let start = Date.now()
await sock.sendMessage(from,{text:'Pinging...'})
await sock.sendMessage(from,{text:`*🏓 Pong! ${Date.now()-start}ms*\n*COOLGUY MD XP* ⚡`})
}
if(command==='alive'){
await sock.sendMessage(from,{text:`*✅ COOLGUY MD XP IS ALIVE!*\n\n👑 Owner: PROFESSOR COOLGUY\n📦 Original: No Fork\n🟢 Status: Online\n📍 Nsangi, UG`})
}
})
}
startBot()
