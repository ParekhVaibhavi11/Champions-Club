import React, { useEffect, useMemo, useState } from 'react';
import { cafeService } from '../../services/cafeService';
import { useAuth } from '../../hooks/useAuth';

export const CafePOS = () => {
  const { user } = useAuth();
  const [tables, setTables] = useState([]);
  const [menu, setMenu] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [cart, setCart] = useState({});
  const [memberId, setMemberId] = useState('');
  const [guestName, setGuestName] = useState('');
  const [payment, setPayment] = useState('CASH');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const load = async () => {
    const [tableResponse, menuResponse] = await Promise.all([cafeService.getTables(), cafeService.getMenu()]);
    setTables(tableResponse.data || []); setMenu(menuResponse.data || []);
  };
  useEffect(() => { load().catch((err) => setError(err.message)); }, []);
  const selected = tables.find((table) => table.id === Number(selectedId));
  const items = Object.entries(cart).filter(([, quantity]) => quantity > 0).map(([menu_item_id, quantity]) => ({ menu_item_id: Number(menu_item_id), quantity }));
  const total = items.reduce((sum, item) => sum + Number(menu.find((m) => m.id === item.menu_item_id)?.price || 0) * item.quantity, 0);
  const inc = (id) => setCart((old) => ({ ...old, [id]: Number(old[id] || 0) + 1 }));
  const dec = (id) => setCart((old) => ({ ...old, [id]: Math.max(0, Number(old[id] || 0) - 1) }));

  const saveItems = async () => {
    if (!selected || !items.length) return;
    setLoading(true); setError(''); setMessage('');
    try {
      if (selected.order_id) await cafeService.addItems(selected.order_id, items);
      else await cafeService.createOrder({ table_id: selected.id, member_id: memberId ? Number(memberId) : null, guest_name: guestName || null, items });
      setMessage(selected.order_id ? 'Items added to the open tab and sent to the kitchen.' : 'Tab opened and sent to the kitchen.');
      setCart({}); await load();
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const settle = async () => {
    if (!selected?.order_id) return;
    setLoading(true); setError('');
    try { await cafeService.settle(selected.order_id, payment); setMessage(`Tab ${selected.order_no} settled.`); setSelectedId(null); await load(); }
    catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  return <div className="space-y-6"><header className="rounded-2xl border bg-white p-6 shadow-sm"><h1 className="text-2xl font-black uppercase text-champion-dark">Café & Bar POS</h1><p className="mt-1 text-sm text-gray-500">Staff: {user?.full_name} · Open tabs, add items, and settle bills.</p></header>
    {message && <div className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">{message}</div>}{error && <div className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</div>}
    <section><h2 className="mb-3 font-black uppercase">Tables</h2><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{tables.map((table) => <button key={table.id} onClick={() => { setSelectedId(table.id); setCart({}); }} className={`rounded-2xl border p-4 text-left ${selectedId === table.id ? 'border-champion-red ring-2 ring-red-100' : 'bg-white'}`}><div className="flex justify-between"><strong>{table.table_number}</strong><span className={`text-xs font-bold ${table.order_id ? 'text-amber-700' : 'text-emerald-700'}`}>{table.order_id ? 'OPEN TAB' : 'AVAILABLE'}</span></div><p className="mt-2 text-xs text-gray-500">{table.order_id ? `${table.order_no} · ₹${Number(table.total_amount).toFixed(2)}` : `${table.capacity} seats`}</p></button>)}</div></section>
    {selected && <div className="grid gap-6 xl:grid-cols-[1fr_340px]"><section className="rounded-2xl border bg-white p-5"><div className="mb-4 flex items-center justify-between"><h2 className="font-black uppercase">Menu · {selected.table_number}</h2>{selected.order_id && <span className="text-xs text-gray-500">Tab {selected.order_no}</span>}</div><div className="grid gap-3 sm:grid-cols-2">{menu.map((item) => <article key={item.id} className="flex items-center justify-between gap-3 rounded-xl border p-3"><div><p className="text-sm font-bold">{item.name}</p><p className="text-xs text-gray-500">{item.category_name} · ₹{Number(item.price).toFixed(2)}</p></div><button onClick={() => inc(item.id)} className="rounded-lg bg-champion-dark px-3 py-2 text-sm font-bold text-white">Add</button></article>)}</div></section>
      <aside className="h-fit space-y-4 rounded-2xl border bg-white p-5"><h2 className="font-black uppercase">Tab items</h2>{!selected.order_id && <><input value={memberId} onChange={(e) => setMemberId(e.target.value)} type="number" min="1" placeholder="Member ID (optional)" className="w-full rounded-lg border p-2.5 text-sm" /><input value={guestName} onChange={(e) => setGuestName(e.target.value)} placeholder="Guest name (optional)" className="w-full rounded-lg border p-2.5 text-sm" /></>}
        <div className="space-y-2">{items.map((item) => <div key={item.menu_item_id} className="flex items-center justify-between text-sm"><span>{menu.find((m) => m.id === item.menu_item_id)?.name}</span><span className="flex items-center gap-2"><button onClick={() => dec(item.menu_item_id)} className="rounded border px-2">−</button>{item.quantity}<button onClick={() => inc(item.menu_item_id)} className="rounded border px-2">+</button></span></div>)}{!items.length && <p className="text-xs text-gray-400">Select menu items to add.</p>}</div>
        <div className="flex justify-between border-t pt-3 text-sm font-black"><span>Items subtotal</span><span>₹{total.toFixed(2)}</span></div>
        <button onClick={saveItems} disabled={loading || !items.length} className="w-full rounded-xl bg-champion-dark py-3 text-xs font-black uppercase text-white disabled:opacity-50">{selected.order_id ? 'Add Items to Tab' : 'Open Tab & Send to Kitchen'}</button>
        {selected.order_id && <><label className="block text-xs font-bold text-gray-600">Payment<select value={payment} onChange={(e) => setPayment(e.target.value)} className="mt-1 w-full rounded-lg border p-2.5 text-sm"><option>CASH</option><option>CARD</option><option>UPI</option></select></label><button onClick={settle} disabled={loading} className="w-full rounded-xl bg-champion-red py-3 text-xs font-black uppercase text-white disabled:opacity-50">Settle ₹{Number(selected.total_amount).toFixed(2)}</button></>}
      </aside></div>}
  </div>;
};
