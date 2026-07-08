const fs = require('fs');
const file = 'c:\\website\\northomes-system\\src\\CorporateProfileView.jsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Inject printInvoice function
const findFmtCurrency = `const fmtCurrency = (n) => \`₱\${(Number(n) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\`;`;
const injectPrintInvoice = `const fmtCurrency = (n) => \`₱\${(Number(n) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\`;

  const printInvoice = () => {
    if (!account) return;
    
    const invoiceNumber = \`INV-\${new Date().getFullYear()}-\${String(account.id).padStart(4, '0')}\`;
    const today = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    
    const ledgerRows = ledger.map(entry => {
      return \`
        <tr>
          <td>\${fmtDate(entry.date)}</td>
          <td>
            <div style="font-weight:bold;">\${entry.reference}</div>
            <div style="color:#666;font-size:11px;">\${entry.description || ''}</div>
          </td>
          <td style="text-align:right;color:#dc2626;">\${Number(entry.debit) > 0 ? fmtCurrency(entry.debit) : ''}</td>
          <td style="text-align:right;color:#16a34a;">\${Number(entry.credit) > 0 ? fmtCurrency(entry.credit) : ''}</td>
          <td style="text-align:right;font-weight:bold;">\${fmtCurrency(entry.balance)}</td>
        </tr>
      \`;
    }).join('');

    const win = window.open('', '_blank', 'width=800,height=900');
    win.document.write(\`<!DOCTYPE html><html><head><title>Corporate Invoice - \${account.company_name}</title>
      <style>
        body { font-family: 'Inter', Arial, sans-serif; max-width: 720px; margin: 40px auto; padding: 0 32px; color: #111; }
        .header { display: flex; justify-content: space-between; border-bottom: 2px solid #005530; padding-bottom: 20px; margin-bottom: 30px; }
        .header h1 { margin: 0; color: #005530; font-size: 32px; font-weight: 900; letter-spacing: -1px; }
        .invoice-details { text-align: right; }
        .invoice-details h2 { margin: 0; font-size: 24px; color: #666; letter-spacing: 2px; text-transform: uppercase; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 40px; }
        .info-block h3 { margin: 0 0 8px 0; font-size: 11px; text-transform: uppercase; color: #888; letter-spacing: 1px; }
        .info-block p { margin: 4px 0; font-size: 14px; font-weight: 500; }
        table { width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 30px; }
        th { background: #f8f9fa; padding: 10px 12px; text-align: left; font-size: 11px; text-transform: uppercase; color: #666; border-bottom: 2px solid #eaeaea; }
        td { padding: 12px; border-bottom: 1px solid #eaeaea; vertical-align: top; }
        .summary-box { background: #f8f9fa; padding: 20px; border-radius: 8px; border: 1px solid #eaeaea; text-align: right; margin-left: auto; width: 300px; }
        .summary-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 13px; }
        .summary-total { display: flex; justify-content: space-between; margin-top: 12px; padding-top: 12px; border-top: 2px solid #eaeaea; font-size: 18px; font-weight: 900; }
        .footer { margin-top: 60px; text-align: center; font-size: 11px; color: #888; border-top: 1px solid #eaeaea; padding-top: 20px; }
      </style>
    </head><body>
      <div class="header">
        <div>
          <h1>Northomes</h1>
          <p style="margin: 8px 0 0; font-size: 13px; color: #666;">Baguio City, Philippines<br/>billing@northomes.com</p>
        </div>
        <div class="invoice-details">
          <h2>INVOICE</h2>
          <p style="margin: 8px 0 0; font-size: 13px; font-weight: bold;">#\${invoiceNumber}</p>
          <p style="margin: 4px 0 0; font-size: 13px; color: #666;">Date: \${today}</p>
        </div>
      </div>
      
      <div class="info-grid">
        <div class="info-block">
          <h3>Billed To</h3>
          <p style="font-weight: 800; font-size: 16px;">\${account.company_name}</p>
          <p>Account #: \${account.account_number}</p>
          <p>Attn: \${account.contact_person || 'Accounts Payable'}</p>
          <p>\${account.contact_email || ''}</p>
        </div>
        <div class="info-block" style="text-align: right;">
          <h3>Payment Terms</h3>
          <p>Due on Receipt</p>
          <h3 style="margin-top: 16px;">Credit Limit</h3>
          <p>\${fmtCurrency(account.credit_limit)}</p>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th style="width:15%;">Date</th>
            <th style="width:35%;">Description</th>
            <th style="width:15%;text-align:right;">Debit</th>
            <th style="width:15%;text-align:right;">Credit</th>
            <th style="width:20%;text-align:right;">Balance</th>
          </tr>
        </thead>
        <tbody>
          \${ledger.length > 0 ? ledgerRows : '<tr><td colspan="5" style="text-align:center;color:#888;">No transactions recorded.</td></tr>'}
        </tbody>
      </table>

      <div class="summary-box">
        <div class="summary-total">
          <span>Amount Due:</span>
          <span style="color: \${Number(account.balance) > 0 ? '#dc2626' : '#16a34a'};">\${fmtCurrency(account.balance)}</span>
        </div>
      </div>

      <div class="footer">
        Please make all checks payable to Northomes Management.<br/>
        If you have any questions concerning this invoice, contact our billing department.
      </div>
      <script>
        setTimeout(() => { window.print(); }, 500);
      </script>
    </body></html>\`);
    win.document.close();
  };`;
content = content.replace(findFmtCurrency, injectPrintInvoice);

// 2. Inject Print button next to Edit Account
const findEditButton = `              <button 
                onClick={() => setIsEditing(true)} 
                className="px-5 py-2 border border-black/10 rounded-lg text-[13px] font-bold text-black/80 hover:bg-gray-50 shadow-sm transition-colors"
              >
                Edit Account
              </button>`;
const injectPrintButton = `              {ledger.length > 0 && (
                <button 
                  onClick={printInvoice}
                  className="flex items-center gap-2 px-5 py-2 border border-black/10 rounded-lg text-[13px] font-bold text-black/80 hover:bg-gray-50 shadow-sm transition-colors bg-white"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2M6 14h12v6H6z"/></svg>
                  Print Invoice
                </button>
              )}
              <button 
                onClick={() => setIsEditing(true)} 
                className="px-5 py-2 border border-black/10 rounded-lg text-[13px] font-bold text-black/80 hover:bg-gray-50 shadow-sm transition-colors"
              >
                Edit Account
              </button>`;
content = content.replace(findEditButton, injectPrintButton);

fs.writeFileSync(file, content, 'utf8');
console.log('Print invoice feature added!');
