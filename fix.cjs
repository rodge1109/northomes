const fs = require('fs');
let c = fs.readFileSync('src/App.jsx', 'utf8');

c = c.replace(
  '<div className="flex items-start justify-between px-6 py-4 border-b border-gray-100">',
  '<div className="bg-[#00754A] flex items-start justify-between px-6 py-4">'
);
c = c.replace(
  '<h2 className="text-lg font-bold text-gray-900">Guest Folio</h2>',
  '<h2 className="text-lg font-bold text-white">Guest Folio</h2>'
);
c = c.replace(
  '<p className="text-sm text-gray-500 mt-0.5">',
  '<p className="text-sm text-emerald-100 mt-0.5">'
);
c = c.replace(
  '<p className="text-xs text-gray-400 mt-0.5">',
  '<p className="text-xs text-emerald-100/70 mt-0.5">'
);
c = c.replace(
  '<button onClick={() => setFolioOpen(false)} className="text-gray-400 hover:text-gray-600 text-xl font-bold leading-none ml-1">',
  '<button onClick={() => setFolioOpen(false)} className="text-emerald-200 hover:text-white text-xl font-bold leading-none ml-1">'
);

// We won't touch the Print / Email buttons exact text to avoid emoji encoding issues.
// We'll just replace their classNames directly.
c = c.replace(
  'className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-all"',
  'className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-white/10 hover:bg-white/20 text-white rounded-full transition-all"'
);
c = c.replace(
  'className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-full transition-all disabled:opacity-50"',
  'className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-white/10 hover:bg-white/20 text-white rounded-full transition-all disabled:opacity-50"'
);

fs.writeFileSync('src/App.jsx', c);
console.log('Done!');
