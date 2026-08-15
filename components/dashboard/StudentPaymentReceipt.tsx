"use client"

export interface StudentReceiptData {
  receiptId: string
  studentName: string
  parentPhone?: string | null
  amount: number
  sourceLabel: string
  className?: string | null
  recordedByName: string
  paymentDate: string
}

type ReceiptSettings = {
  school_name?: string | null
  address?: string | null
  phone?: string | null
  logo_url?: string | null
} | null

const DIVIDER = "--------------------------------"

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

/**
 * Prints an 80mm thermal receipt synchronously by appending a temporary
 * #printable-thermal-receipt element to <body> and calling window.print()
 * directly within the current user gesture (no React state/effect timing).
 */
export function printStudentReceipt(data: StudentReceiptData, settings: ReceiptSettings): void {
  const formattedDate = (() => {
    const d = new Date(data.paymentDate)
    return isNaN(d.getTime()) ? data.paymentDate : d.toLocaleString()
  })()

  const html = `
    <img src="${escapeHtml(settings?.logo_url || "/home.png")}" alt="Logo" class="receipt-logo" />
    <div style="text-align:center">
      <div style="font-weight:bold">${escapeHtml(settings?.school_name || "School")}</div>
      ${settings?.address ? `<div>${escapeHtml(settings.address)}</div>` : ""}
      ${settings?.phone ? `<div>${escapeHtml(settings.phone)}</div>` : ""}
    </div>
    <div>${DIVIDER}</div>
    <div>Reçu N°: ${escapeHtml(data.receiptId)}</div>
    <div>Date &amp; Heure: ${escapeHtml(formattedDate)}</div>
    <div>Caissier: ${escapeHtml(data.recordedByName)}</div>
    <div>Élève: ${escapeHtml(data.studentName)}</div>
    ${data.parentPhone ? `<div>Tél Parent: ${escapeHtml(data.parentPhone)}</div>` : ""}
    <div>${DIVIDER}</div>
    <div>Type de Paiement: ${escapeHtml(data.sourceLabel)}</div>
    ${data.className ? `<div>Classe / Cours: ${escapeHtml(data.className)}</div>` : ""}
    <div>Montant Payé: ${data.amount.toLocaleString()} DA</div>
    <div>${DIVIDER}</div>
    <div style="text-align:center">
      <div>Merci de votre confiance !</div>
      <div>&nbsp;</div>
      <div>________________</div>
      <div>Cachet et Signature</div>
    </div>
    <div class="stamp-space"></div>
  `

  const el = document.createElement("div")
  el.id = "printable-thermal-receipt"
  el.style.display = "none"
  el.innerHTML = html
  document.body.appendChild(el)

  document.body.classList.add("printing-receipt")

  const cleanup = () => {
    document.body.classList.remove("printing-receipt")
    if (el.parentNode) el.parentNode.removeChild(el)
  }
  window.addEventListener("afterprint", cleanup, { once: true })

  window.print()
}
