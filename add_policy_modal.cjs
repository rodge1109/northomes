const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'App.jsx');
let content = fs.readFileSync(filePath, 'utf8');

const modalCode = `// Payment & Cancellation Policy Modal
function PaymentPolicyModal({ isOpen, onClose, policyText }) {
  if (!isOpen) return null;
  const text = policyText || '';

  const lines = text.split('\\n');
  const formatted = lines.map((line, i) => {
    const trimmed = line.trim();
    if (!trimmed) return <div key={i} className="mb-2" />;
    if (trimmed.startsWith('* ')) {
      return (
        <li key={i} className="ml-5 text-sm text-gray-700 leading-relaxed list-disc">
          {trimmed.slice(2)}
        </li>
      );
    }
    const isAllCaps = trimmed === trimmed.toUpperCase() && trimmed.length > 2 && !/[a-z]/.test(trimmed) && !/^[*\\-]/.test(trimmed);
    if (isAllCaps) {
      return (
        <h3 key={i} className="font-bold text-[12px] uppercase tracking-widest text-gray-900 mt-5 mb-1">
          {trimmed}
        </h3>
      );
    }
    if (trimmed === '\\u2E3B' || trimmed === '\\u2014\\u2014\\u2014' || trimmed === '---') {
      return <hr key={i} className="my-4 border-gray-200" />;
    }
    return (
      <p key={i} className="text-sm text-gray-700 leading-relaxed">
        {trimmed}
      </p>
    );
  });

  return ReactDOM.createPortal(
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[85vh] flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50 rounded-t-2xl">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-widest">
            Payment &amp; Cancellation Policy
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 transition-colors p-1 rounded-full hover:bg-gray-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        {/* Scrollable body */}
        <div className="overflow-y-auto px-6 py-5 flex-1">
          <ul className="space-y-1">{formatted}</ul>
        </div>
        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-lg bg-gray-900 text-white text-sm font-semibold hover:bg-gray-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

`;

// Find insertion point - look for the comment + function line
const searchStr1 = '// Admin Dashboard Component\r\nfunction AdminDashboard(';
const searchStr2 = '// Admin Dashboard Component\nfunction AdminDashboard(';

if (content.includes(searchStr1)) {
  content = content.replace(searchStr1, modalCode + searchStr1);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('SUCCESS (CRLF): Inserted PaymentPolicyModal');
} else if (content.includes(searchStr2)) {
  content = content.replace(searchStr2, modalCode + searchStr2);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('SUCCESS (LF): Inserted PaymentPolicyModal');
} else {
  // Try finding by looking for the pattern with any whitespace
  const idx = content.indexOf('function AdminDashboard(');
  if (idx > -1) {
    // find the line start before the comment
    let commentStart = content.lastIndexOf('// Admin Dashboard', idx);
    if (commentStart > -1) {
      content = content.slice(0, commentStart) + modalCode + content.slice(commentStart);
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('SUCCESS (fallback): Inserted PaymentPolicyModal at char', commentStart);
    } else {
      content = content.slice(0, idx) + modalCode + content.slice(idx);
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('SUCCESS (fallback2): Inserted before AdminDashboard function');
    }
  } else {
    console.error('ERROR: Cannot find insertion point');
    process.exit(1);
  }
}
