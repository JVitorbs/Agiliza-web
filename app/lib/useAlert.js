"use client"

import { useState, useCallback } from "react"

export function useAlert() {
  const [alert, setAlert] = useState(null)

  const showAlert = useCallback((message, variant = "destructive") => {
    setAlert({ message, variant })
  }, [])

  const dismissAlert = useCallback(() => {
    setAlert(null)
  }, [])

  return { alert, showAlert, dismissAlert }
}
