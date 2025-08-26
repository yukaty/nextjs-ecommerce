import Link from "next/link";
import Image from "next/image";
import ProductCard from "@/components/ProductCard";
import { executeQuery, TABLES } from '@/lib/db';
import { type ProductData } from "@/types/product";

// Product data type definition
type Product = Pick<
  ProductData,
  "id" | "name" | "price" | "image_url" | "review_avg" | "review_count"
>;

interface HomePageProps {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function Home({ searchParams }: HomePageProps) {
  const sp = await searchParams;
  
  // Fetch product data directly from database (matching the original API queries)
  const pickUpQuery = `
    SELECT id, name, price, image_url
    FROM ${TABLES.products}
    ORDER BY sales_count DESC
    LIMIT 3
  `;
  
  const newArrivalQuery = `
    SELECT
      p.id,
      p.name,
      p.price,
      p.image_url,
      COALESCE(ROUND(AVG(r.score), 1), 0) AS review_avg,
      COALESCE(COUNT(r.id), 0) AS review_count
    FROM ${TABLES.products} AS p
    LEFT JOIN ${TABLES.reviews} AS r ON r.product_id = p.id
    GROUP BY p.id
    ORDER BY p.created_at DESC
    LIMIT 4
  `;
  
  const hotItemsQuery = `
    SELECT
      p.id,
      p.name,
      p.price,
      p.image_url,
      COALESCE(ROUND(AVG(r.score), 1), 0) AS review_avg,
      COALESCE(COUNT(r.id), 0) AS review_count
    FROM ${TABLES.products} AS p
    LEFT JOIN ${TABLES.reviews} AS r ON r.product_id = p.id
    WHERE p.is_featured = true
    GROUP BY p.id
    ORDER BY RANDOM()
    LIMIT 4
  `;

  const [pickUp, newArrival, hotItems] = await Promise.all([
    executeQuery<Product>(pickUpQuery),
    executeQuery<Product>(newArrivalQuery), 
    executeQuery<Product>(hotItemsQuery)
  ]);

  const message = sp?.registered
    ? "Registration completed successfully."
    : sp?.['logged-in']
    ? "Login successful."
    : sp?.['logged-out']
    ? "Logout successful."
    : sp?.submitted
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
          src="/images/main-visual.webp"
          alt="Main Visual"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white p-4">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 drop-shadow-md text-shadow-lg/50">
            Discover Canada’s Best
          </h1>
          <p className="text-base sm:text-lg md:text-xl mb-8 drop-shadow-md text-shadow-lg/50">
            Souvenirs, apparel, and gifts — all in one place.
          </p>
          <Link href="/products">
            <button className="px-6 py-3 bg-white text-brand-500 font-semibold rounded-full shadow-md hover:bg-gray-200 transition-colors text-sm sm:text-base border border-gray-700">
              Shop Now
            </button>
          </Link>
        </div>
      </section>

      <main className="container mx-auto px-8 pt-8 pb-12 flex flex-col gap-4 max-w-screen-xl">
        <section>
          <h2>
            <span>Featured Picks</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
            {pickUp.map((item) => (
              <ProductCard
                key={`pickup-${item.id}`}
                id={item.id.toString()}
                title={item.name}
                price={Number(item.price)}
                imageUrl={item.image_url ?? undefined}
              />
            ))}
          </div>
        </section>

        <section>
          <h2>
            <span>New Arrivals</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
            {newArrival.map((item) => (
              <ProductCard
                key={`new-${item.id}`}
                id={item.id.toString()}
                title={item.name}
                price={Number(item.price)}
                imageUrl={item.image_url ?? undefined}
                rating={item.review_avg ? Number(item.review_avg) : undefined}
                reviewCount={Number(item.review_count)}
                showCartButton
              />
            ))}
          </div>
        </section>

        <section>
          <h2>
            <span>Best Sellers</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
            {hotItems.map((item) => (
              <ProductCard
                key={`featured-${item.id}`}
                id={item.id.toString()}
                title={item.name}
                price={Number(item.price)}
                imageUrl={item.image_url ?? undefined}
                rating={item.review_avg ? Number(item.review_avg) : undefined}
                reviewCount={Number(item.review_count)}
                showCartButton
              />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
