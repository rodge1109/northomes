function ManagerDailyReportUI({ data }) {
  if (!data || !data.kpi) return null;
  return (
    <div className=\\\"bg-[#f8f9fa] text-[#333333] font-sans print:bg-white pb-12\\\">
      <div className=\\\"grid grid-cols-4 gap-4 mb-6\\\">
        <div className=\\\"bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center print:border-gray-300\\\">
          <div className=\\\"w-12 h-12 rounded-full bg-green-100 text-green-700 flex items-center justify-center mr-4 shrink-0\\\">
             <svg width=\\\"24\\\" height=\\\"24\\\" viewBox=\\\"0 0 24 24\\\" fill=\\\"none\\\" stroke=\\\"currentColor\\\" strokeWidth=\\\"2\\\"><path d=\\\"M2 4v16M2 8h18a2 2 0 0 1 2 2v10M2 17h20M6 8v9\\\"/></svg>
          </div>
          <div className=\\\"min-w-0\\\">
            <div className=\\\"text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 truncate\\\">Occupancy</div>
            <div className=\\\"text-2xl font-black text-gray-800 truncate\\\">{data.kpi?.occupancy}%</div>
            <div className=\\\"text-xs font-medium text-gray-500 mt-1 truncate\\\">{data.kpi?.occupiedRooms} / {data.kpi?.totalRooms} Rooms</div>
          </div>
        </div>
        <div className=\\\"bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center print:border-gray-300\\\">
          <div className=\\\"w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mr-4 shrink-0\\\">
             <svg width=\\\"24\\\" height=\\\"24\\\" viewBox=\\\"0 0 24 24\\\" fill=\\\"none\\\" stroke=\\\"currentColor\\\" strokeWidth=\\\"2\\\"><rect x=\\\"4\\\" y=\\\"2\\\" width=\\\"16\\\" height=\\\"20\\\" rx=\\\"2\\\" ry=\\\"2\\\"/><path d=\\\"M9 22v-4h6v4M8 6h.01M16 6h.01M12 6h.01M12 10h.01M16 10h.01M8 10h.01M8 14h.01M12 14h.01M16 14h.01\\\"/></svg>
          </div>
          <div className=\\\"min-w-0\\\">
            <div className=\\\"text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 truncate\\\">ADR</div>
            <div className=\\\"text-2xl font-black text-gray-800 truncate\\\">₱{data.kpi?.adr?.toLocaleString(undefined, {minimumFractionDigits: 2})}</div>
            <div className=\\\"text-xs font-medium text-gray-500 mt-1 truncate\\\">Average Daily Rate</div>
          </div>
        </div>
        <div className=\\\"bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center print:border-gray-300\\\">
          <div className=\\\"w-12 h-12 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center mr-4 shrink-0\\\">
             <svg width=\\\"24\\\" height=\\\"24\\\" viewBox=\\\"0 0 24 24\\\" fill=\\\"none\\\" stroke=\\\"currentColor\\\" strokeWidth=\\\"2\\\"><polyline points=\\\"22 12 18 12 15 21 9 3 6 12 2 12\\\"/></svg>
          </div>
          <div className=\\\"min-w-0\\\">
            <div className=\\\"text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 truncate\\\">REVPAR</div>
            <div className=\\\"text-2xl font-black text-gray-800 truncate\\\">₱{data.kpi?.revpar?.toLocaleString(undefined, {minimumFractionDigits: 2})}</div>
            <div className=\\\"text-xs font-medium text-gray-500 mt-1 truncate\\\">Rev. per Available Rm</div>
          </div>
        </div>
        <div className=\\\"bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center print:border-gray-300\\\">
          <div className=\\\"w-12 h-12 rounded-full bg-orange-100 text-orange-500 flex items-center justify-center mr-4 shrink-0\\\">
             <svg width=\\\"24\\\" height=\\\"24\\\" viewBox=\\\"0 0 24 24\\\" fill=\\\"none\\\" stroke=\\\"currentColor\\\" strokeWidth=\\\"2\\\"><circle cx=\\\"12\\\" cy=\\\"12\\\" r=\\\"10\\\"/><path d=\\\"M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8M12 18V6\\\"/></svg>
          </div>
          <div className=\\\"min-w-0\\\">
            <div className=\\\"text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 truncate\\\">TOTAL REVENUE</div>
            <div className=\\\"text-2xl font-black text-gray-800 truncate\\\">₱{data.kpi?.totalRevenue?.toLocaleString(undefined, {minimumFractionDigits: 2})}</div>
            <div className=\\\"text-xs font-medium text-gray-500 mt-1 truncate\\\">Room + Other Revenue</div>
          </div>
        </div>
      </div>
      
      <div className=\\\"grid grid-cols-3 gap-6 mb-6\\\">
        <div className=\\\"bg-white p-6 rounded-xl border border-gray-100 shadow-sm print:border-gray-300\\\">
          <h3 className=\\\"text-[11px] font-black text-gray-800 tracking-wider uppercase mb-5\\\">ROOM STATISTICS</h3>
          <div className=\\\"space-y-4 text-sm font-medium\\\">
            <div className=\\\"flex justify-between items-center\\\"><span className=\\\"text-gray-500\\\">Total Rooms</span><span className=\\\"font-bold text-gray-800\\\">{data.roomStatistics?.totalRooms}</span></div>
            <div className=\\\"flex justify-between items-center\\\"><span className=\\\"text-gray-500\\\">Available Rooms</span><span className=\\\"font-bold text-blue-600\\\">{data.roomStatistics?.availableRooms}</span></div>
            <div className=\\\"flex justify-between items-center\\\"><span className=\\\"text-gray-500\\\">Occupied Rooms</span><span className=\\\"font-bold text-green-600\\\">{data.roomStatistics?.occupiedRooms}</span></div>
            <div className=\\\"flex justify-between items-center\\\"><span className=\\\"text-gray-500\\\">Out of Order</span><span className=\\\"font-bold text-orange-500\\\">{data.roomStatistics?.outOfOrderRooms}</span></div>
            <div className=\\\"flex justify-between items-center\\\"><span className=\\\"text-gray-500\\\">Due Out</span><span className=\\\"font-bold text-red-600\\\">{data.roomStatistics?.dueOut}</span></div>
            <div className=\\\"pt-2 border-t border-gray-100 flex justify-between items-center\\\"><span className=\\\"text-gray-700 font-bold\\\">Occupancy %</span><span className=\\\"font-black text-gray-900\\\">{data.roomStatistics?.occupancyPercentage}%</span></div>
          </div>
        </div>
        <div className=\\\"bg-white p-6 rounded-xl border border-gray-100 shadow-sm print:border-gray-300\\\">
          <h3 className=\\\"text-[11px] font-black text-gray-800 tracking-wider uppercase mb-5\\\">ARRIVALS & DEPARTURES</h3>
          <div className=\\\"grid grid-cols-2 gap-4 mb-4\\\">
             <div className=\\\"flex items-center\\\">
                <div className=\\\"w-10 h-10 rounded-full bg-green-50 text-green-700 flex items-center justify-center mr-3\\\">
                   <svg width=\\\"20\\\" height=\\\"20\\\" viewBox=\\\"0 0 24 24\\\" fill=\\\"none\\\" stroke=\\\"currentColor\\\" strokeWidth=\\\"2\\\"><path d=\\\"M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3\\\"/></svg>
                </div>
                <div>
                   <div className=\\\"text-[9px] font-bold text-gray-400 uppercase tracking-widest\\\">ARRIVALS</div>
                   <div className=\\\"text-xl font-black text-gray-800\\\">{data.arrivalsDepartures?.arrivals}</div>
                </div>
             </div>
             <div className=\\\"flex items-center\\\">
                <div className=\\\"w-10 h-10 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center mr-3\\\">
                   <svg width=\\\"20\\\" height=\\\"20\\\" viewBox=\\\"0 0 24 24\\\" fill=\\\"none\\\" stroke=\\\"currentColor\\\" strokeWidth=\\\"2\\\"><path d=\\\"M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9\\\"/></svg>
                </div>
                <div>
                   <div className=\\\"text-[9px] font-bold text-gray-400 uppercase tracking-widest\\\">DEPARTURES</div>
                   <div className=\\\"text-xl font-black text-gray-800\\\">{data.arrivalsDepartures?.departures}</div>
                </div>
             </div>
          </div>
          <div className=\\\"grid grid-cols-2 gap-x-6 gap-y-3 text-xs mt-6\\\">
             <div className=\\\"flex justify-between\\\"><span className=\\\"text-gray-500\\\">Walk-in</span><span className=\\\"font-bold text-gray-800\\\">{data.arrivalsDepartures?.walkIn}</span></div>
             <div className=\\\"flex justify-between\\\"><span className=\\\"text-gray-500\\\">On Time</span><span className=\\\"font-bold text-gray-800\\\">{data.arrivalsDepartures?.onTime}</span></div>
             <div className=\\\"flex justify-between\\\"><span className=\\\"text-gray-500\\\">Reservations</span><span className=\\\"font-bold text-gray-800\\\">{data.arrivalsDepartures?.reservations}</span></div>
             <div className=\\\"flex justify-between\\\"><span className=\\\"text-gray-500\\\">Late Check-out</span><span className=\\\"font-bold text-gray-800\\\">{data.arrivalsDepartures?.lateCheckout}</span></div>
             <div className=\\\"flex justify-between\\\"><span className=\\\"text-gray-500\\\">VIP Arrivals</span><span className=\\\"font-bold text-gray-800\\\">{data.arrivalsDepartures?.vipArrivals}</span></div>
             <div className=\\\"flex justify-between\\\"><span className=\\\"text-gray-500\\\">Early Check-out</span><span className=\\\"font-bold text-gray-800\\\">{data.arrivalsDepartures?.earlyCheckout}</span></div>
          </div>
        </div>
        <div className=\\\"bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col print:border-gray-300\\\">
          <h3 className=\\\"text-[11px] font-black text-gray-800 tracking-wider uppercase mb-5\\\">GUESTS IN HOUSE</h3>
          <div className=\\\"text-5xl font-black text-gray-800 mb-8 mt-2\\\">{data.guestsInHouse?.total}</div>
          <div className=\\\"space-y-4 text-sm font-medium mt-auto\\\">
            <div className=\\\"flex justify-between items-center\\\"><span className=\\\"text-gray-500\\\">Adults</span><span className=\\\"font-bold text-gray-800\\\">{data.guestsInHouse?.adults}</span></div>
            <div className=\\\"flex justify-between items-center\\\"><span className=\\\"text-gray-500\\\">Children</span><span className=\\\"font-bold text-gray-800\\\">{data.guestsInHouse?.children}</span></div>
            <div className=\\\"pt-4 border-t border-gray-100 flex justify-between items-center\\\"><span className=\\\"text-gray-700 font-bold\\\">No. of Rooms</span><span className=\\\"font-black text-gray-900\\\">{data.guestsInHouse?.noOfRooms}</span></div>
          </div>
        </div>
      </div>

      <div className=\\\"grid grid-cols-[3fr_2fr] gap-6 mb-6\\\">
        <div className=\\\"bg-white p-6 rounded-xl border border-gray-100 shadow-sm print:border-gray-300\\\">
           <h3 className=\\\"text-[11px] font-black text-gray-800 tracking-wider uppercase mb-5\\\">REVENUE SUMMARY (TODAY)</h3>
           <table className=\\\"w-full text-left text-[13px]\\\">
             <thead>
               <tr className=\\\"text-[10px] font-black text-gray-400 uppercase tracking-wider border-b border-gray-100\\\">
                 <th className=\\\"pb-3 w-1/2\\\">DEPARTMENT</th>
                 <th className=\\\"pb-3 text-right\\\">REVENUE (₱)</th>
                 <th className=\\\"pb-3 text-right\\\">% OF TOTAL</th>
               </tr>
             </thead>
             <tbody className=\\\"divide-y divide-gray-50\\\">
               {data.revenueSummary?.map((item, i) => (
                 <tr key={i} className=\\\"hover:bg-gray-50\\\">
                   <td className=\\\"py-3 font-medium text-gray-600\\\">{item.department}</td>
                   <td className=\\\"py-3 text-right font-medium text-gray-800\\\">{item.revenue.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                   <td className=\\\"py-3 text-right font-bold text-gray-500\\\">{item.pct}%</td>
                 </tr>
               ))}
               <tr className=\\\"bg-gray-50/50\\\">
                 <td className=\\\"py-3 font-bold text-green-700\\\">TOTAL REVENUE</td>
                 <td className=\\\"py-3 text-right font-bold text-green-700\\\">{data.kpi?.totalRevenue?.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                 <td className=\\\"py-3 text-right font-bold text-green-700\\\">100%</td>
               </tr>
             </tbody>
           </table>
        </div>
        <div className=\\\"bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col print:border-gray-300\\\">
           <h3 className=\\\"text-[11px] font-black text-gray-800 tracking-wider uppercase mb-5\\\">REVENUE BREAKDOWN</h3>
           <div className=\\\"flex-1 flex items-center justify-between gap-8 mt-4\\\">
             <div className=\\\"relative w-40 h-40 shrink-0\\\">
               <svg viewBox=\\\"0 0 100 100\\\" className=\\\"w-full h-full transform -rotate-90\\\">
                 {(() => {
                   let currentOffset = 0;
                   return data.revenueSummary?.map((item, i) => {
                     const val = parseFloat(item.pct);
                     const dasharray = \`\${val} \${100 - val}\`;
                     const offset = currentOffset;
                     currentOffset -= val;
                     return (
                       <circle
                         key={i}
                         cx=\\\"50\\\" cy=\\\"50\\\" r=\\\"15.91549430918954\\\"
                         fill=\\\"transparent\\\"
                         stroke={item.color}
                         strokeWidth=\\\"8\\\"
                         strokeDasharray={dasharray}
                         strokeDashoffset={offset}
                       />
                     );
                   });
                 })()}
                 <circle cx=\\\"50\\\" cy=\\\"50\\\" r=\\\"11\\\" fill=\\\"white\\\" />
               </svg>
               <div className=\\\"absolute inset-0 flex flex-col items-center justify-center pt-1\\\">
                 <span className=\\\"text-[13px] font-black text-gray-800\\\">₱{data.kpi?.totalRevenue?.toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
                 <span className=\\\"text-[7px] font-medium text-gray-500\\\">Total Revenue</span>
               </div>
             </div>
             <div className=\\\"flex-1 space-y-3 text-[10px] font-medium text-gray-600\\\">
               {data.revenueSummary?.map((item, i) => (
                 <div key={i} className=\\\"flex items-center justify-between\\\">
                   <div className=\\\"flex items-center\\\">
                     <span className=\\\"w-2 h-2 rounded-full mr-2\\\" style={{ backgroundColor: item.color }}></span>
                     {item.department}
                   </div>
                   <span className=\\\"text-gray-500\\\">{item.pct}%</span>
                 </div>
               ))}
             </div>
           </div>
        </div>
      </div>

      <div className=\\\"grid grid-cols-3 gap-6 mb-6\\\">
        <div className=\\\"bg-white p-6 rounded-xl border border-gray-100 shadow-sm print:border-gray-300\\\">
           <h3 className=\\\"text-[11px] font-black text-gray-800 tracking-wider uppercase mb-5\\\">ROOM TYPES PERFORMANCE</h3>
           <table className=\\\"w-full text-left text-[11px]\\\">
             <thead>
               <tr className=\\\"text-[9px] font-black text-gray-400 uppercase tracking-wider border-b border-gray-100\\\">
                 <th className=\\\"pb-3 w-1/3\\\">ROOM TYPE</th>
                 <th className=\\\"pb-3 text-right\\\">OCC</th>
                 <th className=\\\"pb-3 text-right\\\">AVAIL</th>
                 <th className=\\\"pb-3 text-right\\\">OCC.%</th>
                 <th className=\\\"pb-3 text-right\\\">ADR (₱)</th>
               </tr>
             </thead>
             <tbody className=\\\"divide-y divide-gray-50\\\">
               {data.roomTypesPerformance?.map((rt, i) => (
                 <tr key={i} className=\\\"hover:bg-gray-50\\\">
                   <td className=\\\"py-2.5 font-medium text-gray-600\\\">{rt.roomType}</td>
                   <td className=\\\"py-2.5 text-right font-medium text-gray-800\\\">{rt.occupied}</td>
                   <td className=\\\"py-2.5 text-right font-medium text-gray-800\\\">{rt.available}</td>
                   <td className=\\\"py-2.5 text-right font-bold text-gray-500\\\">{rt.occPct}%</td>
                   <td className=\\\"py-2.5 text-right font-medium text-gray-800\\\">{parseFloat(rt.adr).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                 </tr>
               ))}
               <tr className=\\\"bg-gray-50/50\\\">
                 <td className=\\\"py-2.5 font-bold text-green-700\\\">TOTAL</td>
                 <td className=\\\"py-2.5 text-right font-bold text-green-700\\\">{data.kpi?.occupiedRooms}</td>
                 <td className=\\\"py-2.5 text-right font-bold text-green-700\\\">{data.roomStatistics?.availableRooms}</td>
                 <td className=\\\"py-2.5 text-right font-bold text-green-700\\\">{data.kpi?.occupancy}%</td>
                 <td className=\\\"py-2.5 text-right font-bold text-green-700\\\">{data.kpi?.adr?.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
               </tr>
             </tbody>
           </table>
        </div>
        <div className=\\\"bg-white p-6 rounded-xl border border-gray-100 shadow-sm print:border-gray-300\\\">
           <h3 className=\\\"text-[11px] font-black text-gray-800 tracking-wider uppercase mb-5\\\">PAYMENT SUMMARY (TODAY)</h3>
           <table className=\\\"w-full text-left text-[11px]\\\">
             <thead>
               <tr className=\\\"text-[9px] font-black text-gray-400 uppercase tracking-wider border-b border-gray-100\\\">
                 <th className=\\\"pb-3 w-1/2\\\">PAYMENT METHOD</th>
                 <th className=\\\"pb-3 text-right\\\">AMOUNT (₱)</th>
                 <th className=\\\"pb-3 text-right\\\">%</th>
               </tr>
             </thead>
             <tbody className=\\\"divide-y divide-gray-50\\\">
               {data.paymentSummary?.map((ps, i) => (
                 <tr key={i} className=\\\"hover:bg-gray-50\\\">
                   <td className=\\\"py-2.5 font-medium text-gray-600\\\">{ps.method}</td>
                   <td className=\\\"py-2.5 text-right font-medium text-gray-800\\\">{ps.amount.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                   <td className=\\\"py-2.5 text-right font-bold text-gray-500\\\">{(data.kpi?.totalRevenue ? (ps.amount / data.kpi.totalRevenue * 100) : 0).toFixed(1)}%</td>
                 </tr>
               ))}
               <tr className=\\\"bg-gray-50/50\\\">
                 <td className=\\\"py-2.5 font-bold text-green-700\\\">TOTAL PAYMENTS</td>
                 <td className=\\\"py-2.5 text-right font-bold text-green-700\\\">{data.kpi?.totalRevenue?.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                 <td className=\\\"py-2.5 text-right font-bold text-green-700\\\">100%</td>
               </tr>
             </tbody>
           </table>
        </div>
        <div className=\\\"bg-white p-6 rounded-xl border border-gray-100 shadow-sm print:border-gray-300\\\">
          <h3 className=\\\"text-[11px] font-black text-gray-800 tracking-wider uppercase mb-5\\\">HOUSEKEEPING SUMMARY</h3>
          <div className=\\\"space-y-4 text-[13px] font-medium mt-6\\\">
            <div className=\\\"flex justify-between items-center\\\"><span className=\\\"text-gray-500\\\">Total Rooms</span><span className=\\\"font-bold text-gray-800\\\">{data.housekeeping?.totalRooms}</span></div>
            <div className=\\\"flex justify-between items-center\\\"><span className=\\\"text-gray-500\\\">Clean Rooms</span><span className=\\\"font-bold text-green-700\\\">{data.housekeeping?.cleanRooms}</span></div>
            <div className=\\\"flex justify-between items-center\\\"><span className=\\\"text-gray-500\\\">Dirty Rooms</span><span className=\\\"font-bold text-orange-500\\\">{data.housekeeping?.dirtyRooms}</span></div>
            <div className=\\\"flex justify-between items-center\\\"><span className=\\\"text-gray-500\\\">Inspected Rooms</span><span className=\\\"font-bold text-blue-600\\\">{data.housekeeping?.inspectedRooms}</span></div>
            <div className=\\\"flex justify-between items-center\\\"><span className=\\\"text-gray-500\\\">Out of Order</span><span className=\\\"font-bold text-red-600\\\">{data.housekeeping?.outOfOrderRooms}</span></div>
            <div className=\\\"pt-4 mt-2 border-t border-gray-100 flex justify-between items-center\\\"><span className=\\\"text-gray-700 font-bold\\\">Cleanliness %</span><span className=\\\"font-black text-green-700\\\">{data.housekeeping?.cleanlinessPct}%</span></div>
          </div>
        </div>
      </div>

      <div className=\\\"grid grid-cols-3 gap-6\\\">
        <div className=\\\"bg-white p-6 rounded-xl border border-gray-100 shadow-sm print:border-gray-300\\\">
           <h3 className=\\\"text-[11px] font-black text-gray-800 tracking-wider uppercase mb-5\\\">TOP 5 ROOM REVENUE</h3>
           <table className=\\\"w-full text-left text-[11px]\\\">
             <thead>
               <tr className=\\\"text-[9px] font-black text-gray-400 uppercase tracking-wider border-b border-gray-100\\\">
                 <th className=\\\"pb-3\\\">ROOM NO.</th>
                 <th className=\\\"pb-3\\\">ROOM TYPE</th>
                 <th className=\\\"pb-3 text-right\\\">REVENUE (₱)</th>
               </tr>
             </thead>
             <tbody className=\\\"divide-y divide-gray-50\\\">
               {data.topRooms?.map((tr, i) => (
                 <tr key={i} className=\\\"hover:bg-gray-50\\\">
                   <td className=\\\"py-2.5 font-bold text-gray-800\\\">{tr.roomNo}</td>
                   <td className=\\\"py-2.5 font-medium text-gray-600\\\">{tr.roomType}</td>
                   <td className=\\\"py-2.5 text-right font-medium text-gray-800\\\">{tr.revenue.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                 </tr>
               ))}
             </tbody>
           </table>
        </div>
        <div className=\\\"bg-white p-6 rounded-xl border border-gray-100 shadow-sm print:border-gray-300\\\">
          <h3 className=\\\"text-[11px] font-black text-gray-800 tracking-wider uppercase mb-5\\\">NOTES & REMINDERS</h3>
          <ul className=\\\"space-y-4 text-xs font-medium text-gray-600\\\">
             {data.notes?.map((n, i) => (
               <li key={i}>{n}</li>
             ))}
          </ul>
        </div>
        <div className=\\\"bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col print:border-gray-300\\\">
          <h3 className=\\\"text-[11px] font-black text-gray-800 tracking-wider uppercase mb-5\\\">WEATHER</h3>
          <div className=\\\"flex items-center mt-2 mb-8\\\">
             <svg width=\\\"48\\\" height=\\\"48\\\" viewBox=\\\"0 0 24 24\\\" fill=\\\"none\\\" stroke=\\\"#ea9f2f\\\" strokeWidth=\\\"2\\\" strokeLinecap=\\\"round\\\" strokeLinejoin=\\\"round\\\" className=\\\"mr-6\\\"><circle cx=\\\"12\\\" cy=\\\"12\\\" r=\\\"5\\\"/><line x1=\\\"12\\\" y1=\\\"1\\\" x2=\\\"12\\\" y2=\\\"3\\\"/><line x1=\\\"12\\\" y1=\\\"21\\\" x2=\\\"12\\\" y2=\\\"23\\\"/><line x1=\\\"4.22\\\" y1=\\\"4.22\\\" x2=\\\"5.64\\\" y2=\\\"5.64\\\"/><line x1=\\\"18.36\\\" y1=\\\"18.36\\\" x2=\\\"19.78\\\" y2=\\\"19.78\\\"/><line x1=\\\"1\\\" y1=\\\"12\\\" x2=\\\"3\\\" y2=\\\"12\\\"/><line x1=\\\"21\\\" y1=\\\"12\\\" x2=\\\"23\\\" y2=\\\"12\\\"/><line x1=\\\"4.22\\\" y1=\\\"19.78\\\" x2=\\\"5.64\\\" y2=\\\"18.36\\\"/><line x1=\\\"18.36\\\" y1=\\\"5.64\\\" x2=\\\"19.78\\\" y2=\\\"4.22\\\"/></svg>
             <div>
                <div className=\\\"text-4xl font-black text-gray-800\\\">{data.weather?.temp}</div>
                <div className=\\\"text-sm font-bold text-gray-600 mt-1\\\">{data.weather?.condition}</div>
             </div>
          </div>
          <div className=\\\"flex justify-between items-center text-[10px] font-bold text-gray-500 mt-auto pt-4 border-t border-gray-100\\\">
             <div className=\\\"flex items-center\\\"><svg width=\\\"12\\\" height=\\\"12\\\" viewBox=\\\"0 0 24 24\\\" fill=\\\"none\\\" stroke=\\\"#2770c8\\\" strokeWidth=\\\"2\\\" className=\\\"mr-1\\\"><path d=\\\"M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z\\\"/></svg> Humidity<br/><span className=\\\"text-gray-800 ml-4 text-[11px]\\\">{data.weather?.humidity}</span></div>
             <div className=\\\"flex items-center\\\"><svg width=\\\"12\\\" height=\\\"12\\\" viewBox=\\\"0 0 24 24\\\" fill=\\\"none\\\" stroke=\\\"#8858a7\\\" strokeWidth=\\\"2\\\" className=\\\"mr-1\\\"><path d=\\\"M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2\\\"/></svg> Wind<br/><span className=\\\"text-gray-800 ml-4 text-[11px]\\\">{data.weather?.wind}</span></div>
             <div className=\\\"flex items-center\\\"><svg width=\\\"12\\\" height=\\\"12\\\" viewBox=\\\"0 0 24 24\\\" fill=\\\"none\\\" stroke=\\\"#317e3f\\\" strokeWidth=\\\"2\\\" className=\\\"mr-1\\\"><path d=\\\"M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z\\\"/></svg> Forecast<br/><span className=\\\"text-gray-800 ml-4 text-[11px]\\\">{data.weather?.forecast}</span></div>
          </div>
        </div>
      </div>
      <div className=\\\"mt-8 text-[9px] text-gray-400 italic\\\">* This report is system generated and does not require signature.</div>
    </div>
  );
}
\`;

let newContent = content.replace(
  '// Admin Inbox Tab Component', 
  uiComponent + '\\n\\n// Admin Inbox Tab Component'
);

// Update ReportViewer
const reportViewerReplacement = \`
      <div className="flex-1 overflow-y-auto p-8 bg-[#f8f9fa] print:p-0 print:bg-white w-full">
        {report.title === "Daily Manager's Report" && data ? (
          <div className="max-w-[1400px] mx-auto print:max-w-none print:mx-0 w-full">
            <ManagerDailyReportUI data={data} />
          </div>
        ) : (
          <div className="max-w-[1200px] mx-auto border border-black/10 rounded-xl overflow-hidden bg-white shadow-sm print:shadow-none print:border-none">
            {renderTable()}
          </div>
        )}
      </div>
\`;

newContent = newContent.replace(
  /<div className="flex-1 overflow-y-auto p-8">[\\s\\S]*?{renderTable\\(\\)}[\\s\\S]*?<\/div>[\\s\\S]*?<\/div>/,
  reportViewerReplacement.trim() + '\\n    </div>'
);

// also let's change the layout width to 100%
fs.writeFileSync('src/App.jsx', newContent);
console.log('App.jsx updated successfully.');
"
Task logs are available at: file:///C:/Users/ADMIN/.gemini/antigravity-ide/brain/f19706b5-8e47-4df1-8741-71b7480abe7c/.system_generated/tasks/task-1654.log