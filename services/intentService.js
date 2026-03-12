function detectIntent(text) {

  const message = text.toLowerCase()

  if (message.includes("menu") || message.includes("menú")) {
    return "menu"
  }

  if (message.includes("horario") || message.includes("hora")) {
    return "horario"
  }

  if (message.includes("ubicacion") || message.includes("dirección") || message.includes("direccion")) {
    return "ubicacion"
  }

  if (message.includes("humano") || message.includes("agente")) {
    return "humano"
  }

  if (message.includes("hola") || message.includes("buenas")) {
    return "saludo"
  }

  return "unknown"
}

module.exports = { detectIntent }