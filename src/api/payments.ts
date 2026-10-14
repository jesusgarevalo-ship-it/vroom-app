import { apiFetch } from './client'

export interface PagoMovilConfirmPayload {
  orderId: string
  reference: string
  amountBs: number
  bank: string
}

export interface PagoMovilConfirmResponse {
  success: boolean
  orderId: string
  status: 'confirmed' | 'pending' | 'expired' | 'rejected'
  message: string
}

export interface PagoMovilPaymentInfo {
  bank: string
  phone: string
  amountBs: number
  reference: string
  expiresAt: string
}

export async function initiatePagoMovil(
  orderId: string,
  token: string
): Promise<PagoMovilPaymentInfo> {
  return apiFetch<PagoMovilPaymentInfo>(`/payments/pago-movil/initiate/${orderId}`, {
    method: 'POST',
    token,
  })
}

export async function confirmPagoMovil(
  payload: PagoMovilConfirmPayload,
  token: string
): Promise<PagoMovilConfirmResponse> {
  return apiFetch<PagoMovilConfirmResponse>('/payments/pago-movil/confirm', {
    method: 'POST',
    body: JSON.stringify(payload),
    token,
  })
}