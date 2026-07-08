const fs = require('fs');
const file = 'c:\\website\\northomes-system\\src\\App.jsx';
let content = fs.readFileSync(file, 'utf8');

const targetStr = `<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                  <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden">`;

const replacementStr = `<div className="fixed inset-0 z-[100] bg-gray-100 overflow-y-auto">
                  <div className="min-h-screen flex flex-col">`;

content = content.replace(targetStr, replacementStr);

const targetInnerStart = `<div className="p-6">`;
const replacementInnerStart = `<div className="flex-1 w-full max-w-5xl mx-auto p-4 sm:p-8 flex flex-col">
                      <div className="bg-white rounded-3xl shadow-sm border border-black/5 p-6 sm:p-8 flex-1">`;

content = content.replace(targetInnerStart, replacementInnerStart);

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

fs.writeFileSync(file, content, 'utf8');
console.log('Wizard Full Screen Patched Part 2!');
