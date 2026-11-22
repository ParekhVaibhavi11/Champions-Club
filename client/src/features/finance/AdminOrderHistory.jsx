import React, { useEffect, useState } from 'react';
import { cafeService } from '../../services/cafeService';
import { shopService } from '../../services/shopService';
import {
  ShoppingBag,
  Coffee,
  Search,
  Filter,
  CheckCircle,
  Clock,
  Calendar,
  User,
  FileText,
  UtensilsCrossed,
  Receipt,
  Download,
} from 'lucide-react';
import { Badge } from '../../components/Badge';

export const AdminOrderHistory = () => {
  const [activeTab, setActiveTab] = useState('CAFE'); // 'CAFE' | 'SHOP'
  const [cafeOrders, setCafeOrders] = useState([]);
  const [shopOrders, setShopOrders] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      if (activeTab === 'CAFE') {
        const res = await cafeService.getOrderHistory({
          search: searchQuery,
          status: statusFilter === 'ALL' ? '' : statusFilter,
        });
        setCafeOrders(res.data || []);
      } else {
        const res = await shopService.getOrders({
          search: searchQuery,
        });
        setShopOrders(res.data || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to retrieve order history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeTab, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadData();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 animate-fade-in">
      {/* Header Banner */}
      <header className="rounded-3xl border bg-white p-6 md:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black uppercase text-champion-dark tracking-tight">
            Club Orders & Transactions
          </h1>
          <p className="mt-1 text-xs text-gray-500">
            Real-time fulfillment and historical audit ledger across Café & Bar tabs and Pro Shop counter receipts.
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex bg-gray-100 p-1 rounded-2xl border">
          <button
            type="button"
            onClick={() => {
              setActiveTab('CAFE');
              setSearchQuery('');
              setStatusFilter('ALL');
            }}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'CAFE'
                ? 'bg-white text-champion-dark shadow-sm'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <Coffee className="w-4 h-4 text-amber-600" />
            <span>Café & Bar Orders</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('SHOP');
              setSearchQuery('');
              setStatusFilter('ALL');
            }}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'SHOP'
                ? 'bg-white text-champion-dark shadow-sm'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <ShoppingBag className="w-4 h-4 text-champion-red" />
            <span>Pro Shop Counter</span>
          </button>
        </div>
      </header>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={
              activeTab === 'CAFE'
                ? 'Search order #, table, customer name...'
                : 'Search receipt #, customer, cashier...'
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-24 py-2 text-xs border rounded-xl outline-none focus:ring-2 focus:ring-champion-dark bg-white"
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-champion-dark hover:bg-black text-white text-[10px] font-bold px-3 py-1 rounded-lg"
          >
            Search
          </button>
        </form>

        {activeTab === 'CAFE' && (
          <div className="flex items-center space-x-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            {[
              ['ALL', 'All Tabs'],
              ['OPEN', 'Open Tabs'],
              ['SETTLED', 'Settled'],
            ].map(([val, label]) => (
              <button
                key={val}
                type="button"
                onClick={() => setStatusFilter(val)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  statusFilter === val
                    ? 'bg-champion-dark text-white'
                    : 'bg-white border text-gray-600 hover:bg-gray-50'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        )}
      </div>

      {error && <div className="rounded-xl bg-red-50 p-4 text-xs font-semibold text-red-700 border border-red-200">{error}</div>}

      {/* Orders Table */}
      <section className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs font-semibold text-gray-400">Loading order records...</div>
        ) : activeTab === 'CAFE' ? (
          /* CAFE ORDERS TABLE */
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-[10px] uppercase text-gray-400 font-bold border-b">
                <tr>
                  <th className="p-4">Order / Tab #</th>
                  <th className="p-4">Table</th>
                  <th className="p-4">Member / Guest</th>
                  <th className="p-4">Items Ordered</th>
                  <th className="p-4">Kitchen</th>
                  <th className="p-4">Tab Status</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Date & Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {cafeOrders.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="p-8 text-center text-gray-400 font-semibold">
                      No café order records found.
                    </td>
                  </tr>
                ) : (
                  cafeOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="p-4 font-mono font-bold text-gray-900">{order.order_no}</td>
                      <td className="p-4 font-bold text-gray-800">
                        {order.table_number || `Table #${order.table_id}`}
                      </td>
                      <td className="p-4">
                        <strong className="block text-gray-900 font-bold">
                          {order.member_name || order.guest_name || 'Walk-in Guest'}
                        </strong>
                        {order.member_email && (
                          <span className="text-[10px] text-gray-400 font-mono">{order.member_email}</span>
                        )}
                      </td>
                      <td className="p-4 max-w-xs">
                        <div className="space-y-1">
                          {(order.items || []).map((it, idx) => (
                            <div key={idx} className="text-[11px] text-gray-600 flex justify-between gap-2">
                              <span>{it.quantity}× {it.name}</span>
                              <span className="font-mono text-gray-400">₹{Number(it.subtotal || 0).toFixed(0)}</span>
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                            order.kitchen_status === 'SERVED'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : order.kitchen_status === 'READY'
                              ? 'bg-blue-50 text-blue-800 border border-blue-200'
                              : 'bg-amber-50 text-amber-800 border border-amber-200'
                          }`}
                        >
                          {order.kitchen_status}
                        </span>
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                            order.status === 'SETTLED'
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-amber-50 text-amber-700'
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="p-4 font-mono font-black text-gray-900 text-sm">
                        ₹{Number(order.total_amount).toFixed(2)}
                      </td>
                      <td className="p-4 text-gray-500 font-mono text-[11px]">
                        {new Date(order.created_at).toLocaleString([], {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
          /* SHOP ORDERS TABLE */
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-[10px] uppercase text-gray-400 font-bold border-b">
                <tr>
                  <th className="p-4">Receipt #</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Cashier</th>
                  <th className="p-4">Items</th>
                  <th className="p-4">Payment</th>
                  <th className="p-4">Total Amount</th>
                  <th className="p-4">Date & Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {shopOrders.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="p-8 text-center text-gray-400 font-semibold">
                      No shop sales recorded yet.
                    </td>
                  </tr>
                ) : (
                  shopOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="p-4 font-mono font-bold text-gray-900">{order.receipt_no}</td>
                      <td className="p-4 font-semibold text-gray-800">
                        {order.customer_name || 'Walk-in Customer'}
                      </td>
                      <td className="p-4 text-gray-600">{order.cashier_name}</td>
                      <td className="p-4 max-w-xs">
                        <div className="space-y-1">
                          {(order.items || []).map((it, idx) => (
                            <div key={idx} className="text-[11px] text-gray-600 flex justify-between gap-2">
                              <span>{it.quantity}× {it.name}</span>
                              <span className="font-mono text-gray-400">₹{Number(it.line_total || 0).toFixed(0)}</span>
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="inline-block bg-gray-100 text-gray-800 uppercase text-[10px] font-black px-2.5 py-1 rounded-full border">
                          {order.payment_method}
                        </span>
                      </td>
                      <td className="p-4 font-mono font-black text-gray-900 text-sm">
                        ₹{Number(order.total_amount).toFixed(2)}
                      </td>
                      <td className="p-4 text-gray-500 font-mono text-[11px]">
                        {new Date(order.created_at).toLocaleString([], {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};
