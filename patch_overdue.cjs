const fs = require('fs');
const file = 'c:\\website\\northomes-system\\src\\App.jsx';
let content = fs.readFileSync(file, 'utf8');

// Patch 1: InHouseCard logic
content = content.replace(
  /const isDueOut = r\.check_out_date && r\.check_out_date\.slice\(0, 10\) === today;\s*const menuItems = \[/,
  `const isDueOut = r.check_out_date && r.check_out_date.slice(0, 10) === today;\n    const isOverdue = r.check_out_date && r.check_out_date.slice(0, 10) < today;\n\n    const menuItems = [`
);

// Patch 2: InHouseCard background/border
content = content.replace(
  /style={{ gridTemplateColumns: '3rem 1fr 6rem 5.5rem 5.5rem 6rem 2.5rem 6rem', borderBottom: `1px solid \$\{isDueOut \? 'rgba\(251,191,36,0\.2\)' : 'rgba\(0,0,0,0\.05\)'\}`, background: isDueOut \? 'rgba\(251,191,36,0\.04\)' : '#ffffff' }}/,
  "style={{ gridTemplateColumns: '3rem 1fr 6rem 5.5rem 5.5rem 6rem 2.5rem 6rem', borderBottom: `1px solid ${isOverdue ? 'rgba(239,68,68,0.2)' : isDueOut ? 'rgba(251,191,36,0.2)' : 'rgba(0,0,0,0.05)'}`, background: isOverdue ? 'rgba(239,68,68,0.04)' : isDueOut ? 'rgba(251,191,36,0.04)' : '#ffffff' }}"
);

// Patch 3: InHouseCard pill
content = content.replace(
  /<span className=\{`inline-flex items-center gap-1\.5 text-\[10px\] font-bold uppercase tracking-wide px-2 py-0\.5 rounded-full w-fit \$\{\n\s*isDueOut\n\s*\? 'bg-amber-100 text-amber-700'\n\s*: 'bg-green-100 text-green-700'\n\s*\}\`\}>\n\s*<span className=\{`w-1\.5 h-1\.5 rounded-full flex-shrink-0 \$\{isDueOut \? 'bg-amber-500' : 'bg-green-500'\}`\} \/>\n\s*\{isDueOut \? 'Due Out' : 'Checked In'\}\n\s*<\/span>/,
  `<span className={\`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full w-fit \${isOverdue ? 'bg-red-100 text-red-700' : isDueOut ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}\`}>\n          <span className={\`w-1.5 h-1.5 rounded-full flex-shrink-0 \${isOverdue ? 'bg-red-500' : isDueOut ? 'bg-amber-500' : 'bg-green-500'}\`} />\n          {isOverdue ? 'Overdue' : isDueOut ? 'Due Out' : 'Checked In'}\n        </span>`
);

// Patch 4: Table list logic
content = content.replace(
  /const isDueOut = res\.check_out_date && res\.check_out_date\.slice\(0, 10\) === today;\s*const handleSendEmail = async \(r\) => \{/,
  `const isDueOut = res.check_out_date && res.check_out_date.slice(0, 10) === today;\n                                  const isOverdue = res.check_out_date && res.check_out_date.slice(0, 10) < today;\n                                  \n                                  const handleSendEmail = async (r) => {`
);

// Patch 5: Table list pill
content = content.replace(
  /<span className=\{`px-2 py-0\.5 rounded text-\[10px\] font-bold uppercase tracking-wider \$\{isDueOut \? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'\}`\}>\n\s*\{isDueOut \? 'DUE OUT' : 'IN-HOUSE'\}\n\s*<\/span>/,
  `<span className={\`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider \${isOverdue ? 'bg-red-50 text-red-600' : isDueOut ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}\`}>\n                                          {isOverdue ? 'OVERDUE' : isDueOut ? 'DUE OUT' : 'IN-HOUSE'}\n                                        </span>`
);

fs.writeFileSync(file, content, 'utf8');
console.log('Overdue highlight applied!');
