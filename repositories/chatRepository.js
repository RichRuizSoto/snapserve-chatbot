const { getDB } = require("../config/db")

async function getChatbotConfigByWhatsApp(number) {
  const db = getDB()

  const [rows] = await db.query(`
    SELECT 
      ci.*,
      e.nombre as restaurante_nombre,
      e.slug as restaurante_slug
    FROM chatbot_info ci
    JOIN establecimientos e
      ON e.id = ci.establecimiento_id
    WHERE ci.whatsapp_number = ?
    AND ci.chatbot_estado = 'activo'
    LIMIT 1
  `, [number])

  return rows[0]
}

async function saveMessage(estId, user, role, message) {
  const db = getDB()

  await db.query(
    "INSERT INTO chat_history (establecimiento_id,user_number,role,message) VALUES (?,?,?,?)",
    [estId, user, role, message]
  )
}

async function getConversation(estId, user) {
  const db = getDB()

  const [rows] = await db.query(
    "SELECT role,message FROM chat_history WHERE establecimiento_id=? AND user_number=? ORDER BY id DESC LIMIT 10",
    [estId, user]
  )

  return rows.reverse().map(row => ({
    role: row.role,
    content: row.message
  }))
}

module.exports = {
  getChatbotConfigByWhatsApp,
  saveMessage,
  getConversation
}
