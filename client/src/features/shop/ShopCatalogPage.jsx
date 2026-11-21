import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { ShoppingBag, AlertCircle, CheckCircle, Store } from 'lucide-react';

export default function ShopCatalogPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await api.get('/shop/products');
      setProducts(res.data.data || []);
    } catch (err) {
      console.error('Failed to load shop products:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Notice Banner */}
      <div className="bg-neutral-900 border-l-4 border-[#C8102E] p-4 rounded-r-lg mb-8 text-white flex items-start justify-between shadow-sm">
        <div className="flex gap-3">
          <Store className="w-5 h-5 text-[#C8102E] shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-sm tracking-wide uppercase">Club Gear Shop Policy</h3>
            <p className="text-xs text-neutral-300 mt-1">
              Browse authentic racquets, shuttles, balls, and club apparel. All purchases are completed <strong>in-person at our Front Desk / Gear Shop counter</strong> via Cash, Card, or UPI. Members receive up to 15% automatic discount.
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold uppercase tracking-tight text-[#111111]">Gear Shop Catalog</h1>
          <p className="text-xs text-neutral-500 mt-1">Live real-time inventory at Champions Club Pro Counter</p>
        </div>
        <span className="text-xs bg-white border border-neutral-300 font-semibold px-3 py-1.5 rounded-full text-neutral-700">
          {products.length} Items Listed
        </span>
      </div>

      {loading ? (
        <div className="text-center py-20 text-neutral-500 text-sm">Loading pro shop items...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((item) => (
            <div key={item.id} className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-sm flex flex-col justify-between hover:shadow-md transition">
              <div className="relative h-48 bg-neutral-100 overflow-hidden">
                <img
                  src={item.image_url || 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?auto=format&fit=crop&w=600&q=80'}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2">
                  {item.stock_quantity > 0 ? (
                    <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                      {item.stock_quantity} in stock
                    </span>
                  ) : (
                    <span className="bg-neutral-800 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                      Out of stock
                    </span>
                  )}
                </div>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider block">
                    {item.category_name || 'Accessories'}
                  </span>
                  <h3 className="font-bold text-sm text-[#111111] mt-1 line-clamp-1">{item.name}</h3>
                  <p className="text-xs text-neutral-500 mt-1 line-clamp-2">{item.description}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-neutral-400 line-through mr-1.5">
                      ₹{parseFloat(item.retail_price).toLocaleString()}
                    </span>
                    <span className="font-extrabold text-sm text-[#C8102E]">
                      ₹{parseFloat(item.member_price).toLocaleString()}
                    </span>
                    <span className="block text-[10px] text-neutral-500 font-medium">Member Price</span>
                  </div>

                  <span className="text-[11px] font-semibold text-neutral-600 bg-neutral-100 px-2 py-1 rounded">
                    In-Store Only
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
