import Link from "next/link";
import { type Metadata } from 'next';

// Define webpage metadata (reflected in head element)
export const metadata: Metadata = {
  title: '404: Page Not Found'
};

// 404 page
export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center text-center">
      <h1>404: Page Not Found</h1>
      <p className="text-gray-600 mb-6">
        The URL may be incorrect, or the page may have been moved or deleted.
      </p>
      <Link href="/" className="text-brand-600 hover:underline">
        Back to Home
      </Link>
    </main>
  );
}

