export class AppointmentService {

  static validateDate(date) {

    if (!date) {
      throw new Error("A data é obrigatória")
    }

    const parsedDate = new Date(date)

    if (isNaN(parsedDate.getTime())) {
      throw new Error("Formato de data inválido")
    }

    if (parsedDate < new Date()) {
      throw new Error("Data inválida")
    }

    return true
  }

  static validateConflict(
    appointments,
    newAppointment
  ) {

    const conflict = appointments.find(
      appointment =>
        appointment.servicoId ===
          newAppointment.servicoId &&
        appointment.scheduledAt ===
          newAppointment.scheduledAt
    )

    if (conflict) {
      throw new Error("Horário indisponível")
    }

    return true
  }

  static validateAppointment(
    appointments,
    newAppointment
  ) {

    if (!newAppointment.servicoId) {
      throw new Error("O ID do serviço é obrigatório")
    }

    this.validateDate(
      newAppointment.scheduledAt
    )

    this.validateConflict(
      appointments,
      newAppointment
    )

    return true
  }

}