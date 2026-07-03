const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'App.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// Find start marker
const startMarker = '// ── Folio Modal (Restored) ───────────────────────────────────────────────────';
const startIdx = content.indexOf(startMarker);
if (startIdx === -1) {
  console.error('START MARKER NOT FOUND');
  process.exit(1);
}

// The file ends right after the last line of the FolioModal
// Just replace from startMarker to end of file
const newFolioModal = `// ── Folio Modal — Full Screen Redesign ───────────────────────────────────────

function FolioModal({
  folioOpen, folioRes, setFolioOpen, fmtDate, nightsCount, printFolio,
  sendFolioEmail, folioEmailSending, folioEmailMsg, folioLoading, folioError,
  folioTotals, folioItems, voidCharge, fcType, setFcType, fcDesc, setFcDesc,
  fcQty, setFcQty, fcPrice, setFcPrice, addCharge, fcSaving, fcError,
  folioPayments, voidPayment, fpMethod, setFpMethod, fpAmount, setFpAmount,
  fpRef, setFpRef, addPayment, fpSaving, fpError
}) {
  const [addChargeOpen, setAddChargeOpen] = React.useState(false);
  const [chargeType, setChargeType] = React.useState('Room Charge');
  const [chargeDate, setChargeDate] = React.useState(new Date().toISOString().slice(0,10));
  const [chargeTime, setChargeTime] = React.useState(new Date().toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit',hour12:false}));
  const [chargeDesc, setChargeDesc] = React.useState('');
  const [chargeQty, setChargeQty] = React.useState(1);
  const [chargeRate, setChargeRate] = React.useState('');
  const [chargeRef, setChargeRef] = React.useState('');
  const [chargeDept, setChargeDept] = React.useState('Front Office');
  const [chargeNotes, setChargeNotes] = React.useState('');
  const [addPayOpen, setAddPayOpen] = React.useState(false);

  if (!folioOpen || !folioRes) return null;

  const nights = nightsCount(folioRes);
  const fmtA = (n) => \`\u20b1\${parseFloat(n||0).toLocaleString('en-PH',{minimumFractionDigits:2,maximumFractionDigits:2})}\`;
  const isDueOut = folioRes.check_out_date && folioRes.check_out_date.slice(0,10) === new Date().toISOString().slice(0,10);

  const initials = (folioRes.full_name || '??').split(/[\\s,]+/).filter(Boolean).map(w=>w[0]).join('').toUpperCase().slice(0,2);

  const ledger = [
    ...folioItems.map(i=>({...i,type:'charge',timestamp:new Date(i.created_at||Date.now()).getTime()})),
    ...folioPayments.map(p=>({...p,type:'payment',timestamp:new Date(p.posted_at||Date.now()).getTime()}))
  ].sort((a,b)=>a.timestamp-b.timestamp);
  let runBal=0;
  const ledgerWithBalance = ledger.map(e=>{
    if(!e.voided){ if(e.type==='charge') runBal+=parseFloat(e.amount); else runBal-=parseFloat(e.amount); }
    return{...e,currentBalance:runBal};
  });

  const chargeTypes = [
    { id:'Room Charge', label:'Room Charge', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/></svg> },
    { id:'Food & Beverage', label:'Food & Bev', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M18 8h1a4 4 0 010 8h-1M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8zM6 1v3M10 1v3M14 1v3"/></svg> },
    { id:'Mini Bar', label:'Mini Bar', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8 22V12L3 6h18l-5 6v10"/><path d="M8 22h8"/></svg> },
    { id:'Laundry', label:'Laundry', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="3" width="20" height="18" rx="2"/><circle cx="12" cy="13" r="4"/><path d="M6 7h.01"/></svg> },
    { id:'Transportation', label:'Transport', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg> },
    { id:'Telephone', label:'Telephone', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8a19.79 19.79 0 01-3.07-8.64A2 2 0 012 .82h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/></svg> },
    { id:'Miscellaneous', label:'Miscellaneous', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6M12 18v-6M9 15h6"/></svg> },
    { id:'Tax / VAT', label:'Tax / VAT', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg> },
    { id:'Other', label:'Other', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><path d="M8 12h8M12 8v8"/></svg> },
  ];

  const handleAddCharge = () => {
    setFcType(chargeType);
    setFcDesc(chargeDesc || chargeType);
    setFcQty(chargeQty);
    setFcPrice(chargeRate);
    addCharge();
    setAddChargeOpen(false);
    setChargeDesc(''); setChargeRate(''); setChargeQty(1); setChargeRef(''); setChargeNotes('');
  };

  const handleAddPayment = () => {
    addPayment();
    setAddPayOpen(false);
  };

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[100] flex" style={{background:'#ffffff'}}>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Top Bar */}
        <div className="flex items-center justify-between px-6 py-3" style={{borderBottom:'1px solid rgba(0,0,0,0.09)',background:'#fff'}}>
          <button onClick={()=>setFolioOpen(false)}
            className="flex items-center gap-2 text-sm font-medium text-black/60 hover:text-black transition-colors">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <path d="M10 12L6 8l4-4"/>
            </svg>
            Back to Guests
          </button>
          <div className="flex items-center gap-2">
            <button onClick={printFolio}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-black/15 rounded-lg text-black/60 hover:bg-black/5 transition-colors">
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M4 6V2h8v4M4 12H3a1.5 1.5 0 01-1.5-1.5v-3A1.5 1.5 0 013 6h10a1.5 1.5 0 011.5 1.5v3A1.5 1.5 0 0113 12h-1M4 10h8v4H4z"/></svg>
              Print
            </button>
            <button onClick={sendFolioEmail} disabled={folioEmailSending}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-black/15 rounded-lg text-black/60 hover:bg-black/5 transition-colors disabled:opacity-40">
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><rect x="1" y="3" width="14" height="10" rx="1.5"/><path d="M1 4l7 5 7-5"/></svg>
              {folioEmailSending ? 'Sending\u2026' : 'Email Folio'}
            </button>
          </div>
        </div>

        {/* Guest Header */}
        <div className="px-8 pt-5 pb-0" style={{background:'#fff',borderBottom:'1px solid rgba(0,0,0,0.07)'}}>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
              style={{background:'linear-gradient(135deg,#1E3932,#00754A)'}}>
              {initials}
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xl font-bold text-[#000000]/87 tracking-tight">{folioRes.full_name}</span>
              <span className={\`px-2.5 py-0.5 rounded-full text-xs font-semibold \${isDueOut?'bg-amber-100 text-amber-700':'bg-green-100 text-green-700'}\`}>
                {isDueOut ? 'Due Out' : 'In-House'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-6 mb-5">
            {[
              {label:\`Room \${folioRes.room_number||'—'}\`, sub: folioRes.room_type_name||folioRes.room_type},
              {label:'Check-In', sub: fmtDate(folioRes.check_in_date)},
              {label:'Check-Out', sub: fmtDate(folioRes.check_out_date)},
              {label:'Adults', sub: String(folioRes.number_of_guests||1)},
              {label:'Nights', sub: String(nights)},
              {label:'Reservation #', sub: \`NHP-\${String(folioRes.id).padStart(10,'0')}\`},
            ].map((item,i,arr)=>(
              <React.Fragment key={item.label}>
                <div>
                  <div className="text-[10px] font-semibold text-black/40 uppercase tracking-wide">{item.label}</div>
                  <div className="text-xs text-black/70 mt-0.5 font-medium">{item.sub}</div>
                </div>
                {i < arr.length-1 && <div className="w-px h-7 bg-black/10 flex-shrink-0"/>}
              </React.Fragment>
            ))}
          </div>

          {/* Tab nav */}
          <div className="flex items-end gap-1">
            {['Profile','Stay Details','Folio','Payments','Documents','Notes'].map(tab=>(
              <button key={tab}
                className={\`px-4 py-2 text-sm border-b-2 transition-colors \${tab==='Folio'?'border-[#00754A] text-[#00754A] font-semibold':'border-transparent text-black/45 hover:text-black/65'}\`}>
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 flex overflow-hidden" style={{background:'#f7f8fa'}}>

          {/* Left: Summary + Quick Actions */}
          <div className="w-56 flex-shrink-0 p-4 space-y-3 overflow-y-auto" style={{borderRight:'1px solid rgba(0,0,0,0.08)'}}>

            <div className="bg-white rounded-xl border border-black/8 p-4">
              <div className="text-[10px] font-bold text-black/40 uppercase tracking-widest mb-3">Folio Summary</div>
              <div className="space-y-2.5">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-black/55">Total Charges</span>
                  <span className="text-sm font-semibold text-[#000000]/87">{fmtA(folioTotals.charges)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-black/55">Total Payments</span>
                  <span className="text-sm font-semibold text-[#000000]/87">{fmtA(folioTotals.payments)}</span>
                </div>
                <div className="pt-2 border-t border-black/8 flex justify-between items-center">
                  <span className="text-sm font-bold text-black/70">Balance</span>
                  <span className={\`text-base font-black \${folioTotals.balance>0?'text-red-600':'text-[#00754A]'}\`}>{fmtA(folioTotals.balance)}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-black/8 p-4">
              <div className="text-[10px] font-bold text-black/40 uppercase tracking-widest mb-2.5">Quick Actions</div>
              <div className="space-y-0.5">
                {[
                  {icon:<svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="6" y1="1" x2="6" y2="11"/><line x1="1" y1="6" x2="11" y2="6"/></svg>, label:'Add Charge', fn:()=>setAddChargeOpen(true)},
                  {icon:<svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="1" y="3" width="10" height="7" rx="1"/><path d="M1 6h10"/></svg>, label:'Add Payment', fn:()=>setAddPayOpen(o=>!o)},
                  {icon:<svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="1" y="2" width="10" height="8" rx="1"/><path d="M1 4l5 3.5L11 4"/></svg>, label:'Email Folio', fn:sendFolioEmail},
                  {icon:<svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 4V2h6v2M3 8H2a1 1 0 01-1-1V5a1 1 0 011-1h8a1 1 0 011 1v2a1 1 0 01-1 1H9M3 7h6v3H3z"/></svg>, label:'Print Folio', fn:printFolio},
                  {icon:<svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 1v7M3 5l3 3 3-3M1 10h10"/></svg>, label:'Download Folio (PDF)', fn:printFolio},
                ].map(a=>(
                  <button key={a.label} onClick={a.fn}
                    className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs font-medium text-black/65 hover:bg-black/[0.04] transition-colors text-left">
                    <span className="text-[#00754A]">{a.icon}</span>
                    {a.label}
                  </button>
                ))}
              </div>
            </div>

            {addPayOpen && (
              <div className="bg-white rounded-xl border border-black/8 p-4">
                <div className="text-[10px] font-bold text-black/40 uppercase tracking-widest mb-2.5">Record Payment</div>
                <div className="space-y-2">
                  <select value={fpMethod} onChange={e=>setFpMethod(e.target.value)}
                    className="w-full text-xs border border-black/15 rounded-lg px-2.5 py-1.5 outline-none bg-white text-black/70">
                    {['Cash','Credit Card','Debit Card','GCash','Maya','Bank Transfer','Check'].map(m=><option key={m}>{m}</option>)}
                  </select>
                  <input type="number" placeholder="Amount (₱)" value={fpAmount} onChange={e=>setFpAmount(e.target.value)}
                    className="w-full text-xs border border-black/15 rounded-lg px-2.5 py-1.5 outline-none font-mono bg-white"/>
                  <button onClick={handleAddPayment} disabled={fpSaving}
                    className="w-full bg-[#00754A] hover:bg-[#006241] text-white text-xs font-bold py-2 rounded-lg transition-colors disabled:opacity-50">
                    {fpSaving?'Saving\u2026':'Post Payment'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right: Transactions table */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3" style={{background:'#fff',borderBottom:'1px solid rgba(0,0,0,0.08)'}}>
              <span className="text-sm font-bold text-[#000000]/87">Folio Transactions</span>
              <div className="flex gap-2">
                <button onClick={()=>setAddChargeOpen(true)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#00754A] hover:bg-[#006241] text-white text-xs font-semibold rounded-lg transition-colors">
                  <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><line x1="6" y1="1" x2="6" y2="11"/><line x1="1" y1="6" x2="11" y2="6"/></svg>
                  Add Charge
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto" style={{scrollbarWidth:'thin'}}>
              {folioLoading ? (
                <div className="flex flex-col items-center justify-center py-24 text-black/35">
                  <div className="w-7 h-7 border-2 border-black/10 border-t-[#00754A] rounded-full animate-spin mb-3"/>
                  <span className="text-xs">Loading folio\u2026</span>
                </div>
              ) : ledgerWithBalance.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-black/35">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="mb-3 opacity-40"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 9h6M9 12h6M9 15h3"/></svg>
                  <div className="text-sm font-semibold">No Transactions</div>
                  <div className="text-xs mt-1 opacity-70">Add a charge to get started</div>
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead className="sticky top-0 z-10" style={{background:'#f9f9f9',borderBottom:'1px solid rgba(0,0,0,0.08)'}}>
                    <tr className="text-[10px] font-bold text-black/45 uppercase tracking-widest">
                      <th className="px-5 py-3 font-bold">Date</th>
                      <th className="px-3 py-3 font-bold">Time</th>
                      <th className="px-3 py-3 font-bold">Description</th>
                      <th className="px-3 py-3 text-center font-bold">Qty</th>
                      <th className="px-3 py-3 text-right font-bold">Debit (\u20b1)</th>
                      <th className="px-3 py-3 text-right font-bold">Credit (\u20b1)</th>
                      <th className="px-3 py-3 text-right font-bold">Balance (\u20b1)</th>
                      <th className="px-5 py-3"/>
                    </tr>
                  </thead>
                  <tbody>
                    {ledgerWithBalance.map((entry)=>{
                      const isCharge = entry.type==='charge';
                      const isVoid = entry.voided;
                      const ts = new Date(entry.timestamp);
                      const isLastActive = !isVoid && Math.abs(entry.currentBalance - folioTotals.balance) < 0.001;
                      return (
                        <tr key={\`\${entry.type}-\${entry.id}\`}
                          className={\`group transition-colors \${isVoid?'opacity-40':''} \${isLastActive&&folioTotals.balance>0?'bg-amber-50/60 hover:bg-amber-50':'hover:bg-black/[0.015]'}\`}
                          style={{borderBottom:'1px solid rgba(0,0,0,0.05)'}}>
                          <td className="px-5 py-3 text-xs text-black/70 font-medium whitespace-nowrap">
                            {ts.toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}
                          </td>
                          <td className="px-3 py-3 text-xs text-black/45 font-mono whitespace-nowrap">
                            {ts.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}
                          </td>
                          <td className="px-3 py-3">
                            <div className="flex items-center gap-2">
                              <div className={\`w-1.5 h-1.5 rounded-full flex-shrink-0 \${isCharge?'bg-blue-400':'bg-emerald-500'}\`}/>
                              <span className="text-xs text-black/70">{entry.description||entry.charge_type||entry.payment_method}</span>
                            </div>
                            {isVoid&&<div className="text-[9px] font-bold text-red-500 uppercase tracking-widest mt-0.5 ml-3.5">Voided</div>}
                          </td>
                          <td className="px-3 py-3 text-center text-xs text-black/45">{entry.quantity||'\u2014'}</td>
                          <td className="px-3 py-3 text-right text-xs font-mono text-black/65">
                            {isCharge ? parseFloat(entry.amount||0).toLocaleString('en-PH',{minimumFractionDigits:2}) : '\u2014'}
                          </td>
                          <td className="px-3 py-3 text-right text-xs font-mono text-black/65">
                            {!isCharge ? parseFloat(entry.amount||0).toLocaleString('en-PH',{minimumFractionDigits:2}) : '\u2014'}
                          </td>
                          <td className={\`px-3 py-3 text-right text-xs font-mono font-bold \${entry.currentBalance>0?'text-black/70':'text-[#00754A]'} \${isLastActive&&folioTotals.balance>0?'text-amber-700':''}\`}>
                            {parseFloat(entry.currentBalance||0).toLocaleString('en-PH',{minimumFractionDigits:2})}
                          </td>
                          <td className="px-5 py-3 text-right">
                            {!isVoid&&(
                              <button onClick={()=>isCharge?voidCharge(entry.id):voidPayment(entry.id)}
                                className="text-[9px] font-bold uppercase tracking-widest text-black/25 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100">
                                Void
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

            {/* Bottom totals bar */}
            <div className="flex items-center gap-8 px-6 py-4" style={{background:'#fff',borderTop:'1px solid rgba(0,0,0,0.08)'}}>
              {[
                {label:'TOTAL CHARGES', value:fmtA(folioTotals.charges), color:'text-[#000000]/80'},
                {label:'TOTAL PAYMENTS', value:fmtA(folioTotals.payments), color:'text-[#000000]/80'},
                {label:'OUTSTANDING BALANCE', value:fmtA(folioTotals.balance), color:folioTotals.balance>0?'text-red-600':'text-[#00754A]'},
              ].map(s=>(
                <div key={s.label} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-black/[0.05] flex items-center justify-center">
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-black/35"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg>
                  </div>
                  <div>
                    <div className="text-[9px] font-bold text-black/35 uppercase tracking-widest">{s.label}</div>
                    <div className={\`text-base font-black \${s.color}\`}>{s.value}</div>
                  </div>
                </div>
              ))}
              {folioEmailMsg && (
                <div className="ml-auto text-xs font-semibold text-[#00754A] bg-green-50 border border-green-200 px-3 py-1.5 rounded-full">{folioEmailMsg}</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add Charge Slide Panel */}
      {addChargeOpen && (
        <div className="w-80 flex-shrink-0 flex flex-col" style={{background:'#fff',borderLeft:'1px solid rgba(0,0,0,0.10)',boxShadow:'-6px 0 24px rgba(0,0,0,0.07)'}}>
          <div className="flex items-center justify-between px-5 py-4" style={{borderBottom:'1px solid rgba(0,0,0,0.08)'}}>
            <span className="font-bold text-[#000000]/87">Add Charge</span>
            <button onClick={()=>setAddChargeOpen(false)} className="text-black/40 hover:text-black text-xl leading-none transition-colors">\u00d7</button>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5" style={{scrollbarWidth:'thin'}}>

            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-5 h-5 rounded-full bg-[#00754A] text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">1</span>
                <span className="text-xs font-bold text-black/65">Select Charge Type</span>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {chargeTypes.map(ct=>(
                  <button key={ct.id} onClick={()=>{setChargeType(ct.id); setChargeDesc(ct.id==='Room Charge'?\`Room Charge - \${folioRes.room_type_name||folioRes.room_type}\`:ct.label);}}
                    className={\`flex flex-col items-center gap-1.5 p-2.5 rounded-xl border text-center transition-all \${chargeType===ct.id?'border-[#00754A] bg-[#00754A]/5 text-[#00754A]':'border-black/10 text-black/45 hover:border-black/20'}\`}>
                    {ct.icon}
                    <span className="text-[9px] font-semibold leading-tight">{ct.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-5 h-5 rounded-full bg-[#00754A] text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">2</span>
                <span className="text-xs font-bold text-black/65">Charge Details</span>
              </div>
              <div className="space-y-2.5">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-semibold text-black/45 mb-1">Date</label>
                    <input type="date" value={chargeDate} onChange={e=>setChargeDate(e.target.value)}
                      className="w-full text-xs border border-black/15 rounded-lg px-2.5 py-1.5 outline-none focus:border-[#00754A] bg-white"/>
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-black/45 mb-1">Time</label>
                    <input type="time" value={chargeTime} onChange={e=>setChargeTime(e.target.value)}
                      className="w-full text-xs border border-black/15 rounded-lg px-2.5 py-1.5 outline-none focus:border-[#00754A] bg-white"/>
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-black/45 mb-1">Description</label>
                  <input type="text" value={chargeDesc} onChange={e=>setChargeDesc(e.target.value)} placeholder={\`e.g. \${chargeType}\`}
                    className="w-full text-xs border border-black/15 rounded-lg px-2.5 py-1.5 outline-none focus:border-[#00754A] bg-white"/>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[10px] font-semibold text-black/45 mb-1">Quantity</label>
                    <input type="number" min="1" value={chargeQty} onChange={e=>setChargeQty(e.target.value)}
                      className="w-full text-xs border border-black/15 rounded-lg px-2.5 py-1.5 outline-none focus:border-[#00754A] bg-white font-mono"/>
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-black/45 mb-1">Rate (\u20b1)</label>
                    <input type="number" min="0" step="0.01" value={chargeRate} onChange={e=>setChargeRate(e.target.value)} placeholder="0.00"
                      className="w-full text-xs border border-black/15 rounded-lg px-2.5 py-1.5 outline-none focus:border-[#00754A] bg-white font-mono"/>
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-black/45 mb-1">Amount (\u20b1)</label>
                    <input type="text" readOnly placeholder="0.00"
                      value={chargeRate&&chargeQty ? (parseFloat(chargeRate||0)*parseFloat(chargeQty||1)).toFixed(2) : ''}
                      className="w-full text-xs border border-black/10 rounded-lg px-2.5 py-1.5 bg-black/[0.025] text-black/45 font-mono cursor-default"/>
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-black/45 mb-1">Reference (Optional)</label>
                  <input type="text" value={chargeRef} onChange={e=>setChargeRef(e.target.value)} placeholder="e.g. Invoice #, Remarks, etc."
                    className="w-full text-xs border border-black/15 rounded-lg px-2.5 py-1.5 outline-none focus:border-[#00754A] bg-white"/>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-semibold text-black/45 mb-1">Department</label>
                    <select value={chargeDept} onChange={e=>setChargeDept(e.target.value)}
                      className="w-full text-xs border border-black/15 rounded-lg px-2.5 py-1.5 outline-none focus:border-[#00754A] bg-white text-black/70">
                      {['Front Office','Housekeeping','Restaurant','Bar','Spa','Maintenance','Accounting'].map(d=><option key={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-black/45 mb-1">Notes (Optional)</label>
                    <input type="text" value={chargeNotes} onChange={e=>setChargeNotes(e.target.value)} placeholder="e.g. Room charge for Jul 4"
                      className="w-full text-xs border border-black/15 rounded-lg px-2.5 py-1.5 outline-none focus:border-[#00754A] bg-white"/>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-5 h-5 rounded-full bg-[#00754A] text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">3</span>
                <span className="text-xs font-bold text-black/65">Apply Charge To</span>
              </div>
              <label className="flex items-center gap-2.5 cursor-pointer p-2 rounded-lg hover:bg-black/[0.02]">
                <span className="w-4 h-4 rounded-full border-2 border-[#00754A] flex items-center justify-center flex-shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00754A]"/>
                </span>
                <span className="text-xs text-black/65">Guest Folio (Outstanding Balance {fmtA(folioTotals.balance)})</span>
              </label>
            </div>
          </div>

          <div className="px-5 py-4 flex gap-2" style={{borderTop:'1px solid rgba(0,0,0,0.08)'}}>
            <button onClick={()=>setAddChargeOpen(false)}
              className="flex-1 py-2 rounded-lg border border-black/15 text-xs font-semibold text-black/60 hover:bg-black/[0.03] transition-colors">
              Cancel
            </button>
            <button onClick={handleAddCharge} disabled={fcSaving||!chargeRate}
              className="flex-1 py-2 rounded-lg bg-[#00754A] hover:bg-[#006241] text-white text-xs font-bold transition-colors disabled:opacity-40">
              {fcSaving?'Saving\u2026':'Add Charge'}
            </button>
          </div>
        </div>
      )}
    </div>
    , document.body);
}
`;

const before = content.slice(0, startIdx);
const result = before + newFolioModal;
fs.writeFileSync(filePath, result, 'utf8');
console.log('SUCCESS: FolioModal replaced. New file length:', result.length, 'bytes');
