// components/Admin/AdminProductSection.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Package, Plus, Edit, Trash2, Eye, CheckCircle, XCircle, X, Building } from 'lucide-react';
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
    isApproved: boolean;
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

const AdminProductSection = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'approved' | 'pending'>('all');
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    useEffect(() => {
        // Only fetch when not showing the create/edit form
        if (!showCreateForm && !editingProduct) {
            fetchProducts();
        }
    }, [showCreateForm, editingProduct]);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/admin/products');
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

    const handleApproval = async (productId: string, isApproved: boolean) => {
        try {
            const res = await fetch('/api/admin/approvals/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ productId, isApproved }),
            });

            const data = await res.json();

            if (data.success) {
                fetchProducts();
                alert(data.message);
                setSelectedProduct(null);
            } else {
                alert(data.error || 'Failed to update product status');
            }
        } catch (error) {
            console.error('Failed to update product:', error);
            alert('Failed to update product status');
        }
    };

    const handleDelete = async (productId: string) => {
        if (!confirm('Are you sure you want to delete this product?')) return;

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
        if (filter === 'approved') return product.isApproved;
        if (filter === 'pending') return !product.isApproved;
        return true;
    });

    // Show create/edit form
    if (showCreateForm) {
        return (
            <div>
                <button
                    onClick={handleCancel}
                    className="mb-4 px-4 py-2 text-gray-600 hover:text-gray-800 flex items-center gap-2"
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
            <div className="flex items-center justify-center py-12">
                <div className="text-gray-600">Loading products...</div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center flex-wrap gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Product Management</h2>
                    <p className="text-gray-600 mt-1">
                        {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found
                    </p>
                </div>

                <div className="flex gap-2 flex-wrap">
                    <button
                        onClick={() => setShowCreateForm(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                    >
                        <Plus className="w-5 h-5" />
                        Create New Product
                    </button>
                    
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                            filter === 'all'
                                ? 'bg-green-600 text-white'
                                : 'bg-white text-gray-700 hover:bg-gray-100'
                        }`}
                    >
                        All ({products.length})
                    </button>
                    <button
                        onClick={() => setFilter('approved')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                            filter === 'approved'
                                ? 'bg-green-600 text-white'
                                : 'bg-white text-gray-700 hover:bg-gray-100'
                        }`}
                    >
                        Approved ({products.filter((p) => p.isApproved).length})
                    </button>
                    <button
                        onClick={() => setFilter('pending')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                            filter === 'pending'
                                ? 'bg-yellow-600 text-white'
                                : 'bg-white text-gray-700 hover:bg-gray-100'
                        }`}
                    >
                        Pending ({products.filter((p) => !p.isApproved).length})
                    </button>
                </div>
            </div>

            {filteredProducts.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl shadow-sm">
                    <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">No Products Found</h3>
                    <p className="text-gray-600 mb-4">
                        {filter === 'pending'
                            ? 'There are no pending products.'
                            : filter === 'approved'
                                ? 'There are no approved products yet.'
                                : 'Get started by creating your first product.'}
                    </p>
                    {filter === 'all' && (
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
                    {filteredProducts.map((product) => (
                        <div key={product._id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                            {/* Product Image */}
                            <div className="h-48 bg-gray-100 relative">
                                {product.productImages && product.productImages.length > 0 ? (
                                    <img
                                        src={product.productImages[0]}
                                        alt={product.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <Package className="w-16 h-16 text-gray-400" />
                                    </div>
                                )}
                                {product.badges && (
                                    <img
                                        src={product.badges}
                                        alt="Badge"
                                        className="absolute top-2 left-2 w-12 h-12 object-contain"
                                    />
                                )}
                                {product.foodType && (
                                    <span
                                        className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-medium ${
                                            product.foodType === 'veg'
                                                ? 'bg-green-100 text-green-700 border border-green-300'
                                                : 'bg-red-100 text-red-700 border border-red-300'
                                        }`}
                                    >
                                        {product.foodType === 'veg' ? '🟢 Veg' : '🔴 Non-Veg'}
                                    </span>
                                )}
                            </div>

                            <div className="p-4">
                                <div className="flex justify-between items-start mb-3">
                                    <h3 className="text-lg font-semibold text-gray-800 line-clamp-1 flex-1">
                                        {product.name}
                                    </h3>
                                    <span
                                        className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ml-2 ${
                                            product.isApproved
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-yellow-100 text-yellow-700'
                                        }`}
                                    >
                                        {product.isApproved ? 'Approved' : 'Pending'}
                                    </span>
                                </div>

                                {product.descriptionShort && (
                                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                                        {product.descriptionShort}
                                    </p>
                                )}

                                <div className="flex items-center gap-2 mb-3">
                                    <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                                        {product.category}
                                    </span>
                                    {product.subCategory && (
                                        <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded">
                                            {product.subCategory}
                                        </span>
                                    )}
                                </div>

                                <div className="flex items-baseline gap-2 mb-3">
                                    <span className="text-xl font-bold text-green-600">
                                        ₹{product.offerPrice}
                                    </span>
                                    {product.price !== product.offerPrice && (
                                        <>
                                            <span className="text-sm text-gray-400 line-through">
                                                ₹{product.price}
                                            </span>
                                            <span className="text-xs text-green-600 font-medium">
                                                {Math.round(((product.price - product.offerPrice) / product.price) * 100)}% OFF
                                            </span>
                                        </>
                                    )}
                                </div>

                                <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                                    <span>Stock: {product.quantity}</span>
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
                                        className="flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                                    >
                                        <Eye className="w-4 h-4" />
                                        View
                                    </button>

                                    <button
                                        onClick={() => handleEdit(product)}
                                        className="flex items-center justify-center gap-2 px-3 py-2 bg-yellow-50 text-yellow-600 rounded-lg hover:bg-yellow-100 transition-colors text-sm font-medium"
                                    >
                                        <Edit className="w-4 h-4" />
                                        Edit
                                    </button>

                                    <button
                                        onClick={() => handleDelete(product._id)}
                                        disabled={deletingId === product._id}
                                        className="flex items-center justify-center gap-2 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium disabled:opacity-50"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        {deletingId === product._id ? 'Deleting...' : 'Delete'}
                                    </button>

                                    {!product.isApproved ? (
                                        <button
                                            onClick={() => handleApproval(product._id, true)}
                                            className="flex items-center justify-center gap-2 px-3 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors text-sm font-medium"
                                        >
                                            <CheckCircle className="w-4 h-4" />
                                            Approve
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => handleApproval(product._id, false)}
                                            className="flex items-center justify-center gap-2 px-3 py-2 bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-100 transition-colors text-sm font-medium"
                                        >
                                            <XCircle className="w-4 h-4" />
                                            Revoke
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Product Detail Modal */}
            {selectedProduct && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center z-10">
                            <h3 className="text-xl font-bold text-gray-800">Product Details</h3>
                            <button
                                onClick={() => setSelectedProduct(null)}
                                className="text-gray-500 hover:text-gray-700"
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
                                            className="w-full h-48 object-cover rounded-lg"
                                        />
                                    ))}
                                </div>
                            )}

                            <div className="space-y-4">
                                <div>
                                    <h4 className="text-2xl font-bold text-gray-800 mb-2">
                                        {selectedProduct.name}
                                    </h4>
                                    <span
                                        className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                                            selectedProduct.isApproved
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-yellow-100 text-yellow-700'
                                        }`}
                                    >
                                        {selectedProduct.isApproved ? 'Approved' : 'Pending Approval'}
                                    </span>
                                </div>

                                {selectedProduct.descriptionShort && (
                                    <div>
                                        <h5 className="font-semibold text-gray-800 mb-1">Description</h5>
                                        <p className="text-gray-600">{selectedProduct.descriptionShort}</p>
                                    </div>
                                )}

                                {selectedProduct.descriptionLong && (
                                    <div>
                                        <h5 className="font-semibold text-gray-800 mb-1">Full Description</h5>
                                        <div 
                                            className="text-gray-600 prose prose-sm max-w-none"
                                            dangerouslySetInnerHTML={{ __html: selectedProduct.descriptionLong }}
                                        />
                                    </div>
                                )}

                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    <div>
                                        <h5 className="font-semibold text-gray-800 mb-1">Offer Price</h5>
                                        <p className="text-2xl font-bold text-green-600">₹{selectedProduct.offerPrice}</p>
                                    </div>
                                    <div>
                                        <h5 className="font-semibold text-gray-800 mb-1">Original Price</h5>
                                        <p className="text-xl text-gray-600">₹{selectedProduct.price}</p>
                                    </div>
                                    <div>
                                        <h5 className="font-semibold text-gray-800 mb-1">Stock</h5>
                                        <p className="text-xl text-gray-600">{selectedProduct.quantity} units</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <h5 className="font-semibold text-gray-800 mb-1">Category</h5>
                                        <p className="text-gray-600">{selectedProduct.category}</p>
                                    </div>
                                    {selectedProduct.subCategory && (
                                        <div>
                                            <h5 className="font-semibold text-gray-800 mb-1">Subcategory</h5>
                                            <p className="text-gray-600">{selectedProduct.subCategory}</p>
                                        </div>
                                    )}
                                </div>

                                <div className="border-t pt-4">
                                    <h5 className="font-semibold text-gray-800 mb-3">Company Information</h5>
                                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                                        {selectedProduct.companyId.companyLogo ? (
                                            <img
                                                src={selectedProduct.companyId.companyLogo}
                                                alt={selectedProduct.companyId.name}
                                                className="w-12 h-12 rounded object-cover"
                                            />
                                        ) : (
                                            <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                                                <Building className="w-6 h-6 text-gray-400" />
                                            </div>
                                        )}
                                        <div>
                                            <p className="font-medium text-gray-800">{selectedProduct.companyId.name}</p>
                                            <p className="text-sm text-gray-600">{selectedProduct.companyId.email}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t pt-4">
                                    <h5 className="font-semibold text-gray-800 mb-3">Submitted By</h5>
                                    <div className="p-4 bg-gray-50 rounded-lg">
                                        <p className="font-medium text-gray-800">{selectedProduct.userId.name}</p>
                                        <p className="text-sm text-gray-600">{selectedProduct.userId.email}</p>
                                        <p className="text-xs text-gray-500 mt-2">
                                            Submitted on {new Date(selectedProduct.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    {!selectedProduct.isApproved ? (
                                        <button
                                            onClick={() => handleApproval(selectedProduct._id, true)}
                                            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                                        >
                                            <CheckCircle className="w-5 h-5" />
                                            Approve Product
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => {
                                                if (confirm('Are you sure you want to revoke approval for this product?')) {
                                                    handleApproval(selectedProduct._id, false);
                                                }
                                            }}
                                            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
                                        >
                                            <XCircle className="w-5 h-5" />
                                            Revoke Approval
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminProductSection;