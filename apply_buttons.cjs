const fs = require('fs');

function updateAppJsx() {
  let code = fs.readFileSync('src/App.jsx', 'utf8');
  let changed = false;

  // 1. Pass captureSignature to FrontDeskTab definition
  if (!code.includes('captureSignature, pendingCheckInRes')) {
    code = code.replace(
      /printGuestDataSheet,\s*captureSignature=\{\s*captureSignature\s*\}\s*pendingCheckInRes/,
      'printGuestDataSheet, captureSignature, pendingCheckInRes'
    );
    // Let's also check if the function declaration has it.
    code = code.replace(
      /function FrontDeskTab\(\{ reservations = \[\], printGuestDataSheet, pendingCheckInRes/,
      'function FrontDeskTab({ reservations = [], printGuestDataSheet, captureSignature, pendingCheckInRes'
    );
    changed = true;
  }

  // 2. Add Capture Signature button to FrontDeskTab dropdown
  if (!code.includes('Capture Signature</button>')) {
    code = code.replace(
      /Print Data Sheet\s*<\/button>\s*\)\}/,
      `Print Data Sheet
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
    changed = true;
  }
  
  if (changed) fs.writeFileSync('src/App.jsx', code);
}

function updateAdminGuestsTab() {
  let code = fs.readFileSync('src/AdminGuestsTab.jsx', 'utf8');
  let changed = false;

  if (!code.includes('captureSignature')) {
    code = code.replace(
      /printGuestDataSheet \}\)/,
      'printGuestDataSheet, captureSignature })'
    );
    code = code.replace(
      /printGuestDataSheet=\{printGuestDataSheet\}/g,
      'printGuestDataSheet={printGuestDataSheet} captureSignature={captureSignature}'
    );
    
    // the button in AdminGuestsTab table list
    code = code.replace(
      /Print Guest Data Sheet\s*<\/button>\s*\)\}/,
      `Print Guest Data Sheet
                        </button>
                      )}
                      {selectedGuest.stays && selectedGuest.stays.length > 0 && captureSignature && (
                        <button
                          onClick={() => captureSignature(selectedGuest.stays[0])}
                          className="w-full text-left px-4 py-2 text-[12px] hover:bg-gray-50 flex items-center gap-2 font-medium"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                          Capture Signature
                        </button>
                      )}`
    );
    changed = true;
  }
  if (changed) fs.writeFileSync('src/AdminGuestsTab.jsx', code);
}

function updateGuestProfileView() {
  let code = fs.readFileSync('src/GuestProfileView.jsx', 'utf8');
  let changed = false;

  if (!code.includes('captureSignature')) {
    code = code.replace(
      /printGuestDataSheet \}\)/,
      'printGuestDataSheet, captureSignature })'
    );
    
    // the button in quick actions
    code = code.replace(
      /Print Guest Data Sheet\s*<\/button>\s*\)\}/,
      `Print Guest Data Sheet
                </button>
              )}
              {guest.stays && guest.stays.length > 0 && captureSignature && (
                <button
                  onClick={() => captureSignature(guest.stays[0])}
                  className="px-4 py-2 bg-white border border-black/10 rounded-md text-[12px] font-bold text-[#006241] hover:bg-[#006241]/5 transition-colors flex items-center justify-center gap-2"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                  Capture Signature
                </button>
              )}`
    );
    
    // the button in stays list
    code = code.replace(
      /title="Print Guest Data Sheet"\s*>\s*<svg[^>]+><path[^>]+><\/path><\/svg>\s*<\/button>\s*\)\}/,
      `title="Print Guest Data Sheet"
                                    >
                                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2M6 14h12v6H6z"></path></svg>
                                    </button>
                                  )}
                                  {captureSignature && (
                                    <button
                                      onClick={(e) => { e.stopPropagation(); captureSignature(stay); }}
                                      className="p-1.5 rounded bg-white border border-black/10 hover:bg-gray-50 text-black/60 transition-colors"
                                      title="Capture Signature"
                                    >
                                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                                    </button>
                                  )}`
    );

    changed = true;
  }
  if (changed) fs.writeFileSync('src/GuestProfileView.jsx', code);
}

try {
  updateAppJsx();
  updateAdminGuestsTab();
  updateGuestProfileView();
  console.log('Successfully patched UI components.');
} catch (e) {
  console.error(e);
}
