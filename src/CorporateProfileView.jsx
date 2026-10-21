import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import SignaturePadModal from './components/common/SignaturePadModal';
import RecordCorporatePaymentModal from './components/common/RecordCorporatePaymentModal';

import { API_BASE_URL } from './utils/apiConfig';

export default function CorporateProfileView({ account, isNewAccount, onBack, onSave, onUpdateAccount }) {
  const [activeTab, setActiveTab] = useState('Profile');
  const [isEditing, setIsEditing] = useState(isNewAccount);
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);
  const [isSigning, setIsSigning] = useState(false);
  const [signatureData, setSignatureData] = useState(null);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [ledger, setLedger] = useState([]);
  const [loadingLedger, setLoadingLedger] = useState(false);
  const [accountData, setAccountData] = useState(account || {});
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  useEffect(() => {
    if (account) {
      setAccountData(account);
      setFormData({
        account_number: account.account_number || '',
        company_name: account.company_name || '',
        contact_person: account.contact_person || '',
        contact_email: account.contact_email || '',
        contact_phone: account.contact_phone || '',
        credit_limit: account.credit_limit || 0
      });

      if (!isNewAccount && account.id) {
        fetchLedger(account.id);
      }
    }
  }, [account, isNewAccount]);

  const handlePaymentSuccess = (updatedAcc, ledgerEntry) => {
    setAccountData(updatedAcc);
    setFormData(prev => ({ ...prev, credit_limit: updatedAcc.credit_limit }));
    setSuccessMsg(`Payment of ₱${(Number(ledgerEntry.credit) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} recorded successfully!`);
    if (account?.id) {
      fetchLedger(account.id);
    }
    if (onUpdateAccount) {
      onUpdateAccount(updatedAcc);
    }
  };

  const fetchLedger = async (id) => {
    setLoadingLedger(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/corporate-accounts/${id}/ledger`);
      const data = await res.json();
      if (data.success) {
        setLedger(data.ledger);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingLedger(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this corporate account?')) return;
    
    setSaving(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/corporate-accounts/${account.id}`, {
        method: 'DELETE'
      });
      const data = await response.json();
      if (data.success) {
        if (onSave) onSave(null);
      } else {
        setError(data.message || 'Failed to delete account.');
        setSaving(false);
      }
    } catch (err) {
      console.error(err);
      setError('Network error. Failed to connect to server.');
      setSaving(false);
    }
  };

  const handleSave = async () => {
    if (!formData.company_name?.trim() || !formData.account_number?.trim()) {
      setError('Company Name and Account Number are required.');
      return;
    }

    setSaving(true);
    setError('');
    setSuccessMsg('');

    try {
      const url = isNewAccount 
        ? `${API_BASE_URL}/api/corporate-accounts` 
        : `${API_BASE_URL}/api/corporate-accounts/${account.id}`;
      
      const method = isNewAccount ? 'POST' : 'PUT';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      if (data.success) {
        setSuccessMsg(data.message || 'Account saved successfully!');
        setIsEditing(false);
        if (onSave) {
          onSave(data.account);
        }
      } else {
        setError(data.message || 'Failed to save account.');
      }
    } catch (err) {
      console.error(err);
      setError('Network error. Failed to connect to server.');
    } finally {
      setSaving(false);
    }
  };

  const fmtDate = (d) => {
    if (!d) return '—';
    if (typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d)) {
      const [y, m, day] = d.split('-').map(Number);
      return new Date(y, m - 1, day).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
    const dt = new Date(d);
    return isNaN(dt.getTime()) ? '—' : dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };
  const fmtCurrency = (n) => `₱${(Number(n) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const printInvoice = () => {
    const acc = accountData || account;
    if (!acc) return;
    
    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(acc.id).padStart(4, '0')}`;
    const today = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    
    let totalChargesSum = 0;
    let totalDiscountSum = 0;
    let totalBalanceSum = 0;

    const ledgerRows = ledger.map(entry => {
      const rowGuestName = entry.guest_name || (entry.description && entry.description.includes('Guest Checkout Transfer') ? entry.description.replace(/^Guest Checkout Transfer:\s*/i, '') : '');
      const actualCheckInDate = entry.check_in_date || entry.date;

      const isTransferDesc = entry.description && /^Guest Checkout Transfer/i.test(entry.description);
      const cleanDescription = isTransferDesc ? '' : (entry.description || '');

      const isReservation = Boolean(entry.room_type || (entry.reference && entry.reference.startsWith('RES-')));

      let roomTypeStr = '—';
      let nightsStr = '—';
      let roomRateStr = '—';
      let chargesStr = '—';
      let discountStr = '—';
      let balanceStr = '—';

      if (isReservation) {
        const rawRoomType = entry.room_type || (entry.room_number ? `Room ${entry.room_number}` : 'Standard');
        roomTypeStr = rawRoomType.replace(/\s+Room$/i, '');

        const nights = Number(entry.nights) || 1;
        nightsStr = String(nights);

        const roomRate = Number(entry.room_rate) || (entry.debit && nights ? Number(entry.debit) / nights : 0);
        roomRateStr = roomRate > 0 ? fmtCurrency(roomRate) : '—';

        const baseRoomCharge = nights * roomRate;
        let charges = Number(entry.folio_charges) || 0;
        if (charges <= 0 && baseRoomCharge > 0) {
          charges = baseRoomCharge;
        }
        if (charges <= 0) {
          charges = Number(entry.debit) || 0;
        }

        let discount = (Number(entry.folio_discounts) || 0) + (Number(entry.guest_payments) || 0);
        if (discount <= 0 && charges > Number(entry.debit) && Number(entry.debit) > 0) {
          discount = charges - Number(entry.debit);
        }

        const rowBalance = Number(entry.debit) > 0 ? Number(entry.debit) : Math.max(0, charges - discount);

        chargesStr = fmtCurrency(charges);
        discountStr = discount > 0 ? fmtCurrency(discount) : '—';
        balanceStr = fmtCurrency(rowBalance);

        totalChargesSum += charges;
        totalDiscountSum += discount;
        totalBalanceSum += rowBalance;
      } else {
        const debit = Number(entry.debit) || 0;
        const credit = Number(entry.credit) || 0;
        if (debit > 0) {
          chargesStr = fmtCurrency(debit);
          balanceStr = fmtCurrency(debit);
          totalChargesSum += debit;
          totalBalanceSum += debit;
        }
        if (credit > 0) {
          discountStr = fmtCurrency(credit);
          balanceStr = `-${fmtCurrency(credit)}`;
          totalDiscountSum += credit;
          totalBalanceSum -= credit;
        }
      }

      return `
        <tr>
          <td>${fmtDate(actualCheckInDate)}</td>
          <td>
            <div style="font-weight:bold;">${entry.reference}</div>
            ${cleanDescription ? `<div style="color:#666;font-size:11px;">${cleanDescription}</div>` : ''}
            ${rowGuestName ? `<div style="color:#333;font-size:11px;font-weight:600;margin-top:2px;">Guest: ${rowGuestName}</div>` : ''}
          </td>
          <td>${roomTypeStr}</td>
          <td style="text-align:center;">${nightsStr}</td>
          <td style="text-align:right;">${roomRateStr}</td>
          <td style="text-align:right;font-weight:600;">${chargesStr}</td>
          <td style="text-align:right;color:#005530;font-weight:600;">${discountStr}</td>
          <td style="text-align:right;font-weight:bold;">${balanceStr}</td>
        </tr>
      `;
    }).join('');

    const win = window.open('', '_blank', 'width=850,height=900');
    win.document.write(`<!DOCTYPE html><html><head><title>Statement of Account - ${account.company_name}</title>
      <style>
        body { font-family: 'Inter', Arial, sans-serif; max-width: 800px; margin: 40px auto; padding: 0 32px; color: #111; }
        .header { display: flex; justify-content: space-between; border-bottom: 2px solid #005530; padding-bottom: 20px; margin-bottom: 30px; align-items: flex-start; }
        .header h1 { margin: 0; color: #005530; font-size: 24px; font-weight: 900; letter-spacing: 0.5px; }
        .invoice-details { text-align: right; }
        .invoice-details h2 { margin: 0; font-size: 20px; color: #333; letter-spacing: 1px; text-transform: uppercase; font-weight: 800; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 40px; }
        .info-block h3 { margin: 0 0 8px 0; font-size: 11px; text-transform: uppercase; color: #888; letter-spacing: 1px; }
        .info-block p { margin: 3px 0; font-size: 13.5px; font-weight: 500; }
        table { width: 100%; border-collapse: collapse; font-size: 12.5px; margin-bottom: 30px; }
        th { background: #f4f6f5; color: #111111; font-weight: 800; padding: 10px 8px; text-align: left; font-size: 11px; text-transform: uppercase; border-top: 1px solid #005530; border-bottom: 2px solid #005530; letter-spacing: 0.3px; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        td { padding: 10px 8px; border-bottom: 1px solid #eaeaea; vertical-align: middle; }
        .summary-box { background: #f8f9fa; padding: 20px; border-radius: 8px; border: 1px solid #eaeaea; text-align: right; margin-left: auto; width: 320px; }
        .summary-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 13px; }
        .summary-total { display: flex; justify-content: space-between; margin-top: 12px; padding-top: 12px; border-top: 2px solid #eaeaea; font-size: 18px; font-weight: 900; }
        .footer { margin-top: 60px; text-align: center; font-size: 11px; color: #888; border-top: 1px solid #eaeaea; padding-top: 20px; }
        @media print {
          th {
            color: #000000 !important;
            font-weight: 800 !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      </style>
    </head><body>
      <div class="header">
        <div>
          <h1>NORTHOMES PENSIONE</h1>
          <p style="margin: 6px 0 0; font-size: 12px; font-weight: 600; color: #444; text-transform: uppercase; letter-spacing: 0.3px;">PELAEZ STREET, BOGO CITY, CEBU, PH 6010</p>
          <p style="margin: 3px 0 0; font-size: 12px; color: #555;">TEL. NO.: 0917-1323715 &middot; email: bogonorthomes@gmail.com</p>
        </div>
        <div class="invoice-details">
          <h2>STATEMENT OF ACCOUNT</h2>
          <p style="margin: 8px 0 0; font-size: 13px; font-weight: bold;">#${invoiceNumber}</p>
          <p style="margin: 4px 0 0; font-size: 13px; color: #666;">Date: ${today}</p>
        </div>
      </div>
      
      <div class="info-grid">
        <div class="info-block">
          <h3>Billed To</h3>
          <p style="font-weight: 800; font-size: 15px;">${account.company_name}</p>
          <p>Account #: ${account.account_number}</p>
          <p>Attn: ${account.contact_person || 'Accounts Payable'}</p>
          ${account.contact_email ? `<p>${account.contact_email}</p>` : ''}
        </div>
        <div class="info-block" style="text-align: right;">
          <h3>Payment Terms</h3>
          <p>Due on Receipt</p>
        </div>
      </div>

      <table>
        <thead>
          <tr style="background:#f4f6f5;">
            <th style="width:11%;text-align:left;color:#111;font-weight:800;">Check-in Date</th>
            <th style="width:17%;text-align:left;color:#111;font-weight:800;">Description / Ref</th>
            <th style="width:14%;text-align:left;color:#111;font-weight:800;">Room Type</th>
            <th style="width:6%;text-align:center;color:#111;font-weight:800;">Nights</th>
            <th style="width:12%;text-align:right;color:#111;font-weight:800;">Room Rate</th>
            <th style="width:13%;text-align:right;color:#111;font-weight:800;">Charges</th>
            <th style="width:13%;text-align:right;color:#111;font-weight:800;">Credit / Discount</th>
            <th style="width:14%;text-align:right;color:#111;font-weight:800;">Balance</th>
          </tr>
        </thead>
        <tbody>
          ${ledger.length > 0 ? ledgerRows : '<tr><td colspan="8" style="text-align:center;color:#888;">No transactions recorded.</td></tr>'}
        </tbody>
        ${ledger.length > 0 ? `
          <tfoot>
            <tr style="background:#f4f7f5;font-weight:bold;border-top:2px solid #005530;">
              <td colspan="5" style="text-align:right;text-transform:uppercase;font-size:11px;color:#111;font-weight:800;padding:10px 8px;">Total:</td>
              <td style="text-align:right;padding:10px 8px;font-weight:800;color:#111;">${fmtCurrency(totalChargesSum)}</td>
              <td style="text-align:right;color:#005530;padding:10px 8px;font-weight:800;">${fmtCurrency(totalDiscountSum)}</td>
              <td style="text-align:right;color:#111;padding:10px 8px;font-size:13px;font-weight:900;">${fmtCurrency(totalBalanceSum)}</td>
            </tr>
          </tfoot>
        ` : ''}
      </table>

      <div class="summary-box">
        <div class="summary-row">
          <span>Total Charges:</span>
          <span style="font-weight:bold;">${fmtCurrency(totalChargesSum)}</span>
        </div>
        ${totalDiscountSum > 0 ? `
          <div class="summary-row" style="color:#005530;">
            <span>Total Credit / Discount:</span>
            <span style="font-weight:bold;">-${fmtCurrency(totalDiscountSum)}</span>
          </div>
        ` : ''}
        <div class="summary-total">
          <span>Amount Due:</span>
          <span style="color: ${Number(account.balance) > 0 ? '#dc2626' : '#16a34a'};">${fmtCurrency(account.balance)}</span>
        </div>
      </div>

      <div style="margin-top: 80px; display: flex; justify-content: space-between; padding: 0 20px;">
        <div style="width: 250px; text-align: center;">
          <div style="border-bottom: 1px solid #333; margin-bottom: 8px; height: 40px;"></div>
          <div style="font-size: 12px; font-weight: bold; text-transform: uppercase;">Prepared By</div>
        </div>
        <div style="width: 250px; text-align: center;">
          <div style="border-bottom: 1px solid #333; margin-bottom: 8px; height: 60px; display: flex; align-items: flex-end; justify-content: center;">
            ${signatureData ? `<img src="${signatureData}" style="max-height: 50px; max-width: 100%; object-fit: contain;" />` : ''}
          </div>
          <div style="font-size: 12px; font-weight: bold; text-transform: uppercase;">Received By</div>
        </div>
      </div>

      <div class="footer">
        Please make all checks payable to Northomes Pensione.<br/>
        If you have any questions concerning this invoice, contact our billing department.
      </div>
      <script>
        setTimeout(() => { window.print(); }, 500);
      </script>
    </body></html>`);
    win.document.close();
  };

  const getInitialsColor = (name) => {
    const colors = ['bg-[#E8F5E9] text-[#2E7D32]', 'bg-[#E3F2FD] text-[#1565C0]', 'bg-[#FFF3E0] text-[#E65100]', 'bg-[#FCE4EC] text-[#C2185B]', 'bg-[#F3E5F5] text-[#6A1B9A]'];
    const idx = (name || '').charCodeAt(0) % colors.length;
    return colors[idx] || colors[0];
  };

  const initials = formData.company_name ? formData.company_name.substring(0, 2).toUpperCase() : 'CO';

  const renderField = (label, name, type = 'text', required = false) => {
    const value = formData[name] !== undefined ? formData[name] : '';

    if (!isEditing) {
      let displayVal = value || '—';
      if (name === 'credit_limit') displayVal = fmtCurrency(value);
      return (
        <div className="flex flex-col pb-2">
          <label className="text-[11px] font-bold text-black/40 mb-1">{label}</label>
          <div className="text-[13px] font-semibold text-black/80 min-h-[20px] tracking-tight">{displayVal}</div>
        </div>
      );
    }

    return (
      <div className="flex flex-col">
        <label className="text-[11px] font-bold text-black/60 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <input type={type} name={name} value={value} onChange={handleChange} placeholder={`Enter ${label.toLowerCase()}`} required={required} className="w-full px-2 py-1.5 border border-black/10 rounded-md text-[13px] outline-none focus:border-[#005530] focus:ring-1 focus:ring-[#005530] bg-white font-medium text-black/80 placeholder-black/30 shadow-sm" />
      </div>
    );
  };

  return ReactDOM.createPortal(
    <div style={{ position: 'fixed', top: 0, left: '120px', right: 0, bottom: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden', zIndex: 9999, background: '#f8f9fa' }}>
      
      {/* Header Bar */}
      <div className="px-8 py-5 border-b border-black/5 bg-white shrink-0 flex items-center justify-between">
        <div className="flex items-center gap-2 text-[13px] font-medium text-black/60">
          <span className="hover:text-black cursor-pointer transition-colors" onClick={onBack}>Corporate Accounts</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
          <span className="text-black font-black">{isEditing ? (isNewAccount ? 'New Corporate Account' : 'Edit Corporate Account') : 'Corporate Account Profile'}</span>
        </div>
        <div className="flex items-center gap-3">
          {isEditing ? (
            <>
              {!isNewAccount && (
                <button 
                  onClick={() => setIsEditing(false)} 
                  className="px-5 py-2 border border-black/10 rounded-md text-[13px] font-bold text-black/80 hover:bg-gray-50 shadow-sm transition-colors"
                >
                  Cancel
                </button>
              )}
              {isNewAccount && (
                <button 
                  onClick={onBack} 
                  className="px-5 py-2 border border-black/10 rounded-md text-[13px] font-bold text-black/80 hover:bg-gray-50 shadow-sm transition-colors"
                >
                  Cancel
                </button>
              )}
              <button 
                onClick={handleSave} 
                disabled={saving} 
                className="px-5 py-2 bg-[#005530] text-white hover:bg-[#004420] disabled:bg-[#005530]/50 rounded-md text-[13px] font-bold shadow-sm transition-colors"
              >
                {saving ? 'Saving...' : 'Save Account'}
              </button>
            </>
          ) : (
            <>
              <button 
                onClick={handleDelete} 
                className="px-5 py-2 border border-red-200 bg-red-50 text-red-700 rounded-md text-[13px] font-bold hover:bg-red-100 shadow-sm transition-colors"
              >
                Delete
              </button>
              <button 
                onClick={() => setIsSigning(true)}
                className={`flex items-center gap-2 px-5 py-2 border ${signatureData ? 'border-[#005530] bg-[#005530]/5 text-[#005530]' : 'border-black/10 bg-white text-black/80 hover:bg-gray-50'} rounded-md text-[13px] font-bold shadow-sm transition-colors`}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 12v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-6"/><path d="M14 6l-8 8-4 4 4-4 8-8 4 4"/></svg>
                {signatureData ? 'Signature Saved' : 'Sign Statement'}
              </button>
              <button 
                onClick={printInvoice}
                className="flex items-center gap-2 px-5 py-2 border border-black/10 rounded-md text-[13px] font-bold text-black/80 hover:bg-gray-50 shadow-sm transition-colors bg-white"
                title="Print Statement of Account (SOA)"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2M6 14h12v6H6z"/></svg>
                Print SOA
              </button>
              <button 
                onClick={() => setIsPaymentModalOpen(true)}
                className="flex items-center gap-2 px-5 py-2 bg-[#005530] text-white hover:bg-[#004420] rounded-md text-[13px] font-bold shadow-sm transition-colors"
                title="Record payment received for this account"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
                Record Payment
              </button>
              <button 
                onClick={() => setIsEditing(true)} 
                className="px-5 py-2 border border-black/10 rounded-md text-[13px] font-bold text-black/80 hover:bg-gray-50 shadow-sm transition-colors"
              >
                Edit Account
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Content Scrollable Area */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-[1500px] mx-auto space-y-6">

          {error && (
            <div className="p-4 bg-rose-50 border border-rose-100 text-rose-700 text-[13px] font-semibold rounded-xl flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
              {error}
            </div>
          )}

          {successMsg && (
            <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-700 text-[13px] font-semibold rounded-xl flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
              {successMsg}
            </div>
          )}
          
          <div className="flex gap-3">
            
            {/* Left Column (Main Info & Form) */}
            <div className="flex-1 space-y-6">
              
              {/* Top Identity Card */}
              <div className="bg-white rounded-xl shadow-sm border border-black/5 p-4 relative">
                <div className="flex items-center gap-2">
                  <div className={`w-[72px] h-[72px] rounded-full flex items-center justify-center font-black text-[24px] ${getInitialsColor(formData.company_name)}`}>
                    {initials}
                  </div>
                  <div>
                    <div className="flex flex-col">
                      <h1 className="text-[26px] font-black tracking-tight text-black/90">{formData.company_name || 'New Company'}</h1>
                      <span className="text-[12px] font-bold text-black/50">{formData.account_number || 'No Account Number'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Horizontal Tabs */}
              <div className="border-b border-black/10 flex items-center gap-2 text-[13px] font-bold text-black/50 px-2 mt-4">
                {['Profile'].map(tab => (
                  <div 
                    key={tab}
                    onClick={() => !isEditing && setActiveTab(tab)}
                    className={`pb-3 border-b-2 cursor-pointer transition-colors ${activeTab === tab ? 'border-[#005530] text-[#005530]' : 'border-transparent hover:text-black'} ${isEditing ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {tab}
                  </div>
                ))}
              </div>

              {/* Tab Contents */}
              {activeTab === 'Profile' && (
                <div className="space-y-6">
                  {/* 1. COMPANY INFORMATION */}
                  <div className="bg-white rounded-xl shadow-sm border border-black/5 p-4 space-y-5">
                    <h3 className="text-[14px] font-black text-black/85 tracking-tight border-b border-black/5 pb-2 uppercase">Company Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {renderField('Company Name', 'company_name', 'text', true)}
                      {renderField('Account Number', 'account_number', 'text', true)}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      {renderField('Contact Person', 'contact_person', 'text')}
                      {renderField('Email Address', 'contact_email', 'email')}
                      {renderField('Phone Number', 'contact_phone', 'tel')}
                    </div>
                  </div>

                  {/* 2. FINANCIAL INFORMATION */}
                  <div className="bg-white rounded-xl shadow-sm border border-black/5 p-4 space-y-5">
                    <h3 className="text-[14px] font-black text-black/85 tracking-tight border-b border-black/5 pb-2 uppercase">Financial Terms</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {renderField('Credit Limit (₱)', 'credit_limit', 'number')}
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Right Column (Ledger) */}
            {!isNewAccount && (
              <div className="w-[450px] shrink-0 space-y-6">
                
                {/* Account Summary */}
                <div className="bg-white rounded-xl shadow-sm border border-black/5 overflow-hidden">
                  <div className="px-5 py-4 border-b border-black/5 flex items-center justify-between">
                    <h3 className="text-[14px] font-black text-black/90 tracking-tight">Financial Summary</h3>
                    {Number(accountData.balance) > 0 && (
                      <span className="text-[10px] font-black bg-rose-50 text-rose-700 px-2 py-0.5 rounded-full border border-rose-200">
                        Payment Due
                      </span>
                    )}
                  </div>
                  <div className="p-3 space-y-3 bg-[#f8f9fa]">
                    <div className="flex items-center justify-between text-[13px]">
                      <span className="text-black/60 font-medium">Credit Limit</span>
                      <span className="font-bold text-black/90">{fmtCurrency(accountData.credit_limit)}</span>
                    </div>
                    <div className="flex items-center justify-between text-[13px]">
                      <span className="text-black/60 font-medium">Available Credit</span>
                      <span className="font-bold text-emerald-600">
                        {fmtCurrency((accountData.credit_limit || 0) - (accountData.balance || 0))}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[15px] pt-3 border-t border-black/10">
                      <span className="text-black/80 font-black">Outstanding Balance</span>
                      <span className={`font-black ${Number(accountData.balance) > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                        {fmtCurrency(accountData.balance)}
                      </span>
                    </div>
                    {Number(accountData.balance) > 0 && (
                      <button
                        onClick={() => setIsPaymentModalOpen(true)}
                        className="w-full mt-2 py-2 bg-[#005530] hover:bg-[#004420] text-white rounded-lg text-[12px] font-bold shadow-sm transition-all flex items-center justify-center gap-1.5"
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
                        Record Payment
                      </button>
                    )}
                  </div>
                </div>

                {/* Ledger History */}
                <div className="bg-white rounded-xl shadow-sm border border-black/5 flex flex-col h-[500px]">
                  <div className="px-5 py-4 border-b border-black/5 flex items-center justify-between shrink-0">
                    <h3 className="text-[14px] font-black text-black/90 tracking-tight">Corporate Ledger</h3>
                    <button 
                      onClick={() => setIsPaymentModalOpen(true)}
                      className="text-[12px] font-bold text-[#005530] hover:underline flex items-center gap-1"
                    >
                      + Record Payment
                    </button>
                  </div>
                  <div className="flex-1 overflow-y-auto">
                    {loadingLedger ? (
                      <div className="p-4 text-center text-black/40 font-medium text-[12px]">Loading ledger...</div>
                    ) : ledger.length === 0 ? (
                      <div className="p-4 text-center text-black/40 font-medium text-[12px]">No ledger entries recorded yet.</div>
                    ) : (
                      <table className="w-full text-[12px] text-left text-black/80">
                        <thead className="bg-gray-50 text-[10px] font-bold text-black/40 uppercase sticky top-0 border-b border-black/5 shadow-sm">
                          <tr>
                            <th className="px-4 py-2">Check-in Date</th>
                            <th className="px-4 py-2">Ref / Desc</th>
                            <th className="px-4 py-2 text-right">Debit</th>
                            <th className="px-4 py-2 text-right">Credit</th>
                            <th className="px-4 py-2 text-right">Balance</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-black/5">
                          {ledger.map((entry, idx) => {
                            const rowGuest = entry.guest_name || (entry.description && entry.description.includes('Guest Checkout Transfer') ? entry.description.replace(/^Guest Checkout Transfer:\s*/i, '') : '');
                            const isTransfer = entry.description && /^Guest Checkout Transfer/i.test(entry.description);
                            const desc = isTransfer ? (rowGuest ? `Guest: ${rowGuest}` : '') : entry.description;

                            return (
                              <tr key={idx} className="hover:bg-gray-50/50">
                                <td className="px-4 py-3 font-semibold whitespace-nowrap">{fmtDate(entry.check_in_date || entry.date)}</td>
                                <td className="px-4 py-3">
                                  <div className="font-bold">{entry.reference}</div>
                                  {desc && <div className="text-[10px] text-black/50 mt-0.5 line-clamp-2" title={desc}>{desc}</div>}
                                </td>
                                <td className="px-4 py-3 text-right text-red-600 font-medium">{Number(entry.debit) > 0 ? fmtCurrency(entry.debit) : ''}</td>
                                <td className="px-4 py-3 text-right text-emerald-600 font-medium">{Number(entry.credit) > 0 ? fmtCurrency(entry.credit) : ''}</td>
                                <td className="px-4 py-3 text-right font-bold text-black/90">{fmtCurrency(entry.balance)}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>

              </div>
            )}
          </div>
        </div>
      </div>
      <SignaturePadModal 
        isOpen={isSigning} 
        onClose={() => setIsSigning(false)} 
        onSave={(data) => setSignatureData(data)} 
      />
      <RecordCorporatePaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        account={accountData}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </div>,
    document.body
  );
}
