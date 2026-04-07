// components/Admin/AdminProductSection.tsx
'use client';

import React, { useState, useEffect } from 'react';
import {
    Package, Plus, Edit, Trash2, Eye, CheckCircle, XCircle, X,
    Building, Search, Filter, Clock, Grid, List, ChevronLeft, ChevronRight,
    Info, Calendar, Users, AlertCircle
} from 'lucide-react';
import AdminCreateProduct from './AdminCreateProduct';

interface Variant {
    _id?: string;
    variantType: string;
    variantUnit?: string;
    variantValue: string;
    displayValue: string;
    quantity: number;
    price: number;
    offerPrice: number;
}

interface Product {
    _id: string;
    name: string;
    descriptionShort?: string;
    descriptionLong?: string;
    price?: number;
    offerPrice?: number;
    quantity?: number;
    category: string;
    subCategory?: string;
    foodType?: string;
    productImages: string[];
    badges?: string;
    status: 'pending' | 'approved' | 'rejected' | 'removed';
    hasVariants?: boolean;
    variants?: Variant[];
    companyId: {
        _id: string;
        name: string;
        email: string;
        companyLogo?: string;
    };
    userId: {
        _id: string;
        name: string;
        email: string;
    };
    createdAt: string;
}

type StatusFilter = 'all' | 'pending' | 'approved' | 'rejected' | 'removed';
type ViewMode = 'grid' | 'list';

const AdminProductSection = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<StatusFilter>('pending');
    const [searchTerm, setSearchTerm] = useState('');
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<ViewMode>('grid');
    
    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(12);
    const [showFilters, setShowFilters] = useState(false);
    const [categoryFilter, setCategoryFilter] = useState('');
    const [categories, setCategories] = useState<string[]>([]);
    const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    useEffect(() => {
        if (!showCreateForm && !editingProduct) {
            fetchProducts();
        }
    }, [showCreateForm, editingProduct, filter]);

    // Reset to first page when filter or search changes
    useEffect(() => {
        setCurrentPage(1);
    }, [filter, searchTerm, categoryFilter]);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const statusParam = filter === 'all' ? 'all' : filter;
            const res = await fetch(`/api/admin/products?status=${statusParam}`);

            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }

            const data = await res.json();

            if (data.success) {
                setProducts(data.products);
                const uniqueCategories = Array.from(new Set(data.products.map((p: Product) => p.category))) as string[];
                setCategories(uniqueCategories);
            } else {
                showNotification(data.error || 'Failed to fetch products', 'error');
            }
        } catch (error) {
            console.error('Failed to fetch products:', error);
            showNotification('Failed to fetch products', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleApproval = async (productId: string, action: 'approve' | 'reject') => {
        try {
            const res = await fetch('/api/admin/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ productId, action }),
            });

            const data = await res.json();

            if (data.success) {
                showNotification(data.message, 'success');
                fetchProducts();
                setSelectedProduct(null);
            } else {
                showNotification(data.error || 'Failed to update product status', 'error');
            }
        } catch (error) {
            console.error('Failed to update product:', error);
            showNotification('Failed to update product status', 'error');
        }
    };

    const handleDelete = async (productId: string) => {
        if (!confirm('Are you sure you want to remove this product? It will be moved to removed list.')) return;

        setDeletingId(productId);
        try {
            const res = await fetch(`/api/admin/products/${productId}`, {
                method: 'DELETE',
            });

            const data = await res.json();

            if (data.success) {
                setProducts(products.filter(p => p._id !== productId));
                showNotification('Product moved to removed list successfully', 'success');
                if (selectedProduct?._id === productId) {
                    setSelectedProduct(null);
                }
            } else {
                throw new Error(data.error || 'Failed to remove product');
            }
        } catch (error: any) {
            showNotification(error.message || 'Failed to remove product', 'error');
        } finally {
            setDeletingId(null);
        }
    };

    const handleEdit = async (product: Product) => {
        try {
            const res = await fetch(`/api/admin/products/${product._id}`);
            const data = await res.json();

            if (data.success) {
                setEditingProduct(data.product);
                setShowCreateForm(true);
            } else {
                showNotification('Failed to load product data', 'error');
            }
        } catch (error) {
            console.error('Error loading product for edit:', error);
            showNotification('Failed to load product data', 'error');
        }
    };

    const handleCreateSuccess = () => {
        setShowCreateForm(false);
        setEditingProduct(null);
        fetchProducts();
    };

    const handleCancel = () => {
        setShowCreateForm(false);
        setEditingProduct(null);
    };

    const showNotification = (message: string, type: 'success' | 'error') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    // Filter products based on search and category
    const filteredProducts = products.filter((product) => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.companyId?.name?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = !categoryFilter || product.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    // Pagination calculations
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentProducts = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

    // Pagination controls
    const goToPage = (page: number) => {
        setCurrentPage(Math.max(1, Math.min(page, totalPages)));
    };

    const goToPreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const goToNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    // Generate page numbers to display
    const getPageNumbers = () => {
        const pageNumbers = [];
        const maxVisible = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
        let endPage = Math.min(totalPages, startPage + maxVisible - 1);
        
        if (endPage - startPage + 1 < maxVisible) {
            startPage = Math.max(1, endPage - maxVisible + 1);
        }
        
        for (let i = startPage; i <= endPage; i++) {
            pageNumbers.push(i);
        }
        
        return pageNumbers;
    };

    // Items per page options
    const itemsPerPageOptions = [12, 24, 48, 96];

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'approved':
                return { color: 'bg-green-100 text-green-800', icon: CheckCircle, text: 'Approved' };
            case 'rejected':
                return { color: 'bg-red-100 text-red-800', icon: XCircle, text: 'Rejected' };
            case 'removed':
                return { color: 'bg-gray-100 text-gray-800', icon: AlertCircle, text: 'Removed' };
            default:
                return { color: 'bg-yellow-100 text-yellow-800', icon: Clock, text: 'Pending' };
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'approved': return 'border-green-500';
            case 'rejected': return 'border-red-500';
            case 'removed': return 'border-gray-500';
            default: return 'border-yellow-500';
        }
    };

    // Get display price (handle variants)
    const getDisplayPrice = (product: Product) => {
        if (product.hasVariants && product.variants && product.variants.length > 0) {
            const minPrice = Math.min(...product.variants.map(v => v.offerPrice));
            const maxPrice = Math.max(...product.variants.map(v => v.offerPrice));
            if (minPrice === maxPrice) {
                return `₹${minPrice}`;
            }
            return `₹${minPrice} - ₹${maxPrice}`;
        }
        return `₹${product.offerPrice}`;
    };

    if (showCreateForm) {
        return (
            <div className="animate-fadeIn">
                <button
                    onClick={handleCancel}
                    className="mb-6 flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors rounded-lg hover:bg-gray-100"
                >
                    <ChevronLeft className="w-5 h-5" />
                    Back to Products
                </button>
                <AdminCreateProduct
                    initialData={editingProduct}
                    onSuccess={handleCreateSuccess}
                />
            </div>
        );
    }

    const stats = {
        total: products.length,
        pending: products.filter(p => p.status === 'pending').length,
        approved: products.filter(p => p.status === 'approved').length,
        rejected: products.filter(p => p.status === 'rejected').length,
        removed: products.filter(p => p.status === 'removed').length,
    };

    return (
        <div className="space-y-6 animate-fadeIn">
            {/* Notification Toast */}
            {notification && (
                <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg animate-slideIn ${notification.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                    }`}>
                    {notification.message}
                </div>
            )}

            {/* Header Stats */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-blue-100 text-sm">Total Products</p>
                            <p className="text-3xl font-bold mt-1">{stats.total}</p>
                        </div>
                        <Package className="w-10 h-10 text-blue-200" />
                    </div>
                </div>
                <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl p-6 text-white shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-yellow-100 text-sm">Pending Approval</p>
                            <p className="text-3xl font-bold mt-1">{stats.pending}</p>
                        </div>
                        <Clock className="w-10 h-10 text-yellow-200" />
                    </div>
                </div>
                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-green-100 text-sm">Approved</p>
                            <p className="text-3xl font-bold mt-1">{stats.approved}</p>
                        </div>
                        <CheckCircle className="w-10 h-10 text-green-200" />
                    </div>
                </div>
                <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-6 text-white shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-red-100 text-sm">Rejected</p>
                            <p className="text-3xl font-bold mt-1">{stats.rejected}</p>
                        </div>
                        <XCircle className="w-10 h-10 text-red-200" />
                    </div>
                </div>
                <div className="bg-gradient-to-br from-gray-500 to-gray-600 rounded-xl p-6 text-white shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-100 text-sm">Removed</p>
                            <p className="text-3xl font-bold mt-1">{stats.removed}</p>
                        </div>
                        <AlertCircle className="w-10 h-10 text-gray-200" />
                    </div>
                </div>
            </div>

            {/* Action Bar */}
            <div className="bg-white rounded-xl shadow-sm p-4">
                <div className="flex flex-col lg:flex-row gap-4 justify-between">
                    <div className="flex gap-3 flex-wrap">
                        <button
                            onClick={() => setShowCreateForm(true)}
                            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 font-medium shadow-md"
                        >
                            <Plus className="w-5 h-5" />
                            Create Product
                        </button>

                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search products..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent w-64"
                            />
                        </div>

                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${showFilters ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            <Filter className="w-4 h-4" />
                            Filters
                            {categoryFilter && <span className="ml-1 w-2 h-2 bg-green-500 rounded-full"></span>}
                        </button>
                    </div>

                    <div className="flex gap-3 flex-wrap">
                        <div className="flex gap-2 bg-gray-100 rounded-lg p-1">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-white shadow-sm text-green-600' : 'text-gray-600'
                                    }`}
                            >
                                <Grid className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-white shadow-sm text-green-600' : 'text-gray-600'
                                    }`}
                            >
                                <List className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={() => setFilter('all')}
                                className={`px-4 py-2 rounded-lg font-medium transition-all ${filter === 'all'
                                    ? 'bg-blue-600 text-white shadow-md'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                All ({stats.total})
                            </button>
                            <button
                                onClick={() => setFilter('pending')}
                                className={`px-4 py-2 rounded-lg font-medium transition-all ${filter === 'pending'
                                    ? 'bg-yellow-600 text-white shadow-md'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                Pending ({stats.pending})
                            </button>
                            <button
                                onClick={() => setFilter('approved')}
                                className={`px-4 py-2 rounded-lg font-medium transition-all ${filter === 'approved'
                                    ? 'bg-green-600 text-white shadow-md'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                Approved ({stats.approved})
                            </button>
                            <button
                                onClick={() => setFilter('rejected')}
                                className={`px-4 py-2 rounded-lg font-medium transition-all ${filter === 'rejected'
                                    ? 'bg-red-600 text-white shadow-md'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                Rejected ({stats.rejected})
                            </button>
                            <button
                                onClick={() => setFilter('removed')}
                                className={`px-4 py-2 rounded-lg font-medium transition-all ${filter === 'removed'
                                    ? 'bg-gray-600 text-white shadow-md'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                Removed ({stats.removed})
                            </button>
                        </div>
                    </div>
                </div>

                {/* Advanced Filters */}
                {showFilters && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                                <select
                                    value={categoryFilter}
                                    onChange={(e) => setCategoryFilter(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                >
                                    <option value="">All Categories</option>
                                    {categories.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Products Display */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading products...</p>
                    </div>
                </div>
            ) : filteredProducts.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-xl shadow-sm">
                    <Package className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">No Products Found</h3>
                    <p className="text-gray-600 mb-6">
                        {searchTerm || categoryFilter
                            ? 'Try adjusting your search or filters'
                            : filter === 'pending'
                                ? 'No products waiting for approval'
                                : filter === 'approved'
                                    ? 'No approved products yet'
                                    : filter === 'rejected'
                                        ? 'No rejected products'
                                        : filter === 'removed'
                                            ? 'No removed products'
                                            : 'Get started by creating your first product'}
                    </p>
                    {!searchTerm && !categoryFilter && filter === 'all' && (
                        <button
                            onClick={() => setShowCreateForm(true)}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all font-medium shadow-md"
                        >
                            <Plus className="w-5 h-5" />
                            Create Your First Product
                        </button>
                    )}
                </div>
            ) : (
                <>
                    {/* Items per page and info */}
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4">
                        <div className="text-sm text-gray-600">
                            Showing {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, filteredProducts.length)} of {filteredProducts.length} products
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">Show:</span>
                            <select
                                value={itemsPerPage}
                                onChange={(e) => {
                                    setItemsPerPage(Number(e.target.value));
                                    setCurrentPage(1);
                                }}
                                className="px-2 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500"
                            >
                                {itemsPerPageOptions.map(option => (
                                    <option key={option} value={option}>{option}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Grid View */}
                    {viewMode === 'grid' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {currentProducts.map((product) => {
                                const statusBadge = getStatusBadge(product.status);
                                const StatusIcon = statusBadge.icon;
                                return (
                                    <div key={product._id} className={`bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-t-4 ${getStatusColor(product.status)}`}>
                                        {/* Product Image */}
                                        <div className="h-48 bg-gradient-to-br from-gray-50 to-gray-100 relative group">
                                            {product.productImages && product.productImages.length > 0 ? (
                                                <img
                                                    src={product.productImages[0]}
                                                    alt={product.name}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <Package className="w-16 h-16 text-gray-300" />
                                                </div>
                                            )}
                                            {product.badges && (
                                                <img
                                                    src={product.badges}
                                                    alt="Badge"
                                                    className="absolute top-2 left-2 w-10 h-10 object-contain"
                                                />
                                            )}
                                            {product.foodType && (
                                                <span className={`absolute top-2 right-2 px-2 py-1 rounded-lg text-xs font-medium shadow-md ${product.foodType === 'veg'
                                                    ? 'bg-green-500 text-white'
                                                    : 'bg-red-500 text-white'
                                                    }`}>
                                                    {product.foodType === 'veg' ? '🟢 Veg' : '🔴 Non-Veg'}
                                                </span>
                                            )}
                                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                                                <button
                                                    onClick={() => setSelectedProduct(product)}
                                                    className="bg-white text-gray-800 px-4 py-2 rounded-lg font-medium transform -translate-y-2 group-hover:translate-y-0 transition-all duration-300"
                                                >
                                                    Quick View
                                                </button>
                                            </div>
                                        </div>

                                        <div className="p-4">
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="text-lg font-semibold text-gray-800 line-clamp-1 flex-1">
                                                    {product.name}
                                                </h3>
                                                <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusBadge.color}`}>
                                                    <StatusIcon className="w-3 h-3" />
                                                    {statusBadge.text}
                                                </span>
                                            </div>

                                            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                                                {product.descriptionShort}
                                            </p>

                                            <div className="flex flex-wrap gap-2 mb-3">
                                                <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-lg">
                                                    {product.category}
                                                </span>
                                                {product.subCategory && (
                                                    <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-lg">
                                                        {product.subCategory}
                                                    </span>
                                                )}
                                            </div>

                                            <div className="flex items-baseline gap-2 mb-3">
                                                <span className="text-xl font-bold text-green-600">
                                                    {getDisplayPrice(product)}
                                                </span>
                                                {product.hasVariants && product.variants && product.variants.length > 0 && (
                                                    <span className="text-xs text-gray-500">(Variants available)</span>
                                                )}
                                            </div>

                                            <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                                                <div className="flex items-center gap-1">
                                                    <Package className="w-4 h-4" />
                                                    <span>
                                                        {product.hasVariants
                                                            ? `${product.variants?.reduce((sum, v) => sum + v.quantity, 0)} total`
                                                            : `${product.quantity} left`}
                                                    </span>
                                                </div>
                                                {product.companyId && (
                                                    <div className="flex items-center gap-1">
                                                        {product.companyId.companyLogo && (
                                                            <img
                                                                src={product.companyId.companyLogo}
                                                                alt={product.companyId.name}
                                                                className="w-5 h-5 rounded-full object-cover"
                                                            />
                                                        )}
                                                        <span className="text-xs truncate max-w-[100px]">
                                                            {product.companyId.name}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="grid grid-cols-2 gap-2">
                                                <button
                                                    onClick={() => setSelectedProduct(product)}
                                                    className="flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                    View
                                                </button>

                                                <button
                                                    onClick={() => handleEdit(product)}
                                                    className="flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                    Edit
                                                </button>

                                                {product.status === 'pending' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleApproval(product._id, 'approve')}
                                                            className="flex items-center justify-center gap-2 px-3 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors text-sm font-medium"
                                                        >
                                                            <CheckCircle className="w-4 h-4" />
                                                            Approve
                                                        </button>
                                                        <button
                                                            onClick={() => handleApproval(product._id, 'reject')}
                                                            className="flex items-center justify-center gap-2 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
                                                        >
                                                            <XCircle className="w-4 h-4" />
                                                            Reject
                                                        </button>
                                                    </>
                                                )}

                                                {(product.status === 'approved' || product.status === 'rejected' || product.status === 'removed') && (
                                                    <button
                                                        onClick={() => handleDelete(product._id)}
                                                        disabled={deletingId === product._id}
                                                        className="col-span-2 flex items-center justify-center gap-2 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium disabled:opacity-50"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                        {deletingId === product._id ? 'Deleting...' : 'Delete'}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        // List View
                        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {currentProducts.map((product) => {
                                            const statusBadge = getStatusBadge(product.status);
                                            const StatusIcon = statusBadge.icon;
                                            return (
                                                <tr key={product._id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            <div className="h-10 w-10 flex-shrink-0">
                                                                {product.productImages?.[0] ? (
                                                                    <img className="h-10 w-10 rounded-lg object-cover" src={product.productImages[0]} alt="" />
                                                                ) : (
                                                                    <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center">
                                                                        <Package className="w-5 h-5 text-gray-400" />
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="ml-4">
                                                                <div className="text-sm font-medium text-gray-900">{product.name}</div>
                                                                <div className="text-sm text-gray-500">{product.descriptionShort?.substring(0, 50)}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-900">{product.category}</div>
                                                        {product.subCategory && <div className="text-xs text-gray-500">{product.subCategory}</div>}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm font-semibold text-green-600">{getDisplayPrice(product)}</div>
                                                        {product.hasVariants && <div className="text-xs text-gray-500">Variants</div>}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {product.hasVariants
                                                            ? `${product.variants?.reduce((sum, v) => sum + v.quantity, 0)} total`
                                                            : `${product.quantity} units`}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusBadge.color}`}>
                                                            <StatusIcon className="w-3 h-3" />
                                                            {statusBadge.text}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center gap-2">
                                                            {product.companyId?.companyLogo && (
                                                                <img src={product.companyId.companyLogo} className="w-6 h-6 rounded-full" alt="" />
                                                            )}
                                                            <span className="text-sm text-gray-900">{product.companyId?.name}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                        <div className="flex gap-2 justify-end">
                                                            <button
                                                                onClick={() => setSelectedProduct(product)}
                                                                className="text-gray-600 hover:text-gray-900"
                                                                title="View"
                                                            >
                                                                <Eye className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleEdit(product)}
                                                                className="text-blue-600 hover:text-blue-900"
                                                                title="Edit"
                                                            >
                                                                <Edit className="w-4 h-4" />
                                                            </button>
                                                            {product.status === 'pending' && (
                                                                <>
                                                                    <button
                                                                        onClick={() => handleApproval(product._id, 'approve')}
                                                                        className="text-green-600 hover:text-green-900"
                                                                        title="Approve"
                                                                    >
                                                                        <CheckCircle className="w-4 h-4" />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleApproval(product._id, 'reject')}
                                                                        className="text-red-600 hover:text-red-900"
                                                                        title="Reject"
                                                                    >
                                                                        <XCircle className="w-4 h-4" />
                                                                    </button>
                                                                </>
                                                            )}
                                                            {(product.status === 'approved' || product.status === 'rejected' || product.status === 'removed') && (
                                                                <button
                                                                    onClick={() => handleDelete(product._id)}
                                                                    className="text-red-600 hover:text-red-900"
                                                                    title="Delete"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 pt-4 border-t border-gray-200">
                            <div className="text-sm text-gray-600">
                                Page {currentPage} of {totalPages}
                            </div>
                            
                            <div className="flex items-center gap-2">
                                {/* First Page Button */}
                                <button
                                    onClick={() => goToPage(1)}
                                    disabled={currentPage === 1}
                                    className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                                    title="First Page"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                    <ChevronLeft className="w-4 h-4 -ml-2" />
                                </button>
                                
                                {/* Previous Page Button */}
                                <button
                                    onClick={goToPreviousPage}
                                    disabled={currentPage === 1}
                                    className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                                    title="Previous Page"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                                
                                {/* Page Numbers */}
                                <div className="flex gap-1">
                                    {getPageNumbers().map(pageNum => (
                                        <button
                                            key={pageNum}
                                            onClick={() => goToPage(pageNum)}
                                            className={`px-3 py-2 rounded-lg transition-all ${
                                                currentPage === pageNum
                                                    ? 'bg-green-600 text-white shadow-md'
                                                    : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                                            }`}
                                        >
                                            {pageNum}
                                        </button>
                                    ))}
                                </div>
                                
                                {/* Next Page Button */}
                                <button
                                    onClick={goToNextPage}
                                    disabled={currentPage === totalPages}
                                    className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                                    title="Next Page"
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                                
                                {/* Last Page Button */}
                                <button
                                    onClick={() => goToPage(totalPages)}
                                    disabled={currentPage === totalPages}
                                    className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                                    title="Last Page"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                    <ChevronRight className="w-4 h-4 -ml-2" />
                                </button>
                            </div>
                            
                            {/* Go to Page Input */}
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-600">Go to:</span>
                                <input
                                    type="number"
                                    min={1}
                                    max={totalPages}
                                    value={currentPage}
                                    onChange={(e) => {
                                        const page = parseInt(e.target.value);
                                        if (!isNaN(page) && page >= 1 && page <= totalPages) {
                                            goToPage(page);
                                        }
                                    }}
                                    className="w-16 px-2 py-1 border border-gray-300 rounded-lg text-center text-sm focus:ring-2 focus:ring-green-500"
                                />
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* Product Detail Modal */}
            {selectedProduct && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center z-10 rounded-t-2xl">
                            <div className="flex items-center gap-3">
                                <div className={`w-2 h-8 rounded-full ${getStatusColor(selectedProduct.status)}`}></div>
                                <h3 className="text-xl font-bold text-gray-800">Product Details</h3>
                            </div>
                            <button
                                onClick={() => setSelectedProduct(null)}
                                className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-6">
                            {/* Product Images */}
                            {selectedProduct.productImages && selectedProduct.productImages.length > 0 && (
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                                    {selectedProduct.productImages.map((img, index) => (
                                        <img
                                            key={index}
                                            src={img}
                                            alt={`${selectedProduct.name} ${index + 1}`}
                                            className="w-full h-48 object-cover rounded-xl shadow-md"
                                        />
                                    ))}
                                </div>
                            )}

                            <div className="space-y-6">
                                <div>
                                    <h4 className="text-2xl font-bold text-gray-800 mb-3">
                                        {selectedProduct.name}
                                    </h4>
                                    {(() => {
                                        const statusBadge = getStatusBadge(selectedProduct.status);
                                        const StatusIcon = statusBadge.icon;
                                        return (
                                            <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${statusBadge.color}`}>
                                                <StatusIcon className="w-4 h-4" />
                                                {statusBadge.text}
                                            </span>
                                        );
                                    })()}
                                </div>

                                {selectedProduct.descriptionShort && (
                                    <div className="bg-gray-50 rounded-xl p-4">
                                        <h5 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                                            <Info className="w-4 h-4" />
                                            Description
                                        </h5>
                                        <p className="text-gray-700">{selectedProduct.descriptionShort}</p>
                                    </div>
                                )}

                                {selectedProduct.descriptionLong && (
                                    <div className="bg-gray-50 rounded-xl p-4">
                                        <h5 className="font-semibold text-gray-800 mb-2">Full Description</h5>
                                        <div
                                            className="text-gray-700 prose prose-sm max-w-none"
                                            dangerouslySetInnerHTML={{ __html: selectedProduct.descriptionLong }}
                                        />
                                    </div>
                                )}

                                {/* Price Section */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4">
                                        <p className="text-green-600 text-sm mb-1">Price</p>
                                        <p className="text-2xl font-bold text-green-700">{getDisplayPrice(selectedProduct)}</p>
                                    </div>
                                    <div className="bg-blue-50 rounded-xl p-4">
                                        <p className="text-blue-600 text-sm mb-1">Stock</p>
                                        <p className="text-xl font-semibold text-blue-700">
                                            {selectedProduct.hasVariants
                                                ? `${selectedProduct.variants?.reduce((sum, v) => sum + v.quantity, 0)} total units`
                                                : `${selectedProduct.quantity} units`}
                                        </p>
                                    </div>
                                </div>

                                {/* Variants Section */}
                                {selectedProduct.hasVariants && selectedProduct.variants && selectedProduct.variants.length > 0 && (
                                    <div className="border rounded-xl p-4">
                                        <h5 className="font-semibold text-gray-800 mb-3">Product Variants</h5>
                                        <div className="space-y-3">
                                            {selectedProduct.variants.map((variant, index) => (
                                                <div key={variant._id || index} className="bg-gray-50 rounded-lg p-3">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <p className="font-medium text-gray-800">{variant.displayValue}</p>
                                                            <p className="text-sm text-gray-600">Stock: {variant.quantity} units</p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-lg font-bold text-green-600">₹{variant.offerPrice}</p>
                                                            {variant.price !== variant.offerPrice && (
                                                                <p className="text-sm text-gray-400 line-through">₹{variant.price}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-purple-50 rounded-xl p-4">
                                        <h5 className="font-semibold text-purple-800 mb-2">Category</h5>
                                        <p className="text-purple-700">{selectedProduct.category}</p>
                                        {selectedProduct.subCategory && (
                                            <>
                                                <h5 className="font-semibold text-purple-800 mt-3 mb-1">Subcategory</h5>
                                                <p className="text-purple-700">{selectedProduct.subCategory}</p>
                                            </>
                                        )}
                                    </div>
                                    <div className="bg-orange-50 rounded-xl p-4">
                                        <h5 className="font-semibold text-orange-800 mb-2">Food Type</h5>
                                        <p className="text-orange-700 capitalize">{selectedProduct.foodType || 'Not specified'}</p>
                                    </div>
                                </div>

                                <div className="border rounded-xl p-4">
                                    <h5 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                        <Building className="w-4 h-4" />
                                        Company Information
                                    </h5>
                                    <div className="flex items-center gap-3">
                                        {selectedProduct.companyId.companyLogo ? (
                                            <img
                                                src={selectedProduct.companyId.companyLogo}
                                                alt={selectedProduct.companyId.name}
                                                className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                                            />
                                        ) : (
                                            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                                                <Building className="w-6 h-6 text-gray-400" />
                                            </div>
                                        )}
                                        <div>
                                            <p className="font-medium text-gray-800">{selectedProduct.companyId.name}</p>
                                            <p className="text-sm text-gray-600">{selectedProduct.companyId.email}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="border rounded-xl p-4">
                                    <h5 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                        <Users className="w-4 h-4" />
                                        Submitted By
                                    </h5>
                                    <div>
                                        <p className="font-medium text-gray-800">{selectedProduct.userId.name}</p>
                                        <p className="text-sm text-gray-600">{selectedProduct.userId.email}</p>
                                        <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />
                                            Submitted on {new Date(selectedProduct.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>

                                {selectedProduct.status === 'pending' && (
                                    <div className="flex gap-3 pt-4">
                                        <button
                                            onClick={() => handleApproval(selectedProduct._id, 'approve')}
                                            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all font-medium shadow-md"
                                        >
                                            <CheckCircle className="w-5 h-5" />
                                            Approve Product
                                        </button>
                                        <button
                                            onClick={() => {
                                                if (confirm('Are you sure you want to reject this product?')) {
                                                    handleApproval(selectedProduct._id, 'reject');
                                                }
                                            }}
                                            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all font-medium shadow-md"
                                        >
                                            <XCircle className="w-5 h-5" />
                                            Reject Product
                                        </button>
                                    </div>
                                )}

                                {(selectedProduct.status === 'approved' || selectedProduct.status === 'rejected') && (
                                    <div className="flex gap-3 pt-4">
                                        <button
                                            onClick={() => handleEdit(selectedProduct)}
                                            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-medium"
                                        >
                                            <Edit className="w-5 h-5" />
                                            Edit Product
                                        </button>
                                        <button
                                            onClick={() => handleDelete(selectedProduct._id)}
                                            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all font-medium"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                            Delete Product
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminProductSection;