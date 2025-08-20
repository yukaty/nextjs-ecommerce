'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ProductForm from '@/components/ProductForm';
import { type ProductData } from '@/types/product';

// Product data type definition
type Product = ProductData; // No changes from base type

// Product edit page
export default function ProductEditPage() {
  const router = useRouter();
  const { id: productId } = useParams();

  // Manage product data, error messages, and product loading state
  const [productData, setProductData] = useState<Product | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(true);

  // Fetch product data when product ID changes
  useEffect(() => {
    const getProduct = async () => {
      try {
        const res = await fetch(`/api/products/${productId}`);
        const data = await res.json();
        if (!res.ok) {
          setErrorMessage(data.message || 'Failed to fetch product information.');
          setLoading(false); // Loading complete
          return;
        }
        setProductData(data); // Update product data
      } catch {
        setErrorMessage('A communication error occurred.');
      } finally {
        setLoading(false); // Loading complete
      }
    };

    // Fetch product data for the current ID
    if (productId) {
      getProduct();
    }
  }, [productId]);

  // Form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Cancel default submit behavior
    setErrorMessage(''); // Clear errors before submission

    // Generate form data
    const formData = new FormData(e.currentTarget);

    // Get each input data
    const name = formData.get('name') as string;
    const price = Number(formData.get('price') as string);
    const stock = Number(formData.get('stock') as string);

    // Input validation (allowing no image file)
    if (!name.trim()) {
      setErrorMessage('Product name is required.');
      return;
    }
    if (price < 0 || stock < 0) {
      setErrorMessage('Please enter a value of 0 or greater for price and stock.');
      return;
    }

    try { // Send PUT request to product edit API
      const res = await fetch(`/api/products/${productId}`, {
        method: 'PUT',
        body: formData
      });

      if (res.ok) { // Redirect to admin product list page on successful update
        router.push('/admin/products?edited=1'); // Notify update success via query parameter
      } else {
        const data = await res.json();
        setErrorMessage(data.message || 'Update failed.');
      }
    } catch {
      setErrorMessage('A communication error occurred.');
    }
  };

  // Display while loading product data
  if (loading) {
    return <div className="text-center py-12 text-gray-600 text-lg">Loading product data...</div>;
  }

  return (
    <main className="max-w-xl mx-auto py-10">
      <h1 className="text-center mb-6">Edit Product</h1>
      {errorMessage && (
        <p className="text-red-600 text-center mb-4">{errorMessage}</p>
      )}
      {productData && (
        <ProductForm
          onSubmit={handleSubmit}
          initialValues={productData}
          submitLabel="Update"
        />
      )}
    </main>
  );
}

