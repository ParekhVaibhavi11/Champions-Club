import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { cafeService } from '../../services/cafeService';
import { Badge } from '../../components/Badge';
import { 
  Coffee, 
  Sparkles, 
  CheckCircle, 
  UtensilsCrossed, 
  Clock, 
  ArrowRight, 
  ShieldCheck,
  Flame,
  Info,
  Plus,
  Minus,
  ShoppingBag,
  CreditCard,
  QrCode,
  DollarSign,
  AlertCircle,
  RefreshCw,
  X,
  Receipt
} from 'lucide-react';

export const CafeMenu = () => {
  const { user, isAuthenticated } = useAuth();
  const [menu, setMenu] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [tables, setTables] = useState([]);
  const [selectedTableId, setSelectedTableId] = useState(null);
  const [cart, setCart] = useState({}); // { [item_id]: quantity }
  const [customerName, setCustomerName] = useState(user?.role === 'member' ? user.full_name || '' : '');
  const [customerEmail, setCustomerEmail] = useState(user?.role === 'member' ? user.email || '' : '');
  const [verifiedMembership, setVerifiedMembership] = useState(null);
  const [verifyingMembership, setVerifyingMembership] = useState(false);
  const [verificationError, setVerificationError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [loading, setLoading] = useState(true);
  const [orderSubmitting, setOrderSubmitting] = useState(false);
  const [orderMessage, setOrderMessage] = useState('');
  const [orderError, setOrderError] = useState('');
  const [settledReceipt, setSettledReceipt] = useState(null);
  const [activeTabMode, setActiveTabMode] = useState('ORDER'); // 'ORDER' | 'CATALOG'

  const isAdmin = isAuthenticated && user?.role === 'admin';
  const isMember = Boolean(verifiedMembership?.has_active_plan);
  const discountPct = isMember ? Number(verifiedMembership.cafe_discount_pct || 0) : 0;

  const loadMenuAndTables = async () => {
    try {
      const menuRes = await cafeService.getMenu();
      const items = menuRes.data || [];
      setMenu(items);

      // Extract unique categories
      const cats = Array.from(
        new Set(items.map((item) => item.category_name).filter(Boolean))
      );
      setCategories(cats);

      if (isAuthenticated) {
        try {
          const tablesRes = await cafeService.getTables();
          const tbls = tablesRes.data || [];
          setTables(tbls);
          if (!tbls.some((table) => String(table.id) === String(selectedTableId))) {
            const firstAvailable = tbls.find((table) => !table.order_id);
            const firstOpen = tbls.find((table) => table.order_id);
            setSelectedTableId(firstAvailable?.id ?? firstOpen?.id ?? null);
          }
          if (!tbls.length) setOrderError('No café tables are available. Refresh tables or contact café staff.');
        } catch (tableError) {
          setTables([]);
          setSelectedTableId(null);
          setOrderError(`Could not load café tables: ${tableError.message}`);
        }
      }
    } catch (err) {
      console.error('Failed to load cafe data:', err);
      setOrderError(err.message || 'Unable to load menu.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMenuAndTables();
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return undefined;
    const timer = window.setInterval(async () => {
      try {
        const response = await cafeService.getTables();
        const latestTables = response.data || [];
        setTables(latestTables);
        setSelectedTableId((current) => latestTables.some((table) => String(table.id) === String(current))
          ? current
          : (latestTables.find((table) => !table.order_id)?.id ?? latestTables[0]?.id ?? null));
      } catch (err) {
        console.error('Failed to refresh café tables:', err);
      }
    }, 15000);
    return () => window.clearInterval(timer);
  }, [isAuthenticated]);

  const selectedTable = tables.find((t) => String(t.id) === String(selectedTableId));
  const kitchenEstimateMinutes = 1;
  const orderAgeMinutes = selectedTable?.opened_at
    ? Math.max(0, Math.floor((Date.now() - new Date(selectedTable.opened_at).getTime()) / 60000))
    : 0;
  const estimatedMinutesRemaining = Math.max(0, kitchenEstimateMinutes - orderAgeMinutes);
  const kitchenStage = {
    PENDING: 'Waiting for kitchen to start',
    PREPARING: 'Being prepared',
    READY: 'Cooked and ready',
    SERVED: 'Served',
  }[selectedTable?.kitchen_status] || 'Kitchen status unavailable';

  // Cart operations
  const inc = (id) => {
    setCart((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
    setOrderMessage('');
    setOrderError('');
  };

  const dec = (id) => {
    setCart((prev) => {
      const next = { ...prev };
      if (next[id] > 1) {
        next[id] -= 1;
      } else {
        delete next[id];
      }
      return next;
    });
    setOrderMessage('');
    setOrderError('');
  };

  const clearCart = () => {
    setCart({});
    setOrderMessage('');
    setOrderError('');
  };

  const printSettledReceipt = () => window.print();

  // Cart items calculations
  const cartItems = Object.entries(cart)
    .filter(([, qty]) => qty > 0)
    .map(([itemId, qty]) => {
      const item = menu.find((m) => m.id === Number(itemId));
      const rawPrice = Number(item?.price || 0);
      const lineTotal = rawPrice * qty;
      const isEligible = Boolean(item?.member_discount_eligible);
      return {
        ...item,
        quantity: qty,
        unitPrice: rawPrice,
        lineTotal,
        isEligible,
      };
    });

  const cartSubtotal = cartItems.reduce((sum, i) => sum + i.lineTotal, 0);
  const eligibleSubtotal = cartItems.filter((i) => i.isEligible).reduce((sum, i) => sum + i.lineTotal, 0);
  const cartDiscountAmount = isMember && discountPct > 0 ? (eligibleSubtotal * discountPct) / 100 : 0;
  const cartFinalTotal = Math.max(0, cartSubtotal - cartDiscountAmount);

  const handleVerifyMembership = async () => {
    setVerificationError('');
    setVerifiedMembership(null);
    setVerifyingMembership(true);
    try {
      const result = await cafeService.verifyMembershipDiscount(customerEmail.trim());
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

  // Submit Order (Open Tab or Add Items to existing Open Tab)
  const handlePlaceOrder = async () => {
    if (!isAuthenticated) {
      setOrderError('Please sign in to open a table tab and send orders to the kitchen.');
      return;
    }
    if (!selectedTableId) {
      setOrderError('Please select a dining table or bar counter seat.');
      return;
    }
    if (!cartItems.length) {
      setOrderError('Please add at least one menu item to your tab.');
      return;
    }
    if (!customerName.trim() || !customerEmail.trim()) {
      setOrderError('Enter the customer name and email before placing the order.');
      return;
    }
    if (!verifiedMembership) {
      setOrderError('Verify the customer email to check for an active membership discount before ordering.');
      return;
    }
    if (selectedTable?.order_id && selectedTable.guest_email && customerEmail.trim().toLowerCase() !== selectedTable.guest_email.toLowerCase()) {
      setOrderError('This open tab is attached to a different customer email. Select the matching customer to continue.');
      return;
    }

    setOrderSubmitting(true);
    setOrderError('');
    setOrderMessage('');

    const itemsPayload = cartItems.map((item) => ({
      menu_item_id: item.id,
      quantity: item.quantity,
    }));

    try {
      if (selectedTable?.order_id) {
        // Add items to existing open tab
        await cafeService.addItems(selectedTable.order_id, itemsPayload);
        setOrderMessage(`Items successfully added to Tab #${selectedTable.order_no} and routed to the kitchen!`);
      } else {
        // Create new tab
        const res = await cafeService.createOrder({
          table_id: Number(selectedTableId),
          member_id: verifiedMembership?.has_active_plan ? verifiedMembership.user_id : null,
          guest_name: customerName.trim(),
          guest_email: customerEmail.trim(),
          items: itemsPayload,
        });
        const orderNo = res.data?.order_no || 'OPEN';
        setOrderMessage(`Tab #${orderNo} opened at Table ${selectedTable?.table_number}. Order sent to the kitchen; the paid receipt will be emailed when the tab is settled.`);
      }
      setCart({});
      await loadMenuAndTables();
    } catch (err) {
      setOrderError(err.message || 'Failed to place order.');
    } finally {
      setOrderSubmitting(false);
    }
  };

  // Settle Tab
  const handleSettleTab = async () => {
    if (!selectedTable?.order_id) return;
    setOrderSubmitting(true);
    setOrderError('');
    try {
      const settled = await cafeService.settle(selectedTable.order_id, paymentMethod);
      setSettledReceipt(settled.data);
      const emailStatus = settled.data?.receipt_email_status;
      const emailMessage = emailStatus === 'SENT'
        ? 'Receipt emailed.'
        : emailStatus === 'SIMULATED'
        ? 'Receipt email simulated because SMTP is not configured.'
        : emailStatus === 'FAILED'
        ? 'Receipt email could not be sent.'
        : '';
      setOrderMessage(`Tab #${selectedTable.order_no} settled via ${paymentMethod}. Table ${selectedTable.table_number} is released. ${emailMessage}`);
      await loadMenuAndTables();
    } catch (err) {
      setOrderError(err.message || 'Failed to settle tab.');
    } finally {
      setOrderSubmitting(false);
    }
  };

  const filteredMenu = selectedCategory === 'ALL'
    ? menu
    : menu.filter((item) => item.category_name === selectedCategory);

  return (
    <div className="w-full min-w-0 max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 space-y-8">
      <style>{`@media print { body * { visibility: hidden !important; } #cafe-paid-receipt, #cafe-paid-receipt * { visibility: visible !important; } #cafe-paid-receipt { position: absolute; inset: 0 auto auto 0; width: 100%; padding: 24px; background: white; } }`}</style>
      
      {/* Hero Header */}
      <div className="relative rounded-3xl bg-neutral-950 text-white p-6 sm:p-10 border border-neutral-800 shadow-xl overflow-hidden">
        {/* Background glow & watermark */}
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-96 h-96 bg-champion-red/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-6 bottom-4 opacity-5 pointer-events-none hidden md:block">
          <Coffee className="w-64 h-64 text-white" />
        </div>

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-champion-red/20 text-champion-red text-xs font-black uppercase tracking-wider mb-3 border border-champion-red/30">
            <Flame className="w-3.5 h-3.5" />
            <span>Artisanal Fuel & Recovery Bar</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight">
            Fuel Café & Bar
          </h1>
          <p className="mt-3 text-sm sm:text-base text-gray-300 leading-relaxed font-medium">
            Olympic-grade nutrition, freshly extracted organic coolers, single-origin espresso, high-protein smoothies, and post-match craft beers. Members can order directly to their table with automatic discounts!
          </p>

          {/* Member Discount Strip */}
          {isMember && discountPct > 0 && (
            <div className="mt-5 p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-center space-x-3 text-xs sm:text-sm font-bold">
              <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <span>
                <strong>{verifiedMembership?.plan_tier || 'MEMBER'} PRIVILEGE:</strong> {discountPct}% discount applied to eligible dining items.
              </span>
            </div>
          )}

          {/* Admin POS quick-link */}
          {isAdmin && (
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/admin/cafe"
                className="inline-flex items-center space-x-2 bg-champion-red hover:bg-champion-red-hover text-white text-xs font-black uppercase tracking-wider px-5 py-3 rounded-xl shadow-lg transition-transform hover:scale-102"
              >
                <UtensilsCrossed className="w-4 h-4" />
                <span>Open Staff Café POS</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/staff/kitchen"
                className="inline-flex items-center space-x-2 bg-neutral-800 hover:bg-neutral-700 text-gray-200 text-xs font-bold uppercase tracking-wider px-5 py-3 rounded-xl border border-neutral-700 transition-colors"
              >
                <Clock className="w-4 h-4 text-champion-red" />
                <span>Kitchen Display Queue</span>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Mode Switcher */}
      <div className="flex items-center justify-between flex-wrap gap-4 bg-white p-3 rounded-2xl border border-gray-200 shadow-sm">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveTabMode('ORDER')}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider transition-all ${
              activeTabMode === 'ORDER'
                ? 'bg-champion-red text-white shadow-md'
                : 'text-gray-600 hover:text-champion-dark hover:bg-gray-100'
            }`}
          >
            <UtensilsCrossed className="w-4 h-4" />
            <span>Table Ordering & Tabs</span>
            {cartItems.length > 0 && (
              <span className="ml-1.5 px-2 py-0.5 rounded-full bg-white text-champion-red text-[11px] font-black">
                {cartItems.reduce((sum, i) => sum + i.quantity, 0)}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTabMode('CATALOG')}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider transition-all ${
              activeTabMode === 'CATALOG'
                ? 'bg-champion-red text-white shadow-md'
                : 'text-gray-600 hover:text-champion-dark hover:bg-gray-100'
            }`}
          >
            <Coffee className="w-4 h-4" />
            <span>Browse Full Menu</span>
          </button>
        </div>

        {isAuthenticated && user && (
          <div className="text-xs text-gray-500 font-semibold px-2 flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
            <span>Ordering as <strong className="text-champion-dark">{user.full_name}</strong></span>
          </div>
        )}
      </div>

      {/* Alerts */}
      {orderMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-bold flex items-center justify-between animate-in fade-in">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span>{orderMessage}</span>
          </div>
          <button onClick={() => setOrderMessage('')} className="p-1 hover:bg-emerald-100 rounded text-emerald-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {orderError && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-sm font-bold flex items-center justify-between animate-in fade-in">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <span>{orderError}</span>
          </div>
          <button onClick={() => setOrderError('')} className="p-1 hover:bg-red-100 rounded text-red-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {settledReceipt && (
        <section id="cafe-paid-receipt" className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-900">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div><h2 className="font-black uppercase">Payment complete · {settledReceipt.order_no}</h2><p className="mt-1 text-sm">Receipt email: {settledReceipt.receipt_email_status}</p></div>
            <button type="button" onClick={printSettledReceipt} className="rounded-lg bg-champion-dark px-4 py-2 text-xs font-bold text-white">Print Receipt</button>
          </div>
          <div className="rounded-xl bg-white p-5 text-gray-900">
            <h3 className="text-center text-lg font-black uppercase">Champions Club · Café Receipt</h3>
            <div className="mt-4 grid gap-1 text-xs sm:grid-cols-2">
              <p><strong>Customer:</strong> {settledReceipt.customer_name}</p><p><strong>Email:</strong> {settledReceipt.customer_email}</p>
              <p><strong>Table:</strong> {settledReceipt.table_number}</p><p><strong>Payment:</strong> {settledReceipt.payment_method}</p>
            </div>
            <div className="mt-4 space-y-2 border-y py-3 text-sm">
              {(settledReceipt.items || []).map((item, index) => <div key={`${item.menu_item_id}-${index}`} className="flex justify-between"><span>{item.quantity} × {item.name}</span><span>₹{Number(item.subtotal).toFixed(2)}</span></div>)}
            </div>
            <div className="ml-auto mt-3 max-w-xs space-y-1 text-right text-xs">
              <p>Subtotal: ₹{Number(settledReceipt.subtotal).toFixed(2)}</p>
              <p>{Number(settledReceipt.membership_discount_pct) > 0 ? `${settledReceipt.membership_tier} membership discount (${Number(settledReceipt.membership_discount_pct)}%)` : 'Discount'}: −₹{Number(settledReceipt.discount_amount).toFixed(2)}</p>
              <p className="text-base font-black">Total paid: ₹{Number(settledReceipt.total_amount).toFixed(2)}</p>
            </div>
          </div>
        </section>
      )}

      {/* STEP 1: Table Selector (Available to Authenticated Members & Admins) */}
      {isAuthenticated && tables.length > 0 && (
        <section className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h2 className="text-base font-black uppercase text-champion-dark tracking-tight flex items-center">
                <UtensilsCrossed className="w-4 h-4 text-champion-red mr-2" />
                Select Your Dining Table or Bar Seat
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Orders sent to kitchen will be delivered directly to your selected seat.
              </p>
            </div>
            <button
              onClick={loadMenuAndTables}
              className="text-xs font-bold text-gray-500 hover:text-champion-dark flex items-center space-x-1"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh Tables</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {tables.map((table) => {
              const isSelected = String(selectedTableId) === String(table.id);
              const hasOpenTab = Boolean(table.order_id);

              return (
                <button
                  key={table.id}
                  type="button"
                  onClick={() => {
                    setSelectedTableId(table.id);
                    if (table.order_id) {
                      setCustomerName(table.guest_name || table.member_name || '');
                      setCustomerEmail(table.guest_email || '');
                      setVerifiedMembership(null);
                    }
                  }}
                  className={`p-3.5 rounded-2xl border text-left transition-all relative ${
                    isSelected
                      ? 'border-champion-red bg-red-50/40 ring-2 ring-champion-red/20 shadow-md'
                      : hasOpenTab
                      ? 'border-amber-200 bg-amber-50/30 hover:border-amber-300'
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-black text-sm text-champion-dark">{table.table_number}</span>
                    <span
                      className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded ${
                        hasOpenTab
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {hasOpenTab ? 'TAB OPEN' : 'AVAILABLE'}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-400 font-medium">{table.capacity} Seats</p>
                  {hasOpenTab && (
                    <p className="text-[11px] font-mono font-bold text-amber-700 mt-1 truncate">
                      ₹{Number(table.total_amount || 0).toFixed(0)}
                    </p>
                  )}
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* Main Interactive Grid: Menu Items + Live Ordering Cart Aside */}
      <div className="grid min-w-0 grid-cols-1 2xl:grid-cols-[minmax(0,1fr)_360px] gap-6 2xl:gap-8 items-start">
        
        {/* Left Column: Category Filters & Offerings Grid */}
        <div className="min-w-0 space-y-6">
          {/* Category Tabs */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
            <button
              type="button"
              onClick={() => setSelectedCategory('ALL')}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                selectedCategory === 'ALL'
                  ? 'bg-champion-dark text-white shadow-md'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              All Offerings ({menu.length})
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-champion-dark text-white shadow-md'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Menu Items Grid */}
          {loading ? (
            <div className="flex justify-center py-20 bg-white rounded-3xl border border-gray-200">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-champion-red" />
            </div>
          ) : filteredMenu.length === 0 ? (
            <div className="p-12 text-center text-gray-400 bg-white rounded-3xl border border-gray-200">
              No menu items found for this category.
            </div>
          ) : (
            <div className="grid min-w-0 grid-cols-1 sm:grid-cols-2 2xl:grid-cols-3 gap-5">
              {filteredMenu.map((item) => {
                const rawPrice = Number(item.price || 0);
                const isEligible = item.member_discount_eligible;
                const discountedPrice = isEligible && discountPct > 0 
                  ? rawPrice * (1 - discountPct / 100) 
                  : rawPrice;
                const qtyInCart = cart[item.id] || 0;

                return (
                  <div
                    key={item.id}
                    className={`bg-white rounded-2xl p-5 border transition-all flex flex-col justify-between group ${
                      qtyInCart > 0
                        ? 'border-champion-red ring-1 ring-champion-red/20 shadow-md'
                        : 'border-gray-200 shadow-sm hover:shadow-md'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-gray-100 text-gray-600">
                          {item.category_name || 'Café'}
                        </span>
                        {isEligible && (
                          <span className="text-[10px] font-bold text-emerald-600 flex items-center">
                            <Sparkles className="w-3 h-3 mr-1" /> Member Eligible
                          </span>
                        )}
                      </div>

                      <h3 className="font-black text-champion-dark text-base uppercase tracking-tight group-hover:text-champion-red transition-colors line-clamp-1">
                        {item.name}
                      </h3>

                      <p className="text-xs text-gray-500 mt-1.5 leading-relaxed line-clamp-2">
                        {item.description || 'Prepared fresh at the Fuel Café Bar station.'}
                      </p>
                    </div>

                    <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-between">
                      <div>
                        <div className="flex items-baseline space-x-1.5">
                          <span className="text-base font-black text-champion-dark font-mono">
                            ₹{discountedPrice.toFixed(2)}
                          </span>
                          {isEligible && discountPct > 0 && (
                            <span className="text-[11px] text-gray-400 line-through font-mono">
                              ₹{rawPrice.toFixed(2)}
                            </span>
                          )}
                        </div>
                        {isEligible && discountPct > 0 && (
                          <span className="text-[9px] font-black uppercase text-emerald-600 block">
                            -{discountPct}% Member Rate
                          </span>
                        )}
                      </div>

                      {/* Add to Cart / Quantity controls */}
                      {qtyInCart > 0 ? (
                        <div className="flex items-center space-x-1.5 bg-neutral-900 text-white rounded-xl p-1 shadow-sm">
                          <button
                            type="button"
                            onClick={() => dec(item.id)}
                            className="p-1 rounded-lg hover:bg-neutral-800 text-gray-300 hover:text-white transition-colors"
                            title="Decrease quantity"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="text-xs font-black px-1.5 font-mono">{qtyInCart}</span>
                          <button
                            type="button"
                            onClick={() => inc(item.id)}
                            className="p-1 rounded-lg hover:bg-neutral-800 text-gray-300 hover:text-white transition-colors"
                            title="Increase quantity"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => inc(item.id)}
                          className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-neutral-900 hover:bg-champion-red text-white text-xs font-extrabold uppercase tracking-wider transition-colors shadow-sm"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Live Table Tab & Cart Aside */}
        <aside className="min-w-0 w-full 2xl:sticky 2xl:top-24 bg-white rounded-3xl p-4 sm:p-6 border border-gray-200 shadow-lg space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div className="flex items-center space-x-2">
              <ShoppingBag className="w-5 h-5 text-champion-red" />
              <h3 className="font-black uppercase text-champion-dark tracking-tight">
                Your Table Tab
              </h3>
            </div>
            {cartItems.length > 0 && (
              <button
                type="button"
                onClick={clearCart}
                className="text-[11px] font-bold text-gray-400 hover:text-champion-red transition-colors"
              >
                Clear Cart
              </button>
            )}
          </div>

          {/* Keep table selection beside the cart so placing an order never depends on scrolling back up. */}
          {isAuthenticated && (
            <label className="block text-xs font-bold text-gray-600">
              Dining Table / Bar Seat *
              <select
                value={selectedTableId ?? ''}
                onChange={(event) => {
                  const table = tables.find((candidate) => String(candidate.id) === event.target.value);
                  setSelectedTableId(table?.id ?? null);
                  if (table?.order_id) {
                    setCustomerName(table.guest_name || table.member_name || '');
                    setCustomerEmail(table.guest_email || '');
                    setVerifiedMembership(null);
                  }
                  setOrderError('');
                }}
                className="mt-1 w-full min-w-0 rounded-lg border bg-white p-2.5 text-sm"
              >
                <option value="">Select a table</option>
                {tables.map((table) => (
                  <option key={table.id} value={table.id}>
                    {table.table_number} · {table.order_id ? `Open tab #${table.order_no}` : 'Available'}
                  </option>
                ))}
              </select>
              {!tables.length && <span className="mt-1 block text-xs font-medium text-red-700">No tables are available. Refresh the table list or contact café staff.</span>}
            </label>
          )}

          {/* Selected Table Info */}
          <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider block">
                Selected Table
              </span>
              <span className="text-sm font-black text-champion-dark">
                {selectedTable ? `${selectedTable.table_number} (${selectedTable.capacity} Seats)` : 'No Table Selected'}
              </span>
            </div>
            {selectedTable && (
              <Badge variant={selectedTable.order_id ? 'gold' : 'green'}>
                {selectedTable.order_id ? 'TAB OPEN' : 'AVAILABLE'}
              </Badge>
            )}
          </div>

          {isAuthenticated && (
            <div className="space-y-3 border-b border-gray-100 pb-4">
              <label className="block text-xs font-bold text-gray-600">
                Customer Name *
                <input
                  required
                  maxLength={100}
                  value={customerName}
                  onChange={(event) => setCustomerName(event.target.value)}
                  readOnly={user?.role === 'member'}
                  className="mt-1 w-full min-w-0 rounded-lg border p-2.5 text-sm"
                  placeholder="Enter customer name"
                />
              </label>
              <label className="block text-xs font-bold text-gray-600">
                Customer Email *
                <input
                  required
                  type="email"
                  maxLength={254}
                  value={customerEmail}
                  onChange={(event) => {
                    setCustomerEmail(event.target.value);
                    setVerifiedMembership(null);
                    setVerificationError('');
                  }}
                  readOnly={user?.role === 'member' || Boolean(selectedTable?.order_id)}
                  className="mt-1 w-full min-w-0 rounded-lg border p-2.5 text-sm"
                  placeholder="name@example.com"
                />
              </label>
              <button
                type="button"
                disabled={!customerEmail.trim() || verifyingMembership}
                onClick={handleVerifyMembership}
                className="w-full rounded-lg border border-champion-red px-3 py-2.5 text-xs font-black uppercase text-champion-red hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {verifyingMembership ? 'Verifying Plan…' : 'Verify Plan & Apply Discount'}
              </button>
              {verificationError && <p className="text-xs font-semibold text-red-700">{verificationError}</p>}
              {verifiedMembership?.has_active_plan ? (
                <p className="rounded-lg bg-emerald-50 p-2.5 text-xs font-semibold text-emerald-800">
                  {verifiedMembership.plan_tier} plan verified · {discountPct}% café discount applied to eligible items.
                </p>
              ) : verifiedMembership ? (
                <p className="rounded-lg bg-gray-50 p-2.5 text-xs text-gray-600">No active plan found. Standard pricing applies.</p>
              ) : null}
            </div>
          )}

          {/* If the table has an open tab already */}
          {selectedTable?.order_id && (
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-amber-900">Active Tab #{selectedTable.order_no}</span>
                <span className="font-mono font-black text-amber-900">
                  ₹{Number(selectedTable.total_amount || 0).toFixed(2)}
                </span>
              </div>
              <p className="text-[11px] text-amber-700 leading-tight">
                An active tab is running. You can add more items or settle below.
              </p>
              <div className="rounded-lg border border-amber-200 bg-white/80 p-2.5 text-xs">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-gray-700">Kitchen update</span>
                  <span className={`rounded-full px-2 py-1 text-[10px] font-black uppercase ${['READY', 'SERVED'].includes(selectedTable.kitchen_status) ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'}`}>
                    {kitchenStage}
                  </span>
                </div>
                {['READY', 'SERVED'].includes(selectedTable.kitchen_status) ? (
                  <p className="mt-1 text-[11px] text-emerald-800">Your order is ready. Select a payment method below to settle the tab.</p>
                ) : (
                  <p className="mt-1 text-[11px] text-gray-600">
                    Approximate kitchen target: {estimatedMinutesRemaining > 0 ? `about ${estimatedMinutesRemaining} min remaining` : 'preparation may take longer than usual'}.
                    {' '}This is an estimate; the status refreshes automatically about every 15 seconds.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Cart Items List */}
          <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
            {cartItems.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-xs">
                <Coffee className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p className="font-semibold">Your order cart is empty.</p>
                <p className="text-[11px] text-gray-400 mt-0.5">Click '+ Add' on any menu item above to build your order.</p>
              </div>
            ) : (
              cartItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between text-xs py-1.5 border-b border-gray-50">
                  <div className="flex-1 pr-2">
                    <p className="font-bold text-champion-dark leading-tight">{item.name}</p>
                    <p className="text-[10px] text-gray-400 font-mono">
                      ₹{item.unitPrice.toFixed(2)} × {item.quantity}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => dec(item.id)}
                      className="w-5 h-5 rounded bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center font-bold"
                    >
                      -
                    </button>
                    <span className="font-mono font-bold text-xs">{item.quantity}</span>
                    <button
                      onClick={() => inc(item.id)}
                      className="w-5 h-5 rounded bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center font-bold"
                    >
                      +
                    </button>
                    <span className="font-mono font-black text-champion-dark w-14 text-right">
                      ₹{item.lineTotal.toFixed(2)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pricing Summary */}
          {cartItems.length > 0 && (
            <div className="space-y-2 pt-3 border-t border-gray-100 text-xs font-semibold text-gray-600">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="font-mono text-champion-dark">₹{cartSubtotal.toFixed(2)}</span>
              </div>

              {isMember && discountPct > 0 && cartDiscountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>{verifiedMembership?.plan_tier || 'Member'} Discount ({discountPct}%)</span>
                  <span className="font-mono">-₹{cartDiscountAmount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between text-base font-black text-champion-dark pt-2 border-t border-gray-200">
                <span>Total to Order</span>
                <span className="font-mono text-champion-red">₹{cartFinalTotal.toFixed(2)}</span>
              </div>
            </div>
          )}

          {/* Action Button: Send to Kitchen */}
          {isAuthenticated ? (
            <button
              type="button"
              onClick={handlePlaceOrder}
              disabled={orderSubmitting || cartItems.length === 0}
              className="w-full py-3.5 rounded-2xl bg-champion-red hover:bg-champion-red-hover text-white text-xs uppercase font-black tracking-wider transition-all shadow-md hover:shadow-red-900/30 disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              <UtensilsCrossed className="w-4 h-4" />
              <span>
                {orderSubmitting
                  ? 'Routing to Kitchen...'
                  : selectedTable?.order_id
                  ? 'Add Items to Active Tab'
                  : 'Place Order & Send to Kitchen'}
              </span>
            </button>
          ) : (
            <Link
              to="/login"
              className="w-full py-3.5 rounded-2xl bg-champion-dark hover:bg-black text-white text-xs uppercase font-black tracking-wider transition-all shadow-md text-center block"
            >
              Sign In as Member to Order
            </Link>
          )}

          {/* Settle Active Tab Option (if table has an active tab) */}
          {selectedTable?.order_id && (
            <div className="pt-4 border-t border-gray-200 space-y-3">
              <span className="text-xs font-black uppercase tracking-wider text-gray-700 block">
                Settle Open Tab (#{selectedTable.order_no})
              </span>
              {['READY', 'SERVED'].includes(selectedTable.kitchen_status) ? (
                <p className="rounded-lg bg-emerald-50 p-2.5 text-xs font-semibold text-emerald-800">Kitchen marked this order cooked. Choose a payment method to settle and email the receipt.</p>
              ) : (
                <p className="rounded-lg bg-amber-50 p-2.5 text-xs font-semibold text-amber-800">Waiting for the kitchen to mark this order cooked. Payment will be available after preparation.</p>
              )}
              <div className="grid grid-cols-3 gap-2">
                {['UPI', 'CARD', 'CASH'].map((method) => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setPaymentMethod(method)}
                    className={`py-2 text-xs font-extrabold uppercase rounded-xl border transition-all ${
                      paymentMethod === method
                        ? 'border-champion-dark bg-champion-dark text-white'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {method}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={handleSettleTab}
                disabled={orderSubmitting || !['READY', 'SERVED'].includes(selectedTable.kitchen_status)}
                className="w-full py-3 rounded-2xl bg-neutral-900 hover:bg-black text-white text-xs font-black uppercase tracking-wider transition-all shadow-sm disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                <Receipt className="w-4 h-4 text-emerald-400" />
                <span>Settle ₹{Number(selectedTable.total_amount || 0).toFixed(2)}</span>
              </button>
            </div>
          )}

        </aside>
      </div>

      {/* Dining Tables & Tab Policy Banner */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm">
        <div className="flex items-center space-x-2.5 pb-3 border-b border-gray-100">
          <Info className="w-5 h-5 text-champion-red" />
          <h2 className="text-lg font-black uppercase text-champion-dark tracking-tight">
            Café & Bar Table Tabs Policy
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
            <span className="text-xs font-black uppercase tracking-wider text-gray-400 block mb-1">
              1. Seamless Open Tabs
            </span>
            <p className="text-xs text-gray-600 leading-relaxed">
              Dine at any of our 6 tables (T-01 to T-06) or Bar counter seats. Select your table above to open a tab and start ordering immediately.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
            <span className="text-xs font-black uppercase tracking-wider text-gray-400 block mb-1">
              2. Live Kitchen Routing
            </span>
            <p className="text-xs text-gray-600 leading-relaxed">
              Every ordered meal or artisan beverage routes instantly to the Chef's Kitchen queue (KDS) for minimal waiting between rallies.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
            <span className="text-xs font-black uppercase tracking-wider text-gray-400 block mb-1">
              3. Automatic Discount
            </span>
            <p className="text-xs text-gray-600 leading-relaxed">
              Settle your open tab prior to departing via UPI, Card, or Cash. Member rate discounts (up to 15%) are deducted automatically.
            </p>
          </div>
        </div>
      </section>

    </div>
  );
};
