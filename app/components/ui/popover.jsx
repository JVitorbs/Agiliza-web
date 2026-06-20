"use client"

import { createContext, useContext, useState, useRef, useEffect, cloneElement } from "react"

const PopoverContext = createContext()

export function Popover({ children }) {
  const [open, setOpen] = useState(false)
  return (
    <PopoverContext.Provider value={{ open, setOpen }}>
      <div className="relative">
        {children}
      </div>
    </PopoverContext.Provider>
  )
}

export function PopoverTrigger({ children, asChild }) {
  const { open, setOpen } = useContext(PopoverContext)

  if (asChild) {
    return cloneElement(children, {
      onClick: (e) => {
        children.props.onClick?.(e)
        setOpen((v) => !v)
      },
    })
  }

  return (
    <button type="button" onClick={() => setOpen((v) => !v)}>
      {children}
    </button>
  )
}

export function PopoverContent({ children, align = "end", className = "" }) {
  const { open, setOpen } = useContext(PopoverContext)
  const ref = useRef()

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    if (open) {
      document.addEventListener("mousedown", handleClick)
      return () => document.removeEventListener("mousedown", handleClick)
    }
  }, [open, setOpen])

  if (!open) return null

  return (
    <div
      ref={ref}
      className={`absolute z-50 mt-2 min-w-[18rem] rounded-xl border border-border bg-background shadow-lg ${className}`}
      style={align === "end" ? { right: 0 } : { left: 0 }}
    >
      {children}
    </div>
  )
}
