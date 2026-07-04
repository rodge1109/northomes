const fs = require('fs');

let content = fs.readFileSync('src/App.jsx', 'utf8');

const walkinStart = content.indexOf(`              {/* ── Walk-In View ── */}`);
const roomsStart = content.indexOf(`              {/* ── Rooms View ── */}`);

if (walkinStart === -1 || roomsStart === -1) {
    console.error("Could not find start/end markers");
    process.exit(1);
}

const oldUI = content.substring(walkinStart, roomsStart);

const newUI = `              {/* ── Walk-In View ── */}
              {fdView === 'walkin' && (
                <div className="flex gap-6 h-full p-4 overflow-y-auto" style={{ background: '#f8f9fa' }}>
                  {wkSuccess && wkResult ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center w-full">
                      <div className="w-20 h-20 rounded-full bg-[#00754A]/20 border border-[#00754A]/30 flex items-center justify-center mb-6">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#00754A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                      </div>
                      <h3 className="text-3xl font-bold text-[#1E3932] mb-2">Reservation Complete!</h3>
                      <p className="text-lg text-black/60 mb-8">{wkResult.full_name} has been checked in successfully.</p>
                      <div className="bg-[#00754A]/10 border border-[#00754A]/20 rounded-2xl px-12 py-6 mb-6 w-full max-w-sm">
                        <div className="text-6xl font-mono font-black text-[#00754A]">{wkResult.room_number}</div>
                        <div className="text-sm text-[#00754A]/80 font-bold uppercase tracking-widest mt-2">Room Assigned</div>
                      </div>
                      <div className="text-sm text-black/60 mb-8 font-mono bg-white px-4 py-2 rounded-lg border border-black/5 shadow-sm">Confirmation #{wkResult.id}</div>
                      <button onClick={resetWalkin} className="w-full max-w-sm bg-[#00754A] hover:bg-[#006241] text-white font-bold py-4 rounded-xl shadow-md transition-all text-lg">
                        + New Walk-In Reservation
                      </button>
                    </div>
                  ) : (
                    <>
                      {/* LEFT FORM COLUMN */}
                      <div className="flex-1 min-w-0 flex flex-col gap-6">
                        {/* Header */}
                        <div>
                          <h2 className="text-2xl font-bold text-[#1E3932] mb-1">New Reservation</h2>
                          <p className="text-sm text-black/60">Create a new reservation</p>
                        </div>

                        {/* Section 1: Guest Information */}
                        <div className="bg-white rounded-2xl shadow-sm border border-black/5 p-7">
                          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-black/5">
                            <div className="w-8 h-8 rounded-full bg-[#1E3932] text-white flex items-center justify-center font-bold text-sm">1</div>
                            <h3 className="text-xl font-bold text-[#1E3932]">Guest Information</h3>
                          </div>
                          
                          <div className="mb-6">
                            <label className="block text-xs font-semibold text-black/60 mb-1.5">Search Existing Guest</label>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-black/40">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                              </span>
                              <input type="text" value={wkSearchGuest} onChange={e => setWkSearchGuest(e.target.value)} placeholder="Search by name, email or phone number"
                                className="w-full pl-10 pr-4 py-2.5 bg-[#f8f9fa] border border-black/10 rounded-lg text-sm focus:border-[#00754A] focus:ring-1 focus:ring-[#00754A] outline-none transition-all" />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-x-6 gap-y-5 mb-5">
                            <div>
                              <label className="block text-xs font-semibold text-black/60 mb-1.5">First Name *</label>
                              <input type="text" value={wkFirstName} onChange={e => setWkFirstName(e.target.value)} placeholder="Juan"
                                className="w-full px-3 py-2.5 bg-white border border-black/10 rounded-lg text-sm focus:border-[#00754A] outline-none transition-all shadow-sm" />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-black/60 mb-1.5">Last Name *</label>
                              <input type="text" value={wkLastName} onChange={e => setWkLastName(e.target.value)} placeholder="dela Cruz"
                                className="w-full px-3 py-2.5 bg-white border border-black/10 rounded-lg text-sm focus:border-[#00754A] outline-none transition-all shadow-sm" />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-black/60 mb-1.5">Email Address</label>
                              <input type="email" value={wkEmail} onChange={e => setWkEmail(e.target.value)} placeholder="juan@example.com"
                                className="w-full px-3 py-2.5 bg-white border border-black/10 rounded-lg text-sm focus:border-[#00754A] outline-none transition-all shadow-sm" />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-black/60 mb-1.5">Phone Number</label>
                              <div className="flex">
                                <div className="flex items-center gap-1.5 px-3 border border-r-0 border-black/10 rounded-l-lg bg-[#f8f9fa] text-sm text-black/70">
                                  <span>🇵🇭</span> <span>+63</span>
                                </div>
                                <input type="tel" value={wkPhone} onChange={e => setWkPhone(e.target.value)} placeholder="912 345 6789"
                                  className="flex-1 px-3 py-2.5 bg-white border border-black/10 rounded-r-lg text-sm focus:border-[#00754A] outline-none transition-all shadow-sm" />
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-xs font-semibold text-black/60 mb-1.5">ID Type</label>
                                <select value={wkIdType} onChange={e => setWkIdType(e.target.value)}
                                  className="w-full px-3 py-2.5 bg-white border border-black/10 rounded-lg text-sm focus:border-[#00754A] outline-none transition-all shadow-sm">
                                  {['Passport', "Driver's License", 'National ID', 'Other'].map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                              </div>
                              <div>
                                <label className="block text-xs font-semibold text-black/60 mb-1.5">ID / Passport No.</label>
                                <input type="text" value={wkIdNumber} onChange={e => setWkIdNumber(e.target.value)}
                                  className="w-full px-3 py-2.5 bg-white border border-black/10 rounded-lg text-sm font-mono focus:border-[#00754A] outline-none transition-all shadow-sm" />
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-xs font-semibold text-black/60 mb-1.5">Nationality</label>
                                <input type="text" value={wkNationality} onChange={e => setWkNationality(e.target.value)}
                                  className="w-full px-3 py-2.5 bg-white border border-black/10 rounded-lg text-sm focus:border-[#00754A] outline-none transition-all shadow-sm" />
                              </div>
                              <div>
                                <label className="block text-xs font-semibold text-black/60 mb-1.5">Date of Birth</label>
                                <input type="date" value={wkBirthDate} onChange={e => setWkBirthDate(e.target.value)}
                                  className="w-full px-3 py-2.5 bg-white border border-black/10 rounded-lg text-sm focus:border-[#00754A] outline-none transition-all shadow-sm" />
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-xs font-semibold text-black/60 mb-1.5">Gender</label>
                                <select value={wkGender} onChange={e => setWkGender(e.target.value)}
                                  className="w-full px-3 py-2.5 bg-white border border-black/10 rounded-lg text-sm focus:border-[#00754A] outline-none transition-all shadow-sm">
                                  {['Male', 'Female', 'Other'].map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                              </div>
                              <div>
                                <label className="block text-xs font-semibold text-black/60 mb-1.5">Address</label>
                                <input type="text" value={wkAddress} onChange={e => setWkAddress(e.target.value)}
                                  className="w-full px-3 py-2.5 bg-white border border-black/10 rounded-lg text-sm focus:border-[#00754A] outline-none transition-all shadow-sm" />
                              </div>
                            </div>
                            
                            <div>
                                <label className="block text-xs font-semibold text-black/60 mb-1.5">Company</label>
                                <input type="text" value={wkCompany} onChange={e => setWkCompany(e.target.value)}
                                  className="w-full px-3 py-2.5 bg-white border border-black/10 rounded-lg text-sm focus:border-[#00754A] outline-none transition-all shadow-sm" />
                            </div>
                          </div>

                          <div className="flex items-center gap-6 mt-4 pt-4 border-t border-black/5">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input type="checkbox" checked={wkAddToProfile} onChange={e => setWkAddToProfile(e.target.checked)} className="w-4 h-4 accent-[#00754A]" />
                              <span className="text-sm font-medium text-black/80">Add to guest profile</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input type="checkbox" checked={wkVipGuest} onChange={e => setWkVipGuest(e.target.checked)} className="w-4 h-4 accent-[#00754A]" />
                              <span className="bg-yellow-100 text-yellow-800 text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wider">VIP Guest</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input type="checkbox" checked={wkRepeatGuest} onChange={e => setWkRepeatGuest(e.target.checked)} className="w-4 h-4 accent-[#00754A]" />
                              <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wider">Repeat Guest</span>
                            </label>
                          </div>
                        </div>

                        {/* Section 2: Stay Information */}
                        <div className="bg-white rounded-2xl shadow-sm border border-black/5 p-7">
                          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-black/5">
                            <div className="w-8 h-8 rounded-full bg-[#1E3932] text-white flex items-center justify-center font-bold text-sm">2</div>
                            <h3 className="text-xl font-bold text-[#1E3932]">Stay Information</h3>
                          </div>
                          
                          <div className="grid grid-cols-5 gap-x-4 gap-y-5 mb-5">
                            <div className="col-span-2">
                              <label className="block text-xs font-semibold text-black/60 mb-1.5">Check-in Date *</label>
                              <div className="flex gap-2">
                                <input type="date" value={wkCheckIn} min={today} onChange={e => setWkCheckIn(e.target.value)}
                                  className="w-2/3 px-3 py-2.5 bg-white border border-black/10 rounded-lg text-sm focus:border-[#00754A] outline-none transition-all shadow-sm" />
                                <input type="time" value={wkCheckInTime} onChange={e => setWkCheckInTime(e.target.value)}
                                  className="w-1/3 px-3 py-2.5 bg-white border border-black/10 rounded-lg text-sm focus:border-[#00754A] outline-none transition-all shadow-sm" />
                              </div>
                            </div>
                            <div className="col-span-2">
                              <label className="block text-xs font-semibold text-black/60 mb-1.5">Check-out Date *</label>
                              <div className="flex gap-2">
                                <input type="date" value={wkCheckOut} min={wkCheckIn || today} onChange={e => setWkCheckOut(e.target.value)}
                                  className="w-2/3 px-3 py-2.5 bg-white border border-black/10 rounded-lg text-sm focus:border-[#00754A] outline-none transition-all shadow-sm" />
                                <input type="time" value={wkCheckOutTime} onChange={e => setWkCheckOutTime(e.target.value)}
                                  className="w-1/3 px-3 py-2.5 bg-white border border-black/10 rounded-lg text-sm focus:border-[#00754A] outline-none transition-all shadow-sm" />
                              </div>
                            </div>
                            <div className="col-span-1">
                              <label className="block text-xs font-semibold text-black/60 mb-1.5">Nights</label>
                              <div className="w-full px-3 py-2.5 bg-[#f8f9fa] border border-black/5 rounded-lg text-sm font-semibold text-black/70 flex items-center justify-center">
                                {(() => {
                                  if (!wkCheckIn || !wkCheckOut) return '-';
                                  const diff = Math.max(0, Math.ceil((new Date(wkCheckOut) - new Date(wkCheckIn)) / 86400000));
                                  return diff;
                                })()}
                              </div>
                            </div>
                            
                            <div>
                              <label className="block text-xs font-semibold text-black/60 mb-1.5">Adults</label>
                              <div className="flex items-center border border-black/10 rounded-lg overflow-hidden shadow-sm">
                                <button onClick={() => setWkAdults(Math.max(1, wkAdults-1))} className="w-8 h-9 bg-[#f8f9fa] hover:bg-black/5 flex items-center justify-center text-black/60 font-bold">-</button>
                                <input type="text" readOnly value={wkAdults} className="w-full h-9 text-center text-sm font-semibold outline-none" />
                                <button onClick={() => setWkAdults(wkAdults+1)} className="w-8 h-9 bg-[#f8f9fa] hover:bg-black/5 flex items-center justify-center text-black/60 font-bold">+</button>
                              </div>
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-black/60 mb-1.5">Children</label>
                              <div className="flex items-center border border-black/10 rounded-lg overflow-hidden shadow-sm">
                                <button onClick={() => setWkChildren(Math.max(0, wkChildren-1))} className="w-8 h-9 bg-[#f8f9fa] hover:bg-black/5 flex items-center justify-center text-black/60 font-bold">-</button>
                                <input type="text" readOnly value={wkChildren} className="w-full h-9 text-center text-sm font-semibold outline-none" />
                                <button onClick={() => setWkChildren(wkChildren+1)} className="w-8 h-9 bg-[#f8f9fa] hover:bg-black/5 flex items-center justify-center text-black/60 font-bold">+</button>
                              </div>
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-black/60 mb-1.5">Rooms</label>
                              <div className="flex items-center border border-black/10 rounded-lg overflow-hidden shadow-sm">
                                <button onClick={() => setWkNumRooms(Math.max(1, wkNumRooms-1))} className="w-8 h-9 bg-[#f8f9fa] hover:bg-black/5 flex items-center justify-center text-black/60 font-bold">-</button>
                                <input type="text" readOnly value={wkNumRooms} className="w-full h-9 text-center text-sm font-semibold outline-none" />
                                <button onClick={() => setWkNumRooms(wkNumRooms+1)} className="w-8 h-9 bg-[#f8f9fa] hover:bg-black/5 flex items-center justify-center text-black/60 font-bold">+</button>
                              </div>
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-black/60 mb-1.5">Purpose of Stay</label>
                              <select value={wkPurpose} onChange={e => setWkPurpose(e.target.value)}
                                className="w-full px-3 py-2.5 bg-white border border-black/10 rounded-lg text-sm focus:border-[#00754A] outline-none transition-all shadow-sm">
                                {['Leisure', 'Business', 'Event', 'Other'].map(t => <option key={t} value={t}>{t}</option>)}
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-black/60 mb-1.5">Source / Channel</label>
                              <select value={wkSource} onChange={e => setWkSource(e.target.value)}
                                className="w-full px-3 py-2.5 bg-white border border-black/10 rounded-lg text-sm focus:border-[#00754A] outline-none transition-all shadow-sm">
                                {['Direct Booking', 'Walk-in', 'OTA', 'Corporate', 'Agent'].map(t => <option key={t} value={t}>{t}</option>)}
                              </select>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-6">
                            <div>
                              <label className="block text-xs font-semibold text-black/60 mb-1.5">Special Requests</label>
                              <textarea rows="3" value={wkSpecialReq} onChange={e => setWkSpecialReq(e.target.value)} placeholder="Any special requests..."
                                className="w-full px-3 py-2.5 bg-white border border-black/10 rounded-lg text-sm focus:border-[#00754A] outline-none transition-all shadow-sm resize-none"></textarea>
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-black/60 mb-1.5">Remarks / Notes</label>
                              <textarea rows="3" value={wkNotes} onChange={e => setWkNotes(e.target.value)} placeholder="Internal remarks..."
                                className="w-full px-3 py-2.5 bg-white border border-black/10 rounded-lg text-sm focus:border-[#00754A] outline-none transition-all shadow-sm resize-none"></textarea>
                            </div>
                          </div>
                        </div>

                        {/* Section 3: Room & Rate */}
                        <div className="bg-white rounded-2xl shadow-sm border border-black/5 p-7">
                          <div className="flex items-center justify-between mb-6 pb-4 border-b border-black/5">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-[#1E3932] text-white flex items-center justify-center font-bold text-sm">3</div>
                              <h3 className="text-xl font-bold text-[#1E3932]">Room & Rate</h3>
                            </div>
                          </div>

                          <div className="grid grid-cols-4 gap-4 mb-5">
                            <div className="col-span-1">
                              <label className="block text-xs font-semibold text-black/60 mb-1.5">Room Type</label>
                              <select value={wkRoomType} onChange={e => { setWkRoomType(e.target.value); setWkRoomNumber(''); }}
                                className="w-full px-3 py-2.5 bg-white border border-black/10 rounded-lg text-sm focus:border-[#00754A] outline-none transition-all shadow-sm">
                                {wkRoomTypes.map(rt => <option key={rt.id} value={rt.name}>{rt.name}</option>)}
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
                              <button className="w-full h-[42px] bg-[#f8f9fa] border border-black/10 hover:bg-black/5 text-black/80 font-bold rounded-lg text-sm transition-all shadow-sm">
                                Check Availability
                              </button>
                            </div>
                          </div>

                          <div className="bg-[#f8f9fa] rounded-xl p-4 border border-black/5">
                            <table className="w-full text-left">
                              <thead>
                                <tr>
                                  <th className="pb-3 text-xs font-semibold text-black/60 w-[20%]">Room Number</th>
                                  <th className="pb-3 text-xs font-semibold text-black/60 w-[20%]">Rate (Per Night)</th>
                                  <th className="pb-3 text-xs font-semibold text-black/60 w-[35%]">Discount</th>
                                  <th className="pb-3 text-xs font-semibold text-black/60 text-right w-[25%]">Total (Per Night)</th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr>
                                  <td className="pr-2">
                                    <select value={wkRoomNumber} onChange={e => setWkRoomNumber(e.target.value)}
                                      className="w-full px-3 py-2 bg-white border border-black/10 rounded-lg text-sm font-semibold focus:border-[#00754A] outline-none shadow-sm">
                                      <option value="">Select...</option>
                                      {rooms.filter(r => r.room_type === wkRoomType && r.computed_status !== 'occupied' && r.computed_status !== 'arriving').map(r => (
                                        <option key={r.room_number} value={r.room_number}>{r.room_number}</option>
                                      ))}
                                    </select>
                                  </td>
                                  <td className="pr-2">
                                    {(() => {
                                      const rt = wkRoomTypes.find(r => r.name === wkRoomType);
                                      return <div className="text-sm font-semibold">₱{rt ? Number(rt.price_per_night).toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2}) : '0.00'}</div>;
                                    })()}
                                  </td>
                                  <td className="pr-2 flex gap-2">
                                    <div className="flex items-center bg-white border border-black/10 rounded-lg shadow-sm overflow-hidden flex-1">
                                      <input type="number" value={wkDiscountPct} onChange={e => setWkDiscountPct(e.target.value)} className="w-full px-2 py-2 text-sm text-center outline-none" />
                                      <span className="pr-2 text-sm text-black/60">%</span>
                                    </div>
                                    <input type="text" value={wkDiscountCode} onChange={e => setWkDiscountCode(e.target.value)} placeholder="Promo Code"
                                      className="w-2/3 px-3 py-2 bg-white border border-black/10 rounded-lg text-sm focus:border-[#00754A] outline-none shadow-sm uppercase placeholder:normal-case" />
                                  </td>
                                  <td className="text-right flex items-center justify-end gap-2">
                                    {(() => {
                                      const rt = wkRoomTypes.find(r => r.name === wkRoomType);
                                      const price = rt ? Number(rt.price_per_night) : 0;
                                      const disc = parseFloat(wkDiscountPct) || 0;
                                      const net = price * (1 - disc/100);
                                      return (
                                        <>
                                          <div className="text-sm font-bold text-[#1E3932]">₱{net.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}</div>
                                          <div className="w-5 h-5 rounded-full bg-[#00754A] flex items-center justify-center">
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                          </div>
                                        </>
                                      );
                                    })()}
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                            
                            <div className="mt-4 pt-4 border-t border-black/10 flex justify-between items-center text-sm">
                              {(() => {
                                const nights = (!wkCheckIn || !wkCheckOut) ? 0 : Math.max(0, Math.ceil((new Date(wkCheckOut) - new Date(wkCheckIn)) / 86400000));
                                const rt = wkRoomTypes.find(r => r.name === wkRoomType);
                                const price = rt ? Number(rt.price_per_night) : 0;
                                const disc = parseFloat(wkDiscountPct) || 0;
                                const netPerNight = price * (1 - disc/100);
                                const subTotal = netPerNight * nights * wkNumRooms;
                                const tax = subTotal * 0.12;
                                const total = subTotal + tax;
                                return (
                                  <>
                                    <div className="font-semibold text-black/60">Total Nights: <span className="text-[#1E3932]">{nights}</span></div>
                                    <div className="flex gap-6">
                                      <div className="text-black/60">Sub Total: <span className="font-semibold text-black/80 ml-1">₱{subTotal.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}</span></div>
                                      <div className="text-black/60">Taxes & Fees: <span className="font-semibold text-black/80 ml-1">₱{tax.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}</span></div>
                                      <div className="text-[#1E3932] font-bold text-base">Estimated Total: <span className="ml-1">₱{total.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}</span></div>
                                    </div>
                                  </>
                                );
                              })()}
                            </div>
                          </div>
                        </div>

                        {/* Section 4: Payment & Guarantee */}
                        <div className="bg-white rounded-2xl shadow-sm border border-black/5 p-7">
                          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-black/5">
                            <div className="w-8 h-8 rounded-full bg-[#1E3932] text-white flex items-center justify-center font-bold text-sm">4</div>
                            <h3 className="text-xl font-bold text-[#1E3932]">Payment & Guarantee</h3>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-8">
                            {/* Left: Payment details */}
                            <div>
                              <div className="mb-4">
                                <label className="block text-xs font-semibold text-black/60 mb-1.5">Payment Method</label>
                                <select value={wkPaymentMethod} onChange={e => setWkPaymentMethod(e.target.value)}
                                  className="w-full px-3 py-2.5 bg-white border border-black/10 rounded-lg text-sm focus:border-[#00754A] outline-none transition-all shadow-sm">
                                  {['Credit Card', 'Cash', 'Bank Transfer', 'Other'].map(m => <option key={m} value={m}>{m}</option>)}
                                </select>
                              </div>
                              
                              {wkPaymentMethod === 'Credit Card' && (
                                <div className="space-y-4">
                                  <div className="flex gap-4">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                      <input type="radio" name="cardType" checked={wkCardType==='Visa'} onChange={() => setWkCardType('Visa')} className="accent-[#00754A]" /> <span className="text-sm font-semibold">Visa</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                      <input type="radio" name="cardType" checked={wkCardType==='Mastercard'} onChange={() => setWkCardType('Mastercard')} className="accent-[#00754A]" /> <span className="text-sm font-semibold">Mastercard</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                      <input type="radio" name="cardType" checked={wkCardType==='Amex'} onChange={() => setWkCardType('Amex')} className="accent-[#00754A]" /> <span className="text-sm font-semibold">Amex</span>
                                    </label>
                                  </div>
                                  
                                  <div>
                                    <label className="block text-xs font-semibold text-black/60 mb-1.5">Card Number</label>
                                    <input type="text" value={wkCardNumberFull} onChange={e => setWkCardNumberFull(e.target.value)} placeholder="0000 0000 0000 0000"
                                      className="w-full px-3 py-2.5 bg-white border border-black/10 rounded-lg text-sm font-mono focus:border-[#00754A] outline-none transition-all shadow-sm" />
                                  </div>
                                  
                                  <div className="flex gap-4">
                                    <div className="w-1/2">
                                      <label className="block text-xs font-semibold text-black/60 mb-1.5">Expiry Date</label>
                                      <input type="text" value={wkCardExpiry} onChange={e => setWkCardExpiry(e.target.value)} placeholder="MM/YY"
                                        className="w-full px-3 py-2.5 bg-white border border-black/10 rounded-lg text-sm font-mono focus:border-[#00754A] outline-none transition-all shadow-sm" />
                                    </div>
                                    <div className="w-1/2">
                                      <label className="block text-xs font-semibold text-black/60 mb-1.5">CVV</label>
                                      <input type="text" value={wkCardCvv} onChange={e => setWkCardCvv(e.target.value)} placeholder="123"
                                        className="w-full px-3 py-2.5 bg-white border border-black/10 rounded-lg text-sm font-mono focus:border-[#00754A] outline-none transition-all shadow-sm" />
                                    </div>
                                  </div>
                                  
                                  <div>
                                    <label className="block text-xs font-semibold text-black/60 mb-1.5">Cardholder Name</label>
                                    <input type="text" value={wkCardholder} onChange={e => setWkCardholder(e.target.value)} placeholder="Juan dela Cruz"
                                      className="w-full px-3 py-2.5 bg-white border border-black/10 rounded-lg text-sm focus:border-[#00754A] outline-none transition-all shadow-sm" />
                                  </div>
                                </div>
                              )}
                            </div>
                            
                            {/* Right: Guarantee */}
                            <div>
                              <div className="mb-4">
                                <label className="block text-xs font-semibold text-black/60 mb-1.5">Guarantee Type</label>
                                <select value={wkGuaranteeType} onChange={e => setWkGuaranteeType(e.target.value)}
                                  className="w-full px-3 py-2.5 bg-white border border-black/10 rounded-lg text-sm focus:border-[#00754A] outline-none transition-all shadow-sm">
                                  {['Guarantee by Credit Card', 'Company Guarantee', 'Deposit Paid', 'Non-Guaranteed'].map(m => <option key={m} value={m}>{m}</option>)}
                                </select>
                              </div>
                              <div className="mb-6">
                                <label className="block text-xs font-semibold text-black/60 mb-1.5">Amount Guaranteed</label>
                                <div className="relative">
                                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-black/60 font-semibold">₱</span>
                                  <input type="number" value={wkGuaranteeAmount} onChange={e => setWkGuaranteeAmount(e.target.value)} placeholder="0.00"
                                    className="w-full pl-8 pr-3 py-2.5 bg-white border border-black/10 rounded-lg text-sm focus:border-[#00754A] outline-none transition-all shadow-sm" />
                                </div>
                              </div>
                              <div className="pt-4 border-t border-black/5">
                                <label className="flex items-center gap-2 cursor-pointer">
                                  <input type="checkbox" checked={wkSendConfirmEmail} onChange={e => setWkSendConfirmEmail(e.target.checked)} className="w-4 h-4 accent-[#00754A]" />
                                  <span className="text-sm font-medium text-black/80">Send confirmation email to guest</span>
                                </label>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Error message */}
                        {wkError && (
                          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded shadow-sm text-red-700 text-sm font-medium mb-4">
                            {wkError}
                          </div>
                        )}
                        <div className="h-4"></div>
                      </div>

                      {/* RIGHT SIDEBAR */}
                      <div className="w-[340px] xl:w-[380px] flex-shrink-0 flex flex-col gap-5">
                        
                        {/* Status tag */}
                        <div className="flex justify-end mb-1">
                          <span className="bg-[#1E3932]/10 text-[#1E3932] font-bold text-[11px] px-3 py-1.5 rounded-full uppercase tracking-wider">Walk-in Reservation</span>
                        </div>
                        
                        {/* Reservation Summary */}
                        <div className="bg-white rounded-2xl shadow-sm border border-black/5 overflow-hidden">
                          <div className="bg-[#1E3932] text-white p-4">
                            <h3 className="font-bold text-lg mb-1">Reservation Summary</h3>
                            <p className="text-white/70 text-xs">Review details before confirming</p>
                          </div>
                          
                          <div className="p-5">
                            <div className="flex gap-4 pb-4 border-b border-black/5">
                              <div className="w-12 h-12 rounded-full bg-[#f8f9fa] border border-black/10 flex items-center justify-center flex-shrink-0 text-[#1E3932]">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                              </div>
                              <div>
                                <div className="text-xs text-black/50 font-semibold mb-0.5">Guest Name</div>
                                <div className="font-bold text-[#1E3932] leading-tight text-lg">{(wkFirstName || wkLastName) ? \`\${wkFirstName} \${wkLastName}\` : 'Pending'}</div>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-y-4 gap-x-2 py-4 border-b border-black/5">
                              <div>
                                <div className="text-[10px] uppercase tracking-wider text-black/50 font-bold mb-1">Check-in</div>
                                <div className="font-semibold text-sm">{wkCheckIn ? new Date(wkCheckIn).toLocaleDateString('en-US', {month:'short', day:'numeric', year:'numeric'}) : '-'}</div>
                              </div>
                              <div>
                                <div className="text-[10px] uppercase tracking-wider text-black/50 font-bold mb-1">Check-out</div>
                                <div className="font-semibold text-sm">{wkCheckOut ? new Date(wkCheckOut).toLocaleDateString('en-US', {month:'short', day:'numeric', year:'numeric'}) : '-'}</div>
                              </div>
                              <div>
                                <div className="text-[10px] uppercase tracking-wider text-black/50 font-bold mb-1">Nights</div>
                                <div className="font-semibold text-sm">{(!wkCheckIn || !wkCheckOut) ? '-' : Math.max(0, Math.ceil((new Date(wkCheckOut) - new Date(wkCheckIn)) / 86400000))}</div>
                              </div>
                              <div>
                                <div className="text-[10px] uppercase tracking-wider text-black/50 font-bold mb-1">Room Type</div>
                                <div className="font-semibold text-sm">{wkRoomType || '-'}</div>
                              </div>
                              <div>
                                <div className="text-[10px] uppercase tracking-wider text-black/50 font-bold mb-1">Room No.</div>
                                <div className="font-semibold text-sm">{wkRoomNumber || '-'}</div>
                              </div>
                              <div>
                                <div className="text-[10px] uppercase tracking-wider text-black/50 font-bold mb-1">Guests</div>
                                <div className="font-semibold text-sm">{wkAdults} Adults{wkChildren > 0 ? \`, \${wkChildren} Children\` : ''}</div>
                              </div>
                              <div className="col-span-2">
                                <div className="text-[10px] uppercase tracking-wider text-black/50 font-bold mb-1">Rate Plan</div>
                                <div className="font-semibold text-sm text-[#00754A]">{wkRateCode || 'Standard Rate'}</div>
                              </div>
                            </div>
                            
                            <div className="pt-4 space-y-2">
                              {(() => {
                                const nights = (!wkCheckIn || !wkCheckOut) ? 0 : Math.max(0, Math.ceil((new Date(wkCheckOut) - new Date(wkCheckIn)) / 86400000));
                                const rt = wkRoomTypes.find(r => r.name === wkRoomType);
                                const price = rt ? Number(rt.price_per_night) : 0;
                                const disc = parseFloat(wkDiscountPct) || 0;
                                const netPerNight = price * (1 - disc/100);
                                const subTotal = netPerNight * nights * wkNumRooms;
                                const tax = subTotal * 0.12;
                                const total = subTotal + tax;
                                return (
                                  <>
                                    <div className="flex justify-between text-sm">
                                      <span className="text-black/60">Sub Total</span>
                                      <span className="font-semibold">₱{subTotal.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                      <span className="text-black/60">Taxes & Fees (12%)</span>
                                      <span className="font-semibold">₱{tax.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}</span>
                                    </div>
                                    <div className="flex justify-between text-lg font-bold pt-2 border-t border-black/5 mt-1 text-[#1E3932]">
                                      <span>Estimated Total</span>
                                      <span>₱{total.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}</span>
                                    </div>
                                  </>
                                );
                              })()}
                            </div>
                          </div>
                        </div>
                        
                        {/* Room Availability */}
                        <div className="bg-white rounded-2xl shadow-sm border border-black/5 overflow-hidden flex flex-col" style={{maxHeight: '300px'}}>
                          <div className="p-4 border-b border-black/5 flex justify-between items-center bg-[#f8f9fa]">
                            <h3 className="font-bold text-[#1E3932]">Room Availability</h3>
                            <div className="text-xs font-semibold text-black/50 bg-white px-2 py-1 rounded shadow-sm border border-black/5">
                              {wkCheckIn ? new Date(wkCheckIn).toLocaleDateString('en-US', {month:'short', day:'numeric'}) : '-'}
                              {wkCheckOut && wkCheckOut !== wkCheckIn ? \` - \${new Date(wkCheckOut).toLocaleDateString('en-US', {month:'short', day:'numeric'})}\` : ''}
                            </div>
                          </div>
                          
                          <div className="overflow-y-auto p-4 flex-1">
                            <table className="w-full text-left text-sm">
                              <thead>
                                <tr>
                                  <th className="pb-2 text-xs font-semibold text-black/50 uppercase tracking-wider">Room Type</th>
                                  <th className="pb-2 text-xs font-semibold text-black/50 uppercase tracking-wider text-center">Avail</th>
                                  <th className="pb-2 text-xs font-semibold text-black/50 uppercase tracking-wider text-right">Rate</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-black/5">
                                {wkRoomTypes.map(rt => {
                                  const avail = rt.available !== undefined ? rt.available : rt.total_rooms;
                                  const selected = rt.name === wkRoomType;
                                  return (
                                    <tr key={rt.id} className={selected ? 'bg-[#00754A]/5' : ''} onClick={() => setWkRoomType(rt.name)} style={{cursor: 'pointer'}}>
                                      <td className="py-2.5 font-medium flex items-center gap-2">
                                        {rt.name}
                                        {selected && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#00754A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                                      </td>
                                      <td className="py-2.5 text-center">
                                        <span className={\`inline-flex w-6 h-6 items-center justify-center rounded-full text-xs font-bold \${avail > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}\`}>
                                          {avail}
                                        </span>
                                      </td>
                                      <td className="py-2.5 text-right font-semibold">
                                        ₱{Number(rt.price_per_night).toLocaleString()}
                                      </td>
                                    </tr>
                                  );
                                })}
                                {wkRoomTypes.length === 0 && (
                                  <tr><td colSpan="3" className="py-4 text-center text-black/50 text-xs">No rooms available for selected dates</td></tr>
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-3 mt-auto">
                          <button className="w-full py-3 rounded-xl border border-[#1E3932] text-[#1E3932] font-bold hover:bg-[#1E3932]/5 transition-all text-sm">
                            Save as Draft
                          </button>
                          <button onClick={resetWalkin} className="w-full py-3 rounded-xl text-black/60 font-semibold hover:text-black/80 hover:bg-black/5 transition-all text-sm">
                            Clear Form
                          </button>
                          <button onClick={submitWalkin} disabled={wkSubmitting}
                            className="w-full bg-gradient-to-br from-[#00754A] to-[#005a38] hover:shadow-lg disabled:opacity-70 text-white font-bold py-4 rounded-xl transition-all shadow-md mt-1 text-base relative overflow-hidden">
                            {wkSubmitting ? 'Processing...' : 'Create Reservation'}
                            {!wkSubmitting && <div className="absolute inset-0 bg-white/20 hover:opacity-100 opacity-0 transition-opacity"></div>}
                          </button>
                        </div>
                        
                      </div>
                    </>
                  )}
                </div>
              )}
`;

const newFileContent = content.substring(0, walkinStart) + newUI + content.substring(roomsStart);
fs.writeFileSync('src/App.jsx', newFileContent, 'utf8');
console.log('UI patch successful');
