const fs = require('fs');

let code = fs.readFileSync('src/App.jsx', 'utf8');

const billingStartToken = "{/* ==================== BILLING TAB ==================== */}";
const calendarStartToken = "{/* ==================== CALENDAR TAB ==================== */}";

const startIdx = code.indexOf(billingStartToken);
const endIdx = code.indexOf(calendarStartToken);

if (startIdx !== -1 && endIdx !== -1) {
  const newBillingJSX = `${billingStartToken}
        {activeTab === 'billing' && (
          <AdminBillingTab
            reservations={reservations}
            openFolio={openFolio}
            folioOpen={folioOpen} setFolioOpen={setFolioOpen} folioRes={folioRes}
            fmtDate={fmtDate} nightsCount={nightsCount} printFolio={printFolio}
            sendFolioEmail={sendFolioEmail} folioEmailSending={folioEmailSending} folioEmailMsg={folioEmailMsg}
            folioLoading={folioLoading} folioError={folioError} folioTotals={folioTotals} folioItems={folioItems}
            voidCharge={voidCharge} fcType={fcType} setFcType={setFcType} fcDesc={fcDesc} setFcDesc={setFcDesc}
            fcQty={fcQty} setFcQty={setFcQty} fcPrice={fcPrice} setFcPrice={setFcPrice} addCharge={addCharge} fcSaving={fcSaving} fcError={fcError}
            folioPayments={folioPayments} voidPayment={voidPayment} fpMethod={fpMethod} setFpMethod={setFpMethod} fpAmount={fpAmount} setFpAmount={setFpAmount}
            fpRef={fpRef} setFpRef={setFpRef} addPayment={addPayment} fpSaving={fpSaving} fpError={fpError}
            stats={stats}
          />
        )}

        `;
  
  code = code.substring(0, startIdx) + newBillingJSX + code.substring(endIdx);
  
  // Now we need to inject the `AdminBillingTab` component definition.
  // We'll place it right before `export default function RestaurantApp() {`
  const restaurantAppToken = "export default function RestaurantApp() {";
  const compIdx = code.indexOf(restaurantAppToken);
  
  if (compIdx !== -1 && !code.includes('function AdminBillingTab')) {
    const adminBillingComp = `
function AdminBillingTab({
  reservations, openFolio,
  folioOpen, setFolioOpen, folioRes, fmtDate, nightsCount, printFolio,
  sendFolioEmail, folioEmailSending, folioEmailMsg, folioLoading, folioError,
  folioTotals, folioItems, voidCharge, fcType, setFcType, fcDesc, setFcDesc,
  fcQty, setFcQty, fcPrice, setFcPrice, addCharge, fcSaving, fcError,
  folioPayments, voidPayment, fpMethod, setFpMethod, fpAmount, setFpAmount,
  fpRef, setFpRef, addPayment, fpSaving, fpError, stats
}) {
  const [billingTab, setBillingTab] = React.useState('Guest Billing');
  const [searchQ, setSearchQ] = React.useState('');
  const [filterStatus, setFilterStatus] = React.useState('In-House');
  const [addChargeOpen, setAddChargeOpen] = React.useState(false);
  const [addPayOpen, setAddPayOpen] = React.useState(false);

  const filteredGuests = reservations.filter(r => {
    if (filterStatus !== 'All' && r.status !== filterStatus) return false;
    if (searchQ) {
      const q = searchQ.toLowerCase();
      return (r.full_name||'').toLowerCase().includes(q) || (r.room_number||'').toLowerCase().includes(q);
    }
    return true;
  });

  const fmtA = (n) => \`₱\${parseFloat(n||0).toLocaleString('en-PH',{minimumFractionDigits:2,maximumFractionDigits:2})}\`;

  const handleAddCharge = () => {
    addCharge(fcType, fcDesc || fcType, fcQty, fcPrice);
    setAddChargeOpen(false);
    setFcDesc(''); setFcPrice(''); setFcQty(1);
  };

  const handleAddPayment = () => {
    addPayment(fpMethod, fpAmount, fpRef);
    setAddPayOpen(false);
    setFpAmount(''); setFpRef('');
  };

  // Folio logic
  const isDueOut = folioRes?.check_out_date && folioRes.check_out_date.slice(0,10) === new Date().toISOString().slice(0,10);
  const initials = (folioRes?.full_name || '??').split(/[\\s,]+/).filter(Boolean).map(w=>w[0]).join('').toUpperCase().slice(0,2);
  const nights = folioRes ? nightsCount(folioRes) : 0;
  
  const ledger = [
    ...folioItems.map(i=>({...i,type:'charge',timestamp:new Date(i.created_at||Date.now()).getTime()})),
    ...folioPayments.map(p=>({...p,type:'payment',timestamp:new Date(p.posted_at||Date.now()).getTime()}))
  ].sort((a,b)=>a.timestamp-b.timestamp);
  
  let runBal=0;
  const ledgerWithBalance = ledger.map(e=>{
    if(!e.voided){ if(e.type==='charge') runBal+=parseFloat(e.amount); else runBal-=parseFloat(e.amount); }
    return{...e,currentBalance:runBal};
  });

  return (
    <div style={{ position: 'fixed', top: 0, left: '120px', right: 0, bottom: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden', zIndex: 10, background: '#f5f7f9' }}>
      
      {/* Top Header */}
      <div className="bg-white border-b border-black/10 px-8 py-5 shrink-0">
        <div className="flex justify-between items-end mb-6">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-[#111]">Billing</h1>
            <p className="text-black/50 text-xs font-medium mt-1">Manage guest folios, charges and payments</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <input type="text" placeholder="Search guest, room, or reservation..." className="pl-4 pr-10 py-2 w-72 text-xs border border-black/10 rounded-lg outline-none focus:border-[#00754A]" />
              <Search className="w-4 h-4 text-black/40 absolute right-3 top-2" />
            </div>
            <button className="relative w-8 h-8 rounded-full border border-black/10 flex items-center justify-center text-black/60 hover:text-black hover:bg-black/5">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 01-3.46 0"></path></svg>
              <span className="absolute top-0 right-0 w-3 h-3 bg-[#00754A] border-2 border-white rounded-full"></span>
            </button>
            <button className="flex items-center gap-1.5 bg-[#1E3932] hover:bg-[#142b22] text-white px-4 py-2 rounded-lg text-xs font-bold transition-colors">
              <Plus className="w-3.5 h-3.5" /> Add Charge
            </button>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="flex items-center gap-8 -mb-5">
          {['Guest Billing', 'Invoices', 'Payments', 'City Ledger', 'Cashier Shift', 'Taxes & Discounts'].map(tab => (
            <button key={tab} onClick={() => setBillingTab(tab)}
              className={\`pb-4 text-xs font-bold transition-colors border-b-2 \${billingTab === tab ? 'border-[#00754A] text-[#00754A]' : 'border-transparent text-black/60 hover:text-black'}\`}>
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden p-6 gap-6">
        
        {/* Left Panel: Guest Search & List */}
        <div className="w-[300px] shrink-0 flex flex-col gap-6">
          
          <div className="bg-white rounded-xl shadow-sm border border-black/5 p-5">
            <h3 className="text-[10px] font-black text-[#00754A] uppercase tracking-widest mb-4">Search Guest</h3>
            <div className="space-y-4">
              <div className="relative">
                <input type="text" placeholder="Search guest name, room no. or folio no." value={searchQ} onChange={e=>setSearchQ(e.target.value)}
                  className="w-full pl-3 pr-8 py-2.5 bg-[#fcfcfc] border border-black/10 rounded-lg text-[11px] outline-none focus:border-[#00754A]" />
                <Search className="w-3.5 h-3.5 text-black/40 absolute right-3 top-3" />
              </div>
              <div>
                <label className="block text-[10px] text-black/50 font-bold mb-1">Status</label>
                <select value={filterStatus} onChange={e=>setFilterStatus(e.target.value)} className="w-full py-2.5 px-3 bg-[#fcfcfc] border border-black/10 rounded-lg text-[11px] outline-none">
                  <option value="All">All</option>
                  <option value="In-House">In-House</option>
                  <option value="Checked-Out">Checked-Out</option>
                  <option value="Reserved">Reserved</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] text-black/50 font-bold mb-1">Payment Status</label>
                <select className="w-full py-2.5 px-3 bg-[#fcfcfc] border border-black/10 rounded-lg text-[11px] outline-none">
                  <option>All</option>
                  <option>Outstanding</option>
                  <option>Paid</option>
                </select>
              </div>
              <div className="flex gap-2 pt-2">
                <button className="flex-1 py-2 text-[11px] font-bold text-black/60 bg-black/5 rounded-lg hover:bg-black/10">Reset</button>
                <button className="flex-1 py-2 text-[11px] font-bold text-white bg-[#00754A] rounded-lg hover:bg-[#006241]">Search</button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-black/5 flex-1 flex flex-col overflow-hidden">
            <div className="p-4 border-b border-black/5">
              <h3 className="text-[10px] font-black text-[#00754A] uppercase tracking-widest">Guest Billing List ({filteredGuests.length})</h3>
            </div>
            <div className="flex-1 overflow-y-auto">
              {filteredGuests.map(r => {
                const isActive = folioRes?.id === r.id;
                // mock balance for the list UI
                const bal = isActive ? folioTotals.balance : (Math.random() > 0.5 ? 5600 : 0);
                return (
                  <div key={r.id} onClick={() => openFolio(r)}
                    className={\`p-4 border-b border-black/5 cursor-pointer hover:bg-black/[0.02] transition-colors flex flex-col \${isActive?'bg-[#00754A]/5 border-l-4 border-l-[#00754A]':'border-l-4 border-l-transparent'}\`}>
                    <div className="flex justify-between items-start mb-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#111] text-xs">{r.room_number||'TBA'}</span>
                        <span className="font-bold text-black/80 text-xs truncate max-w-[100px]">{r.full_name}</span>
                        <span className={\`text-[8px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider \${r.status==='In-House'?'bg-green-100 text-green-700':'bg-gray-100 text-gray-600'}\`}>{r.status}</span>
                      </div>
                      <span className={\`text-xs font-bold \${bal>0?'text-red-600':'text-[#00754A]'}\`}>{fmtA(bal)}</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-black/50">
                      <span>{r.room_type} | {nightsCount(r)} Nights</span>
                      <span className={bal>0?'text-red-500':'text-[#00754A]'}>{bal>0?'Outstanding':'Paid'}</span>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="p-3 border-t border-black/5 text-center">
              <button className="text-[10px] font-bold text-[#00754A] hover:underline">View All Guests →</button>
            </div>
          </div>
        </div>

        {/* Middle Panel: Guest Folio View */}
        <div className="flex-[2] bg-white rounded-xl shadow-sm border border-black/5 flex flex-col overflow-hidden">
          {folioRes ? (
            <>
              {/* Guest Header */}
              <div className="p-6 border-b border-black/5 shrink-0">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-[#f0f0f0] flex items-center justify-center text-lg font-bold text-black border border-black/10">
                      {initials}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-xl font-bold text-[#111]">{folioRes.full_name}</h2>
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-green-100 text-green-700 uppercase tracking-widest">{folioRes.status}</span>
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-700 uppercase tracking-widest">VIP</span>
                      </div>
                    </div>
                  </div>
                  <button className="px-4 py-1.5 border border-black/10 rounded-lg text-[11px] font-bold hover:bg-black/5 flex items-center gap-1.5">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg> Edit
                  </button>
                </div>
                
                <div className="grid grid-cols-6 gap-4 text-xs">
                  <div>
                    <div className="text-black/50 text-[9px] font-bold uppercase tracking-widest mb-0.5 flex items-center gap-1"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/></svg> Room</div>
                    <div className="font-bold">{folioRes.room_number||'TBA'}</div>
                    <div className="text-black/60 truncate">{folioRes.room_type}</div>
                  </div>
                  <div className="col-span-1">
                    <div className="text-black/50 text-[9px] font-bold uppercase tracking-widest mb-0.5">Reservation #</div>
                    <div className="font-medium text-black/80">NHP-{String(folioRes.id).padStart(8,'0')}</div>
                  </div>
                  <div>
                    <div className="text-black/50 text-[9px] font-bold uppercase tracking-widest mb-0.5">Check-In</div>
                    <div className="font-medium text-black/80">{fmtDate(folioRes.check_in_date)}<br/><span className="text-black/50">2:00 PM</span></div>
                  </div>
                  <div>
                    <div className="text-black/50 text-[9px] font-bold uppercase tracking-widest mb-0.5">Check-Out</div>
                    <div className="font-medium text-black/80">{fmtDate(folioRes.check_out_date)}<br/><span className="text-black/50">11:00 AM</span></div>
                  </div>
                  <div>
                    <div className="text-black/50 text-[9px] font-bold uppercase tracking-widest mb-0.5">Nights</div>
                    <div className="font-medium text-black/80">{nights}</div>
                  </div>
                  <div>
                    <div className="text-black/50 text-[9px] font-bold uppercase tracking-widest mb-0.5">Adults / Children</div>
                    <div className="font-medium text-black/80">{folioRes.number_of_guests} / 0</div>
                  </div>
                </div>
              </div>

              {/* Folio Tabs */}
              <div className="px-6 flex gap-6 border-b border-black/5 shrink-0 bg-[#fbfcfc]">
                {['Folio', 'Stay Details', 'Payments', 'Deposits', 'Notes', 'Documents', 'Audit Trail'].map(tab => (
                  <button key={tab} className={\`py-3 text-[11px] font-bold border-b-2 transition-colors \${tab==='Folio'?'border-[#00754A] text-[#00754A]':'border-transparent text-black/60 hover:text-black'}\`}>
                    {tab}
                  </button>
                ))}
              </div>

              {/* TRANSACTIONS SECTION */}
              <div className="flex-1 flex flex-col min-h-0">
                <div className="px-6 py-4 flex justify-between items-center border-b border-black/5 shrink-0">
                  <h3 className="text-[11px] font-black text-[#00754A] uppercase tracking-widest">Transactions</h3>
                  <div className="flex gap-2">
                    <select className="border border-black/10 rounded px-2 py-1.5 text-[10px] outline-none bg-white"><option>All Types</option></select>
                    <select className="border border-black/10 rounded px-2 py-1.5 text-[10px] outline-none bg-white"><option>All Categories</option></select>
                    <button className="border border-black/10 rounded px-2 py-1.5 bg-white"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M7 11V7a5 5 0 0110 0v4"/><path d="M4 11h16v10H4z"/></svg></button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto" style={{scrollbarWidth:'thin'}}>
                  <table className="w-full text-left border-collapse text-[11px]">
                    <thead className="sticky top-0 bg-[#fbfcfc] border-b border-black/5">
                      <tr className="text-black/60 font-bold">
                        <th className="px-6 py-3">Date</th>
                        <th className="px-3 py-3">Time</th>
                        <th className="px-3 py-3">Description</th>
                        <th className="px-3 py-3">Category</th>
                        <th className="px-3 py-3 text-right">Debit (₱)</th>
                        <th className="px-3 py-3 text-right">Credit (₱)</th>
                        <th className="px-6 py-3 text-right">Balance (₱)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black/5">
                      {ledgerWithBalance.length === 0 ? (
                        <tr><td colSpan="7" className="px-6 py-8 text-center text-black/40 italic">No transactions found</td></tr>
                      ) : ledgerWithBalance.map((entry) => {
                        const isCharge = entry.type==='charge';
                        const ts = new Date(entry.timestamp);
                        return (
                          <tr key={entry.id} className="hover:bg-black/[0.02]">
                            <td className="px-6 py-3 font-medium">{ts.toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}</td>
                            <td className="px-3 py-3 text-black/60">{ts.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}</td>
                            <td className="px-3 py-3">{entry.description||entry.charge_type||entry.payment_method}</td>
                            <td className="px-3 py-3 text-black/60">{entry.charge_type || 'Payment'}</td>
                            <td className="px-3 py-3 text-right font-mono">{isCharge ? parseFloat(entry.amount||0).toLocaleString('en-PH',{minimumFractionDigits:2}) : '—'}</td>
                            <td className="px-3 py-3 text-right font-mono">{!isCharge ? parseFloat(entry.amount||0).toLocaleString('en-PH',{minimumFractionDigits:2}) : '—'}</td>
                            <td className="px-6 py-3 text-right font-mono font-bold text-black">{parseFloat(entry.currentBalance||0).toLocaleString('en-PH',{minimumFractionDigits:2})}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  <div className="p-4 text-center">
                    <button className="text-[10px] font-bold text-[#00754A] hover:underline">View All Transactions</button>
                  </div>
                </div>

                {/* Folio Summary Block */}
                <div className="p-6 bg-[#fbfcfc] border-t border-black/5 shrink-0">
                  <h3 className="text-[10px] font-black text-[#00754A] uppercase tracking-widest mb-4">Folio Summary</h3>
                  <div className="flex items-center gap-8">
                    <div className="flex-1 space-y-2">
                      <div className="flex justify-between text-xs"><span className="text-black/60">Total Charges</span><span className="font-bold">{fmtA(folioTotals.charges)}</span></div>
                      <div className="flex justify-between text-xs"><span className="text-black/60">Total Payments</span><span className="font-bold">{fmtA(folioTotals.payments)}</span></div>
                      <div className="flex justify-between text-xs"><span className="text-black/60">Total Refunds</span><span className="font-bold">₱0.00</span></div>
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex justify-between text-xs"><span className="text-black/60">Deposit</span><span className="font-bold">₱0.00</span></div>
                      <div className="flex justify-between text-xs"><span className="text-black/60">Adjustments</span><span className="font-bold">₱0.00</span></div>
                    </div>
                    <div className="w-[200px] shrink-0 bg-[#006241] text-white p-4 rounded-xl flex flex-col items-center justify-center shadow-md">
                      <span className="text-[9px] font-bold uppercase tracking-widest opacity-80 mb-1">Outstanding Balance</span>
                      <span className="text-2xl font-black">{fmtA(folioTotals.balance)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-black/40">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="mb-4 opacity-50"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              <h2 className="text-lg font-bold text-black/60">No Guest Selected</h2>
              <p className="text-xs">Select a guest from the list to view their folio and billing details.</p>
            </div>
          )}
        </div>

        {/* Right Panel: Quick Actions & Summaries */}
        <div className="w-[260px] shrink-0 flex flex-col gap-6 overflow-y-auto no-scrollbar">
          
          <div className="space-y-4">
            <h3 className="text-[10px] font-black text-[#00754A] uppercase tracking-widest">Quick Actions</h3>
            <div className="space-y-2">
              <button onClick={()=>setAddChargeOpen(true)} className="w-full flex items-center gap-3 p-3 bg-[#1E3932] text-white rounded-lg hover:bg-[#142b22] transition-colors text-xs font-bold shadow-sm">
                <Plus className="w-4 h-4"/> Add Charge
              </button>
              <button onClick={()=>setAddPayOpen(o=>!o)} className="w-full flex items-center gap-3 p-3 bg-white border border-black/10 text-[#111] rounded-lg hover:bg-black/5 transition-colors text-xs font-bold shadow-sm">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg> Add Payment
              </button>
              <button className="w-full flex items-center gap-3 p-3 bg-white border border-black/10 text-[#111] rounded-lg hover:bg-black/5 transition-colors text-xs font-bold shadow-sm">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"/></svg> Refund
              </button>
              <button className="w-full flex items-center gap-3 p-3 bg-white border border-black/10 text-[#111] rounded-lg hover:bg-black/5 transition-colors text-xs font-bold shadow-sm">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg> Add Deposit
              </button>
              <button className="w-full flex items-center gap-3 p-3 bg-white border border-black/10 text-[#111] rounded-lg hover:bg-black/5 transition-colors text-xs font-bold shadow-sm">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20V10M18 20V4M6 20v-4"/></svg> Discount / Adjustment
              </button>
              <button className="w-full flex items-center gap-3 p-3 bg-white border border-black/10 text-[#111] rounded-lg hover:bg-black/5 transition-colors text-xs font-bold shadow-sm">
                <X className="w-4 h-4"/> Void Transaction
              </button>
              <button onClick={sendFolioEmail} className="w-full flex items-center gap-3 p-3 bg-white border border-black/10 text-[#111] rounded-lg hover:bg-black/5 transition-colors text-xs font-bold shadow-sm">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg> Email Folio
              </button>
              <button onClick={printFolio} className="w-full flex items-center gap-3 p-3 bg-white border border-black/10 text-[#111] rounded-lg hover:bg-black/5 transition-colors text-xs font-bold shadow-sm">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/><path d="M6 14h12v8H6z"/></svg> Print Folio
              </button>
              <button onClick={printFolio} className="w-full flex items-center gap-3 p-3 bg-white border border-black/10 text-[#111] rounded-lg hover:bg-black/5 transition-colors text-xs font-bold shadow-sm">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg> Download PDF
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-black/5 p-5 space-y-4 mt-2">
            <h3 className="text-[10px] font-black text-[#00754A] uppercase tracking-widest">Today's Summary</h3>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between"><span className="text-black/60">Total Charges</span><span className="font-medium">₱12,580.00</span></div>
              <div className="flex justify-between"><span className="text-black/60">Total Payments</span><span className="font-medium">₱8,400.00</span></div>
              <div className="flex justify-between"><span className="text-black/60">Refunds</span><span className="font-medium">₱150.00</span></div>
              <div className="flex justify-between pt-3 border-t border-black/5 font-bold"><span className="text-[#111]">Outstanding</span><span className="text-red-600">₱18,620.00</span></div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-black/5 p-5 space-y-4">
            <h3 className="text-[10px] font-black text-[#00754A] uppercase tracking-widest">Payment Methods (Today)</h3>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between"><span className="text-black/60">Cash</span><span className="font-medium">₱3,200.00</span></div>
              <div className="flex justify-between"><span className="text-black/60">Credit Card</span><span className="font-medium">₱4,000.00</span></div>
              <div className="flex justify-between"><span className="text-black/60">GCash</span><span className="font-medium">₱1,700.00</span></div>
              <div className="flex justify-between"><span className="text-black/60">Maya</span><span className="font-medium">₱500.00</span></div>
              <div className="flex justify-between"><span className="text-black/60">Bank Transfer</span><span className="font-medium">₱1,000.00</span></div>
            </div>
          </div>

        </div>
      </div>
      
      {addChargeOpen && (
        <div className="fixed inset-0 z-[200] bg-black/30 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold mb-4">Add Charge</h3>
            <div className="space-y-4">
              <select value={fcType} onChange={e=>setFcType(e.target.value)} className="w-full border rounded-lg p-2 text-sm">
                <option value="Room Charge">Room Charge</option>
                <option value="Food & Beverage">Food & Beverage</option>
                <option value="Mini Bar">Mini Bar</option>
                <option value="Laundry">Laundry</option>
              </select>
              <input type="text" placeholder="Description" value={fcDesc} onChange={e=>setFcDesc(e.target.value)} className="w-full border rounded-lg p-2 text-sm" />
              <div className="flex gap-4">
                <input type="number" placeholder="Qty" value={fcQty} onChange={e=>setFcQty(e.target.value)} className="w-20 border rounded-lg p-2 text-sm" />
                <input type="number" placeholder="Price" value={fcPrice} onChange={e=>setFcPrice(e.target.value)} className="flex-1 border rounded-lg p-2 text-sm" />
              </div>
              <div className="flex gap-3 pt-4">
                <button onClick={()=>setAddChargeOpen(false)} className="flex-1 py-2 rounded-lg text-sm font-bold bg-black/5 hover:bg-black/10">Cancel</button>
                <button onClick={handleAddCharge} disabled={fcSaving} className="flex-1 py-2 rounded-lg text-sm font-bold text-white bg-[#00754A] hover:bg-[#006241]">{fcSaving?'Saving...':'Post Charge'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {addPayOpen && (
        <div className="fixed inset-0 z-[200] bg-black/30 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold mb-4">Post Payment</h3>
            <div className="space-y-4">
              <select value={fpMethod} onChange={e=>setFpMethod(e.target.value)} className="w-full border rounded-lg p-2 text-sm">
                {['Cash','Credit Card','Debit Card','GCash','Maya','Bank Transfer'].map(m=><option key={m}>{m}</option>)}
              </select>
              <input type="number" placeholder="Amount (₱)" value={fpAmount} onChange={e=>setFpAmount(e.target.value)} className="w-full border rounded-lg p-2 text-sm" />
              <input type="text" placeholder="Reference No. (Optional)" value={fpRef} onChange={e=>setFpRef(e.target.value)} className="w-full border rounded-lg p-2 text-sm" />
              <div className="flex gap-3 pt-4">
                <button onClick={()=>setAddPayOpen(false)} className="flex-1 py-2 rounded-lg text-sm font-bold bg-black/5 hover:bg-black/10">Cancel</button>
                <button onClick={handleAddPayment} disabled={fpSaving} className="flex-1 py-2 rounded-lg text-sm font-bold text-white bg-[#00754A] hover:bg-[#006241]">{fpSaving?'Saving...':'Post Payment'}</button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
`;
    
    code = code.substring(0, compIdx) + adminBillingComp + code.substring(compIdx);
    fs.writeFileSync('src/App.jsx', code);
    console.log('Successfully replaced billing tab UI and injected AdminBillingTab component.');
  } else {
    console.log('Could not find RestaurantApp token to inject component.');
  }
} else {
  console.log('Could not find start or end tokens.');
}
