import Form from 'next/form';
import { registerUser } from './actions';
import { Input, FormField } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

// User registration page - Server Component
export default function UserRegisterPage() {
  return (
    <main className="max-w-md mx-auto py-10">
      <h1 className="text-center mb-4">User Registration</h1>
      
      <Form action={registerUser} className="w-full space-y-6 p-8 bg-white shadow-lg rounded-xl">
        <FormField label="Name" required>
          <Input
            type="text"
            id="name"
            name="name"
            required
            placeholder="Your full name"
          />
        </FormField>

        <FormField label="Email Address" required>
          <Input
            type="email"
            id="email"
            name="email"
            required
            placeholder="your.email@example.com"
          />
        </FormField>

        <FormField label="Password" required>
          <Input
            type="password"
            id="password"
            name="password"
            required
            placeholder="Enter your password"
          />
        </FormField>

        <FormField label="Confirm Password" required>
          <Input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            required
            placeholder="Confirm your password"
          />
        </FormField>

        <div className="flex justify-center">
          <Button type="submit" size="lg">
            Register
          </Button>
        </div>
      </Form>
    </main>
  );
}

