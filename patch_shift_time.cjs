const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'App.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// Add state variables
content = content.replace(
  /const \[toDate, setToDate\] = React\.useState\(initialToDate \|\| new Date\(\)\.toISOString\(\)\.split\('T'\)\[0\]\);\n\s*const \[shiftStaff, setShiftStaff\] = React\.useState\('All Staff'\);/g,
  `const [toDate, setToDate] = React.useState(initialToDate || new Date().toISOString().split('T')[0]);
  const [fromTime, setFromTime] = React.useState('00:00');
  const [toTime, setToTime] = React.useState('23:59');
  const [shiftStaff, setShiftStaff] = React.useState('All Staff');`
);

// Update endpoint
content = content.replace(
  /else if \(report\.title === "Cashier Shift Report"\) endpoint = `\/api\/reports\/shift\?startDate=\$\{fromDate\}&endDate=\$\{toDate\}&staff=\$\{encodeURIComponent\(shiftStaff\)\}`;/g,
  `else if (report.title === "Cashier Shift Report") endpoint = \`/api/reports/shift?startDate=\${fromDate}T\${fromTime}:00&endDate=\${toDate}T\${toTime}:59&staff=\${encodeURIComponent(shiftStaff)}\`;`
);

// Update dependencies
content = content.replace(
  /\}, \[report, fromDate, toDate, shiftStaff\]\);/g,
  `}, [report, fromDate, toDate, shiftStaff, fromTime, toTime]);`
);

// Update UI (From)
content = content.replace(
  /<input type="date" value=\{fromDate\} onChange=\{e => setFromDate\(e\.target\.value\)\} className="text-\[12px\] outline-none bg-transparent cursor-pointer font-medium" \/>/g,
  `<input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} className="text-[12px] outline-none bg-transparent cursor-pointer font-medium" />
                  {report.title === "Cashier Shift Report" && (
                    <input type="time" value={fromTime} onChange={e => setFromTime(e.target.value)} className="text-[12px] outline-none bg-transparent cursor-pointer font-medium border-l border-black/10 pl-2 ml-1" />
                  )}`
);

// Update UI (To)
content = content.replace(
  /<input type="date" value=\{toDate\} onChange=\{e => setToDate\(e\.target\.value\)\} className="text-\[12px\] outline-none bg-transparent cursor-pointer font-medium" \/>/g,
  `<input type="date" value={toDate} onChange={e => setToDate(e.target.value)} className="text-[12px] outline-none bg-transparent cursor-pointer font-medium" />
                  {report.title === "Cashier Shift Report" && (
                    <input type="time" value={toTime} onChange={e => setToTime(e.target.value)} className="text-[12px] outline-none bg-transparent cursor-pointer font-medium border-l border-black/10 pl-2 ml-1" />
                  )}`
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('App.jsx patched successfully for shift times.');
