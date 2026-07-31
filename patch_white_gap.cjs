const fs = require('fs');
let content = fs.readFileSync('src/App.jsx', 'utf8');

// The main layout wrapper
const target = `className="flex-1 overflow-y-auto py-6 pr-6 pl-[10px] bg-white"`;
const replacement = `className="flex-1 overflow-y-auto py-6 pr-6 pl-[10px] bg-[#f8f9fa]"`; // Change to off-white to match the page background

if (content.includes(target)) {
  content = content.replace(target, replacement);
  fs.writeFileSync('src/App.jsx', content, 'utf8');
  console.log('Successfully removed the white gap.');
} else {
  // Try finding it with p-4 if the global padding script altered it
  const fallbackTarget = `className="flex-1 overflow-y-auto py-6 pr-6 pl-[10px] bg-white"`;
  console.log('Failed to find exact target string. Will attempt more flexible replace.');
  
  // Actually, I know the exact string because I patched it explicitly to "py-6 pr-6 pl-[10px] bg-white" in patch_left_padding.cjs, 
  // but maybe it got altered by patch_global_padding.cjs? 
  // Let's use a regex that matches the flex-1 overflow-y-auto
  content = content.replace(/className="flex-1 overflow-y-auto py-6 pr-6 pl-\[10px\] bg-white"/g, replacement);
  fs.writeFileSync('src/App.jsx', content, 'utf8');
}
