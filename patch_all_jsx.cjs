const fs = require('fs');
const path = require('path');

const srcDir = 'src';

const replacements = [
  [/\bp-12\b/g, 'p-8'],
  [/\bp-10\b/g, 'p-6'],
  [/\bp-8\b/g, 'p-6'],
  [/\bp-7\b/g, 'p-4'],
  [/\bp-6\b/g, 'p-4'],
  [/\bp-5\b/g, 'p-3'],
  [/\bpy-2\.5\b/g, 'py-1.5'],
  [/\bpx-3\s+py-2\b/g, 'px-2 py-1.5'],
  [/\bpx-3\s+py-2\.5\b/g, 'px-2 py-1.5'],
  [/\bgap-8\b/g, 'gap-4'],
  [/\bgap-6\b/g, 'gap-3'],
  [/\bgap-5\b/g, 'gap-3'],
  [/\bgap-4\b/g, 'gap-2'],
  [/\bmb-6\b/g, 'mb-3'],
  [/\bmb-5\b/g, 'mb-3'],
  [/\bmb-8\b/g, 'mb-4'],
  [/\bpb-4\b/g, 'pb-2'],
  [/\btext-sm\b/g, 'text-[12px]'],
  [/\btext-lg\b/g, 'text-[14px]'],
  [/\btext-xl\b/g, 'text-[16px]'],
  [/\bh-\[42px\]/g, 'h-[32px]'],
  [/\brounded-2xl\b/g, 'rounded-xl'],
  [/\brounded-lg\b/g, 'rounded-md'],
  [/\bmb-1\.5\b/g, 'mb-1']
];

function processFile(filePath) {
  if (!filePath.endsWith('.jsx')) return;
  
  let originalContent = fs.readFileSync(filePath, 'utf8');
  let content = originalContent;

  // Apply basic replacements
  for (const [regex, replacement] of replacements) {
    content = content.replace(regex, replacement);
  }

  // Label text changes
  content = content.replace(/block text-xs font-semibold text-black\/60 mb-1\.5/g, 'block text-[10px] uppercase font-bold tracking-wider text-black/50 mb-1');
  content = content.replace(/block text-xs font-semibold text-black\/60 mb-1/g, 'block text-[10px] uppercase font-bold tracking-wider text-black/50 mb-1');
  content = content.replace(/block text-xs font-semibold text-black\/60/g, 'block text-[10px] uppercase font-bold tracking-wider text-black/50');
  content = content.replace(/text-\[12px\] focus/g, 'text-[12px] font-medium focus');

  // Specific white gap fixes for outer containers
  content = content.replace(/className="flex-1 overflow-y-auto p-6 bg-white"/g, 'className="flex-1 overflow-y-auto py-6 pr-6 pl-[10px] bg-[#f8f9fa]"');
  content = content.replace(/className="flex-1 overflow-y-auto p-8 bg-white"/g, 'className="flex-1 overflow-y-auto py-6 pr-6 pl-[10px] bg-[#f8f9fa]"');
  content = content.replace(/className="flex-1 overflow-y-auto p-10 bg-white"/g, 'className="flex-1 overflow-y-auto py-6 pr-6 pl-[10px] bg-[#f8f9fa]"');
  content = content.replace(/className="flex-1 overflow-y-auto p-6 bg-\[\#f8f9fa\]"/g, 'className="flex-1 overflow-y-auto py-6 pr-6 pl-[10px] bg-[#f8f9fa]"');
  content = content.replace(/className="flex-1 p-6 overflow-y-auto bg-white"/g, 'className="flex-1 overflow-y-auto py-6 pr-6 pl-[10px] bg-[#f8f9fa]"');

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Patched ${filePath}`);
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath);
    } else {
      processFile(fullPath);
    }
  }
}

walkDir(srcDir);
console.log('Finished global patching.');
