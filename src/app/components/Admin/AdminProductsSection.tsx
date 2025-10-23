'use client';
import React, { useState, useEffect } from 'react';
import { Package, Building, Eye, Edit, Trash2, CheckCircle, XCircle, X } from 'lucide-react';
import AdminCreateProduct from './AdminCreateProduct';

interface Product {
    _id: string;
    name: string;
    description?: string;
    price: number;
    category: string;
    subCategory?: string;
    images: string[];
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
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [editMode, setEditMode] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const res = await fetch('/api/admin/approvals/products');
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

    const filteredProducts = products.filter((product) => {
        if (filter === 'approved') return product.isApproved;
        if (filter === 'pending') return !product.isApproved;
        return true;
    });

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

                <div className="flex gap-2">
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'all'
                            ? 'bg-green-600 text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-100'
                            }`}
                    >
                        All ({products.length})
                    </button>
                    <button
                        onClick={() => setFilter('approved')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'approved'
                            ? 'bg-green-600 text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-100'
                            }`}
                    >
                        Approved ({products.filter((p) => p.isApproved).length})
                    </button>
                    <button
                        onClick={() => setFilter('pending')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'pending'
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
                    <p className="text-gray-600">
                        {filter === 'pending'
                            ? 'There are no pending products.'
                            : filter === 'approved'
                                ? 'There are no approved products yet.'
                                : 'There are no products in the system.'}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredProducts.map((product) => (
                        <div key={product._id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                            {/* Product Image */}
                            <div className="h-48 bg-gray-100">
                                {product.images && product.images.length > 0 ? (
                                    <img
                                        src={product.images[0]}
                                        alt={product.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <Package className="w-16 h-16 text-gray-400" />
                                    </div>
                                )}
                            </div>

                            <div className="p-4">
                                <div className="flex justify-between items-start mb-3">
                                    <h3 className="text-lg font-semibold text-gray-800 line-clamp-1">
                                        {product.name}
                                    </h3>
                                    <span
                                        className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${product.isApproved
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-yellow-100 text-yellow-700'
                                            }`}
                                    >
                                        {product.isApproved ? 'Approved' : 'Pending'}
                                    </span>
                                </div>

                                {product.description && (
                                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                                        {product.description}
                                    </p>
                                )}

                                <div className="space-y-2 mb-4">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Price:</span>
                                        <span className="font-semibold text-gray-800">₹{product.price}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Category:</span>
                                        <span className="text-gray-800">{product.category}</span>
                                    </div>
                                    {product.subCategory && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Subcategory:</span>
                                            <span className="text-gray-800">{product.subCategory}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="border-t pt-3 mb-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        {product.companyId.companyLogo ? (
                                            <img
                                                src={product.companyId.companyLogo}
                                                alt={product.companyId.name}
                                                className="w-8 h-8 rounded object-cover"
                                            />
                                        ) : (
                                            <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
                                                <Building className="w-4 h-4 text-gray-400" />
                                            </div>
                                        )}
                                        <div>
                                            <p className="text-sm font-medium text-gray-800">
                                                {product.companyId.name}
                                            </p>
                                            <p className="text-xs text-gray-600">{product.companyId.email}</p>
                                        </div>
                                    </div>
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
                                        onClick={() => handleDelete(product._id)}
                                        className="flex items-center justify-center gap-2 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        Delete
                                    </button>

                                    {/* // Add Edit button to the product card: */}
                                    <button
                                        onClick={() => {
                                            setEditingProduct(product);
                                            setEditMode(true);
                                        }}
                                        className="flex items-center gap-2 px-3 py-2 bg-yellow-50 text-yellow-600 rounded-lg"
                                    >
                                        <Edit className="w-4 h-4" />
                                        Edit
                                    </button>

                                    {editMode && (
                                        <div className="fixed inset-0 bg-white z-50 overflow-auto">
                                            <AdminCreateProduct
                                                initialData={editingProduct}
                                                onSuccess={() => {
                                                    setEditMode(false);
                                                    setEditingProduct(null);
                                                    fetchProducts();
                                                }}
                                            />
                                        </div>
                                    )}

                                    {!product.isApproved && (
                                        <button
                                            onClick={() => handleApproval(product._id, true)}
                                            className="col-span-2 flex items-center justify-center gap-2 px-3 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors text-sm font-medium"
                                        >
                                            <CheckCircle className="w-4 h-4" />
                                            Approve
                                        </button>
                                    )}

                                    {product.isApproved && (
                                        <button
                                            onClick={() => handleApproval(product._id, false)}
                                            className="col-span-2 flex items-center justify-center gap-2 px-3 py-2 bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-100 transition-colors text-sm font-medium"
                                        >
                                            <XCircle className="w-4 h-4" />
                                            Revoke Approval
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
                            {selectedProduct.images && selectedProduct.images.length > 0 && (
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                                    {selectedProduct.images.map((img, index) => (
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
                                        className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${selectedProduct.isApproved
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-yellow-100 text-yellow-700'
                                            }`}
                                    >
                                        {selectedProduct.isApproved ? 'Approved' : 'Pending Approval'}
                                    </span>
                                </div>

                                {selectedProduct.description && (
                                    <div>
                                        <h5 className="font-semibold text-gray-800 mb-1">Description</h5>
                                        <p className="text-gray-600">{selectedProduct.description}</p>
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <h5 className="font-semibold text-gray-800 mb-1">Price</h5>
                                        <p className="text-2xl font-bold text-green-600">₹{selectedProduct.price}</p>
                                    </div>
                                    <div>
                                        <h5 className="font-semibold text-gray-800 mb-1">Category</h5>
                                        <p className="text-gray-600">{selectedProduct.category}</p>
                                        {selectedProduct.subCategory && (
                                            <p className="text-sm text-gray-500">{selectedProduct.subCategory}</p>
                                        )}
                                    </div>
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
                                        <>
                                            <button
                                                onClick={() => {
                                                    if (confirm('Are you sure you want to reject this product?')) {
                                                        handleApproval(selectedProduct._id, false);
                                                    }
                                                }}
                                                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                                            >
                                                <XCircle className="w-5 h-5" />
                                                Reject Product
                                            </button>
                                            <button
                                                onClick={() => handleApproval(selectedProduct._id, true)}
                                                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                                            >
                                                <CheckCircle className="w-5 h-5" />
                                                Approve Product
                                            </button>
                                        </>
                                    ) : (
                                        <button
                                            onClick={() => {
                                                if (confirm('Are you sure you want to revoke approval for this product?')) {
                                                    handleApproval(selectedProduct._id, false);
                                                }
                                            }}
                                            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
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