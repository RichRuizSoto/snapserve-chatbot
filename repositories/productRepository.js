const { getDB } = require("../config/db")

async function getTopProducts(estId) {

  const db = getDB()

  const [rows] = await db.query(`
    SELECT 
      id as id_producto,
      nombre_producto,
      precio
    FROM productos
    WHERE id_restaurante = ?
    AND disponible = 1
    ORDER BY creado_en DESC
    LIMIT 10
  `, [estId])

  return rows
}

async function searchProducts(estId, text) {

  const db = getDB()

  const [rows] = await db.query(`
    SELECT 
      id as id_producto,
      nombre_producto,
      precio
    FROM productos
    WHERE id_restaurante = ?
    AND disponible = 1
    AND nombre_producto LIKE ?
    LIMIT 5
  `, [estId, `%${text}%`])

  return rows
}

async function getMenu(estId) {

  const db = getDB()

  const [rows] = await db.query(`
    SELECT 
      id as id_producto,
      nombre_producto,
      precio
    FROM productos
    WHERE id_restaurante = ?
    AND disponible = 1
  `, [estId])

  return rows
}

module.exports = {
  getTopProducts,
  searchProducts,
  getMenu
}