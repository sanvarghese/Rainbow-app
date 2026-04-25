// app/orders/[orderId]/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import {
  Package,
  CheckCircle,
  XCircle,
  Truck,
  Clock,
  MapPin,
  CreditCard,
  User,
  Phone,
  Calendar,
  History,
  ArrowLeft,
  ShoppingBag,
  ChevronRight,
  Info,
  Mail,
  Home,
  DollarSign,
  TrendingDown,
  AlertCircle
} from 'lucide-react';

interface OrderItem {
  productId: string;
  name: string;
  subtitle: string;
  quantity: number;
  price: number;
  offerPrice: number;
  image: string;
  variantDisplayValue?: string;
}

interface StatusLog {
  status: string;
  timestamp: string;
  note?: string;
  updatedBy: 'customer' | 'merchant' | 'system';
  updatedById?: string;
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
  deliveryDate: string;
  statusLogs: StatusLog[];
  createdAt: string;
  updatedAt: string;
}

// Improved Status History Modal
const StatusHistoryModal: React.FC<{ logs: StatusLog[]; onClose: () => void }> = ({ logs, onClose }) => {
  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'processing': return <Clock className="w-5 h-5 text-blue-500" />;
      case 'shipped': return <Truck className="w-5 h-5 text-purple-500" />;
      case 'delivered': return <Package className="w-5 h-5 text-green-600" />;
      case 'cancelled': return <XCircle className="w-5 h-5 text-red-500" />;
      default: return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Order Placed';
      case 'confirmed': return 'Order Confirmed';
      case 'processing': return 'Processing Started';
      case 'shipped': return 'Order Shipped';
      case 'delivered': return 'Order Delivered';
      case 'cancelled': return 'Order Cancelled';
      default: return status;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Backdrop */}
        <div className="fixed inset-0 transition-opacity bg-black bg-opacity-50" onClick={onClose}></div>

        {/* Modal Panel */}
        <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          {/* Modal Header */}
          <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                  <History className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Order Status Timeline</h3>
                  <p className="text-sm text-green-100 mt-0.5">Complete history of your order</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-white hover:text-green-100 transition-colors"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Modal Body */}
          <div className="bg-gray-50 px-6 py-6 max-h-[60vh] overflow-y-auto">
            <div className="space-y-0">
              {logs.map((log, idx) => (
                <div key={idx} className="relative">
                  {/* Timeline Line */}
                  {idx < logs.length - 1 && (
                    <div className="absolute left-5 top-10 bottom-0 w-0.5 bg-gray-200"></div>
                  )}

                  {/* Timeline Item */}
                  <div className="relative flex gap-4 pb-6">
                    <div className="relative z-10">
                      <div className="w-10 h-10 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center shadow-sm">
                        {getStatusIcon(log.status)}
                      </div>
                    </div>
                    <div className="flex-1 bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-900 capitalize">
                            {getStatusLabel(log.status)}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${log.updatedBy === 'merchant' ? 'bg-blue-100 text-blue-700' :
                              log.updatedBy === 'customer' ? 'bg-green-100 text-green-700' :
                                'bg-gray-100 text-gray-600'
                            }`}>
                            {log.updatedBy === 'merchant' ? 'Merchant' :
                              log.updatedBy === 'customer' ? 'You' : 'System'}
                          </span>
                        </div>
                        <div className="text-sm text-gray-500">
                          <span className="font-medium">{formatDateTime(log.timestamp)}</span>
                          <span className="text-gray-400 ml-2">({formatTime(log.timestamp)})</span>
                        </div>
                      </div>
                      {log.note && (
                        <div className="mt-2 p-2 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-600 flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                            {log.note}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Modal Footer */}
          <div className="bg-white px-6 py-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-colors"
            >
              Close Timeline
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Enhanced Compact Timeline Component
const CompactTimeline: React.FC<{ logs: StatusLog[]; currentStatus: string }> = ({ logs, currentStatus }) => {
  const statusOrder = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
  const currentIndex = statusOrder.indexOf(currentStatus);

  const getStatusDate = (status: string) => {
    const log = logs.find(l => l.status === status);
    return log ? new Date(log.timestamp) : null;
  };

  if (currentStatus === 'cancelled') {
    const cancelledLog = logs.find(l => l.status === 'cancelled');
    return (
      <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-4 text-center border border-red-100">
        <div className="flex items-center justify-center gap-2 mb-2">
          <XCircle className="w-5 h-5 text-red-600" />
          <p className="text-red-600 font-semibold">Order Cancelled</p>
        </div>
        {cancelledLog && (
          <p className="text-sm text-red-500">
            {new Date(cancelledLog.timestamp).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="flex items-center justify-between">
        {statusOrder.map((status, index) => {
          const date = getStatusDate(status);
          const isCompleted = index <= currentIndex;
          const isCurrent = status === currentStatus;

          return (
            <React.Fragment key={status}>
              <div className="flex flex-col items-center flex-1">
                <div className={`
                  w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300
                  ${isCompleted
                    ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-400 border-2 border-gray-200'
                  }
                  ${isCurrent ? 'ring-4 ring-green-200 scale-110' : ''}
                `}>
                  {isCompleted ? (
                    status === 'delivered' ? <Package className="w-5 h-5" /> :
                      status === 'shipped' ? <Truck className="w-5 h-5" /> :
                        <CheckCircle className="w-5 h-5" />
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                  )}
                </div>
                <p className={`text-xs font-semibold mt-3 ${isCompleted ? 'text-gray-900' : 'text-gray-400'}`}>
                  {status === 'pending' ? 'Placed' :
                    status === 'confirmed' ? 'Confirmed' :
                      status === 'processing' ? 'Processing' :
                        status === 'shipped' ? 'Shipped' : 'Delivered'}
                </p>
                {date && (
                  <p className="text-xs text-gray-500 mt-1 hidden sm:block font-medium">
                    {date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </p>
                )}
              </div>
              {index < statusOrder.length - 1 && (
                <div className={`flex-1 h-1 mx-2 rounded-full transition-all duration-300 ${index < currentIndex ? 'bg-gradient-to-r from-green-500 to-green-600' : 'bg-gray-200'}`} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

// Enhanced Status Badge
const StatusBadge: React.FC<{ status: Order['status'] }> = ({ status }) => {
  const config = {
    pending: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: Clock, label: 'Pending' },
    confirmed: { color: 'bg-blue-100 text-blue-800 border-blue-200', icon: CheckCircle, label: 'Confirmed' },
    processing: { color: 'bg-purple-100 text-purple-800 border-purple-200', icon: Clock, label: 'Processing' },
    shipped: { color: 'bg-indigo-100 text-indigo-800 border-indigo-200', icon: Truck, label: 'Shipped' },
    delivered: { color: 'bg-green-100 text-green-800 border-green-200', icon: Package, label: 'Delivered' },
    cancelled: { color: 'bg-red-100 text-red-800 border-red-200', icon: XCircle, label: 'Cancelled' }
  };

  const { color, icon: Icon, label } = config[status];

  return (
    <span className={`px-3 py-1.5 rounded-full text-sm font-semibold flex items-center gap-1.5 border ${color}`}>
      <Icon className="w-3.5 h-3.5" />
      {label}
    </span>
  );
};

// Enhanced Order Items Component
const OrderItemsSection: React.FC<{ items: OrderItem[]; formatCurrency: (amount: number) => string }> = ({
  items,
  formatCurrency
}) => {
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">Order Items</h2>
              <p className="text-sm text-gray-500 mt-0.5">{items.length} items in your order</p>
            </div>
          </div>
        </div>
      </div>
      <div className="divide-y divide-gray-100">
        {items.map((item, index) => (
          <div key={index} className="p-6 hover:bg-gray-50 transition-colors">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-20 h-20 object-cover rounded-xl shadow-sm"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/placeholder-image.jpg';
                  }}
                />
              </div>
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{item.name}</h3>
                    <p className="text-sm text-gray-500 mt-0.5">{item.subtitle}</p>
                    {item.variantDisplayValue && (
                      <div className="inline-flex items-center gap-1 mt-2 px-2 py-1 bg-gray-100 rounded-md">
                        <span className="text-xs text-gray-600">Variant:</span>
                        <span className="text-xs font-medium text-gray-900">{item.variantDisplayValue}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-3 mt-3">
                      <div className="flex items-center gap-1">
                        <span className="text-sm text-gray-500">Quantity:</span>
                        <span className="text-sm font-semibold text-gray-900">{item.quantity}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">{formatCurrency(item.offerPrice)}</p>
                    {item.price > item.offerPrice && (
                      <p className="text-sm text-gray-400 line-through">{formatCurrency(item.price)}</p>
                    )}
                    <p className="text-sm font-medium text-green-600 mt-2">
                      Total: {formatCurrency(item.offerPrice * item.quantity)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Enhanced Order Summary Component
const OrderSummarySection: React.FC<{ order: Order; formatCurrency: (amount: number) => string; formatDate: (date: string) => string }> = ({
  order,
  formatCurrency,
  formatDate
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden sticky top-6">
      <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
            <CreditCard className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">Order Summary</h2>
            <p className="text-sm text-gray-500 mt-0.5">Payment breakdown</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-4">
        {/* Amount Details */}
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal</span>
            <span className="font-medium">{formatCurrency(order.orderSummary.subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Delivery Fee</span>
            <span className="font-medium">{formatCurrency(order.orderSummary.deliveryFee)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Tax & GST</span>
            <span className="font-medium">{formatCurrency(order.orderSummary.tax)}</span>
          </div>
          {order.orderSummary.discount > 0 && (
            <div className="flex justify-between text-sm text-green-600 bg-green-50 p-2 rounded-lg -mx-2 px-3">
              <div className="flex items-center gap-1">
                <TrendingDown className="w-4 h-4" />
                <span>Discount Applied</span>
              </div>
              <span className="font-semibold">-{formatCurrency(order.orderSummary.discount)}</span>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200"></div>

        {/* Total */}
        <div className="flex justify-between items-center">
          <span className="text-base font-semibold text-gray-900">Total Amount</span>
          <span className="text-2xl font-bold text-green-600">{formatCurrency(order.orderSummary.total)}</span>
        </div>

        {/* Payment Details */}
        <div className="bg-gray-50 rounded-xl p-4 space-y-2 mt-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Payment Method</span>
            <span className="font-medium capitalize flex items-center gap-1">
              <DollarSign className="w-3 h-3" />
              {order.paymentMethod === 'cod' ? 'Cash on Delivery' : order.paymentMethod}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Payment Status</span>
            <span className={`font-semibold capitalize flex items-center gap-1 ${order.paymentStatus === 'paid' ? 'text-green-600' :
                order.paymentStatus === 'failed' ? 'text-red-600' : 'text-yellow-600'
              }`}>
              <div className={`w-2 h-2 rounded-full ${order.paymentStatus === 'paid' ? 'bg-green-600' :
                  order.paymentStatus === 'failed' ? 'bg-red-600' : 'bg-yellow-600'
                }`}></div>
              {order.paymentStatus}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Expected Delivery</span>
            <span className="font-medium flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {formatDate(order.deliveryDate)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Enhanced Shipping Address Component
const ShippingAddressSection: React.FC<{ address: Order['address'] }> = ({ address }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
            <MapPin className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">Shipping Address</h2>
            <p className="text-sm text-gray-500 mt-0.5">Where your order will be delivered</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-100">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
                <User className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Full Name</p>
                <p className="font-semibold text-gray-900">{address.fullName}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
                <Phone className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Phone Number</p>
                <p className="font-semibold text-gray-900">{address.phoneNumber}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
                <Home className="w-4 h-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500">Delivery Address</p>
                <p className="font-medium text-gray-900">{address.addressLine1}</p>
                {address.addressLine2 && <p className="text-gray-700">{address.addressLine2}</p>}
                <p className="text-gray-700">{address.city}, {address.state}</p>
                <p className="text-gray-700">PIN Code: {address.postalCode}</p>
                <p className="text-gray-700">{address.country}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const OrderDetailPage = () => {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();
  const params = useParams();
  const orderId = params.orderId as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  useEffect(() => {
    if (sessionStatus === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (sessionStatus === 'authenticated' && orderId) {
      fetchOrderDetails();
    }
  }, [sessionStatus, router, orderId]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/orders/${orderId}`);
      const data = await response.json();

      if (data.success) {
        setOrder(data.order);
      } else {
        setError(data.error || 'Failed to fetch order details');
      }
    } catch (err) {
      setError('An error occurred while fetching order details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading order details...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error || !order) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 py-12">
          <div className="max-w-4xl mx-auto px-4">
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-red-700">
              <p className="font-medium">Error</p>
              <p className="text-sm mt-1">{error || 'Order not found'}</p>
            </div>
            <div className="mt-6">
              <Link href="/orders" className="text-green-600 hover:text-green-700 font-medium inline-flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Orders
              </Link>
            </div>
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
          {/* Back Button */}
          <div className="mb-6">
            <Link
              href="/orders"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors group"
            >
              <div className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center group-hover:shadow transition-shadow">
                <ArrowLeft className="w-4 h-4" />
              </div>
              <span className="font-medium">Back to Orders</span>
            </Link>
          </div>

          {/* Order Header Card */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden mb-6">
            <div className="p-6 md:p-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <h3 className="text-1xl font-bold text-gray-900">Order #{order.orderId}</h3>
                    <StatusBadge status={order.status} />
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4" />
                      {formatDateTime(order.createdAt)}
                    </span>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 text-center min-w-[160px]">
                  <p className="text-sm text-gray-600 mb-1">Total Amount</p>
                  <p className="text-2xl font-bold text-green-600">{formatCurrency(order.orderSummary.total)}</p>
                </div>
              </div>

              {/* Compact Timeline */}
              <div className="pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-6 bg-green-500 rounded-full"></div>
                    <h3 className="text-sm font-semibold text-gray-900">Order Progress</h3>
                  </div>
                  {order.statusLogs && order.statusLogs.length > 0 && (
                    <button
                      onClick={() => setShowHistoryModal(true)}
                      className="text-sm text-green-600 hover:text-green-700 font-medium flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-green-50 transition-colors"
                    >
                      <History className="w-4 h-4" />
                      View Full Timeline
                    </button>
                  )}
                </div>
                <CompactTimeline logs={order.statusLogs || []} currentStatus={order.status} />
              </div>
            </div>
          </div>

          {/* Order Items Section - Full Width */}
          <div className="mb-6">
            <OrderItemsSection items={order.items} formatCurrency={formatCurrency} />
          </div>

          {/* Order Summary & Shipping Address - Side by Side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <OrderSummarySection
              order={order}
              formatCurrency={formatCurrency}
              formatDate={formatDate}
            />
            <ShippingAddressSection address={order.address} />
          </div>
        </div>
      </div>

      {/* Status History Modal */}
      {showHistoryModal && order.statusLogs && (
        <StatusHistoryModal
          logs={order.statusLogs}
          onClose={() => setShowHistoryModal(false)}
        />
      )}

      <Footer />
    </>
  );
};

export default OrderDetailPage;