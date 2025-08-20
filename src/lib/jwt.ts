import { SignJWT, jwtVerify, type JWTPayload } from 'jose';

// Get secret key from environment variables (error if not exists)
const SECRET_KEY = process.env.JWT_SECRET as string;
const secret = new TextEncoder().encode(SECRET_KEY);

// Function to generate token
export function generateToken(payload: JWTPayload): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1h')
    .sign(secret);
}

// Function to verify token (returns null on failure)
export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch (err) {
    console.error('jwtVerify failed:', err);
    return null;
  }
}