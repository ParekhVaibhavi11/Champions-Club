import React, { useEffect, useState } from 'react';
import { cafeService } from '../../services/cafeService';
import { UtensilsCrossed, CheckCircle, Clock, RefreshCw, ChefHat, AlertCircle, History } from 'lucide-react';

const nextState = { PENDING: 'PREPARING', PREPARING: 'READY', READY: 'SERVED' };

export const KitchenQueue = () => {
  const [orders, setOrders] = useState([]);
  const [recentCompleted, setRecentCompleted] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(null);

  const load = async () => {
    try {
      const [queueRes, historyRes] = await Promise.all([
        cafeService.getKitchenQueue(),
        cafeService.getOrderHistory({ status: 'OPEN', kitchen_status: 'SERVED' }).catch(() => ({ data: [] })),
      ]);
      setOrders(queueRes.data || []);
      setRecentCompleted(historyRes.data || []);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 15000); // Polling every 15s for live tickets
    return () => clearInterval(interval);
  }, []);

  const advance = async (order) => {
    setUpdating(order.id);
    setError('');
    try {
      await cafeService.setKitchenStatus(order.id, nextState[order.kitchen_status]);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 animate-fade-in">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl border bg-white p-6 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-amber-500/10 text-amber-600 rounded-2xl flex items-center justify-center">
            <ChefHat className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black uppercase text-champion-dark tracking-tight">
              Kitchen Display Queue (KDS)
            </h1>
            <p className="mt-0.5 text-xs text-gray-500">
              Live orders from members seated at dining tables. Advance through preparation to table delivery.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => setShowHistory(!showHistory)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border flex items-center space-x-1.5 ${
              showHistory ? 'bg-champion-dark text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>{showHistory ? 'Hide Fulfilled' : 'View Fulfilled (Today)'}</span>
          </button>
          <button
            type="button"
            onClick={load}
            className="rounded-xl border bg-white hover:bg-gray-50 px-4 py-2 text-xs font-bold flex items-center space-x-1.5 text-gray-700 shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
        </div>
      </header>

      {error && (
        <div className="rounded-2xl bg-red-50 p-4 text-xs font-semibold text-red-700 border border-red-200 flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Queue */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-black uppercase tracking-wider text-gray-400">
            Active Cooking Tickets ({orders.length})
          </span>
          <span className="text-[10px] font-bold text-gray-400">Auto-refresh every 15s</span>
        </div>

        {!orders.length ? (
          <div className="rounded-3xl border bg-white p-12 text-center text-gray-400 font-semibold space-y-2">
            <UtensilsCrossed className="w-10 h-10 text-gray-300 mx-auto" />
            <p className="text-sm">No pending food or drink orders.</p>
            <p className="text-xs text-gray-400">New table orders from members will pop up here instantly.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {orders.map((order) => {
              const isReady = order.kitchen_status === 'READY';
              const isPreparing = order.kitchen_status === 'PREPARING';

              return (
                <article
                  key={order.id}
                  className={`rounded-3xl border p-6 shadow-sm flex flex-col justify-between transition-all ${
                    isReady
                      ? 'bg-blue-50/50 border-blue-200'
                      : isPreparing
                      ? 'bg-amber-50/30 border-amber-200'
                      : 'bg-white border-gray-200'
                  }`}
                >
                  <div>
                    {/* Ticket Header */}
                    <div className="flex items-start justify-between pb-3 border-b border-gray-100">
                      <div>
                        <span className="text-[11px] font-mono font-black text-champion-red block">
                          {order.order_no}
                        </span>
                        <h2 className="text-lg font-black text-gray-900 mt-0.5">
                          {order.table_number ? `Table ${order.table_number}` : 'Bar Counter'}
                        </h2>
                        <span className="text-xs font-semibold text-gray-500">
                          {order.member_name || order.guest_name || 'Walk-in'}
                        </span>
                      </div>
                      <span
                        className={`rounded-full px-3 py-1 text-[10px] font-black uppercase ${
                          isReady
                            ? 'bg-blue-600 text-white animate-pulse'
                            : isPreparing
                            ? 'bg-amber-500 text-white'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {order.kitchen_status}
                      </span>
                    </div>

                    {/* Ordered Items */}
                    <div className="my-4 space-y-2.5">
                      {(order.items || []).map((item, index) => (
                        <div key={index} className="flex justify-between items-start text-xs">
                          <div>
                            <span className="font-bold text-gray-900 text-sm">{item.quantity}× </span>
                            <span className="font-semibold text-gray-800 text-sm">{item.name}</span>
                            {item.instructions && (
                              <p className="text-[11px] text-amber-700 font-medium italic mt-0.5 pl-5">
                                Note: {item.instructions}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Advance Workflow Button */}
                  <div className="pt-4 border-t border-gray-100">
                    <button
                      type="button"
                      disabled={!nextState[order.kitchen_status] || updating === order.id}
                      onClick={() => advance(order)}
                      className={`w-full py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all shadow-sm flex items-center justify-center space-x-2 cursor-pointer ${
                        order.kitchen_status === 'PENDING'
                          ? 'bg-amber-600 hover:bg-amber-700 text-white'
                          : order.kitchen_status === 'PREPARING'
                          ? 'bg-blue-600 hover:bg-blue-700 text-white'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      }`}
                    >
                      {updating === order.id ? (
                        <span>Updating Status...</span>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          <span>
                            {order.kitchen_status === 'PENDING'
                              ? 'Start Preparing'
                              : order.kitchen_status === 'PREPARING'
                              ? 'Mark Ready for Table'
                              : 'Confirm Delivered to Table'}
                          </span>
                        </>
                      )}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {/* Optional: Recently Fulfilled Section */}
      {showHistory && (
        <section className="bg-white rounded-3xl border border-gray-200 p-6 space-y-4 animate-fade-in">
          <div className="flex items-center justify-between border-b pb-3">
            <h3 className="text-sm font-black uppercase text-champion-dark">
              Fulfilled & Delivered Orders (Today)
            </h3>
            <span className="text-xs text-gray-400 font-mono">{recentCompleted.length} Completed</span>
          </div>

          {recentCompleted.length === 0 ? (
            <p className="text-xs text-gray-400 py-4 text-center">No delivered orders yet today.</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {recentCompleted.slice(0, 9).map((ord) => (
                <div key={ord.id} className="p-4 rounded-2xl border bg-gray-50 space-y-2 text-xs">
                  <div className="flex justify-between items-center font-bold">
                    <span className="text-gray-900 font-mono">{ord.order_no}</span>
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded-full">
                      DELIVERED
                    </span>
                  </div>
                  <div className="text-gray-600">
                    {ord.table_number ? `Table ${ord.table_number}` : 'Counter'} · {ord.member_name || 'Guest'}
                  </div>
                  <div className="text-[11px] text-gray-500 pt-1 border-t space-y-0.5">
                    {(ord.items || []).map((it, idx) => (
                      <div key={idx}>
                        {it.quantity}× {it.name}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
};
