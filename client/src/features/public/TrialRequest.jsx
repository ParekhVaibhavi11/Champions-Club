import React, { useState } from 'react';
import { trialService } from '../../services/trialService';
import { useAuth } from '../../hooks/useAuth';
import { hasActiveMembership } from '../../utils/membership';
import {
  Trophy,
  Calendar,
  Clock,
  Users,
  CheckCircle,
  AlertCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  Phone,
  Mail,
  User,
  Crown,
  CreditCard,
  QrCode,
  FileText,
  Smartphone,
  Banknote,
  Tag,
  Download,
} from 'lucide-react';
import { Button } from '../../components/Button';
import { TaxInvoiceModal } from '../../components/TaxInvoiceModal';
import { Link } from 'react-router-dom';

const SPORTS_OPTIONS = [
  {
    id: 'Tennis',
    name: 'Tennis Court',
    baseRate: 1200,
    rateFormatted: '₹1,200',
    description: 'Championship clay & synthetic hard courts with tournament lighting.',
  },
  {
    id: 'Cricket',
    name: 'Cricket Net',
    baseRate: 1500,
    rateFormatted: '₹1,500',
    description: 'Professional indoor turf batting nets equipped with bowling machines.',
  },
  {
    id: 'Padel',
    name: 'Padel Arena',
    baseRate: 1400,
    rateFormatted: '₹1,400',
    description: 'Panoramic glass court with LED floodlights and specialized turf.',
  },
  {
    id: 'Badminton',
    name: 'Badminton Court',
    baseRate: 800,
    rateFormatted: '₹800',
    description: 'BWF-standard wooden sprung courts with tournament anti-glare lighting.',
  },
];

export const TrialRequest = () => {
  const { user, isAuthenticated } = useAuth();

  const [formData, setFormData] = useState({
    fullName: user?.full_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    sportInterest: 'Tennis',
    preferredDate: '',
    preferredTime: '18:00',
    participantsCount: 1,
    paymentMethod: 'UPI',
    notes: '',
  });

  const [loading, setLoading] = useState(false);
  const [successBooking, setSuccessBooking] = useState(null);
  const [invoiceModalData, setInvoiceModalData] = useState(null);
  const [error, setError] = useState(null);

  const hasActivePlan = hasActiveMembership(user, isAuthenticated);

  const selectedSport = SPORTS_OPTIONS.find((s) => s.id === formData.sportInterest) || SPORTS_OPTIONS[0];
  const basePrice = selectedSport.baseRate;
  const gstAmount = Math.round(basePrice * 0.18);
  const totalAmount = basePrice + gstAmount;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload = {
        full_name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        sport_interest: formData.sportInterest,
        preferred_date: formData.preferredDate,
        preferred_time: `${formData.preferredTime}:00`,
        participants_count: parseInt(formData.participantsCount, 10),
        payment_method: formData.paymentMethod,
        notes: formData.notes,
      };

      const res = await trialService.requestTrial(payload);
      const data = res.data || res;
      setSuccessBooking(data);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to submit court booking. Please check all fields.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenInvoice = async (refCode) => {
    try {
      const invRes = await trialService.getInvoice(refCode);
      setInvoiceModalData(invRes.data || invRes);
    } catch (err) {
      console.error(err);
    }
  };

  // 1. MEMBER VIEW: Active Members have full subscription access
  if (hasActivePlan) {
    return (
      <div className="max-w-3xl mx-auto space-y-6 pb-16 animate-fade-in">
        <div className="bg-gradient-to-r from-amber-500 via-yellow-600 to-amber-600 text-white rounded-3xl p-8 md:p-12 shadow-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-72 h-72 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="relative z-10 space-y-3">
            <div className="inline-flex items-center space-x-2 bg-black/20 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider text-yellow-200">
              <Crown className="w-4 h-4 text-yellow-300" />
              <span>Active Club Member Detected</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight">
              Member Direct Reservations Active
            </h1>
            <p className="text-yellow-100 text-sm md:text-base leading-relaxed">
              Hello <span className="font-bold text-white">{user?.full_name}</span>! Non-member visitor booking passes are for external guests. You have direct court booking privileges with your tier rates.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-8 text-center space-y-5">
          <div className="w-14 h-14 bg-blue-50 text-champion-blue rounded-2xl flex items-center justify-center mx-auto">
            <Trophy className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-xl font-black text-gray-900 uppercase">Book With Member Privileges</h3>
            <p className="text-xs text-gray-500 max-w-md mx-auto mt-1">
              Select your sport and reserve your 60-minute session directly through the Member Reservation Engine with your tier pricing applied automatically.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Link
              to="/member/book-court"
              className="bg-champion-blue hover:bg-blue-700 text-white font-bold text-xs px-6 py-3 rounded-xl shadow-md transition-all flex items-center justify-center space-x-2"
            >
              <span>Book Court Slot Now</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/member/social-play"
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs px-6 py-3 rounded-xl transition-all flex items-center justify-center space-x-1"
            >
              <span>Join Friday Social Play</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 2. VISITOR / GUEST VIEW: Court Booking, Real-time Payment & Tax Invoice
  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16 animate-fade-in">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-champion-dark to-slate-900 text-white rounded-3xl p-8 md:p-12 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-96 h-96 bg-champion-red/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center space-x-2 bg-white/10 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-rose-300">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Visitor Court Booking & Demo Pass</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight">
            Reserve a Guest Court Session
          </h1>
          <p className="text-gray-300 text-sm md:text-base leading-relaxed">
            Experience our international-standard courts and facilities. Book your 60-minute slot,
            complete seamless payment, and receive your official digital tax invoice.
          </p>
        </div>
      </div>

      {/* Booking Success Screen with Invoice Link */}
      {successBooking ? (
        <div className="bg-white rounded-3xl border border-gray-200 shadow-xl p-8 space-y-6 text-center max-w-xl mx-auto animate-fade-in">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle className="w-8 h-8" />
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
              Payment Completed & Confirmed
            </span>
            <h2 className="text-2xl font-black text-gray-900 mt-1">Guest Session Pass Issued</h2>
            <p className="text-xs text-gray-500 mt-1">
              Your court booking and tax invoice have been generated and recorded.
            </p>
          </div>

          {/* Session Pass Card */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-dashed border-gray-300 rounded-2xl p-6 space-y-4 text-left">
            <div className="flex justify-between items-center border-b pb-3 border-gray-200">
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase">Booking Reference</span>
                <div className="text-lg font-mono font-black text-champion-blue">
                  {successBooking.reference_code}
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold text-gray-400 uppercase">Tax Invoice No</span>
                <div className="text-sm font-mono font-bold text-gray-800">
                  {successBooking.invoice_no}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-gray-400 block text-[10px]">Candidate</span>
                <span className="font-bold text-gray-800">{successBooking.full_name}</span>
              </div>
              <div>
                <span className="text-gray-400 block text-[10px]">Sport Arena</span>
                <span className="font-bold text-gray-800">{successBooking.sport_interest}</span>
              </div>
              <div>
                <span className="text-gray-400 block text-[10px]">Session Date</span>
                <span className="font-bold text-gray-800">{successBooking.preferred_date?.slice(0, 10)}</span>
              </div>
              <div>
                <span className="text-gray-400 block text-[10px]">Session Time</span>
                <span className="font-bold text-gray-800">{successBooking.preferred_time?.slice(0, 5)} (60 Mins)</span>
              </div>
            </div>

            <div className="pt-3 border-t border-gray-200 flex justify-between items-center text-xs">
              <div>
                <span className="text-[10px] text-gray-400 block">Total Paid (incl. 18% GST)</span>
                <span className="font-black text-gray-900 text-sm">
                  ₹{parseFloat(successBooking.total_amount || successBooking.fee_charged).toFixed(2)}
                </span>
              </div>
              <span className="bg-emerald-100 text-emerald-800 font-bold px-3 py-1 rounded-full uppercase text-[10px] flex items-center space-x-1">
                <CheckCircle className="w-3 h-3" />
                <span>PAID VIA {successBooking.payment_method || 'UPI'}</span>
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={() => handleOpenInvoice(successBooking.reference_code)}
              className="flex-1 bg-gray-900 hover:bg-black text-white font-extrabold text-xs py-3 px-4 rounded-xl shadow transition-colors flex items-center justify-center space-x-1.5 cursor-pointer opacity-100"
            >
              <FileText className="w-4 h-4 text-yellow-300 shrink-0" />
              <span className="text-white font-extrabold">View & Download Tax Invoice</span>
            </button>
            <Link
              to={`/trial/status?ref=${successBooking.reference_code}&phone=${successBooking.phone}`}
              className="flex-1 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-extrabold text-xs py-3 px-4 rounded-xl shadow transition-colors flex items-center justify-center space-x-1 cursor-pointer opacity-100"
            >
              <span className="text-white font-extrabold">Live Status Tracker</span>
              <ChevronRight className="w-4 h-4 text-white shrink-0" />
            </Link>
          </div>
        </div>
      ) : (
        /* Booking & Checkout Form */
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 md:p-10">
          <form onSubmit={handleSubmit} className="space-y-8">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-2xl flex items-center space-x-2 text-xs font-semibold">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Sport & Court Selection Cards */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black uppercase text-gray-600 tracking-wider">
                  1. Select Sport Arena
                </label>
                <span className="text-[11px] font-bold text-champion-blue flex items-center space-x-1">
                  <Tag className="w-3.5 h-3.5" />
                  <span>Standard Non-Member Rates in ₹ INR</span>
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                {SPORTS_OPTIONS.map((sport) => {
                  const isSelected = formData.sportInterest === sport.id;
                  return (
                    <button
                      key={sport.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, sportInterest: sport.id })}
                      className={`p-4 rounded-2xl border text-left transition-all relative ${
                        isSelected
                          ? 'border-champion-blue bg-blue-50/50 shadow-sm'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-black text-gray-900 text-sm">{sport.name}</span>
                        {isSelected && <CheckCircle className="w-4 h-4 text-champion-blue" />}
                      </div>
                      <div className="text-xs font-black text-champion-blue mt-1">
                        {sport.rateFormatted} <span className="text-[10px] text-gray-400 font-normal">/ 60 mins</span>
                      </div>
                      <p className="text-[11px] text-gray-500 mt-1 line-clamp-2">{sport.description}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Date & Time Preferences */}
            <div className="space-y-3 border-t border-gray-100 pt-6">
              <label className="text-xs font-black uppercase text-gray-600 tracking-wider">
                2. Scheduling Preferences
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Session Date</label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                    <input
                      type="date"
                      required
                      min={new Date().toISOString().split('T')[0]}
                      value={formData.preferredDate}
                      onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
                      className="w-full pl-9 pr-3 py-2 border rounded-xl font-medium outline-none focus:ring-2 focus:ring-champion-blue"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">Start Time Slot</label>
                  <div className="relative">
                    <Clock className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                    <select
                      value={formData.preferredTime}
                      onChange={(e) => setFormData({ ...formData, preferredTime: e.target.value })}
                      className="w-full pl-9 pr-3 py-2 border rounded-xl font-medium outline-none focus:ring-2 focus:ring-champion-blue bg-white"
                    >
                      {Array.from({ length: 16 }, (_, i) => i + 6).map((h) => {
                        const timeVal = `${String(h).padStart(2, '0')}:00`;
                        return (
                          <option key={timeVal} value={timeVal}>
                            {timeVal} (60 Mins)
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">Participants</label>
                  <div className="relative">
                    <Users className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                    <select
                      value={formData.participantsCount}
                      onChange={(e) => setFormData({ ...formData, participantsCount: e.target.value })}
                      className="w-full pl-9 pr-3 py-2 border rounded-xl font-medium outline-none focus:ring-2 focus:ring-champion-blue bg-white"
                    >
                      <option value={1}>1 Player (Solo Session)</option>
                      <option value={2}>2 Players (Singles Rally)</option>
                      <option value={4}>4 Players (Doubles Match)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Visitor Details */}
            <div className="space-y-3 border-t border-gray-100 pt-6">
              <label className="text-xs font-black uppercase text-gray-600 tracking-wider">
                3. Visitor Details & Invoice Recipient
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Full Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rahul Sharma"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full pl-9 pr-3 py-2 border rounded-xl font-medium outline-none focus:ring-2 focus:ring-champion-blue"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      required
                      placeholder="rahul@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full pl-9 pr-3 py-2 border rounded-xl font-medium outline-none focus:ring-2 focus:ring-champion-blue"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">Phone Number</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                    <input
                      type="tel"
                      required
                      placeholder="+91 98765 43210"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full pl-9 pr-3 py-2 border rounded-xl font-medium outline-none focus:ring-2 focus:ring-champion-blue"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Tender & Tax Breakdown */}
            <div className="space-y-4 border-t border-gray-100 pt-6">
              <label className="text-xs font-black uppercase text-gray-600 tracking-wider">
                4. Payment Tender & Digital Tax Invoice
              </label>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                {/* Tender Method Selector */}
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, paymentMethod: 'UPI' })}
                      className={`p-3 rounded-2xl border text-center transition-all ${
                        formData.paymentMethod === 'UPI'
                          ? 'border-champion-blue bg-blue-50 text-champion-blue font-bold shadow-sm'
                          : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <Smartphone className="w-5 h-5 mx-auto mb-1" />
                      <span className="text-xs">UPI / QR</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, paymentMethod: 'CARD' })}
                      className={`p-3 rounded-2xl border text-center transition-all ${
                        formData.paymentMethod === 'CARD'
                          ? 'border-champion-blue bg-blue-50 text-champion-blue font-bold shadow-sm'
                          : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <CreditCard className="w-5 h-5 mx-auto mb-1" />
                      <span className="text-xs">Card</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, paymentMethod: 'CASH' })}
                      className={`p-3 rounded-2xl border text-center transition-all ${
                        formData.paymentMethod === 'CASH'
                          ? 'border-champion-blue bg-blue-50 text-champion-blue font-bold shadow-sm'
                          : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <Banknote className="w-5 h-5 mx-auto mb-1" />
                      <span className="text-xs">Cash at Desk</span>
                    </button>
                  </div>

                  {formData.paymentMethod === 'UPI' && (
                    <div className="p-3 bg-blue-50/60 border border-blue-200 rounded-xl flex items-center space-x-3 text-xs text-blue-900">
                      <QrCode className="w-8 h-8 text-champion-blue flex-shrink-0" />
                      <div>
                        <div className="font-bold">Instant UPI Settlement</div>
                        <div className="text-[11px] text-blue-700">Scan & pay via any UPI app (GPay, PhonePe, Paytm).</div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Tax Invoice Summary Box */}
                <div className="bg-gray-50 rounded-2xl border border-gray-200 p-5 space-y-2.5 text-xs">
                  <div className="font-black uppercase tracking-wider text-gray-700 pb-2 border-b flex justify-between items-center">
                    <span>Tax Invoice Summary</span>
                    <span className="text-[10px] text-gray-400 font-mono">SAC: 999691</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>{selectedSport.name} (60 Mins)</span>
                    <span className="font-bold">₹{basePrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-500 text-[11px]">
                    <span>CGST (9%)</span>
                    <span>₹{(gstAmount / 2).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-500 text-[11px]">
                    <span>SGST (9%)</span>
                    <span>₹{(gstAmount / 2).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-base font-black text-gray-900 pt-2 border-t">
                    <span>Total Amount Payable:</span>
                    <span className="text-champion-blue">₹{totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Submission Section */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center space-x-2 text-xs text-gray-500">
                <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Instant automated booking & digital tax invoice generation.</span>
              </div>

              <Button
                type="submit"
                variant="primary"
                disabled={loading}
                className="w-full sm:w-auto px-8 py-3.5 text-xs font-bold shadow-xl"
              >
                {loading ? 'Processing Payment & Invoice...' : `Pay ₹${totalAmount.toFixed(2)} & Reserve`}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Universal Downloadable Tax Invoice Modal */}
      {invoiceModalData && (
        <TaxInvoiceModal
          invoice={invoiceModalData}
          onClose={() => setInvoiceModalData(null)}
          title="Guest Session Tax Invoice & Receipt"
        />
      )}
    </div>
  );
};
