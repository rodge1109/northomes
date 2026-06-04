const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');

// 1. Remove LiquidEther and replace with solid cream background
code = code.replace(/<LiquidEther[^>]*\/>/g, '<div className="fixed inset-0 bg-[#f2f0eb] -z-10" />');

// 2. Change primary brand colors
code = code.replace(/#55A2F5/g, '#00754A'); // Primary Accent Green
code = code.replace(/#2D72C0/g, '#006241'); // Starbucks Green
code = code.replace(/#5227FF/g, '#006241');
code = code.replace(/#FF9FFC/g, '#00754A');
code = code.replace(/#B19EEF/g, '#1E3932');

// 3. Convert transparent dark panels to solid white cards
code = code.replace(/bg-white\/\\[0\.0[0-9]+\\]/g, 'bg-white shadow-sm');
code = code.replace(/bg-white\/[0-9]+/g, 'bg-white shadow-sm');
code = code.replace(/border-white\/[0-9]+/g, 'border-black/5');
code = code.replace(/backdrop-blur(?:-\w+|\[.*?\])?/g, '');

// 4. Change text colors (mostly text-white -> text-black/80)
code = code.replace(/text-white\/[0-9]+/g, 'text-black/60');
code = code.replace(/text-white/g, 'text-[#000000]/87');

// 5. Fix button text color (buttons with brand background should have white text)
code = code.replace(/text-\[#000000\]\/87([^>]*bg-gradient-to)/g, 'text-white$1');
code = code.replace(/(bg-\[#00754A\][^>]*)text-\[#000000\]\/87/g, '$1text-white');
code = code.replace(/(bg-gradient-to[^>]*)text-\[#000000\]\/87/g, '$1text-white');

// 6. Header background and layout tweaks
code = code.replace(/background:\s*'rgba\(255,255,255,0\.05\)'/g, "background: '#ffffff'");
code = code.replace(/background:\s*'rgba\(255,255,255,0\.08\)'/g, "background: '#ffffff'");
code = code.replace(/style=\{\{\s*background:\s*'rgba\(255,255,255,0\.05\)',\s*WebkitBackdropFilter:\s*'blur\(20px\)'\s*\}\}/g, "className=\"bg-white shadow-sm\"");

// 7. Buttons border radius (rounded-xl/lg -> rounded-full for buttons)
code = code.replace(/<button([^>]*)rounded-(?:xl|lg|md)/g, '<button$1rounded-full');

fs.writeFileSync('src/App.jsx', code);
console.log('App.jsx theme updated!');
