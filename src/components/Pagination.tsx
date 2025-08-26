import Link from 'next/link';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  basePath?: string;
  searchParams?: Record<string, string>;
}

export default function Pagination({ 
  currentPage, 
  totalPages, 
  basePath = '',
  searchParams = {}
}: PaginationProps) {
  // Helper function to create page URL
  const createPageUrl = (page: number) => {
    const params = new URLSearchParams({ 
      ...searchParams, 
      page: page.toString() 
    });
    return `${basePath}?${params.toString()}`;
  };

  // Base styles for pagination buttons
  const baseClasses = 'min-w-9 h-9 rounded border border-gray-300 mx-1 flex items-center justify-center';
  const hover = 'hover:bg-gray-100 hover:text-gray-800';
  const active = 'bg-brand-500 text-white border-brand-500';
  const disabled = 'opacity-50 cursor-not-allowed';

  return (
    <nav className="flex justify-center items-center mt-8" aria-label="Pagination">
      {/* Back (<) */}
      {currentPage === 1 ? (
        <span className={`${baseClasses} text-gray-700 ${disabled}`}>
          &lt;
        </span>
      ) : (
        <Link 
          href={createPageUrl(currentPage - 1)}
          className={`${baseClasses} text-gray-700 ${hover}`}
        >
          &lt;
        </Link>
      )}

      {/* Page numbers */}
      {Array.from({ length: totalPages }, (_, i) => {
        const page = i + 1;
        const isActive = (page === currentPage);
        
        if (isActive) {
          return (
            <span key={page} className={`${baseClasses} ${active}`}>
              {page}
            </span>
          );
        }
        
        return (
          <Link 
            key={page}
            href={createPageUrl(page)}
            className={`${baseClasses} text-gray-700 ${hover}`}
          >
            {page}
          </Link>
        );
      })}

      {/* Next (>) */}
      {currentPage === totalPages ? (
        <span className={`${baseClasses} text-gray-700 ${disabled}`}>
          &gt;
        </span>
      ) : (
        <Link 
          href={createPageUrl(currentPage + 1)}
          className={`${baseClasses} text-gray-700 ${hover}`}
        >
          &gt;
        </Link>
      )}
    </nav>
  );
}