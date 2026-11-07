import React from 'react';

export default function NewBookingAlertModal({
  booking,
  isOpen,
  onClose,
  onViewBooking,
  isChiming,
  onSilence
}) {
  if (!isOpen || !booking) return null;

  const fmtDate = (d) => {
    if (!d) return '—';
    if (typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d)) {
      const [y, m, day] = d.split('-').map(Number);
      return new Date(y, m - 1, day).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
    const dt = new Date(d);
    return isNaN(dt.getTime()) ? '—' : dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const nights = () => {
    if (!booking.check_in_date || !booking.check_out_date) return 1;
    const d1 = new Date(booking.check_in_date);
    const d2 = new Date(booking.check_out_date);
    const diff = Math.round((d2 - d1) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 1;
  };

  const nightsCount = nights();
  const roomRate = Number(booking.room_rate || booking.price_per_night || 0);
  const estimatedTotal = Number(booking.total_price || booking.price || (roomRate ? roomRate * nightsCount : 0));

  return (
    <div className="fixed inset-0 z-[9999] bg-black/65 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-black/10 w-full max-w-lg overflow-hidden flex flex-col animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header with vibrant hotel green gradient and animated bell */}
        <div className="bg-gradient-to-r from-[#005530] via-[#006837] to-[#004d2c] px-6 py-5 text-white flex items-center justify-between relative overflow-hidden">
          {/* Subtle background glow effect */}
          <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none" />

          <div className="flex items-center gap-3.5 relative z-10">
            <div className="relative">
              <div className="w-12 h-12 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center text-2xl shadow-inner backdrop-blur-xs">
                🛎️
              </div>
              <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-80"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-amber-400 border border-white"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black tracking-[0.2em] uppercase bg-amber-400 text-black px-2 py-0.5 rounded-full shadow-2xs">
                  New Arrival
                </span>
                {isChiming && (
                  <span className="text-[10px] font-bold text-emerald-200 flex items-center gap-1">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse"></span>
                    Chiming
                  </span>
                )}
              </div>
              <h2 className="text-[19px] font-black tracking-tight text-white mt-0.5">
                New Booking Received!
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-white/60 hover:text-white hover:bg-white/10 w-8 h-8 rounded-full flex items-center justify-center transition-colors relative z-10"
            title="Dismiss notification"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4">
          
          {/* Guest Identity Card */}
          <div className="bg-[#f8f9fa] rounded-xl p-4 border border-black/5 flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-black/40">Guest Details</span>
              <div className="text-[17px] font-black text-black/90">
                {booking.full_name || 'Guest'}
              </div>
              <div className="flex flex-wrap items-center gap-3 text-[12px] text-black/60 pt-0.5">
                {booking.phone_number && (
                  <span className="flex items-center gap-1 font-medium">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                    {booking.phone_number}
                  </span>
                )}
                {booking.email && (
                  <span className="flex items-center gap-1 font-medium">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                    {booking.email}
                  </span>
                )}
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-black text-black/40 uppercase tracking-wider block">Reference</span>
              <span className="inline-block mt-0.5 px-2.5 py-1 bg-[#005530]/10 text-[#005530] font-black text-[12px] rounded-md border border-[#005530]/20">
                #{booking.reference || `RES-${booking.id}`}
              </span>
            </div>
          </div>

          {/* Reservation Breakdown Grid */}
          <div className="grid grid-cols-2 gap-3 text-[12px]">
            <div className="bg-[#f8f9fa] rounded-xl p-3 border border-black/5">
              <span className="text-[10px] font-bold text-black/40 uppercase tracking-wider block mb-1">Room Reserved</span>
              <div className="font-extrabold text-black/90 text-[13px]">{booking.room_type || 'Standard'}</div>
              <div className="text-black/50 text-[11px] mt-0.5">{booking.number_of_guests || 1} Guest{(booking.number_of_guests || 1) > 1 ? 's' : ''}</div>
            </div>

            <div className="bg-[#f8f9fa] rounded-xl p-3 border border-black/5">
              <span className="text-[10px] font-bold text-black/40 uppercase tracking-wider block mb-1">Stay Duration</span>
              <div className="font-extrabold text-[#005530] text-[13px]">{nightsCount} Night{nightsCount > 1 ? 's' : ''}</div>
              <div className="text-black/60 text-[11px] mt-0.5 whitespace-nowrap">
                {fmtDate(booking.check_in_date)} &rarr; {fmtDate(booking.check_out_date)}
              </div>
            </div>
          </div>

          {/* Estimated Amount & Status */}
          <div className="flex items-center justify-between px-3 py-2 bg-emerald-50/60 rounded-xl border border-emerald-100 text-[12px]">
            <span className="font-bold text-emerald-900">Total Rate / Price</span>
            <span className="font-black text-emerald-700 text-[15px]">
              {estimatedTotal > 0 
                ? `₱${estimatedTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                : '₱0.00'}
            </span>
          </div>

          {/* Special Requests (if any) */}
          {booking.special_requests && (
            <div className="bg-amber-50/60 border border-amber-200/80 rounded-xl p-3 text-[11px]">
              <span className="font-bold text-amber-900 block mb-0.5 uppercase tracking-wider text-[10px]">Special Requests:</span>
              <p className="text-amber-800 italic">{booking.special_requests}</p>
            </div>
          )}

          {/* Sound Mute Quick-Control */}
          {isChiming && (
            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-black/50 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                Chime is ringing to alert staff
              </span>
              <button
                type="button"
                onClick={onSilence}
                className="text-[11px] font-bold text-red-600 hover:text-red-700 hover:underline flex items-center gap-1"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>
                Silence Bell
              </button>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-gray-50/80 border-t border-black/5 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-black/10 bg-white hover:bg-gray-100 text-black/70 font-bold text-[12px] shadow-2xs transition-colors"
          >
            Acknowledge & Close
          </button>
          
          <button
            type="button"
            onClick={() => onViewBooking(booking)}
            className="px-5 py-2.5 rounded-xl bg-[#005530] hover:bg-[#004420] text-white font-bold text-[12px] shadow-md transition-all flex items-center gap-2"
          >
            <span>Review & Confirm</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
        </div>

      </div>
    </div>
  );
}
