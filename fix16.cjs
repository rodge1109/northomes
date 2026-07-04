const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');

const folioModalDefRegex = /function FolioModal\(\{\n([\s\S]*?)fpRef, setFpRef, addPayment, fpSaving, fpError\n\}\) \{/;
if (folioModalDefRegex.test(code)) {
  code = code.replace(folioModalDefRegex, (match, p1) => {
    return `function FolioModal({\n${p1}fpRef, setFpRef, addPayment, fpSaving, fpError,
  fpSuccess, setFpSuccess, fpSuccessData, setFpSuccessData, fpApplyTo, setFpApplyTo,
  fpDate, setFpDate, fpTime, setFpTime, fpCardNumber, setFpCardNumber,
  fpCardholder, setFpCardholder, fpExpiry, setFpExpiry, fpNotes, setFpNotes\n}) {`;
  });
  console.log('Fixed FolioModal definition.');
} else {
  console.log('Could not find FolioModal definition.');
}

const folioModalCallRegex = /<FolioModal\n([\s\S]*?)fpRef=\{fpRef\} setFpRef=\{setFpRef\} addPayment=\{addPayment\} fpSaving=\{fpSaving\} fpError=\{fpError\}\n\s*\/>/;
if (folioModalCallRegex.test(code)) {
  code = code.replace(folioModalCallRegex, (match, p1) => {
    return `<FolioModal\n${p1}fpRef={fpRef} setFpRef={setFpRef} addPayment={addPayment} fpSaving={fpSaving} fpError={fpError}
        fpSuccess={fpSuccess} setFpSuccess={setFpSuccess} fpSuccessData={fpSuccessData} setFpSuccessData={setFpSuccessData}
        fpApplyTo={fpApplyTo} setFpApplyTo={setFpApplyTo} fpDate={fpDate} setFpDate={setFpDate} fpTime={fpTime} setFpTime={setFpTime}
        fpCardNumber={fpCardNumber} setFpCardNumber={setFpCardNumber} fpCardholder={fpCardholder} setFpCardholder={setFpCardholder}
        fpExpiry={fpExpiry} setFpExpiry={setFpExpiry} fpNotes={fpNotes} setFpNotes={setFpNotes}
      />`;
  });
  console.log('Fixed FolioModal call.');
} else {
  console.log('Could not find FolioModal call.');
}

fs.writeFileSync('src/App.jsx', code);
