const fs = require('fs');
let c = fs.readFileSync('src/App.jsx', 'utf8');

// 1. Add filteredMasterRes after filteredAppointments
const filterStr = `  const filteredMasterRes = masterRes.filter(apt => {
    if (apt.status === 'checked_in') return false; // Hide checked_in
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchesSearch = (apt.full_name && apt.full_name.toLowerCase().includes(q)) || (apt.phone_number && apt.phone_number.includes(q)) || (apt.email && apt.email.toLowerCase().includes(q));
      if (!matchesSearch) return false;
    }
    let aptStatus = apt.status;
    if (aptStatus === 'checked_out') aptStatus = 'completed';
    if (filter !== 'all' && aptStatus !== filter) return false;
    if (startDate && apt.check_in_date && apt.check_in_date.slice(0, 10) < startDate) return false;
    if (endDate && apt.check_in_date && apt.check_in_date.slice(0, 10) > endDate) return false;
    return true;
  });`;

if (!c.includes('const filteredMasterRes')) {
  c = c.replace('  const stats = useMemo(() => {', filterStr + '\n\n  const stats = useMemo(() => {');
}

// 2. Replace masterRes.length and masterRes.map in the Bookings tab UI
// But I need to be careful. In the restored version, it might be using masterRes.length === 0 and masterRes.map.
c = c.replace(
  ') : masterRes.length === 0 ? (',
  ') : filteredMasterRes.length === 0 ? ('
);

c = c.replace(
  '{masterRes.map((apt, index) => (',
  '{filteredMasterRes.map((apt, index) => ('
);

fs.writeFileSync('src/App.jsx', c);
console.log('Done fix10');
