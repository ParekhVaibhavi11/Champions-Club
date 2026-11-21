import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Badge } from '../../components/Badge';
import { shopService } from '../../services/shopService';

export const ShopPOS = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState({});
  const [customerId, setCustomerId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [receipt, setReceipt] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => { shopService.getProducts().then((res) => setProducts(res.data || [])).catch((err) => setError(err.message)); }, []);
  const filtered = useMemo(() => products.filter((p) => `${p.name} ${p.sku}`.toLowerCase().includes(search.toLowerCase())), [products, search]);
  const items = Object.entries(cart).filter(([, quantity]) => quantity > 0).map(([product_id, quantity]) => ({ product_id: Number(product_id), quantity }));
  const estimate = items.reduce((total, item) => total + Number(products.find((p) => p.id === item.product_id)?.retail_price || 0) * item.quantity, 0);

  const changeQuantity = (id, delta) => setCart((current) => ({ ...current, [id]: Math.max(0, Number(current[id] || 0) + delta) }));
  const checkout = async () => {
    setError(''); setReceipt(null); setLoading(true);
    try {
      const result = await shopService.createOrder({ customer_id: customerId ? Number(customerId) : null, payment_method: paymentMethod, items });
      setReceipt(result.data); setCart({}); await shopService.getProducts().then((res) => setProducts(res.data || []));
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  return <div className="space-y-6"><div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-white p-6 shadow-sm"><div><h1 className="text-2xl font-black uppercase text-champion-dark">Gear Shop POS</h1><p className="mt-1 text-xs text-gray-500">Cashier: {user?.full_name} · Purchases are completed at this counter.</p></div><Badge variant="staff">Staff terminal</Badge></div>
    {error && <div className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</div>}
    {receipt && <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"><strong>Sale complete · {receipt.receipt_no}</strong><span className="ml-2">Total ₹{Number(receipt.total_amount).toFixed(2)}</span></div>}
    <div className="grid gap-6 xl:grid-cols-[1fr_360px]"><section className="space-y-4"><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search product or SKU" className="w-full rounded-xl border bg-white p-3 text-sm" /><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{filtered.map((product) => <article key={product.id} className="rounded-2xl border bg-white p-4 shadow-sm"><p className="text-[10px] font-bold uppercase text-gray-400">{product.sku} · {product.category_name}</p><h2 className="mt-1 font-bold">{product.name}</h2><p className="mt-2 text-sm font-black">₹{Number(product.retail_price).toFixed(2)}</p><p className={`mt-1 text-xs ${product.stock_quantity ? 'text-emerald-700' : 'text-red-700'}`}>{product.stock_quantity} in stock</p><button disabled={!product.stock_quantity} onClick={() => changeQuantity(product.id, 1)} className="mt-3 w-full rounded-lg bg-champion-dark py-2 text-xs font-bold text-white disabled:opacity-40">Add item</button></article>)}</div></section>
      <aside className="h-fit space-y-4 rounded-2xl border bg-white p-5 shadow-sm"><h2 className="font-black uppercase">Current Sale</h2><label className="block text-xs font-bold text-gray-600">Member ID (optional)<input type="number" min="1" value={customerId} onChange={(e) => setCustomerId(e.target.value)} className="mt-1 w-full rounded-lg border p-2.5 text-sm" placeholder="Apply active plan discount" /></label><div className="max-h-72 space-y-3 overflow-y-auto">{items.map((item) => { const p = products.find((product) => product.id === item.product_id); return <div key={item.product_id} className="flex justify-between gap-2 border-b pb-2 text-sm"><div><p className="font-semibold">{p?.name}</p><p className="text-xs text-gray-500">₹{p?.retail_price} each</p></div><div className="flex items-center gap-2"><button onClick={() => changeQuantity(item.product_id, -1)} className="rounded border px-2">−</button><span>{item.quantity}</span><button onClick={() => changeQuantity(item.product_id, 1)} className="rounded border px-2">+</button></div></div>; })}{!items.length && <p className="text-sm text-gray-400">Add products to begin.</p>}</div><label className="block text-xs font-bold text-gray-600">Payment<select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className="mt-1 w-full rounded-lg border p-2.5 text-sm"><option>CASH</option><option>CARD</option><option>UPI</option></select></label><div className="flex justify-between border-t pt-3 font-black"><span>Estimate</span><span>₹{estimate.toFixed(2)}</span></div><p className="text-[11px] text-gray-500">Active membership discounts are calculated by the server at checkout.</p><button disabled={!items.length || loading} onClick={checkout} className="w-full rounded-xl bg-champion-red py-3 text-xs font-black uppercase text-white disabled:opacity-50">{loading ? 'Processing sale…' : 'Charge & Print Receipt'}</button></aside></div>
  </div>;
};
