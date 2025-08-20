'use client';

import { useRouter } from 'next/navigation';

export default function DeleteLink({ id, name }: { id: number; name: string }) {
  const router = useRouter();

  // Event handler for deleting an item
  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) {
      return; // Cancel deletion if user does not confirm
    }

    try { // API request to delete the item
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });

      if (res.ok) {
        // If deletion is successful, redirect to products page
        router.push(`/admin/products?deleted=1`);
      } else {
        const data = await res.json();
        alert(data.message || 'Failed to delete the item.');
      }
    } catch {
      alert('An error occurred while deleting the item.');
    }
  }

  return (
    <button
      onClick={handleDelete}
      className="text-red-600 hover:text-red-700 cursor-pointer"
    >
      Delete
    </button>
  )
}

