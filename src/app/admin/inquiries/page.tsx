import Link from 'next/link';

// Data type definition for inquiries table
type Inquiry = {
  id: number;
  name: string;
  email: string;
  message: string;
  created_at: string;
};

// Inquiries list page
export default async function InquiriesPage() {
  // Fetch data from inquiries API
  const res = await fetch(`${process.env.BASE_URL}/api/inquiries`, {
    cache: 'no-store'
  });

  // Get data returned from API
  const inquiries: Inquiry[] = await res.json()
  if (!Array.isArray(inquiries)) {
    console.error('Failed to fetch inquiry data.');
    return <p className="text-center text-gray-500 text-lg py-10">Failed to fetch inquiry data.</p>;
  }

  // Common table styles
  const tableStyle = 'px-5 py-3 border-b border-gray-300';

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="my-4">
        <Link href="/admin/products" className="text-brand-600 hover:underline">
          ← Back to Product List
        </Link>
      </div>
      <h1 className="text-center">Inquiries List</h1>

      <div className="shadow-lg rounded-lg overflow-hidden">
        <table className="min-w-full leading-normal">
          <thead>
            <tr className="bg-gray-200 text-gray-700 text-left">
              <th className={tableStyle}>ID</th>
              <th className={tableStyle}>Name</th>
              <th className={tableStyle}>Email Address</th>
              <th className={tableStyle}>Inquiry Content</th>
              <th className={tableStyle}>Submitted Date</th>
            </tr>
          </thead>
          <tbody>
            {inquiries.length === 0 ? (
              <tr>
                <td colSpan={5} className={`${tableStyle} text-center text-gray-500`}>
                  No inquiries found.
                </td>
              </tr>
            ) : (
              inquiries.map((inquiry) => (
                <tr key={inquiry.id} className="hover:bg-gray-100">
                  <td className={tableStyle}>{inquiry.id}</td>
                  <td className={tableStyle}>{inquiry.name}</td>
                  <td className={tableStyle}>{inquiry.email}</td>
                  <td className={tableStyle}>{inquiry.message}</td>
                  <td className={tableStyle}>
                    {new Date(inquiry.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}

