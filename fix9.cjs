const fs = require('fs');
let c = fs.readFileSync('src/App.jsx', 'utf8');

// 1. Fix grid width and flex-nowrap
let gridTarget1 = 'className="hidden md:grid md:grid-cols-[60px_repeat(4,1fr)_120px] gap-4 px-6 py-4 bg-white shadow-sm border-b border-black/5 text-[10px] font-black text-black/60 uppercase tracking-widest items-center"';
let gridReplace1 = 'className="hidden md:grid md:grid-cols-[60px_repeat(4,1fr)_220px] gap-4 px-6 py-4 bg-white shadow-sm border-b border-black/5 text-[10px] font-black text-black/60 uppercase tracking-widest items-center"';
c = c.replace(gridTarget1, gridReplace1);

let gridTarget2 = 'className={`grid grid-cols-1 md:grid-cols-[60px_repeat(4,1fr)_120px] gap-4 px-6 py-4 items-center text-sm border-b border-black/5 hover:bg-white shadow-sm transition-all group ${index % 2 === 0 ? \'\' : \'bg-white/[0.02]\'}`}';
let gridReplace2 = 'className={`grid grid-cols-1 md:grid-cols-[60px_repeat(4,1fr)_220px] gap-4 px-6 py-4 items-center text-sm border-b border-black/5 hover:bg-white shadow-sm transition-all group ${index % 2 === 0 ? \'\' : \'bg-white/[0.02]\'}`}';
c = c.replace(gridTarget2, gridReplace2);

let wrapTarget = 'className="flex flex-wrap gap-1 justify-end"';
let wrapReplace = 'className="flex flex-nowrap gap-1.5 justify-end"';
c = c.replace(wrapTarget, wrapReplace);

// 2. Add masterStats
const masterStatsStr = `
  const masterStats = useMemo(() => {
    if (!masterRes) return { arrivals_today: 0, departures_today: 0, in_house: 0, occupancy: 0 };
    const d = new Date();
    const today = new Date(d.getTime() - (d.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
    
    const arrivals = masterRes.filter(a => ['pending', 'confirmed'].includes(a.status) && a.check_in_date && a.check_in_date.slice(0, 10) === today).length;
    const departures = masterRes.filter(a => a.status === 'checked_in' && a.check_out_date && a.check_out_date.slice(0, 10) === today).length;
    const inHouse = masterRes.filter(a => a.status === 'checked_in').length;
    const occ = Math.round((inHouse / 50) * 100);
    
    return { arrivals_today: arrivals, departures_today: departures, in_house: inHouse, occupancy: occ };
  }, [masterRes]);
`;
if (!c.includes('const masterStats = useMemo')) {
  c = c.replace(
    'const clearFilters = () => {',
    masterStatsStr + '\n  const clearFilters = () => {'
  );
}

// 3. Replace Dashboard metric cards mapping
const dashMetricsTarget = `                      {[
                        { label: 'Arrivals Today', value: stats.arrivals_today, color: 'text-[#006241]', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" /></svg> },
                        { label: 'Departures Today', value: appointments.filter(a => a.status === 'checked_in' && a.check_out_date === new Date().toISOString().split('T')[0]).length, color: 'text-emerald-600', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 9V5.25A2.25 2.25 0 0110.5 3h6a2.25 2.25 0 012.25 2.25v13.5A2.25 2.25 0 0116.5 21h-6a2.25 2.25 0 01-2.25-2.25V15m-3 0l-3-3m0 0l3-3m-3 3H15" /></svg> },
                        { label: 'In-House', value: appointments.filter(a => a.status === 'checked_in').length, color: 'text-amber-600', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-3h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" /></svg> },
                        { label: 'Occupancy', value: \`\${Math.round((appointments.filter(a => a.status === 'checked_in').length / 50) * 100)}%\`, color: 'text-[#006241]', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></svg> },
                      ]`;

const dashMetricsReplace = `                      {[
                        { label: 'Arrivals Today', value: masterStats.arrivals_today, color: 'text-[#006241]', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" /></svg> },
                        { label: 'Departures Today', value: masterStats.departures_today, color: 'text-emerald-600', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 9V5.25A2.25 2.25 0 0110.5 3h6a2.25 2.25 0 012.25 2.25v13.5A2.25 2.25 0 0116.5 21h-6a2.25 2.25 0 01-2.25-2.25V15m-3 0l-3-3m0 0l3-3m-3 3H15" /></svg> },
                        { label: 'In-House', value: masterStats.in_house, color: 'text-amber-600', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-3h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" /></svg> },
                        { label: 'Occupancy', value: \`\${masterStats.occupancy}%\`, color: 'text-[#006241]', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></svg> },
                      ]`;

if (c.includes(dashMetricsTarget)) {
  c = c.replace(dashMetricsTarget, dashMetricsReplace);
}

fs.writeFileSync('src/App.jsx', c);
console.log('App.jsx fixed successfully.');
