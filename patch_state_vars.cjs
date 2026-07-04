const fs = require('fs');

let content = fs.readFileSync('src/App.jsx', 'utf8');

// 1. Inject state variables
const stateHookTarget = "const [wkError, setWkError] = React.useState('');";
const stateHookReplacement = `const [wkError, setWkError] = React.useState('');

  // New Walk-in fields to match mockup
  const [wkCompany, setWkCompany] = React.useState('');
  const [wkAddToProfile, setWkAddToProfile] = React.useState(true);
  const [wkVipGuest, setWkVipGuest] = React.useState(false);
  const [wkRepeatGuest, setWkRepeatGuest] = React.useState(false);
  const [wkCheckInTime, setWkCheckInTime] = React.useState('14:00');
  const [wkCheckOutTime, setWkCheckOutTime] = React.useState('12:00');
  const [wkAdults, setWkAdults] = React.useState(2);
  const [wkChildren, setWkChildren] = React.useState(1);
  const [wkNumRooms, setWkNumRooms] = React.useState(1);
  const [wkSource, setWkSource] = React.useState('Direct Booking');
  const [wkRoomPreference, setWkRoomPreference] = React.useState('High Floor');
  const [wkBedType, setWkBedType] = React.useState('Queen Bed');
  const [wkDiscountPct, setWkDiscountPct] = React.useState(0);
  const [wkDiscountCode, setWkDiscountCode] = React.useState('');
  const [wkCardType, setWkCardType] = React.useState('Visa');
  const [wkCardNumberFull, setWkCardNumberFull] = React.useState('');
  const [wkCardExpiry, setWkCardExpiry] = React.useState('');
  const [wkCardCvv, setWkCardCvv] = React.useState('');
  const [wkCardholder, setWkCardholder] = React.useState('');
  const [wkGuaranteeType, setWkGuaranteeType] = React.useState('Guarantee by Credit Card');
  const [wkGuaranteeAmount, setWkGuaranteeAmount] = React.useState('');
  const [wkSendConfirmEmail, setWkSendConfirmEmail] = React.useState(true);
  const [wkSearchGuest, setWkSearchGuest] = React.useState('');`;

content = content.replace(stateHookTarget, stateHookReplacement);

// 2. Fix resetWalkin
const resetTarget = "setWkSuccess(false); setWkResult(null); setWkError('');";
const resetReplacement = `setWkSuccess(false); setWkResult(null); setWkError('');
    
    // Reset new fields
    setWkCompany(''); setWkAddToProfile(true); setWkVipGuest(false); setWkRepeatGuest(false);
    setWkCheckInTime('14:00'); setWkCheckOutTime('12:00'); setWkAdults(2); setWkChildren(1); setWkNumRooms(1);
    setWkSource('Direct Booking'); setWkRoomPreference('High Floor'); setWkBedType('Queen Bed');
    setWkDiscountPct(0); setWkDiscountCode(''); setWkCardType('Visa'); setWkCardNumberFull('');
    setWkCardExpiry(''); setWkCardCvv(''); setWkCardholder(''); setWkGuaranteeType('Guarantee by Credit Card');
    setWkGuaranteeAmount(''); setWkSendConfirmEmail(true); setWkSearchGuest('');`;

content = content.replace(resetTarget, resetReplacement);

// 3. Fix submitWalkin payload
content = content.replace('number_of_guests: wkGuests', 'number_of_guests: wkAdults + wkChildren');
content = content.replace('deposit_amount: wkDepositAmount || 0', 'deposit_amount: wkGuaranteeAmount || 0');

const submitPayloadEndTarget = `payment_collected: wkPayment, special_requests: wkSpecialReq.trim(), notes: wkNotes.trim(),
        }),`;
const submitPayloadEndReplacement = `payment_collected: wkPayment, special_requests: wkSpecialReq.trim(), notes: wkNotes.trim(),
          company: wkCompany, add_to_profile: wkAddToProfile, vip_guest: wkVipGuest, repeat_guest: wkRepeatGuest,
          check_in_time: wkCheckInTime, check_out_time: wkCheckOutTime, adults: wkAdults, children: wkChildren, num_rooms: wkNumRooms,
          source: wkSource, room_preference: wkRoomPreference, bed_type: wkBedType, discount_pct: wkDiscountPct, discount_code: wkDiscountCode,
          card_type: wkCardType, card_number_full: wkCardNumberFull, card_expiry: wkCardExpiry, card_cvv: wkCardCvv, cardholder: wkCardholder,
          guarantee_type: wkGuaranteeType, send_confirm_email: wkSendConfirmEmail,
        }),`;

content = content.replace(submitPayloadEndTarget, submitPayloadEndReplacement);

fs.writeFileSync('src/App.jsx', content, 'utf8');
console.log('State variables patched successfully');
