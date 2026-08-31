const fs = require('fs');
let c = fs.readFileSync('src/App.jsx', 'utf8');

c = c.replace(
  /\{\/\* Actions \*\/\}\s*<div className="flex flex-col gap-3 mt-auto">\s*<button className="w-full py-3 rounded-xl border border-\[#1E3932\]/,
  `{/* Actions */}
                          <div className="flex flex-col gap-3 mt-auto">
                            {wkError && <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-[12px] font-bold rounded-lg">{wkError}</div>}
                            <button className="w-full py-3 rounded-xl border border-[#1E3932]`
);

fs.writeFileSync('src/App.jsx', c);
console.log('patched');
