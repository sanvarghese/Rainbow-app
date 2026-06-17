'use client';
import React, { useState, useEffect, useCallback } from 'react';
import {
  Search, ChevronLeft, ChevronRight, Package, X,
  Clock, CheckCircle, Truck, XCircle, RefreshCw
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
  updatedBy: string;
}

interface Order {
  _id: string;
  orderId: string;
  userId: { name: string; email: string } | null;
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
  status: string;
  paymentStatus: string;
  deliveryDate: string;
  statusLogs: StatusLog[];
  createdAt: string;
}

const STATUS_OPTIONS = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

const STATUS_STYLES: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
  pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: <Clock className="w-3.5 h-3.5" /> },
  confirmed: { bg: 'bg-blue-100', text: 'text-blue-700', icon: <CheckCircle className="w-3.5 h-3.5" /> },
  processing: { bg: 'bg-purple-100', text: 'text-purple-700', icon: <RefreshCw className="w-3.5 h-3.5" /> },
  shipped: { bg: 'bg-indigo-100', text: 'text-indigo-700', icon: <Truck className="w-3.5 h-3.5" /> },
  delivered: { bg: 'bg-green-100', text: 'text-green-700', icon: <CheckCircle className="w-3.5 h-3.5" /> },
  cancelled: { bg: 'bg-red-100', text: 'text-red-700', icon: <XCircle className="w-3.5 h-3.5" /> },
};

const OrderSection = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({});

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: '10',
        status: statusFilter,
        paymentStatus: paymentFilter,
      });
      if (search) params.set('search', search);

      const res = await fetch(`/api/admin/orders?${params.toString()}`);
      const data = await res.json();

      if (data.success) {
        setOrders(data.orders);
        setTotalPages(data.pagination.totalPages);
        setTotalCount(data.pagination.totalCount);
        setStatusCounts(data.statusCounts);
      } else {
        setError(data.message || 'Failed to load orders');
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Something went wrong while loading orders');
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, paymentFilter, search]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  };

  const openOrderDetail = (order: Order) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setStatusNote('');
  };

  const closeOrderDetail = () => {
    setSelectedOrder(null);
    setNewStatus('');
    setStatusNote('');
  };

  const handleStatusUpdate = async () => {
    if (!selectedOrder || newStatus === selectedOrder.status) return;

    setUpdatingStatus(true);
    try {
      const res = await fetch(`/api/admin/orders/${selectedOrder._id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, note: statusNote || undefined }),
      });
      const data = await res.json();

      if (data.success) {
        setOrders((prev) =>
          prev.map((o) => (o._id === selectedOrder._id ? data.order : o))
        );
        setSelectedOrder(data.order);
        setStatusNote('');
        fetchOrders(); // refresh counts
      } else {
        alert(data.message || 'Failed to update status');
      }
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Something went wrong while updating status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Orders</h2>
        <span className="text-sm text-gray-600">{totalCount} total orders</span>
      </div>

      {/* Status summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {STATUS_OPTIONS.map((s) => (
          <button
            key={s}
            onClick={() => {
              setStatusFilter(s);
              setPage(1);
            }}
            className={`p-3 rounded-xl text-left transition-all border-2 ${
              statusFilter === s
                ? 'border-green-500 bg-green-50'
                : 'border-transparent bg-white hover:border-gray-200'
            }`}
          >
            <p className="text-xs text-gray-500 capitalize">{s}</p>
            <p className="text-xl font-bold text-gray-800">{statusCounts[s] ?? 0}</p>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 shadow-sm flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearchSubmit} className="flex-1 relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by order ID, customer name, or phone..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </form>

        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value="all">All Statuses</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s} className="capitalize">{s}</option>
          ))}
        </select>

        <select
          value={paymentFilter}
          onChange={(e) => {
            setPaymentFilter(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value="all">All Payments</option>
          <option value="pending">Payment Pending</option>
          <option value="paid">Paid</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      {/* Orders table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500">Loading orders...</div>
        ) : error ? (
          <div className="p-12 text-center text-red-500">{error}</div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <Package className="w-10 h-10 mx-auto mb-2 text-gray-300" />
            No orders found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600 text-left">
                <tr>
                  <th className="px-4 py-3 font-medium">Order ID</th>
                  <th className="px-4 py-3 font-medium">Customer</th>
                  <th className="px-4 py-3 font-medium">Items</th>
                  <th className="px-4 py-3 font-medium">Total</th>
                  <th className="px-4 py-3 font-medium">Payment</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.map((order) => {
                  const style = STATUS_STYLES[order.status] || STATUS_STYLES.pending;
                  return (
                    <tr key={order._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-800">{order.orderId}</td>
                      <td className="px-4 py-3 text-gray-700">
                        {order.address?.fullName || order.userId?.name || '—'}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{order.items.length} item(s)</td>
                      <td className="px-4 py-3 font-medium text-gray-800">
                        {formatCurrency(order.orderSummary.total)}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          order.paymentStatus === 'paid'
                            ? 'bg-green-100 text-green-700'
                            : order.paymentStatus === 'failed'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {order.paymentStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${style.bg} ${style.text}`}>
                          {style.icon}
                          <span className="capitalize">{order.status}</span>
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => openOrderDetail(order)}
                          className="text-green-700 font-medium hover:underline"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && orders.length > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <span className="text-xs text-gray-500">
              Page {page} of {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 sticky top-0 bg-white">
              <h3 className="font-semibold text-gray-800">Order {selectedOrder.orderId}</h3>
              <button onClick={closeOrderDetail} className="p-1 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-5">
              {/* Customer / Address */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Delivery Address</h4>
                <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-600 space-y-0.5">
                  <p className="font-medium text-gray-800">{selectedOrder.address.fullName}</p>
                  <p>{selectedOrder.address.phoneNumber}</p>
                  <p>
                    {selectedOrder.address.addressLine1}
                    {selectedOrder.address.addressLine2 ? `, ${selectedOrder.address.addressLine2}` : ''}
                  </p>
                  <p>
                    {selectedOrder.address.city}, {selectedOrder.address.state} {selectedOrder.address.postalCode}
                  </p>
                  <p>{selectedOrder.address.country}</p>
                </div>
              </div>

              {/* Items */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Items</h4>
                <div className="space-y-2">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 bg-gray-50 rounded-lg p-2">
                      {item.image && (
                        <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover" />
                      )}
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800">{item.name}</p>
                        {item.variantDisplayValue && (
                          <p className="text-xs text-gray-500">{item.variantDisplayValue}</p>
                        )}
                        <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                      </div>
                      <p className="text-sm font-medium text-gray-800">
                        {formatCurrency(item.offerPrice * item.quantity)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Summary */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Order Summary</h4>
                <div className="bg-gray-50 rounded-lg p-3 text-sm space-y-1">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span><span>{formatCurrency(selectedOrder.orderSummary.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Delivery Fee</span><span>{formatCurrency(selectedOrder.orderSummary.deliveryFee)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Tax</span><span>{formatCurrency(selectedOrder.orderSummary.tax)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Discount</span><span>-{formatCurrency(selectedOrder.orderSummary.discount)}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-gray-800 pt-1 border-t border-gray-200">
                    <span>Total</span><span>{formatCurrency(selectedOrder.orderSummary.total)}</span>
                  </div>
                </div>
              </div>

              {/* Status update */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Update Status</h4>
                <div className="flex flex-col sm:flex-row gap-2">
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s} className="capitalize">{s}</option>
                    ))}
                  </select>
                  <button
                    onClick={handleStatusUpdate}
                    disabled={updatingStatus || newStatus === selectedOrder.status}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium disabled:opacity-50 hover:bg-green-700 transition-colors"
                  >
                    {updatingStatus ? 'Updating...' : 'Update'}
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="Optional note..."
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  className="w-full mt-2 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              {/* Status history */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Status History</h4>
                <div className="space-y-2">
                  {[...selectedOrder.statusLogs].reverse().map((log, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-sm">
                      <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5"></div>
                      <div>
                        <p className="font-medium text-gray-800 capitalize">{log.status}</p>
                        <p className="text-xs text-gray-500">{formatDate(log.timestamp)} · by {log.updatedBy}</p>
                        {log.note && <p className="text-xs text-gray-500">{log.note}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderSection;