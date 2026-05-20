import { resolveLidToRealJid } from "../../lib/utils.js"
export default {
  command: ['givecoins', 'pay', 'coinsgive'],
  category: 'rpg',
  group: true,
  run: async (client, m, args, usedPrefix, command) => {
    const db = global.db.data
    const chatId = m.chat
    const botId = client.user.id.split(':')[0] + '@s.whatsapp.net'
    const botSettings = db.settings[botId]
    const monedas = botSettings.currency || 'coins'
    const chatData = db.chats[chatId]
    if (chatData.adminonly || !chatData.economy) return m.reply(`🌸 ¡Ehhh! Los comandos de *Economía* están desactivados en este grupo... ¡qué pena!\n\nUn *administrador* puede activarlos con el comando, ¡ánimo!\n» *${usedPrefix}economy on*`)
    const mentioned = m.mentionedJid || []
    const who2 = m.quoted ? m.quoted.sender : mentioned[0] || (args[1] ? (args[1].replace(/[@ .+-]/g, '') + '@s.whatsapp.net') : '')
    if (!who2) return m.reply(`🌸 ¡Ey! Tienes que mencionar a alguien para transferirle *${monedas}*, ¿no? (｡•́︿•̀｡)\n> Ejemplo » *${usedPrefix + command} 25000 @mencion*`)
    const who = await resolveLidToRealJid(who2, client, m.chat)
    const senderData = chatData.users[m.sender]
    const targetData = chatData.users[who]
    if (!targetData) return m.reply(`💖 ¡Ese usuario no está registrado en el bot todavía...! Dile que se una primero, ¡venga! ＞︿＜`)
    const cantidadInput = args[0]?.toLowerCase()
    let cantidad = cantidadInput === 'all' ? senderData.bank : parseInt(cantidadInput)
    if (!cantidadInput || isNaN(cantidad) || cantidad <= 0) {
      return m.reply(`🌸 ¡Ingresa una cantidad válida de *${monedas}* para transferir, por favor! (´• ω •\`)`)
    }
    if (typeof senderData.bank !== 'number') senderData.bank = 0
    if (senderData.bank < cantidad) {
      return m.reply(`💖 ¡No tienes suficientes *${monedas}* en el banco para eso...! ¡A ahorrar más! ٩(๑•́ ₃ •̀๑)\n> Tu saldo actual: *¥${senderData.bank.toLocaleString()} ${monedas}*`)
    }
    senderData.bank -= cantidad
    if (typeof targetData.bank !== 'number') targetData.bank = 0
    targetData.bank += cantidad
    if (isNaN(senderData.bank)) senderData.bank = 0
    let name = global.db.data.users[who]?.name || who.split('@')[0]
    await client.sendMessage(chatId, { text: `🌸 ¡Kyaaah, transferencia exitosa! Le enviaste *¥${cantidad.toLocaleString()} ${monedas}* a *${name}* ✨\n> Ahora tienes *¥${senderData.bank.toLocaleString()} ${monedas}* en tu banco. ¡Qué generoso/a! (≧◡≦)`, mentions: [who] }, { quoted: m })
  }
}
