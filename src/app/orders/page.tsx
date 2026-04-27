// app/orders/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import Header from '../components/Header/Header';
import Footer from '../components/Footer/Footer';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Star, Package, Clock, CheckCircle, XCircle, Truck, Calendar, ChevronRight, ShoppingBag } from 'lucide-react';
import ReviewModal from '../components/Review/ReviewModal';

interface OrderItem {
  productId: string;
  name: string;
  subtitle: string;
  quantity: number;
  price: number;
  offerPrice: number;
  image: string;
}

interface Order {
  _id: string;
  orderId: string;
  address: {
    fullName: string;
    phoneNumber: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  items: OrderItem[];
  paymentMethod: string;
  orderSummary: {
    subtotal: number;
    deliveryFee: number;
    tax: number;
    discount: number;
    total: number;
  };
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed';
  createdAt: string;
  updatedAt: string;
}

const OrdersPage = () => {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reviewStatus, setReviewStatus] = useState<{ [key: string]: any }>({});

  // Review Modal State
  const [selectedProduct, setSelectedProduct] = useState<{
    id: string;
    name: string;
    image: string;
    orderId: string;
    existingReview?: any;
  } | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);

  useEffect(() => {
    if (sessionStatus === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (sessionStatus === 'authenticated') {
      fetchOrders();
    }
  }, [sessionStatus, router]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/orders');
      const data = await response.json();

      if (data.success) {
        setOrders(data.orders);
      } else {
        setError(data.error || 'Failed to fetch orders');
      }
    } catch (err) {
      setError('An error occurred while fetching orders');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (orders.length > 0) {
      orders.forEach(order => {
        if (order.status === 'delivered') {
          order.items.forEach(item => {
            checkReviewStatus(item.productId, order._id);
          });
        }
      });
    }
  }, [orders]);

  const checkReviewStatus = async (productId: string, orderId: string) => {
    const key = `${orderId}-${productId}`;
    if (reviewStatus[key]) return reviewStatus[key];

    try {
      const response = await fetch(`/api/reviews/check?productId=${productId}&orderId=${orderId}`);
      const data = await response.json();
      setReviewStatus(prev => ({ ...prev, [key]: data }));
      return data;
    } catch (error) {
      console.error('Error checking review status:', error);
      return null;
    }
  };

  const getStatusConfig = (status: Order['status']) => {
    const config = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'Pending' },
      confirmed: { color: 'bg-blue-100 text-blue-800', icon: CheckCircle, label: 'Confirmed' },
      processing: { color: 'bg-purple-100 text-purple-800', icon: Clock, label: 'Processing' },
      shipped: { color: 'bg-indigo-100 text-indigo-800', icon: Truck, label: 'Shipped' },
      delivered: { color: 'bg-green-100 text-green-800', icon: Package, label: 'Delivered' },
      cancelled: { color: 'bg-red-100 text-red-800', icon: XCircle, label: 'Cancelled' }
    };
    return config[status] || config.pending;
  };

  const getPaymentStatusColor = (status: Order['paymentStatus']) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      paid: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const handleReviewClick = async (productId: string, productName: string, productImage: string, orderId: string) => {
    const status = await checkReviewStatus(productId, orderId);
    setSelectedProduct({
      id: productId,
      name: productName,
      image: productImage,
      orderId: orderId,
      existingReview: status?.hasReview ? status.review : null
    });
    setShowReviewModal(true);
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your orders...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
            <p className="text-gray-600 mt-1">Track and manage all your orders</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {orders.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingBag className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No orders found</h3>
              <p className="text-gray-500 mb-6">
                You haven't placed any orders yet.
              </p>
              <Link
                href="/products"
                className="inline-flex items-center px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => {
                const statusConfig = getStatusConfig(order.status);
                const StatusIcon = statusConfig.icon;

                return (
                  <div
                    key={order._id}
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300"
                  >
                    <div className="p-6">
                      {/* Order Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                        <div>
                          <Link
                            href={`/orders/${order.orderId}`}
                            className="text-lg font-semibold text-green-600 hover:text-green-700 transition-colors inline-flex items-center gap-1"
                          >
                            Order #{order.orderId}
                            <ChevronRight className="w-4 h-4" />
                          </Link>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="flex items-center gap-1 text-sm text-gray-500">
                              <Calendar className="w-3.5 h-3.5" />
                              {formatDate(order.createdAt)}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-2">
                          <div className="text-2xl font-bold text-gray-900">
                            {formatCurrency(order.orderSummary.total)}
                          </div>
                          <div className="flex gap-2">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig.color}`}>
                              <StatusIcon className="w-3 h-3" />
                              {statusConfig.label}
                            </span>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentStatusColor(order.paymentStatus)}`}>
                              {order.paymentStatus === 'paid' ? 'Paid' :
                                order.paymentStatus === 'failed' ? 'Failed' : 'Pending Payment'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Order Items Preview */}
                      <div className="border-t border-gray-100 pt-4">
                        <div className="flex flex-col space-y-4">
                          {/* Show first 2 items with review buttons for delivered orders */}
                          {order.items.slice(0, 2).map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="h-12 w-12 object-cover rounded-lg bg-gray-50"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = '/placeholder-image.jpg';
                                  }}
                                />
                                <div>
                                  <p className="text-sm font-medium text-gray-900">{item.name}</p>
                                  <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                                </div>
                              </div>

                              {/* Review Button for each item in delivered orders */}
                              {order.status === 'delivered' && (
                                <button
                                  onClick={() => handleReviewClick(item.productId, item.name, item.image, order._id)}
                                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors"
                                  style={{ 
                                    backgroundColor: reviewStatus[`${order._id}-${item.productId}`]?.hasReview ? '#dcfce7' : '#eff6ff',
                                    color: reviewStatus[`${order._id}-${item.productId}`]?.hasReview ? '#059669' : '#2563eb'
                                  }}
                                >
                                  <Star className="w-3 h-3" />
                                  {reviewStatus[`${order._id}-${item.productId}`]?.hasReview ? 'Update Review' : 'Write Review'}
                                </button>
                              )}
                            </div>
                          ))}

                          {/* Show remaining items count */}
                          {order.items.length > 2 && (
                            <Link
                              href={`/orders/${order.orderId}`}
                              className="text-sm text-green-600 hover:text-green-700 font-medium inline-flex items-center gap-1"
                            >
                              +{order.items.length - 2} more items
                              <ChevronRight className="w-3 h-3" />
                            </Link>
                          )}
                        </div>
                      </div>

                      {/* View Details Link */}
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <Link
                          href={`/orders/${order.orderId}`}
                          className="inline-flex items-center gap-2 text-sm font-medium text-green-600 hover:text-green-700"
                        >
                          View Order Details
                          <ChevronRight className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Review Modal */}
      {showReviewModal && selectedProduct && (
        <ReviewModal
          isOpen={showReviewModal}
          onClose={() => {
            setShowReviewModal(false);
            setSelectedProduct(null);
          }}
          productId={selectedProduct.id}
          orderId={selectedProduct.orderId}
          productName={selectedProduct.name}
          productImage={selectedProduct.image}
          existingReview={selectedProduct.existingReview}
          onSuccess={() => {
            alert('Review submitted successfully! Thank you for your feedback.');
            setShowReviewModal(false);
            setSelectedProduct(null);
            // Refresh orders to update review status
            fetchOrders();
          }}
        />
      )}

      <Footer />
    </>
  );
};

export default OrdersPage;