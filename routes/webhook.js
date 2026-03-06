const express = require("express")

const { initDB } = require("../config/db")
const { getChatbotConfigByWhatsApp } = require("../repositories/chatRepository")
const { processMessage } = require("../services/chatbotService")
const { sendText, sendMenu } = require("../services/whatsappService")

const router = express.Router()

initDB()

router.get("/", (req, res) => {

  const token = req.query["hub.verify_token"]
  const challenge = req.query["hub.challenge"]

  if (token === "snapserve_verify_token") {
    console.log("✅ Webhook verificado")
    return res.status(200).send(challenge)
  }

  res.sendStatus(403)
})

router.post("/", async (req, res) => {

  try {

    const message = req.body.entry?.[0]?.changes?.[0]?.value?.messages?.[0]

    if (!message) return res.sendStatus(200)

    const from = message.from

    const to =
      req.body.entry?.[0]?.changes?.[0]?.value?.metadata?.display_phone_number

    const config = await getChatbotConfigByWhatsApp(to)

    if (!config) return res.sendStatus(200)

    const result = await processMessage(message, config)

    if (!result) return res.sendStatus(200)

    if (result.type === "menu") {
      await sendMenu(from, config.access_token, config.phone_number_id)
    }

    if (result.type === "text") {
      await sendText(from, result.message, config.access_token, config.phone_number_id)
    }

    res.sendStatus(200)

  } catch (error) {

    console.error("ERROR:", error)

    res.sendStatus(500)

  }
})

