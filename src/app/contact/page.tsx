import Link from 'next/link';
import Form from 'next/form';
import { submitContactForm } from './actions';
import { Input, Textarea, FormField } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

// Contact page - Server Component
interface ContactPageProps {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ContactPage({ searchParams }: ContactPageProps) {
  const sp = await searchParams;
  const sent = sp?.sent;

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="my-4">
        <Link href="/" className="text-brand-800 hover:underline">
          ← Back to Home
        </Link>
      </div>

      <h1 className="text-center mb-8">Contact Us</h1>

      {sent && (
        <div className="w-full bg-green-100 text-green-800 p-3 text-center shadow-md flex items-center justify-center mb-6 rounded-md">
          Thank you for your message! We will get back to you soon.
        </div>
      )}


      <div className="max-w-2xl mx-auto">
        <Form action={submitContactForm} className="space-y-6 p-8 bg-white shadow-lg rounded-xl">
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

          <FormField label="Message" required>
            <Textarea
              id="message"
              name="message"
              rows={6}
              required
              placeholder="Please write your message here..."
            />
          </FormField>

          <div className="flex justify-between items-center">
            <Button variant="secondary" size="lg">
              <Link href="/">Cancel</Link>
            </Button>
            <Button type="submit" variant="primary" size="lg">
              Send Message
            </Button>
          </div>
        </Form>
      </div>
    </main>
  );
}