export class ServiceService {

  static validateService(service) {

    if (!service.name) {
      throw new Error("Nome obrigatório")
    }

    if (service.price === undefined || service.price === null || isNaN(Number(service.price))) {
      throw new Error("Preço obrigatório")
    }

    if (Number(service.price) <= 0) {
      throw new Error("Preço inválido")
    }

    if (
      !service.availableDays ||
      !Array.isArray(service.availableDays) ||
      service.availableDays.length === 0
    ) {
      throw new Error("Selecione pelo menos um dia")
    }

    if (!service.startTime || !service.endTime) {
      throw new Error("Informe horário inicial e final")
    }

    if (service.startTime >= service.endTime) {
      throw new Error("Horário inicial deve ser menor que o final")
    }

    return true

  }

}