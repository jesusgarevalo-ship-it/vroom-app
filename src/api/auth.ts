import { apiFetch } from './client'

interface OtpResponse {
  message: string
  expiresIn: number
}

interface VerifyOtpResponse {
  user: {
    id: string
    phone: string
    name?: string
    email?: string
  }
  accessToken: string
  refreshToken: string
}

interface RefreshTokenResponse {
  accessToken: string
}

export async function sendOtp(phone: string): Promise<OtpResponse> {
  return apiFetch<OtpResponse>('/auth/send-otp', {
    method: 'POST',
    body: JSON.stringify({ phone }),
  })
}

export async function verifyOtp(
  phone: string,
  code: string
): Promise<VerifyOtpResponse> {
  return apiFetch<VerifyOtpResponse>('/auth/verify-otp', {
    method: 'POST',
    body: JSON.stringify({ phone, code }),
  })
}

export async function refreshToken(refreshToken: string): Promise<RefreshTokenResponse> {
  return apiFetch<RefreshTokenResponse>('/auth/refresh', {
    method: 'POST',
    body: JSON.stringify({ refreshToken }),
    token: refreshToken,
  })
}

export async function logout(token: string): Promise<void> {
  await apiFetch('/auth/logout', {
    method: 'POST',
    token,
  })
}