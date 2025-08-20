'use client';

import { useRouter, useSearchParams } from 'next/navigation';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
}

export default function Pagination({ currentPage, totalPages }: PaginationProps) {
  const router = useRouter();              // router object for navigation
  const searchParams = useSearchParams();  // query parameters from the URL

  // Event handler for page change
  // This function updates the URL with the new page number without reloading the page
  const handlePageChange = (newPage: number) => {
    // Get the current search parameters
    const params = new URLSearchParams(searchParams.toString());
    // Update the 'page' parameter with the new page number
    params.set('page', String(newPage));
    // Use the router to push the new URL with updated parameters
    router.push(`?${params.toString()}`);
  };

  // Base styles for pagination buttons
  const baseClasses = 'min-w-9 h-9 rounded border border-gray-300 mx-1 cursor-pointer';
  const hover = 'hover:bg-gray-100 hover:text-gray-800';
  const active = 'bg-indigo-500 text-white border-indigo-500';
  const disabled = 'opacity-50';

  return (
    <nav className="flex justify-center items-center mt-8" aria-label="Pagination">
      {/* Back（<） */}
      <button
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`${baseClasses} text-gray-700 ${hover} ${currentPage === 1 ? disabled : ''}`}
      >
        &lt;
      </button>

      {/* Page numbers */}
      {Array.from({ length: totalPages }, (_, i) => {
        const page = i + 1;
        const isActive = (page === currentPage);
        return (
          <button key={page} onClick={() => handlePageChange(page)} disabled={isActive}
            className={`${baseClasses} ${isActive ? active : 'text-gray-700 ' + hover}`}
          >
            {page}
          </button>
        );
      })}

      {/* Next（>） */}
      <button
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`${baseClasses} text-gray-700 ${hover} ${currentPage === totalPages ? disabled : ''}`}
      >
        &gt;
      </button>
    </nav>
  );
}

