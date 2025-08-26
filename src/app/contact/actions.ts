'use server';

import { redirect } from 'next/navigation';
import { executeQuery, TABLES } from '@/lib/db';
import { validateEmail, validateRequired } from '@/lib/validation';

export async function submitContactForm(formData: FormData) {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string; 
  const message = formData.get('message') as string;

  // Validate required fields
  const nameValidation = validateRequired(name, 'Name');
  if (!nameValidation.isValid) {
    throw new Error(nameValidation.error);
  }

  const emailRequiredValidation = validateRequired(email, 'Email');
  if (!emailRequiredValidation.isValid) {
    throw new Error(emailRequiredValidation.error);
  }

  const messageValidation = validateRequired(message, 'Message');
  if (!messageValidation.isValid) {
    throw new Error(messageValidation.error);
  }

  // Validate email format
  if (!validateEmail(email)) {
    throw new Error('Please enter a valid email address format.');
  }

  try {
    // Insert inquiry into database
    await executeQuery(`
      INSERT INTO ${TABLES.inquiries} (name, email, message)
      VALUES ($1, $2, $3)
    `, [name.trim(), email.trim(), message.trim()]);
  } catch (error) {
    console.error('Contact form submission error:', error);
    throw new Error('Failed to send your message. Please try again.');
  }

  // Redirect after successful database insertion
  redirect('/contact?sent=true');
}