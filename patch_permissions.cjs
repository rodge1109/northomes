const fs = require('fs');
const path = require('path');

const appJsxPath = path.join(__dirname, 'src', 'App.jsx');

try {
  let content = fs.readFileSync(appJsxPath, 'utf8');

  // Change 1: Update the sidebar ID for 'housekeeping' to 'service'
  const targetSidebarItem = `id: 'housekeeping', label: 'Service', tabId: 'housekeeping', act: () => { setAdminTab('housekeeping'); setCurrentPage('admin'); },`;
  const replacementSidebarItem = `id: 'service', label: 'Service', tabId: 'housekeeping', act: () => { setAdminTab('housekeeping'); setCurrentPage('admin'); },`;
  
  if (content.includes(targetSidebarItem)) {
    content = content.replace(targetSidebarItem, replacementSidebarItem);
    console.log("Successfully updated sidebar ID for 'service'.");
  } else {
    console.log("Could not find the target sidebar item. It might already be updated.");
  }

  // Change 2: Update the permissions array mapped in the Staff Settings tab
  const targetPermissionsArray = `{['dashboard', 'reservations', 'frontdesk', 'rooms', 'housekeeping', 'billing', 'reports', 'settings'].map(perm => (`;
  const replacementPermissionsArray = `{['dashboard', 'reservations', 'frontdesk', 'guests', 'rooms', 'service', 'billing', 'reports', 'inbox', 'settings'].map(perm => (`;
  
  if (content.includes(targetPermissionsArray)) {
    content = content.replace(targetPermissionsArray, replacementPermissionsArray);
    console.log("Successfully updated permissions array to include guests, service, and inbox.");
  } else {
    console.log("Could not find the target permissions array. It might already be updated.");
  }

  // Write changes
  fs.writeFileSync(appJsxPath, content, 'utf8');
  console.log("App.jsx patched successfully!");
} catch (err) {
  console.error("Error patching App.jsx:", err);
}
