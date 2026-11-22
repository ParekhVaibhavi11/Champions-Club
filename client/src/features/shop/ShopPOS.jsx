import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Badge } from '../../components/Badge';
import { shopService } from '../../services/shopService';

const emailStatusLabel = (status) => ({
  SENT: 'Receipt emailed',
  SIMULATED: 'Email simulated (SMTP not configured)',
  FAILED: 'Email could not be sent',
  PENDING: 'Email pending',
  LEGACY: 'Legacy order',
}[status] || status || 'Email status unavailable');

export const ShopPOS = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [cart, setCart] = useState({});
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [verifiedMembership, setVerifiedMembership] = useState(null);
  const [verifyingMembership, setVerifyingMembership] = useState(false);
  const [verificationError, setVerificationError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [receipt, setReceipt] = useState(null);
  const [error, setError] = useState('');

  const loadProducts = async () => {
    const result = await shopService.getProducts();
    setProducts(result.data || []);
  };

  const loadOrders = async () => {
    const result = await shopService.getOrders();
    setOrders(result.data || []);
  };

  useEffect(() => {
    Promise.all([loadProducts(), loadOrders()]).catch((err) => setError(err.message));
  }, []);

  const filtered = useMemo(
    () => products.filter((product) => `${product.name} ${product.sku}`.toLowerCase().includes(search.toLowerCase())),
    [products, search]
  );
  const items = Object.entries(cart)
    .filter(([, quantity]) => quantity > 0)
    .map(([product_id, quantity]) => ({ product_id: Number(product_id), quantity }));
  const subtotalEstimate = items.reduce(
    (total, item) => total + Number(products.find((product) => product.id === item.product_id)?.retail_price || 0) * item.quantity,
    0
  );
  const discountPct = verifiedMembership?.has_active_plan ? Number(verifiedMembership.discount_pct || 0) : 0;
  const discountEstimate = subtotalEstimate * discountPct / 100;
  const estimate = subtotalEstimate - discountEstimate;

  const changeQuantity = (id, delta) => {
    setCart((current) => ({ ...current, [id]: Math.max(0, Number(current[id] || 0) + delta) }));
  };

  const verifyMembership = async () => {
    setVerificationError('');
    setVerifiedMembership(null);
    setVerifyingMembership(true);
    try {
      const result = await shopService.verifyMembershipDiscount(customerEmail.trim());
      const membership = result.data;
      setVerifiedMembership(membership);
      if (membership.has_active_plan) {
        setCustomerName((current) => current.trim() || membership.full_name);
        setCustomerEmail(membership.email);
      }
    } catch (err) {
      setVerificationError(err.message || 'Could not verify membership for this email.');
    } finally {
      setVerifyingMembership(false);
    }
  };

  const checkout = async (event) => {
    event.preventDefault();
    setError('');
    setReceipt(null);
    setLoading(true);
    try {
      const result = await shopService.createOrder({
        customer_id: verifiedMembership?.has_active_plan ? verifiedMembership.user_id : null,
        customer_name: customerName.trim(),
        customer_email: customerEmail.trim(),
        payment_method: paymentMethod,
        items,
      });
      setReceipt(result.data);
      setCart({});
      await Promise.all([loadProducts(), loadOrders()]);
    } catch (err) {
      setError(err.message || 'Could not complete this sale.');
    } finally {
      setLoading(false);
    }
  };

  const printReceipt = (order) => {
    setReceipt(order);
    window.setTimeout(() => window.print(), 0);
  };

  return (
    <div className="space-y-6">
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #gear-shop-print-receipt, #gear-shop-print-receipt * { visibility: visible !important; }
          #gear-shop-print-receipt { position: absolute; left: 0; top: 0; width: 100%; padding: 24px; background: white; }
        }
      `}</style>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-white p-6 shadow-sm">
        <div>
          <h1 className="text-2xl font-black uppercase text-champion-dark">Gear Shop POS</h1>
          <p className="mt-1 text-xs text-gray-500">Cashier: {user?.full_name} · Purchases are completed at this counter.</p>
        </div>
        <Badge variant="staff">Staff terminal</Badge>
      </div>

      {error && <div className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      {receipt && (
        <section className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <div>
              <strong>Sale complete · {receipt.receipt_no}</strong>
              <p className="mt-1">Total ₹{Number(receipt.total_amount).toFixed(2)} · {emailStatusLabel(receipt.receipt_email_status)}</p>
            </div>
            <button type="button" onClick={() => window.print()} className="rounded-lg bg-champion-dark px-4 py-2 text-xs font-bold text-white">
              Print Receipt
            </button>
          </div>
          <div id="gear-shop-print-receipt" className="rounded-lg bg-white p-6 text-gray-900">
            <h2 className="text-center text-xl font-black uppercase">Champions Club · Gear Shop Receipt</h2>
            <div className="mt-5 grid gap-1 text-xs sm:grid-cols-2">
              <p><strong>Receipt:</strong> {receipt.receipt_no}</p>
              <p><strong>Date:</strong> {new Date(receipt.created_at).toLocaleString()}</p>
              <p><strong>Customer:</strong> {receipt.customer_name}</p>
              <p><strong>Email:</strong> {receipt.customer_email}</p>
              <p><strong>Payment:</strong> {receipt.payment_method}</p>
            </div>
            <table className="mt-5 w-full border-collapse text-left text-xs">
              <thead><tr className="border-b-2 border-gray-800"><th className="py-2">Item</th><th className="py-2 text-center">Qty</th><th className="py-2 text-right">Amount</th></tr></thead>
              <tbody>
                {(receipt.items || []).map((item, index) => (
                  <tr key={`${item.product_id}-${index}`} className="border-b">
                    <td className="py-2">{item.name}</td>
                    <td className="py-2 text-center">{item.quantity}</td>
                    <td className="py-2 text-right">₹{Number(item.subtotal).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="ml-auto mt-4 max-w-xs space-y-1 text-right text-xs">
              <p>Subtotal: ₹{Number(receipt.subtotal).toFixed(2)}</p>
              <p>{Number(receipt.membership_discount_pct) > 0
                ? `${receipt.membership_tier} membership discount (${Number(receipt.membership_discount_pct)}%)`
                : 'Discount'}: −₹{Number(receipt.discount_amount).toFixed(2)}</p>
              <p className="text-base font-black">Total paid: ₹{Number(receipt.total_amount).toFixed(2)}</p>
            </div>
          </div>
        </section>
      )}

      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <section className="space-y-4">
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search product or SKU" className="w-full rounded-xl border bg-white p-3 text-sm" />
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((product) => (
              <article key={product.id} className="rounded-2xl border bg-white p-4 shadow-sm">
                <p className="text-[10px] font-bold uppercase text-gray-400">{product.sku} · {product.category_name}</p>
                <h2 className="mt-1 font-bold">{product.name}</h2>
                <p className="mt-2 text-sm font-black">₹{Number(product.retail_price).toFixed(2)}</p>
                <p className={`mt-1 text-xs ${product.stock_quantity ? 'text-emerald-700' : 'text-red-700'}`}>{product.stock_quantity} in stock</p>
                <button disabled={!product.stock_quantity} onClick={() => changeQuantity(product.id, 1)} className="mt-3 w-full rounded-lg bg-champion-dark py-2 text-xs font-bold text-white disabled:opacity-40">Add item</button>
              </article>
            ))}
          </div>
        </section>

        <aside className="h-fit rounded-2xl border bg-white p-5 shadow-sm">
          <form onSubmit={checkout} className="space-y-4">
            <h2 className="font-black uppercase">Current Sale</h2>
            <label className="block text-xs font-bold text-gray-600">
              Customer Name *
              <input required maxLength={150} value={customerName} onChange={(event) => setCustomerName(event.target.value)} className="mt-1 w-full rounded-lg border p-2.5 text-sm" placeholder="Enter customer name" />
            </label>
            <label className="block text-xs font-bold text-gray-600">
              Customer Email *
              <input required type="email" maxLength={254} value={customerEmail} onChange={(event) => { setCustomerEmail(event.target.value); setVerifiedMembership(null); setVerificationError(''); }} className="mt-1 w-full rounded-lg border p-2.5 text-sm" placeholder="name@example.com" />
            </label>
            <div className="space-y-2">
              <button
                type="button"
                disabled={!customerEmail.trim() || verifyingMembership}
                onClick={verifyMembership}
                className="w-full rounded-lg border border-champion-red px-3 py-2.5 text-xs font-black uppercase text-champion-red hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {verifyingMembership ? 'Verifying Plan…' : 'Verify Plan & Apply Discount'}
              </button>
              {verificationError && <p className="text-xs font-semibold text-red-700">{verificationError}</p>}
              {verifiedMembership?.has_active_plan ? (
                <p className="rounded-lg bg-emerald-50 p-2.5 text-xs font-semibold text-emerald-800">
                  {verifiedMembership.plan_tier} plan verified · {discountPct}% Gear Shop discount applied.
                </p>
              ) : verifiedMembership ? (
                <p className="rounded-lg bg-gray-50 p-2.5 text-xs text-gray-600">No active membership found for this email. Standard pricing applies.</p>
              ) : null}
            </div>

            <div className="max-h-72 space-y-3 overflow-y-auto">
              {items.map((item) => {
                const product = products.find((entry) => entry.id === item.product_id);
                return (
                  <div key={item.product_id} className="flex justify-between gap-2 border-b pb-2 text-sm">
                    <div><p className="font-semibold">{product?.name}</p><p className="text-xs text-gray-500">₹{product?.retail_price} each</p></div>
                    <div className="flex items-center gap-2">
                      <button type="button" onClick={() => changeQuantity(item.product_id, -1)} className="rounded border px-2">−</button>
                      <span>{item.quantity}</span>
                      <button type="button" onClick={() => changeQuantity(item.product_id, 1)} className="rounded border px-2">+</button>
                    </div>
                  </div>
                );
              })}
              {!items.length && <p className="text-sm text-gray-400">Add products to begin.</p>}
            </div>

            <label className="block text-xs font-bold text-gray-600">
              Payment Method *
              <select required value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value)} className="mt-1 w-full rounded-lg border p-2.5 text-sm">
                <option value="CASH">Cash</option><option value="CARD">Card</option><option value="UPI">UPI</option>
              </select>
            </label>
            <div className="space-y-1 border-t pt-3 text-sm">
              <div className="flex justify-between"><span>Subtotal</span><span>₹{subtotalEstimate.toFixed(2)}</span></div>
              {discountPct > 0 && (
                <div className="flex justify-between font-semibold text-emerald-700">
                  <span>{verifiedMembership.plan_tier} plan discount ({discountPct}%)</span>
                  <span>−₹{discountEstimate.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between pt-1 font-black"><span>Estimated Total</span><span>₹{estimate.toFixed(2)}</span></div>
            </div>
            <p className="text-[11px] text-gray-500">Active membership discounts are calculated by the server at checkout. The receipt will be emailed to the customer.</p>
            <button type="submit" disabled={!items.length || loading} className="w-full rounded-xl bg-champion-red py-3 text-xs font-black uppercase text-white disabled:opacity-50">
              {loading ? 'Processing sale…' : 'Complete Sale & Email Receipt'}
            </button>
          </form>
        </aside>
      </div>

      <section className="overflow-hidden rounded-2xl border bg-white shadow-sm">
        <div className="border-b p-5"><h2 className="font-black uppercase">Order Confirmations</h2><p className="mt-1 text-xs text-gray-500">Recent completed sales, receipt email status, and printable receipts.</p></div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-gray-50 text-[10px] uppercase tracking-wide text-gray-500">
              <tr><th className="p-3">Receipt</th><th className="p-3">Customer</th><th className="p-3">Items</th><th className="p-3">Discount</th><th className="p-3">Total</th><th className="p-3">Payment</th><th className="p-3">Email</th><th className="p-3">Date</th><th className="p-3">Receipt</th></tr>
            </thead>
            <tbody className="divide-y">
              {orders.map((order) => (
                <tr key={order.id}>
                  <td className="p-3 font-mono text-xs">{order.receipt_no}</td>
                  <td className="p-3"><div className="font-semibold">{order.customer_name}</div><div className="text-xs text-gray-500">{order.customer_email}</div></td>
                  <td className="max-w-xs p-3 text-xs">{(order.items || []).map((item) => `${item.name} × ${item.quantity}`).join(', ')}</td>
                  <td className="p-3 text-xs">{Number(order.membership_discount_pct) > 0 ? `${order.membership_tier} ${Number(order.membership_discount_pct)}% · −₹${Number(order.discount_amount).toFixed(2)}` : '—'}</td>
                  <td className="p-3 font-bold">₹{Number(order.total_amount).toFixed(2)}</td>
                  <td className="p-3">{order.payment_method}</td>
                  <td className="p-3 text-xs">{emailStatusLabel(order.receipt_email_status)}</td>
                  <td className="p-3 text-xs">{new Date(order.created_at).toLocaleString()}</td>
                  <td className="p-3"><button type="button" onClick={() => printReceipt(order)} className="rounded border px-3 py-1.5 text-xs font-bold hover:bg-gray-50">Print</button></td>
                </tr>
              ))}
              {!orders.length && <tr><td colSpan="9" className="p-8 text-center text-sm text-gray-400">No completed orders yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
