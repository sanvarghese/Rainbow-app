// components/Admin/AdminProductSection.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { 
  Package, Plus, Edit, Trash2, Eye, CheckCircle, XCircle, X, 
  Building, Search, Filter, ChevronDown, AlertCircle, 
  Clock, CheckCircle2, Ban, Image as ImageIcon, DollarSign, 
  ShoppingBag, Users, Calendar, Tag, Layers, Info
} from 'lucide-react';
import AdminCreateProduct from './AdminCreateProduct';

interface Product {
    _id: string;
    name: string;
    descriptionShort?: string;
    descriptionLong?: string;
    price: number;
    offerPrice: number;
    quantity: number;
    category: string;
    subCategory?: string;
    foodType?: string;
    productImages: string[];
    badges?: string;
    status: 'approved' | 'rejected' | 'inactive';
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

type StatusFilter = 'all' | 'approved' | 'pending' | 'rejected';

const AdminProductSection = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<StatusFilter>('pending');
    const [searchTerm, setSearchTerm] = useState('');
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectProductId, setRejectProductId] = useState<string | null>(null);
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        if (!showCreateForm && !editingProduct) {
            fetchProducts();
        }
    }, [showCreateForm, editingProduct, filter]);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const statusParam = filter === 'all' ? '' : `?status=${filter === 'pending' ? 'inactive' : filter}`;
            const res = await fetch(`/api/admin/products${statusParam}`);
            const data = await res.json();
            if (data.success) {
                setProducts(data.products);
            }
        } catch (error) {
            console.error('Failed to fetch products:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApproval = async (productId: string, action: 'approve' | 'reject') => {
        setProcessingId(productId);
        try {
            const res = await fetch('/api/admin/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ productId, action }),
            });

            const data = await res.json();

            if (data.success) {
                fetchProducts();
                setSelectedProduct(null);
                setShowRejectModal(false);
                setRejectProductId(null);
            } else {
                alert(data.error || `Failed to ${action} product`);
            }
        } catch (error) {
            console.error(`Failed to ${action} product:`, error);
            alert(`Failed to ${action} product`);
        } finally {
            setProcessingId(null);
        }
    };

    const handleDelete = async (productId: string) => {
        if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) return;

        setDeletingId(productId);
        try {
            const res = await fetch(`/api/admin/products/${productId}`, {
                method: 'DELETE',
            });

            const data = await res.json();

            if (data.success) {
                setProducts(products.filter(p => p._id !== productId));
                alert('Product deleted successfully');
            } else {
                throw new Error(data.error || 'Failed to delete');
            }
        } catch (error: any) {
            alert(error.message || 'Failed to delete product');
        } finally {
            setDeletingId(null);
        }
    };

    const handleEdit = (product: Product) => {
        setEditingProduct(product);
        setShowCreateForm(true);
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

    const filteredProducts = products.filter((product) => {
        if (searchTerm) {
            return product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                   product.companyId?.name.toLowerCase().includes(searchTerm.toLowerCase());
        }
        return true;
    });

    const getStatusBadge = (status: string) => {
        switch(status) {
            case 'approved':
                return { color: 'bg-green-100 text-green-800', icon: CheckCircle2, text: 'Approved' };
            case 'rejected':
                return { color: 'bg-red-100 text-red-800', icon: Ban, text: 'Rejected' };
            default:
                return { color: 'bg-yellow-100 text-yellow-800', icon: Clock, text: 'Pending' };
        }
    };

    const getStatusCount = (status: StatusFilter) => {
        if (status === 'all') return products.length;
        if (status === 'pending') return products.filter(p => p.status === 'inactive').length;
        if (status === 'approved') return products.filter(p => p.status === 'approved').length;
        return products.filter(p => p.status === 'rejected').length;
    };

    if (showCreateForm) {
        return (
            <div>
                <button
                    onClick={handleCancel}
                    className="mb-6 flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors font-medium rounded-lg hover:bg-gray-100"
                >
                    ← Back to Products
                </button>
                <AdminCreateProduct
                    initialData={editingProduct}
                    onSuccess={handleCreateSuccess}
                />
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mb-4"></div>
                <div className="text-gray-600">Loading products...</div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Product Management</h1>
                        <p className="text-gray-600 mt-1">Manage and review all products in the marketplace</p>
                    </div>
                    
                    <button
                        onClick={() => setShowCreateForm(true)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all transform hover:scale-105 font-medium shadow-md"
                    >
                        <Plus className="w-5 h-5" />
                        Create New Product
                    </button>
                </div>

                {/* Search and Filters */}
                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search by product name or company..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                    </div>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        <Filter className="w-5 h-5" />
                        Filters
                        <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                    </button>
                </div>

                {/* Status Filter Tabs */}
                <div className="mt-6 flex gap-2 flex-wrap border-b border-gray-200">
                    {(['all', 'pending', 'approved', 'rejected'] as StatusFilter[]).map((status) => (
                        <button
                            key={status}
                            onClick={() => setFilter(status)}
                            className={`px-5 py-2.5 text-sm font-medium transition-all rounded-t-lg ${
                                filter === status
                                    ? 'text-green-600 border-b-2 border-green-600 bg-green-50'
                                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                            }`}
                        >
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                            <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-600">
                                {getStatusCount(status)}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Products Grid */}
            {filteredProducts.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                    <Package className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">No Products Found</h3>
                    <p className="text-gray-600 mb-6 max-w-md mx-auto">
                        {searchTerm 
                            ? `No products matching "${searchTerm}"`
                            : filter === 'pending'
                                ? 'No products waiting for approval at this time.'
                                : filter === 'approved'
                                    ? 'No approved products yet.'
                                    : filter === 'rejected'
                                        ? 'No rejected products.'
                                        : 'Get started by creating your first product.'}
                    </p>
                    {!searchTerm && filter === 'all' && (
                        <button
                            onClick={() => setShowCreateForm(true)}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                            <Plus className="w-5 h-5" />
                            Create Your First Product
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredProducts.map((product) => {
                        const statusInfo = getStatusBadge(product.status);
                        const StatusIcon = statusInfo.icon;
                        
                        return (
                            <div key={product._id} className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group">
                                {/* Product Image */}
                                <div className="relative h-56 bg-gradient-to-br from-gray-50 to-gray-100">
                                    {product.productImages && product.productImages.length > 0 ? (
                                        <img
                                            src={product.productImages[0]}
                                            alt={product.name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center">
                                            <ImageIcon className="w-16 h-16 text-gray-300" />
                                            <p className="text-sm text-gray-400 mt-2">No image</p>
                                        </div>
                                    )}
                                    
                                    {/* Status Badge */}
                                    <div className={`absolute top-3 right-3 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-md ${statusInfo.color}`}>
                                        <StatusIcon className="w-3.5 h-3.5" />
                                        {statusInfo.text}
                                    </div>
                                    
                                    {/* Food Type Badge */}
                                    {product.foodType && (
                                        <div className={`absolute top-3 left-3 px-2.5 py-1 rounded-lg text-xs font-medium shadow-md ${
                                            product.foodType === 'veg' 
                                                ? 'bg-green-500 text-white' 
                                                : 'bg-red-500 text-white'
                                        }`}>
                                            {product.foodType === 'veg' ? '🟢 Veg' : '🔴 Non-Veg'}
                                        </div>
                                    )}
                                </div>

                                <div className="p-5">
                                    {/* Product Name & Category */}
                                    <div className="mb-3">
                                        <h3 className="text-lg font-bold text-gray-900 line-clamp-1 mb-2">
                                            {product.name}
                                        </h3>
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded-md">
                                                <Tag className="w-3 h-3" />
                                                {product.category}
                                            </span>
                                            {product.subCategory && (
                                                <span className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-purple-50 text-purple-700 rounded-md">
                                                    <Layers className="w-3 h-3" />
                                                    {product.subCategory}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Description */}
                                    {product.descriptionShort && (
                                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                                            {product.descriptionShort}
                                        </p>
                                    )}

                                    {/* Price Section */}
                                    <div className="flex items-baseline gap-2 mb-4 pb-3 border-b border-gray-100">
                                        <span className="text-2xl font-bold text-green-600">
                                            ₹{product.offerPrice.toLocaleString()}
                                        </span>
                                        {product.price !== product.offerPrice && (
                                            <>
                                                <span className="text-sm text-gray-400 line-through">
                                                    ₹{product.price.toLocaleString()}
                                                </span>
                                                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                                                    {Math.round(((product.price - product.offerPrice) / product.price) * 100)}% OFF
                                                </span>
                                            </>
                                        )}
                                    </div>

                                    {/* Product Details */}
                                    <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                                        <div className="flex items-center gap-1.5 text-gray-600">
                                            <ShoppingBag className="w-4 h-4" />
                                            <span>Stock: {product.quantity}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-gray-600">
                                            <DollarSign className="w-4 h-4" />
                                            <span>MRP: ₹{product.price}</span>
                                        </div>
                                    </div>

                                    {/* Company Info */}
                                    {product.companyId && (
                                        <div className="flex items-center gap-2 mb-5 p-2 bg-gray-50 rounded-lg">
                                            {product.companyId.companyLogo ? (
                                                <img
                                                    src={product.companyId.companyLogo}
                                                    alt={product.companyId.name}
                                                    className="w-8 h-8 rounded-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                                                    <Building className="w-4 h-4 text-gray-500" />
                                                </div>
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900 truncate">
                                                    {product.companyId.name}
                                                </p>
                                                <p className="text-xs text-gray-500 truncate">
                                                    {product.companyId.email}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Action Buttons */}
                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            onClick={() => setSelectedProduct(product)}
                                            className="flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                                        >
                                            <Eye className="w-4 h-4" />
                                            View Details
                                        </button>

                                        <button
                                            onClick={() => handleEdit(product)}
                                            className="flex items-center justify-center gap-2 px-3 py-2 bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100 transition-colors text-sm font-medium"
                                        >
                                            <Edit className="w-4 h-4" />
                                            Edit
                                        </button>

                                        {product.status === 'inactive' && (
                                            <>
                                                <button
                                                    onClick={() => handleApproval(product._id, 'approve')}
                                                    disabled={processingId === product._id}
                                                    className="flex items-center justify-center gap-2 px-3 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors text-sm font-medium disabled:opacity-50"
                                                >
                                                    <CheckCircle className="w-4 h-4" />
                                                    {processingId === product._id ? 'Processing...' : 'Approve'}
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setRejectProductId(product._id);
                                                        setShowRejectModal(true);
                                                    }}
                                                    disabled={processingId === product._id}
                                                    className="flex items-center justify-center gap-2 px-3 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium disabled:opacity-50"
                                                >
                                                    <XCircle className="w-4 h-4" />
                                                    Reject
                                                </button>
                                            </>
                                        )}

                                        {(product.status === 'approved' || product.status === 'rejected') && (
                                            <button
                                                onClick={() => handleDelete(product._id)}
                                                disabled={deletingId === product._id}
                                                className="col-span-2 flex items-center justify-center gap-2 px-3 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium disabled:opacity-50"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                                {deletingId === product._id ? 'Deleting...' : 'Delete Product'}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Product Detail Modal */}
            {selectedProduct && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
                    <div className="bg-white rounded-xl shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <h3 className="text-xl font-bold text-gray-900">Product Details</h3>
                                {(() => {
                                    const statusInfo = getStatusBadge(selectedProduct.status);
                                    const StatusIcon = statusInfo.icon;
                                    return (
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color}`}>
                                            <StatusIcon className="w-4 h-4" />
                                            {statusInfo.text}
                                        </span>
                                    );
                                })()}
                            </div>
                            <button
                                onClick={() => setSelectedProduct(null)}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-6">
                            {/* Product Images Gallery */}
                            {selectedProduct.productImages && selectedProduct.productImages.length > 0 && (
                                <div className="mb-6">
                                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                        <ImageIcon className="w-5 h-5" />
                                        Product Images
                                    </h4>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {selectedProduct.productImages.map((img, index) => (
                                            <img
                                                key={index}
                                                src={img}
                                                alt={`${selectedProduct.name} ${index + 1}`}
                                                className="w-full h-48 object-cover rounded-lg shadow-md hover:shadow-lg transition-shadow"
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="space-y-6">
                                {/* Basic Info */}
                                <div>
                                    <h2 className="text-3xl font-bold text-gray-900 mb-2">
                                        {selectedProduct.name}
                                    </h2>
                                    <div className="flex items-center gap-2 flex-wrap">
                                        {selectedProduct.foodType && (
                                            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                                                selectedProduct.foodType === 'veg' 
                                                    ? 'bg-green-100 text-green-700' 
                                                    : 'bg-red-100 text-red-700'
                                            }`}>
                                                {selectedProduct.foodType === 'veg' ? '🟢 Vegetarian' : '🔴 Non-Vegetarian'}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Description */}
                                {selectedProduct.descriptionShort && (
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <h5 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                            <Info className="w-4 h-4" />
                                            Short Description
                                        </h5>
                                        <p className="text-gray-700">{selectedProduct.descriptionShort}</p>
                                    </div>
                                )}

                                {selectedProduct.descriptionLong && (
                                    <div>
                                        <h5 className="font-semibold text-gray-900 mb-2">Full Description</h5>
                                        <div 
                                            className="text-gray-700 prose prose-sm max-w-none bg-gray-50 rounded-lg p-4"
                                            dangerouslySetInnerHTML={{ __html: selectedProduct.descriptionLong }}
                                        />
                                    </div>
                                )}

                                {/* Pricing Information */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="bg-green-50 rounded-lg p-4 text-center">
                                        <p className="text-sm text-green-600 mb-1">Offer Price</p>
                                        <p className="text-3xl font-bold text-green-600">₹{selectedProduct.offerPrice.toLocaleString()}</p>
                                    </div>
                                    <div className="bg-gray-50 rounded-lg p-4 text-center">
                                        <p className="text-sm text-gray-600 mb-1">Original Price</p>
                                        <p className="text-2xl font-semibold text-gray-700">₹{selectedProduct.price.toLocaleString()}</p>
                                        {selectedProduct.price !== selectedProduct.offerPrice && (
                                            <p className="text-xs text-green-600 mt-1">
                                                Save ₹{(selectedProduct.price - selectedProduct.offerPrice).toLocaleString()}
                                            </p>
                                        )}
                                    </div>
                                    <div className="bg-blue-50 rounded-lg p-4 text-center">
                                        <p className="text-sm text-blue-600 mb-1">Stock Quantity</p>
                                        <p className="text-2xl font-semibold text-blue-700">{selectedProduct.quantity} units</p>
                                    </div>
                                </div>

                                {/* Categories */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="border rounded-lg p-4">
                                        <h5 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                            <Tag className="w-4 h-4" />
                                            Category
                                        </h5>
                                        <p className="text-gray-700">{selectedProduct.category}</p>
                                    </div>
                                    {selectedProduct.subCategory && (
                                        <div className="border rounded-lg p-4">
                                            <h5 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                                <Layers className="w-4 h-4" />
                                                Subcategory
                                            </h5>
                                            <p className="text-gray-700">{selectedProduct.subCategory}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Company Information */}
                                <div className="border rounded-lg p-4">
                                    <h5 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                        <Building className="w-5 h-5" />
                                        Company Information
                                    </h5>
                                    <div className="flex items-center gap-4">
                                        {selectedProduct.companyId.companyLogo ? (
                                            <img
                                                src={selectedProduct.companyId.companyLogo}
                                                alt={selectedProduct.companyId.name}
                                                className="w-16 h-16 rounded-lg object-cover"
                                            />
                                        ) : (
                                            <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                                                <Building className="w-8 h-8 text-gray-400" />
                                            </div>
                                        )}
                                        <div>
                                            <p className="font-semibold text-gray-900">{selectedProduct.companyId.name}</p>
                                            <p className="text-sm text-gray-600">{selectedProduct.companyId.email}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Submission Info */}
                                <div className="border rounded-lg p-4">
                                    <h5 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                        <Users className="w-5 h-5" />
                                        Submission Information
                                    </h5>
                                    <div className="space-y-2">
                                        <p className="text-sm">
                                            <span className="font-medium text-gray-700">Submitted by:</span>{' '}
                                            <span className="text-gray-600">{selectedProduct.userId.name}</span>
                                        </p>
                                        <p className="text-sm">
                                            <span className="font-medium text-gray-700">Email:</span>{' '}
                                            <span className="text-gray-600">{selectedProduct.userId.email}</span>
                                        </p>
                                        <p className="text-sm flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-gray-400" />
                                            <span className="font-medium text-gray-700">Submitted on:</span>{' '}
                                            <span className="text-gray-600">{new Date(selectedProduct.createdAt).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}</span>
                                        </p>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-3 pt-4 border-t">
                                    {selectedProduct.status === 'inactive' && (
                                        <>
                                            <button
                                                onClick={() => handleApproval(selectedProduct._id, 'approve')}
                                                disabled={processingId === selectedProduct._id}
                                                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50"
                                            >
                                                <CheckCircle className="w-5 h-5" />
                                                {processingId === selectedProduct._id ? 'Processing...' : 'Approve Product'}
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setRejectProductId(selectedProduct._id);
                                                    setShowRejectModal(true);
                                                    setSelectedProduct(null);
                                                }}
                                                disabled={processingId === selectedProduct._id}
                                                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50"
                                            >
                                                <XCircle className="w-5 h-5" />
                                                Reject Product
                                            </button>
                                        </>
                                    )}
                                    {(selectedProduct.status === 'approved' || selectedProduct.status === 'rejected') && (
                                        <button
                                            onClick={() => handleDelete(selectedProduct._id)}
                                            disabled={deletingId === selectedProduct._id}
                                            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                            {deletingId === selectedProduct._id ? 'Deleting...' : 'Delete Product'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Reject Confirmation Modal */}
            {showRejectModal && rejectProductId && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                                <AlertCircle className="w-6 h-6 text-red-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">Reject Product</h3>
                        </div>
                        <p className="text-gray-600 mb-6">
                            Are you sure you want to reject this product? The seller will be notified of this decision.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowRejectModal(false);
                                    setRejectProductId(null);
                                }}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleApproval(rejectProductId, 'reject')}
                                disabled={processingId === rejectProductId}
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                            >
                                {processingId === rejectProductId ? 'Processing...' : 'Yes, Reject'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminProductSection;