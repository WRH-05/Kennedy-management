// Teacher compensation math.
//
// Percentage teachers are paid a share of tuition *actually collected* for the
// billing cycle, not of the projected price x roster. A pro-rated enrollment, an
// unpaid fee or a dropped student therefore lowers the payout, so the school
// never pays out money it did not receive.

export interface TeacherCompensation {
  compensation_type?: string | null
  fixed_salary_amount?: number | string | null
  percentage_cut?: number | string | null
}

export interface PaymentLike {
  status?: string | null
  amount?: number | string | null
}

/**
 * Sum the amounts of paid payments — the pool a percentage teacher is paid from.
 */
export function sumCollectedPool(payments: PaymentLike[] | null | undefined): number {
  return (payments || [])
    .filter((p) => p.status === 'paid')
    .reduce((sum, p) => sum + (Number(p.amount) || 0), 0)
}

/**
 * Teacher earnings for one billing cycle.
 *
 * `fixed_salary` ignores the pool; `percentage` (the default) takes
 * `percentage_cut` of the collected pool.
 */
export function computeTeacherEarnings(
  compensation: TeacherCompensation | null | undefined,
  collectedPool: number
): number {
  const comp = compensation || {}
  if (comp.compensation_type === 'fixed_salary') {
    return Number(comp.fixed_salary_amount) || 0
  }
  return Math.round(((Number(collectedPool) || 0) * (Number(comp.percentage_cut) || 0)) / 100)
}

/**
 * A payment is payable/editable until it is either paid or cancelled.
 * `pending` and `unpaid` are both shown as "Unpaid" in the UI.
 */
export function isPaymentOutstanding(status?: string | null): boolean {
  return status !== 'paid' && status !== 'cancelled'
}
