const fs = require('fs');
const file = 'c:\\website\\northomes-system\\src\\CorporateProfileView.jsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Add import
if (!content.includes('SignaturePadModal')) {
  content = content.replace("import ReactDOM from 'react-dom';", "import ReactDOM from 'react-dom';\nimport SignaturePadModal from './components/common/SignaturePadModal';");
}

// 2. Add state
const findState = `  const [saving, setSaving] = useState(false);`;
const injectState = `  const [saving, setSaving] = useState(false);
  const [isSigning, setIsSigning] = useState(false);
  const [signatureData, setSignatureData] = useState(null);`;
if (!content.includes('const [isSigning')) {
  content = content.replace(findState, injectState);
}

// 3. Add Capture Signature Button and render Modal
const findButtons = `              {ledger.length > 0 && (
                <button 
                  onClick={printInvoice}`;
const injectButtons = `              {ledger.length > 0 && (
                <>
                  <button 
                    onClick={() => setIsSigning(true)}
                    className={\`flex items-center gap-2 px-5 py-2 border \${signatureData ? 'border-[#005530] bg-[#005530]/5 text-[#005530]' : 'border-black/10 bg-white text-black/80 hover:bg-gray-50'} rounded-lg text-[13px] font-bold shadow-sm transition-colors\`}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 12v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-6"/><path d="M14 6l-8 8-4 4 4-4 8-8 4 4"/></svg>
                    {signatureData ? 'Signature Saved' : 'Sign Invoice'}
                  </button>
                  <button 
                    onClick={printInvoice}`;
if (!content.includes('setIsSigning(true)')) {
  content = content.replace(findButtons, injectButtons);
}

// 4. Update printInvoice HTML
const findSignatureBlock = `        <div style="width: 250px; text-align: center;">
          <div style="border-bottom: 1px solid #333; margin-bottom: 8px; height: 40px;"></div>
          <div style="font-size: 12px; font-weight: bold; text-transform: uppercase;">Guest / Authorized Signatory</div>
        </div>`;
const replaceSignatureBlock = `        <div style="width: 250px; text-align: center;">
          <div style="border-bottom: 1px solid #333; margin-bottom: 8px; height: 60px; display: flex; align-items: flex-end; justify-content: center;">
            \${signatureData ? \`<img src="\${signatureData}" style="max-height: 50px; max-width: 100%; object-fit: contain;" />\` : ''}
          </div>
          <div style="font-size: 12px; font-weight: bold; text-transform: uppercase;">Guest / Authorized Signatory</div>
        </div>`;
content = content.replace(findSignatureBlock, replaceSignatureBlock);

// 5. Render SignaturePadModal
const findReturnRoot = `    </div>,
    document.body
  );
}`;
const replaceReturnRoot = `      <SignaturePadModal 
        isOpen={isSigning} 
        onClose={() => setIsSigning(false)} 
        onSave={(data) => setSignatureData(data)} 
      />
    </div>,
    document.body
  );
}`;
if (!content.includes('<SignaturePadModal')) {
  content = content.replace(findReturnRoot, replaceReturnRoot);
}

fs.writeFileSync(file, content, 'utf8');
console.log('Signature modal integration complete!');
