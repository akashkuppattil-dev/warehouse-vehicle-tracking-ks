import jwt from 'jsonwebtoken'

export type AuthTokenPayload = {
  userId?: string
  email?: string
  role?: 'admin' | 'manager' | 'driver'
}

export function verifyToken(token: string): AuthTokenPayload | null {
  const secret = process.env.JWT_SECRET

  if (!secret) {
    console.warn(
      '[auth] JWT_SECRET is not configured. Legacy API routes that expect auth_token cookies will return unauthorized.',
    )
    return null
  }

  try {
    return jwt.verify(token, secret) as AuthTokenPayload
  } catch {
    return null
  }
}
