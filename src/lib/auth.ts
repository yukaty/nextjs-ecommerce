import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';

// Type definition for authenticated user
export type AuthUser = {
  userId: number;
  name: string;
  email: string;
  isAdmin: boolean;
};

// Token name used for JWT authentication
export const AUTH_TOKEN = 'authToken';

// Get authenticated user information
export async function getAuthUser(): Promise<AuthUser | null> {
  const cookieStore = await cookies(); // Get cookies asynchronously
  const token = cookieStore.get(AUTH_TOKEN)?.value;
  if (!token) { // Token does not exist
    return null;
  }

  // Get token verification result
  const user = await verifyToken(token) as AuthUser | null;
  return user;
}

// Check if user is logged in
export async function isLoggedIn(): Promise<boolean> {
  const user = await getAuthUser();
  return user !== null;
}

// Check if user is an administrator
export async function isAdmin(): Promise<boolean> {
  const user = await getAuthUser();
  return user?.isAdmin ?? false;
}
