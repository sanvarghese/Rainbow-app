"use client";

import React, { useState, useEffect, useCallback } from 'react';
import ProductCard from '../ProductCard/ProductCard';
import "./RelatedProducts.css";
import FilterMenu from '../FilterMenu/FilterMenu';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Product {
    _id: string;
    productImage?: string;
    name: string;
    descriptionShort: string;
    price: number;
    offerPrice: number;
    discount: number;
    category: string;
    subCategory: string;
    foodType?: string;
    company: {
        name: string;
        companyLogo?: string;
    };
}

interface Pagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
}

interface Filters {
    categories: string[];
    minDiscount: number | null;
    search: string;
}

const ProductList = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState<Pagination>({
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
        hasMore: false,
    });
    const [filters, setFilters] = useState<Filters>({
        categories: [],
        minDiscount: null,
        search: '',
    });
    const [sortOption, setSortOption] = useState('newest');

    // Memoized fetch function to prevent unnecessary re-renders
    const fetchProducts = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: pagination.page.toString(),
                limit: pagination.limit.toString(),
                sortBy: sortOption,
            });

            // Add category filters
            filters.categories.forEach(cat => params.append('category', cat));

            // Add discount filter
            if (filters.minDiscount !== null) {
                params.append('minDiscount', filters.minDiscount.toString());
            }

            // Add search
            if (filters.search) {
                params.append('search', filters.search);
            }

            console.log('Fetching products with params:', params.toString());
            
            const res = await fetch(`/api/products?${params}`);
            
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            
            const data = await res.json();

            if (data.success) {
                setProducts(data.products);
                setPagination(data.pagination);
            } else {
                throw new Error(data.error || 'Failed to fetch products');
            }
        } catch (error) {
            console.error('Failed to fetch products:', error);
            setProducts([]);
            setPagination(prev => ({ ...prev, total: 0, totalPages: 0, hasMore: false }));
        } finally {
            setLoading(false);
        }
    }, [pagination.page, pagination.limit, sortOption, filters]);

    // Fetch products when dependencies change
    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const handleSortChange = (option: string) => {
        setSortOption(option);
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    const handleFilterChange = useCallback((newFilters: any) => {
        setFilters(prev => {
            // Only update if filters actually changed to prevent infinite loop
            if (
                JSON.stringify(prev.categories) === JSON.stringify(newFilters.categories || []) &&
                prev.minDiscount === newFilters.minDiscount
            ) {
                return prev;
            }
            
            return {
                ...prev,
                categories: newFilters.categories || [],
                minDiscount: newFilters.minDiscount,
            };
        });
        setPagination(prev => ({ ...prev, page: 1 }));
    }, []);

    const goToPage = (page: number) => {
        setPagination(prev => ({ ...prev, page }));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const sortOptions = [
        { value: 'newest', label: 'Date (Newest)' },
        { value: 'oldest', label: 'Date (Oldest)' },
        { value: 'priceAsc', label: 'Price (Low to High)' },
        { value: 'priceDesc', label: 'Price (High to Low)' },
        { value: 'nameAsc', label: 'Alphabetical (A-Z)' },
        { value: 'nameDesc', label: 'Alphabetical (Z-A)' },
        { value: 'discount', label: 'Discount (High to Low)' },
    ];

    return (
        <div className='container-fluid product-list-page'>
            <div className='row justify-content-center'>
                {/* Filter Sidebar */}
                <div className='col-12 col-sm-4 col-md-3 col-lg-2 mb-4'>
                    <FilterMenu onFilterChange={handleFilterChange} />
                </div>

                {/* Products Section */}
                <div className='col-12 col-sm-8 col-md-9 col-lg-10 mb-4'>
                    <div className="relatedProducts product-list">
                        <div className="container-fluid">
                            <div className="row justify-content-center">
                                {/* Header with Results Count and Sort */}
                                <div className="youmightheading productlist d-flex justify-content-between align-items-center mb-4">
                                    <h4 className="h4_1">
                                        {loading ? 'Loading...' : 
                                            `Showing ${((pagination.page - 1) * pagination.limit) + 1}-
                                            ${Math.min(pagination.page * pagination.limit, pagination.total)} 
                                            of ${pagination.total} results`
                                        }
                                    </h4>

                                    <div className="sort-section">
                                        <span className="sort-label">Sort by:</span>
                                        <select
                                            className="sort-dropdown box-wrapper"
                                            value={sortOption}
                                            onChange={(e) => handleSortChange(e.target.value)}
                                            disabled={loading}
                                        >
                                            {sortOptions.map((option) => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Loading State */}
                                {loading ? (
                                    <div className="col-12 text-center py-5">
                                        <div className="spinner-border text-success" role="status">
                                            <span className="visually-hidden">Loading...</span>
                                        </div>
                                        <p className="mt-3">Loading products...</p>
                                    </div>
                                ) : products.length === 0 ? (
                                    <div className="col-12 text-center py-5">
                                        <h5>No products found</h5>
                                        <p>Try adjusting your filters or search criteria</p>
                                        <button 
                                            className="btn btn-success mt-2"
                                            onClick={() => {
                                                setFilters({ categories: [], minDiscount: null, search: '' });
                                                setPagination(prev => ({ ...prev, page: 1 }));
                                            }}
                                        >
                                            Clear Filters
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        {/* Product Grid */}
                                        {products.map((product) => (
                                            <div
                                                key={product._id}
                                                className="col-12 col-sm-6 col-md-4 col-lg-3 mb-4"
                                            >
                                                <ProductCard
                                                    id={product._id}
                                                    img={product.productImage || '/placeholder-product.png'}
                                                    title={product.company?.name || 'Unknown Brand'}
                                                    subtitle={product.name}
                                                    rating="4.5"
                                                    reviews="0"
                                                    oldPrice={product.price > product.offerPrice ? `₹${product.price.toFixed(2)}` : ''}
                                                    newPrice={`₹${product.offerPrice.toFixed(2)}`}
                                                    discount={product.discount}
                                                />
                                            </div>
                                        ))}

                                        {/* Pagination */}
                                        {pagination.totalPages > 1 && (
                                            <div className="col-12 mt-4">
                                                <nav className="d-flex justify-content-center">
                                                    <ul className="pagination">
                                                        <li className={`page-item ${pagination.page === 1 ? 'disabled' : ''}`}>
                                                            <button
                                                                className="page-link"
                                                                onClick={() => goToPage(pagination.page - 1)}
                                                                disabled={pagination.page === 1}
                                                            >
                                                                <ChevronLeft className="w-4 h-4" />
                                                            </button>
                                                        </li>

                                                        {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                                                            .filter(page => {
                                                                return (
                                                                    page === 1 ||
                                                                    page === pagination.totalPages ||
                                                                    (page >= pagination.page - 1 && page <= pagination.page + 1)
                                                                );
                                                            })
                                                            .map((page, index, array) => {
                                                                if (index > 0 && page - array[index - 1] > 1) {
                                                                    return (
                                                                        <React.Fragment key={`ellipsis-${page}`}>
                                                                            <li className="page-item disabled">
                                                                                <span className="page-link">...</span>
                                                                            </li>
                                                                            <li className={`page-item ${pagination.page === page ? 'active' : ''}`}>
                                                                                <button
                                                                                    className="page-link"
                                                                                    onClick={() => goToPage(page)}
                                                                                >
                                                                                    {page}
                                                                                </button>
                                                                            </li>
                                                                        </React.Fragment>
                                                                    );
                                                                }
                                                                return (
                                                                    <li key={page} className={`page-item ${pagination.page === page ? 'active' : ''}`}>
                                                                        <button
                                                                            className="page-link"
                                                                            onClick={() => goToPage(page)}
                                                                        >
                                                                            {page}
                                                                        </button>
                                                                    </li>
                                                                );
                                                            })}

                                                        <li className={`page-item ${!pagination.hasMore ? 'disabled' : ''}`}>
                                                            <button
                                                                className="page-link"
                                                                onClick={() => goToPage(pagination.page + 1)}
                                                                disabled={!pagination.hasMore}
                                                            >
                                                                <ChevronRight className="w-4 h-4" />
                                                            </button>
                                                        </li>
                                                    </ul>
                                                </nav>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductList;