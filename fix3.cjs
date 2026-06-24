const fs = require('fs');
let c = fs.readFileSync('src/App.jsx', 'utf8');

let parts = c.split('const GuestProfileModal = () => {');
if (parts.length > 1) {
  let before = parts[0];
  let modal = parts[1].split('// Guest Folio')[0]; // Split before the next major section, or just work on the whole after part
  let afterModal = parts[1].split('// Guest Folio')[1]; // Wait, we don't need to split by Guest Folio, just string replace in parts[1].
  
  let after = parts[1];

  // Fix the dark background
  after = after.replace(
    'style={{ background: \'#111827\', border: \'1px solid rgba(255,255,255,0.12)\' }}',
    'className="relative bg-white shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl overflow-hidden"'
  );
  after = after.replace(
    '<div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-xl overflow-hidden"\n          className="relative bg-white shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl overflow-hidden">',
    '<div className="relative bg-white shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl overflow-hidden">'
  );
  // Actually, better to just replace the exact lines
  
  after = after.replace(
    '<div className="flex items-center justify-between px-5 py-3.5 border-b border-black/5">',
    '<div className="bg-[#00754A] flex items-center justify-between px-6 py-4">'
  );
  after = after.replace(
    '<div className="text-[#000000]/87 font-semibold text-sm">Guest Profile</div>',
    '<div className="text-white font-bold text-lg">Guest Profile</div>'
  );
  after = after.replace(
    '<div className="text-black/60 text-[11px] mt-0.5">',
    '<div className="text-emerald-100 text-sm mt-0.5">'
  );
  after = after.replace(
    'className="text-black/60 hover:text-[#000000]/87 text-lg leading-none transition-colors">',
    'className="text-emerald-200 hover:text-white text-2xl font-bold leading-none transition-colors ml-2 mb-1">'
  );

  // Fix Save button
  after = after.replace(
    'className="px-4 py-1.5 text-xs font-semibold bg-[#576CA8] hover:bg-[#4a5d9a] text-[#000000]/87 rounded transition-colors disabled:opacity-50"',
    'className="px-4 py-2 text-xs font-bold bg-[#00754A] hover:bg-[#006241] text-white rounded-lg uppercase tracking-widest transition-colors disabled:opacity-50"'
  );

  // Also fix the weird "flex flex-col" wrapper replacement
  after = after.replace(
    '<div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-xl overflow-hidden"\n          className="relative bg-white shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl overflow-hidden">',
    '<div className="relative bg-white shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl overflow-hidden">'
  );
  after = after.replace(
    '<div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-xl overflow-hidden"\n          style={{ background: \'#111827\', border: \'1px solid rgba(255,255,255,0.12)\' }}>',
    '<div className="relative bg-white shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl overflow-hidden">'
  );

  fs.writeFileSync('src/App.jsx', before + 'const GuestProfileModal = () => {' + after);
  console.log('Fixed GuestProfileModal colors!');
} else {
  console.log('Could not find GuestProfileModal in App.jsx');
}
