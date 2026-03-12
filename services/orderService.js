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

function calculateTotal(order) {

  return order.items.reduce((acc, item) => acc + item.precio, 0)

}

function clearOrder(user) {
  orders.delete(user)
}

module.exports = {
  getOrder,
  addItem,
  calculateTotal,
  clearOrder
}