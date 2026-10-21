import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { X, CreditCard, Calendar, Check, AlertCircle, Building2, Receipt, ArrowRight, ShieldCheck } from 'lucide-react';
import { API_BASE_URL } from '../../utils/apiConfig';

export default function RecordCorporatePaymentModal({ isOpen, onClose, account, onPaymentSuccess }) {
  const [amount, setAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Bank Transfer');
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');
  const [cashierName, setCashierName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const currentBalance = Number(account?.balance) || 0;
  const creditLimit = Number(account?.credit_limit) || 0;

  useEffect(() => {
    if (isOpen && account) {
      const todayStr = new Date().toISOString().split('T')[0];
      setPaymentDate(todayStr);
      setAmount(currentBalance > 0 ? String(currentBalance) : '');
      setPaymentMethod('Bank Transfer');
      setReference('');
      setNotes('');
      const loggedUser = localStorage.getItem('adminFullName') || localStorage.getItem('adminUser') || 'Front Desk';
      setCashierName(loggedUser);
      setError('');
    }
  }, [isOpen, account, currentBalance]);

  if (!isOpen || !account) return null;

  const numAmount = parseFloat(amount) || 0;
  const remainingBalance = Math.max(0, currentBalance - numAmount);
  const newAvailableCredit = (creditLimit - remainingBalance);

  const fmtCurrency = (n) => `₱${(Number(n) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (numAmount <= 0) {
      setError('Please enter a valid payment amount greater than 0.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const res = await fetch(`${API_BASE_URL}/api/corporate-accounts/${account.id}/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: numAmount,
          payment_method: paymentMethod,
          reference: reference.trim(),
          date: paymentDate,
          notes: notes.trim(),
          cashier_name: cashierName.trim()
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to record corporate payment.');
      }

      if (onPaymentSuccess) {
        onPaymentSuccess(data.account, data.ledgerEntry);
      }
      onClose();
    } catch (err) {
      console.error(err);
      setError(err.message || 'Network error while recording payment.');
    } finally {
      setSubmitting(false);
    }
  };

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-black/10 w-full max-w-lg overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-[#005530] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white">
              <Receipt size={22} />
            </div>
            <div>
              <h2 className="text-[16px] font-black tracking-tight text-white leading-tight">Record Corporate Payment</h2>
              <p className="text-[12px] font-medium text-white/80">
                {account.company_name} &bull; <span className="font-mono text-white/90">{account.account_number}</span>
              </p>
            </div>
          </div>
          <button 
            type="button" 
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-white/20 flex items-center justify-center text-white/80 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-[12px] font-bold rounded-xl flex items-center gap-2.5">
              <AlertCircle size={18} className="shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Account Snapshot Summary Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl border border-rose-100 bg-rose-50/60 flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700/70">Outstanding Balance</span>
              <span className="text-[17px] font-black text-rose-700 mt-0.5">{fmtCurrency(currentBalance)}</span>
            </div>
            <div className="p-3.5 rounded-xl border border-emerald-100 bg-emerald-50/60 flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700/70">Credit Limit</span>
              <span className="text-[17px] font-black text-emerald-800 mt-0.5">{fmtCurrency(creditLimit)}</span>
            </div>
          </div>

          {/* Payment Amount */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold uppercase tracking-wider text-black/70">
                Payment Amount (₱) <span className="text-red-500">*</span>
              </label>
              {currentBalance > 0 && numAmount !== currentBalance && (
                <button
                  type="button"
                  onClick={() => setAmount(String(currentBalance))}
                  className="text-[11px] font-bold text-[#005530] hover:underline"
                >
                  Pay Full ({fmtCurrency(currentBalance)})
                </button>
              )}
            </div>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-black text-[16px] text-black/40">₱</span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-black/15 rounded-xl text-[16px] font-black text-black/90 focus:bg-white focus:border-[#005530] focus:ring-1 focus:ring-[#005530] outline-none transition-all"
              />
            </div>
          </div>

          {/* Payment Date & Method Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-black/70">
                Payment Date <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  required
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  className="w-full px-3 py-2 border border-black/15 rounded-xl text-[13px] font-medium text-black/90 bg-white focus:border-[#005530] focus:ring-1 focus:ring-[#005530] outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-black/70">
                Payment Method <span className="text-red-500">*</span>
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-3 py-2 border border-black/15 rounded-xl text-[13px] font-semibold text-black/90 bg-white focus:border-[#005530] focus:ring-1 focus:ring-[#005530] outline-none transition-all cursor-pointer"
              >
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Cheque">Cheque</option>
                <option value="Cash">Cash</option>
                <option value="GCash">GCash</option>
                <option value="PayMaya">PayMaya</option>
                <option value="Credit Card">Credit Card</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {/* Reference # & Processed By */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-black/70">
                Reference / Cheque / OR #
              </label>
              <input
                type="text"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="e.g. OR-10928, CHK-4412"
                className="w-full px-3 py-2 border border-black/15 rounded-xl text-[13px] font-medium text-black/90 bg-white focus:border-[#005530] focus:ring-1 focus:ring-[#005530] outline-none transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-black/70">
                Processed By (Cashier)
              </label>
              <input
                type="text"
                value={cashierName}
                onChange={(e) => setCashierName(e.target.value)}
                placeholder="Front Desk / Cashier"
                className="w-full px-3 py-2 border border-black/15 rounded-xl text-[13px] font-medium text-black/90 bg-white focus:border-[#005530] focus:ring-1 focus:ring-[#005530] outline-none transition-all"
              />
            </div>
          </div>

          {/* Particulars / Notes */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-black/70">
              Notes / Particulars
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Settle reservations for Sept 2026 stays"
              className="w-full px-3 py-2 border border-black/15 rounded-xl text-[13px] font-medium text-black/90 bg-white focus:border-[#005530] focus:ring-1 focus:ring-[#005530] outline-none transition-all"
            />
          </div>

          {/* Live Calculation Preview Card */}
          <div className="p-3.5 bg-gray-50 rounded-xl border border-black/10 space-y-2">
            <div className="flex items-center justify-between text-[12px] text-black/60 font-medium">
              <span>Current Outstanding:</span>
              <span className="font-bold text-black/80">{fmtCurrency(currentBalance)}</span>
            </div>
            <div className="flex items-center justify-between text-[12px] text-emerald-700 font-medium">
              <span>Payment Credit:</span>
              <span className="font-bold">- {fmtCurrency(numAmount)}</span>
            </div>
            <div className="pt-2 border-t border-black/10 flex items-center justify-between text-[13px]">
              <span className="font-bold text-black/80">Remaining Balance:</span>
              <span className={`font-black ${remainingBalance === 0 ? 'text-emerald-700' : 'text-black/90'}`}>
                {fmtCurrency(remainingBalance)}
                {remainingBalance === 0 && <span className="ml-1 text-[11px] font-bold text-emerald-600 bg-emerald-100/70 px-1.5 py-0.5 rounded">Settled</span>}
              </span>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-2 flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl border border-black/10 text-[13px] font-bold text-black/70 hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || numAmount <= 0}
              className="px-6 py-2.5 rounded-xl bg-[#005530] text-white text-[13px] font-bold hover:bg-[#004420] disabled:bg-[#005530]/40 disabled:cursor-not-allowed shadow-sm transition-all flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Recording Payment...</span>
                </>
              ) : (
                <>
                  <Check size={16} strokeWidth={3} />
                  <span>Confirm & Post Payment</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
