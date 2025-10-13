'use client';

import React, { useState, useEffect } from 'react';
import { Edit, Plus, Package as PackageIcon, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import CreateProduct from '../BecomeSeller/CreateProduct';

const ProductsSection = () => {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [productToDelete, setProductToDelete] = useState<any>(null);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const itemsPerPage = 6;

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const res = await fetch('/api/merchant/product');
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

    const handleAddProduct = () => {
        setSelectedProduct(null);
        setIsEditing(true);
    };

    const handleEditProduct = (product: any) => {
        console.log('Editing product:', product); // Debug log
        setSelectedProduct(product);
        setIsEditing(true);

    };

    const handleDeleteClick = (product: any) => {
        setProductToDelete(product);
        setShowDeleteDialog(true);
    };

    const handleDeleteConfirm = async () => {
        if (!productToDelete) return;

        setDeleteLoading(true);
        try {
            // const res = await fetch(`/api/merchant/product?id=${productToDelete._id}`, {
            const res = await fetch(`/api/merchant/product/${productToDelete._id}`, {

                method: 'DELETE',
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.details || data.error || 'Failed to delete product');
            }

            // Refresh products list
            await fetchProducts();

            // Reset to first page if current page becomes empty
            const newTotalPages = Math.ceil((products.length - 1) / itemsPerPage);
            if (currentPage > newTotalPages && newTotalPages > 0) {
                setCurrentPage(newTotalPages);
            }

            setShowDeleteDialog(false);
            setProductToDelete(null);
        } catch (error: any) {
            alert(error.message);
        } finally {
            setDeleteLoading(false);
        }
    };

    const handleDeleteCancel = () => {
        setShowDeleteDialog(false);
        setProductToDelete(null);
    };

    const handleEditSuccess = () => {
        setIsEditing(false);
        setSelectedProduct(null);
        fetchProducts();
    };

    // Pagination logic
    const totalPages = Math.ceil(products.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentProducts = products.slice(startIndex, endIndex);

    const goToPage = (page: number) => {
        setCurrentPage(page);
    };

    const goToPreviousPage = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    const goToNextPage = () => {
        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-gray-600">Loading products...</div>
            </div>
        );
    }

    if (isEditing) {
        return (
            <div>
                <button
                    onClick={() => {
                        setIsEditing(false);
                        setSelectedProduct(null);
                    }}
                    className="mb-4 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                    ← Back to Products
                </button>
                <CreateProduct initialData={selectedProduct} onSuccess={handleEditSuccess} />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Products</h2>
                    <p className="text-gray-600 mt-1">
                        {products.length} product{products.length !== 1 ? 's' : ''} total
                    </p>
                </div>
                <button
                    onClick={handleAddProduct}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                    <Plus className="w-4 h-4" />
                    Add Product
                </button>
            </div>

            {/* Products Grid */}
            {products.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl shadow-sm">
                    <PackageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">No Products Yet</h3>
                    <p className="text-gray-600 mb-6">Start adding products to your inventory</p>
                    <button
                        onClick={handleAddProduct}
                        className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                        Add Your First Product
                    </button>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {currentProducts.map((product) => (
                            <div key={product._id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                                {/* Product Image */}
                                {product.productImage ? (
                                    <div className="relative h-48 bg-gray-100">
                                        <img
                                            src={product.productImage}
                                            alt={product.name}
                                            className="w-full h-full object-cover"
                                        />
                                        {product.badges && (
                                            <div className="absolute top-2 right-2">
                                                <img
                                                    src={product.badges}
                                                    alt="Badge"
                                                    className="w-12 h-12 object-contain"
                                                />
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="h-48 bg-gray-100 flex items-center justify-center">
                                        <PackageIcon className="w-16 h-16 text-gray-300" />
                                    </div>
                                )}

                                {/* Product Details */}
                                <div className="p-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="text-lg font-semibold text-gray-800 line-clamp-1 flex-1">
                                            {product.name}
                                        </h3>
                                        <div className="flex gap-1 ml-2">
                                            <button
                                                onClick={() => handleEditProduct(product)}
                                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="Edit Product">
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteClick(product)}
                                                className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Delete Product">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                                        {product.descriptionShort}
                                    </p>

                                    {/* Tags */}
                                    <div className="flex flex-wrap gap-2 mb-3">
                                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                                            {product.category}
                                        </span>
                                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                                            {product.subCategory}
                                        </span>
                                        {product.foodType && (
                                            <span className={`px-2 py-1 text-xs rounded-full ${product.foodType === 'veg'
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-red-100 text-red-700'
                                                }`}>
                                                {product.foodType}
                                            </span>
                                        )}
                                    </div>

                                    {/* Footer */}
                                    <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                                        <div>
                                            <p className="text-xs text-gray-500">Quantity</p>
                                            <p className="font-semibold text-gray-800">{product.quantity}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Price</p>
                                            <p className="font-semibold text-gray-800">{product.price}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Offer Price</p>
                                            <p className="font-semibold text-gray-800">{product.offerPrice}</p>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${product.isApproved
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-yellow-100 text-yellow-700'
                                            }`}>
                                            {product.isApproved ? 'Approved' : 'Pending'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between bg-white rounded-xl p-4 shadow-sm">
                            <div className="text-sm text-gray-600">
                                Showing {startIndex + 1} to {Math.min(endIndex, products.length)} of {products.length} products
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={goToPreviousPage}
                                    disabled={currentPage === 1}
                                    className={`p-2 rounded-lg transition-colors ${currentPage === 1
                                            ? 'text-gray-400 cursor-not-allowed'
                                            : 'text-gray-700 hover:bg-gray-100'
                                        }`}>
                                    <ChevronLeft className="w-5 h-5" />
                                </button>

                                {/* Page Numbers */}
                                <div className="flex gap-1">
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                                        // Show first page, last page, current page, and pages around current
                                        if (
                                            page === 1 ||
                                            page === totalPages ||
                                            (page >= currentPage - 1 && page <= currentPage + 1)
                                        ) {
                                            return (
                                                <button
                                                    key={page}
                                                    onClick={() => goToPage(page)}
                                                    className={`w-10 h-10 rounded-lg transition-colors ${currentPage === page
                                                            ? 'bg-green-600 text-white'
                                                            : 'text-gray-700 hover:bg-gray-100'
                                                        }`}>
                                                    {page}
                                                </button>
                                            );
                                        } else if (
                                            page === currentPage - 2 ||
                                            page === currentPage + 2
                                        ) {
                                            return <span key={page} className="flex items-center px-2">...</span>;
                                        }
                                        return null;
                                    })}
                                </div>

                                <button
                                    onClick={goToNextPage}
                                    disabled={currentPage === totalPages}
                                    className={`p-2 rounded-lg transition-colors ${currentPage === totalPages
                                            ? 'text-gray-400 cursor-not-allowed'
                                            : 'text-gray-700 hover:bg-gray-100'
                                        }`}>
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* Delete Confirmation Dialog */}
            {showDeleteDialog && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                                <Trash2 className="w-6 h-6 text-red-600" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-800">Delete Product</h3>
                                <p className="text-sm text-gray-600">This action cannot be undone</p>
                            </div>
                        </div>

                        <div className="mb-6">
                            <p className="text-gray-700 mb-2">
                                Are you sure you want to delete <strong>{productToDelete?.name}</strong>?
                            </p>
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-3">
                                <p className="text-sm text-yellow-800">
                                    ⚠️ This product will be permanently removed from your inventory.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={handleDeleteCancel}
                                disabled={deleteLoading}
                                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50">
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteConfirm}
                                disabled={deleteLoading}

                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2">
                                {deleteLoading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Deleting...
                                    </>
                                ) : (
                                    <>
                                        <Trash2 className="w-4 h-4" />
                                        Delete Product
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductsSection;