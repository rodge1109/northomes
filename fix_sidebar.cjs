const fs = require('fs');

let content = fs.readFileSync('src/App.jsx', 'utf8');

// Change 1: Add items-start to the Walk-in view container
const mainContainerTarget = `<div className="flex gap-6 h-full p-4 overflow-y-auto" style={{ background: '#f8f9fa' }}>`;
const mainContainerReplacement = `<div className="flex gap-6 items-start h-full p-4 overflow-y-auto" style={{ background: '#f8f9fa' }}>`;
content = content.replace(mainContainerTarget, mainContainerReplacement);

// Change 2: Make right sidebar sticky
const sidebarTarget = `<div className="w-[340px] xl:w-[380px] flex-shrink-0 flex flex-col gap-5">`;
const sidebarReplacement = `<div className="w-[340px] xl:w-[380px] flex-shrink-0 flex flex-col gap-5 sticky top-0 pb-4 max-h-full overflow-y-auto" style={{ scrollbarWidth: 'none' }}>`;
content = content.replace(sidebarTarget, sidebarReplacement);

// Change 3: Add flex-shrink-0 to Reservation Summary
const summaryTarget = `{/* Reservation Summary */}
                        <div className="bg-white rounded-2xl shadow-sm border border-black/5 overflow-hidden">`;
const summaryReplacement = `{/* Reservation Summary */}
                        <div className="bg-white rounded-2xl shadow-sm border border-black/5 overflow-hidden flex-shrink-0">`;
content = content.replace(summaryTarget, summaryReplacement);

// Change 4: Add flex-shrink-0 to Room Availability
const availTarget = `{/* Room Availability */}
                        <div className="bg-white rounded-2xl shadow-sm border border-black/5 overflow-hidden flex flex-col" style={{maxHeight: '300px'}}>`;
const availReplacement = `{/* Room Availability */}
                        <div className="bg-white rounded-2xl shadow-sm border border-black/5 overflow-hidden flex flex-col flex-shrink-0" style={{maxHeight: '300px'}}>`;
content = content.replace(availTarget, availReplacement);

fs.writeFileSync('src/App.jsx', content, 'utf8');
console.log('Sidebar layout fixed successfully');
