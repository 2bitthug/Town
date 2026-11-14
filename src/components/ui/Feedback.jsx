import React, { useEffect, useRef, useState } from 'react'

const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])'

export function notifyTown({ type = 'info', title = '', message = '' }) {
  window.dispatchEvent(new CustomEvent('town-toast', { detail: { type, title, message } }))
}

export function confirmTown({ title = 'Confirm action', message, confirmLabel = 'Confirm', tone = 'danger' }) {
  return new Promise(resolve => {
    window.dispatchEvent(new CustomEvent('town-confirm', {
      detail: { title, message, confirmLabel, tone, resolve }
    }))
  })
}

export function useDialogFocus(dialogRef, onClose) {
  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return undefined
    const previousFocus = document.activeElement
    const focusables = () => [...dialog.querySelectorAll(FOCUSABLE)].filter(node => node.getClientRects().length)
    const first = focusables()[0]
    ;(first || dialog).focus()

    const onKeyDown = event => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
        return
      }
      if (event.key !== 'Tab') return
      const nodes = focusables()
      if (!nodes.length) {
        event.preventDefault()
        dialog.focus()
        return
      }
      const firstNode = nodes[0]
      const lastNode = nodes[nodes.length - 1]
      if (event.shiftKey && (document.activeElement === firstNode || document.activeElement === dialog)) {
        event.preventDefault()
        lastNode.focus()
      } else if (!event.shiftKey && document.activeElement === lastNode) {
        event.preventDefault()
        firstNode.focus()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      if (previousFocus?.isConnected && typeof previousFocus.focus === 'function') previousFocus.focus()
    }
  }, [dialogRef, onClose])
}

function ConfirmationDialog({ confirmation, onResolve }) {
  const dialogRef = useRef(null)
  const close = () => onResolve(false)
  useDialogFocus(dialogRef, close)
  return <div className="town-confirm-backdrop">
    <section className="town-confirm-dialog" ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="town-confirm-title" aria-describedby="town-confirm-message" tabIndex={-1}>
      <h2 id="town-confirm-title">{confirmation.title}</h2>
      <p id="town-confirm-message">{confirmation.message}</p>
      <div className="town-confirm-actions">
        <button type="button" className="button secondary" onClick={close}>Cancel</button>
        <button type="button" className={`button ${confirmation.tone === 'danger' ? 'danger' : 'primary'}`} onClick={() => onResolve(true)}>{confirmation.confirmLabel}</button>
      </div>
    </section>
  </div>
}

export function TownFeedbackHost() {
  const [toast, setToast] = useState(null)
  const [confirmation, setConfirmation] = useState(null)
  const toastTimer = useRef(null)

  useEffect(() => {
    const onToast = event => {
      window.clearTimeout(toastTimer.current)
      setToast({ ...event.detail, id: Date.now() })
      toastTimer.current = window.setTimeout(() => setToast(null), 6000)
    }
    const onConfirm = event => setConfirmation(event.detail)
    window.addEventListener('town-toast', onToast)
    window.addEventListener('town-confirm', onConfirm)
    return () => {
      window.removeEventListener('town-toast', onToast)
      window.removeEventListener('town-confirm', onConfirm)
      window.clearTimeout(toastTimer.current)
    }
  }, [])

  const resolveConfirmation = result => {
    confirmation?.resolve?.(result)
    setConfirmation(null)
  }

  return <>
    {toast && <div className={`town-toast town-toast-${toast.type}`} role={toast.type === 'error' ? 'alert' : 'status'} aria-live={toast.type === 'error' ? 'assertive' : 'polite'}>
      <div><strong>{toast.title}</strong><p>{toast.message}</p></div>
      <button type="button" aria-label="Dismiss notification" onClick={() => setToast(null)}>×</button>
    </div>}
    {confirmation && <ConfirmationDialog confirmation={confirmation} onResolve={resolveConfirmation} />}
  </>
}
