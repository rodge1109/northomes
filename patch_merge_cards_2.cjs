const fs = require('fs');
const file = 'c:\\website\\northomes-system\\src\\CorporateProfileView.jsx';
let content = fs.readFileSync(file, 'utf8');

// Left Column Wrapper
content = content.replace(
  '<div className="flex-1 space-y-6">',
  '<div className="flex-1 bg-white rounded-2xl shadow-sm border border-black/5 flex flex-col divide-y divide-black/5">'
);

// Tab Contents Wrapper
content = content.replace(
  '<div className="space-y-6">',
  '<div className="divide-y divide-black/5 flex flex-col">'
);

// Right Column Wrapper
content = content.replace(
  '<div className="w-[450px] shrink-0 space-y-6">',
  '<div className="w-[450px] shrink-0 bg-white rounded-2xl shadow-sm border border-black/5 flex flex-col divide-y divide-black/5">'
);

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed outer wrapper padding & gaps!');
