import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';
import { getAuthUser, type AuthUser } from '@/lib/auth';
import bcrypt from 'bcrypt';

// Change user password
export async function PUT(request: NextRequest) {
  try {
    const user: AuthUser | null = await getAuthUser();
    if (!user) {
      return NextResponse.json({ message: 'Please log in.' }, { status: 401 });
    }

    // Get each data included in request
    const { oldPassword, newPassword } = await request.json();

    // Check for empty input
    if (!oldPassword?.trim() || !newPassword?.trim()) {
      return NextResponse.json({ message: 'Please fill in all fields.' }, { status: 400 });
    }

    // Check new password character count
    if (newPassword.length < 8) {
      return NextResponse.json({ message: 'Please enter a password of 8 characters or more.' }, { status: 400 });
    }

    // Get current password
    const result = await executeQuery<{ password: string }>(
      'SELECT password FROM users WHERE id = ?',
      [user.userId]
    );
    const oldHashed = result[0]?.password;
    if (!oldHashed) {
      return NextResponse.json({ message: 'User information not found.' }, { status: 404 });
    }

    // Check if current password is correct
    const passwordMatch = await bcrypt.compare(oldPassword, oldHashed);
    if (!passwordMatch) {
      return NextResponse.json({ message: 'Current password is incorrect.' }, { status: 400 });
    }

    // Hash and update new password
    const newHashed = await bcrypt.hash(newPassword, 10);
    await executeQuery(
      'UPDATE users SET password = ? WHERE id = ?',
      [newHashed, user.userId]
    );

    return NextResponse.json({ message: 'Password has been changed.' });
  } catch (err) {
    console.error('Password change error:', err);
    return NextResponse.json({ message: 'A server error occurred.' }, { status: 500 });
  }
}

