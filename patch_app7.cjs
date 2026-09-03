const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');

if (!code.includes('Capture Signature</button>')) {
  code = code.replace(
    /Print Data Sheet\r?\n\s*<\/button>\r?\n\s*\)\}/,
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
  fs.writeFileSync('src/App.jsx', code);
  console.log('Button added successfully.');
} else {
  console.log('Button already exists!');
}
