const fs = require('fs');

try {
  let content = fs.readFileSync('src/App.jsx', 'utf8');

  // We want to apply the exact same replacements we did for Walk-In, but globally!
  // To be safe, we make sure they have word boundaries or space boundaries so we don't accidentally replace 'top-7' with 'top-4' (we use \bp-7\b)

  const replacements = [
    [/\\bp-7\\b/g, 'p-4'],
    [/\\bp-6\\b/g, 'p-4'],
    [/\\bp-5\\b/g, 'p-3'],
    [/\\bpy-2\\.5\\b/g, 'py-1.5'],
    [/\\bpx-3\\s+py-2\\b/g, 'px-2 py-1.5'],
    [/\\bpx-3\\s+py-2\\.5\\b/g, 'px-2 py-1.5'],
    [/\\bgap-6\\b/g, 'gap-3'],
    [/\\bgap-5\\b/g, 'gap-3'],
    [/\\bgap-4\\b/g, 'gap-2'],
    [/\\bmb-6\\b/g, 'mb-3'],
    [/\\bmb-5\\b/g, 'mb-3'],
    [/\\bmb-8\\b/g, 'mb-4'],
    [/\\bpb-4\\b/g, 'pb-2'],
    // Be careful with text sizes, only replace standalone text-sm
    [/\\btext-sm\\b/g, 'text-[12px]'],
    [/\\btext-lg\\b/g, 'text-[14px]'],
    [/\\btext-xl\\b/g, 'text-[16px]'],
    [/\\bh-\\[42px\\]/g, 'h-[32px]'],
    [/\\brounded-2xl\\b/g, 'rounded-xl'],
    [/\\brounded-lg\\b/g, 'rounded-md'],
    [/\\bmb-1\\.5\\b/g, 'mb-1']
  ];

  for (const [regex, replacement] of replacements) {
    content = content.replace(regex, replacement);
  }

  // Very specific label replacements globally
  content = content.replace(/block text-xs font-semibold text-black\/60 mb-1\.5/g, 'block text-[10px] uppercase font-bold tracking-wider text-black/50 mb-1');
  content = content.replace(/block text-xs font-semibold text-black\/60 mb-1/g, 'block text-[10px] uppercase font-bold tracking-wider text-black/50 mb-1');
  content = content.replace(/block text-xs font-semibold text-black\/60/g, 'block text-[10px] uppercase font-bold tracking-wider text-black/50');
  
  // Specific input replacement
  content = content.replace(/text-\[12px\] focus/g, 'text-[12px] font-medium focus');

  // Fix up the outer container padding we just manually patched earlier
  // Since we replaced p-6 with p-4 globally, the outer container might now be p-4. Let's make sure it's p-6 for the main container if needed.
  // Actually, p-4 might look fine, let's leave it.

  fs.writeFileSync('src/App.jsx', content, 'utf8');
  console.log("Successfully tightened ALL padding globally across App.jsx.");

} catch (err) {
  console.error("Error:", err);
}
