const fs = require('fs');
let content = fs.readFileSync('src/App.jsx', 'utf8');

const targetStr = `                            <div className="grid grid-cols-5 gap-4 mb-5">
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
                                <label className="block text-xs font-semibold text-black/60 mb-1.5">Room Preference</label>
                                <select value={wkRoomPreference} onChange={e => setWkRoomPreference(e.target.value)}
                                  className="w-full px-3 py-2.5 bg-white border border-black/10 rounded-lg text-sm focus:border-[#00754A] outline-none transition-all shadow-sm">
                                  {['Any', 'High Floor', 'Low Floor', 'Near Elevator', 'Quiet Room'].map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                              </div>
                              <div className="col-span-1">
                                <label className="block text-xs font-semibold text-black/60 mb-1.5">Bed Type</label>
                                <select value={wkBedType} onChange={e => setWkBedType(e.target.value)}
                                  className="w-full px-3 py-2.5 bg-white border border-black/10 rounded-lg text-sm focus:border-[#00754A] outline-none transition-all shadow-sm">
                                  {['Any', 'King Bed', 'Queen Bed', 'Twin Beds'].map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                              </div>
                              <div className="col-span-1 flex items-end">
                                <button className="w-full h-[42px] bg-[#f8f9fa] border border-black/10 hover:bg-black/5 text-black/80 font-bold rounded-lg text-sm transition-all shadow-sm">`;

const replacementStr = `                            <div className="grid grid-cols-5 gap-2 mb-4">
                              <div className="col-span-1">
                                <label className="block text-[11px] font-semibold text-black/60 mb-1">Room Type</label>
                                <select value={wkRoomType} onChange={e => { setWkRoomType(e.target.value); setWkRoomNumber(''); }}
                                  className="w-full px-2 py-1.5 bg-white border border-black/10 rounded-md text-[13px] focus:border-[#00754A] outline-none transition-all shadow-sm">
                                  {wkRoomTypes.map(rt => <option key={rt.id} value={rt.name}>{rt.name}</option>)}
                                </select>
                              </div>
                              <div className="col-span-1">
                                <label className="block text-[11px] font-semibold text-black/60 mb-1">Rate Plan</label>
                                <select value={wkRateCode} onChange={e => setWkRateCode(e.target.value)}
                                  className="w-full px-2 py-1.5 bg-white border border-black/10 rounded-md text-[13px] focus:border-[#00754A] outline-none transition-all shadow-sm">
                                  <option value="">Standard Rate</option>
                                  {wkRateCodes.map(rc => <option key={rc.id} value={rc.code}>{rc.name} ({rc.code})</option>)}
                                </select>
                              </div>
                              <div className="col-span-1">
                                <label className="block text-[11px] font-semibold text-black/60 mb-1">Room Preference</label>
                                <select value={wkRoomPreference} onChange={e => setWkRoomPreference(e.target.value)}
                                  className="w-full px-2 py-1.5 bg-white border border-black/10 rounded-md text-[13px] focus:border-[#00754A] outline-none transition-all shadow-sm">
                                  {['Any', 'High Floor', 'Low Floor', 'Near Elevator', 'Quiet Room'].map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                              </div>
                              <div className="col-span-1">
                                <label className="block text-[11px] font-semibold text-black/60 mb-1">Bed Type</label>
                                <select value={wkBedType} onChange={e => setWkBedType(e.target.value)}
                                  className="w-full px-2 py-1.5 bg-white border border-black/10 rounded-md text-[13px] focus:border-[#00754A] outline-none transition-all shadow-sm">
                                  {['Any', 'King Bed', 'Queen Bed', 'Twin Beds'].map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                              </div>
                              <div className="col-span-1 flex items-end">
                                <button className="w-full h-[32px] bg-[#f8f9fa] border border-black/10 hover:bg-black/5 text-black/80 font-bold rounded-md text-[13px] transition-all shadow-sm">`;

if (content.includes(targetStr)) {
  content = content.replace(targetStr, replacementStr);
  fs.writeFileSync('src/App.jsx', content, 'utf8');
  console.log('Successfully tightened paddings in the walk-in form.');
} else {
  console.log('Failed to find target string in src/App.jsx');
}
