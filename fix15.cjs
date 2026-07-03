const fs = require('fs');
let c = fs.readFileSync('src/App.jsx', 'utf8');

// Patch `addCharge` in App.jsx
c = c.replace(
  /const addCharge = async \(\) => \{\s+if \(!fcPrice \|\| isNaN\(parseFloat\(fcPrice\)\)\) \{/g,
  `const addCharge = async (overrideType, overrideDesc, overrideQty, overridePrice) => {
    const type = overrideType || fcType;
    const desc = overrideDesc || fcDesc;
    const qty = overrideQty || fcQty;
    const price = overridePrice || fcPrice;
    if (!price || isNaN(parseFloat(price))) {`
);

// We need to replace the usage of fcType, fcDesc, etc inside addCharge's fetch call
// In the original: body: JSON.stringify({ charge_type: fcType, description: fcDesc, quantity: fcQty, unit_price: fcPrice }),
c = c.replace(
  /body: JSON\.stringify\(\{ charge_type: fcType, description: fcDesc, quantity: fcQty, unit_price: fcPrice \}\),/g,
  `body: JSON.stringify({ charge_type: type, description: desc, quantity: qty, unit_price: price }),`
);

// Also patch `addPayment` in App.jsx to avoid similar issues
c = c.replace(
  /const addPayment = async \(\) => \{\s+if \(!fpAmount \|\| isNaN\(parseFloat\(fpAmount\)\)\) \{/g,
  `const addPayment = async (overrideMethod, overrideAmount, overrideRef) => {
    const method = overrideMethod || fpMethod;
    const amount = overrideAmount || fpAmount;
    const ref = overrideRef || fpRef;
    if (!amount || isNaN(parseFloat(amount))) {`
);

// body: JSON.stringify({ payment_method: fpMethod, amount: fpAmount, reference: fpRef }),
c = c.replace(
  /body: JSON\.stringify\(\{ payment_method: fpMethod, amount: fpAmount, reference: fpRef \}\),/g,
  `body: JSON.stringify({ payment_method: method, amount: amount, reference: ref }),`
);


// Now patch `handleAddCharge` in FolioModal
c = c.replace(
  /const handleAddCharge = \(\) => \{\s+setFcType\(chargeType\);\s+setFcDesc\(chargeDesc \|\| chargeType\);\s+setFcQty\(chargeQty\);\s+setFcPrice\(chargeRate\);\s+addCharge\(\);/g,
  `const handleAddCharge = () => {
    addCharge(chargeType, chargeDesc || chargeType, chargeQty, chargeRate);`
);

// And patch `handleAddPayment` in FolioModal
c = c.replace(
  /const handleAddPayment = \(\) => \{\s+addPayment\(\);/g,
  `const handleAddPayment = () => {
    addPayment(fpMethod, fpAmount, fpRef);`
);

fs.writeFileSync('src/App.jsx', c, 'utf8');
console.log('Successfully patched addCharge and addPayment race conditions.');
