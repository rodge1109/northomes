const fs = require('fs');
const file = 'c:\\website\\northomes-system\\src\\App.jsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Add import
if (!content.includes("import CorporateSettingsTab")) {
  content = content.replace("import AdminDashboardTab from './AdminDashboardTab';", "import AdminDashboardTab from './AdminDashboardTab';\nimport CorporateSettingsTab from './CorporateSettingsTab';");
}

// 2. Add to sub-tabs array
const findTabs = `{ id: 'staff', label: 'Staff & Permissions' },`;
const replTabs = `{ id: 'staff', label: 'Staff & Permissions' },\n                      { id: 'corporate', label: 'Corporate Accounts' },`;
content = content.replace(findTabs, replTabs);

// 3. Add to switch block
const findBlock = `{settingsSubTab === 'property' && (`;
const replBlock = `{settingsSubTab === 'corporate' && <CorporateSettingsTab />}\n                  {settingsSubTab === 'property' && (`;
content = content.replace(findBlock, replBlock);

fs.writeFileSync(file, content, 'utf8');
console.log('App.jsx patched for CorporateSettingsTab!');
