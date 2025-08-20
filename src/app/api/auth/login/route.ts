import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { executeQuery } from '@/lib/db';
import { generateToken } from '@/lib/jwt';

// JWT cookie name
const JWT_COOKIE = 'authToken';

// Login processing
export async function POST(request: NextRequest) {
  try {
    // Get email address and password from request body
    const { email, password } = await request.json();

    // Check for empty input
    if (!email?.trim() || !password?.trim()) {
      return NextResponse.json({ message: 'Please enter email address and password.' }, { status: 400 });
    }

    // Search for user matching the entered email address
    const users = await executeQuery<{ id: number; name: string; email: string; password: string; is_admin: boolean }>(
      'SELECT * FROM users WHERE email = ? AND enabled = TRUE',
      [email]
    );

    const user = users[0];
    if (!user) { // No matching user found
      return NextResponse.json({ message: 'Email address or password is incorrect.' }, { status: 401 });
    }

    // Password comparison
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return NextResponse.json({ message: 'Email address or password is incorrect.' }, { status: 401 });
    }

    // Authentication successful
    // Generate token (include desired user information in payload)
    const token = await generateToken({
      userId: user.id,
      name: user.name,
      email: user.email,
      isAdmin: user.is_admin
    });

    const response = NextResponse.json({
      message: 'Login successful',
      isAdmin: user.is_admin
    });

    // Set response cookies
    response.cookies.set({
      name: JWT_COOKIE,
      value: token,
      httpOnly: true, // Prevent JavaScript access (XSS protection)
      // secure should only be true in production environment
      secure: process.env.NODE_ENV === 'production', // Send only over encrypted HTTPS (reduce eavesdropping risk)
      sameSite: 'strict', // Don't send cookies on cross-site requests (CSRF protection)
      // maxAge is in seconds
      maxAge: 60 * 60, // Expiration time (1 hour)
      path: '/', // Make cookies available for all paths
    });

    return response; // Return response with cookies set
  } catch (error) {
    console.error('Login API error:', error);
    return NextResponse.json({ message: 'A server error occurred.' }, { status: 500 });
  }
}

