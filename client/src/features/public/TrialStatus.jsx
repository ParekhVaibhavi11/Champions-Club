import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { trialService } from '../../services/trialService';
import {
  Search,
  CheckCircle,
  Clock,
  Calendar,
  MapPin,
  Trophy,
  AlertCircle,
  Phone,
  FileText,
  ChevronRight,
  CreditCard,
  UserCheck,
  Download,
} from 'lucide-react';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { TaxInvoiceModal } from '../../components/TaxInvoiceModal';

export const TrialStatus = () => {
  const [searchParams] = useSearchParams();
  const [referenceCode, setReferenceCode] = useState(searchParams.get('ref') || '');
  const [phone, setPhone] = useState(searchParams.get('phone') || '');
  const [trial, setTrial] = useState(null);
  const [invoiceModalData, setInvoiceModalData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchStatus = async (refCode, phoneVal) => {
    if (!refCode) return;
    setLoading(true);
    setError(null);
    try {
      const res = await trialService.getTrialStatus(refCode, phoneVal);
      const data = res.data || res;
      setTrial(data);
    } catch (err) {
      console.error(err);
      setError(err.message || 'No guest session found matching the provided reference code.');
      setTrial(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (referenceCode) {
      fetchStatus(referenceCode, phone);
    }
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchStatus(referenceCode, phone);
  };

  const handleOpenInvoice = async () => {
    try {
      const res = await trialService.getInvoice(trial.reference_code);
      setInvoiceModalData(res.data || res);
    } catch (err) {
      console.error(err);
    }
  };

  // 4-Stage Stepper: 1. BOOKED_PAID -> 2. COURT_ALLOCATED -> 3. CHECKED_IN -> 4. COMPLETED
  const getStepStatus = (stepIndex) => {
    if (!trial) return 'pending';
    const s = trial.status;
    if (stepIndex === 1) return 'completed'; // Always paid & booked upon creation
    if (stepIndex === 2) {
      if (s === 'CONFIRMED' || s === 'COMPLETED' || s === 'CONVERTED') return 'completed';
      return 'active';
    }
    if (stepIndex === 3) {
      if (s === 'COMPLETED' || s === 'CONVERTED') return 'completed';
      if (s === 'CONFIRMED') return 'active';
      return 'pending';
    }
    if (stepIndex === 4) {
      if (s === 'COMPLETED' || s === 'CONVERTED') return 'completed';
      return 'pending';
    }
    return 'pending';
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-16 animate-fade-in">
      <div>
        <Link
          to="/trial"
          className="inline-flex items-center space-x-2 text-xs font-bold text-gray-500 hover:text-champion-blue transition-colors"
        >
          <span>Book Another Session</span>
        </Link>
      </div>

      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 md:p-8 space-y-6">
        <div>
          <h1 className="text-2xl font-black text-champion-dark uppercase tracking-tight">
            Live Guest Session Tracker & Tax Invoice
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Track your real-time court allocation progress and download your official club tax invoice.
          </p>
        </div>

        {/* Search input */}
        <form onSubmit={handleSearch} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-gray-600 block mb-1">
                Booking Reference Code
              </label>
              <input
                type="text"
                required
                placeholder="e.g. GST-2026-B303A1"
                value={referenceCode}
                onChange={(e) => setReferenceCode(e.target.value.toUpperCase())}
                className="w-full px-3 py-2 border rounded-xl text-xs font-mono font-bold outline-none focus:ring-2 focus:ring-champion-blue uppercase"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-gray-600 block mb-1">
                Registered Phone Number
              </label>
              <input
                type="tel"
                placeholder="Last 4 digits or full phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-champion-blue"
              />
            </div>
          </div>

          <Button type="submit" variant="primary" disabled={loading} className="w-full text-xs py-2.5">
            {loading ? 'Locating Record...' : 'Track Session & Fetch Invoice'}
          </Button>
        </form>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl flex items-center space-x-2 text-xs">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {trial && (
          <div className="space-y-6 pt-2 animate-fade-in">
            {/* Visual 4-Stage Progress Tracker */}
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
              <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 block mb-4">
                Real-Time Session Stepper
              </span>

              <div className="grid grid-cols-4 gap-2 relative">
                {/* Step 1 */}
                <div className="text-center space-y-1.5">
                  <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto text-xs font-bold shadow-md">
                    ✓
                  </div>
                  <div className="text-[11px] font-bold text-gray-800">Booked & Paid</div>
                  <div className="text-[9px] text-gray-400">Invoice Generated</div>
                </div>

                {/* Step 2 */}
                <div className="text-center space-y-1.5">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto text-xs font-bold transition-all ${
                      getStepStatus(2) === 'completed'
                        ? 'bg-emerald-600 text-white'
                        : getStepStatus(2) === 'active'
                        ? 'bg-blue-600 text-white animate-pulse'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    2
                  </div>
                  <div className="text-[11px] font-bold text-gray-800">Court Allocated</div>
                  <div className="text-[9px] text-gray-400">
                    {trial.court_name ? trial.court_name : 'Assigning Slot'}
                  </div>
                </div>

                {/* Step 3 */}
                <div className="text-center space-y-1.5">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto text-xs font-bold transition-all ${
                      getStepStatus(3) === 'completed'
                        ? 'bg-emerald-600 text-white'
                        : getStepStatus(3) === 'active'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    3
                  </div>
                  <div className="text-[11px] font-bold text-gray-800">Reception Check-In</div>
                  <div className="text-[9px] text-gray-400">At Clubhouse Desk</div>
                </div>

                {/* Step 4 */}
                <div className="text-center space-y-1.5">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto text-xs font-bold transition-all ${
                      getStepStatus(4) === 'completed'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    4
                  </div>
                  <div className="text-[11px] font-bold text-gray-800">Match Played</div>
                  <div className="text-[9px] text-gray-400">Session Complete</div>
                </div>
              </div>
            </div>

            {/* Session Card with Invoice Trigger */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4 shadow-sm">
              <div className="flex justify-between items-start border-b pb-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    Candidate Record
                  </span>
                  <h3 className="text-xl font-black text-gray-900">{trial.full_name}</h3>
                  <div className="text-xs font-mono font-bold text-champion-blue mt-0.5">
                    {trial.reference_code} • Invoice #{trial.invoice_no}
                  </div>
                </div>
                <Badge variant={trial.status === 'CONFIRMED' ? 'success' : 'primary'}>
                  {trial.status}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="flex items-center space-x-2">
                  <Trophy className="w-4 h-4 text-champion-blue" />
                  <div>
                    <span className="text-gray-400 block text-[10px]">Sport</span>
                    <span className="font-bold text-gray-800">{trial.sport_interest}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-champion-blue" />
                  <div>
                    <span className="text-gray-400 block text-[10px]">Allocated Court</span>
                    <span className="font-bold text-gray-800">
                      {trial.court_name || 'Front Desk Allocating'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-champion-blue" />
                  <div>
                    <span className="text-gray-400 block text-[10px]">Session Date</span>
                    <span className="font-bold text-gray-800">{trial.preferred_date?.slice(0, 10)}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-champion-blue" />
                  <div>
                    <span className="text-gray-400 block text-[10px]">Time Slot</span>
                    <span className="font-bold text-gray-800">
                      {trial.preferred_time?.slice(0, 5)} (60 Mins)
                    </span>
                  </div>
                </div>
              </div>

              {/* View Tax Invoice Button */}
              <div className="pt-3 border-t flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={handleOpenInvoice}
                  className="flex-1 bg-gray-900 hover:bg-black text-white font-extrabold text-xs py-3 px-4 rounded-xl shadow transition-colors flex items-center justify-center space-x-2 cursor-pointer opacity-100"
                >
                  <Download className="w-4 h-4 text-yellow-300 shrink-0" />
                  <span className="text-white font-extrabold">Download / View Official Tax Invoice ({trial.invoice_no})</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Universal Downloadable Tax Invoice Modal */}
      {invoiceModalData && (
        <TaxInvoiceModal
          invoice={invoiceModalData}
          onClose={() => setInvoiceModalData(null)}
          title="Official Tax Invoice & Receipt"
        />
      )}
    </div>
  );
};
