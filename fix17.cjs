const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');

const oldStr = `{/* ==================== REPORTS TAB ==================== */}
        {activeTab === 'reports' && (() => {`;
const newStr = `{/* ==================== REPORTS TAB ==================== */}
        {activeTab === 'reports' && <ReportsTabComponent />}`;

code = code.replace(oldStr, newStr);

// Now, extract the body
const match = code.match(/{activeTab === 'reports' && <ReportsTabComponent \/>}\n([\s\S]*?)\}\)\(\)\}\n\n        \{\/\* ==================== INBOX TAB ==================== \*\/\}/);

if (match) {
  const body = match[1];
  code = code.replace(match[0], `{activeTab === 'reports' && <ReportsTabComponent />}\n\n        {/* ==================== INBOX TAB ==================== */}`);
  
  const componentStr = `\nfunction ReportsTabComponent() {\n${body}}\n`;
  code += componentStr;
  
  fs.writeFileSync('src/App.jsx', code);
  console.log("Extracted ReportsTabComponent");
} else {
  console.log("Could not find the match for extraction");
}
