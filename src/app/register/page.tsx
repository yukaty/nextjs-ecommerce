'use client'; // Runs on client (browser) side

import UserForm from '@/components/UserForm';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

// User registration page
export default function UserRegisterPage() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState(''); // Error message

  // Event handler for form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Cancel default form submission behavior
    setErrorMessage(''); // Clear errors before submission

    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    // Input data validation
    if (!name?.trim() || !email?.trim() || !password?.trim() || !confirmPassword?.trim()) {
      setErrorMessage('Please fill in all fields.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    try { // Send POST request to user registration API
      const res = await fetch('/api/users', {
        method: 'POST',
        body: JSON.stringify({ name, email, password }),
        headers: { 'Content-Type': 'application/json' }
      });

      if (res.ok) { // Navigate to top page on successful registration
        router.push('/?registered=1'); // Notify registration success via query parameter
      } else { // Show error information on registration failure
        const data = await res.json();
        setErrorMessage(data.message || 'Registration failed.');
      }
    } catch (err) {
      setErrorMessage('A communication error occurred.');
    }
  };

  return (
    <main className="max-w-md mx-auto py-10">
      <h1 className="text-center mb-4">User Registration</h1>
      {errorMessage && (
        <p className="text-red-600 text-center mt-8">{errorMessage}</p>
      )}
      <UserForm
        onSubmit={handleSubmit}
        withPassword={true}
        submitLabel="Register"
      />
    </main>
  );
}

