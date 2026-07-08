const fs = require('fs');
const file = 'c:\\website\\northomes-system\\src\\App.jsx';
let content = fs.readFileSync(file, 'utf8');

const targetStr = `<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                  <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden">`;

const replacementStr = `<div className="fixed inset-0 z-[100] bg-gray-100 overflow-y-auto">
                  <div className="min-h-screen flex flex-col">`;

const targetHeader = `<div className="bg-gradient-to-br from-[#00754A] to-[#006241] px-6 py-4 flex items-center justify-between">`;
const replacementHeader = `<div className="bg-gradient-to-br from-[#00754A] to-[#006241] px-8 py-5 flex items-center justify-between shadow-md sticky top-0 z-10">`;

const targetCloseWrapper = `</div>
                  </div>
                </div>`;
const replacementCloseWrapper = `</div>
                    </div>
                  </div>
                </div>`;

content = content.replace(targetStr, replacementStr);
content = content.replace(targetHeader, replacementHeader);

// We need to also wrap the inner content in a centered container.
// The inner container starts with `<div className="p-6">`
const targetInnerStart = `<div className="p-6">`;
const replacementInnerStart = `<div className="flex-1 w-full max-w-4xl mx-auto p-4 sm:p-8 flex flex-col">
                      <div className="bg-white rounded-3xl shadow-sm border border-black/5 p-6 sm:p-8 flex-1">`;

content = content.replace(targetInnerStart, replacementInnerStart);
// And add an extra closing div before the portal closes.
// We can find where the portal closes.
//   )}
//                     </div>
//                   </div>
//                 </div>
//                 , document.body)}
const targetInnerClose = `                      )}
                    </div>
                  </div>
                </div>
                , document.body)}`;
                
const replacementInnerClose = `                      )}
                      </div>
                    </div>
                  </div>
                </div>
                , document.body)}`;

content = content.replace(targetInnerClose, replacementInnerClose);

// Replace header text colors to contrast with green background.
content = content.replace('className="text-[#000000]/87 font-bold">Check-In Wizard', 'className="text-white font-bold text-xl">Check-In Wizard');
content = content.replace('className="text-black/60 text-xs">{wizardReservation', 'className="text-white/80 text-sm">{wizardReservation');
content = content.replace('className="text-black/60 hover:text-[#000000]/87 text-lg font-bold transition-colors"', 'className="text-white/80 hover:text-white text-3xl font-light leading-none transition-colors"');

fs.writeFileSync(file, content, 'utf8');
console.log('Wizard Full Screen Patched!');
