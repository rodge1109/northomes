const fs = require('fs');
let c = fs.readFileSync('src/App.jsx', 'utf8');

const startMarker = '{/* ── Folio Modal ── */}';
const startIdx = c.indexOf(startMarker);

// Find the end of the inline Folio Modal block.
// It ends right before `    </>` which is the end of the fragment returned by NorthomesPensione.
const endMarker = '    </>\r\n  );\r\n}';
let endIdx = c.indexOf('    </>', startIdx);
if (endIdx === -1) {
  endIdx = c.indexOf('    </>', startIdx);
}

if (startIdx === -1 || endIdx === -1) {
  console.log("Could not find markers.");
  process.exit(1);
}

const before = c.substring(0, startIdx);
const after = c.substring(endIdx);

const newCall = `{/* ── Folio Modal ── */}
      <FolioModal
        folioOpen={folioOpen} folioRes={folioRes} setFolioOpen={setFolioOpen} fmtDate={fmtDate} nightsCount={nightsCount} printFolio={printFolio}
        sendFolioEmail={sendFolioEmail} folioEmailSending={folioEmailSending} folioEmailMsg={folioEmailMsg} folioLoading={folioLoading} folioError={folioError}
        folioTotals={folioTotals} folioItems={folioItems} voidCharge={voidCharge} fcType={fcType} setFcType={setFcType} fcDesc={fcDesc} setFcDesc={setFcDesc}
        fcQty={fcQty} setFcQty={setFcQty} fcPrice={fcPrice} setFcPrice={setFcPrice} addCharge={addCharge} fcSaving={fcSaving} fcError={fcError}
        folioPayments={folioPayments} voidPayment={voidPayment} fpMethod={fpMethod} setFpMethod={setFpMethod} fpAmount={fpAmount} setFpAmount={setFpAmount}
        fpRef={fpRef} setFpRef={setFpRef} addPayment={addPayment} fpSaving={fpSaving} fpError={fpError}
      />
`;

fs.writeFileSync('src/App.jsx', before + newCall + after, 'utf8');
console.log("Successfully replaced inline Folio code with FolioModal component call.");
