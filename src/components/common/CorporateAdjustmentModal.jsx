import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { X, AlertCircle, Check, SlidersHorizontal } from 'lucide-react';
import { API_BASE_URL } from '../../utils/apiConfig';

const fmtCurrency = (n) => `₱${(Number(n) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function CorporateAdjustmentModal({ isOpen, onClose, account, onSuccess }) {
  const [direction, setDirection] = useState('credit');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [reference, setReference] = useState('');
  const [reason, setReason] = useState('');
  const [cashierName, setCashierName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const currentBalance = Number(account?.balance) || 0;

  useEffect(() => {
    if (isOpen && account) {
      setDirection('credit');
      setAmount('');
      setDate(new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Manila' }));
      setReference('');
      setReason('');
      setCashierName(localStorage.getItem('adminFullName') || localStorage.getItem('adminUser') || 'Front Desk');
      setError('');
    }
  }, [isOpen, account]);

  if (!isOpen || !account) return null;

  const numAmount = parseFloat(amount) || 0;
  const newBalance = currentBalance + (direction === 'credit' ? -numAmount : numAmount);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (numAmount <= 0) return setError('Enter an amount greater than 0.');
    if (!reason.trim()) return setError('A reason is required.');
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE_URL}/api/corporate-accounts/${account.id}/adjustments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: numAmount,
          direction,
          date,
          reference: reference.trim(),
          reason: reason.trim(),
          cashier_name: cashierName.trim()
        })
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Failed to record adjustment.');
      if (onSuccess) onSuccess(data.account, data.ledgerEntry);
      onClose();
    } catch (err) {
      setError(err.message || 'Network error while recording adjustment.');
    } finally {
      setSubmitting(false);
    }
  };

  const inputCls = 'w-full px-3 py-2 border border-black/15 rounded-xl text-[13px] font-medium text-black/90 bg-white focus:border-[#005530] focus:ring-1 focus:ring-[#005530] outline-none transition-all';
  const labelCls = 'text-[11px] font-bold uppercase tracking-wider text-black/70';

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl border border-black/10 w-full max-w-lg overflow-hidden flex flex-col max-h-[92vh]" onClick={(e) => e.stopPropagation()}>
        <div className="px-6 py-4 bg-[#005530] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center"><SlidersHorizontal size={22} /></div>
            <div>
              <h2 className="text-[16px] font-black tracking-tight leading-tight">Ledger Adjustment</h2>
              <p className="text-[12px] font-medium text-white/80">{account.company_name} &bull; <span className="font-mono">{account.account_number}</span></p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-white/20 flex items-center justify-center text-white/80 hover:text-white"><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-[12px] font-bold rounded-xl flex items-center gap-2.5">
              <AlertCircle size={18} className="shrink-0" /><span>{error}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className={labelCls}>Type</label>
            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={() => setDirection('credit')}
                className={`px-3 py-2.5 rounded-xl border text-[12px] font-bold text-left ${direction === 'credit' ? 'border-emerald-600 bg-emerald-50 text-emerald-800' : 'border-black/15 text-black/70'}`}>
                Credit (reduce balance)
              </button>
              <button type="button" onClick={() => setDirection('debit')}
                className={`px-3 py-2.5 rounded-xl border text-[12px] font-bold text-left ${direction === 'debit' ? 'border-rose-600 bg-rose-50 text-rose-800' : 'border-black/15 text-black/70'}`}>
                Debit (increase balance)
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className={labelCls}>Amount (₱) <span className="text-red-500">*</span></label>
            <input type="number" step="0.01" min="0.01" required value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" className={inputCls} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className={labelCls}>Date <span className="text-red-500">*</span></label>
              <input type="date" required value={date} onChange={(e) => setDate(e.target.value)} className={inputCls} />
            </div>
            <div className="space-y-1.5">
              <label className={labelCls}>Reference (e.g. RES-517)</label>
              <input type="text" value={reference} onChange={(e) => setReference(e.target.value)} placeholder="RES-000" className={inputCls} />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className={labelCls}>Reason <span className="text-red-500">*</span></label>
            <input type="text" required value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Corporate rate discount applied after checkout" className={inputCls} />
          </div>

          <div className="space-y-1.5">
            <label className={labelCls}>Processed By</label>
            <input type="text" value={cashierName} onChange={(e) => setCashierName(e.target.value)} className={inputCls} />
          </div>

          <div className="p-3.5 bg-gray-50 rounded-xl border border-black/10 space-y-2 text-[12px]">
            <div className="flex justify-between text-black/60 font-medium"><span>Current Balance:</span><span className="font-bold text-black/80">{fmtCurrency(currentBalance)}</span></div>
            <div className="pt-2 border-t border-black/10 flex justify-between text-[13px]"><span className="font-bold text-black/80">Balance After:</span><span className="font-black text-black/90">{fmtCurrency(newBalance)}</span></div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button type="button" onClick={onClose} disabled={submitting} className="px-5 py-2.5 rounded-xl border border-black/10 text-[13px] font-bold text-black/70 hover:bg-gray-100">Cancel</button>
            <button type="submit" disabled={submitting || numAmount <= 0 || !reason.trim()} className="px-6 py-2.5 rounded-xl bg-[#005530] text-white text-[13px] font-bold hover:bg-[#004420] disabled:bg-[#005530]/40 disabled:cursor-not-allowed flex items-center gap-2">
              <Check size={16} strokeWidth={3} /><span>{submitting ? 'Posting...' : 'Post Adjustment'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}

