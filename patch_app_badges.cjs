const fs = require('fs');
let content = fs.readFileSync('src/App.jsx', 'utf8');

const badges = `{r.is_vip && <span className="text-[10px] text-yellow-600 font-bold ml-1.5 whitespace-nowrap" title="VIP Guest">★ VIP</span>}{r.is_repeat && <span className="text-[10px] text-blue-600 font-bold ml-1.5 whitespace-nowrap" title="Repeat Guest">↺ REPEAT</span>}`;

// Target exactly the instances inside a <span> or <td> that we want to patch
// E.g., <span className="font-semibold text-[#000000]/87 text-sm">{r.full_name}</span>
content = content.replace(/>{r\.full_name}<\/span>/g, `>{r.full_name}${badges}</span>`);
content = content.replace(/>{r\.title \? \`\$\{r\.title\} \` : ''}{r\.full_name}<\/span>/g, `>{r.title ? \`\${r.title} \` : ''}{r.full_name}${badges}</span>`);

fs.writeFileSync('src/App.jsx', content, 'utf8');
console.log('Successfully patched App.jsx for VIP/Repeat badges.');
