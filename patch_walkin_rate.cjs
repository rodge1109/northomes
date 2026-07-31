const fs = require('fs');
let content = fs.readFileSync('src/App.jsx', 'utf8');

const targetStr = `                            <div className="grid grid-cols-4 gap-4 mb-5">
                              <div className="col-span-1">
                                <label className="block text-xs font-semibold text-black/60 mb-1.5">Room Type</label>
                                <select value={wkRoomType} onChange={e => { setWkRoomType(e.target.value); setWkRoomNumber(''); }}
                                  className="w-full px-3 py-2.5 bg-white border border-black/10 rounded-lg text-sm focus:border-[#00754A] outline-none transition-all shadow-sm">
                                  {wkRoomTypes.map(rt => <option key={rt.id} value={rt.name}>{rt.name}</option>)}
                                </select>
                              </div>
                              <div className="col-span-1">
                                <label className="block text-xs font-semibold text-black/60 mb-1.5">Room Preference</label>`;

const replacementStr = `                            <div className="grid grid-cols-5 gap-4 mb-5">
                              <div className="col-span-1">
                                <label className="block text-xs font-semibold text-black/60 mb-1.5">Room Type</label>
                                <select value={wkRoomType} onChange={e => { setWkRoomType(e.target.value); setWkRoomNumber(''); }}
                                  className="w-full px-3 py-2.5 bg-white border border-black/10 rounded-lg text-sm focus:border-[#00754A] outline-none transition-all shadow-sm">
                                  {wkRoomTypes.map(rt => <option key={rt.id} value={rt.name}>{rt.name}</option>)}
                                </select>
                              </div>
                              <div className="col-span-1">
                                <label className="block text-xs font-semibold text-black/60 mb-1.5">Rate Plan</label>
                                <select value={wkRateCode} onChange={e => setWkRateCode(e.target.value)}
                                  className="w-full px-3 py-2.5 bg-white border border-black/10 rounded-lg text-sm focus:border-[#00754A] outline-none transition-all shadow-sm">
                                  <option value="">Standard Rate</option>
                                  {wkRateCodes.map(rc => <option key={rc.id} value={rc.code}>{rc.name} ({rc.code})</option>)}
                                </select>
                              </div>
                              <div className="col-span-1">
                                <label className="block text-xs font-semibold text-black/60 mb-1.5">Room Preference</label>`;

if (content.includes(targetStr)) {
  content = content.replace(targetStr, replacementStr);
  fs.writeFileSync('src/App.jsx', content, 'utf8');
  console.log('Added Rate Plan dropdown to Walk-In form.');
} else {
  console.log('Failed to find target string in src/App.jsx');
}
