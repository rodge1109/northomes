const fs = require('fs');
let c = fs.readFileSync('src/App.jsx', 'utf8');

// For sel:
c = c.replace(
  'className="w-full px-2 py-1 bg-[#1e2a3a] border border-black/5 text-[#000000]/87 text-[11px] rounded-sm outline-none focus:border-black/5 transition-colors">',
  'className="w-full px-2 py-1 bg-white shadow-sm border border-black/5 text-[#000000]/87 text-[11px] rounded-sm outline-none focus:border-[#00754A]/30 transition-colors">'
);

// For divider line:
c = c.replace(
  '<div className="flex-1 h-px bg-white shadow-sm" />',
  '<div className="flex-1 h-px bg-black/5" />'
);

// We should also replace the focus rings on inp to be green-themed if we can.
c = c.replace(
  'className="w-full px-2 py-1 bg-white shadow-sm border border-black/5 text-[#000000]/87 text-[11px] rounded-sm outline-none focus:border-black/5 transition-colors"',
  'className="w-full px-2 py-1 bg-white shadow-sm border border-black/5 text-[#000000]/87 text-[11px] rounded-sm outline-none focus:border-[#00754A]/30 transition-colors"'
);

fs.writeFileSync('src/App.jsx', c);
console.log('Fixed sel and divider!');
