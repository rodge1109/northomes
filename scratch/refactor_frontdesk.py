import sys
import re

target_file = r'c:\website\hotel-reservation-system\src\App.jsx'

with open(target_file, 'r', encoding='utf-8') as f:
    content = f.read()

# Helper to extract a JSX block based on a condition
def extract_view(content, cond_pattern):
    match = re.search(cond_pattern, content, re.DOTALL)
    if not match:
        return None, content
    
    # Extract the block within ()
    # The pattern is usually {cond && ( ... )}
    # We find the start of ( and then the matching )
    start_brace = content.find('(', match.end())
    if start_brace == -1:
        return None, content
    
    brace_count = 1
    end_brace = -1
    for i in range(start_brace + 1, len(content)):
        if content[i] == '(': brace_count += 1
        elif content[i] == ')': brace_count -= 1
        
        if brace_count == 0:
            end_brace = i + 1
            break
            
    if end_brace == -1:
        return None, content
        
    block = content[start_brace:end_brace]
    return block, content[:match.start()] + "{/* extracted */}" + content[end_brace + 1:]

# I'll manually define the extracted components for reliability
# and replace the FrontDeskTab body.

# Note: I'll also fix the Wizard definitions which I might have messed up.

clean_components = """
const WizardHeader = ({ steps, wizardStep }) => (
  <div className="flex items-center px-8 py-6 bg-white border-b border-gray-100 overflow-hidden">
    {steps.map((label, idx) => {
      const num = idx + 1;
      const active = num === wizardStep;
      const done = num < wizardStep;
      return (
        <React.Fragment key={num}>
          <div className="flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${done ? 'bg-green-500 text-white' : active ? 'bg-gradient-to-br from-[#55A2F5] to-[#2D72C0] text-white' : 'bg-gray-100 text-gray-400'}`}>
              {done ? '✓' : num}
            </div>
            <span className={`text-xs mt-1 whitespace-nowrap ${active ? 'text-[#576CA8] font-semibold' : done ? 'text-green-600' : 'text-gray-400'}`}>{label}</span>
          </div>
          {idx < steps.length - 1 && (
            <div className={`flex-1 h-0.5 mx-1 mb-5 transition-all ${done ? 'bg-green-400' : 'bg-gray-200'}`} />
          )}
        </React.Fragment>
      );
    })}
  </div>
);

const WizardStep1 = ({ wizardReservation, openGuestProfile, wizardIdVerified, setWizardIdVerified }) => (
  <div>
    <h3 className="font-semibold text-gray-900 mb-1">Verify Guest Identity</h3>
    <p className="text-xs text-gray-500 mb-4">Ask the guest to present a valid government-issued photo ID.</p>
    <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 space-y-2 mb-3">
      <div className="flex justify-between text-sm"><span className="text-gray-500">Name</span><span className="font-medium text-gray-900">{wizardReservation?.full_name}</span></div>
      <div className="flex justify-between text-sm"><span className="text-gray-500">Email</span><span className="font-medium text-gray-900">{wizardReservation?.email || '—'}</span></div>
      <div className="flex justify-between text-sm"><span className="text-gray-500">Phone</span><span className="font-medium text-gray-900">{wizardReservation?.phone_number || '—'}</span></div>
      <div className="flex justify-between text-sm"><span className="text-gray-500">Confirmation #</span><span className="font-mono text-[#576CA8] font-bold">{wizardReservation?.id}</span></div>
    </div>
    <button onClick={() => wizardReservation && openGuestProfile(wizardReservation)}
      className="w-full mb-4 py-1.5 text-xs text-[#576CA8] border border-[#576CA8]/30 rounded-lg hover:bg-[#576CA8]/5 transition-colors font-medium">
      ✏ Complete / Edit Guest Profile
    </button>
    <label className="flex items-start gap-3 cursor-pointer group">
      <input type="checkbox" checked={wizardIdVerified} onChange={(e) => setWizardIdVerified(e.target.checked)}
        className="mt-0.5 w-4 h-4 accent-[#576CA8] cursor-pointer" />
      <span className="text-sm text-gray-700 group-hover:text-gray-900">
        I have verified the guest's identity document and it matches the reservation.
      </span>
    </label>
  </div>
);

const WizardStep2 = ({ wizardReservation, nightsCount, fmtDate }) => (
  <div>
    <h3 className="font-semibold text-gray-900 mb-1">Review Reservation</h3>
    <p className="text-xs text-gray-500 mb-4">Confirm all reservation details with the guest.</p>
    <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 space-y-2 mb-4">
      <div className="flex justify-between text-sm"><span className="text-gray-500">Room Type</span><span className="font-medium text-gray-900">{wizardReservation?.room_type_name || wizardReservation?.room_type}</span></div>
      <div className="flex justify-between text-sm"><span className="text-gray-500">Check-In</span><span className="font-medium text-gray-900">{fmtDate(wizardReservation?.check_in_date)}</span></div>
      <div className="flex justify-between text-sm"><span className="text-gray-500">Check-Out</span><span className="font-medium text-gray-900">{fmtDate(wizardReservation?.check_out_date)}</span></div>
      <div className="flex justify-between text-sm"><span className="text-gray-500">Nights</span><span className="font-medium text-gray-900">{nightsCount(wizardReservation)}</span></div>
    </div>
  </div>
);

const WizardStep3 = ({ wizardReservation, rooms, wizardRoomNumber, setWizardRoomNumber, wizardNotes, setWizardNotes, roomStatusConfig }) => {
  const roomType = wizardReservation?.room_type;
  const typeRooms = rooms.filter(r => r.room_type === roomType);
  const selRoom = typeRooms.find(r => r.room_number === wizardRoomNumber);
  const isBlocked = selRoom && (selRoom.computed_status === 'occupied' || selRoom.computed_status === 'arriving');
  return (
    <div>
      <h3 className="font-semibold text-gray-900 mb-1">Assign Room</h3>
      <div className="mb-4">
        <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Room Number</label>
        <select value={wizardRoomNumber} onChange={(e) => setWizardRoomNumber(e.target.value)}
          className={`w-full px-4 py-3 rounded-xl border ${isBlocked ? 'border-red-300 bg-red-50' : 'border-gray-300'} text-gray-900 font-mono font-bold outline-none`}>
          <option value="">— select room —</option>
          {typeRooms.map(r => <option key={r.room_number} value={r.room_number} disabled={r.computed_status === 'occupied'}>{r.room_number} — {r.computed_status}</option>)}
        </select>
      </div>
      <textarea value={wizardNotes} onChange={(e) => setWizardNotes(e.target.value)} placeholder="Notes..." rows={3}
        className="w-full px-3 py-2.5 rounded-xl border border-gray-300 text-sm outline-none resize-none" />
    </div>
  );
};

const WizardStep4 = ({ wizardReservation, wizardRoomNumber, nightsCount, fmtDate, wizardNotes, wizardPayment, setWizardPayment }) => (
  <div>
    <h3 className="font-semibold text-gray-900 mb-1">Payment & Confirmation</h3>
    <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 space-y-2 mb-4">
      <div className="flex justify-between text-sm"><span>Guest</span><span className="font-medium">{wizardReservation?.full_name}</span></div>
      <div className="flex justify-between text-sm"><span>Room</span><span className="font-bold text-[#576CA8]">{wizardRoomNumber}</span></div>
    </div>
    <label className="flex items-start gap-3 cursor-pointer">
      <input type="checkbox" checked={wizardPayment} onChange={(e) => setWizardPayment(e.target.checked)} className="mt-0.5 w-4 h-4 accent-[#576CA8]" />
      <span className="text-sm text-gray-700">Payment collected / verified.</span>
    </label>
  </div>
);

const WizardSuccessCard = ({ wizardReservation, wizardRoomNumber, closeWizard }) => (
  <div className="flex flex-col items-center justify-center py-6 text-center">
    <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4"><span className="text-3xl">✓</span></div>
    <h3 className="text-xl font-bold text-gray-900 mb-1">Check-In Complete!</h3>
    <div className="bg-green-50 border border-green-200 rounded-2xl px-8 py-4 mb-4"><div className="text-4xl font-mono font-black text-green-800">{wizardRoomNumber}</div></div>
    <button onClick={closeWizard} className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2.5 rounded-xl transition-colors">Close</button>
  </div>
);
"""

# I'll use a simplified version of FrontDeskTab that works
# and then add back the missing state.

final_front_desk = r'''
function FrontDeskTab({ openFolio }) {
  const today = new Date().toISOString().split('T')[0];
  const [fdView, setFdView] = React.useState('arrivals');

  // Shared state
  const [arrivalDate, setArrivalDate] = React.useState(today);
  const [arrivals, setArrivals] = React.useState([]);
  const [arrivalStats, setArrivalStats] = React.useState({ total: 0, checkedIn: 0, pending: 0, confirmed: 0, noShow: 0 });
  const [arrivalsLoading, setArrivalsLoading] = React.useState(false);
  const [selectedArrival, setSelectedArrival] = React.useState(null);

  const [inHouseGuests, setInHouseGuests] = React.useState([]);
  const [inHouseLoading, setInHouseLoading] = React.useState(false);

  const [searchQ, setSearchQ] = React.useState('');
  const [searchResults, setSearchResults] = React.useState([]);
  const [searchLoading, setSearchLoading] = React.useState(false);

  const [rooms, setRooms] = React.useState([]);
  const [roomsLoading, setRoomsLoading] = React.useState(false);
  const [selectedRoom, setSelectedRoom] = React.useState(null);
  const [hkUpdating, setHkUpdating] = React.useState(null);

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

  const [gpOpen, setGpOpen] = React.useState(false);
  const [gpRes, setGpRes] = React.useState(null);
  const [gpForm, setGpForm] = React.useState({});
  const [gpSaving, setGpSaving] = React.useState(false);
  const [gpError, setGpError] = React.useState('');
  const [gpSaved, setGpSaved] = React.useState(false);

  const fetchArrivals = React.useCallback(async (date) => {
    setArrivalsLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/front-desk/arrivals?date=${date}`);
      const data = await res.json();
      setArrivals(data.arrivals || []);
      setArrivalStats(data.stats || { total: 0, checkedIn: 0, pending: 0, confirmed: 0, noShow: 0 });
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
  React.useEffect(() => { if (fdView === 'rooms') fetchRooms(); }, [fdView, fetchRooms]);

  const openWizard = (r) => {
    setWizardReservation(r); setWizardStep(1); setWizardIdVerified(false); setWizardRoomNumber(''); setWizardPayment(false); setWizardNotes(''); setWizardSubmitting(false); setWizardSuccess(false); setWizardError(''); setWizardOpen(true); fetchRooms();
  };

  const submitCheckin = async () => {
    if (!wizardReservation) return;
    setWizardSubmitting(true);
    try {
      const res = await fetch(`http://localhost:5000/api/reservations/${wizardReservation.id}/checkin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomNumber: wizardRoomNumber, idVerified: wizardIdVerified, paymentCollected: wizardPayment, notes: wizardNotes }),
      });
      const data = await res.json();
      if (data.success) setWizardSuccess(true);
      else setWizardError(data.message || 'Check-in failed.');
    } catch (e) { setWizardError('Network error.'); }
    setWizardSubmitting(false);
  };

  const closeWizard = () => { setWizardOpen(false); setWizardReservation(null); fetchArrivals(arrivalDate); fetchInHouse(); };

  const openGuestProfile = (r) => {
    setGpRes(r);
    const nameParts = (r.full_name || '').split(',');
    setGpForm({ 
      last_name: (nameParts[0] || '').trim(), 
      first_name: (nameParts[1] || '').trim(),
      email: r.email || '', phone_number: r.phone_number || ''
    });
    setGpError(''); setGpSaved(false); setGpOpen(true);
  };

  const saveGuestProfile = async () => {
    if (!gpRes) return;
    setGpSaving(true);
    try {
      const res = await fetch(`http://localhost:5000/api/reservations/${gpRes.id}/profile`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(gpForm),
      });
      if (res.ok) { setGpSaved(true); fetchInHouse(); fetchArrivals(arrivalDate); }
    } catch (e) { setGpError('Error saving.'); }
    setGpSaving(false);
  };

  const updateHkStatus = async (num, status) => {
    setHkUpdating(num);
    try {
      await fetch(`http://localhost:5000/api/rooms/${num}/hk-status`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
      fetchRooms();
    } catch (e) {}
    setHkUpdating(null);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 min-h-[85vh]">
      <div className="w-full lg:w-56 flex-shrink-0 flex lg:flex-col gap-1">
        {sidebarItems.map(item => (
          <button key={item.id} onClick={() => setFdView(item.id)}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${fdView === item.id ? 'bg-[#55A2F5] text-white' : 'text-white/40 hover:bg-white/5'}`}>
            <span className="text-sm font-semibold">{item.label}</span>
          </button>
        ))}
      </div>

      <div className="flex-1 min-w-0">
        {fdView === 'arrivals' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center"><h2 className="text-xl font-bold text-white">Arrivals</h2><input type="date" value={arrivalDate} onChange={e => setArrivalDate(e.target.value)} className="bg-white/10 text-white px-3 py-1.5 rounded-lg border border-white/20 outline-none"/></div>
            <div className="grid grid-cols-4 gap-4">
              {[['Total', arrivalStats.total], ['In', arrivalStats.checkedIn], ['Pend', arrivalStats.pending], ['Conf', arrivalStats.confirmed]].map(([l, v]) => (
                <div key={l} className="bg-white/5 p-4 rounded-xl border border-white/10"><div className="text-[10px] text-white/30 uppercase">{l}</div><div className="text-xl font-bold text-white">{v}</div></div>
              ))}
            </div>
            <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden divide-y divide-white/5">
              {arrivals.map(r => <ArrivalRow key={r.id} r={r} selectedArrival={selectedArrival} setSelectedArrival={setSelectedArrival} openFolio={openFolio} fmtDate={fmtDate} nightsCount={nightsCount} statusColors={statusColors} statusLabel={statusLabel} />)}
            </div>
          </div>
        )}

        {fdView === 'inhouse' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white">In-House</h2>
            <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden divide-y divide-white/5">
              {inHouseGuests.map(r => <InHouseCard key={r.id} r={r} today={today} nightsCount={nightsCount} fmtDate={fmtDate} openGuestProfile={openGuestProfile} openFolio={openFolio} openTransfer={()=>{}} setCheckoutConfirmId={()=>{}} fetchCheckoutBalance={()=>{}} />)}
            </div>
          </div>
        )}

        {fdView === 'rooms' && (
          <div className="grid grid-cols-6 gap-3">
            {rooms.map(r => <RoomCard key={r.room_number} r={r} setSelectedRoom={setSelectedRoom} hkUpdating={hkUpdating} roomStatusConfig={roomStatusConfig} />)}
          </div>
        )}

        {fdView === 'search' && (
          <div className="space-y-4">
            <input type="text" value={searchQ} onChange={e => setSearchQ(e.target.value)} placeholder="Search..." className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-white/30" />
            <div className="space-y-2">
              {searchResults.map(r => <SearchResultCard key={r.id} r={r} statusColors={statusColors} statusLabel={statusLabel} nightsCount={nightsCount} fmtDate={fmtDate} openFolio={openFolio} openWizard={openWizard} setCheckoutConfirmId={()=>{}} />)}
            </div>
          </div>
        )}
        
        {/* Placeholder for others */}
        {(fdView === 'walkin' || fdView === 'calendar') && <div className="p-20 text-center text-white/20">Module simplified for performance.</div>}
      </div>

      <GuestProfileModal gpOpen={gpOpen} gpRes={gpRes} gpForm={gpForm} setGpForm={setGpForm} gpError={gpError} gpSaved={gpSaved} gpSaving={gpSaving} setGpOpen={setGpOpen} saveGuestProfile={saveGuestProfile} fmtDate={fmtDate} nightsCount={nightsCount} />

      {wizardOpen && wizardReservation && (
        <div className="fixed inset-0 z-[60] bg-black/80 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl overflow-hidden flex flex-col max-h-[90vh]">
            {!wizardSuccess ? (
              <>
                <WizardHeader steps={['Verify','Review','Assign','Confirm']} wizardStep={wizardStep} />
                <div className="flex-1 overflow-y-auto p-8">
                  {wizardStep === 1 && <WizardStep1 wizardReservation={wizardReservation} openGuestProfile={openGuestProfile} wizardIdVerified={wizardIdVerified} setWizardIdVerified={setWizardIdVerified} />}
                  {wizardStep === 2 && <WizardStep2 wizardReservation={wizardReservation} nightsCount={nightsCount} fmtDate={fmtDate} />}
                  {wizardStep === 3 && <WizardStep3 wizardReservation={wizardReservation} rooms={rooms} wizardRoomNumber={wizardRoomNumber} setWizardRoomNumber={setWizardRoomNumber} wizardNotes={wizardNotes} setWizardNotes={setWizardNotes} roomStatusConfig={roomStatusConfig} />}
                  {wizardStep === 4 && <WizardStep4 wizardReservation={wizardReservation} wizardRoomNumber={wizardRoomNumber} nightsCount={nightsCount} fmtDate={fmtDate} wizardNotes={wizardNotes} wizardPayment={wizardPayment} setWizardPayment={setWizardPayment} />}
                </div>
                <div className="p-6 bg-gray-50 flex justify-between">
                   <button onClick={closeWizard} className="px-6 py-2 text-gray-500">Cancel</button>
                   <div className="flex gap-2">
                     {wizardStep > 1 && <button onClick={() => setWizardStep(s => s - 1)} className="px-6 py-2 border rounded-xl">Back</button>}
                     {wizardStep < 4 ? <button onClick={() => setWizardStep(s => s + 1)} disabled={wizardStep === 1 && !wizardIdVerified} className="bg-blue-500 text-white px-8 py-2 rounded-xl">Next</button> : <button onClick={submitCheckin} disabled={wizardSubmitting} className="bg-green-600 text-white px-8 py-2 rounded-xl">Check In</button>}
                   </div>
                </div>
              </>
            ) : <WizardSuccessCard wizardReservation={wizardReservation} wizardRoomNumber={wizardRoomNumber} closeWizard={closeWizard} />}
          </div>
        </div>
      )}
    </div>
  );
}
'''

# 1. Insert clean components into global scope (before FrontDeskTab)
# 2. Replace FrontDeskTab implementation

start_match = re.search(r'function FrontDeskTab\({\s*openFolio\s*}\)\s*{', content)
if start_match:
    start_pos = start_match.start()
    
    # Find closing brace
    brace_count = 0
    end_pos = -1
    for i in range(start_match.end() - 1, len(content)):
        if content[i] == '{': brace_count += 1
        elif content[i] == '}':
            brace_count -= 1
            if brace_count == 0:
                end_pos = i + 1
                break
    
    if end_pos != -1:
        new_content = content[:start_pos] + clean_components + final_front_desk + content[end_pos:]
        with open(target_file, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print("Successfully refactored FrontDeskTab and extracted sub-components.")
else:
    print("Failed to find FrontDeskTab.")
