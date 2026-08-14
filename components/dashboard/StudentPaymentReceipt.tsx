"use client"

import { useEffect, useRef } from "react"
import { createPortal } from "react-dom"
import { useSchoolSettings } from "@/hooks/useSchoolSettings"

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

const DIVIDER = "--------------------------------"

export function StudentPaymentReceipt({ data, onDone }: { data: StudentReceiptData; onDone: () => void }) {
  const { settings } = useSchoolSettings()
  const onDoneRef = useRef(onDone)
  onDoneRef.current = onDone

  useEffect(() => {
    const handleAfterPrint = () => onDoneRef.current()
    window.addEventListener("afterprint", handleAfterPrint)
    const timer = setTimeout(() => window.print(), 150)
    return () => {
      clearTimeout(timer)
      window.removeEventListener("afterprint", handleAfterPrint)
    }
  }, [])

  const formattedDate = (() => {
    const d = new Date(data.paymentDate)
    return isNaN(d.getTime()) ? data.paymentDate : d.toLocaleString()
  })()

  return createPortal(
    <div id="printable-thermal-receipt" className="hidden print:block">
      <div className="text-center">
        <div className="font-bold">{settings?.school_name || "School"}</div>
        {settings?.address && <div>{settings.address}</div>}
        {settings?.phone && <div>{settings.phone}</div>}
      </div>
      <div>{DIVIDER}</div>
      <div>Receipt ID: {data.receiptId}</div>
      <div>Date &amp; Time: {formattedDate}</div>
      <div>Recorded By: {data.recordedByName}</div>
      <div>Student: {data.studentName}</div>
      {data.parentPhone && <div>Parent Phone: {data.parentPhone}</div>}
      <div>{DIVIDER}</div>
      <div>Payment: {data.sourceLabel}</div>
      {data.className && <div>Class: {data.className}</div>}
      <div>Amount Paid: {data.amount.toLocaleString()} DA</div>
      <div>{DIVIDER}</div>
      <div className="text-center">
        <div>Thank you!</div>
        <div>&nbsp;</div>
        <div>________________</div>
        <div>School Stamp</div>
      </div>
    </div>,
    document.body
  )
}
