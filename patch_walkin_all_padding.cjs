const fs = require('fs');

try {
  let content = fs.readFileSync('src/App.jsx', 'utf8');

  // Find start index
  const startIndex = content.indexOf("{fdView === 'walkin' && (");
  if (startIndex === -1) {
    console.log("Could not find walk-in section start.");
    process.exit(1);
  }

  // Find end index (very roughly, it's followed by "fdView === 'rooms' &&")
  const endIndex = content.indexOf("{fdView === 'rooms' &&", startIndex);
  if (endIndex === -1) {
    console.log("Could not find walk-in section end.");
    process.exit(1);
  }

  let walkinContent = content.substring(startIndex, endIndex);

  // Global replacements within this block ONLY
  walkinContent = walkinContent.replace(/p-7/g, 'p-4');
  walkinContent = walkinContent.replace(/p-5/g, 'p-3');
  walkinContent = walkinContent.replace(/p-6/g, 'p-4');
  walkinContent = walkinContent.replace(/py-2\.5/g, 'py-1.5');
  walkinContent = walkinContent.replace(/px-3 py-2\b/g, 'px-2 py-1.5');
  walkinContent = walkinContent.replace(/gap-6/g, 'gap-3');
  walkinContent = walkinContent.replace(/gap-5/g, 'gap-3');
  walkinContent = walkinContent.replace(/gap-4/g, 'gap-2');
  walkinContent = walkinContent.replace(/mb-5/g, 'mb-3');
  walkinContent = walkinContent.replace(/mb-6/g, 'mb-3');
  walkinContent = walkinContent.replace(/mb-8/g, 'mb-4');
  walkinContent = walkinContent.replace(/pb-4/g, 'pb-2');
  walkinContent = walkinContent.replace(/text-sm/g, 'text-[12px]');
  walkinContent = walkinContent.replace(/text-lg/g, 'text-[14px]');
  walkinContent = walkinContent.replace(/text-xl/g, 'text-[16px]');
  walkinContent = walkinContent.replace(/h-\[42px\]/g, 'h-[32px]');
  walkinContent = walkinContent.replace(/rounded-2xl/g, 'rounded-xl');
  walkinContent = walkinContent.replace(/rounded-lg/g, 'rounded-md');
  
  // Specific replacements for labels
  walkinContent = walkinContent.replace(/block text-xs font-semibold text-black\/60 mb-1\.5/g, 'block text-[10px] uppercase font-bold tracking-wider text-black/50 mb-1');
  walkinContent = walkinContent.replace(/block text-xs font-semibold text-black\/60/g, 'block text-[10px] uppercase font-bold tracking-wider text-black/50');
  walkinContent = walkinContent.replace(/mb-1\.5/g, 'mb-1');

  // Input text size
  walkinContent = walkinContent.replace(/text-\[12px\] focus/g, 'text-[12px] font-medium focus');

  // Reconstruct full content
  const newContent = content.substring(0, startIndex) + walkinContent + content.substring(endIndex);

  fs.writeFileSync('src/App.jsx', newContent, 'utf8');
  console.log("Successfully tightened ALL padding in the Walk-In section.");

} catch (err) {
  console.error("Error:", err);
}
