import React, { useMemo, useState, useEffect } from 'react';

const API_BASE_URL = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ? 'http://localhost:5000'
  : 'https://api.northomes.com';

export default function AdminDashboardTab({ reservations = [], stats = {} }) {
  const [rooms, setRooms] = useState([]);
  const [isAuditRunning, setIsAuditRunning] = useState(false);
  const [auditMessage, setAuditMessage] = useState('Night audit process not yet completed.');
  
  const handleNightAudit = async () => {
    if (!window.confirm("Are you sure you want to run the Night Audit? This will post room charges to all currently checked-in guests and log the completion.")) return;
    setIsAuditRunning(true);
    try {
      const res = await fetch(`${API_BASE_URL || 'http://localhost:5000'}/api/admin/night-audit`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setAuditMessage(`Completed. ${data.message}`);
      } else {
        setAuditMessage(`Audit failed: ${data.message}`);
        alert(data.message);
      }
    } catch (err) {
      setAuditMessage(`Error: ${err.message}`);
    } finally {
      setIsAuditRunning(false);
    }
  };
  
  useEffect(() => {
    fetch(`${API_BASE_URL || 'http://localhost:5000'}/api/rooms`)
      .then(res => res.json())
      .then(data => {
        if (data.rooms) setRooms(data.rooms);
      })
      .catch(err => console.error("Error fetching rooms for dashboard:", err));
  }, []);

  const fmtCurrency = (n) => `₱${(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const derivedStats = useMemo(() => {
    const today = new Date();
    // Normalize today to local YYYY-MM-DD
    const todayLocal = new Date(today.getTime() - (today.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
    
    const isToday = (dateStr) => {
      if (!dateStr) return false;
      return dateStr.startsWith(todayLocal) || dateStr.slice(0, 10) === todayLocal;
    };

    let inHouse = 0;
    let arrivals = 0;
    let departures = 0;
    let totalRevenue = 0;

    reservations.forEach(r => {
      const checkIn = r.check_in_date || r.preferred_date;
      const checkOut = r.check_out_date;

      if (r.status === 'checked_in') {
        inHouse++;
        // Rough estimate of revenue for in-house
        const getRoomRate = (t) => {
          const type = (t || '').toLowerCase();
          if (type.includes('presidential')) return 25000;
          if (type.includes('suite')) return 9000;
          if (type.includes('family')) return 6500;
          if (type.includes('deluxe')) return 4500;
          return 2500; // Standard Room and fallback
        };
        const rate = getRoomRate(r.room_type);
        totalRevenue += rate;
        
        if (isToday(checkOut)) {
          departures++;
        }
      }

      if ((r.status === 'confirmed' || r.status === 'pending') && isToday(checkIn)) {
        arrivals++;
      }
    });

    const totalRooms = rooms.length || 15; // fallback to 15 if not loaded yet
    const outOfOrder = rooms.filter(r => r.hk_status === 'out_of_order' || !r.active).length;
    const available = totalRooms - inHouse - outOfOrder;
    const sellableRooms = totalRooms - outOfOrder;
    const occupancyPct = sellableRooms > 0 ? ((inHouse / sellableRooms) * 100).toFixed(1) : "0.0";
    
    // Sort recent reservations
    const recent = [...reservations]
      .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
      .slice(0, 5);

    // Housekeeping from actual rooms data — use computed_status from the API
    // The API returns hk_status (raw) and computed_status (contextual: occupied, due_out, arriving, dirty, inspected, available, out_of_order)
    const hkOccupied  = rooms.filter(r => r.computed_status === 'occupied').length;
    const hkDueOut    = rooms.filter(r => r.computed_status === 'due_out').length;
    const hkArriving  = rooms.filter(r => r.computed_status === 'arriving').length;
    const hkDirty     = rooms.filter(r => r.computed_status === 'dirty' || (r.hk_status === 'dirty' && !['occupied','due_out','arriving','out_of_order'].includes(r.computed_status))).length;
    const hkClean     = rooms.filter(r => r.computed_status === 'available' && r.hk_status === 'clean').length;
    const hkInspected = rooms.filter(r => r.computed_status === 'inspected' || r.hk_status === 'inspected').length;
    const hkOOO       = rooms.filter(r => r.computed_status === 'out_of_order' || r.hk_status === 'out_of_order').length;

    const hkStatuses = [
      { label: 'Occupied',    count: hkOccupied,  color: '#005530' },
      { label: 'Due Out',     count: hkDueOut,    color: '#F59E0B' },
      { label: 'Arriving',    count: hkArriving,  color: '#3B82F6' },
      { label: 'Dirty',       count: hkDirty,     color: '#EF4444' },
      { label: 'Inspected',   count: hkInspected, color: '#8B5CF6' },
      { label: 'Clean',       count: hkClean,     color: '#22C55E' },
      { label: 'Out of Order',count: hkOOO,       color: '#94A3B8' },
    ].filter(s => s.count > 0);

    // Reservation source breakdown from real data
    const sourceMap = {};
    reservations.forEach(r => {
      const raw = (r.source || '').trim();
      // Normalize: blank or 'Direct Website' / 'Direct Booking' → 'Direct'
      let label;
      if (!raw || raw === 'Direct Website' || raw === 'Direct Booking' || raw === 'Online Booking') {
        label = 'Direct / Online';
      } else if (raw === 'Walk-in' || raw === 'Walk-In') {
        label = 'Walk-in';
      } else if (raw === 'OTA' || raw.toLowerCase().includes('booking.com')) {
        label = 'Booking.com';
      } else if (raw.toLowerCase().includes('agoda')) {
        label = 'Agoda';
      } else if (raw === 'Corporate') {
        label = 'Corporate';
      } else if (raw === 'Agent') {
        label = 'Agent';
      } else {
        label = raw;
      }
      sourceMap[label] = (sourceMap[label] || 0) + 1;
    });
    const sourceColors = {
      'Direct / Online': '#22C55E',
      'Walk-in': '#3B82F6',
      'Booking.com': '#F59E0B',
      'Agoda': '#A855F7',
      'Corporate': '#EC4899',
      'Agent': '#06B6D4',
    };
    const defaultColor = '#94A3B8';
    const totalRes = reservations.length;
    const sourceCounts = Object.entries(sourceMap)
      .sort((a, b) => b[1] - a[1])
      .map(([label, count]) => ({
        label,
        count,
        pct: totalRes > 0 ? ((count / totalRes) * 100).toFixed(1) : '0.0',
        color: sourceColors[label] || defaultColor
      }));

    return {
      inHouse,
      arrivals,
      departures,
      available,
      outOfOrder,
      occupancyPct,
      totalRooms,
      totalRevenue,
      recent,
      hkDirty: rooms.filter(r => r.hk_status === 'dirty').length,
      hkClean: rooms.filter(r => r.hk_status === 'clean').length,
      hkInspected: rooms.filter(r => r.hk_status === 'inspected').length,
      hkOOO: rooms.filter(r => r.hk_status === 'out_of_order').length,
      hkStatuses,
      totalReservations: reservations.length,
      sourceCounts
    };
  }, [reservations, rooms]);

  const { inHouse, arrivals, departures, available, outOfOrder, occupancyPct, totalRooms, totalRevenue, recent, totalReservations } = derivedStats;

  // Format date for header
  const headerDate = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div style={{ position: 'fixed', top: 0, left: '120px', right: 0, bottom: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden', zIndex: 10, background: '#f8f9fa' }}>
      
      {/* Header */}
      <div className="px-8 py-5 border-b border-black/5 bg-white shrink-0 flex items-center justify-between">
        <div>
          <h1 className="text-[28px] font-black tracking-tight text-black/90 leading-none">Dashboard</h1>
          <p className="text-black/50 text-[13px] font-medium mt-1">Welcome back, Maria! Here's what's happening today.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 border border-black/10 rounded-lg px-3 py-1.5 bg-white shadow-sm cursor-pointer hover:bg-gray-50 transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-black/50"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
            <span className="text-[13px] font-bold text-black/80">{headerDate}</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
          </div>
          
          <button className="flex items-center gap-2 px-3 py-1.5 bg-white border border-black/10 rounded-lg text-[13px] font-bold text-black/80 hover:bg-gray-50 shadow-sm transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-black/50"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
            Dashboard Settings
          </button>
          
          <button className="flex items-center gap-2 px-4 py-1.5 bg-[#005530] text-white hover:bg-[#004420] rounded-lg text-[13px] font-bold shadow-sm transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            New Reservation
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-[1500px] mx-auto space-y-4">
          
          {/* Row 1: Top Metrics */}
          <div className="grid grid-cols-5 gap-4">
            
            {/* Occupancy */}
            <div className="bg-white border border-black/5 rounded-2xl shadow-sm p-4 relative overflow-hidden flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-[10px] font-bold text-black/60 uppercase tracking-widest mb-1">Occupancy Today</h3>
                  <div className="text-[28px] font-black text-black/90 leading-none">{occupancyPct}%</div>
                  <div className="text-[12px] font-medium text-black/50 mt-1">{inHouse} / {totalRooms} Rooms</div>
                </div>
                <div className="w-12 h-12 relative shrink-0">
                  <svg viewBox="-4 -4 44 44" className="w-full h-full transform -rotate-90">
                    <path strokeDasharray="100, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#f1f5f9" strokeWidth="4"></path>
                    <path strokeDasharray={`${occupancyPct}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#005530" strokeWidth="4" strokeLinecap="round"></path>
                  </svg>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="12" y1="19" x2="12" y2="5"></line><polyline points="5 12 12 5 19 12"></polyline></svg>
                Current live data
              </div>
            </div>

            {/* Arrivals */}
            <div className="bg-white border border-black/5 rounded-2xl shadow-sm p-4 relative flex flex-col justify-between group cursor-pointer hover:border-[#005530]/30 transition-colors">
              <div className="flex items-start gap-3">
                <div className="text-blue-600 shrink-0 mt-0.5">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
                </div>
                <div>
                  <h3 className="text-[10px] font-bold text-black/60 uppercase tracking-widest mb-1">Arrivals</h3>
                  <div className="text-[28px] font-black text-black/90 leading-none">{arrivals}</div>
                  <div className="text-[12px] font-medium text-black/50 mt-1">Expected Today</div>
                </div>
              </div>
              <div className="mt-4 text-[11px] font-bold text-blue-600 flex items-center gap-1 group-hover:underline">
                View Arrival List <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="absolute top-4 right-4 text-black/20"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </div>

            {/* Departures */}
            <div className="bg-white border border-black/5 rounded-2xl shadow-sm p-4 relative flex flex-col justify-between group cursor-pointer hover:border-[#F59E0B]/30 transition-colors">
              <div className="flex items-start gap-3">
                <div className="text-amber-600 shrink-0 mt-0.5">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                </div>
                <div>
                  <h3 className="text-[10px] font-bold text-black/60 uppercase tracking-widest mb-1">Departures</h3>
                  <div className="text-[28px] font-black text-black/90 leading-none">{departures}</div>
                  <div className="text-[12px] font-medium text-black/50 mt-1">Expected Today</div>
                </div>
              </div>
              <div className="mt-4 text-[11px] font-bold text-amber-600 flex items-center gap-1 group-hover:underline">
                View Departure List <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="absolute top-4 right-4 text-black/20"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </div>

            {/* Rooms Available */}
            <div className="bg-white border border-black/5 rounded-2xl shadow-sm p-4 relative flex flex-col justify-between group cursor-pointer hover:border-[#8B5CF6]/30 transition-colors">
              <div className="flex items-start gap-3">
                <div className="text-purple-600 shrink-0 mt-0.5">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 4v16"></path><path d="M2 8h18a2 2 0 0 1 2 2v10"></path><path d="M2 17h20"></path><path d="M6 8v9"></path></svg>
                </div>
                <div>
                  <h3 className="text-[10px] font-bold text-black/60 uppercase tracking-widest mb-1">Rooms Available</h3>
                  <div className="text-[28px] font-black text-black/90 leading-none">{available}</div>
                  <div className="text-[12px] font-medium text-black/50 mt-1">Available for Sale</div>
                </div>
              </div>
              <div className="mt-4 text-[11px] font-bold text-purple-600 flex items-center gap-1 group-hover:underline">
                View Room Availability <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="absolute top-4 right-4 text-black/20"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </div>

            {/* Out of Order */}
            <div className="bg-white border border-black/5 rounded-2xl shadow-sm p-4 relative flex flex-col justify-between group cursor-pointer hover:border-[#059669]/30 transition-colors">
              <div className="flex items-start gap-3">
                <div className="text-[#059669] shrink-0 mt-0.5">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>
                </div>
                <div>
                  <h3 className="text-[10px] font-bold text-black/60 uppercase tracking-widest mb-1">Out of Order</h3>
                  <div className="text-[28px] font-black text-black/90 leading-none">{outOfOrder}</div>
                  <div className="text-[12px] font-medium text-black/50 mt-1">Rooms</div>
                </div>
              </div>
              <div className="mt-4 text-[11px] font-bold text-[#059669] flex items-center gap-1 group-hover:underline">
                View OOO Report <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="absolute top-4 right-4 text-black/20"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </div>
          </div>

          {/* Row 2: Analytics & Summary */}
          <div className="grid grid-cols-12 gap-4">
            
            {/* Revenue Summary */}
            <div className="col-span-3 bg-white border border-black/5 rounded-2xl shadow-sm p-5 relative flex flex-col">
              <h3 className="text-[10px] font-bold text-black/60 uppercase tracking-widest mb-3">Revenue Summary (Live In-House)</h3>
              <div className="text-[24px] font-black text-[#005530] mb-6">{fmtCurrency(totalRevenue)}</div>
              
              <div className="space-y-3 flex-1 text-[12px]">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span><span className="font-medium text-black/80">Room Revenue</span></div>
                  <span className="font-bold text-black/90">{fmtCurrency(totalRevenue * 0.7)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span><span className="font-medium text-black/80">F&B Revenue</span></div>
                  <span className="font-bold text-black/90">{fmtCurrency(totalRevenue * 0.17)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-orange-400"></span><span className="font-medium text-black/80">Other Revenue</span></div>
                  <span className="font-bold text-black/90">{fmtCurrency(totalRevenue * 0.07)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-red-400"></span><span className="font-medium text-black/80">Taxes & Fees</span></div>
                  <span className="font-bold text-black/90">{fmtCurrency(totalRevenue * 0.06)}</span>
                </div>
                
                <div className="flex justify-between items-center pt-3 border-t border-black/5 mt-3">
                  <span className="font-black text-black/90">Total Revenue</span>
                  <span className="font-black text-black/90">{fmtCurrency(totalRevenue)}</span>
                </div>
              </div>
              <div className="mt-4 text-[11px] font-bold text-[#005530] flex items-center gap-1 cursor-pointer hover:underline">
                View Revenue Report <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
              </div>
            </div>

            {/* Occupancy vs ADR vs RevPAR Chart */}
            <div className="col-span-6 bg-white border border-black/5 rounded-2xl shadow-sm p-5 relative flex flex-col">
              <h3 className="text-[10px] font-bold text-black/60 uppercase tracking-widest mb-3">Occupancy vs ADR vs RevPAR (Last 7 Days)</h3>
              
              <div className="flex items-center justify-center gap-6 mb-4">
                <div className="flex items-center gap-2 text-[10px] font-bold text-black/60"><div className="w-4 h-1.5 bg-[#A7F3D0] rounded"></div>Occupancy (%)</div>
                <div className="flex items-center gap-2 text-[10px] font-bold text-black/60"><div className="w-4 h-1.5 bg-blue-500 rounded"></div>ADR (₱)</div>
                <div className="flex items-center gap-2 text-[10px] font-bold text-black/60"><div className="w-4 h-1.5 bg-purple-500 rounded"></div>RevPAR (₱)</div>
              </div>

              {/* Chart Mockup using SVG & HTML */}
              <div className="flex-1 relative min-h-[160px] flex items-end">
                {/* Y Axes Labels */}
                <div className="absolute left-0 top-0 bottom-6 flex flex-col justify-between text-[10px] text-black/40 font-medium">
                  <span>100%</span><span>75%</span><span>50%</span><span>25%</span><span>0%</span>
                </div>
                <div className="absolute right-0 top-0 bottom-6 flex flex-col justify-between text-[10px] text-black/40 font-medium text-right">
                  <span>₱6,000</span><span>₱4,000</span><span>₱2,000</span><span>₱0</span>
                </div>
                
                {/* Bars & Lines Area */}
                <div className="absolute left-10 right-10 top-2 bottom-6 border-b border-black/10 flex items-end justify-between px-4">
                  {[60, 80, 75, 75, 65, 80, Math.min(100, occupancyPct)].map((h, i) => (
                    <div key={i} className="w-6 bg-[#A7F3D0] rounded-t-sm" style={{ height: `${h}%` }}></div>
                  ))}
                  
                  {/* SVG Lines */}
                  <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
                    <polyline points="20,40 100,20 180,30 260,25 340,45 420,20 500,30" fill="none" stroke="#3B82F6" strokeWidth="2"></polyline>
                    <polyline points="20,60 100,45 180,55 260,55 340,75 420,55 500,55" fill="none" stroke="#A855F7" strokeWidth="2"></polyline>
                    
                    {/* Points */}
                    {[
                      [20,40], [100,20], [180,30], [260,25], [340,45], [420,20], [500,30]
                    ].map((p,i) => <circle key={`b-${i}`} cx={p[0]} cy={p[1]} r="3" fill="#3B82F6" stroke="#fff" strokeWidth="1.5" />)}
                    
                    {[
                      [20,60], [100,45], [180,55], [260,55], [340,75], [420,55], [500,55]
                    ].map((p,i) => <circle key={`p-${i}`} cx={p[0]} cy={p[1]} r="3" fill="#A855F7" stroke="#fff" strokeWidth="1.5" />)}
                  </svg>
                </div>
                
                {/* X Axis Labels */}
                <div className="absolute left-10 right-10 bottom-0 h-6 flex items-end justify-between px-1">
                  {['Day -6', 'Day -5', 'Day -4', 'Day -3', 'Day -2', 'Day -1', 'Today'].map(d => (
                    <span key={d} className="text-[10px] text-black/60 font-medium whitespace-nowrap">{d}</span>
                  ))}
                </div>
              </div>
              <div className="mt-2 text-[11px] font-bold text-[#005530] flex items-center gap-1 cursor-pointer hover:underline">
                View Analytics Report <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
              </div>
            </div>

            {/* Pickup Summary */}
            <div className="col-span-3 bg-white border border-black/5 rounded-2xl shadow-sm p-5 relative flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-[10px] font-bold text-black/60 uppercase tracking-widest">Pickup Summary</h3>
                <span className="text-[10px] font-bold text-[#005530] cursor-pointer hover:underline">View All →</span>
              </div>
              <div className="flex flex-col justify-between flex-1 text-[12px] pb-2">
                <div className="flex justify-between items-center py-2.5 border-b border-black/5">
                  <span className="font-medium text-black/80">Today</span>
                  <span className="text-black/60 w-8 text-center">{arrivals}</span>
                  <span className="font-bold text-black/90 w-20 text-right">{fmtCurrency(arrivals * 3500)}</span>
                </div>
                <div className="flex justify-between items-center py-2.5 border-b border-black/5">
                  <span className="font-medium text-black/80">Tomorrow</span>
                  <span className="text-black/60 w-8 text-center">9</span>
                  <span className="font-bold text-black/90 w-20 text-right">₱11,680.00</span>
                </div>
                <div className="flex justify-between items-center py-2.5 border-b border-black/5">
                  <span className="font-medium text-black/80">Day 3</span>
                  <span className="text-black/60 w-8 text-center">14</span>
                  <span className="font-bold text-black/90 w-20 text-right">₱18,760.00</span>
                </div>
                <div className="flex justify-between items-center py-2.5 border-b border-black/5">
                  <span className="font-medium text-black/80">Day 4</span>
                  <span className="text-black/60 w-8 text-center">11</span>
                  <span className="font-bold text-black/90 w-20 text-right">₱14,520.00</span>
                </div>
                <div className="flex justify-between items-center py-3 mt-1">
                  <span className="font-bold text-[#005530]">Total (Next 7 Days)</span>
                  <span className="font-bold text-[#005530] w-8 text-center text-[13px]">{68 + arrivals}</span>
                  <span className="font-bold text-[#005530] w-20 text-right text-[13px]">{fmtCurrency(87200 + arrivals * 3500)}</span>
                </div>
              </div>
            </div>

          </div>

          {/* Row 3: Donut Charts & Bars */}
          <div className="grid grid-cols-3 gap-4">
            
            {/* Room Status */}
            <div className="bg-white border border-black/5 rounded-2xl shadow-sm p-5">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-[10px] font-bold text-black/60 uppercase tracking-widest">Room Status</h3>
                <span className="text-[10px] font-bold text-[#005530] cursor-pointer hover:underline">View Room Status →</span>
              </div>
              <div className="flex items-center gap-6">
                {/* Donut Chart */}
                <div className="w-32 h-32 relative shrink-0">
                  <svg viewBox="-4 -4 44 44" className="w-full h-full transform -rotate-90">
                    <path strokeDasharray="100, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#f1f5f9" strokeWidth="6"></path>
                    {/* Occupied */}
                    <path strokeDasharray={`${occupancyPct}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#22C55E" strokeWidth="6"></path>
                    {/* Available */}
                    <path strokeDasharray={`${(available/totalRooms)*100}, 100`} strokeDashoffset={`-${occupancyPct}`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#3B82F6" strokeWidth="6"></path>
                    {/* Out of order */}
                    <path strokeDasharray={`${(outOfOrder/totalRooms)*100}, 100`} strokeDashoffset={`-${Number(occupancyPct) + (available/totalRooms)*100}`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#F59E0B" strokeWidth="6"></path>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center mt-1">
                    <span className="text-xl font-black leading-none text-black/90">{totalRooms}</span>
                    <span className="text-[9px] font-medium text-black/50 mt-1">Total Rooms</span>
                  </div>
                </div>
                {/* Legend */}
                <div className="flex-1 space-y-3 text-[12px]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 w-20"><span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#22C55E' }}></span><span className="font-bold text-black/90 text-right w-4">{inHouse}</span> <span className="text-black/60">Occupied</span></div>
                    <span className="font-medium text-black/80">{occupancyPct}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 w-20"><span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#3B82F6' }}></span><span className="font-bold text-black/90 text-right w-4">{available}</span> <span className="text-black/60">Available</span></div>
                    <span className="font-medium text-black/80">{((available/totalRooms)*100).toFixed(1)}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 w-24"><span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#F59E0B' }}></span><span className="font-bold text-black/90 text-right w-4">{outOfOrder}</span> <span className="text-black/60 whitespace-nowrap">Out of Order</span></div>
                    <span className="font-medium text-black/80">{((outOfOrder/totalRooms)*100).toFixed(1)}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 w-20"><span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#EF4444' }}></span><span className="font-bold text-black/90 text-right w-4">0</span> <span className="text-black/60">Due Out</span></div>
                    <span className="font-medium text-black/80">0%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Housekeeping Overview — live computed_status from rooms */}
            <div className="bg-white border border-black/5 rounded-2xl shadow-sm p-5">
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-[10px] font-bold text-black/60 uppercase tracking-widest">Housekeeping Overview</h3>
                <span className="text-[10px] font-bold text-[#005530] cursor-pointer hover:underline">View HK Report →</span>
              </div>
              <div className="flex items-center gap-5">
                {/* Dynamic Donut */}
                <div className="w-32 h-32 relative shrink-0">
                  <svg viewBox="-4 -4 44 44" className="w-full h-full transform -rotate-90">
                    <path strokeDasharray="100, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#f1f5f9" strokeWidth="6"></path>
                    {derivedStats.hkStatuses.reduce((acc, s) => {
                      const pct = totalRooms > 0 ? (s.count / totalRooms) * 100 : 0;
                      const offset = -acc.offset;
                      acc.elements.push(
                        <path key={s.label}
                          strokeDasharray={`${pct.toFixed(2)}, 100`}
                          strokeDashoffset={String(offset.toFixed(2))}
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none" stroke={s.color} strokeWidth="6"
                        />
                      );
                      acc.offset += pct;
                      return acc;
                    }, { elements: [], offset: 0 }).elements}
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-xl font-black leading-none text-black/90">{totalRooms}</span>
                    <span className="text-[9px] font-medium text-black/50 mt-1">Total Rooms</span>
                  </div>
                </div>
                {/* Dynamic Legend */}
                <div className="flex-1 space-y-2 text-[11px]">
                  {derivedStats.hkStatuses.length === 0 ? (
                    <p className="text-black/40 text-xs text-center">No rooms found</p>
                  ) : derivedStats.hkStatuses.map(s => (
                    <div key={s.label} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: s.color }}></span>
                        <span className="font-medium text-black/80 whitespace-nowrap">{s.label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-black/90 w-5 text-right">{s.count}</span>
                        <span className="text-black/40 w-12 text-right">{totalRooms > 0 ? ((s.count/totalRooms)*100).toFixed(1) : '0.0'}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Top Revenue Categories */}
            <div className="bg-white border border-black/5 rounded-2xl shadow-sm p-5">
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-[10px] font-bold text-black/60 uppercase tracking-widest">Top Revenue Categories (Today)</h3>
                <span className="text-[10px] font-bold text-[#005530] cursor-pointer hover:underline">View Report →</span>
              </div>
              <div className="space-y-4">
                {/* Room Rev */}
                <div className="flex items-center gap-3 text-[11px]">
                  <div className="text-emerald-600"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 4v16"></path><path d="M2 8h18a2 2 0 0 1 2 2v10"></path><path d="M2 17h20"></path><path d="M6 8v9"></path></svg></div>
                  <span className="font-medium text-black/80 w-24">Room Revenue</span>
                  <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: '70.5%' }}></div>
                  </div>
                  <span className="font-bold text-black/90 w-16 text-right">{fmtCurrency(totalRevenue * 0.7)}</span>
                  <span className="font-medium text-black/50 w-8 text-right">70.5%</span>
                </div>
                {/* F&B */}
                <div className="flex items-center gap-3 text-[11px]">
                  <div className="text-blue-500"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20"></path><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg></div>
                  <span className="font-medium text-black/80 w-24">F&B Revenue</span>
                  <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: '16.9%' }}></div>
                  </div>
                  <span className="font-bold text-black/90 w-16 text-right">{fmtCurrency(totalRevenue * 0.17)}</span>
                  <span className="font-medium text-black/50 w-8 text-right">16.9%</span>
                </div>
                {/* Other Rev */}
                <div className="flex items-center gap-3 text-[11px]">
                  <div className="text-amber-500"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20"></path><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg></div>
                  <span className="font-medium text-black/80 w-24">Other Revenue</span>
                  <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full" style={{ width: '7.1%' }}></div>
                  </div>
                  <span className="font-bold text-black/90 w-16 text-right">{fmtCurrency(totalRevenue * 0.07)}</span>
                  <span className="font-medium text-black/50 w-8 text-right">7.1%</span>
                </div>
                {/* Taxes */}
                <div className="flex items-center gap-3 text-[11px]">
                  <div className="text-purple-500"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="15" x2="15.01" y2="15"></line></svg></div>
                  <span className="font-medium text-black/80 w-24">Taxes & Fees</span>
                  <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500 rounded-full" style={{ width: '6.3%' }}></div>
                  </div>
                  <span className="font-bold text-black/90 w-16 text-right">{fmtCurrency(totalRevenue * 0.06)}</span>
                  <span className="font-medium text-black/50 w-8 text-right">6.3%</span>
                </div>
              </div>
            </div>

          </div>

          {/* Row 4: Lists & Tables */}
          <div className="grid grid-cols-3 gap-4 pb-12">
            
            {/* Recent Reservations */}
            <div className="bg-white border border-black/5 rounded-2xl shadow-sm p-5">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-[10px] font-bold text-black/60 uppercase tracking-widest">Recent Reservations</h3>
                <span className="text-[10px] font-bold text-[#005530] cursor-pointer hover:underline">View All Reservations →</span>
              </div>
              <div className="text-[11px]">
                <div className="grid grid-cols-5 border-b border-black/5 pb-2 mb-2 font-bold text-black/50">
                  <div className="col-span-2">Guest Name</div>
                  <div>Check-in</div>
                  <div>Check-out</div>
                  <div className="text-right pr-2">Room</div>
                  <div className="text-right">Status</div>
                </div>
                {recent.length === 0 ? (
                  <div className="py-4 text-center text-black/40 font-medium">No recent reservations</div>
                ) : recent.map((g, i) => (
                  <div key={i} className="grid grid-cols-5 py-2.5 items-center hover:bg-gray-50 -mx-2 px-2 rounded-lg transition-colors cursor-pointer">
                    <div className="col-span-2 font-bold text-black/80 truncate pr-2">{g.full_name}</div>
                    <div className="font-medium text-black/60">{new Date(g.check_in_date || g.preferred_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric'})}</div>
                    <div className="font-medium text-black/60">{g.check_out_date ? new Date(g.check_out_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric'}) : '—'}</div>
                    <div className="text-right pr-2 font-bold text-black/80">{g.room_number || '—'}</div>
                    <div className="text-right">
                      <span className={`inline-block whitespace-nowrap px-2 py-0.5 border rounded text-[10px] font-bold tracking-wide ${g.status === 'confirmed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : g.status === 'checked_in' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-gray-50 text-gray-600 border-gray-100'} uppercase`}>
                        {g.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Source Donut — live data */}
            <div className="bg-white border border-black/5 rounded-2xl shadow-sm p-5 flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-[10px] font-bold text-black/60 uppercase tracking-widest">Reservation Source</h3>
                <span className="text-[10px] font-bold text-[#005530]">All Time</span>
              </div>
              <div className="flex items-center gap-6 flex-1">
                <div className="w-28 h-28 relative shrink-0">
                  <svg viewBox="-4 -4 44 44" className="w-full h-full transform -rotate-90">
                    <path strokeDasharray="100, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#f1f5f9" strokeWidth="8"></path>
                    {derivedStats.sourceCounts.reduce((acc, s) => {
                      const offset = -acc.offset;
                      acc.elements.push(
                        <path key={s.label}
                          strokeDasharray={`${s.pct}, 100`}
                          strokeDashoffset={String(offset)}
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none" stroke={s.color} strokeWidth="8"
                        />
                      );
                      acc.offset += parseFloat(s.pct);
                      return acc;
                    }, { elements: [], offset: 0 }).elements}
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-xl font-black leading-none text-black/90">{totalReservations}</span>
                    <span className="text-[8px] font-medium text-black/50 mt-1 leading-tight">Total<br/>Bookings</span>
                  </div>
                </div>
                <div className="flex-1 space-y-2.5 text-[11px]">
                  {derivedStats.sourceCounts.length === 0 ? (
                    <p className="text-black/40 text-center text-xs">No reservation data</p>
                  ) : derivedStats.sourceCounts.map(s => (
                    <div key={s.label} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: s.color }}></span>
                        <span className="font-medium text-black/80 truncate max-w-[80px]">{s.label}</span>
                      </div>
                      <div className="shrink-0">
                        <span className="font-bold text-black/90 mr-1">{s.count}</span>
                        <span className="text-black/40">({s.pct}%)</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Alerts & Notifications */}
            <div className="bg-white border border-black/5 rounded-2xl shadow-sm p-5 flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-[10px] font-bold text-black/60 uppercase tracking-widest">Alerts & Notifications</h3>
                <span className="text-[10px] font-bold text-[#005530] cursor-pointer hover:underline">View All →</span>
              </div>
              <div className="flex-1 flex flex-col justify-between gap-3 text-[11px]">
                {departures > 0 ? (
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0 mt-0.5"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg></div>
                    <div className="flex-1 font-medium text-black/80 leading-relaxed pr-2">{departures} room(s) are due for departure but folio is not yet settled.</div>
                    <div className="text-blue-600 font-bold cursor-pointer hover:underline whitespace-nowrap mt-0.5">View Details</div>
                  </div>
                ) : null}
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0 mt-0.5"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg></div>
                  <div className="flex-1 font-medium text-black/80 leading-relaxed pr-2">1 reservation(s) for today have not received deposit.</div>
                  <div className="text-blue-600 font-bold cursor-pointer hover:underline whitespace-nowrap mt-0.5">View Details</div>
                </div>
                {outOfOrder > 0 ? (
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 mt-0.5"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg></div>
                    <div className="flex-1 font-medium text-black/80 leading-relaxed pr-2">{outOfOrder} room(s) reported as maintenance.</div>
                    <div className="text-blue-600 font-bold cursor-pointer hover:underline whitespace-nowrap mt-0.5">View Details</div>
                  </div>
                ) : null}
                <div className="flex items-start gap-3">
                  <div className={`w-5 h-5 rounded-full ${auditMessage.includes('Completed') || auditMessage.includes('already been run') ? 'bg-green-100 text-green-600' : auditMessage.includes('failed') || auditMessage.includes('Error') ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'} flex items-center justify-center shrink-0 mt-0.5`}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg></div>
                  <div className="flex-1 font-medium text-black/80 leading-relaxed pr-2">{auditMessage}</div>
                  {(!auditMessage.includes('Completed') && !auditMessage.includes('already been run')) && (
                    <div onClick={handleNightAudit} className={`text-blue-600 font-bold cursor-pointer hover:underline whitespace-nowrap mt-0.5 ${isAuditRunning ? 'opacity-50 pointer-events-none' : ''}`}>
                      {isAuditRunning ? 'Running...' : 'Start Now'}
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
