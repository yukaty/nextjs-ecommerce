'use client'; // Runs on the client (browser) side

import { useRouter, usePathname } from 'next/navigation';
import { useState } from 'react';

// Type definition for data (props) passed to review control component
type ReviewControlsProps = {
  productId: number;
  loggedIn: boolean;
};

// Review control component (dedicated to product detail page)
export default function ReviewControls({ productId, loggedIn }: ReviewControlsProps) {
  const router = useRouter();
  const pathname = usePathname(); // Get current path

  // State management for review submission form
  const [rating, setRating] = useState(0); // Rating (number of stars)
  const [clickedRating, setClickedRating] = useState(0); // Confirmed star by click
  const [content, setContent] = useState(''); // Review content
  const [submitting, setSubmitting] = useState(false); // Submitting flag
  const [errorMessage, setErrorMessage] = useState(''); // Error message
  const [successMessage, setSuccessMessage] = useState<string | null>(null); // Success message

  // Event handler for clicking rating stars
  const handleScoreClick = (selectedScore: number) => {
    setRating(selectedScore);
    setClickedRating(selectedScore);
  };

  // Event handler for review submission button click
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault(); // Cancel default submission behavior
    setErrorMessage('');
    setSuccessMessage('');

    // Input data validation
    if (rating === 0 || !content.trim()) {
      setErrorMessage('Please fill in all fields.');
      return;
    }
    // Login required
    if (!loggedIn) {
      setErrorMessage('Login is required to post a review.');
      return;
    }

    // Update display during submission
    setSubmitting(true);

    try { // Send POST request to review registration API
      const res = await fetch(`/api/products/${productId}/reviews`, {
        method: 'POST',
        body: JSON.stringify({ rating, content }),
        headers: { 'Content-Type': 'application/json' }
      });

      if (res.ok) { // Refresh on successful submission
        setSuccessMessage('Review posted successfully!');
        // Reset form
        setRating(0);
        setContent('');
        // Refresh to reflect latest reviews
        router.refresh();
      } else { // Display error information on submission failure
        const data = await res.json();
        setErrorMessage(data.message || 'Failed to post review.');
      }
    } catch (err) {
      console.error('Review submission error:', err);
      setErrorMessage('Communication error occurred.');
    } finally {
      setSubmitting(false);
    }
  };

  // Button click handler for non-logged-in users
  const handleLoginRedirect = () => {
    // Set current page URL as redirect destination
    const redirectUrl = encodeURIComponent(pathname);
    router.push(`/login?redirect=${redirectUrl}`); // Navigate to login page
  };

  return (
    <div>
      <h2 className="mt-2">Post a Review</h2>
      {!loggedIn ? (
        <div className="text-center py-4">
          <p className="text-gray-600 mb-4">Please log in to post a review.</p>
          <button
            onClick={handleLoginRedirect}
            className="bg-brand-500 hover:bg-brand-600 text-white py-2 px-6 rounded-md shadow-md"
          >
            Log In to Post Review
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmitReview} className="space-y-4">
          <div>
            <label htmlFor="score" className="block text-gray-700 font-semibold mb-2">Rating</label>
            <div className="flex text-2xl text-yellow-500">
              {[1, 2, 3, 4, 5].map((s) => (
                <span
                  key={s} className="cursor-pointer"
                  onClick={() => handleScoreClick(s)}
                  onMouseEnter={() => setRating(s)} // Highlight stars on hover
                  onMouseLeave={() => setRating(clickedRating)} // Reset to clicked rating on mouse leave
                >
                  {s <= rating ? '★' : '☆'}
                </span>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="content" className="block text-gray-700 font-semibold mb-2">Comment</label>
            <textarea
              id="content" name="content" rows={4} value={content} disabled={submitting}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-brand-500 focus:border-brand-500 resize-y"
              placeholder="Write your review here..."
              onChange={(e) => setContent(e.target.value)}
            ></textarea>
            {errorMessage && <p className="text-red-500">{errorMessage}</p>}
            {successMessage && <p className="text-green-600">{successMessage}</p>}
          </div>

          <button
            type="submit" disabled={submitting}
            className={`w-full py-3 px-4 rounded-md
              ${submitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-brand-600 hover:bg-brand-700 text-white'}
            `}
          >
            {submitting ? 'Posting...' : 'Post Review'}
          </button>
        </form>
      )}
    </div>
  );
}

