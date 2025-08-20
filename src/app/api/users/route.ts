import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db'; // Common DB module
import { getAuthUser, type AuthUser, AUTH_TOKEN } from '@/lib/auth';
import bcrypt from 'bcrypt';
import { generateToken } from '@/lib/jwt';


// Register new user data
export async function POST(request: NextRequest) {
  try {
    // Get each data included in request
    const { name, email, password } = await request.json();

    // Check for empty input
    if (!name?.trim() || !email?.trim() || !password?.trim()) {
      return NextResponse.json({ message: 'Please fill in all fields.' }, { status: 400 });
    }

    // Email address format validation (only . and @ symbols allowed)
    const emailPattern = /^[a-zA-Z0-9.]@[a-zA-Z0-9.]$/;
    if (!emailPattern.test(email)) {
      return NextResponse.json({ message: 'Please enter a valid email address format.' }, { status: 400 });
    }

    // Check for duplicate email address
    const existingUser = await executeQuery<{ count: number }>(
      'SELECT COUNT(*) AS count FROM users WHERE email = ?',
      [email]
    );
    if (existingUser[0]?.count > 0) { // Same email address already registered
      return NextResponse.json({ message: 'This email address is already registered.' }, { status: 400 });
    }

    // Password character count check
    if (password.length < 8) {
      return NextResponse.json({ message: 'Password must be at least 8 characters long.' }, { status: 400 });
    }

    // Hash the password
    const hashed = await bcrypt.hash(password, 10);

    // Add user information to users table (register as regular user)
    await executeQuery(`
      INSERT INTO users (name, email, password, is_admin, enabled)
      VALUES (?, ?, ?, false, true);
      `, [name, email, hashed]
    );

    return NextResponse.json({ message: 'User registration completed successfully.' });
  } catch (err) {
    console.error('User registration error:', err);
    return NextResponse.json({ message: 'Server error occurred.' }, { status: 500 });
  }
}

// Update user information (name and email address only)
export async function PUT(request: NextRequest) {
  try {
    const user: AuthUser | null = await getAuthUser();
    if (!user) {
      return NextResponse.json({ message: 'Please log in.' }, { status: 401 });
    }

    // Get each data included in request
    const { name, email } = await request.json();

    // Check for empty input
    if (!name?.trim() || !email?.trim()) {
      return NextResponse.json({ message: 'Please fill in all fields.' }, { status: 400 });
    }

    // Email address format validation (only . and @ symbols allowed)
    const emailPattern = /^[a-zA-Z0-9.]@[a-zA-Z0-9.]$/;
    if (!emailPattern.test(email)) {
      return NextResponse.json({ message: 'Please enter a valid email address format.' }, { status: 400 });
    }

    // Check for duplicate email address (excluding self)
    const existingUser = await executeQuery<{ count: number }>(
      'SELECT COUNT(*) AS count FROM users WHERE email = ? AND id != ?',
      [email, user.userId]
    );
    if (existingUser[0]?.count > 0) {
      return NextResponse.json({ message: 'This email address is already in use.' }, { status: 400 });
    }

    // Update user information
    await executeQuery(
      'UPDATE users SET name = ?, email = ? WHERE id = ?;',
      [name, email, user.userId]
    );

    // Reissue JWT token with updated user information
    const newToken = await generateToken({
      userId: user.userId,
      name,
      email,
      isAdmin: user.isAdmin
    });

    const response = NextResponse.json({ message: 'Member information has been updated.' });
    // Set response cookies
    response.cookies.set({
      name: AUTH_TOKEN,
      value: newToken,
      httpOnly: true, // Prevent JavaScript access (XSS protection)
      // secure should only be true in production environment
      secure: process.env.NODE_ENV === 'production', // Send only over encrypted HTTPS (reduce eavesdropping risk)
      sameSite: 'strict', // Don't send cookies on cross-site requests (CSRF protection)
      // maxAge is in seconds
      maxAge: 60 * 60, // Expiration time (1 hour)
      path: '/', // Make cookies available for all paths
    });

    return response; // Return response with cookies set
  } catch (err) {
    console.error('Member information update error:', err);
    return NextResponse.json({ message: 'Server error occurred.' }, { status: 500 });
  }
}
