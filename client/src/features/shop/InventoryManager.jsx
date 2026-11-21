import React, { useEffect, useState } from 'react';
import { shopService } from '../../services/shopService';

export const InventoryManager = () => {
  const [rows, setRows] = useState([]);
  const [movements, setMovements] = useState([]);
  const [changes, setChanges] = useState({});
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const load = async () => { const [response, movementResponse] = await Promise.all([shopService.getInventory(), shopService.getMovements()]); setRows(response.data || []); setMovements(movementResponse.data || []); };
  useEffect(() => { load().catch((err) => setError(err.message)); }, []);

  const adjust = async (product) => {
    const amount = Number(changes[product.product_id]);
    if (!Number.isInteger(amount) || amount === 0) { setError('Enter a positive or negative whole number adjustment.'); return; }
    try {
      await shopService.adjustInventory(product.product_id, amount, amount > 0 ? 'Restock' : 'Stock correction');
      setMessage(`${product.name}: stock updated.`); setError('');
      setChanges({ ...changes, [product.product_id]: '' }); await load();
    } catch (err) { setError(err.message); }
  };

  return <div className="space-y-6"><header><h1 className="text-2xl font-black uppercase text-champion-dark">Inventory Ledger</h1><p className="mt-1 text-sm text-gray-500">Track stock levels and record restocks or corrections.</p></header>
    {message && <div className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">{message}</div>}{error && <div className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</div>}
    <div className="overflow-x-auto rounded-2xl border bg-white shadow-sm"><table className="w-full text-left text-sm"><thead className="bg-gray-50 text-xs uppercase text-gray-500"><tr><th className="p-4">Product</th><th className="p-4">SKU</th><th className="p-4">On hand</th><th className="p-4">Threshold</th><th className="p-4">Status</th><th className="p-4">Adjustment</th><th className="p-4"></th></tr></thead><tbody className="divide-y">{rows.map((row) => <tr key={row.product_id}><td className="p-4 font-bold">{row.name}</td><td className="p-4 font-mono text-xs">{row.sku}</td><td className="p-4">{row.quantity}</td><td className="p-4">{row.low_stock_threshold}</td><td className={`p-4 text-xs font-bold ${row.stock_status === 'IN_STOCK' ? 'text-emerald-700' : 'text-amber-700'}`}>{row.stock_status.replaceAll('_', ' ')}</td><td className="p-4"><input type="number" step="1" value={changes[row.product_id] ?? ''} onChange={(e) => setChanges({ ...changes, [row.product_id]: e.target.value })} className="w-24 rounded-lg border p-2" placeholder="± qty" /></td><td className="p-4"><button onClick={() => adjust(row)} className="rounded-lg bg-champion-dark px-3 py-2 text-xs font-bold text-white">Apply</button></td></tr>)}</tbody></table></div>
    <section className="overflow-x-auto rounded-2xl border bg-white shadow-sm"><h2 className="p-5 font-black uppercase">Recent Stock Movements</h2><table className="w-full text-left text-sm"><thead className="bg-gray-50 text-xs uppercase text-gray-500"><tr><th className="p-3">When</th><th className="p-3">Product</th><th className="p-3">Change</th><th className="p-3">Balance</th><th className="p-3">Type</th><th className="p-3">Recorded by</th></tr></thead><tbody className="divide-y">{movements.map((move) => <tr key={move.id}><td className="p-3 text-xs">{new Date(move.created_at).toLocaleString()}</td><td className="p-3">{move.product_name}<div className="text-xs text-gray-400">{move.sku}</div></td><td className={`p-3 font-bold ${move.change_qty > 0 ? 'text-emerald-700' : 'text-red-700'}`}>{move.change_qty > 0 ? '+' : ''}{move.change_qty}</td><td className="p-3">{move.balance_qty}</td><td className="p-3 text-xs">{move.movement_type}</td><td className="p-3">{move.recorded_by || 'System'}</td></tr>)}</tbody></table></section>
  </div>;
};
