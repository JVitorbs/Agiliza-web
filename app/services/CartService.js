export class CartService {

  static addItem(cart, product) {

    const existingItem = cart.find(
      item => item.id === product.id
    )

    if (existingItem) {

      existingItem.quantity += 1

      return

    }

    cart.push({
      ...product,
      quantity: 1
    })

  }

  static removeItem(cart, productId) {

    const index = cart.findIndex(
      item => item.id === productId
    )

    if (index === -1) {
      throw new Error("Produto não encontrado no carrinho")
    }

    cart.splice(index, 1)

  }

  static calculateTotal(cart) {

    return cart.reduce(
      (total, item) =>
        total + (item.price * item.quantity),
      0
    )

  }

}