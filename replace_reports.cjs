const fs = require('fs');
const path = require('path');

const appPath = path.join(__dirname, 'src', 'App.jsx');
let code = fs.readFileSync(appPath, 'utf8');

const startIndex = code.indexOf("{/* ==================== REPORTS TAB ==================== */}");
const endIndex = code.indexOf("{/* ==================== INBOX TAB ==================== */}");

if (startIndex === -1 || endIndex === -1) {
  console.error("Could not find start or end index for Reports Tab.");
  process.exit(1);
}

const newReportsCode = `{/* ==================== REPORTS TAB ==================== */}
        {activeTab === 'reports' && (() => {
          const [reportsSubTab, setReportsSubTab] = React.useState('All Reports');
          const [searchQuery, setSearchQuery] = React.useState('');

          const reportCategories = [
            {
              title: 'FRONT OFFICE REPORTS',
              id: 'Front Office',
              reports: [
                { title: "Daily Manager's Report", desc: "Summary of daily hotel operations and performance.", icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00754A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="M18 9l-5 5-4-4-5 5"/><path d="M18 9h-4"/><path d="M18 9v4"/></svg> },
                { title: "Arrival Report", desc: "List of guests arriving today.", icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00754A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="8.5" cy="7" r="4"/><path d="M20 8v6M23 11h-6"/></svg> },
                { title: "Departure Report", desc: "List of guests departing today.", icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00754A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="8.5" cy="7" r="4"/><path d="M17 11h6M20 8l3 3-3 3"/></svg> },
                { title: "In-House Guest Report", desc: "List of all in-house guests.", icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00754A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-3-3.87"/><path d="M9 21v-2a4 4 0 014-4h2"/><circle cx="9" cy="7" r="4"/><circle cx="16" cy="7" r="3"/></svg> },
                { title: "Room Status Report", desc: "Current status of all rooms.", icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00754A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6"/><path d="M10 13h4"/></svg> }
              ]
            },
            {
              title: 'FINANCIAL REPORTS',
              id: 'Financial',
              reports: [
                { title: "Revenue Report", desc: "Summary of revenue by department.", icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00754A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M16 8h-6a2 2 0 100 4h4a2 2 0 110 4H8"/><path d="M12 18V6"/></svg> },
                { title: "Cashier Shift Report", desc: "Summary of cashier shift transactions.", icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00754A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M6 8h12"/><path d="M6 12h12"/><path d="M6 16h4"/></svg> },
                { title: "Payment Collection Report", desc: "Summary of payments collected by method.", icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00754A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg> },
                { title: "Outstanding Balance Report", desc: "List of guests with outstanding balance.", icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00754A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="8.5" cy="7" r="4"/><path d="M20 12v6M17 15h6"/></svg> },
                { title: "Guest Ledger Report", desc: "Detailed ledger of guest accounts.", icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00754A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg> },
                { title: "City Ledger Report", desc: "List of company accounts and balances.", icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00754A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18"/><path d="M9 8h1"/><path d="M9 12h1"/><path d="M9 16h1"/><path d="M14 8h1"/><path d="M14 12h1"/><path d="M14 16h1"/><path d="M5 21V5a2 2 0 012-2h10a2 2 0 012 2v16"/></svg> },
                { title: "Trial Balance", desc: "Summary of balances for reconciliation.", icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00754A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg> }
              ]
            },
            {
              title: 'HOUSEKEEPING REPORTS',
              id: 'Housekeeping',
              reports: [
                { title: "Housekeeping Assignment", desc: "Rooms assigned to housekeeping staff.", icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00754A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/></svg> },
                { title: "Dirty Room Report", desc: "List of rooms to be cleaned.", icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00754A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 21.5l14-14M7 21v-4a2 2 0 012-2h2a2 2 0 012 2v4M12 11l5-5"/></svg> },
                { title: "Clean Room Report", desc: "List of clean and inspected rooms.", icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00754A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 4v16M2 8h18a2 2 0 012 2v10M2 17h20M6 8v9"/></svg> },
                { title: "Out of Order Report", desc: "Rooms that are out of order.", icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00754A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/></svg> }
              ]
            },
            {
              title: 'AUDIT REPORTS',
              id: 'Audit',
              reports: [
                { title: "Night Audit Report", desc: "Summary of end-of-day audit.", icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00754A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg> },
                { title: "Void Report", desc: "List of voided transactions.", icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00754A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg> },
                { title: "Discount Report", desc: "Summary of discounts given.", icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00754A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9 15l6-6"/><circle cx="9" cy="9" r="1"/><circle cx="15" cy="15" r="1"/></svg> },
                { title: "Refund Report", desc: "Summary of refunds issued.", icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00754A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 109-9 9.75 9.75 0 00-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg> },
                { title: "Deleted Charges Report", desc: "List of deleted charges.", icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00754A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg> },
                { title: "Rate Override Report", desc: "List of rate overrides.", icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00754A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg> }
              ]
            }
          ];

          const tabs = [
            { id: 'All Reports', label: 'All Reports', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg> },
            { id: 'Front Office', label: 'Front Office', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
            { id: 'Financial', label: 'Financial', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> },
            { id: 'Housekeeping', label: 'Housekeeping', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/></svg> },
            { id: 'Audit', label: 'Audit', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> }
          ];

          return (
            <div style={{ position: 'fixed', top: 0, left: '120px', right: 0, bottom: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden', zIndex: 10 }}>
              <div className="flex-1 flex flex-col min-h-0 w-full bg-[#f8f9fa]">
                <div className="flex-1 flex flex-col min-h-0 border-t border-l border-black/5 overflow-hidden">
                  
                  {/* Header bar */}
                  <div className="px-8 py-6 border-b border-black/5 bg-white shrink-0 flex items-center justify-between">
                    <div>
                      <h2 className="text-[#000000]/87 font-black text-2xl tracking-tight leading-tight">Reports</h2>
                      <p className="text-black/60 text-[13px] mt-1 font-medium">View and generate hotel reports</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 px-4 py-2.5 bg-white border border-black/10 rounded-lg text-xs text-black shadow-sm cursor-pointer hover:bg-gray-50 transition-colors font-medium">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-black/60"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                        <span>May 28, 2025 - May 28, 2025</span>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="ml-1 text-black/40"><path d="M6 9l6 6 6-6"/></svg>
                      </div>
                      <button className="flex items-center gap-2 px-5 py-2.5 bg-[#00754A] hover:bg-[#006241] text-white rounded-lg text-xs font-bold shadow-sm transition-colors">
                        <span>Custom Range</span>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                      </button>
                    </div>
                  </div>

                  {/* Sub Header / Tabs / Search */}
                  <div className="px-8 py-3 border-b border-black/5 bg-white shrink-0 flex items-center justify-between">
                    <div className="flex gap-2">
                      {tabs.map(tab => {
                        const active = reportsSubTab === tab.id;
                        return (
                          <button key={tab.id} onClick={() => setReportsSubTab(tab.id)}
                            className={\`flex items-center gap-2 px-4 py-2.5 rounded-lg text-[13px] transition-all \${active ? 'bg-[#00754A]/[0.06] text-[#00754A] font-bold' : 'text-black/60 hover:bg-black/5 font-medium'}\`}>
                            {React.cloneElement(tab.icon, { stroke: active ? '#00754A' : 'currentColor' })}
                            <span>{tab.label}</span>
                          </button>
                        );
                      })}
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-black/40" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                        </div>
                        <input type="text" placeholder="Search reports..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                          className="pl-9 pr-4 py-2.5 border border-black/10 rounded-lg text-xs w-64 outline-none focus:border-[#00754A] focus:ring-1 focus:ring-[#00754A] transition-all bg-white font-medium" />
                      </div>
                      <button className="flex items-center gap-2 px-5 py-2.5 border border-black/10 rounded-lg text-xs font-bold text-black/70 hover:bg-black/5 transition-colors bg-white shadow-sm">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-black/40"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                        <span>Favorites</span>
                      </button>
                    </div>
                  </div>

                  {/* Content Area */}
                  <div className="flex-1 overflow-y-auto p-10 bg-white">
                    <div className="space-y-12 max-w-[1400px]">
                      {reportCategories.filter(cat => reportsSubTab === 'All Reports' || cat.id === reportsSubTab).map(cat => (
                        <div key={cat.id}>
                          <h3 className="text-[12px] font-black uppercase tracking-[0.1em] text-[#00754A] mb-5">{cat.title}</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-5">
                            {cat.reports.filter(r => r.title.toLowerCase().includes(searchQuery.toLowerCase()) || r.desc.toLowerCase().includes(searchQuery.toLowerCase())).map((report, i) => (
                              <div key={i} className="group bg-white border border-black/10 rounded-xl hover:border-[#00754A]/30 hover:shadow-[0_8px_24px_rgba(0,117,74,0.08)] transition-all cursor-pointer flex flex-col relative overflow-hidden">
                                <div className="p-6 flex flex-col gap-4">
                                  <div className="flex items-start justify-between">
                                    <div className="w-10 h-10 rounded-lg bg-emerald-50/50 flex items-center justify-center shrink-0 border border-emerald-100/50">
                                      {React.cloneElement(report.icon, { strokeWidth: "2" })}
                                    </div>
                                    <button className="text-black/20 hover:text-amber-400 transition-colors shrink-0">
                                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                                    </button>
                                  </div>
                                  <div className="flex-1 min-w-0 mt-2">
                                    <h4 className="font-bold text-black text-[13px] leading-snug mb-1.5">{report.title}</h4>
                                    <p className="text-[11px] text-black/50 leading-relaxed font-medium">{report.desc}</p>
                                  </div>
                                </div>
                                <div className="mt-auto px-6 py-3.5 border-t border-black/5 bg-white flex items-center justify-between transition-colors">
                                  <span className="text-[11px] font-bold text-black/40 group-hover:text-[#00754A] transition-colors">Generate Report</span>
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-black/30 group-hover:text-[#00754A] transition-transform group-hover:translate-x-1"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-20 mb-8 flex items-center justify-center gap-2 text-black/40 text-xs font-medium">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                      <span>All reports can be exported to PDF, Excel, or CSV format.</span>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          );
        })()}
`;

code = code.substring(0, startIndex) + newReportsCode + "\\n" + code.substring(endIndex);

fs.writeFileSync(appPath, code);
console.log("Successfully replaced Reports Tab.");
