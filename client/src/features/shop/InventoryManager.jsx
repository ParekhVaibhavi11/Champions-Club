import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { shopService } from '../../services/shopService';

const PAGE_SIZE = 10;

export const InventoryManager = () => {
  const [rows, setRows] = useState([]);
  const [changes, setChanges] = useState({});
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const load = async () => {
    const response = await shopService.getInventory();
    setRows(response.data || []);
  };

  useEffect(() => { load().catch((err) => setError(err.message)); }, []);

  const filteredRows = rows.filter((row) => row.name?.toLowerCase().includes(search.trim().toLowerCase()));
  const pageCount = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const visibleRows = filteredRows.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const adjust = async (product) => {
    const amount = Number(changes[product.product_id]);
    if (!Number.isInteger(amount) || amount === 0) { setError('Enter a positive or negative whole number adjustment.'); return; }
    try {
      await shopService.adjustInventory(product.product_id, amount, amount > 0 ? 'Restock' : 'Stock correction');
      setMessage(`${product.name}: stock updated.`);
      setError('');
      setChanges({ ...changes, [product.product_id]: '' });
      await load();
    } catch (err) { setError(err.message); }
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-black uppercase text-champion-dark">Inventory Ledger</h1>
        <p className="mt-1 text-sm text-gray-500">Track stock levels and record restocks or corrections.</p>
      </header>
      {message && <div className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">{message}</div>}
      {error && <div className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      <section className="overflow-hidden rounded-2xl border bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b p-4">
          <label className="relative block w-full max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              value={search}
              onChange={(event) => { setSearch(event.target.value); setPage(1); }}
              placeholder="Search products by name..."
              aria-label="Search inventory products by name"
              className="w-full rounded-lg border py-2.5 pl-9 pr-3 text-sm outline-none focus:border-champion-red"
            />
          </label>
          <span className="text-xs text-gray-500">{filteredRows.length} {filteredRows.length === 1 ? 'product' : 'products'}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr><th className="p-4">Product</th><th className="p-4">SKU</th><th className="p-4">On hand</th><th className="p-4">Threshold</th><th className="p-4">Status</th><th className="p-4">Adjustment</th><th className="p-4"></th></tr>
            </thead>
            <tbody className="divide-y">
              {visibleRows.map((row) => (
                <tr key={row.product_id}>
                  <td className="p-4 font-bold">{row.name}</td>
                  <td className="p-4 font-mono text-xs">{row.sku}</td>
                  <td className="p-4">{row.quantity}</td>
                  <td className="p-4">{row.low_stock_threshold}</td>
                  <td className={`p-4 text-xs font-bold ${row.stock_status === 'IN_STOCK' ? 'text-emerald-700' : 'text-amber-700'}`}>{row.stock_status.replaceAll('_', ' ')}</td>
                  <td className="p-4"><input type="number" step="1" value={changes[row.product_id] ?? ''} onChange={(event) => setChanges({ ...changes, [row.product_id]: event.target.value })} className="w-24 rounded-lg border p-2" placeholder="± qty" /></td>
                  <td className="p-4"><button onClick={() => adjust(row)} className="rounded-lg bg-champion-dark px-3 py-2 text-xs font-bold text-white">Apply</button></td>
                </tr>
              ))}
              {!visibleRows.length && <tr><td colSpan={7} className="p-8 text-center text-sm text-gray-500">{search ? 'No products match that name.' : 'No inventory products found.'}</td></tr>}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t p-4">
          <p className="text-xs text-gray-500">Showing {filteredRows.length ? (currentPage - 1) * PAGE_SIZE + 1 : 0}–{Math.min(currentPage * PAGE_SIZE, filteredRows.length)} of {filteredRows.length}</p>
          <div className="flex items-center gap-2">
            <button type="button" disabled={currentPage <= 1} onClick={() => setPage(currentPage - 1)} className="inline-flex items-center gap-1 rounded-lg border px-3 py-2 text-xs font-bold disabled:cursor-not-allowed disabled:opacity-40"><ChevronLeft className="h-4 w-4" />Previous</button>
            <span className="px-2 text-xs font-semibold text-gray-600">Page {currentPage} of {pageCount}</span>
            <button type="button" disabled={currentPage >= pageCount} onClick={() => setPage(currentPage + 1)} className="inline-flex items-center gap-1 rounded-lg border px-3 py-2 text-xs font-bold disabled:cursor-not-allowed disabled:opacity-40">Next<ChevronRight className="h-4 w-4" /></button>
          </div>
        </div>
      </section>

    </div>
  );
};

export const InventoryMovements = () => {
  const [movements, setMovements] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    shopService.getMovements()
      .then((response) => setMovements(response.data || []))
      .catch((err) => setError(err.message || 'Could not load stock movements.'));
  }, []);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-black uppercase text-champion-dark">Recent Stock Movements</h1>
        <p className="mt-1 text-sm text-gray-500">Review restocks and inventory corrections recorded for Gear Shop products.</p>
      </header>
      {error && <div className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</div>}
      <section className="overflow-x-auto rounded-2xl border bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-xs uppercase text-gray-500"><tr><th className="p-3">When</th><th className="p-3">Product</th><th className="p-3">Change</th><th className="p-3">Balance</th><th className="p-3">Type</th><th className="p-3">Recorded by</th></tr></thead>
          <tbody className="divide-y">
            {movements.map((move) => <tr key={move.id}><td className="p-3 text-xs">{new Date(move.created_at).toLocaleString()}</td><td className="p-3">{move.product_name}<div className="text-xs text-gray-400">{move.sku}</div></td><td className={`p-3 font-bold ${move.change_qty > 0 ? 'text-emerald-700' : 'text-red-700'}`}>{move.change_qty > 0 ? '+' : ''}{move.change_qty}</td><td className="p-3">{move.balance_qty}</td><td className="p-3 text-xs">{move.movement_type}</td><td className="p-3">{move.recorded_by || 'System'}</td></tr>)}
            {!movements.length && !error && <tr><td colSpan={6} className="p-8 text-center text-sm text-gray-500">No stock movements recorded yet.</td></tr>}
          </tbody>
        </table>
      </section>
    </div>
  );
};
