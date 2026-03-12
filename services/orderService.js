const orders = new Map()

function getOrder(user) {

  if (!orders.has(user)) {

    orders.set(user, {
      items: [],
      status: "building"
    })

  }

  return orders.get(user)

}

function addItem(user, product) {

  const order = getOrder(user)

  order.items.push(product)

}

function clearOrder(user) {
  orders.delete(user)
}

module.exports = {
  getOrder,
  addItem,
  clearOrder
}