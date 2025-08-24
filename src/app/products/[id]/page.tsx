import React from "react";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import Link from "next/link";
import Image from "next/image";
import { type ProductData } from "@/types/product";
import { type ReviewsResponse } from "@/types/review";
import { isLoggedIn, AUTH_TOKEN } from "@/lib/auth";
import CartControls from "@/app/products/[id]/CartControls";
import ReviewControls from "@/app/products/[id]/ReviewControls";
import FavoriteControls from "@/app/products/[id]/FavoriteControls";

// Product data type definition
type Product = ProductData; // No changes from base type

// Data required for product detail page
interface ProductDetailPageProps {
  params: {
    id: string; // Product ID obtained from URL
  };
}

// Get product data
async function getProduct(id: string): Promise<Product | null> {
  try {
    // Get product data from product API
    const res = await fetch(`${process.env.BASE_URL}/api/products/${id}`, {
      cache: "no-store",
    });

    // When fetch fails
    if (!res.ok) return null;

    // Convert data returned from API to JavaScript array
    const product = await res.json();
    return product;
  } catch (err) {
    console.error("Product fetch error:", err);
    return null;
  }
}

// Get favorite status for product ID
async function getFavoriteStatus(id: string): Promise<boolean> {
  try {
    // Get cookies
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_TOKEN)?.value;
    const headers: HeadersInit = token
      ? { Cookie: `${AUTH_TOKEN}=${token}` }
      : {};

    // Get registration status of product ID from favorites API
    const res = await fetch(`${process.env.BASE_URL}/api/favorites/${id}`, {
      cache: "no-store",
      headers: headers,
    });

    if (!res.ok) return false;

    // Return favorite registration status
    const { isFavorite } = await res.json();
    return isFavorite;
  } catch (err) {
    console.error("Favorite status fetch error:", err);
    return false;
  }
}

// Get review list for product ID
async function getReviews(id: string): Promise<ReviewsResponse | []> {
  // Get review list from review API
  const res = await fetch(
    `${process.env.BASE_URL}/api/products/${id}/reviews`,
    {
      cache: "no-store",
    }
  );
  if (!res.ok) return []; // Return empty array on failure
  return await res.json();
}

// Determine star display for reviews
function displayStars(avgRating: number) {
  const rating = Math.round(avgRating); // Round to nearest integer
  const filledStars = "★".repeat(rating); // Fill stars for rating
  const emptyStars = "☆".repeat(5 - rating); // Empty stars for remainder
  return `${filledStars}${emptyStars}`;
}

// Product detail page
export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const resolvedParams = await params; // Await required as it's retrieved asynchronously
  const productId = resolvedParams.id; // Get product ID from URL parameter

  // Get product data, review data, and favorite status in parallel
  const [product, reviewsResponse, isFavorite] = await Promise.all([
    getProduct(productId),
    getReviews(productId),
    getFavoriteStatus(productId),
  ]);

  // Show 404 page if product not found
  if (!product) {
    notFound(); // no return needed
  }

  // Get information needed for review display
  const reviews = Array.isArray(reviewsResponse) ? [] : reviewsResponse.reviews;
  const rating = Array.isArray(reviewsResponse)
    ? 0
    : reviewsResponse.review_avg;
  const reviewCount = Array.isArray(reviewsResponse)
    ? 0
    : reviewsResponse.pagination.totalItems;

  // Handle case where stock quantity doesn't exist
  const stock = product.stock ?? 0;

  // Switch display text and style based on stock status
  let stockText = "Out of Stock";
  let stockStyle = "text-red-600";
  if (stock > 10) {
    stockText = "In Stock";
    stockStyle = "text-green-600";
  } else if (stock > 0) {
    stockText = "Low Stock";
    stockStyle = "text-orange-500";
  }

  // Show dummy image if no image specified
  const finalImageUrl = product.image_url
    ? `/uploads/${product.image_url}`
    : "/images/no-image.jpg";

  // Get login status
  const loggedIn = await isLoggedIn();

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        <Image
          src={finalImageUrl}
          alt={product.name || "Product image"}
          width={800}
          height={800}
          className="w-full object-contain md:w-1/2 max-h-[600px]"
        />
        <div className="w-full md:w-1/2 space-y-6 pt-4">
          <h1>{product.name}</h1>
          <p className="text-gray-700 whitespace-pre-line">
            {product.description}
          </p>
          <p className="text-3xl font-bold text-brand-600">
            ${product.price.toLocaleString()}
            <span className="text-base font-normal text-gray-500">
              (tax included)
            </span>
          </p>
          {reviewCount > 0 ? (
            <div className="flex items-center mb-4">
              <span className="text-yellow-500 text-xl mr-2">
                {displayStars(rating)}
              </span>
              <span className="text-gray-700 text-base">
                {rating.toFixed(1)}
              </span>
              <span className="text-gray-500 text-sm ml-2">
                ({reviewCount} reviews)
              </span>
            </div>
          ) : (
            <p className="text-gray-500 text-sm mb-4">
              No reviews yet
            </p>
          )}
          <p className={`text-base font-medium ${stockStyle}`}>
            Stock Status: {stockText}
          </p>

          <div className="space-y-6 mt-8">
            {stock > 0 && (
              <CartControls
                cartItem={{
                  id: product.id.toString(),
                  title: product.name,
                  price: product.price,
                  imageUrl: product.image_url ?? "",
                }}
                stock={stock}
                loggedIn={loggedIn}
              />
            )}
            {loggedIn && (
              <FavoriteControls
                productId={product.id}
                initialFavorite={isFavorite}
              />
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8 mt-6 p-4 border border-gray-300 rounded-md shadow-sm">
        <div className="w-full md:w-1/2">
          <h2 className="mt-2">Reviews</h2>
          {reviewCount > 0 ? (
            <ul className="space-y-4 list-none">
              {reviews.slice(0, 3).map((r) => (
                <li key={r.id} className="border-b border-gray-300 pb-2">
                  <div className="flex items-center text-sm text-yellow-500 mb-1">
                    {displayStars(r.score)}
                  </div>
                  <p className="text-gray-800">{r.content}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {r.user_name}{" "}
                    {new Date(r.created_at).toLocaleDateString()}
                  </p>
                </li>
              ))}
              {reviewCount > 3 && (
                <div className="text-center mt-4">
                  <Link
                    href={`/products/${productId}/reviews`}
                    className="text-brand-600 hover:underline"
                  >
                    View All Reviews ({reviewCount})
                  </Link>
                </div>
              )}
            </ul>
          ) : (
            <p className="text-gray-500">No reviews yet.</p>
          )}
        </div>
        <div className="w-full md:w-1/2 border-l border-gray-200 pl-6">
          <ReviewControls productId={product.id} loggedIn={loggedIn} />
        </div>
      </div>
      <div className="mt-8 pt-4 border-t border-gray-200">
        <Link href="/products" className="text-brand-600 hover:underline">
          ← Back to Product List
        </Link>
      </div>
    </main>
  );
}
