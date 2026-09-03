const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');

// 1. Add import
if (!code.includes('SignatureCanvas')) {
  code = code.replace(
    /import React, \{([^\}]+)\} from 'react';/,
    `import React, { $1, useRef } from 'react';\nimport SignatureCanvas from 'react-signature-canvas';`
  );
}

// 2. Add signature state and modal logic
if (!code.includes('signatureModal')) {
  code = code.replace(
    /const \[authPulse, setAuthPulse\] = useState\(0\);/,
    `const [authPulse, setAuthPulse] = useState(0);

  const [signatureModal, setSignatureModal] = useState({ open: false, res: null });
  const sigCanvas = useRef(null);

  const captureSignature = (res) => {
    setSignatureModal({ open: true, res });
  };

  const handleSaveSignature = () => {
    if (!sigCanvas.current || sigCanvas.current.isEmpty()) {
      alert('Please provide a signature first.');
      return;
    }
    const signatureDataUrl = sigCanvas.current.getTrimmedCanvas().toDataURL('image/png');
    fetch(\`\${API_BASE_URL}/api/reservations/\${signatureModal.res.id}/signature\`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ signature: signatureDataUrl })
    })
    .then(r => r.json())
    .then(data => {
      if (data.success) {
        setSignatureModal({ open: false, res: null });
        fetchReservations();
      } else {
        alert(data.message || 'Failed to save signature');
      }
    })
    .catch(err => {
      console.error(err);
      alert('Error saving signature');
    });
  };`
  );
}

// 3. Update printGuestDataSheet to render signature image
if (!code.includes('alt="Signature"')) {
  code = code.replace(
    /<div class="sig-col">\s*<div class="sig-line"><\/div>\s*<div style="font-size:9px;">Guest Signature<\/div>/,
    `<div class="sig-col">
          \${originalRes.guest_signature 
            ? \`<img src="\${originalRes.guest_signature}" style="max-height: 40px; display: block; margin: 0 auto; margin-bottom: 4px;" alt="Signature" />\`
            : \`<div class="sig-line"></div>\`}
          <div style="font-size:9px;">Guest Signature</div>`
  );
}

// 4. Add SignatureModal JSX to RestaurantApp right before </CartContext.Provider>
if (!code.includes('Capture Signature</h3>')) {
  code = code.replace(
    /    <\/CartContext\.Provider>\r?\n  \);\r?\n}/,
    `      {signatureModal.open && (
        <div className="fixed inset-0 z-[200] bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-4">
            <h3 className="text-[14px] font-bold mb-2">Capture Signature</h3>
            <p className="text-xs text-black/60 mb-4">Guest: {signatureModal.res?.full_name}</p>
            <div className="border border-black/10 rounded-md bg-gray-50 mb-4" style={{ height: '200px' }}>
              <SignatureCanvas ref={sigCanvas} penColor="black"
                canvasProps={{width: 500, height: 200, className: 'sigCanvas w-full h-full'}} />
            </div>
            <div className="flex gap-2">
              <button onClick={() => setSignatureModal({ open: false, res: null })}
                className="flex-1 py-2 rounded-md border border-black/15 text-xs font-semibold text-black hover:bg-black/[0.03] transition-colors">
                Cancel
              </button>
              <button onClick={() => sigCanvas.current && sigCanvas.current.clear()}
                className="flex-1 py-2 rounded-md border border-black/15 text-xs font-semibold text-black hover:bg-black/[0.03] transition-colors">
                Clear
              </button>
              <button onClick={handleSaveSignature}
                className="flex-1 py-2 rounded-md bg-[#00754A] hover:bg-[#006241] text-white text-xs font-bold transition-colors">
                Save Signature
              </button>
            </div>
          </div>
        </div>
      )}
    </CartContext.Provider>
  );
}`
  );
}

// 5. Pass captureSignature down to AdminDashboard
if (!code.includes('captureSignature={captureSignature} />}')) {
  code = code.replace(
    /<AdminDashboard setCurrentPage=\{setCurrentPage\} activeTab=\{adminTab\} setActiveTab=\{setAdminTab\} \/>}/,
    '<AdminDashboard setCurrentPage={setCurrentPage} activeTab={adminTab} setActiveTab={setAdminTab} captureSignature={captureSignature} />}'
  );
}
// Update AdminDashboard definition
if (!code.includes('function AdminDashboard({ setCurrentPage, activeTab, setActiveTab, captureSignature })')) {
  code = code.replace(
    /function AdminDashboard\(\{ setCurrentPage, activeTab, setActiveTab \}\)/,
    'function AdminDashboard({ setCurrentPage, activeTab, setActiveTab, captureSignature })'
  );
}

// 6. Pass captureSignature to FrontDeskTab
if (!code.includes('captureSignature={captureSignature} pendingCheckInRes')) {
  code = code.replace(
    /printGuestDataSheet=\{printGuestDataSheet\} pendingCheckInRes/,
    'printGuestDataSheet={printGuestDataSheet} captureSignature={captureSignature} pendingCheckInRes'
  );
}

// 7. Update FrontDeskTab definition
if (!code.includes('captureSignature, pendingCheckInRes')) {
  code = code.replace(
    /function FrontDeskTab\(\{ reservations = \[\], printGuestDataSheet, pendingCheckInRes/,
    'function FrontDeskTab({ reservations = [], printGuestDataSheet, captureSignature, pendingCheckInRes'
  );
}

// 8. Inject button into FrontDeskTab
if (!code.includes('Capture Signature</button>')) {
  code = code.replace(
    /Guest Folio\s*<\/button>\s*\)\}/,
    `Guest Folio
                                            </button>
                                          )}
                                          {printGuestDataSheet && (
                                            <button
                                              onClick={() => { printGuestDataSheet(res); setOpenInHouseDropdown(null); }}
                                              className="w-full px-4 py-2 text-left text-[12px] font-medium text-black/70 hover:bg-gray-50 flex items-center gap-2"
                                            >
                                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2M6 14h12v6H6z" /></svg>
                                              Print Data Sheet
                                            </button>
                                          )}
                                          {captureSignature && (
                                            <button
                                              onClick={() => { captureSignature(res); setOpenInHouseDropdown(null); }}
                                              className="w-full px-4 py-2 text-left text-[12px] font-medium text-black/70 hover:bg-gray-50 flex items-center gap-2"
                                            >
                                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                                              Capture Signature
                                            </button>
                                          )}`
  );
}

fs.writeFileSync('src/App.jsx', code);
console.log('App.jsx patched successfully.');
