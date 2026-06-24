const fs = require('fs');
let c = fs.readFileSync('src/App.jsx', 'utf8');

c = c.replace(
  '<div className="bg-blue-50 rounded-xl p-3 text-center">',
  '<div className="bg-[#00754A]/5 rounded-xl p-3 text-center">'
);
c = c.replace(
  '<div className="text-xs text-blue-500 font-semibold uppercase tracking-wide mb-1">Total Charges</div>',
  '<div className="text-xs text-[#00754A]/80 font-semibold uppercase tracking-wide mb-1">Total Charges</div>'
);
c = c.replace(
  '<div className="text-lg font-bold text-blue-700">&#8369;{Number(folioTotals.charges).toLocaleString(\'en-PH\', { minimumFractionDigits: 2 })}</div>',
  '<div className="text-lg font-bold text-[#00754A]">&#8369;{Number(folioTotals.charges).toLocaleString(\'en-PH\', { minimumFractionDigits: 2 })}</div>'
);

c = c.replace(
  '<div className="mt-3 bg-blue-50 rounded-xl p-3 space-y-2">',
  '<div className="mt-3 bg-[#00754A]/5 rounded-xl p-3 space-y-2">'
);
c = c.replace(
  '<div className="text-xs font-semibold text-blue-600 uppercase tracking-wide">Post Charge</div>',
  '<div className="text-xs font-semibold text-[#00754A] uppercase tracking-wide">Post Charge</div>'
);
c = c.split('className="px-2 py-1.5 text-sm border border-blue-200 rounded-lg bg-white text-gray-700 focus:outline-none"').join('className="px-2 py-1.5 text-sm border border-[#00754A]/20 rounded-lg bg-white text-gray-700 focus:outline-none"');
c = c.split('className="flex-1 min-w-[100px] px-2 py-1.5 text-sm border border-blue-200 rounded-lg bg-white text-gray-700 focus:outline-none"').join('className="flex-1 min-w-[100px] px-2 py-1.5 text-sm border border-[#00754A]/20 rounded-lg bg-white text-gray-700 focus:outline-none"');
c = c.split('className="w-16 px-2 py-1.5 text-sm border border-blue-200 rounded-lg bg-white text-gray-700 focus:outline-none"').join('className="w-16 px-2 py-1.5 text-sm border border-[#00754A]/20 rounded-lg bg-white text-gray-700 focus:outline-none"');
c = c.split('className="w-24 px-2 py-1.5 text-sm border border-blue-200 rounded-lg bg-white text-gray-700 focus:outline-none"').join('className="w-24 px-2 py-1.5 text-sm border border-[#00754A]/20 rounded-lg bg-white text-gray-700 focus:outline-none"');

c = c.replace(
  'className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-[#000000]/87 text-sm font-semibold rounded-full transition-colors"',
  'className="px-3 py-1.5 bg-[#00754A] hover:bg-[#006241] disabled:opacity-50 text-white text-sm font-semibold rounded-full transition-colors"'
);

c = c.replace(
  '<div className="bg-green-50 rounded-xl p-3 text-center">',
  '<div className="bg-emerald-500/10 rounded-xl p-3 text-center">'
);
c = c.replace(
  '<div className="text-xs text-green-500 font-semibold uppercase tracking-wide mb-1">Total Payments</div>',
  '<div className="text-xs text-emerald-600 font-semibold uppercase tracking-wide mb-1">Total Payments</div>'
);
c = c.replace(
  '<div className="text-lg font-bold text-green-700">&#8369;{Number(folioTotals.payments).toLocaleString(\'en-PH\', { minimumFractionDigits: 2 })}</div>',
  '<div className="text-lg font-bold text-emerald-700">&#8369;{Number(folioTotals.payments).toLocaleString(\'en-PH\', { minimumFractionDigits: 2 })}</div>'
);
c = c.replace(
  '<div className="mt-3 bg-green-50 rounded-xl p-3 space-y-2">',
  '<div className="mt-3 bg-emerald-500/10 rounded-xl p-3 space-y-2">'
);
c = c.replace(
  '<div className="text-xs font-semibold text-green-600 uppercase tracking-wide">Record Payment</div>',
  '<div className="text-xs font-semibold text-emerald-600 uppercase tracking-wide">Record Payment</div>'
);
c = c.split('className="px-2 py-1.5 text-sm border border-green-200 rounded-lg bg-white text-gray-700 focus:outline-none"').join('className="px-2 py-1.5 text-sm border border-emerald-500/30 rounded-lg bg-white text-gray-700 focus:outline-none"');
c = c.split('className="w-32 px-2 py-1.5 text-sm border border-green-200 rounded-lg bg-white text-gray-700 focus:outline-none"').join('className="w-32 px-2 py-1.5 text-sm border border-emerald-500/30 rounded-lg bg-white text-gray-700 focus:outline-none"');
c = c.split('className="flex-1 min-w-[100px] px-2 py-1.5 text-sm border border-green-200 rounded-lg bg-white text-gray-700 focus:outline-none"').join('className="flex-1 min-w-[100px] px-2 py-1.5 text-sm border border-emerald-500/30 rounded-lg bg-white text-gray-700 focus:outline-none"');

c = c.replace(
  'className="px-3 py-1.5 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-[#000000]/87 text-sm font-semibold rounded-full transition-colors"',
  'className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-sm font-semibold rounded-full transition-colors"'
);

fs.writeFileSync('src/App.jsx', c);
console.log('Fixed FolioModal colors!');
