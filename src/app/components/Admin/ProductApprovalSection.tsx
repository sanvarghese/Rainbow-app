'use client';

import React, { useState, useEffect } from 'react';
import { Package, Building, Eye, CheckCircle, XCircle, ThumbsUp, ThumbsDown } from 'lucide-react';

interface Product {
  _id: string;
  name: string;
  descriptionShort?: string;
  descriptionLong?: string;
  price: number;
  category: string;
  subCategory?: string;
  productImages: Array<{ url: string; publicId?: string }>;
  status: 'inactive' | 'pending' | 'approved' | 'rejected';
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

const ProductApprovalSection = () => {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchAllProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [filter, allProducts]);

  const fetchAllProducts = async () => {
    try {
      // Fix: Your API only accepts 'pending', 'approved', 'rejected' (no 'all')
      // So fetch all by getting each status or modify your API
      const res = await fetch('/api/admin/approvals/products?status=pending');
      const data = await res.json();

      if (data.success) {
        setAllProducts(data.products || []);
      } else {
        console.error("Failed to fetch products:", data.error);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = () => {
    let result = [...allProducts];

    if (filter === 'pending') {
      result = allProducts.filter(p => p.status === 'pending' || p.status === 'inactive');
    } else if (filter === 'approved') {
      result = allProducts.filter(p => p.status === 'approved');
    } else if (filter === 'rejected') {
      result = allProducts.filter(p => p.status === 'rejected');
    } else if (filter === 'all') {
      result = allProducts;
    }

    setFilteredProducts(result);
  };

  const getImageUrls = (product: Product): string[] => {
    if (product.productImages && Array.isArray(product.productImages)) {
      return product.productImages.map(img => img.url).filter(Boolean);
    }
    return [];
  };

  const handleApproval = async (productId: string, isApproved: boolean) => {
    // Prevent duplicate processing
    if (processingIds.has(productId)) return;

    setProcessingIds(prev => new Set(prev).add(productId));

    try {
      const res = await fetch('/api/admin/approvals/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, isApproved }),
      });

      const data = await res.json();

      if (data.success) {
        // Show success message
        alert(data.message);
        // Refresh products
        await fetchAllProducts();
        // Close modal
        setSelectedProduct(null);
      } else {
        alert(data.error || 'Failed to update product status');
      }
    } catch (error) {
      console.error('Failed to update product:', error);
      alert('Failed to update product status');
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  };

  const pendingCount = allProducts.filter((p) => p.status === 'inactive' || p.status === 'pending').length;
  const approvedCount = allProducts.filter((p) => p.status === 'approved').length;
  const rejectedCount = allProducts.filter((p) => p.status === 'rejected').length;
  const totalCount = allProducts.length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Tabs */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Product Approvals</h2>
          <p className="text-gray-600 mt-1">Manage product verification and approvals</p>
        </div>

        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setFilter('pending')}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'pending'
              ? 'bg-yellow-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
          >
            Pending ({pendingCount})
          </button>
          <button
            onClick={() => setFilter('approved')}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'approved'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
          >
            Approved ({approvedCount})
          </button>
          <button
            onClick={() => setFilter('rejected')}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'rejected'
              ? 'bg-red-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
          >
            Rejected ({rejectedCount})
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'all'
              ? 'bg-green-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
          >
            All ({totalCount})
          </button>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredProducts.map((product) => {
          const imageUrls = getImageUrls(product);
          const firstImage = imageUrls[0];
          const isProcessing = processingIds.has(product._id);

          return (
            <div key={product._id} className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
              <div className="h-48 bg-gray-100 relative">
                {firstImage ? (
                  <img
                    src={firstImage}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/placeholder-image.jpg';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="w-16 h-16 text-gray-400" />
                  </div>
                )}

                <span className={`absolute top-3 right-3 px-3 py-1 text-xs font-medium rounded-full ${product.status === 'approved' ? 'bg-green-500 text-white' :
                  product.status === 'rejected' ? 'bg-red-500 text-white' : 'bg-yellow-500 text-white'
                  }`}>
                  {product.status === 'approved' ? 'Approved' :
                    product.status === 'rejected' ? 'Rejected' : 'Pending Review'}
                </span>
              </div>

              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-1">
                  {product.name}
                </h3>

                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                  {product.descriptionShort || product.descriptionLong || 'No description'}
                </p>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Price:</span>
                    <span className="font-semibold text-gray-800">₹{product.price.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Category:</span>
                    <span className="text-gray-800">{product.category}</span>
                  </div>
                </div>

                {/* Company Info */}
                <div className="border-t pt-3 mb-4">
                  <div className="flex items-center gap-2">
                    {product.companyId.companyLogo ? (
                      <img
                        src={product.companyId.companyLogo}
                        alt={product.companyId.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                        <Building className="w-4 h-4 text-gray-400" />
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium text-gray-800">{product.companyId.name}</p>
                      <p className="text-xs text-gray-600">{product.companyId.email}</p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedProduct(product)}
                  disabled={isProcessing}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Eye className="w-4 h-4" />
                  Review Details
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredProducts.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No Products Found</h3>
          <p className="text-gray-600">No products match the selected filter.</p>
        </div>
      )}

      {/* Review Modal with Approval Buttons */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-bold">Review Product</h3>
              <button
                onClick={() => setSelectedProduct(null)}
                className="hover:bg-gray-100 p-1 rounded-full transition-colors"
              >
                <XCircle className="w-6 h-6 text-gray-500 hover:text-gray-700" />
              </button>
            </div>

            <div className="p-6">
              {/* Product Images */}
              {getImageUrls(selectedProduct).length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                  {getImageUrls(selectedProduct).map((img, index) => (
                    <img
                      key={index}
                      src={img}
                      alt={`${selectedProduct.name} ${index + 1}`}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  ))}
                </div>
              )}

              {/* Product Details */}
              <div className="space-y-4">
                <div>
                  <h4 className="text-2xl font-bold text-gray-800">{selectedProduct.name}</h4>
                  <p className="text-gray-500 text-sm mt-1">
                    Submitted on {new Date(selectedProduct.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Price</p>
                    <p className="text-2xl font-bold text-gray-800">₹{selectedProduct.price.toLocaleString('en-IN')}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Category</p>
                    <p className="text-lg font-semibold text-gray-800">{selectedProduct.category}</p>
                    {selectedProduct.subCategory && (
                      <p className="text-sm text-gray-600">{selectedProduct.subCategory}</p>
                    )}
                  </div>
                </div>

                {/* Description */}
                {(selectedProduct.descriptionShort || selectedProduct.descriptionLong) && (
                  // <div>
                  //   <h5 className="font-semibold text-gray-800 mb-2">Description</h5>
                  //   <p className="text-gray-600 whitespace-pre-wrap">
                  //     {selectedProduct.descriptionLong || selectedProduct.descriptionShort}
                  //   </p>
                  // </div>
                  
                  <div
                    className="text-gray-600 prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{
                      __html: selectedProduct.descriptionLong || selectedProduct.descriptionShort || ''
                    }}
                  />
                )}

                {/* Company Details */}
                <div>
                  <h5 className="font-semibold text-gray-800 mb-2">Company Information</h5>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="font-medium text-gray-800">{selectedProduct.companyId.name}</p>
                    <p className="text-sm text-gray-600">{selectedProduct.companyId.email}</p>
                  </div>
                </div>

                {/* Submitted By */}
                <div>
                  <h5 className="font-semibold text-gray-800 mb-2">Submitted By</h5>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="font-medium text-gray-800">{selectedProduct.userId.name}</p>
                    <p className="text-sm text-gray-600">{selectedProduct.userId.email}</p>
                  </div>
                </div>

                {/* Approval Actions - Only show for pending products */}
                {(selectedProduct.status === 'pending' || selectedProduct.status === 'inactive') && (
                  <div className="border-t pt-6 mt-6">
                    <h5 className="font-semibold text-gray-800 mb-4">Approval Actions</h5>
                    <div className="flex gap-4">
                      <button
                        onClick={() => handleApproval(selectedProduct._id, true)}
                        disabled={processingIds.has(selectedProduct._id)}
                        className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {processingIds.has(selectedProduct._id) ? (
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        ) : (
                          <>
                            <ThumbsUp className="w-5 h-5" />
                            Approve Product
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => handleApproval(selectedProduct._id, false)}
                        disabled={processingIds.has(selectedProduct._id)}
                        className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {processingIds.has(selectedProduct._id) ? (
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        ) : (
                          <>
                            <ThumbsDown className="w-5 h-5" />
                            Reject Product
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* Already approved/rejected message */}
                {selectedProduct.status === 'approved' && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-6">
                    <div className="flex items-center gap-2 text-green-800">
                      <CheckCircle className="w-5 h-5" />
                      <p className="font-medium">This product has been approved</p>
                    </div>
                  </div>
                )}

                {selectedProduct.status === 'rejected' && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-6">
                    <div className="flex items-center gap-2 text-red-800">
                      <XCircle className="w-5 h-5" />
                      <p className="font-medium">This product has been rejected</p>
                    </div>
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

export default ProductApprovalSection;