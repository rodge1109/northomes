const fs = require('fs');
let c = fs.readFileSync('src/App.jsx', 'utf8');

c = c.split(
  'className="w-full px-2 py-1 bg-white shadow-sm border border-black/5 text-[#000000]/87 text-[11px] rounded-sm outline-none focus:border-black/5 transition-colors"'
).join(
  'className="w-full px-2 py-1 bg-white shadow-sm border border-black/5 text-[#000000]/87 text-[11px] rounded-sm outline-none focus:border-[#00754A]/30 transition-colors"'
);

c = c.split(
  '<div className="flex-1 h-px bg-white shadow-sm" />'
).join(
  '<div className="flex-1 h-px bg-black/5" />'
);

fs.writeFileSync('src/App.jsx', c);
console.log('Fixed multiple occurrences!');
