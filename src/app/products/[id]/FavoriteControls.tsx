'use client'; // Runs on the client side

import { useState } from 'react';

// Type definition for data (props) passed to favorite control component
interface FavoriteControlsProps {
  productId: number;
  initialFavorite: boolean;
}

// Favorite control component
export default function FavoriteControls({ productId, initialFavorite }: FavoriteControlsProps) {
  // Favorite status
  const [isFavorite, setIsFavorite] = useState(initialFavorite);
  // Processing status
  const [loading, setLoading] = useState(false);

  // Event handler for favorite link click
  const handleToggleFavorite = async () => {
    setLoading(true); // Disable link during processing
    try {
      const method = isFavorite ? 'DELETE' : 'POST';
      const body = method === 'POST' ? JSON.stringify({ productId }) : null;
      const url = method === 'DELETE' ? `/api/favorites/${productId}` : `/api/favorites`;

      // Send POST or DELETE request to favorite registration/deletion API
      const res = await fetch(url, {
        method: method,
        body: body,
        headers: { 'Content-Type': 'application/json' }
      });

      if (res.ok) {
        // Reverse status on success
        setIsFavorite(!isFavorite);
      } else {
        const data = await res.json();
        alert(data.message || 'Operation failed.');
      }
    } catch (err) {
      console.error('Favorite operation error:', err);
      alert('Communication error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggleFavorite} disabled={loading}
      className="text-teal-800 hover:underline cursor-pointer"
      style={{ fontFamily: 'sans-serif' }}
    >
      {isFavorite ? '♥ Remove from Favorites' : '♡ Add to Favorites'}
    </button>
  );
}

