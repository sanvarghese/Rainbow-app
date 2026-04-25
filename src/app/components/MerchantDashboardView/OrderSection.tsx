// app/components/merchant/OrderSection.tsx
import React, { useState, useEffect } from 'react';
import {
  Package,
  CheckCircle,
  XCircle,
  Calendar,
  Truck,
  Clock,
  Search,
  ChevronDown,
  ChevronUp,
  User,
  MapPin,
  CreditCard,
  History,
  ShoppingBag,
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
  userId: {
    _id: string;
    name: string;
    email: string;
  };
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

// Status Timeline Component
const OrderTimeline: React.FC<{ logs: StatusLog[] }> = ({ logs }) => {
  const getStatusStep = (status: string) => {
    const steps = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
    return steps.indexOf(status);
  };

  const getStatusIcon = (status: string, isCompleted: boolean) => {
    if (!isCompleted) return <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center"><Clock className="w-4 h-4 text-gray-400" /></div>;
    
    switch (status) {
      case 'confirmed': return <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center"><CheckCircle className="w-4 h-4 text-white" /></div>;
      case 'processing': return <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center"><Clock className="w-4 h-4 text-white" /></div>;
      case 'shipped': return <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center"><Truck className="w-4 h-4 text-white" /></div>;
      case 'delivered': return <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center"><Package className="w-4 h-4 text-white" /></div>;
      default: return <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center"><Clock className="w-4 h-4 text-gray-500" /></div>;
    }
  };

  const getStatusDate = (status: string) => {
    const log = logs.find(l => l.status === status);
    return log ? new Date(log.timestamp) : null;
  };

  const steps = [
    { key: 'confirmed', label: 'Confirmed' },
    { key: 'processing', label: 'Processing' },
    { key: 'shipped', label: 'Shipped' },
    { key: 'delivered', label: 'Delivered' }
  ];

  const currentStep = getStatusStep(logs[logs.length - 1]?.status || 'pending');

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = currentStep >= index;
          const date = getStatusDate(step.key);
          
          return (
            <React.Fragment key={step.key}>
              <div className="flex flex-col items-center flex-1">
                {getStatusIcon(step.key, isCompleted)}
                <p className={`text-xs font-medium mt-2 ${isCompleted ? 'text-gray-800' : 'text-gray-400'}`}>
                  {step.label}
                </p>
                {date && (
                  <p className="text-xs text-gray-500 mt-1">
                    {date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                  </p>
                )}
              </div>
              {index < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 ${currentStep > index ? 'bg-green-500' : 'bg-gray-200'}`} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

// Status Badge Component
const StatusBadge: React.FC<{ status: Order['status'] }> = ({ status }) => {
  const config = {
    pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'Pending' },
    confirmed: { color: 'bg-blue-100 text-blue-800', icon: CheckCircle, label: 'Confirmed' },
    processing: { color: 'bg-purple-100 text-purple-800', icon: Clock, label: 'Processing' },
    shipped: { color: 'bg-indigo-100 text-indigo-800', icon: Truck, label: 'Shipped' },
    delivered: { color: 'bg-green-100 text-green-800', icon: Package, label: 'Delivered' },
    cancelled: { color: 'bg-red-100 text-red-800', icon: XCircle, label: 'Cancelled' }
  };

  const { color, icon: Icon, label } = config[status];
  
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${color}`}>
      <Icon className="w-3 h-3" />
      {label}
    </span>
  );
};

const OrderSection: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [updatingOrder, setUpdatingOrder] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, [filter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/merchant/orders?status=${filter}`);
      const data = await res.json();
      if (data.orders) {
        setOrders(data.orders);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
    setUpdatingOrder(orderId);
    try {
      let url = `/api/merchant/orders/${orderId}`;
      let body: any = { status: newStatus };

      if (newStatus === 'confirmed') {
        url = `/api/merchant/orders/${orderId}/confirm`;
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });

        if (res.ok) {
          const data = await res.json();
          alert(data.message || 'Order confirmed successfully!');
          await fetchOrders();
        } else {
          const error = await res.json();
          alert(error.error || 'Failed to confirm order');
        }
        setUpdatingOrder(null);
        return;
      }

      const res = await fetch(url, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        await fetchOrders();
        alert(`Order ${newStatus} successfully!`);
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to update order status');
      }
    } catch (error) {
      console.error('Error updating order:', error);
      alert('Failed to update order status');
    } finally {
      setUpdatingOrder(null);
    }
  };

  const updateDeliveryDate = async (orderId: string, newDeliveryDate: string) => {
    setUpdatingOrder(orderId);
    try {
      const res = await fetch(`/api/merchant/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deliveryDate: newDeliveryDate }),
      });

      if (res.ok) {
        await fetchOrders();
        alert('Delivery date updated successfully!');
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to update delivery date');
      }
    } catch (error) {
      console.error('Error updating delivery date:', error);
      alert('Failed to update delivery date');
    } finally {
      setUpdatingOrder(null);
    }
  };

  const getOrderDates = (order: Order) => {
    const dates: Record<string, string> = {};
    order.statusLogs?.forEach(log => {
      dates[log.status] = new Date(log.timestamp).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    });
    return dates;
  };

  const filteredOrders = orders.filter(order =>
    order.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.userId?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Order Management</h1>
        <p className="text-gray-600 mt-1">Manage and track all customer orders</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by order ID, customer name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
          >
            <option value="all">All Orders</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <Package className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">No orders found</h3>
          <p className="text-gray-500">No orders match your search criteria</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const orderDates = getOrderDates(order);
            
            return (
              <div key={order._id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                {/* Order Header */}
                <div 
                  className="p-4 bg-gray-50 border-b border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => setExpandedOrder(expandedOrder === order._id ? null : order._id)}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                          <ShoppingBag className="w-5 h-5 text-green-600" />
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-gray-900">{order.orderId}</p>
                          <StatusBadge status={order.status} />
                        </div>
                        <p className="text-sm text-gray-600 mt-0.5">
                          {order.userId?.name || 'Guest'} • {order.userId?.email || 'No email'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Total Amount</p>
                        <p className="font-semibold text-gray-900">{formatCurrency(order.orderSummary.total)}</p>
                      </div>
                      <button className="text-gray-400 hover:text-gray-600">
                        {expandedOrder === order._id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Order Summary - Always Visible */}
                <div className="p-4 grid grid-cols-2 sm:grid-cols-4 gap-4 bg-white">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Order Date</p>
                    <p className="text-sm font-medium text-gray-900">{formatDate(order.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Delivery Date</p>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-gray-400" />
                      <p className="text-sm font-medium text-gray-900">{formatDate(order.deliveryDate)}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Items</p>
                    <p className="text-sm font-medium text-gray-900">{order.items.length} products</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Payment</p>
                    <p className={`text-sm font-medium ${order.paymentStatus === 'paid' ? 'text-green-600' : 'text-yellow-600'}`}>
                      {order.paymentStatus === 'paid' ? 'Paid' : 'Pending'}
                    </p>
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedOrder === order._id && (
                  <div className="border-t border-gray-200 p-4 space-y-6 bg-gray-50">
                    
                    {/* Status Timeline */}
                    {order.statusLogs && order.statusLogs.length > 0 && (
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <History className="w-4 h-4" />
                          Order Progress
                        </h3>
                        <OrderTimeline logs={order.statusLogs} />
                      </div>
                    )}

                    {/* Status Logs Details */}
                    {order.statusLogs && order.statusLogs.length > 0 && (
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900 mb-3">Status History</h3>
                        <div className="space-y-2">
                          {order.statusLogs.map((log, idx) => (
                            <div key={idx} className="bg-white rounded-lg p-3 border border-gray-200">
                              <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-gray-900 capitalize">{log.status}</span>
                                  <span className="text-xs text-gray-500">
                                    by {log.updatedBy === 'merchant' ? 'Merchant' : log.updatedBy === 'customer' ? 'Customer' : 'System'}
                                  </span>
                                </div>
                                <span className="text-xs text-gray-500">{formatDateTime(log.timestamp)}</span>
                              </div>
                              {log.note && <p className="text-sm text-gray-600">{log.note}</p>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Customer Information */}
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <User className="w-4 h-4" />
                          Customer Details
                        </h3>
                        <div className="bg-white rounded-lg p-4 border border-gray-200">
                          <p className="text-sm"><span className="font-medium">Name:</span> {order.address.fullName}</p>
                          <p className="text-sm mt-1"><span className="font-medium">Phone:</span> {order.address.phoneNumber}</p>
                          <div className="flex items-start gap-1 mt-1">
                            <MapPin className="w-3 h-3 text-gray-400 mt-0.5" />
                            <p className="text-sm text-gray-600">
                              {order.address.addressLine1}, {order.address.city}, {order.address.state} - {order.address.postalCode}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Order Summary */}
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <CreditCard className="w-4 h-4" />
                          Order Summary
                        </h3>
                        <div className="bg-white rounded-lg p-4 border border-gray-200 space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Subtotal:</span>
                            <span className="font-medium">{formatCurrency(order.orderSummary.subtotal)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Delivery Fee:</span>
                            <span className="font-medium">{formatCurrency(order.orderSummary.deliveryFee)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Tax:</span>
                            <span className="font-medium">{formatCurrency(order.orderSummary.tax)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Discount:</span>
                            <span className="font-medium text-red-600">-{formatCurrency(order.orderSummary.discount)}</span>
                          </div>
                          <div className="border-t border-gray-200 pt-2 mt-2">
                            <div className="flex justify-between">
                              <span className="font-semibold text-gray-900">Total:</span>
                              <span className="font-bold text-gray-900">{formatCurrency(order.orderSummary.total)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 mb-3">Order Items ({order.items.length})</h3>
                      <div className="space-y-2">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="bg-white rounded-lg p-3 border border-gray-200 flex items-center gap-3">
                            <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded-lg" />
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">{item.name}</p>
                              <p className="text-sm text-gray-600">
                                Qty: {item.quantity} × {formatCurrency(item.offerPrice)}
                                {item.variantDisplayValue && <span className="ml-2 text-xs text-gray-500">({item.variantDisplayValue})</span>}
                              </p>
                            </div>
                            <p className="font-semibold text-gray-900">{formatCurrency(item.offerPrice * item.quantity)}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 mb-3">Actions</h3>
                      <div className="flex flex-wrap gap-3 items-center">
                        {order.status === 'pending' && (
                          <button
                            onClick={() => updateOrderStatus(order._id, 'confirmed')}
                            disabled={updatingOrder === order._id}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 text-sm font-medium"
                          >
                            Accept Order
                          </button>
                        )}
                        
                        {order.status === 'confirmed' && (
                          <button
                            onClick={() => updateOrderStatus(order._id, 'processing')}
                            disabled={updatingOrder === order._id}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 text-sm font-medium"
                          >
                            Start Processing
                          </button>
                        )}
                        
                        {order.status === 'processing' && (
                          <button
                            onClick={() => updateOrderStatus(order._id, 'shipped')}
                            disabled={updatingOrder === order._id}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 text-sm font-medium"
                          >
                            Mark as Shipped
                          </button>
                        )}
                        
                        {order.status === 'shipped' && (
                          <button
                            onClick={() => updateOrderStatus(order._id, 'delivered')}
                            disabled={updatingOrder === order._id}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 text-sm font-medium"
                          >
                            Mark as Delivered
                          </button>
                        )}
                        
                        {['pending', 'confirmed', 'processing'].includes(order.status) && (
                          <button
                            onClick={() => updateOrderStatus(order._id, 'cancelled')}
                            disabled={updatingOrder === order._id}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 text-sm font-medium"
                          >
                            Cancel Order
                          </button>
                        )}

                        <div className="flex items-center gap-2 ml-auto">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <input
                            type="date"
                            min={new Date().toISOString().split('T')[0]}
                            defaultValue={order.deliveryDate.split('T')[0]}
                            onChange={(e) => updateDeliveryDate(order._id, e.target.value)}
                            disabled={updatingOrder === order._id}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default OrderSection;