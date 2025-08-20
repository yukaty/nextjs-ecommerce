import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { type ReviewsResponse } from '@/types/review';
import Pagination from '@/components/Pagination';

// Reviews list page
export default async function ReviewsPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const resolvedParams = await params; // Get params asynchronously
  const productId = resolvedParams.id;

  const sp = await searchParams;
  const page = Number(sp?.page ?? '1');
  const perPage = 10; // Display count is fixed

  // Combine query parameters into a single string
  const query = new URLSearchParams({
    page: String(page),
    perPage: String(perPage)
  });

  // Fetch data from reviews API
  const res = await fetch(`${process.env.BASE_URL}/api/products/${productId}/reviews?${query.toString()}`, {
    cache: 'no-store'
  });

  if (!res.ok) {
    notFound();
  }

  const reviewsPageData: ReviewsResponse = await res.json();
  if (!Array.isArray(reviewsPageData.reviews)) {
    notFound();
  }

  return (
    <main className="p-8">
      <div className="my-4">
        <Link href={`/products/${productId}`} className="text-indigo-600 hover:underline">
          ← Back to Product Details
        </Link>
      </div>
      <h1 className="text-center mb-6">Reviews</h1>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {reviewsPageData.reviews.map((r) => (
          <div key={r.id} className="p-4 border border-gray-200 rounded-md shadow-sm">
            <div className="flex items-center text-yellow-500 text-lg mb-2">
              {Array.from({ length: 5 }, (_, i) => (
                <span key={i}>{i < r.score ? '★' : '☆'}</span>
              ))}
            </div>
            <p className="text-gray-800 mb-2">{r.content}</p>
            <p className="text-xs text-gray-500">
              {r.user_name} - {new Date(r.created_at).toLocaleDateString()}
            </p>
          </div>
        ))}
      </section>

      <section className="mb-8">
        {reviewsPageData.pagination.totalPages > 0 && (
          <Pagination
            currentPage={reviewsPageData.pagination.currentPage}
            totalPages={reviewsPageData.pagination.totalPages}
          />
        )}
      </section>
    </main>
  );
}

