import React, { useState, useEffect } from 'react';
import CorporateProfileView from './CorporateProfileView';
import { Plus, Building, Search } from 'lucide-react';

const API_BASE_URL = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ? 'http://localhost:5000'
  : 'https://northomes.onrender.com';

export default function CorporateSettingsTab() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/corporate-accounts`);
      const data = await res.json();
      if (data.success) {
        setAccounts(data.accounts || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleSaveAccount = (account) => {
    setSelectedAccount(null);
    setIsCreatingNew(false);
    fetchAccounts();
  };

  const filteredAccounts = accounts.filter(a => 
    a.company_name?.toLowerCase().includes(search.toLowerCase()) || 
    a.account_number?.toLowerCase().includes(search.toLowerCase())
  );

  const fmtCurrency = (n) => `₱${(Number(n) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  if (selectedAccount || isCreatingNew) {
    return (
      <CorporateProfileView 
        account={selectedAccount} 
        isNewAccount={isCreatingNew}
        onBack={() => { setSelectedAccount(null); setIsCreatingNew(false); }}
        onSave={handleSaveAccount}
      />
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white/[0.03] border border-black/5 rounded-2xl p-8">
        
        <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h3 className="text-sm font-black text-[#000000]/87 uppercase tracking-[0.2em]">Corporate Accounts</h3>
            <p className="text-black/60 text-xs mt-1">Manage B2B partners, view ledgers, and set credit limits.</p>
          </div>
          <button
            onClick={() => setIsCreatingNew(true)}
            className="flex items-center gap-2 bg-[#00754A] hover:bg-[#006241] text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-all hover:-translate-y-0.5"
          >
            <Plus size={16} strokeWidth={3} />
            New Corporate Account
          </button>
        </div>

        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-black/30" size={16} />
            <input 
              type="text" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search companies or account numbers..." 
              className="w-full pl-11 pr-4 py-3 bg-white shadow-sm border border-black/5 rounded-xl text-black/80 text-sm focus:border-[#00754A]/50 outline-none transition-all placeholder:text-black/30 font-medium"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-black/40 text-sm font-medium">Loading corporate accounts...</div>
        ) : filteredAccounts.length === 0 ? (
          <div className="text-center py-16 bg-white/50 border border-black/5 rounded-2xl">
            <Building className="mx-auto text-black/20 mb-3" size={32} />
            <p className="text-black/60 font-medium text-sm">No corporate accounts found.</p>
            {search && <p className="text-black/40 text-xs mt-1">Try adjusting your search terms.</p>}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredAccounts.map(account => {
              const initials = account.company_name ? account.company_name.substring(0, 2).toUpperCase() : 'CO';
              return (
                <div 
                  key={account.id} 
                  onClick={() => setSelectedAccount(account)}
                  className="bg-white border border-black/5 rounded-2xl p-5 hover:border-[#00754A]/30 hover:shadow-md transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-[#E8F5E9] text-[#2E7D32] flex items-center justify-center font-black text-[15px] shrink-0">
                      {initials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-black/80 truncate text-[15px] group-hover:text-[#00754A] transition-colors">{account.company_name}</div>
                      <div className="text-xs font-semibold text-black/40 mt-0.5">{account.account_number}</div>
                    </div>
                  </div>
                  <div className="bg-gray-50/50 rounded-xl p-3 border border-black/5 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-black/50 font-medium">Credit Limit</span>
                      <span className="text-black/80 font-bold">{fmtCurrency(account.credit_limit)}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-black/50 font-medium">Balance</span>
                      <span className={`font-black ${Number(account.balance) > 0 ? 'text-red-600' : 'text-emerald-600'}`}>{fmtCurrency(account.balance)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
