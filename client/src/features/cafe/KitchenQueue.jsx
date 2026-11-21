import React, { useEffect, useState } from 'react';
import { cafeService } from '../../services/cafeService';

const nextState = { PENDING: 'PREPARING', PREPARING: 'READY', READY: 'SERVED' };

export const KitchenQueue = () => {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(null);
  const load = async () => { const response = await cafeService.getKitchenQueue(); setOrders(response.data || []); };
  useEffect(() => { load().catch((err) => setError(err.message)); }, []);
  const advance = async (order) => {
    setUpdating(order.id); setError('');
    try { await cafeService.setKitchenStatus(order.id, nextState[order.kitchen_status]); await load(); }
    catch (err) { setError(err.message); }
    finally { setUpdating(null); }
  };
  return <div className="space-y-6"><header className="flex items-center justify-between rounded-2xl border bg-white p-6 shadow-sm"><div><h1 className="text-2xl font-black uppercase text-champion-dark">Kitchen Display Queue</h1><p className="mt-1 text-sm text-gray-500">Advance active tickets through preparation and service.</p></div><button onClick={() => load().catch((err) => setError(err.message))} className="rounded-lg border px-4 py-2 text-xs font-bold">Refresh</button></header>
    {error && <div className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</div>}{!orders.length ? <div className="rounded-2xl border bg-white p-10 text-center text-gray-500">No open kitchen tickets.</div> : <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{orders.map((order) => <article key={order.id} className="rounded-2xl border bg-white p-5 shadow-sm"><div className="flex items-start justify-between"><div><p className="text-xs font-bold text-champion-red">{order.order_no} · {order.table_number || 'To go'}</p><h2 className="mt-1 text-lg font-black">{order.member_name || order.guest_name || 'Walk-in guest'}</h2></div><span className="rounded-full bg-amber-50 px-3 py-1 text-[10px] font-black uppercase text-amber-800">{order.kitchen_status}</span></div><div className="my-4 space-y-2 border-y py-3">{(order.items || []).map((item, index) => <div key={index} className="flex justify-between text-sm"><span>{item.quantity} × {item.name}</span>{item.instructions && <span className="text-xs text-gray-500">{item.instructions}</span>}</div>)}</div><button disabled={!nextState[order.kitchen_status] || updating === order.id} onClick={() => advance(order)} className="w-full rounded-xl bg-champion-dark py-3 text-xs font-black uppercase text-white disabled:opacity-50">{updating === order.id ? 'Updating…' : nextState[order.kitchen_status] ? `Mark ${nextState[order.kitchen_status]}` : 'Served'}</button></article>)}</div>}
  </div>;
};
