import React, { useState, useEffect } from 'react';
import { Save, Check, AlertCircle } from 'lucide-react';

const API_BASE_URL = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ? 'http://localhost:5000'
  : 'https://northomes.onrender.com';

export default function PaymentOptionsTab({ hotelSettings, setHotelSettings }) {
  const [options, setOptions] = useState({
    gcash_enabled: false, gcash_name: '', gcash_number: '', gcash_instructions: '',
    paymaya_enabled: false, paymaya_name: '', paymaya_number: '', paymaya_instructions: '',
    bank_enabled: false, bank_name: '', bank_account_name: '', bank_account_number: '', bank_swift: '', bank_instructions: '',
    others_enabled: false, others_label: '', others_instructions: ''
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (hotelSettings?.payment_options) {
      try {
        const parsed = JSON.parse(hotelSettings.payment_options);
        setOptions(prev => ({ ...prev, ...parsed }));
      } catch (e) {
        console.error('Failed to parse payment options', e);
      }
    }
  }, [hotelSettings?.payment_options]);

  const handleChange = (field, value) => {
    setOptions(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    try {
      const updatedSettings = {
        ...hotelSettings,
        payment_options: JSON.stringify(options)
      };
      
      const res = await fetch(`${API_BASE_URL}/api/hotel-settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings: updatedSettings })
      });
      
      const data = await res.json();
      if (data.success) {
        setHotelSettings(updatedSettings);
        setMessage('Payment options saved successfully');
      } else {
        setMessage('Failed to save payment options');
      }
    } catch (e) {
      console.error(e);
      setMessage('Error saving payment options');
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white/[0.03] border border-black/5 rounded-2xl p-8">
        <div className="mb-8 border-b border-black/5 pb-6 flex justify-between items-end">
          <div>
            <h3 className="text-sm font-black text-[#000000]/87 uppercase tracking-[0.2em]">Payment Options</h3>
            <p className="text-black/60 text-xs mt-1">Configure the payment methods available to guests during online booking.</p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 bg-[#00754A] text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-sm hover:bg-[#006241] transition-all disabled:opacity-50"
          >
            {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <Save size={16} />}
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>

        {message && (
          <div className={`mb-6 flex items-center gap-2 p-4 rounded-xl text-sm font-bold ${message.includes('success') ? 'bg-[#00754A]/10 text-[#00754A]' : 'bg-red-500/10 text-red-600'}`}>
            {message.includes('success') ? <Check size={18} /> : <AlertCircle size={18} />}
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* GCash Settings */}
          <div className={`border rounded-2xl p-6 transition-colors ${options.gcash_enabled ? 'border-[#00754A]/30 bg-white/50' : 'border-black/5 bg-black/[0.02]'}`}>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-bold text-[#111] flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${options.gcash_enabled ? 'bg-[#00754A]' : 'bg-black/20'}`}></div>
                GCash
              </h4>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={options.gcash_enabled} onChange={(e) => handleChange('gcash_enabled', e.target.checked)} className="sr-only peer" />
                <div className="w-9 h-5 bg-black/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#00754A]"></div>
              </label>
            </div>
            {options.gcash_enabled && (
              <div className="space-y-4 mt-4 animate-in fade-in slide-in-from-top-2">
                <div>
                  <label className="block text-[10px] font-bold text-black/50 uppercase tracking-widest mb-1.5">Account Name</label>
                  <input type="text" value={options.gcash_name} onChange={(e) => handleChange('gcash_name', e.target.value)} className="w-full px-4 py-2.5 bg-white border border-black/10 rounded-xl text-sm focus:border-[#00754A] outline-none" placeholder="e.g. Juan dela Cruz" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-black/50 uppercase tracking-widest mb-1.5">GCash Number</label>
                  <input type="text" value={options.gcash_number} onChange={(e) => handleChange('gcash_number', e.target.value)} className="w-full px-4 py-2.5 bg-white border border-black/10 rounded-xl text-sm focus:border-[#00754A] outline-none" placeholder="e.g. 0912 345 6789" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-black/50 uppercase tracking-widest mb-1.5">Instructions for Guest</label>
                  <textarea value={options.gcash_instructions} onChange={(e) => handleChange('gcash_instructions', e.target.value)} rows={3} className="w-full px-4 py-2.5 bg-white border border-black/10 rounded-xl text-sm focus:border-[#00754A] outline-none resize-none" placeholder="Instructions..." />
                </div>
              </div>
            )}
          </div>

          {/* PayMaya Settings */}
          <div className={`border rounded-2xl p-6 transition-colors ${options.paymaya_enabled ? 'border-[#00754A]/30 bg-white/50' : 'border-black/5 bg-black/[0.02]'}`}>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-bold text-[#111] flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${options.paymaya_enabled ? 'bg-[#00754A]' : 'bg-black/20'}`}></div>
                Maya (PayMaya)
              </h4>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={options.paymaya_enabled} onChange={(e) => handleChange('paymaya_enabled', e.target.checked)} className="sr-only peer" />
                <div className="w-9 h-5 bg-black/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#00754A]"></div>
              </label>
            </div>
            {options.paymaya_enabled && (
              <div className="space-y-4 mt-4 animate-in fade-in slide-in-from-top-2">
                <div>
                  <label className="block text-[10px] font-bold text-black/50 uppercase tracking-widest mb-1.5">Account Name</label>
                  <input type="text" value={options.paymaya_name} onChange={(e) => handleChange('paymaya_name', e.target.value)} className="w-full px-4 py-2.5 bg-white border border-black/10 rounded-xl text-sm focus:border-[#00754A] outline-none" placeholder="e.g. Juan dela Cruz" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-black/50 uppercase tracking-widest mb-1.5">Maya Number</label>
                  <input type="text" value={options.paymaya_number} onChange={(e) => handleChange('paymaya_number', e.target.value)} className="w-full px-4 py-2.5 bg-white border border-black/10 rounded-xl text-sm focus:border-[#00754A] outline-none" placeholder="e.g. 0912 345 6789" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-black/50 uppercase tracking-widest mb-1.5">Instructions for Guest</label>
                  <textarea value={options.paymaya_instructions} onChange={(e) => handleChange('paymaya_instructions', e.target.value)} rows={3} className="w-full px-4 py-2.5 bg-white border border-black/10 rounded-xl text-sm focus:border-[#00754A] outline-none resize-none" placeholder="Instructions..." />
                </div>
              </div>
            )}
          </div>

          {/* Bank Transfer Settings */}
          <div className={`border rounded-2xl p-6 transition-colors ${options.bank_enabled ? 'border-[#00754A]/30 bg-white/50' : 'border-black/5 bg-black/[0.02]'}`}>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-bold text-[#111] flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${options.bank_enabled ? 'bg-[#00754A]' : 'bg-black/20'}`}></div>
                Bank Transfer
              </h4>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={options.bank_enabled} onChange={(e) => handleChange('bank_enabled', e.target.checked)} className="sr-only peer" />
                <div className="w-9 h-5 bg-black/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#00754A]"></div>
              </label>
            </div>
            {options.bank_enabled && (
              <div className="space-y-4 mt-4 animate-in fade-in slide-in-from-top-2">
                <div>
                  <label className="block text-[10px] font-bold text-black/50 uppercase tracking-widest mb-1.5">Bank Name</label>
                  <input type="text" value={options.bank_name} onChange={(e) => handleChange('bank_name', e.target.value)} className="w-full px-4 py-2.5 bg-white border border-black/10 rounded-xl text-sm focus:border-[#00754A] outline-none" placeholder="e.g. BDO, BPI" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-black/50 uppercase tracking-widest mb-1.5">Account Name</label>
                  <input type="text" value={options.bank_account_name} onChange={(e) => handleChange('bank_account_name', e.target.value)} className="w-full px-4 py-2.5 bg-white border border-black/10 rounded-xl text-sm focus:border-[#00754A] outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-black/50 uppercase tracking-widest mb-1.5">Account Number</label>
                  <input type="text" value={options.bank_account_number} onChange={(e) => handleChange('bank_account_number', e.target.value)} className="w-full px-4 py-2.5 bg-white border border-black/10 rounded-xl text-sm focus:border-[#00754A] outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-black/50 uppercase tracking-widest mb-1.5">SWIFT Code</label>
                  <input type="text" value={options.bank_swift} onChange={(e) => handleChange('bank_swift', e.target.value)} className="w-full px-4 py-2.5 bg-white border border-black/10 rounded-xl text-sm focus:border-[#00754A] outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-black/50 uppercase tracking-widest mb-1.5">Instructions</label>
                  <textarea value={options.bank_instructions} onChange={(e) => handleChange('bank_instructions', e.target.value)} rows={2} className="w-full px-4 py-2.5 bg-white border border-black/10 rounded-xl text-sm focus:border-[#00754A] outline-none resize-none" />
                </div>
              </div>
            )}
          </div>

          {/* Others / Cash Settings */}
          <div className={`border rounded-2xl p-6 transition-colors ${options.others_enabled ? 'border-[#00754A]/30 bg-white/50' : 'border-black/5 bg-black/[0.02]'}`}>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-bold text-[#111] flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${options.others_enabled ? 'bg-[#00754A]' : 'bg-black/20'}`}></div>
                Other Options (e.g. Cash)
              </h4>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={options.others_enabled} onChange={(e) => handleChange('others_enabled', e.target.checked)} className="sr-only peer" />
                <div className="w-9 h-5 bg-black/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#00754A]"></div>
              </label>
            </div>
            {options.others_enabled && (
              <div className="space-y-4 mt-4 animate-in fade-in slide-in-from-top-2">
                <div>
                  <label className="block text-[10px] font-bold text-black/50 uppercase tracking-widest mb-1.5">Option Label</label>
                  <input type="text" value={options.others_label} onChange={(e) => handleChange('others_label', e.target.value)} className="w-full px-4 py-2.5 bg-white border border-black/10 rounded-xl text-sm focus:border-[#00754A] outline-none" placeholder="e.g. Cash on Arrival" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-black/50 uppercase tracking-widest mb-1.5">Instructions</label>
                  <textarea value={options.others_instructions} onChange={(e) => handleChange('others_instructions', e.target.value)} rows={3} className="w-full px-4 py-2.5 bg-white border border-black/10 rounded-xl text-sm focus:border-[#00754A] outline-none resize-none" />
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
