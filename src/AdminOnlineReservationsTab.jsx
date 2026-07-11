import React, { useState, useMemo } from 'react';

export default function AdminOnlineReservationsTab({ reservations = [], stats = {}, updateStatus, openWizard, roomTypes = [], rateCodes = [], promos = [] }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All Status');
  const [filterChannel, setFilterChannel] = useState('All Channels');
  const [openDropdown, setOpenDropdown] = useState(null);

  // Helpers
  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';
  const fmtDateTime = (d) => d ? new Date(d).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' }) : '—';
  
  const getNights = (d1, d2) => {
    if (!d1 || !d2) return 1;
    const n = Math.round((new Date(d2) - new Date(d1)) / 86400000);
    return n > 0 ? n : 1;
  };

  const today = new Date().toISOString().split('T')[0];

  const getHint = (d) => {
    if (!d) return '';
    const diff = Math.round((new Date(d).setHours(0,0,0,0) - new Date().setHours(0,0,0,0)) / 86400000);
    if (diff === 0) return '(Today)';
    if (diff === 1) return '(Tomorrow)';
    if (diff > 1) return `(In ${diff} Days)`;
    if (diff < 0) return `(${Math.abs(diff)} Day${Math.abs(diff) > 1 ? 's' : ''} Overdue)`;
    return '';
  };

  const getStatusColor = (s) => {
    if (s === 'confirmed') return 'bg-emerald-50 text-emerald-600';
    if (s === 'pending') return 'bg-orange-50 text-orange-600';
    if (s === 'completed') return 'bg-blue-50 text-blue-600';
    if (s === 'cancelled') return 'bg-rose-50 text-rose-600';
    return 'bg-gray-50 text-gray-600';
  };

  // Derive display reservations
  const displayReservations = useMemo(() => {
    return reservations
      .filter(r => {
        const s = (r.status || '').toLowerCase();
        return s !== 'checked_in' && s !== 'checked_out' && s !== 'completed';
      })
      .filter(r => filterStatus === 'All Status' || r.status.toLowerCase() === filterStatus.toLowerCase())
      .filter(r => filterChannel === 'All Channels' || (r.source || 'Direct Website') === filterChannel)
      .filter(r => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return r.full_name?.toLowerCase().includes(q) || r.email?.toLowerCase().includes(q) || String(r.id).includes(q) || r.phone_number?.includes(q);
      })
      .map(r => {
        const rawCheckIn = r.check_in_date || r.preferred_date;
        let isNoShowWarning = false;
        try {
          if (rawCheckIn && (r.status === 'pending' || r.status === 'confirmed')) {
            const checkInStr = typeof rawCheckIn === 'string' ? rawCheckIn : new Date(rawCheckIn).toISOString();
            isNoShowWarning = checkInStr.slice(0,10) < today;
          }
        } catch (e) {
          console.error('Error calculating isNoShowWarning:', e, rawCheckIn);
        }
        
        return {
          originalRes: r,
          id: `ONL-${new Date(r.created_at || new Date()).toISOString().slice(2,10).replace(/-/g,'')}-${String(r.id).padStart(3, '0')}`,
          dbId: r.id,
          isNoShowWarning,
          booked: fmtDateTime(r.created_at),
          guest: r.full_name,
          email: r.email || r.phone_number,
          vip: false,
          channel: r.source || 'Direct Website',
          channelIcon: (r.source || 'Direct Website') === 'Direct Website' ? 'globe' : 'globe',
          room: r.room_type || r.service_name || 'Standard Room',
          ratePlan: 'Best Available Rate',
          checkIn: fmtDate(r.check_in_date || r.preferred_date),
          checkInHint: getHint(r.check_in_date || r.preferred_date),
          checkOut: fmtDate(r.check_out_date || r.preferred_date),
          nights: getNights(r.check_in_date || r.preferred_date, r.check_out_date || r.preferred_date),
          guests: r.number_of_guests ? `${r.number_of_guests} Guest(s)` : '1 Adult',
          status: r.status,
          statusColor: getStatusColor(r.status),
          total: (() => {
            const nights = getNights(r.check_in_date || r.preferred_date, r.check_out_date || r.preferred_date);
            const getRoomRate = (roomTypeName, rateCodeCode) => {
              // 1. Check rate codes (e.g. corp rates)
              if (rateCodeCode) {
                const matchedRc = rateCodes.find(rc => rc.code === rateCodeCode);
                if (matchedRc && matchedRc.prices) {
                  const priceObj = matchedRc.prices.find(p => p.room_type_name === roomTypeName);
                  if (priceObj && priceObj.price_per_night) {
                    return parseFloat(priceObj.price_per_night);
                  }
                }
                // 2. Check promos (e.g. promo code like 'PRM')
                const matchedPromo = promos.find(p => p.code === rateCodeCode);
                if (matchedPromo && matchedPromo.prices) {
                  const priceObj = matchedPromo.prices.find(p => p.room_type_name === roomTypeName);
                  if (priceObj && priceObj.price_per_night) {
                    return parseFloat(priceObj.price_per_night);
                  }
                }
              }
              // 3. Fall back to standard room type price
              const matched = roomTypes.find(rt => rt.name === roomTypeName);
              if (matched) return parseFloat(matched.price_per_night);
              // 4. Last-resort hardcoded fallbacks
              const type = (roomTypeName || '').toLowerCase();
              if (type.includes('presidential')) return 25000;
              if (type.includes('suite')) return 9000;
              if (type.includes('family')) return 6500;
              if (type.includes('deluxe')) return 4500;
              return 2500;
            };
            return `₱${(nights * getRoomRate(r.room_type || r.service_name || 'Standard Room', r.rate_code)).toLocaleString('en-US', {minimumFractionDigits: 2})}`;
          })()
        };
      });
  }, [reservations, searchQuery, filterStatus, filterChannel, roomTypes, rateCodes, promos]);

  const statsDerived = useMemo(() => {
    const total = displayReservations.length;
    const confirmed = displayReservations.filter(r => r.status === 'confirmed').length;
    const pending = displayReservations.filter(r => r.status === 'pending').length;
    
    // Estimate total revenue
    const totalRevenue = displayReservations.reduce((sum, r) => sum + parseFloat(r.total.replace(/[^0-9.-]+/g,"")), 0);
    return {
      total,
      confirmed,
      pending,
      awaiting: 0,
      totalRevenue: totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 }),
      confirmedPct: total ? ((confirmed / total) * 100).toFixed(1) : '0.0',
      pendingPct: total ? ((pending / total) * 100).toFixed(1) : '0.0',
    };
  }, [displayReservations]);

  const renderChannelIcon = (type) => {
    switch(type) {
      case 'globe': return <div className="w-5 h-5 rounded-full border border-gray-200 flex items-center justify-center bg-white"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg></div>;
      case 'booking': return <div className="w-5 h-5 rounded flex items-center justify-center bg-[#003580] text-white font-bold text-[10px]">B.</div>;
      case 'agoda': return <div className="w-5 h-5 rounded-full flex items-center justify-center bg-white border border-gray-100"><div className="flex gap-0.5"><div className="w-1.5 h-1.5 rounded-full bg-red-500"></div><div className="w-1.5 h-1.5 rounded-full bg-yellow-500"></div><div className="w-1.5 h-1.5 rounded-full bg-green-500"></div></div></div>;
      case 'expedia': return <div className="w-5 h-5 rounded-full flex items-center justify-center bg-[#FCE101]"><svg width="12" height="12" viewBox="0 0 24 24" fill="#00005C"><path d="M21.5 16v-2l-8-5V3.5c0-.8-.7-1.5-1.5-1.5s-1.5.7-1.5 1.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/></svg></div>;
      case 'airbnb': return <div className="w-5 h-5 flex items-center justify-center text-[#FF5A5F]"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 1.5c-1 0-1.8.3-2.6.9L1.6 8A2.8 2.8 0 000 10.3v8c0 2 1.6 3.7 3.6 3.7h16.8c2 0 3.6-1.6 3.6-3.6v-8c0-.8-.3-1.6-1-2.2l-8-5.8c-.8-.5-1.7-.8-2.6-.8l-.4-.1zM6.5 18C4 18 2 16 2 13.5v-3c0-.3.1-.6.3-.7L10 4.2c1.2-.8 2.8-.8 4 0L21.8 10c.2.2.3.4.3.7v3C22 16 20 18 17.5 18h-11zm5.5-2.2c2.1 0 3.8-1.7 3.8-3.8 0-2.1-1.7-3.8-3.8-3.8-2.1 0-3.8 1.7-3.8 3.8 0 2.1 1.7 3.8 3.8 3.8zm0-6.1c1.2 0 2.2 1 2.2 2.2 0 1.2-1 2.2-2.2 2.2-1.2 0-2.2-1-2.2-2.2 0-1.2 1-2.2 2.2-2.2z"/></svg></div>;
      case 'trip': return <div className="w-5 h-5 flex items-center justify-center bg-blue-600 text-white rounded font-bold text-[8px]">Trip</div>;
      default: return null;
    }
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: '120px', right: 0, bottom: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden', zIndex: 10, background: '#f8f9fa' }}>
      <div className="flex-1 flex flex-col min-h-0 border-t border-l border-black/5 overflow-hidden">
        
        {/* Header bar */}
        <div className="px-8 py-5 border-b border-black/5 bg-white shrink-0 flex items-center justify-between">
          <div>
            <h2 className="text-[#000000]/87 font-black text-[22px] tracking-tight leading-tight">Online Reservations</h2>
            <p className="text-black/60 text-[13px] mt-0.5 font-medium">View and manage all reservations made through your website and booking channels.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 bg-white border border-black/10 rounded-lg text-xs text-black shadow-sm cursor-pointer hover:bg-gray-50 font-medium">
              <span className="text-black/50 text-[10px] uppercase font-bold mr-1">Date Range</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-black/60"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              <span>{new Date().toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'})}</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="ml-1 text-black/40"><path d="M6 9l6 6 6-6"/></svg>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-[#005530] hover:bg-[#004420] text-white rounded-lg text-[13px] font-bold shadow-sm transition-colors">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.59-9.21l5.6 5.6"/></svg>
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8 flex flex-col">
          <div className="max-w-[1500px] mx-auto w-full h-full flex flex-col gap-6">

            {/* Top Stat Cards */}
            <div className="grid grid-cols-5 gap-4 shrink-0">
              <div className="bg-white rounded-xl border border-black/5 p-5 shadow-sm flex items-center justify-between">
                <div>
                  <h4 className="text-[10px] font-bold text-black/60 uppercase tracking-widest mb-1">TOTAL ONLINE RESERVATIONS</h4>
                  <div className="text-[28px] font-black leading-none mb-1">{statsDerived.total}</div>
                  <div className="text-[11px] font-medium text-black/40">This Period</div>
                </div>
                <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00754A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-black/5 p-5 shadow-sm flex items-center justify-between">
                <div>
                  <h4 className="text-[10px] font-bold text-black/60 uppercase tracking-widest mb-1">CONFIRMED</h4>
                  <div className="text-[28px] font-black leading-none mb-1">{statsDerived.confirmed}</div>
                  <div className="text-[12px] font-bold text-emerald-600">{statsDerived.confirmedPct}%</div>
                </div>
                <div className="w-12 h-12 rounded-full border-2 border-emerald-500 flex items-center justify-center">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-black/5 p-5 shadow-sm flex items-center justify-between">
                <div>
                  <h4 className="text-[10px] font-bold text-black/60 uppercase tracking-widest mb-1">PENDING</h4>
                  <div className="text-[28px] font-black leading-none mb-1">{statsDerived.pending}</div>
                  <div className="text-[12px] font-bold text-orange-500">{statsDerived.pendingPct}%</div>
                </div>
                <div className="w-12 h-12 rounded-full border-2 border-orange-400 flex items-center justify-center">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#F97316" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-black/5 p-5 shadow-sm flex items-center justify-between">
                <div>
                  <h4 className="text-[10px] font-bold text-black/60 uppercase tracking-widest mb-1">AWAITING PAYMENT</h4>
                  <div className="text-[28px] font-black leading-none mb-1">{statsDerived.awaiting}</div>
                  <div className="text-[12px] font-bold text-rose-500">0.0%</div>
                </div>
                <div className="w-12 h-12 rounded-full flex items-center justify-center">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#6366F1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-black/5 p-5 shadow-sm flex items-center justify-between">
                <div>
                  <h4 className="text-[10px] font-bold text-black/60 uppercase tracking-widest mb-1">TOTAL REVENUE</h4>
                  <div className="text-[22px] text-[#00005C] font-black leading-none mb-2">₱{statsDerived.totalRevenue}</div>
                  <div className="text-[11px] font-medium text-black/40">This Period</div>
                </div>
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M12 12h.01"/><path d="M16 12h.01"/><path d="M8 12h.01"/></svg>
                </div>
              </div>
            </div>

            {/* Main Table Card */}
            <div className="bg-white rounded-xl shadow-sm border border-black/5 flex-1 flex flex-col min-h-0">
              
              {/* Toolbar */}
              <div className="p-4 border-b border-black/5 flex items-center justify-between gap-4 shrink-0">
                <div className="flex items-center gap-3 flex-1">
                  <div className="relative w-[320px]">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-black/40" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                    </div>
                    <input type="text" placeholder="Search guest name, email, or confirmation no." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                      className="pl-9 pr-4 py-2 border border-black/10 rounded-lg text-[13px] w-full outline-none focus:border-[#00754A] focus:ring-1 focus:ring-[#00754A] bg-white font-medium text-black/80 placeholder-black/40" />
                  </div>
                  <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="border border-black/10 rounded-lg text-[13px] px-3 py-2 outline-none text-black/80 font-medium bg-white pr-8">
                    <option>All Status</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="pending">Pending</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                  <select value={filterChannel} onChange={e => setFilterChannel(e.target.value)} className="border border-black/10 rounded-lg text-[13px] px-3 py-2 outline-none text-black/80 font-medium bg-white pr-8">
                    <option>All Channels</option>
                    <option>Direct Website</option>
                  </select>
                  <button className="flex items-center gap-2 border border-black/10 rounded-lg text-[13px] px-4 py-2 font-medium text-black/80 hover:bg-gray-50">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
                    More Filters
                  </button>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 border border-black/10 rounded-lg text-[13px] font-medium text-black/80 hover:bg-gray-50">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                  Export
                </button>
              </div>

              {/* Table */}
              <div className="overflow-auto flex-1 bg-white relative">
                <table className="w-full text-left text-[12px] relative">
                  <thead className="sticky top-0 z-10">
                    <tr className="border-b border-black/5 bg-gray-50/95 backdrop-blur-sm">
                      <th className="px-5 py-4 w-10">
                        <input type="checkbox" className="rounded border-gray-300 text-[#00754A] focus:ring-[#00754A]" />
                      </th>
                      <th className="px-4 py-4 font-black uppercase tracking-widest text-[10px] text-black/60">CONFIRMATION NO.</th>
                      <th className="px-4 py-4 font-black uppercase tracking-widest text-[10px] text-black/60">GUEST</th>
                      <th className="px-4 py-4 font-black uppercase tracking-widest text-[10px] text-black/60">CHANNEL</th>
                      <th className="px-4 py-4 font-black uppercase tracking-widest text-[10px] text-black/60">ROOM / RATE PLAN</th>
                      <th className="px-4 py-4 font-black uppercase tracking-widest text-[10px] text-black/60">CHECK-IN</th>
                      <th className="px-4 py-4 font-black uppercase tracking-widest text-[10px] text-black/60">CHECK-OUT</th>
                      <th className="px-4 py-4 font-black uppercase tracking-widest text-[10px] text-black/60">NIGHTS</th>
                      <th className="px-4 py-4 font-black uppercase tracking-widest text-[10px] text-black/60">GUESTS</th>
                      <th className="px-4 py-4 font-black uppercase tracking-widest text-[10px] text-black/60">STATUS</th>
                      <th className="px-4 py-4 font-black uppercase tracking-widest text-[10px] text-black/60 text-right">TOTAL AMOUNT</th>
                      <th className="px-5 py-4 font-black uppercase tracking-widest text-[10px] text-black/60 text-center">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/5">
                    {displayReservations.length === 0 ? (
                      <tr><td colSpan="12" className="text-center py-8 text-black/50">No reservations found.</td></tr>
                    ) : displayReservations.map((res, i) => (
                      <tr key={res.dbId} className={`transition-colors ${res.isNoShowWarning ? 'bg-rose-50 hover:bg-rose-100/70 border-b border-rose-100' : 'hover:bg-gray-50/50'}`}>
                        <td className="px-5 py-4">
                          <input type="checkbox" className="rounded border-gray-300 text-[#00754A] focus:ring-[#00754A]" />
                        </td>
                        <td className="px-4 py-4 align-top">
                          <div className="font-bold text-[#00754A]">{res.id}</div>
                          <div className="text-[10px] text-black/40 mt-0.5">Booked: {res.booked}</div>
                        </td>
                        <td className="px-4 py-4 align-top">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-black/80">{res.guest}</span>
                            {res.vip && <span className="bg-amber-100 text-amber-700 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">VIP</span>}
                          </div>
                          <div className="text-[11px] text-black/50 mt-0.5">{res.email}</div>
                        </td>
                        <td className="px-4 py-4 align-top">
                          <div className="flex items-center gap-2">
                            {renderChannelIcon(res.channelIcon)}
                            <span className="font-medium text-black/80">{res.channel}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4 align-top">
                          <div className="font-bold text-black/80">{res.room}</div>
                          <div className="text-[11px] text-black/50 mt-0.5">{res.ratePlan}</div>
                        </td>
                        <td className="px-4 py-4 align-top">
                          <div className="font-medium text-black/80">{res.checkIn}</div>
                          <div className={`text-[11px] font-medium mt-0.5 ${res.isNoShowWarning ? 'text-rose-600 font-bold' : 'text-emerald-600'}`}>{res.checkInHint}</div>
                        </td>
                        <td className="px-4 py-4 align-top">
                          <div className="font-medium text-black/80">{res.checkOut}</div>
                        </td>
                        <td className="px-4 py-4 align-top font-medium text-black/80">{res.nights}</td>
                        <td className="px-4 py-4 align-top font-medium text-black/80">
                          {res.guests}
                        </td>
                        <td className="px-4 py-4 align-top">
                          <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${res.statusColor}`}>{res.status}</span>
                        </td>
                        <td className="px-4 py-4 align-top text-right font-bold text-black/80">{res.total}</td>
                        <td className="px-5 py-4 align-top text-right relative">
                          <button 
                            onClick={() => setOpenDropdown(openDropdown === res.dbId ? null : res.dbId)}
                            className="p-1.5 border border-black/10 rounded hover:bg-gray-100 text-black/60 transition-colors"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
                          </button>
                          
                          {openDropdown === res.dbId && (
                            <div className="absolute right-8 top-10 mt-1 w-40 bg-white border border-black/10 rounded-lg shadow-lg z-50 py-1 overflow-hidden">
                              {(res.status === 'pending' || res.status === 'Pending' || res.status === 'confirmed' || res.status === 'Confirmed') && openWizard && (
                                <button 
                                  onClick={() => { openWizard(res.originalRes); setOpenDropdown(null); }}
                                  className="w-full px-4 py-2 text-left text-[12px] font-medium text-emerald-600 hover:bg-emerald-50 flex items-center gap-2"
                                >
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                                  Check In
                                </button>
                              )}
                              {(res.status === 'pending' || res.status === 'Pending') && (
                                <button 
                                  onClick={() => { updateStatus && updateStatus(res.dbId, 'confirmed'); setOpenDropdown(null); }}
                                  className="w-full px-4 py-2 text-left text-[12px] font-medium text-blue-600 hover:bg-blue-50 flex items-center gap-2"
                                >
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                                  Confirm Booking
                                </button>
                              )}
                              {(res.status === 'pending' || res.status === 'Pending' || res.status === 'confirmed' || res.status === 'Confirmed') && (
                                <button 
                                  onClick={() => { updateStatus && updateStatus(res.dbId, 'cancelled'); setOpenDropdown(null); }}
                                  className="w-full px-4 py-2 text-left text-[12px] font-medium text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                                >
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
                                  Cancel Booking
                                </button>
                              )}
                              {res.isNoShowWarning && res.status !== 'no_show' && (
                                <button 
                                  onClick={() => { updateStatus && updateStatus(res.dbId, 'no_show'); setOpenDropdown(null); }}
                                  className="w-full px-4 py-2 text-left text-[12px] font-medium text-orange-600 hover:bg-orange-50 flex items-center gap-2"
                                >
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                                  Mark as No Show
                                </button>
                              )}
                              <a 
                                href={`mailto:${res.email}`}
                                onClick={() => setOpenDropdown(null)}
                                className="w-full px-4 py-2 text-left text-[12px] font-medium text-black/70 hover:bg-gray-50 flex items-center gap-2"
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                                Send Email
                              </a>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="px-6 py-4 border-t border-black/5 flex items-center justify-between text-[13px] shrink-0 bg-white">
                <div className="text-black/50 font-medium">
                  Showing 1 to {displayReservations.length} of {displayReservations.length} entries
                </div>
                <div className="flex items-center gap-4">
                  <select className="border border-black/10 rounded-lg px-2 py-1 outline-none text-black/80 font-medium bg-white">
                    <option>10 per page</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Bottom Footer Info */}
            <div className="bg-[#F0F7FD] border border-[#BDE0FE] rounded-xl p-5 flex items-center gap-8 shadow-sm shrink-0">
              <div className="flex gap-4 items-start flex-1">
                <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center shrink-0 mt-0.5">
                  <span className="font-serif italic text-sm font-bold">i</span>
                </div>
                <div>
                  <h4 className="font-bold text-[#00005C] text-sm mb-1">About Online Reservations</h4>
                  <p className="text-blue-800 text-[13px]">These reservations are received from your website and connected booking channels.</p>
                </div>
              </div>
              <div className="flex items-center gap-6 shrink-0 text-[12px]">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded border bg-white flex items-center justify-center shrink-0">
                    {renderChannelIcon('globe')}
                  </div>
                  <div>
                    <div className="font-bold text-black/80 text-[11px] leading-tight">Direct Website</div>
                    <div className="text-black/60">{statsDerived.total} (100%)</div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

