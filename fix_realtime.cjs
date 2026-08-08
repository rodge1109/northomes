const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'App.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// Replace fetchFolio 1
content = content.replace(
  /const fetchFolio = useCallback\(async \(reservationId\) => \{\s+setFolioLoading\(true\);\s+setFolioError\(''\);\s+try \{\s+const res = await fetch\(`\$\{API_BASE_URL\}\/api\/folio\/\$\{reservationId\}`\);/g,
  `const fetchFolio = useCallback(async (reservationId) => {
    setFolioLoading(true);
    setFolioError('');
    try {
      const res = await fetch(\`\${API_BASE_URL}/api/folio/\${reservationId}?t=\${Date.now()}\`);`
);

// Replace fetchFolio 2
content = content.replace(
  /const fetchFolio = React\.useCallback\(async \(reservationId\) => \{\s+setFolioLoading\(true\);\s+setFolioError\(''\);\s+try \{\s+const res = await fetch\(`\$\{API_BASE_URL\}\/api\/folio\/\$\{reservationId\}`\);/g,
  `const fetchFolio = React.useCallback(async (reservationId) => {
    setFolioLoading(true);
    setFolioError('');
    try {
      const res = await fetch(\`\${API_BASE_URL}/api/folio/\${reservationId}?t=\${Date.now()}\`);`
);

// Replace addCharge (both occurrences)
content = content.replace(
  /const addCharge = async \(overrideType, overrideDesc, overrideQty, overridePrice\) => \{\s+const type = overrideType \|\| fcType;\s+const desc = overrideDesc \|\| fcDesc;\s+const qty = overrideQty \|\| fcQty;\s+const price = overridePrice \|\| fcPrice;\s+if \(!price \|\| isNaN\(parseFloat\(price\)\)\) \{ setFcError\('Enter a valid price'\); return; \}\s+setFcSaving\(true\); setFcError\(''\);\s+try \{\s+const res = await fetch\(`\$\{API_BASE_URL\}\/api\/folio\/\$\{folioRes\.id\}\/charge`, \{\s+method: 'POST',\s+headers: \{ 'Content-Type': 'application\/json' \},\s+body: JSON\.stringify\(\{ charge_type: type, description: desc, quantity: qty, unit_price: price \}\),\s+\}\);\s+const data = await res\.json\(\);\s+if \(data\.success\) \{ fetchFolio\(folioRes\.id\); setFcDesc\(''\); setFcQty\(1\); setFcPrice\(''\); \}\s+else setFcError\(data\.message \|\| 'Failed'\);\s+\} catch \(e\) \{ setFcError\('Server error'\); \}\s+setFcSaving\(false\);\s+\};/g,
  `const addCharge = async (overrideType, overrideDesc, overrideQty, overridePrice) => {
    const type = overrideType || fcType;
    const desc = overrideDesc || fcDesc;
    const qty = overrideQty || fcQty;
    const price = overridePrice || fcPrice;
    if (!price || isNaN(parseFloat(price))) { setFcError('Enter a valid price'); return false; }
    setFcSaving(true); setFcError('');
    try {
      const res = await fetch(\`\${API_BASE_URL}/api/folio/\${folioRes.id}/charge\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ charge_type: type, description: desc, quantity: qty, unit_price: price }),
      });
      const data = await res.json();
      if (data.success) { 
        await fetchFolio(folioRes.id); 
        setFcDesc(''); setFcQty(1); setFcPrice(''); 
        setFcSaving(false);
        return true;
      }
      else { setFcError(data.message || 'Failed'); }
    } catch (e) { setFcError('Server error'); }
    setFcSaving(false);
    return false;
  };`
);

// Replace handleAddCharge 1
content = content.replace(
  /const handleAddCharge = \(\) => \{\s+addCharge\(fcType, fcDesc \|\| fcType, fcQty, fcPrice\);\s+setAddChargeOpen\(false\);\s+setFcDesc\(''\); setFcPrice\(''\); setFcQty\(1\);\s+\};/g,
  `const handleAddCharge = async () => {
    const ok = await addCharge(fcType, fcDesc || fcType, fcQty, fcPrice);
    if (ok !== false) {
      setAddChargeOpen(false);
      setFcDesc(''); setFcPrice(''); setFcQty(1);
    }
  };`
);

// Replace handleAddCharge 2
content = content.replace(
  /const handleAddCharge = \(\) => \{\s+addCharge\(chargeType, chargeDesc \|\| chargeType, chargeQty, chargeRate\);\s+setAddChargeOpen\(false\);\s+setChargeDesc\(''\); setChargeRate\(''\); setChargeQty\(1\); setChargeRef\(''\); setChargeNotes\(''\);\s+\};/g,
  `const handleAddCharge = async () => {
    const ok = await addCharge(chargeType, chargeDesc || chargeType, chargeQty, chargeRate);
    if (ok !== false) {
      setAddChargeOpen(false);
      setChargeDesc(''); setChargeRate(''); setChargeQty(1); setChargeRef(''); setChargeNotes('');
    }
  };`
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('App.jsx patched successfully.');
