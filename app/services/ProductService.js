export class ProductService {

  static validateProduct(product) {

    if (!product.name) {
      throw new Error("Nome obrigatório")
    }

    if (product.price === undefined || product.price === null) {
      throw new Error("Preço obrigatório")
    }

    if (Number(product.price) <= 0) {
      throw new Error("Preço inválido")
    }

    return true
  }

}