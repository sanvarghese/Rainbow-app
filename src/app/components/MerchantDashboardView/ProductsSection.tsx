'use client';

import React, { useState, useEffect } from 'react';
import { Edit, Plus, Package as PackageIcon, ChevronLeft, ChevronRight, Trash2, Eye, XCircle, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';
import CreateProduct from '../BecomeSeller/CreateProduct';
import toast, { Toaster } from 'react-hot-toast';

const ProductsSection = () => {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [productToDelete, setProductToDelete] = useState<any>(null);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [expandedVariants, setExpandedVariants] = useState<{ [key: string]: boolean }>({});
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

    // Toggle variant expansion
    const toggleVariantExpand = (productId: string) => {
        setExpandedVariants(prev => ({
            ...prev,
            [productId]: !prev[productId]
        }));
    };

    // Get status badge color and text
    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'approved':
                return {
                    text: 'Approved',
                    className: 'bg-green-100 text-green-700',
                    icon: <CheckCircle className="w-3 h-3 mr-1" />
                };
            case 'rejected':
                return {
                    text: 'Rejected',
                    className: 'bg-red-100 text-red-700',
                    icon: <XCircle className="w-3 h-3 mr-1" />
                };
            case 'removed':
                return {
                    text: 'Removed',
                    className: 'bg-gray-100 text-gray-700',
                    icon: <Eye className="w-3 h-3 mr-1" />
                };
            default:
                return {
                    text: 'Pending',
                    className: 'bg-yellow-100 text-yellow-700',
                    icon: <Eye className="w-3 h-3 mr-1" />
                };
        }
    };

    // Get the first product image or fallback
    const getProductImage = (product: any): string | null => {
        if (product?.productImages && Array.isArray(product.productImages) && product.productImages.length > 0) {
            const firstImage = product.productImages[0];
            return firstImage?.url || null;
        }
        return product?.productImage || null;
    };

    const handleAddProduct = () => {
        setSelectedProduct(null);
        setIsEditing(true);
    };

    const handleEditProduct = (product: any) => {
        console.log('Editing product:', product);
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
            const res = await fetch(`/api/merchant/product/${productToDelete._id}`, {
                method: 'DELETE',
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.details || data.error || 'Failed to delete product');
            }

            await fetchProducts();

            const newTotalPages = Math.ceil((products.length - 1) / itemsPerPage);
            if (currentPage > newTotalPages && newTotalPages > 0) {
                setCurrentPage(newTotalPages);
            }

            toast.success('Product deleted successfully');

            setShowDeleteDialog(false);
            setProductToDelete(null);
        } catch (error: any) {
            toast.error(error.message);
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
            <Toaster position="top-right" />

            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Products</h2>
                    <p className="text-gray-600 mt-1">
                        {products.length} product{products.length !== 1 ? 's' : ''}
                    </p>
                </div>
                <button
                    onClick={handleAddProduct}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                    <Plus className="w-4 h-4" />
                    Add Product
                </button>
            </div>

            {products.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl shadow-sm p-5">
                    <PackageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">No Products Yet</h3>
                    <button onClick={handleAddProduct} className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700">
                        Add Your First Product
                    </button>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {currentProducts.map((product) => {
                            const imageUrl = getProductImage(product);
                            const imageCount = product.productImages?.length || 0;
                            const statusInfo = getStatusBadge(product.status);
                            const isExpanded = expandedVariants[product._id] || false;

                            return (
                                <div key={product._id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                                    <div className="relative h-48 bg-gray-100">
                                        {imageUrl ? (
                                            <img
                                                src={imageUrl}
                                                alt={product.name}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    e.currentTarget.src = '/placeholder-image.jpg';
                                                }}
                                            />
                                        ) : (
                                            <div className="h-full flex items-center justify-center">
                                                <PackageIcon className="w-16 h-16 text-gray-300" />
                                            </div>
                                        )}

                                        {/* Image count badge */}
                                        {imageCount > 1 && (
                                            <div className="absolute top-2 left-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded-full text-xs">
                                                +{imageCount - 1} more
                                            </div>
                                        )}

                                        {/* Variant indicator badge */}
                                        {product.hasVariants && (
                                            <div className="absolute top-2 right-2 bg-blue-600 text-white px-2 py-1 rounded-full text-xs">
                                                {product.variants?.length || 0} Variants
                                            </div>
                                        )}

                                        {/* Status Badge */}
                                        <div className="absolute bottom-2 right-2">
                                            <span className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusInfo.className}`}>
                                                {statusInfo.icon}
                                                {statusInfo.text}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="p-4">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="text-lg font-semibold text-gray-800 line-clamp-1 flex-1">
                                                {product.name}
                                            </h3>
                                            <div className="flex gap-1">
                                                <button onClick={() => handleEditProduct(product)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg">
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => handleDeleteClick(product)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>

                                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                                            {product.descriptionShort}
                                        </p>

                                        <div className="flex flex-wrap gap-2 mb-3">
                                            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                                                {product.category}
                                            </span>
                                            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                                                {product.subCategory}
                                            </span>
                                        </div>

                                        {/* Non-Variant Product Display */}
                                        {!product.hasVariants && (
                                            <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                                                <div>
                                                    <p className="text-xs text-gray-500">Quantity</p>
                                                    <p className="font-semibold">{product.quantity}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500">Price</p>
                                                    {product.offerPrice > 0 && product.offerPrice < product.price ? (
                                                        <div>
                                                            <p className="text-xs text-gray-400 line-through">₹{product.price}</p>
                                                            <p className="font-semibold text-green-600">₹{product.offerPrice}</p>
                                                        </div>
                                                    ) : (
                                                        <p className="font-semibold">₹{product.price}</p>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500">Offer</p>
                                                    <p className="font-semibold">₹{product.offerPrice}</p>
                                                </div>
                                            </div>
                                        )}

                                        {/* Variant Product Display */}
                                        {product.hasVariants && product.variants && (
                                            <div className="pt-3 border-t border-gray-200">
                                                <button
                                                    onClick={() => toggleVariantExpand(product._id)}
                                                    className="w-full flex items-center justify-between text-sm font-medium text-gray-700 hover:text-gray-900 mb-2"
                                                >
                                                    <span>Variants ({product.variants.length})</span>
                                                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                                </button>

                                                {isExpanded && (
                                                    <div className="space-y-3 mt-2 max-h-96 overflow-y-auto">
                                                        {product.variants.map((variant: any, idx: number) => (
                                                            <div key={idx} className="bg-gray-50 rounded-lg p-3">
                                                                <div className="flex justify-between items-start mb-2">
                                                                    <div>
                                                                        <span className="text-xs font-semibold text-gray-600 uppercase">
                                                                            {variant.variantType}
                                                                        </span>
                                                                        <p className="text-sm font-medium text-gray-800">
                                                                            {variant.displayValue}
                                                                            {variant.variantUnit && ` ${variant.variantUnit}`}
                                                                        </p>
                                                                        {variant.colorHex && (
                                                                            <div className="flex items-center gap-1 mt-1">
                                                                                <div 
                                                                                    className="w-3 h-3 rounded-full" 
                                                                                    style={{ backgroundColor: variant.colorHex }}
                                                                                />
                                                                                <span className="text-xs text-gray-500">{variant.colorHex}</span>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                    <div className="text-right">
                                                                        <p className="text-xs text-gray-500">Qty: {variant.quantity}</p>
                                                                    </div>
                                                                </div>

                                                                <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                                                                    <div>
                                                                        {variant.offerPrice > 0 && variant.offerPrice < variant.price ? (
                                                                            <div>
                                                                                <p className="text-xs text-gray-400 line-through">₹{variant.price}</p>
                                                                                <p className="text-sm font-bold text-green-600">₹{variant.offerPrice}</p>
                                                                            </div>
                                                                        ) : (
                                                                            <p className="text-sm font-bold text-gray-800">₹{variant.price}</p>
                                                                        )}
                                                                    </div>
                                                                    {variant.options && variant.options.length > 0 && (
                                                                        <div className="text-xs text-gray-500">
                                                                            + {variant.options.length} options
                                                                        </div>
                                                                    )}
                                                                </div>

                                                                {/* Show options if they exist */}
                                                                {variant.options && variant.options.length > 0 && (
                                                                    <div className="mt-2 pt-2 border-t border-gray-200">
                                                                        <p className="text-xs font-medium text-gray-600 mb-1">Options:</p>
                                                                        <div className="space-y-2">
                                                                            {variant.options.slice(0, 3).map((option: any, optIdx: number) => (
                                                                                <div key={optIdx} className="flex justify-between items-center text-xs">
                                                                                    <div className="flex items-center gap-1">
                                                                                        <span className="font-medium">{option.optionLabel}</span>
                                                                                        {option.colorHex && (
                                                                                            <div 
                                                                                                className="w-2 h-2 rounded-full" 
                                                                                                style={{ backgroundColor: option.colorHex }}
                                                                                            />
                                                                                        )}
                                                                                    </div>
                                                                                    <div className="flex gap-2">
                                                                                        <span>Qty: {option.quantity}</span>
                                                                                        {option.offerPrice > 0 && option.offerPrice < option.price ? (
                                                                                            <span className="text-green-600 font-medium">₹{option.offerPrice}</span>
                                                                                        ) : (
                                                                                            <span>₹{option.price}</span>
                                                                                        )}
                                                                                    </div>
                                                                                </div>
                                                                            ))}
                                                                            {variant.options.length > 3 && (
                                                                                <p className="text-xs text-gray-400 text-center">
                                                                                    + {variant.options.length - 3} more options
                                                                                </p>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                {/* Summary for collapsed view */}
                                                {!isExpanded && (
                                                    <div className="flex justify-between items-center text-xs text-gray-600 pt-1">
                                                        <span>Multiple variants available</span>
                                                        <span className="font-medium">
                                                            From ₹{Math.min(...product.variants.map((v: any) => v.offerPrice > 0 && v.offerPrice < v.price ? v.offerPrice : v.price))}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between bg-white rounded-xl p-4 shadow-sm">
                            <div className="text-sm text-gray-600">
                                Showing {startIndex + 1} to {Math.min(endIndex, products.length)} of {products.length}
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

                                <div className="flex gap-1">
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
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