import React from 'react';

export default function GuestProfileView({ guest, onBack }) {
  if (!guest) return null;

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';
  const fmtCurrency = (n) => `₱${(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const getInitialsColor = (name) => {
    const colors = ['bg-[#E8F5E9] text-[#2E7D32]', 'bg-[#E3F2FD] text-[#1565C0]', 'bg-[#FFF3E0] text-[#E65100]', 'bg-[#FCE4EC] text-[#C2185B]', 'bg-[#F3E5F5] text-[#6A1B9A]'];
    const idx = (name || '').charCodeAt(0) % colors.length;
    return colors[idx] || colors[0];
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: '120px', right: 0, bottom: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden', zIndex: 10, background: '#f8f9fa' }}>
      
      {/* Header Bar */}
      <div className="px-8 py-5 border-b border-black/5 bg-white shrink-0 flex items-center justify-between">
        <div className="flex items-center gap-2 text-[13px] font-medium text-black/60">
          <span className="hover:text-black cursor-pointer transition-colors" onClick={onBack}>Guests</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
          <span className="text-black font-black">Guest Profile</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-black/40" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            </div>
            <input type="text" placeholder="Search guest, reservation, folio..." 
              className="pl-9 pr-8 py-2 border border-black/10 rounded-lg text-[13px] w-[280px] outline-none focus:border-[#005530] focus:ring-1 focus:ring-[#005530] bg-white font-medium text-black/80 placeholder-black/40 shadow-sm" />
            <div className="absolute inset-y-0 right-0 pr-2 flex items-center">
              <span className="text-[10px] font-bold text-black/30 border border-black/10 rounded px-1.5 py-0.5 shadow-sm">⌘ K</span>
            </div>
          </div>
          
          <div className="relative cursor-pointer hover:bg-gray-50 p-2 rounded-full transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full border border-white"></span>
          </div>

          <button className="flex items-center gap-2 px-4 py-2 bg-[#005530] text-white hover:bg-[#004420] rounded-lg text-[13px] font-bold shadow-sm transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            New Reservation
          </button>
        </div>
      </div>

      {/* Main Content Scrollable Area */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-[1500px] mx-auto flex gap-6">
          
          {/* Left Column (Main Info) */}
          <div className="flex-1 space-y-6">
            
            {/* Top Identity Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-black/5 p-6 relative">
              <div className="absolute top-6 right-6">
                <button className="flex items-center gap-2 px-3 py-1.5 border border-black/10 rounded-lg text-[12px] font-bold text-black/80 hover:bg-gray-50 shadow-sm transition-colors">
                  Actions
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                </button>
              </div>

              <div className="flex items-center gap-4 mb-8">
                <div className={`w-[72px] h-[72px] rounded-full flex items-center justify-center font-black text-[24px] ${getInitialsColor(guest.name)}`}>
                  {guest.initials}
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-[26px] font-black tracking-tight text-black/90">{guest.name}</h1>
                    {guest.isVip && <span className="bg-amber-100 text-amber-700 text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-widest shadow-sm">VIP</span>}
                    {guest.totalStays > 1 && <span className="bg-[#E8F5E9] text-[#2E7D32] text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-widest shadow-sm">Repeat Guest</span>}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-y-6 gap-x-4">
                {/* Column 1 */}
                <div className="space-y-6">
                  <div className="flex items-start gap-3">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-black/40 mt-0.5"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                    <div>
                      <div className="text-[11px] font-bold text-black/40 mb-0.5">Email</div>
                      <div className="text-[13px] font-medium text-black/90">{guest.email}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-black/40 mt-0.5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                    <div>
                      <div className="text-[11px] font-bold text-black/40 mb-0.5">Phone</div>
                      <div className="text-[13px] font-medium text-black/90">{guest.phone}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-black/40 mt-0.5"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path><line x1="4" y1="22" x2="4" y2="15"></line></svg>
                    <div>
                      <div className="text-[11px] font-bold text-black/40 mb-0.5">Nationality</div>
                      <div className="text-[13px] font-medium text-black/90">{guest.nationality}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-black/40 mt-0.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                    <div>
                      <div className="text-[11px] font-bold text-black/40 mb-0.5">Date of Birth</div>
                      <div className="text-[13px] font-medium text-black/90">May 15, 1985 (39 y/o)</div>
                    </div>
                  </div>
                </div>

                {/* Column 2 */}
                <div className="space-y-6">
                  <div className="flex items-start gap-3">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-black/40 mt-0.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                    <div>
                      <div className="text-[11px] font-bold text-black/40 mb-0.5">ID Type</div>
                      <div className="text-[13px] font-medium text-black/90">Passport</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-black/40 mt-0.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                    <div>
                      <div className="text-[11px] font-bold text-black/40 mb-0.5">ID / Passport No.</div>
                      <div className="text-[13px] font-medium text-black/90">P1234567A</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-black/40 mt-0.5"><circle cx="12" cy="12" r="4"></circle><path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-3.92 7.94"></path></svg>
                    <div>
                      <div className="text-[11px] font-bold text-black/40 mb-0.5">Gender</div>
                      <div className="text-[13px] font-medium text-black/90">Male</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-black/40 mt-0.5"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
                    <div>
                      <div className="text-[11px] font-bold text-black/40 mb-0.5">Language</div>
                      <div className="text-[13px] font-medium text-black/90">{guest.language}</div>
                    </div>
                  </div>
                </div>

                {/* Column 3 */}
                <div className="space-y-6">
                  <div className="flex items-start gap-3">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-black/40 mt-0.5"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect><rect x="9" y="9" width="6" height="6"></rect><line x1="9" y1="1" x2="9" y2="4"></line><line x1="15" y1="1" x2="15" y2="4"></line><line x1="9" y1="20" x2="9" y2="23"></line><line x1="15" y1="20" x2="15" y2="23"></line><line x1="20" y1="9" x2="23" y2="9"></line><line x1="20" y1="14" x2="23" y2="14"></line><line x1="1" y1="9" x2="4" y2="9"></line><line x1="1" y1="14" x2="4" y2="14"></line></svg>
                    <div>
                      <div className="text-[11px] font-bold text-black/40 mb-0.5">Company</div>
                      <div className="text-[13px] font-medium text-black/90">{guest.company}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-black/40 mt-0.5"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path><path d="M22 12A10 10 0 0 0 12 2v10z"></path></svg>
                    <div>
                      <div className="text-[11px] font-bold text-black/40 mb-0.5">Market Segment</div>
                      <div className="text-[13px] font-medium text-black/90">Corporate</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-black/40 mt-0.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                    <div>
                      <div className="text-[11px] font-bold text-black/40 mb-0.5">Referred By</div>
                      <div className="text-[13px] font-medium text-black/90">Website</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-black/40 mt-0.5"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                    <div>
                      <div className="text-[11px] font-bold text-black/40 mb-0.5">Created On</div>
                      <div className="text-[13px] font-medium text-black/90">Jan 12, 2024 by Maria Santos</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Horizontal Tabs */}
            <div className="border-b border-black/10 flex items-center gap-8 text-[13px] font-bold text-black/50 px-2 mt-4">
              <div className="pb-3 border-b-2 border-[#005530] text-[#005530] cursor-pointer">Profile</div>
              <div className="pb-3 border-b-2 border-transparent hover:text-black cursor-pointer transition-colors">Stay History</div>
              <div className="pb-3 border-b-2 border-transparent hover:text-black cursor-pointer transition-colors">Reservations</div>
              <div className="pb-3 border-b-2 border-transparent hover:text-black cursor-pointer transition-colors">Folio & Payments</div>
              <div className="pb-3 border-b-2 border-transparent hover:text-black cursor-pointer transition-colors">Preferences</div>
              <div className="pb-3 border-b-2 border-transparent hover:text-black cursor-pointer transition-colors">Documents</div>
              <div className="pb-3 border-b-2 border-transparent hover:text-black cursor-pointer transition-colors">Notes</div>
              <div className="pb-3 border-b-2 border-transparent hover:text-black cursor-pointer transition-colors">Communication</div>
              <div className="pb-3 border-b-2 border-transparent hover:text-black cursor-pointer transition-colors">Loyalty</div>
            </div>

            {/* Profile Content Blocks */}
            <div className="space-y-6 mt-6">
              
              {/* Contact Information */}
              <div className="bg-white rounded-2xl shadow-sm border border-black/5 overflow-hidden">
                <div className="px-6 py-4 border-b border-black/5 flex items-center justify-between">
                  <h3 className="text-[14px] font-black text-black/90 tracking-tight">Contact Information</h3>
                  <button className="px-3 py-1 border border-black/10 rounded-md text-[12px] font-bold text-black/60 hover:bg-gray-50 transition-colors shadow-sm">Edit</button>
                </div>
                <div className="p-6 grid grid-cols-2 gap-x-12 gap-y-6">
                  <div className="flex items-start gap-4">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-black/40 mt-0.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                    <div>
                      <div className="text-[11px] font-bold text-black/40 mb-1">Address</div>
                      <div className="text-[13px] font-medium text-black/90 leading-relaxed">
                        123 Mabini Street, Barangay Basak,<br />
                        Lapu-Lapu City, Cebu 6015, Philippines
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-black/40 mt-0.5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                    <div>
                      <div className="text-[11px] font-bold text-black/40 mb-1">Phone</div>
                      <div className="text-[13px] font-medium text-black/90">{guest.phone}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-black/40 mt-0.5"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                    <div>
                      <div className="text-[11px] font-bold text-black/40 mb-1">Email</div>
                      <div className="text-[13px] font-medium text-black/90">{guest.email}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-black/40 mt-0.5"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                    <div>
                      <div className="text-[11px] font-bold text-black/40 mb-1">WhatsApp</div>
                      <div className="text-[13px] font-medium text-black/90">{guest.phone}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              <div className="bg-white rounded-2xl shadow-sm border border-black/5 overflow-hidden">
                <div className="px-6 py-4 border-b border-black/5 flex items-center justify-between">
                  <h3 className="text-[14px] font-black text-black/90 tracking-tight">Additional Information</h3>
                  <button className="px-3 py-1 border border-black/10 rounded-md text-[12px] font-bold text-black/60 hover:bg-gray-50 transition-colors shadow-sm">Edit</button>
                </div>
                <div className="p-6 grid grid-cols-2 gap-x-12 gap-y-6">
                  <div>
                    <div className="text-[11px] font-bold text-black/40 mb-1">Occupation</div>
                    <div className="text-[13px] font-medium text-black/90">Software Engineer</div>
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-black/40 mb-1">Source of Business</div>
                    <div className="text-[13px] font-medium text-black/90">Website</div>
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-black/40 mb-1">ID Issued By</div>
                    <div className="text-[13px] font-medium text-black/90">DFA Philippines</div>
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-black/40 mb-1">ID Expiry Date</div>
                    <div className="text-[13px] font-medium text-black/90">May 15, 2030</div>
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-black/40 mb-1">Special Requests</div>
                    <div className="text-[13px] font-medium text-black/90">High floor, Quiet room, Non-smoking</div>
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-black/40 mb-1">Remarks</div>
                    <div className="text-[13px] font-medium text-black/90">Prefers early check-in if available.</div>
                  </div>
                </div>
              </div>

              {/* Loyalty Information */}
              <div className="bg-white rounded-2xl shadow-sm border border-black/5 overflow-hidden">
                <div className="px-6 py-4 border-b border-black/5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-black/80"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                    <h3 className="text-[14px] font-black text-black/90 tracking-tight">Loyalty Information</h3>
                  </div>
                  <button className="px-3 py-1 border border-black/10 rounded-md text-[12px] font-bold text-black/60 hover:bg-gray-50 transition-colors shadow-sm">View Loyalty Details</button>
                </div>
                <div className="p-6 grid grid-cols-2 gap-x-12 gap-y-6">
                  <div>
                    <div className="text-[11px] font-bold text-black/40 mb-1">Membership Tier</div>
                    <div className="text-[13px] font-medium text-black/90">Gold</div>
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-black/40 mb-1">Points Balance</div>
                    <div className="text-[13px] font-medium text-black/90">1,250 pts</div>
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-black/40 mb-1">Member Since</div>
                    <div className="text-[13px] font-medium text-black/90">Jan 12, 2024</div>
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-black/40 mb-1">Last Earned</div>
                    <div className="text-[13px] font-medium text-black/90">May 10, 2025</div>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Right Column (Widgets) */}
          <div className="w-[360px] shrink-0 space-y-6">
            
            {/* Account Summary */}
            <div className="bg-white rounded-2xl shadow-sm border border-black/5 overflow-hidden">
              <div className="px-5 py-4 border-b border-black/5">
                <h3 className="text-[14px] font-black text-black/90 tracking-tight">Account Summary</h3>
              </div>
              <div className="p-5 space-y-3">
                <div className="flex items-center justify-between text-[13px]">
                  <span className="text-black/60 font-medium">Total Stays</span>
                  <span className="font-bold text-black/90">{guest.totalStays}</span>
                </div>
                <div className="flex items-center justify-between text-[13px]">
                  <span className="text-black/60 font-medium">Total Nights</span>
                  <span className="font-bold text-black/90">{guest.totalNights}</span>
                </div>
                <div className="flex items-center justify-between text-[13px]">
                  <span className="text-black/60 font-medium">Total Reservations</span>
                  <span className="font-bold text-black/90">{guest.totalStays}</span>
                </div>
                <div className="flex items-center justify-between text-[13px] pt-2 border-t border-black/5">
                  <span className="text-black/60 font-medium">Total Charges</span>
                  <span className="font-bold text-black/90">{fmtCurrency(guest.totalSpent)}</span>
                </div>
                <div className="flex items-center justify-between text-[13px]">
                  <span className="text-black/60 font-medium">Total Payments</span>
                  <span className="font-bold text-black/90">{fmtCurrency(guest.totalSpent)}</span>
                </div>
                <div className="flex items-center justify-between text-[13px] pt-2 border-t border-black/5">
                  <span className="text-black/80 font-black">Outstanding Balance</span>
                  <span className="font-bold text-emerald-600">₱0.00</span>
                </div>
                <button className="w-full mt-4 py-2 bg-[#E8F5E9] text-[#005530] hover:bg-emerald-100 rounded-lg text-[12px] font-bold tracking-tight transition-colors shadow-sm">
                  View Current Folio
                </button>
              </div>
            </div>

            {/* Stay History (Last 5) */}
            <div className="bg-white rounded-2xl shadow-sm border border-black/5 overflow-hidden">
              <div className="px-5 py-4 border-b border-black/5 flex items-center justify-between">
                <h3 className="text-[14px] font-black text-black/90 tracking-tight">Stay History (Last 5)</h3>
                <span className="text-[12px] font-bold text-[#005530] cursor-pointer hover:underline">View All</span>
              </div>
              <div className="flex flex-col divide-y divide-black/5">
                {guest.stays.slice(0, 5).map((stay, idx) => {
                  const checkIn = new Date(stay.check_in_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                  const checkOut = new Date(stay.check_out_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                  let sStatus = stay.status === 'checked_in' ? 'In-House' : (stay.status === 'confirmed' ? 'Confirmed' : 'Checked-Out');
                  let sColor = sStatus === 'In-House' ? 'text-emerald-600' : 'text-black/60';
                  
                  return (
                    <div key={idx} className="px-5 py-3 flex items-center justify-between text-[12px]">
                      <span className="text-black/80 font-medium w-[140px] truncate">{checkIn} - {checkOut}</span>
                      <span className="text-black/60">{stay.nights} Night{stay.nights > 1 ? 's' : ''}</span>
                      <span className={`font-bold w-[70px] text-right ${sColor}`}>{sStatus}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Notes */}
            <div className="bg-white rounded-2xl shadow-sm border border-black/5 overflow-hidden">
              <div className="px-5 py-4 border-b border-black/5 flex items-center justify-between">
                <h3 className="text-[14px] font-black text-black/90 tracking-tight">Notes</h3>
                <span className="text-[12px] font-bold text-[#005530] cursor-pointer flex items-center gap-1 hover:underline">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                  Add Note
                </span>
              </div>
              <div className="p-5 space-y-3">
                <div className="bg-[#FFF8E1] border border-[#FFECB3] rounded-xl p-3 relative">
                  <p className="text-[12px] font-medium text-black/80 pr-6">Prefers rooms away from elevator.</p>
                  <p className="text-[10px] text-black/40 mt-1 font-medium">May 10, 2025 10:15 AM by Maria Santos</p>
                  <button className="absolute top-3 right-2 text-black/40 hover:text-black/80">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>
                  </button>
                </div>
                <div className="bg-[#E3F2FD] border border-[#BBDEFB] rounded-xl p-3 relative">
                  <p className="text-[12px] font-medium text-black/80 pr-6">Celebrated birthday last stay. Sent cake to room.</p>
                  <p className="text-[10px] text-black/40 mt-1 font-medium">Apr 12, 2025 4:30 PM by John Cruz</p>
                  <button className="absolute top-3 right-2 text-black/40 hover:text-black/80">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>
                  </button>
                </div>
                <div className="bg-white border border-black/10 rounded-xl p-3 relative">
                  <p className="text-[12px] font-medium text-black/80 pr-6">Requested late check-out until 2:00 PM.</p>
                  <p className="text-[10px] text-black/40 mt-1 font-medium">Mar 17, 2025 9:20 AM by Maria Santos</p>
                  <button className="absolute top-3 right-2 text-black/40 hover:text-black/80">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Documents */}
            <div className="bg-white rounded-2xl shadow-sm border border-black/5 overflow-hidden">
              <div className="px-5 py-4 border-b border-black/5 flex items-center justify-between">
                <h3 className="text-[14px] font-black text-black/90 tracking-tight">Documents</h3>
                <span className="text-[12px] font-bold text-[#005530] cursor-pointer flex items-center gap-1 hover:underline">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                  Add Document
                </span>
              </div>
              <div className="p-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 border border-[#EF5350] bg-[#FFEBEE] rounded flex items-center justify-center shrink-0">
                    <span className="text-[10px] font-black text-[#EF5350]">PDF</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[12px] font-bold text-black/90 truncate">Passport - {guest.name}.pdf</div>
                    <div className="text-[10px] text-black/40 font-medium truncate mt-0.5">Uploaded on Jan 12, 2024 by Maria Santos</div>
                  </div>
                  <button className="text-black/40 hover:text-black/80 cursor-pointer">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

    </div>
  );
}
