const Pagination = ({
    currentPage,
    totalPages,
    totalCustomers,
    itemsPerPage,
    onPageChange,
    onNextPage,
    onPrevPage,
    onFirstPage,
    onLastPage
}) => {
    const startItem = ((currentPage - 1) * itemsPerPage) + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalCustomers);

    console.log('Pagination props:', { currentPage, totalPages, totalCustomers, itemsPerPage });

    // Generate page numbers to display
    const getPageNumbers = () => {
        const pages = [];
        const maxPagesToShow = 5;
        
        if (totalPages <= maxPagesToShow) {
            // Show all pages if total pages is less than or equal to max
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            // Show smart pagination
            const startPage = Math.max(1, currentPage - 2);
            const endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
            
            for (let i = startPage; i <= endPage; i++) {
                pages.push(i);
            }
        }
        
        return pages;
    };

    if (totalPages <= 1) return null;

    return (
        <div className="flex items-center justify-between py-2 px-2 bg-gray-50 border-t">
            {/* Left side - Info */}
            <div className="text-sm text-gray-600">
                Showing {startItem} to {endItem} of {totalCustomers} customers
            </div>

            {/* Right side - Pagination controls */}
            <div className="flex items-center gap-1">
                {/* First page */}
                <button
                    onClick={onFirstPage}
                    disabled={currentPage === 1}
                    className="px-3 py-1 text-sm border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="First page"
                >
                    «
                </button>

                {/* Previous page */}
                <button
                    onClick={onPrevPage}
                    disabled={currentPage === 1}
                    className="px-3 py-1 text-sm border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Previous page"
                >
                    ‹
                </button>

                {/* Page numbers */}
                {getPageNumbers().map((page) => (
                    <button
                        key={page}
                        onClick={() => onPageChange(page)}
                        className={`px-3 py-1 text-sm border rounded ${
                            currentPage === page
                                ? 'bg-[#4a90e2] text-white border-[#4a90e2]'
                                : 'hover:bg-gray-50'
                        }`}
                    >
                        {page}
                    </button>
                ))}

                {/* Next page */}
                <button
                    onClick={() => {
                        console.log('Next button clicked');
                        onNextPage();
                    }}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 text-sm border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Next page"
                >
                    ›
                </button>

                {/* Last page */}
                <button
                    onClick={onLastPage}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 text-sm border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Last page"
                >
                    »
                </button>
            </div>
        </div>
    );
};

export default Pagination;
