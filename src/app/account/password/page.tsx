import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input, FormField } from '@/components/ui/Input';
import { redirect } from 'next/navigation';

// Server Action for password change
async function changePasswordAction(formData: FormData) {
  'use server';
  
  const oldPassword = formData.get('oldPassword') as string;
  const newPassword = formData.get('newPassword') as string;
  const confirmPassword = formData.get('confirmPassword') as string;

  // Input validation
  if (!oldPassword?.trim() || !newPassword?.trim() || !confirmPassword?.trim()) {
    throw new Error('Please fill in all fields.');
  }
  if (newPassword !== confirmPassword) {
    throw new Error('New passwords do not match.');
  }

  try {
    // Send PUT request to password change API
    const res = await fetch(`${process.env.BASE_URL}/api/users/password`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ oldPassword, newPassword }),
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.message || 'Password change failed.');
    }

    redirect('/account?password-changed=1');
  } catch (error) {
    console.error('Password change error:', error);
    throw new Error('A communication error occurred.');
  }
}

// Password change page
export default function PasswordChangePage() {
  return (
    <main className="max-w-md mx-auto py-10">
      <div className="my-4">
        <Link href="/account" className="text-brand-600 hover:underline">
          ← Back to My Page
        </Link>
      </div>
      <h1 className="text-center mb-6">Change Password</h1>

      <form action={changePasswordAction} className="w-full space-y-6 p-8 bg-white shadow-lg rounded-xl">
        <FormField label="Current Password" required>
          <Input
            type="password"
            id="oldPassword"
            name="oldPassword"
            required
          />
        </FormField>

        <FormField label="New Password" required>
          <Input
            type="password"
            id="newPassword"
            name="newPassword"
            required
          />
        </FormField>

        <FormField label="New Password (Confirmation)" required>
          <Input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            required
          />
        </FormField>

        <Button type="submit" variant="primary" fullWidth>
          Update
        </Button>
      </form>
     </main>
  );
}

