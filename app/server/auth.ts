import { SignJWT, jwtVerify } from 'jose'

export interface JwtPayload {
  teacherId: string
  classId: string | null
}

function secretKey(jwtSecret: string) {
  return new TextEncoder().encode(jwtSecret)
}

export async function signToken(payload: JwtPayload, jwtSecret: string): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(secretKey(jwtSecret))
}

export async function verifyToken(token: string, jwtSecret: string): Promise<JwtPayload> {
  const { payload } = await jwtVerify(token, secretKey(jwtSecret))
  return payload as unknown as JwtPayload
}
