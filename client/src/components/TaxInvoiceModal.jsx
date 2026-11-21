import React, { useRef, useState } from 'react';
import { Download, Printer, X, CheckCircle, FileText, Loader2 } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Universal Tax Invoice Modal & True PDF Downloader
 * Compatible with Guest Bookings, Member Court Reservations, Shop Orders, and Café Bills.
 */
export const TaxInvoiceModal = ({ invoice, onClose, title = "Official Tax Invoice & Receipt" }) => {
  const invoiceRef = useRef(null);
  const [downloading, setDownloading] = useState(false);

  if (!invoice) return null;

  const invoiceNo = invoice.invoice_no || `INV-${new Date().getFullYear()}-0001`;
  const invoiceDate = invoice.created_at
    ? new Date(invoice.created_at).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : new Date().toLocaleDateString('en-IN');
  const customerName = invoice.full_name || invoice.customer_name || invoice.name || 'Guest Customer';
  const customerPhone = invoice.phone || 'N/A';
  const customerEmail = invoice.email || 'N/A';
  const subtotal = parseFloat(invoice.subtotal || invoice.fee_charged || invoice.total_amount || 0);
  const taxAmount = parseFloat(invoice.tax_amount || subtotal * 0.18 || 0);
  const totalAmount = parseFloat(invoice.total_amount || subtotal + taxAmount);
  const paymentMethod = invoice.payment_method || invoice.tender_method || 'UPI / Online';
  const txnRef = invoice.transaction_ref || invoice.reference_code || 'CONFIRMED';
  const description = invoice.description || (invoice.sport_interest ? `${invoice.sport_interest} Session Demo / Court Booking` : 'Club Service Booking');

  const handleDownloadPDF = async () => {
    if (!invoiceRef.current) return;
    setDownloading(true);
    try {
      // Capture element with html2canvas
      const element = invoiceRef.current;
      const canvas = await html2canvas(element, {
        scale: 2, // High resolution
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Tax_Invoice_${invoiceNo}.pdf`);
    } catch (err) {
      console.error('Failed to generate PDF:', err);
      // Fallback: direct window print
      window.print();
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 md:p-8 space-y-6 relative overflow-hidden max-h-[95vh] overflow-y-auto">
        {/* Dismiss Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-full p-1.5 transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* The Printable / PDF Canvas Element */}
        <div ref={invoiceRef} className="space-y-6 bg-white p-2">
          {/* Invoice Header */}
          <div className="flex justify-between items-start border-b pb-4 pr-8">
            <div>
              <div className="text-xl font-black uppercase text-champion-dark tracking-tight">
                Champions<span className="text-champion-red">Club</span>
              </div>
              <div className="text-[10px] text-gray-500 font-medium">Elite Sports Complex & Academy</div>
              <div className="text-[10px] text-gray-500 mt-0.5">GSTIN: 24AAACC1234F1Z5 • State: Gujarat (24)</div>
              <div className="text-[9px] text-gray-400">SAC Code: 999691 (Sports Services)</div>
            </div>
            <div className="text-right">
              <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-black px-2.5 py-1 rounded-full uppercase inline-flex items-center space-x-1">
                <CheckCircle className="w-3 h-3 text-emerald-600 inline" />
                <span>PAID IN FULL</span>
              </span>
              <div className="text-xs font-mono font-bold text-gray-900 mt-1.5">
                {invoiceNo}
              </div>
              <div className="text-[10px] text-gray-500">
                {invoiceDate}
              </div>
            </div>
          </div>

          {/* Customer & Session Info */}
          <div className="grid grid-cols-2 gap-4 text-xs bg-gray-50 p-3.5 rounded-xl border border-gray-100">
            <div>
              <span className="text-[10px] text-gray-400 font-bold uppercase block">Billed To (Customer)</span>
              <div className="font-bold text-gray-900 text-sm mt-0.5">{customerName}</div>
              <div className="text-gray-600">{customerPhone}</div>
              <div className="text-gray-600">{customerEmail}</div>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-gray-400 font-bold uppercase block">Session / Facility</span>
              <div className="font-bold text-gray-900 text-sm mt-0.5">{description}</div>
              {invoice.preferred_date && (
                <div className="text-gray-600">
                  {invoice.preferred_date.slice(0, 10)} {invoice.preferred_time ? `at ${invoice.preferred_time.slice(0, 5)}` : ''}
                </div>
              )}
              {invoice.reference_code && (
                <div className="font-mono text-[10px] text-blue-700 font-bold mt-0.5">
                  Ref: {invoice.reference_code}
                </div>
              )}
            </div>
          </div>

          {/* Line Items */}
          <div className="border-t border-b py-3 space-y-2 text-xs">
            <div className="flex justify-between font-bold text-gray-800 pb-1 border-b border-gray-100">
              <span>Description</span>
              <span>Amount (INR)</span>
            </div>
            <div className="flex justify-between text-gray-700">
              <div>
                <span className="font-semibold">{description}</span>
                <span className="block text-[10px] text-gray-400">Court Access & Facility Fee</span>
              </div>
              <span className="font-mono font-semibold">₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-500 text-[11px]">
              <span>CGST (9%)</span>
              <span className="font-mono">₹{(taxAmount / 2).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-500 text-[11px]">
              <span>SGST (9%)</span>
              <span className="font-mono">₹{(taxAmount / 2).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm font-black text-gray-900 pt-2 border-t">
              <span>Grand Total (All Taxes Included)</span>
              <span className="text-red-600 font-mono">₹{totalAmount.toFixed(2)}</span>
            </div>
          </div>

          {/* Payment Footer */}
          <div className="text-[11px] text-gray-600 flex justify-between items-center bg-gray-50 p-2.5 rounded-xl border border-gray-100">
            <div>
              <span className="font-bold text-gray-700">Payment Mode:</span> {paymentMethod}
            </div>
            <div className="font-mono text-[10px] text-gray-600">
              Txn Ref: {txnRef}
            </div>
          </div>
        </div>

        {/* Actions: Download Invoice as PDF On Click + Print + Close */}
        <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
          <button
            type="button"
            disabled={downloading}
            onClick={handleDownloadPDF}
            className="flex-1 bg-red-600 hover:bg-red-700 active:bg-red-800 disabled:opacity-70 text-white font-extrabold text-xs py-3 px-4 rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer opacity-100"
          >
            {downloading ? (
              <>
                <Loader2 className="w-4 h-4 text-white animate-spin shrink-0" />
                <span className="text-white font-extrabold tracking-wide">Generating PDF...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4 text-white shrink-0" />
                <span className="text-white font-extrabold tracking-wide">Download PDF Invoice</span>
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs py-3 px-4 rounded-xl transition-colors flex items-center justify-center space-x-1.5 cursor-pointer opacity-100"
            title="Print or Save via System Dialog"
          >
            <Printer className="w-3.5 h-3.5 text-gray-700 shrink-0" />
            <span className="text-gray-800 font-bold">Print</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="border-2 border-gray-300 hover:border-gray-800 hover:bg-gray-50 text-gray-800 font-bold text-xs py-3 px-5 rounded-xl transition-colors cursor-pointer opacity-100"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
