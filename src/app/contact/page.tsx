'use client'; // Runs on the client (browser) side

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

// Contact page
export default function ContactPage() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState('');

  // Event handler for form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Cancel default submission behavior
    setErrorMessage('');

    const formData = new FormData(e.currentTarget);
    const name = (formData.get('name') as string)?.trim();
    const email = (formData.get('email') as string)?.trim();
    const message = (formData.get('message') as string)?.trim();

    // Input data validation
    if (!name || !email || !message) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }

    try { // Send POST request to inquiry registration API
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        body: JSON.stringify({ name, email, message }),
        headers: { 'Content-Type': 'application/json' }
      });

      if (res.ok) { // Navigate to top page on successful submission
        router.push('/?submitted=1');
      } else { // Display error information on submission failure
        const data = await res.json();
        setErrorMessage(data.message || 'Submission failed.');
      }
    } catch (err) {
      setErrorMessage('Communication error occurred.');
    }
  };

  // Common style for input fields
  const inputStyle = 'w-full border border-gray-300 px-3 py-2 rounded-sm focus:ring-2 focus:ring-indigo-500';
  // Common style for labels
  const labelStyle = 'block font-bold mb-1';
  // Common style for badges
  const badgeStyle = 'ml-2 px-2 py-0.5 bg-red-500 text-white text-xs font-semibold rounded-md';

  return (
    <main className="max-w-xl mx-auto py-10">
      <div className="my-4">
        <Link href="/" className="text-indigo-600 hover:underline">
          ← Back to Home
        </Link>
      </div>
      <h1 className="text-center mb-6">Contact Us</h1>
      {errorMessage && <p className="text-red-600 text-center mb-4">{errorMessage}</p>}
      <form onSubmit={handleSubmit} className="w-full space-y-6 p-8 bg-white shadow-lg rounded-xl">
        <label htmlFor="name" className={labelStyle}>
          Full Name<span className={badgeStyle}>Required</span>
        </label>
        <input type="text" id="name" name="name" required className={inputStyle} />

        <label htmlFor="email" className={labelStyle}>
          Email Address<span className={badgeStyle}>Required</span>
        </label>
        <input type="email" id="email" name="email" required className={inputStyle} />

        <label htmlFor="message" className={labelStyle}>
          Message<span className={badgeStyle}>Required</span>
        </label>
        <textarea
          id="message" name="message" required rows={5}
          className={inputStyle}
        ></textarea>

        <button type="submit" className="w-full mt-2 bg-indigo-500 hover:bg-indigo-600 text-white py-2 rounded-sm">
          Submit
        </button>
      </form>
    </main>
  );
}

