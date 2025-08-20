'use client'; // Runs on client (browser) side

import UserForm from '@/components/UserForm';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Props {
  initialValues: { name: string; email: string };
}

// Member edit form
export default function UserEditForm({ initialValues }: Props) {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState(''); // Error message

  // Event handler for form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Cancel default submit behavior
    setErrorMessage(''); // Clear errors before submission

    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;

    // Input validation
    if (!name?.trim() || !email?.trim()) {
      setErrorMessage('Please fill in all fields.');
      return;
    }

    try { // Send PUT request to member edit API
      const res = await fetch('/api/users', {
        method: 'PUT',
        body: JSON.stringify({ name, email }),
        headers: { 'Content-Type': 'application/json' }
      });

      if (res.ok) { // Redirect to My Page on successful update
        router.push('/account?edited=1');
      } else { // Display error information on update failure
        const data = await res.json();
        setErrorMessage(data.message || 'Update failed.');
      }
    } catch (err) {
      setErrorMessage('A communication error occurred.');
    }
  };

  return (
    <>
      {errorMessage && (
        <p className="text-red-600 text-center mt-8">{errorMessage}</p>
      )}
      <UserForm
        onSubmit={handleSubmit}
        initialValues={initialValues}
        submitLabel="Update"
      />
    </>
  );
}

