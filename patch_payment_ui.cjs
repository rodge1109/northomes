const fs = require('fs');
const file = 'c:\\website\\northomes-system\\src\\App.jsx';
let content = fs.readFileSync(file, 'utf8');

let wasCRLF = content.includes('\r\n');
if (wasCRLF) {
  content = content.replace(/\r\n/g, '\n');
}

// 1. Refactor parent addPayment definitions (line 1935 and line 10401)
const addPaymentRegex = /const addPayment = async \(overrideMethod, overrideAmount, overrideRef\) => \{\n\s*const method = overrideMethod \|\| fpMethod;\n\s*const amount = overrideAmount \|\| fpAmount;\n\s*const ref = overrideRef \|\| fpRef;\n\s*if \(!amount \|\| isNaN\(parseFloat\(amount\)\)\) \{ setFpError\('Enter a valid amount'\); return; \}\n\s*setFpSaving\(true\); setFpError\(''\);\n\s*try \{\n\s*const res = await fetch\(`\${API_BASE_URL}\/api\/folio\/\${folioRes\.id}\/payment`,\s*\{\n\s*method: 'POST',\n\s*headers: \{ 'Content-Type': 'application\/json' \},\n\s*body: JSON\.stringify\(\{ payment_method: method, amount: amount, reference: ref \}\),\n\s*\}\);\n\s*const data = await res\.json\(\);\n\s*if \(data\.success\) \{ fetchFolio\(folioRes\.id\); setFpAmount\(''\); setFpRef\(''\); \}\n\s*else setFpError\(data\.message \|\| 'Failed'\);\n\s*\} catch \(e\) \{ setFpError\('Server error'\); \}\n\s*setFpSaving\(false\);\n\s*\}/g;

const addPaymentReplacement = `const addPayment = async (overrideMethod, overrideAmount, overrideRef, overrideDate, overrideTime, overrideNotes) => {
    const method = overrideMethod || fpMethod;
    const amount = overrideAmount || fpAmount;
    const ref = overrideRef || fpRef;
    if (!amount || isNaN(parseFloat(amount))) { setFpError('Enter a valid amount'); return; }
    setFpSaving(true); setFpError('');
    try {
      const res = await fetch(\`\${API_BASE_URL}/api/folio/\${folioRes.id}/payment\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          payment_method: method, 
          amount: amount, 
          reference: ref,
          date: overrideDate,
          time: overrideTime,
          notes: overrideNotes
        }),
      });
      const data = await res.json();
      if (data.success) { fetchFolio(folioRes.id); setFpAmount(''); setFpRef(''); }
      else setFpError(data.message || 'Failed');
    } catch (e) { setFpError('Server error'); }
    setFpSaving(false);
  }`;

content = content.replace(addPaymentRegex, addPaymentReplacement);
console.log('addPayment definition replaced.');

// 2. Refactor state variables inside FolioModal (around line 13802)
const folioModalStatesTarget = `  const [addChargeOpen, setAddChargeOpen] = React.useState(false);
  const [chargeType, setChargeType] = React.useState('Room Charge');
  const [chargeDate, setChargeDate] = React.useState(new Date().toISOString().slice(0,10));
  const [chargeTime, setChargeTime] = React.useState(new Date().toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit',hour12:false}));
  const [chargeDesc, setChargeDesc] = React.useState('');
  const [chargeQty, setChargeQty] = React.useState(1);
  const [chargeRate, setChargeRate] = React.useState('');
  const [chargeRef, setChargeRef] = React.useState('');
  const [chargeDept, setChargeDept] = React.useState('Front Office');
  const [chargeNotes, setChargeNotes] = React.useState('');
  const [addPayOpen, setAddPayOpen] = React.useState(false);`;

const folioModalStatesReplacement = `  const [addChargeOpen, setAddChargeOpen] = React.useState(false);
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
  const [payMethod, setPayMethod] = React.useState('Cash');
  const [payDate, setPayDate] = React.useState(new Date().toISOString().slice(0,10));
  const [payTime, setPayTime] = React.useState(new Date().toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit',hour12:false}));
  const [payAmount, setPayAmount] = React.useState('');
  const [payRef, setPayRef] = React.useState('');
  const [payNotes, setPayNotes] = React.useState('');

  React.useEffect(() => {
    if (addPayOpen) {
      const balance = folioTotals && folioTotals.balance ? Math.max(0, parseFloat(folioTotals.balance)) : 0;
      setPayAmount(balance > 0 ? balance.toFixed(2) : '');
      setPayDate(new Date().toISOString().slice(0, 10));
      setPayTime(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }));
      setPayRef('');
      setPayNotes('');
    }
  }, [addPayOpen, folioTotals]);`;

if (content.includes(folioModalStatesTarget)) {
  content = content.replace(folioModalStatesTarget, folioModalStatesReplacement);
  console.log('FolioModal state variables updated.');
} else {
  console.log('FolioModal state variables NOT found.');
}

// 3. Update handleAddPayment inside FolioModal (around line 13851)
const handleAddPaymentTarget = `  const handleAddPayment = () => {
    addPayment(fpMethod, fpAmount, fpRef);
    setAddPayOpen(false);
  };`;

const handleAddPaymentReplacement = `  const handleAddPayment = () => {
    addPayment(payMethod, payAmount, payRef, payDate, payTime, payNotes);
    setAddPayOpen(false);
  };`;

if (content.includes(handleAddPaymentTarget)) {
  content = content.replace(handleAddPaymentTarget, handleAddPaymentReplacement);
  console.log('handleAddPayment updated.');
} else {
  console.log('handleAddPayment NOT found.');
}

// 4. Update Quick Actions buttons fn inside FolioModal (around line 13957)
const quickActionsTarget = `                  {icon:<svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="6" y1="1" x2="6" y2="11"/><line x1="1" y1="6" x2="11" y2="6"/></svg>, label:'Add Charge', fn:()=>setAddChargeOpen(true)},
                  {icon:<svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="1" y="3" width="10" height="7" rx="1"/><path d="M1 6h10"/></svg>, label:'Add Payment', fn:()=>setAddPayOpen(o=>!o)},`;

const quickActionsReplacement = `                  {icon:<svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="6" y1="1" x2="6" y2="11"/><line x1="1" y1="6" x2="11" y2="6"/></svg>, label:'Add Charge', fn:()=>{setAddChargeOpen(true); setAddPayOpen(false);}},
                  {icon:<svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="1" y="3" width="10" height="7" rx="1"/><path d="M1 6h10"/></svg>, label:'Add Payment', fn:()=>{setAddPayOpen(true); setAddChargeOpen(false);}},`;

if (content.includes(quickActionsTarget)) {
  content = content.replace(quickActionsTarget, quickActionsReplacement);
  console.log('Quick Actions buttons updated.');
} else {
  console.log('Quick Actions buttons NOT found.');
}

// 5. Remove the old left-sidebar Record Payment card
const oldLeftCardTarget = `            {addPayOpen && (
              <div className="bg-white rounded-xl border border-black/8 p-4">
                <div className="text-[10px] font-bold text-black uppercase tracking-widest mb-2.5">Record Payment</div>
                <div className="space-y-2">
                  <select value={fpMethod} onChange={e=>setFpMethod(e.target.value)}
                    className="w-full text-xs border border-black/15 rounded-lg px-2.5 py-1.5 outline-none bg-white text-black">
                    {['Cash','Credit Card','Debit Card','GCash','Maya','Bank Transfer','Check'].map(m=><option key={m}>{m}</option>)}
                  </select>
                  <input type="number" placeholder="Amount (₱)" value={fpAmount} onChange={e=>setFpAmount(e.target.value)}
                    className="w-full text-xs border border-black/15 rounded-lg px-2.5 py-1.5 outline-none font-mono bg-white"/>
                  <button onClick={handleAddPayment} disabled={fpSaving}
                    className="w-full bg-[#00754A] hover:bg-[#006241] text-white text-xs font-bold py-2 rounded-lg transition-colors disabled:opacity-50">
                    {fpSaving?'Saving…':'Post Payment'}
                  </button>
                </div>
              </div>
            )}`;

if (content.includes(oldLeftCardTarget)) {
  content = content.replace(oldLeftCardTarget, '');
  console.log('Old left-sidebar payment card removed.');
} else {
  console.log('Old left-sidebar payment card NOT found.');
}

// 6. Append the new slide-out payment panel to the bottom right of the modal
const slidePanelTarget = `          <div className="px-5 py-4 flex gap-2" style={{borderTop:'1px solid rgba(0,0,0,0.08)'}}>
            <button onClick={()=>setAddChargeOpen(false)}
              className="flex-1 py-2 rounded-lg border border-black/15 text-xs font-semibold text-black hover:bg-black/[0.03] transition-colors">
              Cancel
            </button>
            <button onClick={handleAddCharge} disabled={fcSaving||!chargeRate}
              className="flex-1 py-2 rounded-lg bg-[#00754A] hover:bg-[#006241] text-white text-xs font-bold transition-colors disabled:opacity-40">
              {fcSaving?'Saving…':'Add Charge'}
            </button>
          </div>
        </div>
      )}`;

const payMethodsArray = `  const payMethods = [
    { id: 'Cash', label: 'Cash', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="5" width="20" height="14" rx="2"/><circle cx="12" cy="12" r="3"/><path d="M6 12h.01M18 12h.01"/></svg> },
    { id: 'Credit Card', label: 'Credit Card', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/><path d="M6 15h2M10 15h4"/></svg> },
    { id: 'Debit Card', label: 'Debit Card', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/><circle cx="17" cy="14" r="1.5"/></svg> },
    { id: 'GCash', label: 'GCash', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="5" y="2" width="14" height="20" rx="2"/><circle cx="12" cy="10" r="3"/><path d="M12 13v5"/></svg> },
    { id: 'Maya', label: 'PayMaya', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="5" y="2" width="14" height="20" rx="2"/><path d="M9 8h6M9 12h6M9 16h6"/></svg> },
    { id: 'Bank Transfer', label: 'Bank Transfer', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 22h18M6 18v-7M10 18v-7M14 18v-7M18 18v-7M2 11l10-9 10 9"/></svg> },
    { id: 'Check', label: 'Check / Other', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 11l2 2 4-4"/></svg> },
  ];`;

const slidePanelReplacement = `          <div className="px-5 py-4 flex gap-2" style={{borderTop:'1px solid rgba(0,0,0,0.08)'}}>
            <button onClick={()=>setAddChargeOpen(false)}
              className="flex-1 py-2 rounded-lg border border-black/15 text-xs font-semibold text-black hover:bg-black/[0.03] transition-colors">
              Cancel
            </button>
            <button onClick={handleAddCharge} disabled={fcSaving||!chargeRate}
              className="flex-1 py-2 rounded-lg bg-[#00754A] hover:bg-[#006241] text-white text-xs font-bold transition-colors disabled:opacity-40">
              {fcSaving?'Saving…':'Add Charge'}
            </button>
          </div>
        </div>
      )}

      {/* Record Payment Slide Panel */}
      {addPayOpen && (() => {
        ${payMethodsArray}
        return (
          <div className="w-80 flex-shrink-0 flex flex-col" style={{background:'#fff',borderLeft:'1px solid rgba(0,0,0,0.10)',boxShadow:'-6px 0 24px rgba(0,0,0,0.07)'}}>
            <div className="flex items-center justify-between px-5 py-4" style={{borderBottom:'1px solid rgba(0,0,0,0.08)'}}>
              <span className="font-bold text-black">Record Payment</span>
              <button onClick={()=>setAddPayOpen(false)} className="text-black hover:text-black text-xl leading-none transition-colors">×</button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5" style={{scrollbarWidth:'thin'}}>

              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-5 h-5 rounded-full bg-[#00754A] text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">1</span>
                  <span className="text-xs font-bold text-black">Select Payment Method</span>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  {payMethods.map(pm=>(
                    <button key={pm.id} onClick={()=>setPayMethod(pm.id)}
                      className={\`flex flex-col items-center gap-1.5 p-2.5 rounded-xl border text-center transition-all \${payMethod===pm.id?'border-[#00754A] bg-[#00754A]/5 text-[#00754A]':'border-black/10 text-black hover:border-black/20'}\`}>
                      {pm.icon}
                      <span className="text-[9px] font-semibold leading-tight">{pm.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-5 h-5 rounded-full bg-[#00754A] text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">2</span>
                  <span className="text-xs font-bold text-black">Payment Details</span>
                </div>
                <div className="space-y-2.5">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-semibold text-black mb-1">Date</label>
                      <input type="date" value={payDate} onChange={e=>setPayDate(e.target.value)}
                        className="w-full text-xs border border-black/15 rounded-lg px-2.5 py-1.5 outline-none focus:border-[#00754A] bg-white"/>
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-black mb-1">Time</label>
                      <input type="time" value={payTime} onChange={e=>setPayTime(e.target.value)}
                        className="w-full text-xs border border-black/15 rounded-lg px-2.5 py-1.5 outline-none focus:border-[#00754A] bg-white"/>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-black mb-1">Amount (₱)</label>
                    <input type="number" min="0" step="0.01" value={payAmount} onChange={e=>setPayAmount(e.target.value)} placeholder="0.00"
                      className="w-full text-xs border border-black/15 rounded-lg px-2.5 py-1.5 outline-none focus:border-[#00754A] bg-white font-mono"/>
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-black mb-1">Reference No. (Optional)</label>
                    <input type="text" value={payRef} onChange={e=>setPayRef(e.target.value)} placeholder="e.g. Receipt #, Trans ID, etc."
                      className="w-full text-xs border border-black/15 rounded-lg px-2.5 py-1.5 outline-none focus:border-[#00754A] bg-white"/>
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-black mb-1">Notes (Optional)</label>
                    <input type="text" value={payNotes} onChange={e=>setPayNotes(e.target.value)} placeholder="e.g. GCash payment by guest"
                      className="w-full text-xs border border-black/15 rounded-lg px-2.5 py-1.5 outline-none focus:border-[#00754A] bg-white"/>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-5 h-5 rounded-full bg-[#00754A] text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">3</span>
                  <span className="text-xs font-bold text-black">Apply Payment To</span>
                </div>
                <label className="flex items-center gap-2.5 cursor-pointer p-2 rounded-lg hover:bg-black/[0.02]">
                  <span className="w-4 h-4 rounded-full border-2 border-[#00754A] flex items-center justify-center flex-shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00754A]"/>
                  </span>
                  <span className="text-xs text-black">Guest Folio (Outstanding Balance {fmtA(folioTotals.balance)})</span>
                </label>
              </div>
            </div>

            <div className="px-5 py-4 flex gap-2" style={{borderTop:'1px solid rgba(0,0,0,0.08)'}}>
              <button onClick={()=>setAddPayOpen(false)}
                className="flex-1 py-2 rounded-lg border border-black/15 text-xs font-semibold text-black hover:bg-black/[0.03] transition-colors">
                Cancel
              </button>
              <button onClick={handleAddPayment} disabled={fpSaving||!payAmount}
                className="flex-1 py-2 rounded-lg bg-[#00754A] hover:bg-[#006241] text-white text-xs font-bold transition-colors disabled:opacity-40">
                {fpSaving?'Saving…':'Post Payment'}
              </button>
            </div>
          </div>
        );
      })()}`;

if (content.includes(slidePanelTarget)) {
  content = content.replace(slidePanelTarget, slidePanelReplacement);
  console.log('Record Payment Slide Panel appended.');
} else {
  console.log('Record Payment Slide Panel target NOT found.');
}

if (wasCRLF) {
  content = content.replace(/\n/g, '\r\n');
}

fs.writeFileSync(file, content, 'utf8');
console.log('App.jsx completed.');
