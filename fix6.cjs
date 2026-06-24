const fs = require('fs');
let c = fs.readFileSync('src/App.jsx', 'utf8');

// The Modal Wrapper
c = c.replace(
  '            className="rounded-2xl border border-black/5 shadow-2xl w-full max-w-md overflow-hidden max-h-[90vh] overflow-y-auto"\n            onClick={(e) => e.stopPropagation()}\n            style={{ background: \'rgba(20,25,40,0.95)\', backdropFilter: \'blur(20px)\', WebkitBackdropFilter: \'blur(20px)\' }}',
  '            className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden max-h-[90vh] overflow-y-auto"\n            onClick={(e) => e.stopPropagation()}'
);

// The Modal Header
c = c.replace(
  '<div className="flex items-center justify-between px-6 py-5 border-b border-black/5" style={{ background: \'#ffffff\' }}>',
  '<div className="bg-[#00754A] flex items-center justify-between px-6 py-5">'
);
c = c.replace(
  '<div className="text-[#000000]/87 font-bold text-lg tracking-tight">Room Transfer / Upgrade</div>',
  '<div className="text-white font-bold text-lg tracking-tight">Room Transfer / Upgrade</div>'
);
c = c.replace(
  '<div className="text-black/60 text-xs mt-0.5">Assign a new room for this guest</div>',
  '<div className="text-emerald-100 text-xs mt-0.5">Assign a new room for this guest</div>'
);
c = c.replace(
  'className="text-black/60 hover:text-[#000000]/87 text-lg font-bold transition-colors leading-none"',
  'className="text-emerald-200 hover:text-white text-xl font-bold transition-colors leading-none ml-2 mb-1"'
);

// Current Assignment Section
c = c.replace(
  '                  className="border border-black/5 rounded-xl px-4 py-3 flex items-center justify-between"\n                  style={{ background: \'rgba(255,255,255,0.12)\' }}',
  '                  className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 flex items-center justify-between"'
);

// Room Type Filter Buttons
c = c.replace(
  '\'bg-teal-500/50 border-teal-400/60 text-[#000000]/87 shadow-sm\'',
  '\'bg-[#00754A]/20 border-[#00754A]/30 text-[#00754A] shadow-sm\''
);
c = c.replace(
  '\'bg-blue-500/50 border-blue-400/60 text-[#000000]/87 shadow-sm\'',
  '\'bg-[#00754A]/20 border-[#00754A]/30 text-[#00754A] shadow-sm\''
);

// Active Room Selection
c = c.replace(
  '\'bg-blue-500/40 border-blue-400/60\'',
  '\'bg-[#00754A]/20 border-[#00754A]/30 text-[#00754A]\''
);

// Transfer Summary Background
c = c.replace(
  '                    className="border border-black/5 rounded-xl px-5 py-3 flex items-center gap-4"\n                    style={{ background: \'rgba(59, 130, 246, 0.1)\' }}',
  '                    className="bg-[#00754A]/5 border border-[#00754A]/20 rounded-xl px-5 py-3 flex items-center gap-4"'
);

// Destination text color
c = c.replace(
  '<div className="text-2xl font-black font-mono text-blue-300">{transferRoomNumber}</div>',
  '<div className="text-2xl font-black font-mono text-[#00754A]">{transferRoomNumber}</div>'
);
c = c.replace(
  '<p className="mt-2 text-xs text-blue-300 font-medium">Filtering: {transferRoomType}</p>',
  '<p className="mt-2 text-xs text-[#00754A] font-medium">Filtering: {transferRoomType}</p>'
);

fs.writeFileSync('src/App.jsx', c);
console.log('Fixed TransferModal!');
