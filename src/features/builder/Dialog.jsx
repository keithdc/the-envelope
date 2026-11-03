"use client"

import { useEffect, useRef } from "react"
import { X } from "lucide-react"
import "./Dialog.css"

/**
 * A small, accessible modal dialog. Replaces window.prompt() so creating a
 * template / project happens in-app with proper styling and a category picker.
 *
 * Closes on backdrop click, the ✕ button, or Escape. Focus moves to the first
 * field on open. Submit is wired by the caller via the form's onSubmit.
 *
 * props:
 *   title        heading text
 *   onClose()    dismiss without confirming
 *   onSubmit(e)  form submit handler (caller reads its own controlled state)
 *   submitLabel  confirm button text
 *   children     the form fields
 */
export default function Dialog({
  title,
  onClose,
  onSubmit,
  submitLabel = "Create",
  children,
}) {
  const firstFieldRef = useRef(null)

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose()
    document.addEventListener("keydown", onKey)
    // focus the first focusable field inside the dialog
    firstFieldRef.current
      ?.querySelector("input, select, textarea, button")
      ?.focus()
    return () => document.removeEventListener("keydown", onKey)
  }, [onClose])

  return (
    <div className="dlg-backdrop" onClick={onClose}>
      <div
        className="dlg"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="dlg-head">
          <h2>{title}</h2>
          <button className="dlg-close" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </header>

        <form
          ref={firstFieldRef}
          className="dlg-body"
          onSubmit={(e) => {
            e.preventDefault()
            onSubmit(e)
          }}
        >
          {children}
          <div className="dlg-actions">
            <button type="button" className="dlg-btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="dlg-btn dlg-btn--primary">
              {submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
