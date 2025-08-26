import Link from 'next/link';
import { getAuthUser } from '@/lib/auth';
import { Button } from '@/components/ui/Button';
import { Input, FormField } from '@/components/ui/Input';
import { redirect } from 'next/navigation';

// Server Action for user edit
async function updateUserAction(formData: FormData) {
  'use server';
  
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;

  // Input validation
  if (!name?.trim() || !email?.trim()) {
    throw new Error('Please fill in all fields.');
  }

  try {
    // Get current user for authentication
    const user = await getAuthUser();
    if (!user) {
      throw new Error('Please log in to update your account.');
    }

    // Send PUT request to user API
    const res = await fetch(`${process.env.BASE_URL}/api/users`, {
      method: 'PUT',
      body: JSON.stringify({ name, email }),
      headers: { 'Content-Type': 'application/json' },
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.message || 'Update failed.');
    }

    redirect('/account?edited=1');
  } catch (error) {
    console.error('User update error:', error);
    throw new Error('A communication error occurred.');
  }
}

export default async function UserEditPage() {
  // Get the authenticated user
  const user = await getAuthUser();
  if (!user) {
    return <p className="text-center mt-10">Please log in to edit your account information.</p>;
  }

  return (
    <main className="max-w-md mx-auto py-10">
      <div className="my-4">
        <Link href="/account" className="text-brand-600 hover:underline">
          ← Back to My Page
        </Link>
      </div>
      <h1 className="text-center mb-4">Edit Account Information</h1>
      <p className="text-center mb-6">Update your account details below.</p>
      
      <form action={updateUserAction} className="w-full space-y-6 p-8 bg-white shadow-lg rounded-xl">
        <FormField label="Name" required>
          <Input
            type="text"
            id="name"
            name="name"
            required
            defaultValue={user.name}
          />
        </FormField>

        <FormField label="Email Address" required>
          <Input
            type="email"
            id="email"
            name="email"
            required
            defaultValue={user.email}
          />
        </FormField>

        <Button type="submit" variant="primary" fullWidth>
          Update
        </Button>
      </form>
    </main>
  );
}

