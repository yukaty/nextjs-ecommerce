"use client"; // Client component that runs on the browser side

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/hooks/useCart";
import { useState, useEffect } from "react";

// Type definition for data (props) passed to product card component
export interface ProductCardProps {
  id: string; // Product ID
  title: string; // Product title
  price: number; // Product price

  imageUrl?: string; // Product image URL

  rating?: number; // Review rating (average)
  reviewCount?: number; // Total number of reviews

  showCartButton?: boolean; // Whether to show "Add to Cart" button
  className?: string; // For external style adjustments
}

// Common product card component
export default function ProductCard({
  id,
  title,
  price,
  imageUrl,
  rating,
  reviewCount,
  showCartButton = false,
  className = "",
}: ProductCardProps) {
  // Get cart management functions
  const { addItem, isInCart } = useCart();

  // Hydration-safe cart state
  const [inCart, setInCart] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Update cart state after component mounts to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
    setInCart(isInCart(id));
  }, [id, isInCart]);

  // Event handler for cart button click
  const handleCart = () => {
    // Add to cart
    addItem({ id, title, price, imageUrl });
    // Update local state immediately for better UX
    setInCart(true);
  };

  // Show dummy image if no image specified
  const finalImageUrl = imageUrl
    ? `/uploads/${imageUrl}`
    : "/images/no-image.jpg";

  // Determine star display for reviews
  const displayStars = (avgRating: number) => {
    const rating = Math.round(avgRating); // Round to nearest integer
    const filledStars = "★".repeat(rating); // Fill stars for rating
    const emptyStars = "☆".repeat(5 - rating); // Empty stars for remainder
    return `${filledStars}${emptyStars}`;
  };

  return (
    <div className={`bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden mx-2 ${className}`}>
      <Link href={`/products/${id}`}>
        <div className="aspect-square relative">
          <Image
            src={finalImageUrl}
            alt={title || "Product image"}
            fill
            sizes="300px"
            className="object-cover"
          />
        </div>
      </Link>
      <div className="p-4">
        <Link href={`/products/${id}`}>
          <h3 className="text-lg font-semibold text-gray-900 hover:text-brand-600 mb-2">
            {title}
          </h3>
        </Link>
        {rating !== undefined && reviewCount !== undefined && mounted ? (
          Number(reviewCount) > 0 ? (
            <p className="flex items-center text-sm mb-2">
              <span className="text-yellow-500 mr-1">
                {displayStars(Number(rating) || 0)}
              </span>
              <span className="text-gray-600">({Number(reviewCount)} reviews)</span>
            </p>
          ) : (
            <p className="text-xs text-gray-400 mb-2">
              No reviews yet
            </p>
          )
        ) : null}
        <p className="text-xl font-bold text-gray-900 mb-4">
          ${Number(price).toFixed(2)}
        </p>
        {showCartButton && (
          <button
            onClick={!inCart ? handleCart : undefined}
            disabled={inCart}
            className={`w-full py-2 px-4 rounded-sm transition-colors font-medium
              ${
                inCart && mounted
                  ? "bg-brand-500 text-white cursor-default"
                  : "border border-brand-500 text-brand-500 hover:bg-brand-500 hover:text-white"
              }
            `}
          >
            {inCart && mounted ? "Added to Cart" : "Add to Cart"}
          </button>
        )}
      </div>
    </div>
  );
}
