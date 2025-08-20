"use client"; // Runs on the client (browser) side

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import { type ProductData } from "@/types/product";

// Product data type definition
type Product = Pick<
  ProductData,
  "id" | "name" | "price" | "image_url" | "review_avg" | "review_count"
>;

export default function Home() {
  // State to hold product data
  const [pickUp, setPickUp] = useState<Product[]>([]);
  const [newArrival, setNewArrival] = useState<Product[]>([]);
  const [hotItems, setHotItems] = useState<Product[]>([]);

  // Execute once immediately after component display
  useEffect(() => {
    // Fetch data from products API
    fetch("/api/products/home")
      .then((res) => res.json()) // Convert to JSON format
      .then((data) => {
        // Update state
        setPickUp(data.pickUp);
        setNewArrival(data.newArrival);
        setHotItems(data.hotItems);
      })
      .catch((err) => console.error("Failed to fetch product data.", err)); // Error handling
  }, []);

  const searchParams = useSearchParams();
  const message = searchParams.get("registered")
    ? "Registration completed successfully."
    : searchParams.get("logged-in")
    ? "Login successful."
    : searchParams.get("logged-out")
    ? "Logout successful."
    : searchParams.get("submitted")
    ? "Inquiry submitted successfully. Please wait for our response."
    : null;

  return (
    <div className="min-h-screen font-[family-name:var(--font-geist-sans)]">
      {message && (
        <div className="bg-green-100 text-green-800 p-3 text-center shadow-md">
          {message}
        </div>
      )}

      <section className="relative w-full h-[60vh] sm:h-[70vh] overflow-hidden">
        <Image
          src="/images/main-visual.jpg"
          alt="Discover the latest collection"
          fill
          className="object-cover object-center"
          priority
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white p-4">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 drop-shadow-md text-shadow-lg/50">
            Discover the Latest Collection
          </h1>
          <p className="text-base sm:text-lg md:text-xl mb-8 drop-shadow-md text-shadow-lg/50">
            Find items to upgrade your style
          </p>
          <Link href="/products">
            <button className="px-6 py-3 bg-white text-blue-800 font-semibold rounded-full shadow-md hover:bg-gray-200 transition-colors text-sm sm:text-base border border-gray-700">
              Shop Now
            </button>
          </Link>
        </div>
      </section>

      <main className="container mx-auto px-8 pt-8 pb-12 flex flex-col gap-4 max-w-screen-xl">
        <section>
          <h2>
            <span>Pick Up</span>
            <span className="mx-2 font-light text-gray-400">|</span>
            <span className="text-base">Recommended Products</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
            {pickUp.slice(0, 3).map((item) => (
              <ProductCard
                key={`pickup-${item.id}`}
                id={item.id.toString()}
                title={item.name}
                price={item.price}
                imageUrl={item.image_url ?? undefined}
                imageSize={400}
              />
            ))}
          </div>
        </section>

        <section>
          <h2>
            <span>New Arrival</span>
            <span className="mx-2 font-light text-gray-400">|</span>
            <span className="text-base">New Arrivals</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
            {newArrival.slice(0, 4).map((item) => (
              <ProductCard
                key={`new-${item.id}`}
                id={item.id.toString()}
                title={item.name}
                price={item.price}
                imageUrl={item.image_url ?? undefined}
                rating={item.review_avg}
                reviewCount={item.review_count}
                showCartButton
              />
            ))}
          </div>
        </section>

        <section>
          <h2>
            <span>Hot Items</span>
            <span className="mx-2 font-light text-gray-400">|</span>
            <span className="text-base">Featured Products</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
            {hotItems.slice(0, 4).map((item) => (
              <ProductCard
                key={`featured-${item.id}`}
                id={item.id.toString()}
                title={item.name}
                price={item.price}
                imageUrl={item.image_url ?? undefined}
                rating={item.review_avg}
                reviewCount={item.review_count}
                showCartButton
              />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
