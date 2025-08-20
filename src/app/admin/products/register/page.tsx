'use client';

import ProductForm from '@/components/ProductForm';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ProductRegisterPage() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState('');

  // Event handler for form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();  // Cancel the default form submission behavior
    setErrorMessage(''); // Clear any existing error messages before submission

    // Create a FormData object from the form
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const imageFile = formData.get('imageFile') as File;
    const price = Number(formData.get('price') as string);
    const stock = Number(formData.get('stock') as string);

    // Validate input values
    if (!name.trim() || !imageFile) {
      setErrorMessage('Input all required fields.');
      return;
    }
    if (price < 0 || stock < 0) {
      setErrorMessage('Price and stock must be non-negative numbers.');
      return;
    }

    try {
      // Send a POST request to the product registration API
      const res = await fetch('/api/products', {
        method: 'POST',
        body: formData
      });

      if (res.ok) {
        router.push('/admin/products?registered=1'); // Redirect to product list on success
      } else {
        const data = await res.json();
        setErrorMessage(data.message || 'Product registration failed.');
      }
    } catch (err) {
      setErrorMessage('A communication error occurred.');
    }
  };

  return (
    <main className="max-w-xl mx-auto py-10">
      <h1 className="text-center mb-6">Product Registration</h1>
      {errorMessage && (
        <p className="text-red-600 text-center mb-4">{errorMessage}</p>
      )}
      <ProductForm
        onSubmit={handleSubmit}
        submitLabel="Register"
      />
    </main>
  );
}

