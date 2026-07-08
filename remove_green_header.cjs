const fs = require('fs');
const file = 'c:\\website\\northomes-system\\src\\App.jsx';
let content = fs.readFileSync(file, 'utf8');

const regex = /<div className="min-h-screen flex flex-col">[\s\S]*?<div className="flex-1 w-full max-w-5xl mx-auto p-4 sm:p-8 flex flex-col">\s*<div className="bg-white rounded-3xl shadow-sm border border-black\/5 p-6 sm:p-8 flex-1">/;

const replacement = `<div className="min-h-screen flex flex-col lg:pl-[260px]">
                    <div className="flex-1 w-full max-w-5xl mx-auto p-4 sm:p-8 flex flex-col">
                      <div className="flex items-center justify-between mb-6 px-2">
                        <div>
                          <h2 className="text-3xl font-black text-gray-900 tracking-tight">Check-In Wizard</h2>
                          <p className="text-gray-500 font-medium mt-1">{wizardReservation.full_name} &bull; Confirmation #{wizardReservation.id}</p>
                        </div>
                        {!wizardSuccess && (
                          <button onClick={closeWizard} className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300 text-gray-600 transition-colors">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                          </button>
                        )}
                      </div>
                      <div className="bg-white rounded-3xl shadow-sm border border-black/5 p-6 sm:p-8 flex-1">`;

content = content.replace(regex, replacement);

fs.writeFileSync(file, content, 'utf8');
console.log('Removed green header successfully!');
