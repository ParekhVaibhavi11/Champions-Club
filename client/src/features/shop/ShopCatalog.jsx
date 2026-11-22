import React, { useEffect, useState } from 'react';
import { shopService } from '../../services/shopService';
import { useAuth } from '../../hooks/useAuth';
import { ShoppingBag, ShieldCheck, Tag, Info, CheckCircle, AlertTriangle, XCircle, Search } from 'lucide-react';

export const ShopCatalog = () => {
  const { user, isAuthenticated } = useAuth();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const isMember = isAuthenticated && (user?.role === 'member' || Boolean(user?.membership_tier) || Boolean(user?.membership_id));
  const memberDiscountPct = user?.shop_discount_pct
    ? Number(user.shop_discount_pct)
    : user?.membership_tier === 'GOLD'
    ? 15
    : user?.membership_tier === 'SILVER'
    ? 10
    : user?.membership_tier === 'JUNIOR'
    ? 10
    : 0;

  useEffect(() => {
    shopService
      .getProducts()
      .then((res) => {
        const items = res.data || [];
        setProducts(items);
        const uniqueCats = Array.from(new Set(items.map((p) => p.category_name).filter(Boolean)));
        setCategories(uniqueCats);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const filteredProducts = products.filter((product) => {
    const matchesCategory = selectedCategory === 'ALL' || product.category_name === selectedCategory;
    const matchesSearch =
      !searchQuery ||
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16 animate-fade-in">
      {/* Header Banner */}
      <div className="relative rounded-3xl bg-neutral-950 text-white p-6 sm:p-10 border border-neutral-800 shadow-xl overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-96 h-96 bg-champion-red/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center space-x-2 bg-white/10 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-rose-300">
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Official Pro Gear Showcase</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight">
            Club Gear Shop & Catalog
          </h1>
          <p className="text-gray-300 text-sm md:text-base leading-relaxed">
            Browse our tournament-grade rackets, cricket kits, protective gear, and apparel with live real-time inventory balances.
          </p>
          <div className="inline-flex items-center space-x-2 bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold px-3 py-1.5 rounded-xl">
            <Info className="w-4 h-4 text-amber-400 shrink-0" />
            <span>In-Club View Only: All purchases are fulfilled and settled directly at the Pro Shop Counter.</span>
          </div>
        </div>
      </div>

      {/* Member Benefit Banner */}
      {isMember && memberDiscountPct > 0 && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0" />
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 block">
                {user.membership_tier || 'Member'} VIP Privilege Active
              </span>
              <p className="text-xs text-emerald-700">
                You receive an automatic <strong>{memberDiscountPct}% discount</strong> applied at checkout on all equipment purchases at the counter.
              </p>
            </div>
          </div>
          <span className="hidden sm:inline-block bg-emerald-600 text-white text-xs font-black px-3 py-1.5 rounded-full uppercase">
            {memberDiscountPct}% OFF
          </span>
        </div>
      )}

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="flex items-center space-x-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          <button
            type="button"
            onClick={() => setSelectedCategory('ALL')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              selectedCategory === 'ALL'
                ? 'bg-champion-dark text-white shadow-sm'
                : 'bg-white border text-gray-700 hover:bg-gray-50'
            }`}
          >
            All Categories ({products.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-champion-dark text-white shadow-sm'
                  : 'bg-white border text-gray-700 hover:bg-gray-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search equipment or SKU..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border rounded-xl outline-none focus:ring-2 focus:ring-champion-dark bg-white"
          />
        </div>
      </div>

      {error && <div className="rounded-xl bg-red-50 p-4 text-xs font-semibold text-red-700 border border-red-200">{error}</div>}

      {/* Products Grid */}
      {loading ? (
        <div className="p-12 text-center text-xs font-semibold text-gray-400">Loading club gear catalog...</div>
      ) : filteredProducts.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border text-xs font-semibold text-gray-500">
          No gear items match your filter.
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredProducts.map((product) => {
            const retailPrice = Number(product.retail_price || 0);
            const memberPrice = isMember && memberDiscountPct > 0 ? retailPrice * (1 - memberDiscountPct / 100) : retailPrice;
            const isOutOfStock = Number(product.stock_quantity) <= 0;
            const isLowStock = !isOutOfStock && Number(product.stock_quantity) <= Number(product.low_stock_threshold || 5);

            return (
              <article
                key={product.id}
                className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    <span>{product.category_name}</span>
                    <span className="font-mono">{product.sku}</span>
                  </div>

                  <h2 className="mt-2 text-base font-black text-champion-dark">{product.name}</h2>
                  <p className="mt-1.5 text-xs text-gray-500 line-clamp-2 leading-relaxed">{product.description}</p>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-100 space-y-3">
                  <div className="flex items-end justify-between">
                    <div>
                      <span className="text-[10px] text-gray-400 font-bold uppercase block">Retail Price</span>
                      <div className="flex items-baseline space-x-1.5">
                        <span className={`font-black text-lg ${isMember && memberDiscountPct > 0 ? 'line-through text-gray-400 text-sm' : 'text-champion-dark'}`}>
                          ₹{retailPrice.toFixed(2)}
                        </span>
                        {isMember && memberDiscountPct > 0 && (
                          <span className="font-black text-lg text-emerald-700">
                            ₹{memberPrice.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>

                    <span
                      className={`inline-flex items-center space-x-1 rounded-full px-2.5 py-1 text-[10px] font-black uppercase ${
                        isOutOfStock
                          ? 'bg-red-50 text-red-700 border border-red-200'
                          : isLowStock
                          ? 'bg-amber-50 text-amber-800 border border-amber-200'
                          : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      }`}
                    >
                      {isOutOfStock ? (
                        <>
                          <XCircle className="w-3 h-3 text-red-600" />
                          <span>Out of Stock</span>
                        </>
                      ) : isLowStock ? (
                        <>
                          <AlertTriangle className="w-3 h-3 text-amber-600" />
                          <span>Low: {product.stock_quantity} left</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-3 h-3 text-emerald-600" />
                          <span>In Stock ({product.stock_quantity})</span>
                        </>
                      )}
                    </span>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-2.5 text-[11px] font-semibold text-gray-600 text-center border border-gray-100">
                    Purchase in-person at Pro Shop Counter
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};
