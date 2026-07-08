const fs = require('fs');
const file = 'c:\\website\\northomes-system\\src\\App.jsx';
let content = fs.readFileSync(file, 'utf8');

// Replace wrapper
content = content.replace(
  /<div className="fixed inset-0 bg-black\/50 flex items-center justify-center z-50 p-4">\s*<div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden">/,
  `<div className="fixed inset-0 z-[100] bg-gray-100 overflow-y-auto">\n                  <div className="min-h-screen flex flex-col">`
);

// Replace Inner Container Start
content = content.replace(
  /<div className="p-6">/,
  `<div className="flex-1 w-full max-w-5xl mx-auto p-4 sm:p-8 flex flex-col">\n                      <div className="bg-white rounded-3xl shadow-sm border border-black/5 p-6 sm:p-8 flex-1">`
);

// Replace Inner Container Close (we need to find exactly where the portal closes)
const closePattern = /}\s*<\/div>\s*<\/div>\s*<\/div>\s*, document\.body\)}/;
const replacementClose = `}\n                      </div>\n                    </div>\n                  </div>\n                </div>\n                , document.body)}`;

content = content.replace(closePattern, replacementClose);

fs.writeFileSync(file, content, 'utf8');
console.log('Wizard Full Screen Regex Patched!');
