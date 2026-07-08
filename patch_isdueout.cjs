const fs = require('fs');
const file = 'c:\\website\\northomes-system\\src\\App.jsx';
let content = fs.readFileSync(file, 'utf8');

const regexMap = [
  // 1. FolioRes global (Line ~105)
  {
    find: /const isDueOut = folioRes\?\.check_out_date && folioRes\.check_out_date\.slice\(0,10\) === new Date\(\)\.toISOString\(\)\.slice\(0,10\);/g,
    repl: "const isDueOut = folioRes?.check_out_date && new Date(folioRes.check_out_date).toLocaleDateString('en-CA') === new Date().toLocaleDateString('en-CA');\n  const isOverdue = folioRes?.check_out_date && new Date(folioRes.check_out_date).toLocaleDateString('en-CA') < new Date().toLocaleDateString('en-CA');"
  },
  // 2. r.check_out_date (TapeChart / InHouseCard)
  {
    find: /const isDueOut = r\.check_out_date && r\.check_out_date\.slice\(0, 10\) === today;\s*(const isOverdue = r\.check_out_date && r\.check_out_date\.slice\(0, 10\) < today;)?/g,
    repl: "const isDueOut = r.check_out_date && new Date(r.check_out_date).toLocaleDateString('en-CA') === new Date().toLocaleDateString('en-CA');\n    const isOverdue = r.check_out_date && new Date(r.check_out_date).toLocaleDateString('en-CA') < new Date().toLocaleDateString('en-CA');"
  },
  // 3. res.check_out_date (InHouse Tab Table)
  {
    find: /const isDueOut = res\.check_out_date && res\.check_out_date\.slice\(0, 10\) === today;\s*(const isOverdue = res\.check_out_date && res\.check_out_date\.slice\(0, 10\) < today;)?/g,
    repl: "const isDueOut = res.check_out_date && new Date(res.check_out_date).toLocaleDateString('en-CA') === new Date().toLocaleDateString('en-CA');\n                                  const isOverdue = res.check_out_date && new Date(res.check_out_date).toLocaleDateString('en-CA') < new Date().toLocaleDateString('en-CA');"
  },
  // 4. FolioRes modal (Line ~13730)
  {
    find: /const isDueOut = folioRes\.check_out_date && folioRes\.check_out_date\.slice\(0,10\) === new Date\(\)\.toISOString\(\)\.slice\(0,10\);/g,
    repl: "const isDueOut = folioRes?.check_out_date && new Date(folioRes.check_out_date).toLocaleDateString('en-CA') === new Date().toLocaleDateString('en-CA');\n  const isOverdue = folioRes?.check_out_date && new Date(folioRes.check_out_date).toLocaleDateString('en-CA') < new Date().toLocaleDateString('en-CA');"
  },
  // 5. Fix the In-House Table missed patch
  {
    find: /<span className=\{`px-2 py-0\.5 rounded text-\[10px\] font-bold uppercase tracking-wider \$\{isDueOut \? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'\}`\}>\s*\{isDueOut \? 'DUE OUT' : 'IN-HOUSE'\}\s*<\/span>/g,
    repl: "<span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${isOverdue ? 'bg-red-50 text-red-600' : isDueOut ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}>\n                                          {isOverdue ? 'OVERDUE' : isDueOut ? 'DUE OUT' : 'IN-HOUSE'}\n                                        </span>"
  },
  // 6. Fix the Folio Modal missed patch
  {
    find: /<span className=\{`px-2\.5 py-0\.5 rounded-full text-xs font-semibold \$\{isDueOut\?'bg-amber-100 text-amber-700':'bg-green-100 text-green-700'\}`\}>\s*\{isDueOut \? 'Due Out' : 'In-House'\}\s*<\/span>/g,
    repl: "<span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${isOverdue ? 'bg-red-100 text-red-700' : isDueOut ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>\n                {isOverdue ? 'Overdue' : isDueOut ? 'Due Out' : 'In-House'}\n              </span>"
  }
];

regexMap.forEach(r => {
  content = content.replace(r.find, r.repl);
});

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed timezone date bugs and table highlighting!');
