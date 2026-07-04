const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');

const startTag = "{/* ==================== REPORTS TAB ==================== */}";
const endTag = "{/* ==================== INBOX TAB ==================== */}";

const startIndex = code.indexOf(startTag);
const endIndex = code.indexOf(endTag);

const oldReportsCode = code.substring(startIndex, endIndex);

// Check if it starts with {activeTab === 'reports' && (() => {
const funcStart = "{activeTab === 'reports' && (() => {";
const funcEnd = "})()}";

let innerBody = oldReportsCode.substring(
  oldReportsCode.indexOf(funcStart) + funcStart.length,
  oldReportsCode.lastIndexOf(funcEnd)
);

const newComponent = `\nfunction ReportsTabComponent() {${innerBody}}\n`;
const newCall = `${startTag}\n        {activeTab === 'reports' && <ReportsTabComponent />}\n\n        `;

code = code.substring(0, startIndex) + newCall + code.substring(endIndex) + newComponent;

fs.writeFileSync('src/App.jsx', code);
console.log("Fixed ReportsTab hook issue.");
