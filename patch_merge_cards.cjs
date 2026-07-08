const fs = require('fs');
const file = 'c:\\website\\northomes-system\\src\\CorporateProfileView.jsx';
let content = fs.readFileSync(file, 'utf8');

// Left Column Parent
content = content.replace(
  '<div className="lg:col-span-2 space-y-6 flex flex-col">',
  '<div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-black/5 flex flex-col divide-y divide-black/5">'
);

// Main Info Card
content = content.replace(
  '<div className="bg-white rounded-2xl shadow-sm border border-black/5 p-6 relative">',
  '<div className="p-6 relative">'
);

// Company Details Card
content = content.replace(
  '<div className="bg-white rounded-2xl shadow-sm border border-black/5 p-6 space-y-5">',
  '<div className="p-6 space-y-5">'
);

// Financial Terms Card
content = content.replace(
  /<div className="bg-white rounded-2xl shadow-sm border border-black\/5 p-6 space-y-5">/g,
  '<div className="p-6 space-y-5">'
);

// Right Column Parent
content = content.replace(
  '            <div className="space-y-6 flex flex-col">\n              {/* Financial Summary */}',
  '            <div className="bg-white rounded-2xl shadow-sm border border-black/5 flex flex-col divide-y divide-black/5">\n              {/* Financial Summary */}'
);

// Financial Summary Card
content = content.replace(
  '<div className="bg-white rounded-2xl shadow-sm border border-black/5 overflow-hidden">',
  '<div className="overflow-hidden p-6">' // wait, was there p-6 here?
);
// Let's be safe. Financial Summary originally had:
// <div className="bg-white rounded-2xl shadow-sm border border-black/5 overflow-hidden">
//   <div className="px-6 py-5 border-b border-black/5">
// Wait, if I change it to <div className="overflow-hidden">, it still has px-6 py-5 border-b. Let's just strip the bg-white rounded-2xl shadow-sm border border-black/5
content = content.replace(
  '<div className="bg-white rounded-2xl shadow-sm border border-black/5 overflow-hidden">',
  '<div className="overflow-hidden">'
);

// Corporate Ledger Card
content = content.replace(
  '<div className="bg-white rounded-2xl shadow-sm border border-black/5 flex flex-col h-[500px]">',
  '<div className="flex flex-col h-[500px]">'
);

fs.writeFileSync(file, content, 'utf8');
console.log('Cards merged!');
