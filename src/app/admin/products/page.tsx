import Link from "next/link";
import { type ProductData } from "@/types/product";
import Pagination from "@/components/Pagination";
import DeleteLink from "@/components/DeleteLink";

type Product = Pick<
  ProductData,
  "id" | "name" | "price" | "stock" | "updated_at"
>;

interface ProductsPageData {
  products: Product[];
  pagination: {
    currentPage: number;
    perPage: number;
    totalItems: number;
    totalPages: number;
  };
}

// Product List Page for Admin
export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  // Await searchParams to ensure it's resolved
  const sp = await searchParams;

  // Pagination parameters
  const page = Number(sp?.page ?? "1");
  const perPage = Number(sp?.perPage ?? "20");

  // Fetch product data from the API
  const res = await fetch(
    `${process.env.BASE_URL}/api/products?page=${page}&perPage=${perPage}`,
    {
      cache: "no-store",
    }
  );

  // Handle fetch errors
  const { products, pagination }: ProductsPageData = await res.json();
  if (!Array.isArray(products)) {
    console.error("Failed to fetch product data.");
    return (
      <p className="text-center text-gray-500 text-lg py-10">
        Failed to fetch product data.
      </p>
    );
  }

  // Common table styles
  const tableStyle = "px-5 py-3 border-b border-gray-300";

  // Determine message based on searchParams
  const message = sp?.registered
    ? "Registered a new product."
    : sp?.edited
    ? "Updated the product."
    : sp?.deleted
    ? "Deleted the product."
    : null;

  return (
    <>
      {message && (
        <div className="w-full bg-green-100 text-green-800 p-3 text-center shadow-md flex items-center justify-center">
          {message}
        </div>
      )}
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-center">Product List</h1>
        <div className="flex justify-end mb-4">
          <Link
            href="/admin/inquiries"
            className="bg-gray-400 hover:bg-gray-500 text-white py-2 px-4 rounded-sm font-semibold mr-2"
          >
            Inquiries
          </Link>
          <Link
            href="/admin/products/register"
            className="bg-brand-500 hover:bg-brand-600 text-white py-2 px-4 rounded-sm font-semibold"
          >
            Add New Product
          </Link>
        </div>

        <div className="shadow-lg rounded-lg overflow-hidden">
          <table className="min-w-full leading-normal">
            <thead>
              <tr className="bg-gray-200 text-gray-700 text-left">
                <th className={tableStyle}>ID</th>
                <th className={tableStyle}>Product Name</th>
                <th className={tableStyle}>Price</th>
                <th className={tableStyle}>Stock</th>
                <th className={tableStyle}>Last Updated</th>
                <th className={tableStyle}></th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className={`${tableStyle} text-center text-gray-500`}
                  >
                  No products found.
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-100">
                    <td className={tableStyle}>{product.id}</td>
                    <td className={tableStyle}>{product.name}</td>
                    <td className={tableStyle}>
                      ${product.price.toLocaleString()}
                    </td>
                    <td className={tableStyle}>{product.stock}</td>
                    <td className={tableStyle}>
                      {product.updated_at
                        ? new Date(product.updated_at).toLocaleDateString()
                        : "-"}
                    </td>
                    <td className={tableStyle}>
                      <Link
                        href={`/admin/products/${product.id}`}
                        className="text-brand-600 hover:text-brand-700 mr-6"
                      >
                        Edit
                      </Link>
                      <DeleteLink id={product.id} name={product.name} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <section className="mb-8">
          {pagination.totalPages > 0 && (
            <Pagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
            />
          )}
        </section>
      </div>
    </>
  );
}
