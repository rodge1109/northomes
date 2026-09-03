const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');

let changed = false;

// 1. Add import
if (!code.includes('SignatureCanvas')) {
  code = code.replace(
    /import React, \{([^\}]+)\} from 'react';/,
    `import React, { $1, useRef } from 'react';\nimport SignatureCanvas from 'react-signature-canvas';`
  );
  changed = true;
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
  changed = true;
}

// 3. Update printGuestDataSheet to render signature image
if (!code.includes('alt="Signature"')) {
  code = code.replace(
    /<div class="sig-col">\s*<div class="sig-line"><\/div>\s*<div style="font-size:9px;">Guest Signature<\/div>/,
    `<div class="sig-col">
          \${res.guest_signature 
            ? \`<img src="\${res.guest_signature}" style="max-height: 40px; display: block; margin: 0 auto; margin-bottom: 4px;" alt="Signature" />\`
            : \`<div class="sig-line"></div>\`}
          <div style="font-size:9px;">Guest Signature</div>`
  );
  changed = true;
}

// 4. Pass captureSignature down
if (!code.includes('captureSignature={captureSignature}')) {
  code = code.replace(
    /printGuestDataSheet=\{printGuestDataSheet\} \/>}/,
    'printGuestDataSheet={printGuestDataSheet} captureSignature={captureSignature} />}'
  );
  code = code.replace(
    /printGuestDataSheet=\{printGuestDataSheet\} pendingCheckInRes/,
    'printGuestDataSheet={printGuestDataSheet} captureSignature={captureSignature} pendingCheckInRes'
  );
  changed = true;
}

// 5. Add SignatureModal JSX at the end of RestaurantApp
if (!code.includes('Capture Signature')) {
  code = code.replace(
    /<\/div>\s*<\/div>\s*\);\s*}\s*function FrontDeskTab/,
    `  </div>
      
      {signatureModal.open && (
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
    </div>
  );
}

function FrontDeskTab`
  );
  changed = true;
}

if (changed) {
  fs.writeFileSync('src/App.jsx', code);
  console.log('App.jsx updated successfully.');
} else {
  console.log('No changes were made.');
}
