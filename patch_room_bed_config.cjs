const fs = require('fs');

// ─── PART 1: src/App.jsx ──────────────────────────────────────────────────────
const appFile = 'c:\\website\\northomes-system\\src\\App.jsx';
let appContent = fs.readFileSync(appFile, 'utf8');

let wasAppCRLF = appContent.includes('\r\n');
if (wasAppCRLF) appContent = appContent.replace(/\r\n/g, '\n');

// 1. Declare newRoomNotes state variable
const appStateTarget = `  const [newRoomNumber, setNewRoomNumber] = React.useState('');
  const [newRoomType, setNewRoomType] = React.useState('');
  const [newRoomFloor, setNewRoomFloor] = React.useState(1);`;

const appStateReplacement = `  const [newRoomNumber, setNewRoomNumber] = React.useState('');
  const [newRoomType, setNewRoomType] = React.useState('');
  const [newRoomFloor, setNewRoomFloor] = React.useState(1);
  const [newRoomNotes, setNewRoomNotes] = React.useState('');`;

if (appContent.includes(appStateTarget)) {
  appContent = appContent.replace(appStateTarget, appStateReplacement);
  console.log('App: newRoomNotes state declared.');
} else {
  console.log('App: state target NOT found.');
}

// 2. Update addRoom handler
const appAddRoomTarget = `  const addRoom = async () => {
    if (!newRoomNumber.trim()) return;
    try {
      await fetch(\`\${API_BASE_URL}/api/rooms\`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ room_number: newRoomNumber.trim(), room_type: newRoomType, floor: newRoomFloor }),
      });
      setAddRoomOpen(false); setNewRoomNumber(''); setNewRoomType(''); setNewRoomFloor(1);
      fetchRooms();
    } catch (e) { console.error(e); }
  };`;

const appAddRoomReplacement = `  const addRoom = async () => {
    if (!newRoomNumber.trim()) return;
    try {
      await fetch(\`\${API_BASE_URL}/api/rooms\`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ room_number: newRoomNumber.trim(), room_type: newRoomType, floor: newRoomFloor, notes: newRoomNotes.trim() }),
      });
      setAddRoomOpen(false); setNewRoomNumber(''); setNewRoomType(''); setNewRoomFloor(1); setNewRoomNotes('');
      fetchRooms();
    } catch (e) { console.error(e); }
  };`;

if (appContent.includes(appAddRoomTarget)) {
  appContent = appContent.replace(appAddRoomTarget, appAddRoomReplacement);
  console.log('App: addRoom handler updated.');
} else {
  console.log('App: addRoom target NOT found.');
}

// 3. Update WizardStep3 select option label
const appWizardTarget = `                  return (
                    <option key={r.room_number} value={r.room_number} disabled={unavailable}
                      style={{ background: unavailable ? '#fef2f2' : '#f8fafc', color: unavailable ? '#ef4444' : '#111827' }}>
                      {\`Room \${r.room_number}\${r.floor ? \` · Fl.\${r.floor}\` : ''} — \${cfg.label}\${unavailable ? ' (unavailable)' : ''}\`}
                    </option>`;

const appWizardReplacement = `                  return (
                    <option key={r.room_number} value={r.room_number} disabled={unavailable}
                      style={{ background: unavailable ? '#fef2f2' : '#f8fafc', color: unavailable ? '#ef4444' : '#111827' }}>
                      {\`Room \${r.room_number}\${r.floor ? \` · Fl.\${r.floor}\` : ''} — \${cfg.label}\${r.notes ? \` (\${r.notes})\` : ''}\${unavailable ? ' (unavailable)' : ''}\`}
                    </option>`;

if (appContent.includes(appWizardTarget)) {
  appContent = appContent.replace(appWizardTarget, appWizardReplacement);
  console.log('App: WizardStep3 select label updated.');
} else {
  console.log('App: WizardStep3 target NOT found.');
}

// 4. Update Room Detail Modal (portal) to show Notes/Bed configuration
const appModalTarget = `                            {/* HK Status */}
                            <div>
                              <div className="text-xs font-semibold text-black/60 uppercase tracking-wider mb-2.5">Housekeeping Status</div>`;

const appModalReplacement = `                            {/* Bed Config / Notes */}
                            <div>
                              <div className="text-xs font-semibold text-black/60 uppercase tracking-wider mb-2">Bed Config / Notes</div>
                              <div className="bg-gray-50 border border-black/5 rounded-xl p-3.5 text-xs text-[#000000]/87 font-semibold italic">
                                {selectedRoom.notes || 'No bed configuration noted'}
                              </div>
                            </div>

                            {/* HK Status */}
                            <div>
                              <div className="text-xs font-semibold text-black/60 uppercase tracking-wider mb-2.5">Housekeeping Status</div>`;

if (appContent.includes(appModalTarget)) {
  appContent = appContent.replace(appModalTarget, appModalReplacement);
  console.log('App: Room details modal updated.');
} else {
  console.log('App: Modal target NOT found.');
}

// 5. Update Add Room Form layout to columns-4 and add Bed Config input
const appFormTarget = `                      <div className="grid grid-cols-3 gap-3 mb-3">
                        <div>
                          <label className="block text-xs text-black/60 mb-1">Room Number *</label>
                          <input type="text" value={newRoomNumber} onChange={e => setNewRoomNumber(e.target.value)}
                            placeholder="e.g. 201" autoComplete="off"
                            className="w-full px-3 py-2 rounded-lg border border-black/5 bg-white shadow-sm text-[#000000]/87 placeholder-white/30 text-sm font-mono font-bold outline-none focus:border-black/5" />
                        </div>
                        <div>
                          <label className="block text-xs text-black/60 mb-1">Room Type</label>
                          <select value={newRoomType} onChange={e => setNewRoomType(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-black/5 bg-white shadow-sm text-[#000000]/87 text-sm outline-none focus:border-black/5">
                            <option value="">— select —</option>
                            {wkRoomTypes.map(rt => <option key={rt.id} value={rt.name}>{rt.name}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs text-black/60 mb-1">Floor</label>
                          <input type="number" min="1" max="99" value={newRoomFloor} onChange={e => setNewRoomFloor(parseInt(e.target.value) || 1)}
                            className="w-full px-3 py-2 rounded-lg border border-black/5 bg-white shadow-sm text-[#000000]/87 text-sm outline-none focus:border-black/5" />
                        </div>
                      </div>`;

const appFormReplacement = `                      <div className="grid grid-cols-4 gap-3 mb-3">
                        <div>
                          <label className="block text-xs text-black/60 mb-1">Room Number *</label>
                          <input type="text" value={newRoomNumber} onChange={e => setNewRoomNumber(e.target.value)}
                            placeholder="e.g. 201" autoComplete="off"
                            className="w-full px-3 py-2 rounded-lg border border-black/5 bg-white shadow-sm text-[#000000]/87 placeholder-white/30 text-sm font-mono font-bold outline-none focus:border-black/5" />
                        </div>
                        <div>
                          <label className="block text-xs text-black/60 mb-1">Room Type</label>
                          <select value={newRoomType} onChange={e => setNewRoomType(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-black/5 bg-white shadow-sm text-[#000000]/87 text-sm outline-none focus:border-black/5">
                            <option value="">— select —</option>
                            {wkRoomTypes.map(rt => <option key={rt.id} value={rt.name}>{rt.name}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs text-black/60 mb-1">Floor</label>
                          <input type="number" min="1" max="99" value={newRoomFloor} onChange={e => setNewRoomFloor(parseInt(e.target.value) || 1)}
                            className="w-full px-3 py-2 rounded-lg border border-black/5 bg-white shadow-sm text-[#000000]/87 text-sm outline-none focus:border-black/5" />
                        </div>
                        <div>
                          <label className="block text-xs text-black/60 mb-1">Bed Config / Notes</label>
                          <input type="text" value={newRoomNotes} onChange={e => setNewRoomNotes(e.target.value)}
                            placeholder="e.g. 1 Queen or 2 Twins"
                            className="w-full px-3 py-2 rounded-lg border border-black/5 bg-white shadow-sm text-[#000000]/87 placeholder-white/30 text-sm outline-none focus:border-[#00754A]" />
                        </div>
                      </div>`;

if (appContent.includes(appFormTarget)) {
  appContent = appContent.replace(appFormTarget, appFormReplacement);
  console.log('App: Add Room form inputs layout updated.');
} else {
  console.log('App: Form layout target NOT found.');
}

if (wasAppCRLF) appContent = appContent.replace(/\n/g, '\r\n');
fs.writeFileSync(appFile, appContent, 'utf8');


// ─── PART 2: server/index.js ──────────────────────────────────────────────────
const srvFile = 'c:\\website\\northomes-system\\server\\index.js';
let srvContent = fs.readFileSync(srvFile, 'utf8');

let wasSrvCRLF = srvContent.includes('\r\n');
if (wasSrvCRLF) srvContent = srvContent.replace(/\r\n/g, '\n');

const srvApiTarget = `// POST /api/rooms — add a room manually
app.post('/api/rooms', async (req, res) => {
  try {
    const { room_number, room_type, floor } = req.body;
    if (!room_number) return res.status(400).json({ success: false, message: 'room_number required.' });
    const result = await pool.query(
      \`INSERT INTO hotel_rooms (room_number, room_type, floor)
       VALUES ($1, $2, $3)
       ON CONFLICT (room_number) DO UPDATE SET room_type=$2, floor=$3, active=true
       RETURNING *\`,
      [room_number.trim(), room_type || '', parseInt(floor) || 1]
    );
    res.json({ success: true, room: result.rows[0] });`;

const srvApiReplacement = `// POST /api/rooms — add a room manually
app.post('/api/rooms', async (req, res) => {
  try {
    const { room_number, room_type, floor, notes } = req.body;
    if (!room_number) return res.status(400).json({ success: false, message: 'room_number required.' });
    const result = await pool.query(
      \`INSERT INTO hotel_rooms (room_number, room_type, floor, notes)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (room_number) DO UPDATE SET room_type=$2, floor=$3, notes=$4, active=true
       RETURNING *\`,
      [room_number.trim(), room_type || '', parseInt(floor) || 1, notes || '']
    );
    res.json({ success: true, room: result.rows[0] });`;

if (srvContent.includes(srvApiTarget)) {
  srvContent = srvContent.replace(srvApiTarget, srvApiReplacement);
  console.log('Server: POST /api/rooms updated to support notes.');
} else {
  console.log('Server: POST /api/rooms target NOT found.');
}

if (wasSrvCRLF) srvContent = srvContent.replace(/\n/g, '\r\n');
fs.writeFileSync(srvFile, srvContent, 'utf8');

console.log('All changes written successfully.');
