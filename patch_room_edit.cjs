const fs = require('fs');
const file = 'c:\\website\\northomes-system\\src\\App.jsx';
let content = fs.readFileSync(file, 'utf8');

let wasCRLF = content.includes('\r\n');
if (wasCRLF) {
  content = content.replace(/\r\n/g, '\n');
}

// 1. Declare state variables and functions in FrontDeskTab component scope
const stateTarget = `  const [newRoomNotes, setNewRoomNotes] = React.useState('1 single bed');
  const [isOthersBedConfig, setIsOthersBedConfig] = React.useState(false);`;

const stateReplacement = `  const [newRoomNotes, setNewRoomNotes] = React.useState('1 single bed');
  const [isOthersBedConfig, setIsOthersBedConfig] = React.useState(false);
  const [editRoomOpen, setEditRoomOpen] = React.useState(false);
  const [editRoomType, setEditRoomType] = React.useState('');
  const [editRoomFloor, setEditRoomFloor] = React.useState(1);
  const [editRoomNotes, setEditRoomNotes] = React.useState('');
  const [editIsOthersBed, setEditIsOthersBed] = React.useState(false);

  const startEditRoom = (r) => {
    setEditRoomType(r.room_type || '');
    setEditRoomFloor(r.floor || 1);
    const standardConfigs = ['1 single bed', '1 queen bed', '2 single bed', '2 double bed', '4 single bed'];
    const notesVal = r.notes || '';
    if (standardConfigs.includes(notesVal)) {
      setEditRoomNotes(notesVal);
      setEditIsOthersBed(false);
    } else {
      setEditRoomNotes(notesVal);
      setEditIsOthersBed(notesVal ? true : false);
    }
    setEditRoomOpen(true);
  };

  const saveEditedRoom = async () => {
    try {
      const res = await fetch(\`\${API_BASE_URL}/api/rooms\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          room_number: selectedRoom.room_number,
          room_type: editRoomType,
          floor: editRoomFloor,
          notes: editRoomNotes.trim()
        }),
      });
      if (res.ok) {
        setEditRoomOpen(false);
        fetchRooms();
        setSelectedRoom(prev => prev ? { ...prev, room_type: editRoomType, floor: editRoomFloor, notes: editRoomNotes.trim() } : null);
      }
    } catch (e) {
      console.error(e);
    }
  };`;

if (content.includes(stateTarget)) {
  content = content.replace(stateTarget, stateReplacement);
  console.log('Edit state variables and handlers declared.');
} else {
  console.log('State target NOT found.');
}

// 2. Update Backdrop click to close edit state
const backdropTarget = `<div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setSelectedRoom(null)}>`;
const backdropReplacement = `<div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => { setSelectedRoom(null); setEditRoomOpen(false); }}>`;

if (content.includes(backdropTarget)) {
  content = content.replace(backdropTarget, backdropReplacement);
  console.log('Backdrop click handler updated.');
} else {
  console.log('Backdrop target NOT found.');
}

// 3. Update X button click to close edit state
const closeButtonTarget = `<button onClick={() => setSelectedRoom(null)} className="text-white/60 hover:text-white text-lg font-bold leading-none mt-1">✕</button>`;
const closeButtonReplacement = `<button onClick={() => { setSelectedRoom(null); setEditRoomOpen(false); }} className="text-white/60 hover:text-white text-lg font-bold leading-none mt-1">✕</button>`;

if (content.includes(closeButtonTarget)) {
  content = content.replace(closeButtonTarget, closeButtonReplacement);
  console.log('Close button click handler updated.');
} else {
  console.log('Close button target NOT found.');
}

// 4. Wrap modal body with EditRoom check and replace original details & actions
const modalBodyTarget = `                          <div className="p-5 space-y-4">
                            {/* Guest info */}
                            {isActive && selectedRoom.guest_name && (
                              <div className="bg-white shadow-sm border border-black/5 rounded-xl p-3.5 space-y-1.5">
                                <div className="text-xs font-semibold text-black/60 uppercase tracking-wider mb-2">Current Guest</div>
                                <div className="font-semibold text-[#000000]/87">{selectedRoom.guest_name}</div>
                                <div className="flex items-center gap-3 text-xs text-black/60">
                                  <span>CI: {selectedRoom.check_in_date ? new Date(selectedRoom.check_in_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}</span>
                                  <span>→</span>
                                  <span>CO: {selectedRoom.check_out_date ? new Date(selectedRoom.check_out_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}</span>
                                </div>
                                {selectedRoom.number_of_guests && <div className="text-xs text-black/60">{selectedRoom.number_of_guests} guest{selectedRoom.number_of_guests !== 1 ? 's' : ''}</div>}
                              </div>
                            )}

                            {/* Bed Config / Notes */}
                            <div>
                              <div className="text-xs font-semibold text-black/60 uppercase tracking-wider mb-2">Bed Config / Notes</div>
                              <div className="bg-gray-50 border border-black/5 rounded-xl p-3.5 text-xs text-[#000000]/87 font-semibold italic">
                                {selectedRoom.notes || 'No bed configuration noted'}
                              </div>
                            </div>

                            {/* HK Status */}
                            <div>
                              <div className="text-xs font-semibold text-black/60 uppercase tracking-wider mb-2.5">Housekeeping Status</div>
                              <div className="grid grid-cols-2 gap-2">
                                {[
                                  { status: 'clean', label: '✓ Clean', active: 'bg-[#00754A]/20 border-[#00754A]/30 text-black shadow-sm' },
                                  { status: 'dirty', label: '🧹 Dirty', active: 'bg-red-500/20 border-red-500/30 text-black shadow-sm' },
                                  { status: 'inspected', label: '🔍 Inspected', active: 'bg-[#1E3932]/20 border-[#1E3932]/30 text-black shadow-sm' },
                                  { status: 'out_of_order', label: '⚠️ Out of Order', active: 'bg-amber-500/20 border-amber-500/30 text-black shadow-sm' },
                                ].map(({ status, label, active }) => {
                                  const isCurrent = selectedRoom.hk_status === status;
                                  return (
                                    <button key={status}
                                      onClick={() => updateHkStatus(selectedRoom.room_number, status)}
                                      disabled={hkUpdating === selectedRoom.room_number}
                                      className={\`px-3 py-2 rounded-xl border text-xs font-semibold transition-all \${isCurrent ? active : 'border-black/5 bg-gray-50 text-black/60 hover:bg-gray-100 hover:text-[#000000]/87'}\`}>
                                      {label}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2 pt-1">
                              {(selectedRoom.computed_status === 'occupied' || selectedRoom.computed_status === 'due_out') && selectedRoom.reservation_id && (
                                <button
                                  onClick={() => { setCheckoutConfirmId(selectedRoom.reservation_id); setSelectedRoom(null); }}
                                  className="flex-1 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 text-xs font-bold py-2.5 rounded-xl transition-all">
                                  Check Out Guest
                                </button>
                              )}
                              <button
                                onClick={() => removeRoom(selectedRoom.room_number)}
                                className="flex-1 bg-gray-50 hover:bg-gray-100 text-red-500 border border-black/5 text-xs font-semibold py-2.5 rounded-xl transition-all">
                                Remove Room
                              </button>
                            </div>
                          </div>`;

const modalBodyReplacement = `                          <div className="p-5">
                            {editRoomOpen ? (
                              <div className="space-y-4 text-left">
                                <div>
                                  <label className="block text-xs font-semibold text-black/60 uppercase tracking-wider mb-1.5">Room Type</label>
                                  <select value={editRoomType} onChange={e => setEditRoomType(e.target.value)}
                                    className="w-full px-3 py-2.5 rounded-xl border border-black/12 bg-white text-[#000000]/87 text-sm outline-none focus:border-[#00754A]">
                                    <option value="">— select —</option>
                                    {wkRoomTypes.map(rt => <option key={rt.id} value={rt.name}>{rt.name}</option>)}
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-xs font-semibold text-black/60 uppercase tracking-wider mb-1.5">Floor</label>
                                  <input type="number" min="1" max="99" value={editRoomFloor} onChange={e => setEditRoomFloor(parseInt(e.target.value) || 1)}
                                    className="w-full px-3 py-2.5 rounded-xl border border-black/12 bg-white text-[#000000]/87 text-sm outline-none focus:border-[#00754A]" />
                                </div>
                                <div>
                                  <label className="block text-xs font-semibold text-black/60 uppercase tracking-wider mb-1.5">Bed Config / Notes</label>
                                  <select 
                                    value={editIsOthersBed ? 'others' : editRoomNotes} 
                                    onChange={e => {
                                      const val = e.target.value;
                                      if (val === 'others') {
                                        setEditIsOthersBed(true);
                                        setEditRoomNotes('');
                                      } else {
                                        setEditIsOthersBed(false);
                                        setEditRoomNotes(val);
                                      }
                                    }}
                                    className="w-full px-3 py-2.5 rounded-xl border border-black/12 bg-white text-[#000000]/87 text-sm outline-none focus:border-[#00754A] mb-2"
                                  >
                                    <option value="1 single bed">1 single bed</option>
                                    <option value="1 queen bed">1 queen bed</option>
                                    <option value="2 single bed">2 single bed</option>
                                    <option value="2 double bed">2 double bed</option>
                                    <option value="4 single bed">4 single bed</option>
                                    <option value="others">others</option>
                                  </select>
                                  {editIsOthersBed && (
                                    <input 
                                      type="text" 
                                      value={editRoomNotes} 
                                      onChange={e => setEditRoomNotes(e.target.value)}
                                      placeholder="specify custom config..."
                                      className="w-full px-3 py-2.5 rounded-xl border border-black/12 bg-white text-[#000000]/87 placeholder-white/30 text-xs outline-none focus:border-[#00754A]" 
                                    />
                                  )}
                                </div>
                                <div className="flex gap-2 pt-2">
                                  <button onClick={saveEditedRoom}
                                    className="flex-1 bg-[#00754A] hover:bg-[#006241] text-white text-xs font-bold py-2.5 rounded-xl transition-all">
                                    Save Changes
                                  </button>
                                  <button onClick={() => setEditRoomOpen(false)}
                                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-black/60 text-xs font-semibold py-2.5 rounded-xl transition-all">
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-4 text-left">
                                {/* Guest info */}
                                {isActive && selectedRoom.guest_name && (
                                  <div className="bg-white shadow-sm border border-black/5 rounded-xl p-3.5 space-y-1.5">
                                    <div className="text-xs font-semibold text-black/60 uppercase tracking-wider mb-2">Current Guest</div>
                                    <div className="font-semibold text-[#000000]/87">{selectedRoom.guest_name}</div>
                                    <div className="flex items-center gap-3 text-xs text-black/60">
                                      <span>CI: {selectedRoom.check_in_date ? new Date(selectedRoom.check_in_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}</span>
                                      <span>→</span>
                                      <span>CO: {selectedRoom.check_out_date ? new Date(selectedRoom.check_out_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}</span>
                                    </div>
                                    {selectedRoom.number_of_guests && <div className="text-xs text-black/60">{selectedRoom.number_of_guests} guest{selectedRoom.number_of_guests !== 1 ? 's' : ''}</div>}
                                  </div>
                                )}

                                {/* Bed Config / Notes */}
                                <div>
                                  <div className="text-xs font-semibold text-black/60 uppercase tracking-wider mb-2">Bed Config / Notes</div>
                                  <div className="bg-gray-50 border border-black/5 rounded-xl p-3.5 text-xs text-[#000000]/87 font-semibold italic">
                                    {selectedRoom.notes || 'No bed configuration noted'}
                                  </div>
                                </div>

                                {/* HK Status */}
                                <div>
                                  <div className="text-xs font-semibold text-black/60 uppercase tracking-wider mb-2.5">Housekeeping Status</div>
                                  <div className="grid grid-cols-2 gap-2">
                                    {[
                                      { status: 'clean', label: '✓ Clean', active: 'bg-[#00754A]/20 border-[#00754A]/30 text-black shadow-sm' },
                                      { status: 'dirty', label: '🧹 Dirty', active: 'bg-red-500/20 border-red-500/30 text-black shadow-sm' },
                                      { status: 'inspected', label: '🔍 Inspected', active: 'bg-[#1E3932]/20 border-[#1E3932]/30 text-black shadow-sm' },
                                      { status: 'out_of_order', label: '⚠️ Out of Order', active: 'bg-amber-500/20 border-amber-500/30 text-black shadow-sm' },
                                    ].map(({ status, label, active }) => {
                                      const isCurrent = selectedRoom.hk_status === status;
                                      return (
                                        <button key={status}
                                          onClick={() => updateHkStatus(selectedRoom.room_number, status)}
                                          disabled={hkUpdating === selectedRoom.room_number}
                                          className={\`px-3 py-2 rounded-xl border text-xs font-semibold transition-all \${isCurrent ? active : 'border-black/5 bg-gray-50 text-black/60 hover:bg-gray-100 hover:text-[#000000]/87'}\`}>
                                          {label}
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>

                                {/* Actions */}
                                <div className="flex flex-col gap-2 pt-1">
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => startEditRoom(selectedRoom)}
                                      className="flex-1 bg-[#00754A]/10 hover:bg-[#00754A]/20 text-[#00754A] text-xs font-bold py-2.5 rounded-xl transition-all">
                                      ✏️ Edit Room Details
                                    </button>
                                    <button
                                      onClick={() => removeRoom(selectedRoom.room_number)}
                                      className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 text-xs font-semibold py-2.5 rounded-xl transition-all">
                                      🗑️ Delete Room
                                    </button>
                                  </div>
                                  {((selectedRoom.computed_status === 'occupied' || selectedRoom.computed_status === 'due_out') && selectedRoom.reservation_id) && (
                                    <button
                                      onClick={() => { setCheckoutConfirmId(selectedRoom.reservation_id); setSelectedRoom(null); }}
                                      className="w-full bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-2.5 rounded-xl transition-all">
                                      Check Out Guest
                                    </button>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>`;

if (content.includes(modalBodyTarget)) {
  content = content.replace(modalBodyTarget, modalBodyReplacement);
  console.log('Room detail modal body layout updated.');
} else {
  console.log('Modal body target NOT found.');
}

if (wasCRLF) {
  content = content.replace(/\n/g, '\r\n');
}

fs.writeFileSync(file, content, 'utf8');
console.log('Completed.');
