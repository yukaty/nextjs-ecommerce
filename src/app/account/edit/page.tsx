import Link from 'next/link';
import { getAuthUser } from '@/lib/auth';
import UserEditForm from '@/app/account/edit/UserEditForm';

export default async function UserEditPage() {
  // Get the authenticated user
  const user = await getAuthUser();
  if (!user) {
    return <p className="text-center mt-10">Please log in to edit your account information.</p>;
  }

  return (
    <main className="max-w-md mx-auto py-10">
      <div className="my-4">
        <Link href="/account" className="text-indigo-600 hover:underline">
          ← Back to Account
        </Link>
      </div>
      <h1 className="text-center mb-4">Edit Account Information</h1>
      <p className="text-center mb-6">Update your account details below.</p>
      <UserEditForm initialValues={{ name: user.name, email: user.email }} />
    </main>
  );
}

