const fs = require('fs');
let content = fs.readFileSync('src/App.jsx', 'utf8');

content = content.replace(/payment_collected: wkPayment, special_requests: wkSpecialReq\.trim\(\), notes: wkNotes\.trim\(\),/g, 'payment_collected: wkPayment, special_requests: wkSpecialReq.trim(), notes: wkNotes.trim(), add_to_profile: wkAddToProfile, is_vip: wkVipGuest, is_repeat: wkRepeatGuest,');

fs.writeFileSync('src/App.jsx', content, 'utf8');
console.log('Successfully patched App.jsx payload.');
