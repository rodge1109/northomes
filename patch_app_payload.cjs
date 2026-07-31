const fs = require('fs');
let content = fs.readFileSync('src/App.jsx', 'utf8');

const submitTarget = `            purpose: wkPurpose, payment_method: wkPaymentMethod, deposit_amount: wkGuaranteeAmount || 0,
            payment_collected: wkPayment, special_requests: wkSpecialReq.trim(), notes: wkNotes.trim(),
          }),`;
const submitReplacement = `            purpose: wkPurpose, payment_method: wkPaymentMethod, deposit_amount: wkGuaranteeAmount || 0,
            payment_collected: wkPayment, special_requests: wkSpecialReq.trim(), notes: wkNotes.trim(),
            add_to_profile: wkAddToProfile, is_vip: wkVipGuest, is_repeat: wkRepeatGuest,
          }),`;

if (content.includes(submitTarget)) {
  content = content.replace(submitTarget, submitReplacement);
  fs.writeFileSync('src/App.jsx', content, 'utf8');
  console.log('Successfully patched App.jsx submitWalkin payload.');
} else {
  console.log('Failed to find target in App.jsx');
}
