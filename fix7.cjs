const fs = require('fs');
let c = fs.readFileSync('src/App.jsx', 'utf8');

// 1. Add state for master reservations
if (!c.includes('const [masterRes, setMasterRes] = useState([]);')) {
  c = c.replace(
    'const [appointments, setAppointments] = useState([]);',
    'const [appointments, setAppointments] = useState([]);\n  const [masterRes, setMasterRes] = useState([]);\n  const [masterResLoading, setMasterResLoading] = useState(false);'
  );
}

// 2. Add fetch function
const fetchMasterResStr = `
  const fetchMasterRes = useCallback(async () => {
    try {
      setMasterResLoading(true);
      const res = await fetch(\`\${API_BASE_URL}/api/reservations\`);
      const data = await res.json();
      setMasterRes(data.reservations || []);
    } catch (e) { console.error(e); }
    setMasterResLoading(false);
  }, []);
`;
if (!c.includes('const fetchMasterRes = useCallback')) {
  c = c.replace(
    'const fetchAppointments = useCallback(async () => {',
    fetchMasterResStr + '\n  const fetchAppointments = useCallback(async () => {'
  );
}

// 3. Add to useEffect
if (!c.includes('if (activeTab === \'reservations\') fetchMasterRes();')) {
  c = c.replace(
    'if (activeTab === \'dashboard\') fetchAppointments();',
    'if (activeTab === \'dashboard\') fetchAppointments();\n      if (activeTab === \'reservations\') fetchMasterRes();'
  );
}

// 4. Replace the table header and body in "Bookings" tab
// Let's locate the 'Bookings' tab render
let parts = c.split('{/* ==================== RESERVATIONS TAB ==================== */}');
if (parts.length > 1) {
  let before = parts[0];
  let after = parts[1];
  
  // We want to replace the list rendering in "reservations" tab.
  // The list starts with: {/* Table Header */}
  let tabParts = after.split('{/* ==================== FRONT DESK TAB ==================== */}');
  let resTab = tabParts[0];
  let rest = tabParts[1];

  // We find the table rendering
  let listStart = resTab.indexOf('{/* Table Header */}');
  let listEnd = resTab.indexOf('{/* Export Button */}');
  
  if (listStart !== -1 && listEnd !== -1) {
    let oldList = resTab.substring(listStart, listEnd);
    let newList = \`{/* Table Header */}
                        <div className="hidden md:grid md:grid-cols-[60px_repeat(4,1fr)_120px] gap-4 px-6 py-4 bg-white shadow-sm border-b border-black/5 text-[10px] font-black text-black/60 uppercase tracking-widest items-center">
                          <span>#</span>
                          <span>Guest Name</span>
                          <span>Room</span>
                          <span>Dates</span>
                          <span>Status</span>
                          <span className="text-right">Actions</span>
                        </div>
                        {masterRes.map((apt, index) => (
                          <div key={apt.id} className={\`grid grid-cols-1 md:grid-cols-[60px_repeat(4,1fr)_120px] gap-4 px-6 py-4 items-center text-sm border-b border-black/5 hover:bg-white shadow-sm transition-all group \${index % 2 === 0 ? '' : 'bg-white/[0.02]'}\`}>
                            <span className="text-black/60 font-mono text-xs">{apt.id}</span>
                            <div className="min-w-0">
                              <p className="text-[#000000]/87 font-bold group-hover:text-[#00754A] transition-colors truncate">{apt.full_name}</p>
                              <p className="text-black/60 text-[10px] truncate md:hidden">{apt.phone_number}</p>
                            </div>
                            <div className="min-w-0">
                              <p className="text-black/60 text-xs font-bold truncate">Room {apt.room_number || 'TBA'}</p>
                              <p className="text-black/60 text-[10px] truncate">{apt.room_type}</p>
                            </div>
                            <div className="min-w-0">
                              <p className="text-black/60 text-xs font-medium truncate">{new Date(apt.check_in_date).toLocaleDateString()}</p>
                              <p className="text-black/60 text-[10px] truncate">to {new Date(apt.check_out_date).toLocaleDateString()}</p>
                            </div>
                            <span className={\`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-tighter border w-fit \${getStatusColor(apt.status)}\`}>
                              {apt.status}
                            </span>
                            <div className="flex flex-wrap gap-1 justify-end">
                              <button onClick={() => { setActiveTab('frontdesk'); /* open Folio maybe? */ }} className="px-2 py-1 bg-gray-50 text-gray-600 rounded text-xs hover:bg-gray-100 transition-all border border-gray-200">
                                View in FD
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    \`;
                    
    resTab = resTab.replace(oldList, newList);
  }

  // Also replace isLoading and filteredAppointments length checks
  resTab = resTab.replace(/isLoading \?/g, 'masterResLoading ?');
  resTab = resTab.replace(/filteredAppointments\.length/g, 'masterRes.length');

  c = before + '{/* ==================== RESERVATIONS TAB ==================== */}' + resTab + '{/* ==================== FRONT DESK TAB ==================== */}' + rest;
  fs.writeFileSync('src/App.jsx', c);
  console.log('Fixed Bookings Tab to show Hotel Reservations!');
} else {
  console.log('Could not find reservations tab in App.jsx');
}
