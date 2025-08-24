import React from "react";
import ProductList from "@/components/ProductList";
import { type ProductCardProps } from "@/components/ProductCard";
import { type ProductData } from "@/types/product";
import Pagination from "@/components/Pagination";
import Sort from "@/app/products/Sort";

// Product data type definition
type Product = Pick<ProductData, "id" | "name" | "price" | "image_url" | "review_avg" | "review_count">;

// Data required for product list page
interface ProductsPageData {
  products: Product[]; // Product data array
  // Pagination information
  pagination: {
    currentPage: number;
    perPage: number;
    totalItems: number;
    totalPages: number;
  };
}

// Product list page
export default async function ProductsPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  // searchParams is retrieved asynchronously, so await is required
  const sp = await searchParams;

  // Get required data from URL query parameters
  const page = Number(sp?.page ?? "1");
  const perPage = Number(sp?.perPage ?? "16");
  const sort = typeof sp?.sort === "string" ? sp.sort : "new";
  const keyword = typeof sp?.keyword === 'string' ? sp.keyword : '';

  // Combine query parameters into one string
  const query = new URLSearchParams({
    page: String(page),
    perPage: String(perPage),
    sort,
    keyword,
  });

  // Get product data from product API
  const res = await fetch(
    `${process.env.BASE_URL}/api/products?${query.toString()}`,
    {
      cache: "no-store",
    }
  );

  // Convert data returned from API to JavaScript array
  const productsPageData: ProductsPageData = await res.json();
  if (!Array.isArray(productsPageData.products)) {
    console.error("Failed to fetch product data.");
    return (
      <p className="text-center text-gray-500 text-lg py-10">
        Failed to fetch product data.
      </p>
    );
  }

  // Convert to product card format
  const products: ProductCardProps[] = productsPageData.products.map(
    (row: Product) => ({
      id: String(row.id),
      title: row.name,
      price: row.price,
      rating: row.review_avg,
      reviewCount: row.review_count,
      imageUrl: row.image_url ?? undefined,
    })
  );

  return (
    <main className="p-8">
      <h1>Product List</h1>
      <section className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <p className="text-lg mt-4">
          {keyword && (
            <>
              Search results for &quot;<span className="font-bold">{keyword}</span>&quot;:
            </>
          )}
          &nbsp;{productsPageData.pagination.totalItems} products found
          ( Page {productsPageData.pagination.currentPage} of {productsPageData.pagination.totalPages}&nbsp;)
        </p>
        <Sort sort={sort} perPage={perPage} keyword={keyword} />
      </section>
      <section className="mb-8">
        <ProductList products={products} />
      </section>

      <section className="mb-8">
        {productsPageData.pagination.totalPages > 0 && (
          <Pagination
            currentPage={productsPageData.pagination.currentPage}
            totalPages={productsPageData.pagination.totalPages}
          />
        )}
      </section>
    </main>
  );
}
