export class AppointmentValidationError extends Error {

  constructor(message, status = 400) {
    super(message)
    this.status = status
  }

}

export class AppointmentService {

  static validateDate(date) {

    if (!date) {
      throw new AppointmentValidationError("A data é obrigatória")
    }

    const parsedDate = new Date(date)

    if (isNaN(parsedDate.getTime())) {
      throw new AppointmentValidationError("Formato de data inválido")
    }

    if (parsedDate < new Date()) {
      throw new AppointmentValidationError("Data inválida")
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
      throw new AppointmentValidationError("Horário indisponível", 409)
    }

    return true
  }

  static validateAppointment(
    appointments,
    newAppointment
  ) {

    if (!newAppointment.servicoId) {
      throw new AppointmentValidationError("O ID do serviço é obrigatório")
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