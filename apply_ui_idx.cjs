const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');

const startTag = "{/* Message View */}";
const endTag = "      </div>\n    </div>\n  );\n}\n\n// Header Component";

const startIndex = code.indexOf(startTag);
const endIndex = code.indexOf(endTag);

if (startIndex !== -1 && endIndex !== -1) {
  const replaceStr = `{/* Message View */}
        <div className="flex-1 flex flex-col overflow-hidden bg-white">
          {selected ? (
            <div className="flex-1 flex flex-col overflow-y-auto">
              {/* Header / Actions */}
              <div className="px-8 py-4 border-b border-black/5 flex items-center justify-between sticky top-0 bg-white z-10">
                <div className="flex items-center gap-4">
                  <button onClick={() => setSelected(null)} className="text-gray-500 hover:text-gray-900 transition-colors p-2 -ml-2 rounded-full hover:bg-gray-100" title="Back to inbox">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>
                  </button>
                </div>
                <div>
                  <a
                    href={\`mailto:\${selected.email}?subject=Re: \${encodeURIComponent(selected.subject)}\`}
                    className="flex items-center gap-2 px-4 py-2 bg-[#f8f9fa] border border-black/10 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>
                    Reply
                  </a>
                </div>
              </div>
              
              {/* Subject */}
              <div className="px-8 pt-8 pb-6">
                <h2 className="text-2xl sm:text-3xl font-normal text-gray-900">{selected.subject}</h2>
              </div>
              
              {/* Sender Info */}
              <div className="px-8 pb-6 flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-[#00754A] flex items-center justify-center flex-shrink-0 text-white shadow-sm mt-1">
                  <span className="font-bold text-lg">{selected.name[0].toUpperCase()}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between flex-wrap gap-2">
                    <div className="flex items-baseline gap-2 truncate">
                      <span className="font-bold text-gray-900 text-base">{selected.name}</span>
                      <span className="text-sm text-gray-500">&lt;{selected.email}&gt;</span>
                    </div>
                    <span className="text-xs text-gray-500 flex-shrink-0" title={new Date(selected.created_at).toLocaleString('en-PH', { dateStyle: 'full', timeStyle: 'short' })}>
                      {new Date(selected.created_at).toLocaleString('en-PH', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">to Northomes Pensionne</p>
                </div>
              </div>
              
              {/* Message Content */}
              <div className="px-8 pb-12 flex-1">
                <div className="text-gray-800 leading-relaxed whitespace-pre-wrap text-[15px]">{selected.message}</div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center px-6 bg-[#f8f9fa]">
              <svg className="w-16 h-16 text-gray-200 mb-4" fill="none" stroke="currentColor" strokeWidth="1" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg>
              <p className="text-gray-400 font-medium">Select an item to read</p>
              <p className="text-gray-400 text-sm mt-1">Nothing is selected</p>
            </div>
          )}
        </div>
`;

  code = code.substring(0, startIndex) + replaceStr + code.substring(endIndex);
  fs.writeFileSync('src/App.jsx', code);
  console.log('Successfully replaced layout using indices!');
} else {
  console.log('Could not find start or end tags.');
}
