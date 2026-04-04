'use client';

import React, { useState, useEffect } from 'react';
import { Package, Building, Eye, CheckCircle, XCircle } from 'lucide-react';

interface Product {
  _id: string;
  name: string;
  description?: string;
  price: number;
  category: string;
  subCategory?: string;
  images: string[];
  status: 'inactive' | 'approved' | 'rejected' | 'removed';
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
  const [allProducts, setAllProducts] = useState<Product[]>([]); // Store all products
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');

  // Fetch ALL products once on component mount
  useEffect(() => {
    fetchAllProducts();
  }, []);

  // Filter products whenever filter changes or allProducts updates
  useEffect(() => {
    filterProducts();
  }, [filter, allProducts]);

  const fetchAllProducts = async () => {
    try {
      const res = await fetch('/api/admin/approvals/products?status=all');
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
      result = allProducts.filter(p => p.status === 'inactive' || p.status === 'pending');
    } else if (filter === 'approved') {
      result = allProducts.filter(p => p.status === 'approved');
    } else if (filter === 'rejected') {
      result = allProducts.filter(p => p.status === 'rejected');
    }
    // 'all' shows everything

    setFilteredProducts(result);
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
        alert(data.message);
        // Refresh all data after approval/rejection
        fetchAllProducts();
        setSelectedProduct(null);
      } else {
        alert(data.error || 'Failed to update product status');
      }
    } catch (error) {
      console.error('Failed to update product:', error);
      alert('Failed to update product status');
    }
  };

  // Calculate counts from allProducts (always accurate)
  const pendingCount = allProducts.filter((p) => p.status === 'inactive' || p.status === 'pending').length;
  const approvedCount = allProducts.filter((p) => p.status === 'approved').length;
  const rejectedCount = allProducts.filter((p) => p.status === 'rejected').length;
  const totalCount = allProducts.length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-600">Loading products...</div>
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
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'pending' ? 'bg-yellow-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Pending ({pendingCount})
          </button>

          <button
            onClick={() => setFilter('approved')}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'approved' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Approved ({approvedCount})
          </button>

          <button
            onClick={() => setFilter('rejected')}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'rejected' ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Rejected ({rejectedCount})
          </button>

          <button
            onClick={() => setFilter('all')}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'all' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            All ({totalCount})
          </button>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <div key={product._id} className="bg-white rounded-xl shadow-sm overflow-hidden">
            {/* Product Image */}
            <div className="h-48 bg-gray-100 relative">
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
              <span className={`absolute top-3 right-3 px-3 py-1 text-xs font-medium rounded-full ${
                product.status === 'approved' ? 'bg-green-500 text-white' :
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
              </div>

              <div className="border-t pt-3 mb-4">
                <div className="flex items-center gap-2">
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

              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedProduct(product)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                >
                  <Eye className="w-4 h-4" />
                  Review
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredProducts.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No Products Found</h3>
          <p className="text-gray-600">
            {filter === 'pending' ? 'No pending products for approval' :
             filter === 'approved' ? 'No approved products yet' :
             filter === 'rejected' ? 'No rejected products' : 'No products found'}
          </p>
        </div>
      )}

      {/* Product Review Modal - Unchanged */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* ... Your existing modal content remains exactly the same ... */}
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-800">Review Product</h3>
              <button onClick={() => setSelectedProduct(null)} className="text-gray-500 hover:text-gray-700">
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              {/* Product Images, Details, Company Info, etc. - Keep your original modal code here */}
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
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                    selectedProduct.status === 'approved' ? 'bg-green-100 text-green-700' :
                    selectedProduct.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {selectedProduct.status === 'approved' ? 'Approved' : 
                     selectedProduct.status === 'rejected' ? 'Rejected' : 'Pending Approval'}
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
                      <img src={selectedProduct.companyId.companyLogo} alt={selectedProduct.companyId.name} className="w-12 h-12 rounded object-cover" />
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
                  <button
                    onClick={() => handleApproval(selectedProduct._id, false)}
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
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductApprovalSection;