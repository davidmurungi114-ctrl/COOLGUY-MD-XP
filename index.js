const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys')
const P = require('pino')
const os = require('os')
const express = require('express')
const app = express()
app.get('/', (req,res)=>res.send('✅ COOLGUY MD XP ONLINE!'))
app.listen(process.env.PORT || 3000)

let startTime = Date.now()

async function startBot() {
const { state, saveCreds } = await useMultiFileAuthState('session')
const sock = makeWASocket({ logger: P({level:'silent'}), printQRInTerminal:true, auth: state, browser:['COOLGUY MD XP','Chrome','1.0'] })
sock.ev.on('creds.update', saveCreds)
sock.ev.on('connection.update', async (u)=>{
const {connection, lastDisconnect} = u
if(connection==='close'){ if(lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut) startBot() }
if(connection==='open') console.log('✅ COOLGUY MD XP ONLINE!')
})

sock.ev.on('messages.upsert', async ({messages})=>{
const m = messages[0]
if(!m.message) return
const from = m.key.remoteJid
const isGroup = from.endsWith('@g.us')
const body = m.message.conversation || m.message.extendedTextMessage?.text || m.message.imageMessage?.caption || ''
if(!body.startsWith('.')) return
const args = body.slice(1).trim().split(/ +/)
const command = args.shift().toLowerCase()
const pushName = m.pushName || 'User'

if(command === 'menu' || command === 'help' || command === 'list'){
let runtime = Math.floor((Date.now()-startTime)/1000)
let h = Math.floor(runtime/3600), mm = Math.floor((runtime%3600)/60), s = runtime%60
let ram = (process.memoryUsage().heapUsed/1024/1024).toFixed(2)
let date = new Date().toLocaleString('en-US',{weekday:'long',day:'2-digit',month:'long',year:'numeric'})

let menu = `*┌───⭓ ᴄᴏᴏʟɢᴜʏ-ᴍᴅ xᴘ ⭓───*
*│* 👤 *ᴜsᴇʀ:* ${pushName}
*│* 👑 *ᴏᴡɴᴇʀ:* ᴘʀᴏғᴇssᴏʀ ᴄᴏᴏʟɢᴜʏ
*│* 📅 *ᴅᴀᴛᴇ:* ${date}
*│* ⏳ *ʀᴜɴᴛɪᴍᴇ:* ${h}h ${mm}m ${s}s
*│* 🔑 *ᴘʀᴇғɪx:* .
*│* 🛡️ *ᴍᴏᴅᴇ:* ᴘᴜʙʟɪᴄ
*│* 📊 *ʀᴀᴍ:* ${ram}MB
*│* 📂 *ᴛᴏᴛᴀʟ ᴄᴏᴍᴍᴀɴᴅs:* 165
*│* 🟢 *sᴛᴀᴛᴜs:* *ᴏɴʟɪɴᴇ*
*│* 📦 *ᴠᴇʀsɪᴏɴ:* 1.0.0 ORIGINAL
*└───────────────────⭓*

*┌───⭓ 🌐 ɢᴇɴᴇʀᴀʟ ⭓───*
*│* ⬡ .ᴀʟɪᴠᴇ
*│* ⬡ .ᴘɪɴɢ
*│* ⬡ .ᴍᴇɴᴜ
*│* ⬡ .ᴏᴡɴᴇʀ
*│* ⬡ .ᴊɪᴅ
*│* ⬡ .ɢʀᴏᴜᴘɪɴғᴏ
*│* ⬡ .ᴡᴇᴀᴛʜᴇʀ
*│* ⬡ .ɴᴇᴡs
*│* ⬡ .ᴊᴏᴋᴇ
*│* ⬡ .ǫᴜᴏᴛᴇ
*│* ⬡ .ғᴀᴄᴛ
*└───────────────────⭓*

*┌───⭓ 👮‍♂️ ᴀᴅᴍɪɴ ⭓───*
*│* ⬡ .ʙᴀɴ
*│* ⬡ .ᴋɪᴄᴋ
*│* ⬡ .ᴘʀᴏᴍᴏᴛᴇ
*│* ⬡ .ᴅᴇᴍᴏᴛᴇ
*│* ⬡ .ᴛᴀɢᴀʟʟ
*│* ⬡ .ʜɪᴅᴇᴛᴀɢ
*│* ⬡ .ᴍᴜᴛᴇ
*│* ⬡ .ᴜɴᴍᴜᴛᴇ
*│* ⬡ .ᴀɴᴛɪʟɪɴᴋ
*│* ⬡ .ᴡᴇʟᴄᴏᴍᴇ
*│* ⬡ .ɢᴏᴏᴅʙʏᴇ
*│* ⬡ .sᴇᴛɢɴᴀᴍᴇ
*│* ⬡ .sᴇᴛɢᴅᴇsᴄ
*└───────────────────⭓*

*┌───⭓ 🔒 ᴏᴡɴᴇʀ ⭓───*
*│* ⬡ .ᴍᴏᴅᴇ
*│* ⬡ .ᴀᴜᴛᴏʀᴇᴀᴅ
*│* ⬡ .ᴀᴜᴛᴏsᴛᴀᴛᴜs
*│* ⬡ .ᴀɴᴛɪᴄᴀʟʟ
*│* ⬡ .sᴇᴛᴘᴘ
*│* ⬡ .ᴄʟᴇᴀʀsᴇssɪᴏɴ
*└───────────────────⭓*

*┌───⭓ 📥 ᴅᴏᴡɴʟᴏᴀᴅᴇʀ ⭓───*
*│* ⬡ .ᴘʟᴀʏ
*│* ⬡ .sᴏɴɢ
*│* ⬡ .ᴠɪᴅᴇᴏ
*│* ⬡ .ʏᴛᴍᴘ4
*│* ⬡ .ғᴀᴄᴇʙᴏᴏᴋ
*│* ⬡ .ɪɴsᴛᴀɢʀᴀᴍ
*│* ⬡ .ᴛɪᴋᴛᴏᴋ
*│* ⬡ .sᴘᴏᴛɪғʏ
*└───────────────────⭓*

*┌───⭓ 🤖 ᴀɪ ⭓───*
*│* ⬡ .ɢᴘᴛ
*│* ⬡ .ᴀɪ
*│* ⬡ .ɢᴇᴍɪɴɪ
*│* ⬡ .ɪᴍᴀɢɪɴᴇ
*│* ⬡ .ғʟᴜx
*└───────────────────⭓*

*┌───⭓ 🎨 sᴛɪᴄᴋᴇʀ ⭓───*
*│* ⬡ .sᴛɪᴄᴋᴇʀ
*│* ⬡ .ᴛᴀᴋᴇ
*│* ⬡ .ᴇᴍᴏᴊɪᴍɪx
*│* ⬡ .ʀᴇᴍᴏᴠᴇʙɢ
*│* ⬡ .ᴍᴇᴍᴇ
*└───────────────────⭓*

*📢 ɴᴇᴡsʟᴇᴛᴛᴇʀ:* COOLGUY-MD XP V1.0
*୨୧ ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴘʀᴏғᴇssᴏʀ ᴄᴏᴏʟɢᴜʏ ୨୧*
`
await sock.sendMessage(from, {text: menu})
}

// BASIC COMMANDS
if(command==='ping'){
let start = Date.now()
await sock.sendMessage(from,{text:'Pinging...'})
let end = Date.now()
await sock.sendMessage(from,{text:`*🏓 Pong! ${end-start}ms*\n*COOLGUY MD XP* ⚡`})
}
if(command==='alive'){
await sock.sendMessage(from,{text:`*✅ COOLGUY MD XP IS ALIVE!*\n\n👑 Owner: PROFESSOR COOLGUY\n📦 Original: No Fork\n🟢 Status: Online\n📍 Nsangi, UG`})
}
if(command==='owner'){
await sock.sendMessage(from,{text:`*👑 OWNER: PROFESSOR COOLGUY*\nGitHub: davidmurungi114-ctrl\nBot: COOLGUY MD XP ORIGINAL`})
}

})
}
startBot()
