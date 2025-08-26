'use server';

import { redirect } from 'next/navigation';
import { executeQuery, TABLES } from '@/lib/db';
import { validateEmail, validateRequired } from '@/lib/validation';
import bcrypt from 'bcrypt';

export async function registerUser(formData: FormData) {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const confirmPassword = formData.get('confirmPassword') as string;

  // Validate required fields
  const nameValidation = validateRequired(name, 'Name');
  if (!nameValidation.isValid) {
    throw new Error(nameValidation.error);
  }

  const emailRequiredValidation = validateRequired(email, 'Email');
  if (!emailRequiredValidation.isValid) {
    throw new Error(emailRequiredValidation.error);
  }

  const passwordValidation = validateRequired(password, 'Password');
  if (!passwordValidation.isValid) {
    throw new Error(passwordValidation.error);
  }

  const confirmPasswordValidation = validateRequired(confirmPassword, 'Confirm Password');
  if (!confirmPasswordValidation.isValid) {
    throw new Error(confirmPasswordValidation.error);
  }

  // Validate email format
  if (!validateEmail(email)) {
    throw new Error('Please enter a valid email address format.');
  }

  // Check password match
  if (password !== confirmPassword) {
    throw new Error('Passwords do not match.');
  }

  try {
    // Check if user already exists
    const existingUsers = await executeQuery(
      `SELECT id FROM ${TABLES.users} WHERE email = $1`,
      [email.trim()]
    );

    if (existingUsers.length > 0) {
      throw new Error('This email address is already registered.');
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insert new user
    await executeQuery(`
      INSERT INTO ${TABLES.users} (name, email, password)
      VALUES ($1, $2, $3)
    `, [name.trim(), email.trim(), hashedPassword]);

  } catch (error) {
    console.error('User registration error:', error);
    throw new Error('Registration failed. Please try again.');
  }

  // Redirect to home page with success message
  redirect('/?registered=1');
}