const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'src', 'App.jsx');
let code = fs.readFileSync(file, 'utf8');

// 1. Add new state for Add Payment
const stateRegex = /\/\/ Add payment form\s+const \[fpMethod, setFpMethod\] = React\.useState\('Cash'\);\s+const \[fpAmount, setFpAmount\] = React\.useState\(''\);\s+const \[fpRef, setFpRef\] = React\.useState\(''\);\s+const \[fpSaving, setFpSaving\] = React\.useState\(false\);\s+const \[fpError, setFpError\] = React\.useState\(''\);/;

const newState = `  // Add payment form
  const [fpMethod, setFpMethod] = React.useState('Credit Card');
  const [fpAmount, setFpAmount] = React.useState('');
  const [fpRef, setFpRef] = React.useState('');
  const [fpSaving, setFpSaving] = React.useState(false);
  const [fpError, setFpError] = React.useState('');
  const [fpSuccess, setFpSuccess] = React.useState(false);
  const [fpSuccessData, setFpSuccessData] = React.useState(null);
  const [fpApplyTo, setFpApplyTo] = React.useState('outstanding');
  const [fpDate, setFpDate] = React.useState(today);
  const [fpTime, setFpTime] = React.useState(new Date().toTimeString().slice(0,5));
  const [fpCardNumber, setFpCardNumber] = React.useState('');
  const [fpCardholder, setFpCardholder] = React.useState('');
  const [fpExpiry, setFpExpiry] = React.useState('');
  const [fpNotes, setFpNotes] = React.useState('');`;

if (code.match(stateRegex)) {
  code = code.replace(stateRegex, newState);
  console.log('Replaced state');
} else {
  console.log('State regex not found. Trying flexible match...');
  const flexStateRegex = /\/\/ Add payment form[\s\S]*?const \[fpError, setFpError\] = React\.useState\(''\);/;
  if(code.match(flexStateRegex)) {
    code = code.replace(flexStateRegex, newState);
    console.log('Replaced state (flexible)');
  }
}

// 2. Change handleAddPayment logic
const handleRegex = /const handleAddPayment = \(\) => \{\s+addPayment\(fpMethod, fpAmount, fpRef\);\s+setAddPayOpen\(false\);\s+\};/;
const newHandle = `const handleAddPayment = () => {
    addPayment(fpMethod, fpAmount, fpRef);
  };`;
if (code.match(handleRegex)) {
  code = code.replace(handleRegex, newHandle);
  console.log('Replaced handleAddPayment');
}

// 3. Update addPayment to handle success
const addPayRegex = /const addPayment = async \(overrideMethod, overrideAmount, overrideRef\) => \{([\s\S]*?)if \(data\.success\) \{\s*fetchFolio\(folioRes\.id\);\s*setFpAmount\(''\);\s*setFpRef\(''\);\s*\}([\s\S]*?)catch \(e\)/;
const newAddPay = `const addPayment = async (overrideMethod, overrideAmount, overrideRef) => {$1if (data.success) {
        fetchFolio(folioRes.id); 
        setFpSuccessData({ amount: amount, newBalance: Math.max(0, folioTotals.balance - parseFloat(amount)) });
        setFpSuccess(true);
        setFpAmount(''); setFpRef(''); setFpNotes(''); setFpCardNumber(''); setFpCardholder(''); setFpExpiry('');
      }$2catch (e)`;

if (code.match(addPayRegex)) {
  code = code.replace(addPayRegex, newAddPay);
  console.log('Replaced addPayment');
}

// 4. Modify quick action for Add Payment to pass true instead of toggle
code = code.replace(/fn:\(\)=>setAddPayOpen\(o=>!o\)/g, 'fn:()=>setAddPayOpen(true)');

// 5. Remove inline addPayOpen box
const inlineAddPayRegex = /\{addPayOpen && \([\s\S]*?Record Payment[\s\S]*?<\/div>\s*\)\}/;
if (code.match(inlineAddPayRegex)) {
  code = code.replace(inlineAddPayRegex, '');
  console.log('Removed inline addPayOpen');
} else {
  console.log('Inline addPayOpen not found');
}

// 6. Append Slide Panel for Add Payment after Add Charge Slide Panel
const addChargePanelRegex = /\{\/\* Add Charge Slide Panel \*\/\}[\s\S]*?\{addChargeOpen && \([\s\S]*?<\/div>\s*\)\}/;

const newSlidePanel = `
      {/* Add Payment Slide Panel */}
      {addPayOpen && (
        <div className="w-96 flex-shrink-0 flex flex-col" style={{background:'#fff',borderLeft:'1px solid rgba(0,0,0,0.10)',boxShadow:'-6px 0 24px rgba(0,0,0,0.07)'}}>
          <div className="flex items-center justify-between px-5 py-4" style={{borderBottom:'1px solid rgba(0,0,0,0.08)'}}>
            <span className="font-bold text-black text-lg">Add Payment</span>
            <button onClick={()=>{setAddPayOpen(false); setFpSuccess(false);}} className="text-black hover:text-black text-xl leading-none transition-colors">×</button>
          </div>

          {fpSuccess ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center" style={{scrollbarWidth:'thin'}}>
              <div className="w-16 h-16 bg-[#00754A] rounded-full flex items-center justify-center mb-6">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
              </div>
              <h3 className="text-xl font-bold text-black mb-2">Payment Added Successfully!</h3>
              <p className="text-sm text-black/70 mb-8">A payment of ₱{parseFloat(fpSuccessData?.amount || 0).toLocaleString('en-PH',{minimumFractionDigits:2})} has been added.</p>
              
              <div className="mb-8">
                <div className="text-sm font-bold text-black/60 mb-1">New Balance</div>
                <div className="text-3xl font-black text-[#00754A]">₱{parseFloat(fpSuccessData?.newBalance || 0).toLocaleString('en-PH',{minimumFractionDigits:2})}</div>
              </div>

              <div className="flex gap-3 w-full">
                <button onClick={()=>{setAddPayOpen(false); setFpSuccess(false);}}
                  className="flex-1 py-3 rounded-xl bg-[#00754A] hover:bg-[#006241] text-white text-sm font-bold transition-colors">
                  View Folio
                </button>
                <button onClick={()=>{setAddPayOpen(false); setFpSuccess(false);}}
                  className="flex-1 py-3 rounded-xl border border-black/15 text-sm font-bold text-black hover:bg-black/[0.03] transition-colors">
                  Close
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5" style={{scrollbarWidth:'thin'}}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-black">Outstanding Balance</span>
                  <span className="text-lg font-black text-[#00754A]">{fmtA(folioTotals.balance)}</span>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-black mb-1">Payment Date</label>
                  <div className="flex gap-2">
                    <input type="date" value={fpDate} onChange={e=>setFpDate(e.target.value)} className="flex-1 text-xs border border-black/15 rounded-lg px-2.5 py-2 outline-none focus:border-[#00754A] bg-white text-black"/>
                    <input type="time" value={fpTime} onChange={e=>setFpTime(e.target.value)} className="w-24 text-xs border border-black/15 rounded-lg px-2.5 py-2 outline-none focus:border-[#00754A] bg-white text-black"/>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-black mb-1">Payment Method</label>
                  <div className="relative">
                    <select value={fpMethod} onChange={e=>setFpMethod(e.target.value)}
                      className="w-full text-xs border border-black/15 rounded-lg px-2.5 py-2 outline-none focus:border-[#00754A] bg-white text-black appearance-none">
                      {['Cash','Credit Card','Debit Card','GCash','Maya','Bank Transfer','Check'].map(m=><option key={m}>{m}</option>)}
                    </select>
                    <div className="absolute inset-y-0 right-2.5 flex items-center pointer-events-none">
                      <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 5l3 3 3-3"/></svg>
                    </div>
                  </div>
                </div>

                {(fpMethod === 'Credit Card' || fpMethod === 'Debit Card') && (
                  <div>
                    <span className="text-[10px] font-bold text-black mb-2 block">Card Details</span>
                    <div className="space-y-2">
                      <div className="relative">
                        <input type="text" value={fpCardNumber} onChange={e=>setFpCardNumber(e.target.value)} placeholder="Card Number (**** **** **** 1234)" className="w-full text-xs border border-black/15 rounded-lg pl-12 pr-2.5 py-2 outline-none focus:border-[#00754A] bg-white text-black"/>
                        <span className="absolute left-2 top-2 text-[8px] font-bold text-blue-700 bg-blue-100 px-1 py-0.5 rounded">VISA</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <input type="text" value={fpCardholder} onChange={e=>setFpCardholder(e.target.value)} placeholder="Cardholder Name" className="w-full text-xs border border-black/15 rounded-lg px-2.5 py-2 outline-none focus:border-[#00754A] bg-white text-black"/>
                        <input type="text" value={fpExpiry} onChange={e=>setFpExpiry(e.target.value)} placeholder="Expiry Date (MM/YY)" className="w-full text-xs border border-black/15 rounded-lg px-2.5 py-2 outline-none focus:border-[#00754A] bg-white text-black"/>
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-black mb-1">Reference / Approval No. (Optional)</label>
                    <input type="text" value={fpRef} onChange={e=>setFpRef(e.target.value)} placeholder="e.g. 123456" className="w-full text-xs border border-black/15 rounded-lg px-2.5 py-2 outline-none focus:border-[#00754A] bg-white text-black"/>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-black mb-1">Amount (₱)</label>
                    <input type="number" placeholder="0.00" value={fpAmount} onChange={e=>setFpAmount(e.target.value)} className="w-full text-xs border border-black/15 rounded-lg px-2.5 py-2 outline-none focus:border-[#00754A] bg-white font-mono text-black"/>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-black mb-1">Notes (Optional)</label>
                  <textarea value={fpNotes} onChange={e=>setFpNotes(e.target.value)} placeholder="e.g. Payment for outstanding balance." rows="2" className="w-full text-xs border border-black/15 rounded-lg px-2.5 py-2 outline-none focus:border-[#00754A] bg-white resize-none text-black"></textarea>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-black mb-2">Apply Payment To</label>
                  <div className="space-y-2 bg-black/[0.02] p-2 rounded-xl">
                    <label className="flex items-center gap-2 cursor-pointer p-1" onClick={()=>{setFpApplyTo('outstanding'); setFpAmount(folioTotals.balance.toString());}}>
                      <span className={\`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center transition-colors \${fpApplyTo==='outstanding'?'border-[#00754A]':'border-black/30'}\`}>
                        {fpApplyTo==='outstanding' && <span className="w-1.5 h-1.5 rounded-full bg-[#00754A]"/>}
                      </span>
                      <span className="text-xs text-black font-medium">Outstanding Balance ({fmtA(folioTotals.balance)})</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer p-1" onClick={()=>setFpApplyTo('other')}>
                      <span className={\`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center transition-colors \${fpApplyTo==='other'?'border-[#00754A]':'border-black/30'}\`}>
                        {fpApplyTo==='other' && <span className="w-1.5 h-1.5 rounded-full bg-[#00754A]"/>}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-black font-medium">Other Amount</span>
                        {fpApplyTo==='other' && (
                           <input type="number" placeholder="0.00" value={fpAmount} onChange={e=>setFpAmount(e.target.value)} className="w-20 text-xs border border-black/15 rounded px-2 py-1 outline-none focus:border-[#00754A] bg-white font-mono text-black"/>
                        )}
                      </div>
                    </label>
                  </div>
                </div>
                {fpError && <div className="text-xs font-bold text-red-500 bg-red-50 p-2 rounded">{fpError}</div>}
              </div>

              <div className="px-5 py-4 flex gap-2" style={{borderTop:'1px solid rgba(0,0,0,0.08)'}}>
                <button onClick={()=>{setAddPayOpen(false); setFpError('');}}
                  className="flex-1 py-2.5 rounded-lg border border-black/15 text-xs font-bold text-black hover:bg-black/[0.03] transition-colors">
                  Cancel
                </button>
                <button onClick={handleAddPayment} disabled={fpSaving || !fpAmount}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-[#00754A] hover:bg-[#006241] text-white text-xs font-bold transition-colors disabled:opacity-40">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                  {fpSaving?'Saving…':'Add Payment'}
                </button>
              </div>
            </>
          )}
        </div>
      )}
`;

if (code.match(addChargePanelRegex)) {
  const matchStr = code.match(addChargePanelRegex)[0];
  code = code.replace(addChargePanelRegex, matchStr + newSlidePanel);
  console.log('Appended Add Payment Slide Panel');
}

fs.writeFileSync(file, code);
console.log('Done.');
