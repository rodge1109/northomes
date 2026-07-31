const fs = require('fs');
let content = fs.readFileSync('src/App.jsx', 'utf8');

// 1. Add States and handleOpenConfirmModal
const stateAnchor = '  const [editModal, setEditModal] = useState(null);';
const newStates = `
  const [confirmModal, setConfirmModal] = React.useState(null);
  const [confirmRoomNumber, setConfirmRoomNumber] = React.useState('');
  const [confirmOccupiedRooms, setConfirmOccupiedRooms] = React.useState([]);
  const [confirmAllRooms, setConfirmAllRooms] = React.useState([]);

  const handleOpenConfirmModal = async (res) => {
    setConfirmModal(res);
    setConfirmRoomNumber(res.room_number || '');
    try {
      const checkIn = res.check_in_date ? res.check_in_date.slice(0, 10) : res.preferred_date;
      const checkOut = res.check_out_date ? res.check_out_date.slice(0, 10) : res.preferred_date;
      
      const [occResp, roomsResp] = await Promise.all([
        fetch(\`\${API_BASE_URL}/api/rooms/occupied?checkIn=\${checkIn}&checkOut=\${checkOut}&ignoreReservationId=\${res.id || res.dbId || ''}\`),
        fetch(\`\${API_BASE_URL}/api/rooms\`)
      ]);
      
      const occData = await occResp.json();
      if (occData.success) {
        setConfirmOccupiedRooms(occData.occupiedRooms);
      }
      
      const roomsData = await roomsResp.json();
      if (roomsData.rooms) {
        setConfirmAllRooms(roomsData.rooms);
      }
    } catch (e) {
      console.error(e);
      setConfirmOccupiedRooms([]);
      setConfirmAllRooms([]);
    }
  };

  const submitConfirmBooking = () => {
    if (!confirmModal) return;
    const id = confirmModal.id || confirmModal.dbId;
    updateStatus(id, 'confirmed', confirmRoomNumber);
    setConfirmModal(null);
  };
`;
if (!content.includes('const [confirmModal')) {
  content = content.replace(stateAnchor, stateAnchor + '\n' + newStates);
}

// 2. Add ConfirmModal UI
const uiAnchor = '      {editModal && (';
const modalUI = `      {confirmModal && (() => {
        const typeRooms = confirmAllRooms.filter(r => r.room_type === (confirmModal.room_type_name || confirmModal.room_type));
        
        return (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
              <div className="px-6 py-5 border-b border-black/5 flex items-center justify-between bg-gray-50/50">
                <h3 className="font-bold text-gray-900 text-lg">Confirm Booking</h3>
                <button onClick={() => setConfirmModal(null)} className="p-1.5 hover:bg-black/5 rounded-lg text-black/40 hover:text-black/60 transition-colors">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"></path></svg>
                </button>
              </div>
              <div className="p-6 overflow-y-auto">
                <p className="text-sm text-gray-600 mb-6">
                  You are confirming the booking for <strong className="text-gray-900">{confirmModal.full_name}</strong>. 
                  You can optionally assign a room number now.
                </p>
                <div className="mb-4">
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Assign Room (Optional)</label>
                  {typeRooms.length === 0 ? (
                    <input
                      type="text"
                      value={confirmRoomNumber}
                      onChange={(e) => setConfirmRoomNumber(e.target.value)}
                      placeholder="e.g. 201"
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#576CA8] focus:ring-2 focus:ring-[#576CA8]/20 text-gray-900 font-mono outline-none transition-all"
                    />
                  ) : (
                    <select
                      value={confirmRoomNumber}
                      onChange={(e) => setConfirmRoomNumber(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#576CA8] focus:ring-2 focus:ring-[#576CA8]/20 text-gray-900 font-mono outline-none transition-all appearance-none cursor-pointer bg-white"
                    >
                      <option value="">No Room Assigned Yet</option>
                      {typeRooms.map(r => {
                        const isOccupied = confirmOccupiedRooms.includes(r.room_number);
                        return (
                          <option key={r.id} value={r.room_number} disabled={isOccupied}>
                            Room {r.room_number} {isOccupied ? '(Unavailable for these dates)' : ''}
                          </option>
                        );
                      })}
                    </select>
                  )}
                  <p className="text-[11px] text-gray-500 mt-2">
                    Only showing rooms of type: {confirmModal.room_type_name || confirmModal.room_type}. Rooms that overlap with these dates are disabled.
                  </p>
                </div>
              </div>
              <div className="px-6 py-4 border-t border-black/5 bg-gray-50 flex justify-end gap-3 shrink-0">
                <button onClick={() => setConfirmModal(null)} className="px-5 py-2.5 rounded-xl text-sm font-bold text-gray-600 hover:bg-black/5 transition-colors">
                  Cancel
                </button>
                <button onClick={submitConfirmBooking} className="px-5 py-2.5 rounded-xl text-sm font-bold bg-[#00754A] text-white hover:bg-[#006241] shadow-lg shadow-[#00754A]/20 transition-all flex items-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  Confirm & Assign
                </button>
              </div>
            </div>
          </div>
        );
      })()}
`;
if (!content.includes('Confirm & Assign')) {
  content = content.replace(uiAnchor, modalUI + uiAnchor);
}

// 3. Update updateStatus
content = content.replace(
  'const updateStatus = async (id, newStatus) => {',
  'const updateStatus = async (id, newStatus, roomNumber) => {'
);
content = content.replace(
  'body: JSON.stringify({ status: newStatus })',
  'body: JSON.stringify({ status: newStatus, room_number: roomNumber })'
);

content = content.replace(
  'const updateStatus = async (id, status) => {',
  'const updateStatus = async (id, status, roomNumber) => {'
);
content = content.replace(
  'body: JSON.stringify({ status }),',
  'body: JSON.stringify({ status, room_number: roomNumber }),'
);

// 4. Update AdminOnlineReservationsTab props
content = content.replace(
  '<AdminOnlineReservationsTab reservations={reservations || []} stats={stats || {}} updateStatus={updateStatus} openWizard={handleOpenWizard}',
  '<AdminOnlineReservationsTab reservations={reservations || []} stats={stats || {}} updateStatus={updateStatus} openConfirmModal={handleOpenConfirmModal} openWizard={handleOpenWizard}'
);

// We also tighten the paddings in the Arrivals/In-House grids like I did before.
// I'll replace px-4 py-3 with px-2.5 py-2 inside the table cells.
content = content.replace(/px-4 py-3 align-top/g, 'px-2.5 py-2 align-top');
content = content.replace(/px-4 py-3/g, 'px-2.5 py-2');

fs.writeFileSync('src/App.jsx', content, 'utf8');
console.log('App.jsx fully restored and fixed!');
