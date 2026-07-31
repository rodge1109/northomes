const fs = require('fs');
let content = fs.readFileSync('src/App.jsx', 'utf8');

// Replace the specific grid container
content = content.replace('className="grid grid-cols-5 gap-4 mb-5"', 'className="grid grid-cols-5 gap-2 mb-4"');

// Replace the padding/text size for the <select> boxes in this section
content = content.replace(/className="w-full px-3 py-2\.5 bg-white border border-black\/10 rounded-lg text-sm focus:border-\[\#00754A\] outline-none transition-all shadow-sm"/g, 'className="w-full px-2 py-1.5 bg-white border border-black/10 rounded-md text-[12px] font-medium focus:border-[#00754A] outline-none transition-all shadow-sm"');

// Replace the label styling
content = content.replace(/<label className="block text-xs font-semibold text-black\/60 mb-1\.5">/g, '<label className="block text-[10px] uppercase font-bold tracking-wider text-black/50 mb-1">');

// Replace button height
content = content.replace('className="w-full h-[42px]', 'className="w-full h-[32px]');

fs.writeFileSync('src/App.jsx', content, 'utf8');
console.log('Applied tighter paddings to Walk-In grid.');
