const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'App.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// -------------------------------------------------------
// Step 1: Add showPolicyModal state inside HomePage
// After: const [heroImages, setHeroImages] = useState(["/assets/images/hero/hero1.jpg"]);
// -------------------------------------------------------
const stateMarker = 'const [heroImages, setHeroImages] = useState(["/assets/images/hero/hero1.jpg"]);';
const stateAddition = `const [showPolicyModal, setShowPolicyModal] = useState(false);`;

if (content.includes(stateMarker)) {
  const insertAfter = stateMarker + '\r\n';
  if (content.includes(insertAfter)) {
    // Check if already added
    if (content.includes(stateAddition)) {
      console.log('State already present, skipping step 1.');
    } else {
      content = content.replace(insertAfter, insertAfter + '  ' + stateAddition + '\r\n');
      console.log('Step 1: Added showPolicyModal state (CRLF).');
    }
  } else {
    const insertAfterLF = stateMarker + '\n';
    if (content.includes(insertAfterLF)) {
      content = content.replace(insertAfterLF, insertAfterLF + '  ' + stateAddition + '\n');
      console.log('Step 1: Added showPolicyModal state (LF).');
    } else {
      console.log('Step 1 WARNING: Could not insert state, marker found but no newline match.');
    }
  }
} else {
  console.error('Step 1 ERROR: heroImages state marker not found');
}

// -------------------------------------------------------
// Step 2: Add <PaymentPolicyModal /> before the closing of HomePage
// Before: "    </div>\r\n  );\r\n}\r\n\r\n// Menu Page"
// -------------------------------------------------------
const closingMarkerCRLF = '    </div>\r\n  );\r\n}\r\n\r\n// Menu Page';
const closingMarkerLF   = '    </div>\n  );\n}\n\n// Menu Page';

const modalJSX = `      <PaymentPolicyModal isOpen={showPolicyModal} onClose={() => setShowPolicyModal(false)} policyText={hotelSettings.cancellation_policy} />\r\n`;
const modalJSXLF = `      <PaymentPolicyModal isOpen={showPolicyModal} onClose={() => setShowPolicyModal(false)} policyText={hotelSettings.cancellation_policy} />\n`;

if (content.includes(closingMarkerCRLF)) {
  if (content.includes(modalJSX)) {
    console.log('Step 2: Modal already present, skipping.');
  } else {
    content = content.replace(closingMarkerCRLF, modalJSX + closingMarkerCRLF);
    console.log('Step 2: Added PaymentPolicyModal render (CRLF).');
  }
} else if (content.includes(closingMarkerLF)) {
  if (content.includes(modalJSXLF)) {
    console.log('Step 2: Modal already present, skipping.');
  } else {
    content = content.replace(closingMarkerLF, modalJSXLF + closingMarkerLF);
    console.log('Step 2: Added PaymentPolicyModal render (LF).');
  }
} else {
  console.error('Step 2 ERROR: HomePage closing marker not found. Trying alternative...');
  // Try to find }   );  }  // Menu Page pattern
  const alt = content.indexOf('// Menu Page');
  if (alt > -1) {
    // Walk back to find the closing
    const before = content.slice(0, alt);
    const insertPoint = before.lastIndexOf('</div>');
    if (insertPoint > -1) {
      content = content.slice(0, insertPoint) + 
        '      <PaymentPolicyModal isOpen={showPolicyModal} onClose={() => setShowPolicyModal(false)} policyText={hotelSettings.cancellation_policy} />\n' + 
        content.slice(insertPoint);
      console.log('Step 2: Added PaymentPolicyModal via fallback at char', insertPoint);
    } else {
      console.error('Step 2 ERROR: Could not find insertion point via fallback');
    }
  }
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('Done. File written.');
