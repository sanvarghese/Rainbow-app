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

const ProductApprovalSection = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/admin/approvals/products');
      const data = await res.json();
      if (data.success) {
        // Only show pending products
        setProducts(data.products.filter((p: Product) => !p.isApproved));
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-600">Loading pending products...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Product Approvals</h2>
          <p className="text-gray-600 mt-1">
            {products.length} product{products.length !== 1 ? 's' : ''} pending approval
          </p>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No Pending Products</h3>
          <p className="text-gray-600">All products have been reviewed.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {products.map((product) => (
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
                <span className="absolute top-3 right-3 px-3 py-1 bg-yellow-500 text-white text-xs font-medium rounded-full">
                  Pending Review
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
      )}

      {/* Product Review Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-800">Review Product</h3>
              <button
                onClick={() => setSelectedProduct(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <XCircle className="w-6 h-6" />
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
                  <span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">
                    Pending Approval
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