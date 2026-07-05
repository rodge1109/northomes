import React, { useState, useMemo, useEffect } from 'react';
import GuestProfileView from './GuestProfileView';
import NewGuestProfileForm from './NewGuestProfileForm';

const API_BASE_URL = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ? 'http://localhost:5000'
  : 'https://northomes.onrender.com';

export default function AdminGuestsTab({ reservations = [], onRefresh }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All Status');
  const [filterNationality, setFilterNationality] = useState('All Nationalities');
  const [filterSource, setFilterSource] = useState('All Sources');
  const [selectedGuest, setSelectedGuest] = useState(null);
  const [viewingProfile, setViewingProfile] = useState(false);
  const [creatingProfile, setCreatingProfile] = useState(false);
  const [editingGuest, setEditingGuest] = useState(null);

  const [guestsList, setGuestsList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Map database guest profiles and calculate stay history dynamically from reservations prop
  const guests = useMemo(() => {
    return guestsList.map(g => {
      // Find all reservations linked to this guest
      const guestReservations = reservations.filter(r => 
        r.guest_id === g.id || 
        ((r.email && r.email.trim().toLowerCase() === g.email?.trim().toLowerCase()) && 
         (r.full_name && r.full_name.trim().toLowerCase() === g.full_name?.trim().toLowerCase()))
      );

      const sortedStays = guestReservations.map(r => ({
        ...r,
        checkIn: new Date(r.check_in_date || r.preferred_date),
        checkOut: new Date(r.check_out_date || r.preferred_date),
        nights: Math.max(1, Math.round((new Date(r.check_out_date || r.preferred_date) - new Date(r.check_in_date || r.preferred_date)) / 86400000)),
        total: Math.max(1, Math.round((new Date(r.check_out_date || r.preferred_date) - new Date(r.check_in_date || r.preferred_date)) / 86400000)) * (r.room_type === 'Suite' ? 6500 : 3500)
      })).sort((a, b) => b.checkIn - a.checkIn);

      const totalStays = sortedStays.length;
      const totalNights = sortedStays.reduce((sum, s) => sum + s.nights, 0);
      const totalSpent = sortedStays.reduce((sum, s) => sum + s.total, 0);
      const lastStay = sortedStays[0];
      
      // Determine overall status based on current stay
      let status = 'Checked-Out';
      let statusColor = 'bg-gray-100 text-gray-600';
      if (sortedStays.some(s => s.status === 'checked_in')) {
        status = 'In-House';
        statusColor = 'bg-emerald-50 text-emerald-600';
      } else if (sortedStays.some(s => s.status === 'confirmed' || s.status === 'pending')) {
        status = 'Confirmed';
        statusColor = 'bg-blue-50 text-blue-600';
      } else if (sortedStays.every(s => s.status === 'cancelled') && sortedStays.length > 0) {
        status = 'Cancelled';
        statusColor = 'bg-rose-50 text-rose-600';
      } else if (sortedStays.length === 0) {
        status = 'No Bookings';
        statusColor = 'bg-gray-50 text-gray-400';
      }

      const initials = g.full_name?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'G';

      return {
        id: g.id ? `P${String(g.id).padStart(7, '0')}` : `P0000000`,
        dbId: g.id,
        email: g.email,
        phone: g.phone_number,
        name: g.full_name,
        initials,
        nationality: g.nationality || 'Filipino',
        dob: g.date_of_birth,
        company: g.company || '—',
        language: g.language || 'English',
        guestSince: new Date(g.created_at || Date.now()),
        stays: sortedStays,
        first_name: g.first_name || '',
        last_name: g.last_name || '',
        middle_name: g.middle_name || '',
        title: g.title || '',
        gender: g.gender || '',
        expiry_date: g.expiry_date || null,
        issuing_country: g.issuing_country || '',
        telephone: g.telephone || '',
        address_line_1: g.address_line_1 || '',
        address_line_2: g.address_line_2 || '',
        province_state: g.province_state || '',
        zip_postal_code: g.zip_postal_code || '',
        country: g.country || '',
        preferred_room_type: g.preferred_room_type || '',
        preferred_floor: g.preferred_floor || '',
        bed_type: g.bed_type || '',
        smoking_preference: g.smoking_preference || 'Non-Smoking',
        pillow_type: g.pillow_type || '',
        special_requests_notes: g.special_requests_notes || '',
        vip_status: g.vip_status || 'Standard',
        source: g.source || '',
        market_segment: g.market_segment || '',
        referred_by: g.referred_by || '',
        tags: g.tags || '',
        notes: g.notes || '',
        purpose_of_visit: g.purpose_of_visit || '',
        totalStays,
        totalNights,
        totalSpent,
        avgSpend: totalStays > 0 ? totalSpent / totalStays : 0,
        lastStayDate: lastStay ? lastStay.checkIn : null,
        status,
        statusColor,
        isVip: totalStays >= 5 || totalSpent >= 20000 || g.vip_status === 'VIP'
      };
    });
  }, [guestsList, reservations]);

  const fetchGuestsList = async () => {
    try {
      setLoading(true);
      const url = searchQuery 
        ? `${API_BASE_URL}/api/admin/guests?search=${encodeURIComponent(searchQuery)}`
        : `${API_BASE_URL}/api/admin/guests`;
      const response = await fetch(url);
      const data = await response.json();
      if (data.success) {
        setGuestsList(data.guests);
      }
    } catch (err) {
      console.error('Error fetching guests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGuestsList();
  }, [searchQuery]);

  useEffect(() => {
    if (selectedGuest) {
      const updated = guests.find(g => g.dbId === selectedGuest.dbId);
      if (updated) {
        const hasChanged = 
          updated.email !== selectedGuest.email ||
          updated.phone !== selectedGuest.phone ||
          updated.name !== selectedGuest.name ||
          updated.totalStays !== selectedGuest.totalStays ||
          updated.totalSpent !== selectedGuest.totalSpent ||
          updated.purpose_of_visit !== selectedGuest.purpose_of_visit;
        if (hasChanged) {
          setSelectedGuest(updated);
        }
      }
    }
  }, [guests]);



  const statsDerived = useMemo(() => {
    const total = guests.length;
    const inHouse = guests.filter(g => g.status === 'In-House').length;
    const expected = reservations.filter(r => r.status === 'confirmed' && new Date(r.check_in_date).setHours(0,0,0,0) === new Date().setHours(0,0,0,0)).length;
    const repeat = guests.filter(g => g.totalStays > 1).length;
    const vip = guests.filter(g => g.isVip).length;

    return {
      total,
      inHouse,
      expected,
      repeat,
      repeatPct: total > 0 ? ((repeat / total) * 100).toFixed(1) : 0,
      vip
    };
  }, [guests, reservations]);

  const displayGuests = useMemo(() => {
    return guests
      .filter(g => filterStatus === 'All Status' || g.status === filterStatus)
      .filter(g => filterNationality === 'All Nationalities' || g.nationality === filterNationality)
      .filter(g => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return g.name.toLowerCase().includes(q) || g.email?.toLowerCase().includes(q) || g.phone?.includes(q) || g.id.toLowerCase().includes(q);
      });
  }, [guests, searchQuery, filterStatus, filterNationality]);

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';
  const fmtCurrency = (n) => `₱${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const getFlag = (nat) => {
    if (nat.toLowerCase().includes('filipino')) return '🇵🇭';
    if (nat.toLowerCase().includes('singaporean')) return '🇸🇬';
    if (nat.toLowerCase().includes('australian')) return '🇦🇺';
    if (nat.toLowerCase().includes('korean')) return '🇰🇷';
    if (nat.toLowerCase().includes('american')) return '🇺🇸';
    return '🏳️';
  };

  const getInitialsColor = (name) => {
    const colors = ['bg-[#E8F5E9] text-[#2E7D32]', 'bg-[#E3F2FD] text-[#1565C0]', 'bg-[#FFF3E0] text-[#E65100]', 'bg-[#FCE4EC] text-[#C2185B]', 'bg-[#F3E5F5] text-[#6A1B9A]'];
    const idx = name.charCodeAt(0) % colors.length;
    return colors[idx] || colors[0];
  };

  if (editingGuest) {
    return (
      <NewGuestProfileForm
        guest={editingGuest}
        onBack={() => setEditingGuest(null)}
        onSave={() => {
          setEditingGuest(null);
          fetchGuestsList();
          if (onRefresh) onRefresh();
        }}
      />
    );
  }

  if (viewingProfile && selectedGuest) {
    return (
      <GuestProfileView 
        guest={selectedGuest} 
        onBack={() => setViewingProfile(false)} 
        onSave={(updatedGuest) => {
          fetchGuestsList();
          setSelectedGuest(updatedGuest);
          if (onRefresh) onRefresh();
        }} 
      />
    );
  }

  if (creatingProfile) {
    return <NewGuestProfileForm onBack={() => setCreatingProfile(false)} onSave={() => { setCreatingProfile(false); if (onRefresh) onRefresh(); }} />;
  }

  return (
    <div style={{ position: 'fixed', top: 0, left: '120px', right: 0, bottom: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden', zIndex: 10, background: '#fcfcfc' }}>
      
      {/* Header */}
      <div className="px-8 py-6 border-b border-black/5 bg-white shrink-0 flex items-center justify-between">
        <div>
          <h2 className="text-[#000000]/87 font-black text-[24px] tracking-tight leading-tight">Guests</h2>
          <p className="text-black/60 text-[13px] mt-1 font-medium">View and manage guest profiles and stay history.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-black/40" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            </div>
            <input type="text" placeholder="Search guest name, email, phone, ID..." 
              className="pl-9 pr-8 py-2.5 border border-black/10 rounded-xl text-[13px] w-[300px] outline-none focus:border-[#005530] focus:ring-1 focus:ring-[#005530] bg-white font-medium text-black/80 placeholder-black/40 shadow-sm" />
            <div className="absolute inset-y-0 right-0 pr-2 flex items-center">
              <span className="text-[10px] font-bold text-black/30 border border-black/10 rounded px-1.5 py-0.5">/</span>
            </div>
          </div>

          <button 
            type="button"
            onClick={() => setCreatingProfile(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#005530] text-white hover:bg-[#004420] rounded-lg text-[13px] font-bold shadow-sm transition-colors shrink-0 animate-fade-in"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            New Guest Profile
          </button>
          
          <div className="relative cursor-pointer hover:bg-gray-50 p-2 rounded-full transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full border border-white"></span>
          </div>

          <div className="flex items-center gap-2 pl-2 border-l border-black/10 cursor-pointer hover:bg-gray-50 p-1.5 rounded-lg transition-colors">
            <img src="https://ui-avatars.com/api/?name=Maria+Santos&background=0D8ABC&color=fff" className="w-8 h-8 rounded-full" alt="User" />
            <div className="hidden md:block">
              <div className="text-[11px] font-bold text-black/80 leading-tight">Maria Santos</div>
              <div className="text-[10px] text-black/50 font-medium">Front Office</div>
            </div>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-black/40 ml-1"><polyline points="6 9 12 15 18 9"/></svg>
          </div>
        </div>
      </div>

      {/* Main Layout Area */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Main Content (Left) */}
        <div className={`flex-1 overflow-y-auto p-8 transition-all duration-300 ${selectedGuest ? 'pr-[380px]' : ''}`}>
          <div className="max-w-[1500px] mx-auto space-y-6">

            {/* Top Stat Cards */}
            <div className="grid grid-cols-5 gap-4">
              <div className="bg-white rounded-2xl border border-black/5 p-5 shadow-sm flex items-start justify-between">
                <div>
                  <h4 className="text-[10px] font-bold text-black/60 uppercase tracking-widest mb-2">TOTAL GUESTS</h4>
                  <div className="text-[32px] text-[#005530] font-black leading-none mb-1 tracking-tight">{statsDerived.total}</div>
                  <div className="text-[11px] font-medium text-black/40 mt-2">All Time</div>
                </div>
                <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00754A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                </div>
              </div>
              <div className="bg-white rounded-2xl border border-black/5 p-5 shadow-sm flex items-start justify-between">
                <div>
                  <h4 className="text-[10px] font-bold text-black/60 uppercase tracking-widest mb-2">IN-HOUSE GUESTS</h4>
                  <div className="text-[32px] text-blue-600 font-black leading-none mb-1 tracking-tight">{statsDerived.inHouse}</div>
                  <div className="text-[11px] font-medium text-black/40 mt-2">Currently Staying</div>
                </div>
                <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="8" width="18" height="4" rx="1" ry="1"></rect><line x1="12" y1="8" x2="12" y2="21"></line><path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"></path><path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5"></path></svg>
                </div>
              </div>
              <div className="bg-white rounded-2xl border border-black/5 p-5 shadow-sm flex items-start justify-between">
                <div>
                  <h4 className="text-[10px] font-bold text-black/60 uppercase tracking-widest mb-2">EXPECTED ARRIVALS</h4>
                  <div className="text-[32px] text-purple-600 font-black leading-none mb-1 tracking-tight">{statsDerived.expected}</div>
                  <div className="text-[11px] font-medium text-black/40 mt-2">Today</div>
                </div>
                <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9333EA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
                </div>
              </div>
              <div className="bg-white rounded-2xl border border-black/5 p-5 shadow-sm flex items-start justify-between">
                <div>
                  <h4 className="text-[10px] font-bold text-black/60 uppercase tracking-widest mb-2">REPEAT GUESTS</h4>
                  <div className="text-[32px] text-orange-500 font-black leading-none mb-1 tracking-tight">{statsDerived.repeat}</div>
                  <div className="text-[11px] font-medium text-black/40 mt-2">{statsDerived.repeatPct}% of Total</div>
                </div>
                <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#F97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.59-9.21l5.6 5.6"/></svg>
                </div>
              </div>
              <div className="bg-white rounded-2xl border border-black/5 p-5 shadow-sm flex items-start justify-between">
                <div>
                  <h4 className="text-[10px] font-bold text-black/60 uppercase tracking-widest mb-2">VIP GUESTS</h4>
                  <div className="text-[32px] text-amber-500 font-black leading-none mb-1 tracking-tight">{statsDerived.vip}</div>
                  <div className="text-[11px] font-medium text-black/40 mt-2">All Time</div>
                </div>
                <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                </div>
              </div>
            </div>

            {/* Filter Toolbar */}
            <div className="flex items-center justify-between gap-4 py-2">
              <div className="flex items-center gap-3">
                <div className="relative w-[300px]">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-black/40" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                  </div>
                  <input type="text" placeholder="Search guest name, email, phone, or ID..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                    className="pl-9 pr-4 py-2 bg-white border border-black/10 rounded-lg text-[13px] w-full outline-none focus:border-[#005530] focus:ring-1 focus:ring-[#005530] font-medium text-black/80 placeholder-black/40 shadow-sm" />
                </div>
                <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="bg-white border border-black/10 rounded-lg text-[13px] px-3 py-2 outline-none text-black/80 font-medium shadow-sm pr-8 min-w-[120px]">
                  <option>All Status</option>
                  <option value="In-House">In-House</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Checked-Out">Checked-Out</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
                <select value={filterNationality} onChange={e => setFilterNationality(e.target.value)} className="bg-white border border-black/10 rounded-lg text-[13px] px-3 py-2 outline-none text-black/80 font-medium shadow-sm pr-8 min-w-[150px]">
                  <option>All Nationalities</option>
                  <option value="Filipino">Filipino</option>
                  <option value="Singaporean">Singaporean</option>
                  <option value="Australian">Australian</option>
                  <option value="Korean">Korean</option>
                  <option value="American">American</option>
                </select>
                <select value={filterSource} onChange={e => setFilterSource(e.target.value)} className="bg-white border border-black/10 rounded-lg text-[13px] px-3 py-2 outline-none text-black/80 font-medium shadow-sm pr-8 min-w-[130px]">
                  <option>All Sources</option>
                </select>
                <button className="flex items-center gap-2 bg-white border border-black/10 rounded-lg text-[13px] px-4 py-2 font-medium text-black/80 hover:bg-gray-50 shadow-sm">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
                  More Filters
                </button>
              </div>
              <div className="flex items-center gap-3">
                <button className="flex items-center gap-2 px-4 py-2 bg-white border border-black/10 rounded-lg text-[13px] font-medium text-black/80 hover:bg-gray-50 shadow-sm">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                  Export
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-[#005530] text-white hover:bg-[#004420] rounded-lg text-[13px] font-bold shadow-sm transition-colors">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                  Add New Guest
                </button>
              </div>
            </div>

            {/* Guests Data Grid */}
            <div className="bg-white rounded-2xl shadow-sm border border-black/5 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[12px]">
                  <thead>
                    <tr className="border-b border-black/5 bg-white">
                      <th className="px-5 py-5 w-10">
                        <input type="checkbox" className="rounded border-gray-300 text-[#005530] focus:ring-[#005530]" />
                      </th>
                      <th className="px-4 py-5 font-black uppercase tracking-widest text-[10px] text-black/60">GUEST NAME</th>
                      <th className="px-4 py-5 font-black uppercase tracking-widest text-[10px] text-black/60">CONTACT</th>
                      <th className="px-4 py-5 font-black uppercase tracking-widest text-[10px] text-black/60">NATIONALITY</th>
                      <th className="px-4 py-5 font-black uppercase tracking-widest text-[10px] text-black/60">STATUS</th>
                      <th className="px-4 py-5 font-black uppercase tracking-widest text-[10px] text-black/60">LAST STAY</th>
                      <th className="px-4 py-5 font-black uppercase tracking-widest text-[10px] text-black/60 text-center">TOTAL STAYS</th>
                      <th className="px-4 py-5 font-black uppercase tracking-widest text-[10px] text-black/60 text-right">TOTAL SPENT</th>
                      <th className="px-5 py-5 font-black uppercase tracking-widest text-[10px] text-black/60 text-center">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/5">
                    {displayGuests.length === 0 ? (
                      <tr><td colSpan="9" className="text-center py-12 text-black/50 font-medium">No guests found.</td></tr>
                    ) : displayGuests.map(g => (
                      <tr key={g.id} 
                          onClick={() => setSelectedGuest(g)}
                          onDoubleClick={() => { setSelectedGuest(g); setViewingProfile(true); }}
                          className={`hover:bg-gray-50/50 transition-colors cursor-pointer ${selectedGuest?.id === g.id ? 'bg-[#F0FDF4]' : ''}`}>
                        <td className="px-5 py-4" onClick={e => e.stopPropagation()}>
                          <input type="checkbox" className="rounded border-gray-300 text-[#005530] focus:ring-[#005530]" />
                        </td>
                        <td className="px-4 py-4 align-middle">
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-[12px] shrink-0 ${getInitialsColor(g.name)}`}>
                              {g.initials}
                            </div>
                            <div>
                              <div className="font-bold text-black/90 text-[13px]">{g.name}</div>
                              <div className="text-[11px] text-black/40 font-medium mt-0.5">ID: {g.id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 align-middle">
                          <div className="font-medium text-black/80">{g.phone}</div>
                          <div className="text-[11px] text-black/50 font-medium mt-0.5">{g.email}</div>
                        </td>
                        <td className="px-4 py-4 align-middle">
                          <div className="flex items-center gap-2 font-medium text-black/80">
                            <span>{getFlag(g.nationality)}</span>
                            <span>{g.nationality}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4 align-middle">
                          <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest ${g.statusColor}`}>
                            {g.status}
                          </span>
                        </td>
                        <td className="px-4 py-4 align-middle font-medium text-black/80">
                          {fmtDate(g.lastStayDate)}
                        </td>
                        <td className="px-4 py-4 align-middle font-bold text-black/80 text-center">
                          {g.totalStays}
                        </td>
                        <td className="px-4 py-4 align-middle font-bold text-black/80 text-right">
                          {fmtCurrency(g.totalSpent)}
                        </td>
                        <td className="px-5 py-4 align-middle" onClick={e => e.stopPropagation()}>
                          <div className="flex items-center justify-center gap-1.5">
                            <button onClick={() => setSelectedGuest(g)} className="p-1.5 border border-black/10 rounded-md hover:bg-gray-100 text-black/60 transition-colors">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                            </button>
                            <button className="p-1.5 border border-black/10 rounded-md hover:bg-gray-100 text-black/60 transition-colors">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="px-6 py-4 border-t border-black/5 flex items-center justify-between text-[13px] bg-white">
                <div className="text-black/50 font-medium">
                  Showing 1 to {displayGuests.length} of {statsDerived.total} entries
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex gap-1">
                    <button className="w-8 h-8 flex items-center justify-center rounded border border-black/10 text-black/40 hover:bg-gray-50">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
                    </button>
                    <button className="w-8 h-8 flex items-center justify-center rounded bg-[#005530] text-white font-medium">1</button>
                    <button className="w-8 h-8 flex items-center justify-center rounded border border-black/10 hover:bg-gray-50 font-medium">2</button>
                    <button className="w-8 h-8 flex items-center justify-center rounded border border-black/10 hover:bg-gray-50 font-medium">3</button>
                    <button className="w-8 h-8 flex items-center justify-center rounded border border-black/10 hover:bg-gray-50 font-medium text-black/40">...</button>
                    <button className="w-8 h-8 flex items-center justify-center rounded border border-black/10 hover:bg-gray-50 font-medium">68</button>
                    <button className="w-8 h-8 flex items-center justify-center rounded border border-black/10 text-black/40 hover:bg-gray-50">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
                    </button>
                  </div>
                  <select className="border border-black/10 rounded-lg px-2 py-1.5 outline-none text-black/80 font-medium bg-white">
                    <option>10 per page</option>
                  </select>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Right Sidebar - Guest Profile Slide-over */}
        <div className={`fixed top-[92px] right-0 bottom-0 w-[380px] bg-white border-l border-black/10 shadow-2xl transition-transform duration-300 z-40 transform ${selectedGuest ? 'translate-x-0' : 'translate-x-full'}`}>
          {selectedGuest && (
            <div className="flex flex-col h-full bg-[#f8f9fa]">
              
              {/* Profile Header */}
              <div className="p-6 bg-white border-b border-black/5 relative shrink-0">
                <button onClick={() => setSelectedGuest(null)} className="absolute top-4 right-4 p-1.5 text-black/40 hover:text-black/80 rounded-lg hover:bg-gray-100 transition-colors">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
                
                <div className="flex items-center gap-4 mt-2">
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center font-bold text-[20px] shrink-0 ${getInitialsColor(selectedGuest.name)}`}>
                    {selectedGuest.initials}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-[18px] font-black tracking-tight text-black/90">{selectedGuest.name}</h3>
                      {selectedGuest.isVip && <span className="bg-amber-100 text-amber-700 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">VIP</span>}
                    </div>
                    <span className={`inline-block mt-1 px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest ${selectedGuest.statusColor}`}>
                      {selectedGuest.status} Guest
                    </span>
                  </div>
                </div>
              </div>

              {/* Profile Details Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-8">
                
                {/* Contact & Identity */}
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-black/40 mt-0.5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                    <div>
                      <div className="text-[13px] font-medium text-black/90">{selectedGuest.phone}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-black/40 mt-0.5"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                    <div>
                      <div className="text-[13px] font-medium text-black/90">{selectedGuest.email}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-black/40 mt-0.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                    <div>
                      <div className="text-[13px] font-medium text-black/90">Manila, Philippines</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-black/40 mt-0.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                    <div>
                      <div className="text-[10px] uppercase font-bold text-black/40 tracking-wider">ID / Passport No.</div>
                      <div className="text-[13px] font-medium text-black/90">P1234567A</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-black/40 mt-0.5"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
                    <div>
                      <div className="text-[10px] uppercase font-bold text-black/40 tracking-wider">Nationality</div>
                      <div className="text-[13px] font-medium text-black/90">{selectedGuest.nationality}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-black/40 mt-0.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                    <div>
                      <div className="text-[10px] uppercase font-bold text-black/40 tracking-wider">Date of Birth</div>
                      <div className="text-[13px] font-medium text-black/90">May 15, 1985 (39 y/o)</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-black/40 mt-0.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                    <div>
                      <div className="text-[10px] uppercase font-bold text-black/40 tracking-wider">Company</div>
                      <div className="text-[13px] font-medium text-black/90">{selectedGuest.company}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-black/40 mt-0.5"><circle cx="12" cy="12" r="10"></circle><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path><path d="M2 12h20"></path></svg>
                    <div>
                      <div className="text-[10px] uppercase font-bold text-black/40 tracking-wider">Preferred Language</div>
                      <div className="text-[13px] font-medium text-black/90">{selectedGuest.language}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-black/40 mt-0.5"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
                    <div>
                      <div className="text-[10px] uppercase font-bold text-black/40 tracking-wider">Guest Since</div>
                      <div className="text-[13px] font-medium text-black/90">{fmtDate(selectedGuest.guestSince)}</div>
                    </div>
                  </div>
                </div>

                {/* Stay Summary */}
                <div>
                  <h4 className="text-[13px] font-black text-black/90 mb-3 border-b border-black/5 pb-2">Stay Summary</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-[13px]">
                      <span className="text-black/60 font-medium">Total Stays</span>
                      <span className="font-bold text-black/90">{selectedGuest.totalStays}</span>
                    </div>
                    <div className="flex justify-between items-center text-[13px]">
                      <span className="text-black/60 font-medium">Nights Stayed</span>
                      <span className="font-bold text-black/90">{selectedGuest.totalNights}</span>
                    </div>
                    <div className="flex justify-between items-center text-[13px]">
                      <span className="text-black/60 font-medium">Total Spend</span>
                      <span className="font-bold text-black/90">{fmtCurrency(selectedGuest.totalSpent)}</span>
                    </div>
                    <div className="flex justify-between items-center text-[13px]">
                      <span className="text-black/60 font-medium">Average Spend per Stay</span>
                      <span className="font-bold text-black/90">{fmtCurrency(selectedGuest.avgSpend)}</span>
                    </div>
                    <div className="flex justify-between items-center text-[13px]">
                      <span className="text-black/60 font-medium">Last Stay</span>
                      <span className="font-bold text-black/90">{fmtDate(selectedGuest.lastStayDate)}</span>
                    </div>
                  </div>
                  <button onClick={() => setViewingProfile(true)} className="w-full mt-4 py-2 bg-white border border-black/10 rounded-lg text-[13px] font-bold text-black/80 hover:bg-gray-50 shadow-sm transition-colors tracking-tight">
                    View Full Profile
                  </button>
                </div>

                {/* Quick Actions */}
                <div>
                  <h4 className="text-[13px] font-black text-black/90 mb-3 border-b border-black/5 pb-2">Quick Actions</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <button className="flex items-center gap-2 px-3 py-2 bg-white border border-black/10 rounded-lg text-[12px] font-medium text-black/80 hover:bg-gray-50 transition-colors shadow-sm">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                      New Reservation
                    </button>
                    <button className="flex items-center gap-2 px-3 py-2 bg-white border border-black/10 rounded-lg text-[12px] font-medium text-black/80 hover:bg-gray-50 transition-colors shadow-sm">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                      Add Note
                    </button>
                    <button className="flex items-center gap-2 px-3 py-2 bg-white border border-black/10 rounded-lg text-[12px] font-medium text-black/80 hover:bg-gray-50 transition-colors shadow-sm col-span-2">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                      Send Message
                    </button>
                  </div>
                </div>

              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
