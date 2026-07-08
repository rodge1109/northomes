const fs = require('fs');
const file = 'c:\\website\\northomes-system\\src\\CorporateProfileView.jsx';
let content = fs.readFileSync(file, 'utf8');

const findFooter = `      <div class="footer">
        Please make all checks payable to Northomes Management.<br/>
        If you have any questions concerning this invoice, contact our billing department.
      </div>`;

const replaceFooter = `      <div style="margin-top: 80px; display: flex; justify-content: space-between; padding: 0 20px;">
        <div style="width: 250px; text-align: center;">
          <div style="border-bottom: 1px solid #333; margin-bottom: 8px; height: 40px;"></div>
          <div style="font-size: 12px; font-weight: bold; text-transform: uppercase;">Prepared By</div>
        </div>
        <div style="width: 250px; text-align: center;">
          <div style="border-bottom: 1px solid #333; margin-bottom: 8px; height: 40px;"></div>
          <div style="font-size: 12px; font-weight: bold; text-transform: uppercase;">Guest / Authorized Signatory</div>
        </div>
      </div>

      <div class="footer">
        Please make all checks payable to Northomes Management.<br/>
        If you have any questions concerning this invoice, contact our billing department.
      </div>`;

content = content.replace(findFooter, replaceFooter);

fs.writeFileSync(file, content, 'utf8');
console.log('Signature line added to invoice!');
