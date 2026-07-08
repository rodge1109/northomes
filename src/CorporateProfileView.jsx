import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import SignaturePadModal from './components/common/SignaturePadModal';

const API_BASE_URL = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ? 'http://localhost:5000'
  : 'https://northomes.onrender.com';

export default function CorporateProfileView({ account, isNewAccount, onBack, onSave }) {
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

  useEffect(() => {
    if (account) {
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

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';
  const fmtCurrency = (n) => `₱${(Number(n) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const printInvoice = () => {
    if (!account) return;
    
    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(account.id).padStart(4, '0')}`;
    const today = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    
    const ledgerRows = ledger.map(entry => {
      return `
        <tr>
          <td>${fmtDate(entry.date)}</td>
          <td>
            <div style="font-weight:bold;">${entry.reference}</div>
            <div style="color:#666;font-size:11px;">${entry.description || ''}</div>
          </td>
          <td style="text-align:right;color:#dc2626;">${Number(entry.debit) > 0 ? fmtCurrency(entry.debit) : ''}</td>
          <td style="text-align:right;color:#16a34a;">${Number(entry.credit) > 0 ? fmtCurrency(entry.credit) : ''}</td>
          <td style="text-align:right;font-weight:bold;">${fmtCurrency(entry.balance)}</td>
        </tr>
      `;
    }).join('');

    const win = window.open('', '_blank', 'width=800,height=900');
    win.document.write(`<!DOCTYPE html><html><head><title>Corporate Invoice - ${account.company_name}</title>
      <style>
        body { font-family: 'Inter', Arial, sans-serif; max-width: 720px; margin: 40px auto; padding: 0 32px; color: #111; }
        .header { display: flex; justify-content: space-between; border-bottom: 2px solid #005530; padding-bottom: 20px; margin-bottom: 30px; }
        .header h1 { margin: 0; color: #005530; font-size: 32px; font-weight: 900; letter-spacing: -1px; }
        .invoice-details { text-align: right; }
        .invoice-details h2 { margin: 0; font-size: 24px; color: #666; letter-spacing: 2px; text-transform: uppercase; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 40px; }
        .info-block h3 { margin: 0 0 8px 0; font-size: 11px; text-transform: uppercase; color: #888; letter-spacing: 1px; }
        .info-block p { margin: 4px 0; font-size: 14px; font-weight: 500; }
        table { width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 30px; }
        th { background: #f8f9fa; padding: 10px 12px; text-align: left; font-size: 11px; text-transform: uppercase; color: #666; border-bottom: 2px solid #eaeaea; }
        td { padding: 12px; border-bottom: 1px solid #eaeaea; vertical-align: top; }
        .summary-box { background: #f8f9fa; padding: 20px; border-radius: 8px; border: 1px solid #eaeaea; text-align: right; margin-left: auto; width: 300px; }
        .summary-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 13px; }
        .summary-total { display: flex; justify-content: space-between; margin-top: 12px; padding-top: 12px; border-top: 2px solid #eaeaea; font-size: 18px; font-weight: 900; }
        .footer { margin-top: 60px; text-align: center; font-size: 11px; color: #888; border-top: 1px solid #eaeaea; padding-top: 20px; }
      </style>
    </head><body>
      <div class="header">
        <div>
          <h1>Northomes</h1>
          <p style="margin: 8px 0 0; font-size: 13px; color: #666;">Baguio City, Philippines<br/>billing@northomes.com</p>
        </div>
        <div class="invoice-details">
          <h2>INVOICE</h2>
          <p style="margin: 8px 0 0; font-size: 13px; font-weight: bold;">#${invoiceNumber}</p>
          <p style="margin: 4px 0 0; font-size: 13px; color: #666;">Date: ${today}</p>
        </div>
      </div>
      
      <div class="info-grid">
        <div class="info-block">
          <h3>Billed To</h3>
          <p style="font-weight: 800; font-size: 16px;">${account.company_name}</p>
          <p>Account #: ${account.account_number}</p>
          <p>Attn: ${account.contact_person || 'Accounts Payable'}</p>
          <p>${account.contact_email || ''}</p>
        </div>
        <div class="info-block" style="text-align: right;">
          <h3>Payment Terms</h3>
          <p>Due on Receipt</p>
          <h3 style="margin-top: 16px;">Credit Limit</h3>
          <p>${fmtCurrency(account.credit_limit)}</p>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th style="width:15%;">Date</th>
            <th style="width:35%;">Description</th>
            <th style="width:15%;text-align:right;">Debit</th>
            <th style="width:15%;text-align:right;">Credit</th>
            <th style="width:20%;text-align:right;">Balance</th>
          </tr>
        </thead>
        <tbody>
          ${ledger.length > 0 ? ledgerRows : '<tr><td colspan="5" style="text-align:center;color:#888;">No transactions recorded.</td></tr>'}
        </tbody>
      </table>

      <div class="summary-box">
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
          <div style="font-size: 12px; font-weight: bold; text-transform: uppercase;">Guest / Authorized Signatory</div>
        </div>
      </div>

      <div class="footer">
        Please make all checks payable to Northomes Management.<br/>
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
        <label className="text-[11px] font-bold text-black/60 mb-1.5">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <input type={type} name={name} value={value} onChange={handleChange} placeholder={`Enter ${label.toLowerCase()}`} required={required} className="w-full px-3 py-2 border border-black/10 rounded-lg text-[13px] outline-none focus:border-[#005530] focus:ring-1 focus:ring-[#005530] bg-white font-medium text-black/80 placeholder-black/30 shadow-sm" />
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
                  className="px-5 py-2 border border-black/10 rounded-lg text-[13px] font-bold text-black/80 hover:bg-gray-50 shadow-sm transition-colors"
                >
                  Cancel
                </button>
              )}
              {isNewAccount && (
                <button 
                  onClick={onBack} 
                  className="px-5 py-2 border border-black/10 rounded-lg text-[13px] font-bold text-black/80 hover:bg-gray-50 shadow-sm transition-colors"
                >
                  Cancel
                </button>
              )}
              <button 
                onClick={handleSave} 
                disabled={saving} 
                className="px-5 py-2 bg-[#005530] text-white hover:bg-[#004420] disabled:bg-[#005530]/50 rounded-lg text-[13px] font-bold shadow-sm transition-colors"
              >
                {saving ? 'Saving...' : 'Save Account'}
              </button>
            </>
          ) : (
            <>
              <button 
                onClick={handleDelete} 
                className="px-5 py-2 border border-red-200 bg-red-50 text-red-700 rounded-lg text-[13px] font-bold hover:bg-red-100 shadow-sm transition-colors"
              >
                Delete
              </button>
              {ledger.length > 0 && (
                <>
                  <button 
                    onClick={() => setIsSigning(true)}
                    className={`flex items-center gap-2 px-5 py-2 border ${signatureData ? 'border-[#005530] bg-[#005530]/5 text-[#005530]' : 'border-black/10 bg-white text-black/80 hover:bg-gray-50'} rounded-lg text-[13px] font-bold shadow-sm transition-colors`}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 12v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-6"/><path d="M14 6l-8 8-4 4 4-4 8-8 4 4"/></svg>
                    {signatureData ? 'Signature Saved' : 'Sign Invoice'}
                  </button>
                  <button 
                    onClick={printInvoice}
                  className="flex items-center gap-2 px-5 py-2 border border-black/10 rounded-lg text-[13px] font-bold text-black/80 hover:bg-gray-50 shadow-sm transition-colors bg-white"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2M6 14h12v6H6z"/></svg>
                  Print Invoice
                </button>
                </>
              )}
              <button 
                onClick={() => setIsEditing(true)} 
                className="px-5 py-2 border border-black/10 rounded-lg text-[13px] font-bold text-black/80 hover:bg-gray-50 shadow-sm transition-colors"
              >
                Edit Account
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Content Scrollable Area */}
      <div className="flex-1 overflow-y-auto p-8">
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
          
          <div className="flex gap-6">
            
            {/* Left Column (Main Info & Form) */}
            <div className="flex-1 space-y-6">
              
              {/* Top Identity Card */}
              <div className="bg-white rounded-2xl shadow-sm border border-black/5 p-6 relative">
                <div className="flex items-center gap-4">
                  <div className={`w-[72px] h-[72px] rounded-full flex items-center justify-center font-black text-[24px] ${getInitialsColor(formData.company_name)}`}>
                    {initials}
                  </div>
                  <div>
                    <div className="flex flex-col">
                      <h1 className="text-[26px] font-black tracking-tight text-black/90">{formData.company_name || 'New Company'}</h1>
                      <span className="text-sm font-bold text-black/50">{formData.account_number || 'No Account Number'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Horizontal Tabs */}
              <div className="border-b border-black/10 flex items-center gap-8 text-[13px] font-bold text-black/50 px-2 mt-4">
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
                  <div className="bg-white rounded-2xl shadow-sm border border-black/5 p-6 space-y-5">
                    <h3 className="text-[14px] font-black text-black/85 tracking-tight border-b border-black/5 pb-2 uppercase">Company Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {renderField('Company Name', 'company_name', 'text', true)}
                      {renderField('Account Number', 'account_number', 'text', true)}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {renderField('Contact Person', 'contact_person', 'text')}
                      {renderField('Email Address', 'contact_email', 'email')}
                      {renderField('Phone Number', 'contact_phone', 'tel')}
                    </div>
                  </div>

                  {/* 2. FINANCIAL INFORMATION */}
                  <div className="bg-white rounded-2xl shadow-sm border border-black/5 p-6 space-y-5">
                    <h3 className="text-[14px] font-black text-black/85 tracking-tight border-b border-black/5 pb-2 uppercase">Financial Terms</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <div className="bg-white rounded-2xl shadow-sm border border-black/5 overflow-hidden">
                  <div className="px-5 py-4 border-b border-black/5">
                    <h3 className="text-[14px] font-black text-black/90 tracking-tight">Financial Summary</h3>
                  </div>
                  <div className="p-5 space-y-3 bg-[#f8f9fa]">
                    <div className="flex items-center justify-between text-[13px]">
                      <span className="text-black/60 font-medium">Credit Limit</span>
                      <span className="font-bold text-black/90">{fmtCurrency(account.credit_limit)}</span>
                    </div>
                    <div className="flex items-center justify-between text-[13px]">
                      <span className="text-black/60 font-medium">Available Credit</span>
                      <span className="font-bold text-emerald-600">
                        {fmtCurrency((account.credit_limit || 0) - (account.balance || 0))}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[15px] pt-3 border-t border-black/10">
                      <span className="text-black/80 font-black">Outstanding Balance</span>
                      <span className={`font-black ${Number(account.balance) > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                        {fmtCurrency(account.balance)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Ledger History */}
                <div className="bg-white rounded-2xl shadow-sm border border-black/5 flex flex-col h-[500px]">
                  <div className="px-5 py-4 border-b border-black/5 flex items-center justify-between shrink-0">
                    <h3 className="text-[14px] font-black text-black/90 tracking-tight">Corporate Ledger</h3>
                  </div>
                  <div className="flex-1 overflow-y-auto">
                    {loadingLedger ? (
                      <div className="p-8 text-center text-black/40 font-medium text-sm">Loading ledger...</div>
                    ) : ledger.length === 0 ? (
                      <div className="p-8 text-center text-black/40 font-medium text-sm">No ledger entries recorded yet.</div>
                    ) : (
                      <table className="w-full text-[12px] text-left text-black/80">
                        <thead className="bg-gray-50 text-[10px] font-bold text-black/40 uppercase sticky top-0 border-b border-black/5 shadow-sm">
                          <tr>
                            <th className="px-4 py-2">Date</th>
                            <th className="px-4 py-2">Ref / Desc</th>
                            <th className="px-4 py-2 text-right">Debit</th>
                            <th className="px-4 py-2 text-right">Credit</th>
                            <th className="px-4 py-2 text-right">Balance</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-black/5">
                          {ledger.map((entry, idx) => (
                            <tr key={idx} className="hover:bg-gray-50/50">
                              <td className="px-4 py-3 font-semibold whitespace-nowrap">{fmtDate(entry.date)}</td>
                              <td className="px-4 py-3">
                                <div className="font-bold">{entry.reference}</div>
                                <div className="text-[10px] text-black/50 mt-0.5 line-clamp-2" title={entry.description}>{entry.description}</div>
                              </td>
                              <td className="px-4 py-3 text-right text-red-600 font-medium">{Number(entry.debit) > 0 ? fmtCurrency(entry.debit) : ''}</td>
                              <td className="px-4 py-3 text-right text-emerald-600 font-medium">{Number(entry.credit) > 0 ? fmtCurrency(entry.credit) : ''}</td>
                              <td className="px-4 py-3 text-right font-bold text-black/90">{fmtCurrency(entry.balance)}</td>
                            </tr>
                          ))}
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
    </div>,
    document.body
  );
}
