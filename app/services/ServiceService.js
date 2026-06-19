export class ServiceService {

  static validateService(
    service
  ) {

    if (
      !service.name
    ) {

      throw new Error(
        "Nome obrigatório"
      )

    }

    if (
      !service.schedule
    ) {

      throw new Error(
        "Horário obrigatório"
      )

    }

    if (
      service.price <= 0
    ) {

      throw new Error(
        "Preço inválido"
      )

    }

  }

}