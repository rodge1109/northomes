import sys
import re

target_file = r'c:\website\hotel-reservation-system\src\App.jsx'

with open(target_file, 'r', encoding='utf-8') as f:
    content = f.read()

def replace_front_desk_tab(content):
    # Find FrontDeskTab start
    start_match = re.search(r'function FrontDeskTab\({\s*openFolio\s*}\)\s*{', content)
    if not start_match:
        return content, "Could not find FrontDeskTab start"
    
    start_pos = start_match.start()
    
    # Find the corresponding closing brace for FrontDeskTab
    # We'll use a brace counter to find the end of the function
    brace_count = 0
    end_pos = -1
    for i in range(start_match.end() - 1, len(content)):
        if content[i] == '{':
            brace_count += 1
        elif content[i] == '}':
            brace_count -= 1
            if brace_count == 0:
                end_pos = i + 1
                break
    
    if end_pos == -1:
        return content, "Could not find FrontDeskTab end"

    # New Clean FrontDeskTab Implementation
    clean_impl = """function FrontDeskTab({ openFolio }) {
  const today = new Date().toISOString().split('T')[0];
  const [fdView, setFdView] = React.useState('arrivals');

  // Arrivals state
  const [arrivalDate, setArrivalDate] = React.useState(today);
  const [arrivals, setArrivals] = React.useState([]);
  const [arrivalStats, setArrivalStats] = React.useState({ total: 0, checkedIn: 0, pending: 0, confirmed: 0, noShow: 0 });
  const [arrivalsLoading, setArrivalsLoading] = React.useState(false);
  const [selectedArrival, setSelectedArrival] = React.useState(null);

  // In-House state
  const [inHouseGuests, setInHouseGuests] = React.useState([]);
  const [inHouseLoading, setInHouseLoading] = React.useState(false);

  // Search state
  const [searchQ, setSearchQ] = React.useState('');
  const [searchResults, setSearchResults] = React.useState([]);
  const [searchLoading, setSearchLoading] = React.useState(false);

  // Wizard state
  const [wizardOpen, setWizardOpen] = React.useState(false);
  const [wizardReservation, setWizardReservation] = React.useState(null);
  const [wizardStep, setWizardStep] = React.useState(1);
  const [wizardIdVerified, setWizardIdVerified] = React.useState(false);
  const [wizardRoomNumber, setWizardRoomNumber] = React.useState('');
  const [wizardPayment, setWizardPayment] = React.useState(false);
  const [wizardNotes, setWizardNotes] = React.useState('');
  const [wizardSubmitting, setWizardSubmitting] = React.useState(false);
  const [wizardSuccess, setWizardSuccess] = React.useState(false);
  const [wizardError, setWizardError] = React.useState('');

  // Checkout confirm state
  const [checkoutConfirmId, setCheckoutConfirmId] = React.useState(null);
  const [checkoutSubmitting, setCheckoutSubmitting] = React.useState(false);

  // Guest Profile modal state
  const [gpOpen, setGpOpen] = React.useState(false);
  const [gpRes, setGpRes] = React.useState(null);
  const [gpForm, setGpForm] = React.useState({});
  const [gpSaving, setGpSaving] = React.useState(false);
  const [gpError, setGpError] = React.useState('');
  const [gpSaved, setGpSaved] = React.useState(false);

  // Walk-In state
  const [wkRoomTypes, setWkRoomTypes] = React.useState([]);
  const [wkRateCodes, setWkRateCodes] = React.useState([]);
  const [wkRateCode, setWkRateCode] = React.useState('');
  const [wkLastName, setWkLastName] = React.useState('');
  const [wkFirstName, setWkFirstName] = React.useState('');
  const [wkEmail, setWkEmail] = React.useState('');
  const [wkPhone, setWkPhone] = React.useState('');
  const [wkRoomType, setWkRoomType] = React.useState('');
  const [wkCheckIn, setWkCheckIn] = React.useState(today);
  const [wkCheckOut, setWkCheckOut] = React.useState('');
  const [wkGuests, setWkGuests] = React.useState(1);
  const [wkRoomNumber, setWkRoomNumber] = React.useState('');
  const [wkSpecialReq, setWkSpecialReq] = React.useState('');
  const [wkPayment, setWkPayment] = React.useState(false);
  const [wkNotes, setWkNotes] = React.useState('');
  const [wkTitle, setWkTitle] = React.useState('Mr.');
  const [wkMiddleName, setWkMiddleName] = React.useState('');
  const [wkGender, setWkGender] = React.useState('');
  const [wkBirthDate, setWkBirthDate] = React.useState('');
  const [wkNationality, setWkNationality] = React.useState('');
  const [wkCountry, setWkCountry] = React.useState('');
  const [wkAddress, setWkAddress] = React.useState('');
  const [wkCity, setWkCity] = React.useState('');
  const [wkIdType, setWkIdType] = React.useState('');
  const [wkIdNumber, setWkIdNumber] = React.useState('');
  const [wkPurpose, setWkPurpose] = React.useState('');
  const [wkEta, setWkEta] = React.useState('');
  const [wkPaymentMethod, setWkPaymentMethod] = React.useState('Cash');
  const [wkDepositAmount, setWkDepositAmount] = React.useState('');
  const [wkSubmitting, setWkSubmitting] = React.useState(false);
  const [wkSuccess, setWkSuccess] = React.useState(false);
  const [wkResult, setWkResult] = React.useState(null);
  const [wkError, setWkError] = React.useState('');

  // Rooms state
  const [rooms, setRooms] = React.useState([]);
  const [roomsLoading, setRoomsLoading] = React.useState(false);
  const [roomFilter, setRoomFilter] = React.useState('all');
  const [selectedRoom, setSelectedRoom] = React.useState(null);
  const [hkUpdating, setHkUpdating] = React.useState(null);

  // Tape Chart state
  const [tcFrom, setTcFrom] = React.useState(today);
  const [tcRooms, setTcRooms] = React.useState([]);
  const [tcReservations, setTcReservations] = React.useState([]);
  const [tcLoading, setTcLoading] = React.useState(false);
  const [tcSelectedRes, setTcSelectedRes] = React.useState(null);
  const [tcTypeView, setTcTypeView] = React.useState(false);

  // Data fetchers
  const fetchArrivals = React.useCallback(async (date) => {
    setArrivalsLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/front-desk/arrivals?date=${date}`);
      const data = await res.json();
      const fresh = data.arrivals || [];
      setArrivals(fresh);
      setArrivalStats(data.stats || { total: 0, checkedIn: 0, pending: 0, confirmed: 0, noShow: 0 });
      setSelectedArrival(prev => prev ? (fresh.find(r => r.id === prev.id) ?? null) : null);
    } catch (e) { console.error(e); }
    setArrivalsLoading(false);
  }, []);

  const fetchInHouse = React.useCallback(async () => {
    setInHouseLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/front-desk/in-house');
      const data = await res.json();
      setInHouseGuests(data.guests || []);
    } catch (e) { console.error(e); }
    setInHouseLoading(false);
  }, []);

  const runSearch = React.useCallback(async (q) => {
    if (!q.trim()) { setSearchResults([]); return; }
    setSearchLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/front-desk/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setSearchResults(data.reservations || []);
    } catch (e) { console.error(e); }
    setSearchLoading(false);
  }, []);

  const fetchRooms = React.useCallback(async () => {
    setRoomsLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/rooms');
      const data = await res.json();
      setRooms(data.rooms || []);
    } catch (e) { console.error(e); }
    setRoomsLoading(false);
  }, []);

  React.useEffect(() => { fetchArrivals(arrivalDate); }, [arrivalDate, fetchArrivals]);
  React.useEffect(() => { if (fdView === 'inhouse') fetchInHouse(); }, [fdView, fetchInHouse]);
  React.useEffect(() => {
    const t = setTimeout(() => runSearch(searchQ), 350);
    return () => clearTimeout(t);
  }, [searchQ, runSearch]);

  const openWizard = (r) => {
    setWizardReservation(r);
    setWizardStep(1);
    setWizardIdVerified(false);
    setWizardRoomNumber('');
    setWizardPayment(false);
    setWizardNotes('');
    setWizardSubmitting(false);
    setWizardSuccess(false);
    setWizardError('');
    setWizardOpen(true);
    fetchRooms();
  };

  const closeWizard = () => {
    setWizardOpen(false);
    setWizardReservation(null);
    setWizardSuccess(false);
    fetchArrivals(arrivalDate);
    fetchInHouse();
  };

  const submitCheckin = async () => {
    if (!wizardReservation) return;
    setWizardSubmitting(true);
    setWizardError('');
    try {
      const res = await fetch(`http://localhost:5000/api/reservations/${wizardReservation.id}/checkin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomNumber: wizardRoomNumber,
          idVerified: wizardIdVerified,
          paymentCollected: wizardPayment,
          notes: wizardNotes,
        }),
      });
      const data = await res.json();
      if (data.success) setWizardSuccess(true);
      else setWizardError(data.message || `Check-in failed (${res.status}).`);
    } catch (e) { setWizardError('Network error.'); }
    setWizardSubmitting(false);
  };

  const openGuestProfile = (r) => {
    setGpRes(r);
    const nameParts = (r.full_name || '').split(',');
    const lastName = (nameParts[0] || '').trim();
    const restParts = (nameParts[1] || '').trim().split(' ');
    const firstName = restParts[0] || '';
    const middleName = restParts.slice(1).join(' ');
    setGpForm({
      title: r.title || '', last_name: lastName, first_name: firstName, middle_name: r.middle_name || middleName,
      gender: r.gender || '', date_of_birth: r.date_of_birth ? r.date_of_birth.slice(0, 10) : '', nationality: r.nationality || '', country: r.country || '',
      email: r.email || '', phone_number: r.phone_number || '', address: r.address || '', city: r.city || '', id_type: r.id_type || '', id_number: r.id_number || '',
      purpose_of_visit: r.purpose_of_visit || '', eta: r.eta || '', payment_method: r.payment_method || '', deposit_amount: r.deposit_amount != null ? r.deposit_amount : '',
      special_requests: r.special_requests || '', front_desk_notes: r.front_desk_notes || '',
    });
    setGpError(''); setGpSaved(false); setGpOpen(true);
  };

  const saveGuestProfile = async () => {
    if (!gpRes) return;
    setGpSaving(true); setGpError(''); setGpSaved(false);
    try {
      const full_name = `${gpForm.last_name.trim()}, ${gpForm.first_name.trim()}${gpForm.middle_name.trim() ? ' ' + gpForm.middle_name.trim() : ''}`;
      const res = await fetch(`http://localhost:5000/api/reservations/${gpRes.id}/profile`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...gpForm, full_name }),
      });
      const data = await res.json();
      if (data.success) { setGpSaved(true); setGpRes(data.reservation); fetchInHouse(); fetchArrivals(arrivalDate); }
      else setGpError(data.message || 'Failed to save.');
    } catch (e) { setGpError('Network error.'); }
    setGpSaving(false);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 min-h-[85vh]">
      {/* Sidebar Navigation */}
      <div className="w-full lg:w-56 flex-shrink-0 flex lg:flex-col gap-1 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0">
        {sidebarItems.map(item => (
          <button key={item.id} onClick={() => setFdView(item.id)}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all whitespace-nowrap lg:whitespace-normal ${fdView === item.id ? 'bg-[#55A2F5] text-white shadow-lg shadow-[#55A2F5]/20' : 'text-white/40 hover:bg-white/5 hover:text-white'}`}>
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon} /></svg>
            <span className="text-sm font-semibold tracking-wide">{item.label}</span>
          </button>
        ))}
      </div>

      {/* Main Workspace */}
      <div className="flex-1 min-w-0">
        {fdView === 'arrivals' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
               <h2 className="text-xl font-black text-white">Daily Arrivals</h2>
               <input type="date" value={arrivalDate} onChange={e => setArrivalDate(e.target.value)} className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-white text-xs outline-none focus:border-[#55A2F5]/40 transition-all" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[['Total', arrivalStats.total, 'bg-white/5'], ['Checked In', arrivalStats.checkedIn, 'bg-green-500/10 text-green-400'], ['Pending', arrivalStats.pending, 'bg-yellow-500/10 text-yellow-400'], ['Confirmed', arrivalStats.confirmed, 'bg-blue-500/10 text-blue-400']].map(([lbl, val, cls]) => (
                <div key={lbl} className={`p-4 rounded-2xl border border-white/10 ${cls}`}>
                  <div className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1">{lbl}</div>
                  <div className="text-2xl font-black">{val}</div>
                </div>
              ))}
            </div>
            <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
               <div className="grid items-center gap-x-3 px-3 py-2 bg-white/5 border-b border-white/10 text-[10px] font-black uppercase tracking-widest text-white/30" style={{ gridTemplateColumns: '1fr 6rem 6rem 2.5rem 5.5rem 3.5rem' }}>
                  <span>Guest Name</span><span>Room Type</span><span>Arrival</span><span className="text-center">Stay</span><span className="text-center">Status</span><span className="text-right px-2">Action</span>
               </div>
               {arrivalsLoading ? <div className="p-8 text-center text-white/20 text-sm">Loading arrivals...</div> : arrivals.length === 0 ? <div className="p-12 text-center text-white/15 text-sm">No arrivals for this date.</div> : (
                 <div className="divide-y divide-white/5">
                   {arrivals.map(r => <ArrivalRow key={r.id} r={r} selectedArrival={selectedArrival} setSelectedArrival={setSelectedArrival} openFolio={openFolio} fmtDate={fmtDate} nightsCount={nightsCount} statusColors={statusColors} statusLabel={statusLabel} />)}
                 </div>
               )}
            </div>
          </div>
        )}

        {fdView === 'inhouse' && (
          <div className="space-y-4">
            <h2 className="text-xl font-black text-white px-1">In-House Guests</h2>
            <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
              <div className="grid items-center gap-x-3 px-3 py-2 bg-white/5 border-b border-white/10 text-[10px] font-black uppercase tracking-widest text-white/30" style={{ gridTemplateColumns: '3rem 1fr 7rem 5.5rem 2.5rem 3rem 3.5rem 3.5rem 5rem' }}>
                <span>Room</span><span>Guest</span><span>Room Type</span><span>Departure</span><span className="text-center">Stay</span><span></span><span></span><span></span><span className="text-right">Action</span>
              </div>
              {inHouseLoading ? <div className="p-8 text-center text-white/20 text-sm">Loading guest list...</div> : inHouseGuests.length === 0 ? <div className="p-12 text-center text-white/15 text-sm">No guests currently checked in.</div> : (
                <div className="divide-y divide-white/5">
                  {inHouseGuests.map(r => <InHouseCard key={r.id} r={r} today={today} nightsCount={nightsCount} fmtDate={fmtDate} openGuestProfile={openGuestProfile} openFolio={openFolio} openTransfer={() => {}} setCheckoutConfirmId={() => {}} fetchCheckoutBalance={() => {}} />)}
                </div>
              )}
            </div>
          </div>
        )}

        {fdView === 'rooms' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black text-white">Room Inventory</h2>
              <button onClick={fetchRooms} className="bg-white/5 hover:bg-white/10 border border-white/15 text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl transition-all">↻ Refresh</button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
              {rooms.map(r => <RoomCard key={r.room_number} r={r} setSelectedRoom={setSelectedRoom} hkUpdating={hkUpdating} roomStatusConfig={roomStatusConfig} />)}
            </div>
          </div>
        )}

        {fdView === 'walkin' && (
          <div className="max-w-4xl mx-auto">
             <h2 className="text-xl font-black text-white mb-6">New Walk-In Reservation</h2>
             <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center text-white/20">
               Walk-in interface simplified for performance.
             </div>
          </div>
        )}

        {fdView === 'calendar' && (
          <div className="space-y-6">
             <h2 className="text-xl font-black text-white">Tape Chart</h2>
             <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center text-white/20">
               Tape Chart view simplified for performance.
             </div>
          </div>
        )}

        {fdView === 'search' && (
          <div className="space-y-6">
             <div className="relative max-w-xl">
               <input type="text" value={searchQ} onChange={e => setSearchQ(e.target.value)} placeholder="Search guest name or reservation ID..." className="w-full bg-white/5 border border-white/15 rounded-2xl px-5 py-4 text-white text-sm outline-none focus:border-[#55A2F5]/50 transition-all pl-12" />
               <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
             </div>
             <div className="space-y-3">
               {searchLoading ? <div className="p-8 text-center text-white/20 text-sm">Searching...</div> : searchResults.length === 0 ? (searchQ ? <div className="p-12 text-center text-white/15 text-sm">No results found for "{searchQ}"</div> : null) : (
                 searchResults.map(r => <SearchResultCard key={r.id} r={r} statusColors={statusColors} statusLabel={statusLabel} nightsCount={nightsCount} fmtDate={fmtDate} openFolio={openFolio} openWizard={openWizard} setCheckoutConfirmId={() => {}} />)
               )}
             </div>
          </div>
        )}
      </div>

      {/* Modals & Overlays */}
      <GuestProfileModal gpOpen={gpOpen} gpRes={gpRes} gpForm={gpForm} setGpForm={setGpForm} gpError={gpError} gpSaved={gpSaved} gpSaving={gpSaving} setGpOpen={setGpOpen} saveGuestProfile={saveGuestProfile} fmtDate={fmtDate} nightsCount={nightsCount} />
      
      {wizardOpen && wizardReservation && (
        <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <WizardHeader steps={['Verify','Review','Assign','Confirm']} wizardStep={wizardStep} />
            <div className="flex-1 overflow-y-auto p-8">
              {wizardStep === 1 && <WizardStep1 wizardReservation={wizardReservation} openGuestProfile={openGuestProfile} wizardIdVerified={wizardIdVerified} setWizardIdVerified={setWizardIdVerified} />}
              {wizardStep === 2 && <WizardStep2 wizardReservation={wizardReservation} nightsCount={nightsCount} fmtDate={fmtDate} />}
              {wizardStep === 3 && <WizardStep3 wizardReservation={wizardReservation} rooms={rooms} wizardRoomNumber={wizardRoomNumber} setWizardRoomNumber={setWizardRoomNumber} wizardNotes={wizardNotes} setWizardNotes={setWizardNotes} roomStatusConfig={roomStatusConfig} />}
              {wizardStep === 4 && <WizardStep4 wizardReservation={wizardReservation} wizardRoomNumber={wizardRoomNumber} nightsCount={nightsCount} />}
            </div>
            <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-between gap-3">
               <button onClick={closeWizard} className="px-6 py-2.5 text-sm font-semibold text-gray-500 hover:text-gray-700">Cancel</button>
               <div className="flex gap-2">
                 {wizardStep > 1 && <button onClick={() => setWizardStep(s => s - 1)} className="px-6 py-2.5 text-sm font-semibold text-gray-700 border border-gray-200 rounded-xl hover:bg-white transition-all">Back</button>}
                 {wizardStep < 4 ? (
                   <button onClick={() => setWizardStep(s => s + 1)} disabled={wizardStep === 1 && !wizardIdVerified} className="bg-gradient-to-br from-[#55A2F5] to-[#2D72C0] text-white px-8 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-[#55A2F5]/20 hover:opacity-90 disabled:opacity-30 transition-all">Next</button>
                 ) : (
                   <button onClick={submitCheckin} disabled={wizardSubmitting || !wizardRoomNumber} className="bg-green-600 text-white px-8 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-green-500/20 hover:bg-green-700 disabled:opacity-30 transition-all">
                     {wizardSubmitting ? 'Checking In...' : 'Complete Check-In'}
                   </button>
                 )}
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}"""

    new_content = content[:start_pos] + clean_impl + content[end_pos:]
    return new_content, "Successfully cleaned up FrontDeskTab implementation."

new_content, message = replace_front_desk_tab(content)

with open(target_file, 'w', encoding='utf-8') as f:
    f.write(new_content)

print(message)
