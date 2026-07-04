const fs = require('fs');

const codeToInject = `
  const generatePrintReport = (title, subtitle, columns, rows, totalsRow = null) => {
    const win = window.open('', '_blank', 'width=900,height=800');
    if (!win) return;
    
    const thead = columns.map(c => \`<th style="text-align:\${c.align || 'left'}">\${c.label}</th>\`).join('');
    
    const tbody = rows.map(r => {
      const tds = columns.map(c => \`<td style="text-align:\${c.align || 'left'}">\${r[c.key] || ''}</td>\`).join('');
      return \`<tr>\${tds}</tr>\`;
    }).join('');

    let tfoot = '';
    if (totalsRow) {
      const fTds = columns.map(c => \`<td style="text-align:\${c.align || 'left'}">\${totalsRow[c.key] || ''}</td>\`).join('');
      tfoot = \`<tfoot><tr style="font-weight:bold;background:#eff6ff;">\${fTds}</tr></tfoot>\`;
    }

    win.document.write(\`<!DOCTYPE html><html><head><title>\${title}</title>
      <style>
        body{font-family:Arial,sans-serif;max-width:850px;margin:32px auto;padding:0 24px;color:#222;}
        h2{margin:0 0 4px; color:#00754A;} p.sub{margin:0 0 20px;color:#666;font-size:13px;}
        table{width:100%;border-collapse:collapse;font-size:13px;margin-bottom:16px;}
        th{background:#f5f5f5;padding:8px 10px;text-align:left; border-bottom:2px solid #ddd; color:#444;}
        td{padding:8px 10px;border-bottom:1px solid #f0f0f0;}
        @media print{button{display:none;}}
        .print-btn { padding: 8px 16px; background: #00754A; color: white; border: none; border-radius: 4px; cursor: pointer; float: right; }
        .header-area { overflow: hidden; margin-bottom: 24px; }
      </style></head><body>
      <div class="header-area">
        <button class="print-btn" onclick="window.print()">Print Report</button>
        <h2>\${title}</h2>
        <p class="sub">\${subtitle}</p>
      </div>
      \${rows.length === 0 ? '<p style="color:#999;font-size:13px;text-align:center;padding:32px;background:#f9f9f9;border-radius:8px;">No data available for this report.</p>' : \`
      <table>
        <thead><tr>\${thead}</tr></thead>
        <tbody>\${tbody}</tbody>
        \${tfoot}
      </table>
      \`}
      </body></html>\`);
    win.document.close();
  };

  const handleGenerateReport = async (reportTitle) => {
    const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const fmtA = (n) => \`₱\${Number(n || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}\`;

    try {
      if (reportTitle === 'Arrival Report') {
        const res = await fetch(\`\${API_BASE_URL}/api/front-desk/arrivals\`);
        const data = await res.json();
        const rows = (data.arrivals || []).map(r => ({
          name: r.full_name,
          room: r.room_number || 'Unassigned',
          type: r.room_type,
          nights: Math.round((new Date(r.check_out_date) - new Date(r.check_in_date)) / 86400000),
          status: r.status
        }));
        generatePrintReport('Arrival Report', \`List of guests arriving on \${today}\`, [
          { key: 'name', label: 'Guest Name' }, { key: 'room', label: 'Room' },
          { key: 'type', label: 'Room Type' }, { key: 'nights', label: 'Nights', align: 'center' },
          { key: 'status', label: 'Status' }
        ], rows);
        return;
      }

      if (reportTitle === 'In-House Guest Report') {
        const res = await fetch(\`\${API_BASE_URL}/api/front-desk/in-house\`);
        const data = await res.json();
        const rows = (data.guests || []).map(r => ({
          name: r.full_name,
          room: r.room_number || '—',
          checkout: new Date(r.check_out_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          balance: fmtA(r.balance)
        }));
        generatePrintReport('In-House Guest Report', \`List of all in-house guests as of \${today}\`, [
          { key: 'name', label: 'Guest Name' }, { key: 'room', label: 'Room' },
          { key: 'checkout', label: 'Departure Date' }, { key: 'balance', label: 'Balance', align: 'right' }
        ], rows);
        return;
      }

      if (reportTitle === 'Room Status Report') {
        const res = await fetch(\`\${API_BASE_URL}/api/rooms\`);
        const data = await res.json();
        const rows = (data.rooms || []).map(r => ({
          room: r.number,
          type: r.room_type_name,
          status: r.status,
          housekeeping: r.housekeeping_status || 'Clean'
        }));
        generatePrintReport('Room Status Report', \`Current status of all rooms as of \${today}\`, [
          { key: 'room', label: 'Room Number' }, { key: 'type', label: 'Room Type' },
          { key: 'status', label: 'Front Desk Status' }, { key: 'housekeeping', label: 'Housekeeping' }
        ], rows);
        return;
      }

      // Generate Dummy Data for the rest
      let cols = [];
      let rows = [];
      let totals = null;

      if (reportTitle.includes('Revenue') || reportTitle.includes('Shift')) {
        cols = [{key:'desc', label:'Description'}, {key:'qty', label:'Count', align:'center'}, {key:'amt', label:'Amount', align:'right'}];
        rows = [
          {desc: 'Room Revenue', qty: '12', amt: fmtA(15000)},
          {desc: 'F&B Revenue', qty: '8', amt: fmtA(3400)},
          {desc: 'Mini Bar', qty: '3', amt: fmtA(650)}
        ];
        totals = {desc: 'Total', amt: fmtA(19050)};
      } else if (reportTitle.includes('Ledger') || reportTitle.includes('Balance')) {
        cols = [{key:'acct', label:'Account / Guest'}, {key:'ref', label:'Reference'}, {key:'bal', label:'Balance', align:'right'}];
        rows = [
          {acct: 'Agoda Virtual Card', ref: 'BKG-8492', bal: fmtA(45000)},
          {acct: 'Booking.com', ref: 'BKG-1123', bal: fmtA(28500)},
          {acct: 'Walk-in (Pending)', ref: 'RES-094', bal: fmtA(3200)}
        ];
        totals = {acct: 'Total Outstanding', bal: fmtA(76700)};
      } else if (reportTitle.includes('Housekeeping') || reportTitle.includes('Room')) {
        cols = [{key:'room', label:'Room'}, {key:'type', label:'Type'}, {key:'status', label:'Status'}, {key:'assigned', label:'Assigned To'}];
        rows = [
          {room: '101', type: 'Standard', status: 'Dirty', assigned: 'Maria'},
          {room: '102', type: 'Deluxe', status: 'Dirty', assigned: 'Maria'},
          {room: '205', type: 'Suite', status: 'Out of Order', assigned: 'Maintenance'}
        ];
      } else if (reportTitle.includes('Audit') || reportTitle.includes('Void') || reportTitle.includes('Deleted')) {
        cols = [{key:'time', label:'Time'}, {key:'user', label:'User'}, {key:'action', label:'Action'}, {key:'details', label:'Details'}];
        rows = [
          {time: '08:15 AM', user: 'Admin', action: 'Void Charge', details: 'Room 105 - Mistake entry'},
          {time: '11:30 AM', user: 'Front Desk', action: 'Rate Override', details: 'Room 201 - Walk-in discount'},
          {time: '02:45 PM', user: 'Manager', action: 'Refund', details: 'Room 304 - Deposit return'}
        ];
      } else {
        cols = [{key:'col1', label:'Item'}, {key:'col2', label:'Value'}];
        rows = [{col1: 'Sample Data', col2: '123'}];
      }

      generatePrintReport(reportTitle, \`Generated on \${today} (Sample Data)\`, cols, rows, totals);

    } catch (err) {
      console.error(err);
      alert('Failed to generate report: ' + err.message);
    }
  };
`;

let appJsx = fs.readFileSync('src/App.jsx', 'utf8');

const targetFunctionLine = "function ReportsTabComponent() {";
const insertionIndex = appJsx.indexOf(targetFunctionLine) + targetFunctionLine.length;

appJsx = appJsx.substring(0, insertionIndex) + "\n" + codeToInject + appJsx.substring(insertionIndex);

// Now, wire it to the buttons
appJsx = appJsx.replace(
  /<div className="mt-auto px-6 py-3\.5 border-t border-black\/5 bg-white flex items-center justify-between transition-colors">/g,
  '<div onClick={(e) => { e.stopPropagation(); handleGenerateReport(report.title); }} className="mt-auto px-6 py-3.5 border-t border-black/5 bg-white hover:bg-[#00754A]/5 flex items-center justify-between transition-colors cursor-pointer">'
);

fs.writeFileSync('src/App.jsx', appJsx);
console.log("Injected report generation logic.");
