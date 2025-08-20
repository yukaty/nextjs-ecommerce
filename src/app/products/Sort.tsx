'use client'; // Runs on the client (browser) side

// Type definition for data (props) passed to sort component
interface Props {
  sort: string; // Sort condition
  perPage: number; // Display count per page
  keyword: string; // Search keyword
}

// Sort component
export default function Sort({ sort, perPage, keyword }: Props) {
  return (
    <form action="/products" method="GET" className="flex flex-col md:flex-row gap-4">
      <input type="hidden" name="page" value="1" />
      <input type="hidden" name="perPage" value={perPage} />
      <input type="hidden" name="keyword" value={keyword} />
      <select
        name="sort"
        value={sort}
        className="border border-gray-300 rounded px-4 py-2 w-full md:w-48"
        onChange={(e) => e.currentTarget.form?.submit()}
      >
        <option value="new">Newest First</option>
        <option value="priceAsc">Price: Low to High</option>
        <option value="priceDesc">Price: High to Low</option>
      </select>
    </form>
  );
}

