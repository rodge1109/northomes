const fs = require('fs');

let content = fs.readFileSync('src/App.jsx', 'utf8');

// 1. Replace the state block
const oldStateBlock = `  // Walk-In state
  const [wkRoomTypes, setWkRoomTypes] = React.useState([]);
  const [wkRateCodes, setWkRateCodes] = React.useState([]);
  const [wkRateCode, setWkRateCode] = React.useState('');
  const [wkLastName, setWkLastName] = React.useState('');
  const [wkFirstName, setWkFirstName] = React.useState('');
  const [wkEmail, setWkEmail] = React.useState('');
  const [wkPhone, setWkPhone] = React.useState('');
  const [wkRoomType, setWkRoomType] = React.useState('');
  const [wkCheckIn, setWkCheckIn] = React.useState(today);
  const [wkCheckOut, setWkCheckOut] = React.useState('');
  const [wkGuests, setWkGuests] = React.useState(1);
  const [wkRoomNumber, setWkRoomNumber] = React.useState('');
  const [wkSpecialReq, setWkSpecialReq] = React.useState('');
  const [wkPayment, setWkPayment] = React.useState(false);
  const [wkNotes, setWkNotes] = React.useState('');
  const [wkTitle, setWkTitle] = React.useState('Mr.');
  const [wkMiddleName, setWkMiddleName] = React.useState('');
  const [wkGender, setWkGender] = React.useState('');
  const [wkBirthDate, setWkBirthDate] = React.useState('');
  const [wkNationality, setWkNationality] = React.useState('');
  const [wkCountry, setWkCountry] = React.useState('');
  const [wkAddress, setWkAddress] = React.useState('');
  const [wkCity, setWkCity] = React.useState('');
  const [wkIdType, setWkIdType] = React.useState('');
  const [wkIdNumber, setWkIdNumber] = React.useState('');
  const [wkPurpose, setWkPurpose] = React.useState('');
  const [wkEta, setWkEta] = React.useState('');
  const [wkPaymentMethod, setWkPaymentMethod] = React.useState('Cash');
  const [wkDepositAmount, setWkDepositAmount] = React.useState('');
  const [wkSubmitting, setWkSubmitting] = React.useState(false);
  const [wkSuccess, setWkSuccess] = React.useState(false);
  const [wkResult, setWkResult] = React.useState(null);
  const [wkError, setWkError] = React.useState('');`;

const newStateBlock = `  // Walk-In state
  const [wkRoomTypes, setWkRoomTypes] = React.useState([]);
  const [wkRateCodes, setWkRateCodes] = React.useState([]);
  const [wkRateCode, setWkRateCode] = React.useState('');
  const [wkLastName, setWkLastName] = React.useState('');
  const [wkFirstName, setWkFirstName] = React.useState('');
  const [wkEmail, setWkEmail] = React.useState('');
  const [wkPhone, setWkPhone] = React.useState('');
  const [wkRoomType, setWkRoomType] = React.useState('');
  const [wkCheckIn, setWkCheckIn] = React.useState(today);
  const [wkCheckOut, setWkCheckOut] = React.useState('');
  const [wkGuests, setWkGuests] = React.useState(1);
  const [wkRoomNumber, setWkRoomNumber] = React.useState('');
  const [wkSpecialReq, setWkSpecialReq] = React.useState('');
  const [wkPayment, setWkPayment] = React.useState(false);
  const [wkNotes, setWkNotes] = React.useState('');
  const [wkTitle, setWkTitle] = React.useState('Mr.');
  const [wkMiddleName, setWkMiddleName] = React.useState('');
  const [wkGender, setWkGender] = React.useState('Male');
  const [wkBirthDate, setWkBirthDate] = React.useState('');
  const [wkNationality, setWkNationality] = React.useState('Filipino');
  const [wkCountry, setWkCountry] = React.useState('Philippines');
  const [wkAddress, setWkAddress] = React.useState('');
  const [wkCity, setWkCity] = React.useState('');
  const [wkIdType, setWkIdType] = React.useState('Passport');
  const [wkIdNumber, setWkIdNumber] = React.useState('');
  const [wkPurpose, setWkPurpose] = React.useState('Leisure');
  const [wkEta, setWkEta] = React.useState('');
  const [wkPaymentMethod, setWkPaymentMethod] = React.useState('Credit Card');
  const [wkDepositAmount, setWkDepositAmount] = React.useState('');
  const [wkSubmitting, setWkSubmitting] = React.useState(false);
  const [wkSuccess, setWkSuccess] = React.useState(false);
  const [wkResult, setWkResult] = React.useState(null);
  const [wkError, setWkError] = React.useState('');

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
  const [wkDiscountPct, setWkDiscountPct] = React.useState(10);
  const [wkDiscountCode, setWkDiscountCode] = React.useState('BDAY10');
  const [wkCardType, setWkCardType] = React.useState('Visa');
  const [wkCardNumberFull, setWkCardNumberFull] = React.useState('');
  const [wkCardExpiry, setWkCardExpiry] = React.useState('');
  const [wkCardCvv, setWkCardCvv] = React.useState('');
  const [wkCardholder, setWkCardholder] = React.useState('');
  const [wkGuaranteeType, setWkGuaranteeType] = React.useState('Guarantee by Credit Card');
  const [wkGuaranteeAmount, setWkGuaranteeAmount] = React.useState('');
  const [wkSendConfirmEmail, setWkSendConfirmEmail] = React.useState(true);
  const [wkSearchGuest, setWkSearchGuest] = React.useState('');`;

content = content.replace(oldStateBlock, newStateBlock);

// 2. Replace submitWalkin and resetWalkin
const oldSubmitReset = `  const submitWalkin = async () => {
    if (!wkLastName.trim() || !wkFirstName.trim() || !wkRoomType || !wkCheckIn || !wkCheckOut || !wkRoomNumber.trim()) {
      setWkError('Please fill in all required fields (last name, first name, room type, dates, room number).'); return;
    }
    if (new Date(wkCheckOut) <= new Date(wkCheckIn)) {
      setWkError('Check-out date must be after check-in date.'); return;
    }
    setWkError(''); setWkSubmitting(true);
    try {
      const res = await fetch(\`\${API_BASE_URL}/api/front-desk/walkin\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: \`\${wkLastName.trim()}, \${wkFirstName.trim()}\${wkMiddleName.trim() ? ' ' + wkMiddleName.trim() : ''}\`,
          title: wkTitle, gender: wkGender, birth_date: wkBirthDate,
          nationality: wkNationality, country: wkCountry,
          email: wkEmail.trim(), phone: wkPhone.trim(),
          address: wkAddress.trim(), city: wkCity.trim(),
          id_type: wkIdType, id_number: wkIdNumber.trim(),
          room_type: wkRoomType, rate_code: wkRateCode,
          check_in_date: wkCheckIn, check_out_date: wkCheckOut,
          eta: wkEta, number_of_guests: wkGuests, room_number: wkRoomNumber.trim(),
          purpose: wkPurpose, payment_method: wkPaymentMethod, deposit_amount: wkDepositAmount || 0,
          payment_collected: wkPayment, special_requests: wkSpecialReq.trim(), notes: wkNotes.trim(),
        }),
      });
      let data;
      try { data = await res.json(); } catch { throw new Error(\`Server returned status \${res.status} (\${res.statusText})\`); }
      if (data.success) { setWkResult(data.reservation); setWkSuccess(true); fetchInHouse(); fetchArrivals(arrivalDate); }
      else setWkError(data.message || \`Server error \${res.status}\`);
    } catch (e) { setWkError(e.message || 'Network error — is the server running?'); }
    setWkSubmitting(false);
  };

  const resetWalkin = () => {
    setWkTitle('Mr.'); setWkLastName(''); setWkFirstName(''); setWkMiddleName('');
    setWkGender(''); setWkBirthDate(''); setWkNationality(''); setWkCountry('');
    setWkEmail(''); setWkPhone(''); setWkAddress(''); setWkCity('');
    setWkIdType(''); setWkIdNumber('');
    setWkRoomType(wkRoomTypes[0]?.name || ''); setWkRateCode('');
    setWkCheckIn(today); setWkCheckOut(''); setWkEta(''); setWkGuests(1); setWkRoomNumber('');
    setWkPurpose(''); setWkPaymentMethod('Cash'); setWkDepositAmount('');
    setWkPayment(false); setWkSpecialReq(''); setWkNotes('');
    setWkSuccess(false); setWkResult(null); setWkError('');
  };`;

const newSubmitReset = `  const submitWalkin = async () => {
    if (!wkLastName.trim() || !wkFirstName.trim() || !wkRoomType || !wkCheckIn || !wkCheckOut || !wkRoomNumber.trim()) {
      setWkError('Please fill in all required fields (last name, first name, room type, dates, room number).'); return;
    }
    if (new Date(wkCheckOut) <= new Date(wkCheckIn)) {
      setWkError('Check-out date must be after check-in date.'); return;
    }
    setWkError(''); setWkSubmitting(true);
    try {
      const res = await fetch(\`\${API_BASE_URL}/api/front-desk/walkin\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: \`\${wkFirstName.trim()} \${wkLastName.trim()}\`, // Switched format to match design
          title: wkTitle, gender: wkGender, birth_date: wkBirthDate,
          nationality: wkNationality, country: wkCountry,
          email: wkEmail.trim(), phone: wkPhone.trim(),
          address: wkAddress.trim(), city: wkCity.trim(),
          id_type: wkIdType, id_number: wkIdNumber.trim(),
          room_type: wkRoomType, rate_code: wkRateCode,
          check_in_date: wkCheckIn, check_out_date: wkCheckOut,
          eta: wkCheckInTime, number_of_guests: wkAdults + wkChildren, room_number: wkRoomNumber.trim(),
          purpose: wkPurpose, payment_method: wkPaymentMethod, deposit_amount: wkGuaranteeAmount || 0,
          payment_collected: wkPayment, special_requests: wkSpecialReq.trim(), notes: wkNotes.trim(),
          // Passing some new fields even if backend ignores them
          company: wkCompany,
          add_to_profile: wkAddToProfile,
          vip_guest: wkVipGuest,
          repeat_guest: wkRepeatGuest,
          check_in_time: wkCheckInTime,
          check_out_time: wkCheckOutTime,
          adults: wkAdults,
          children: wkChildren,
          num_rooms: wkNumRooms,
          source: wkSource,
          room_preference: wkRoomPreference,
          bed_type: wkBedType,
          discount_pct: wkDiscountPct,
          discount_code: wkDiscountCode,
          guarantee_type: wkGuaranteeType,
          send_confirm_email: wkSendConfirmEmail
        }),
      });
      let data;
      try { data = await res.json(); } catch { throw new Error(\`Server returned status \${res.status} (\${res.statusText})\`); }
      if (data.success) { setWkResult(data.reservation); setWkSuccess(true); fetchInHouse(); fetchArrivals(arrivalDate); }
      else setWkError(data.message || \`Server error \${res.status}\`);
    } catch (e) { setWkError(e.message || 'Network error — is the server running?'); }
    setWkSubmitting(false);
  };

  const resetWalkin = () => {
    setWkTitle('Mr.'); setWkLastName(''); setWkFirstName(''); setWkMiddleName('');
    setWkGender('Male'); setWkBirthDate(''); setWkNationality('Filipino'); setWkCountry('Philippines');
    setWkEmail(''); setWkPhone(''); setWkAddress(''); setWkCity('');
    setWkIdType('Passport'); setWkIdNumber('');
    setWkRoomType(wkRoomTypes[0]?.name || ''); setWkRateCode('');
    setWkCheckIn(today); setWkCheckOut(''); setWkEta(''); setWkGuests(1); setWkRoomNumber('');
    setWkPurpose('Leisure'); setWkPaymentMethod('Credit Card'); setWkDepositAmount('');
    setWkPayment(false); setWkSpecialReq(''); setWkNotes('');
    setWkSuccess(false); setWkResult(null); setWkError('');
    setWkCompany(''); setWkAddToProfile(true); setWkVipGuest(false); setWkRepeatGuest(false);
    setWkCheckInTime('14:00'); setWkCheckOutTime('12:00'); setWkAdults(2); setWkChildren(1); setWkNumRooms(1);
    setWkSource('Direct Booking'); setWkRoomPreference('High Floor'); setWkBedType('Queen Bed');
    setWkDiscountPct(10); setWkDiscountCode('BDAY10'); setWkCardType('Visa'); setWkCardNumberFull('');
    setWkCardExpiry(''); setWkCardCvv(''); setWkCardholder(''); setWkGuaranteeType('Guarantee by Credit Card');
    setWkGuaranteeAmount(''); setWkSendConfirmEmail(true); setWkSearchGuest('');
  };`;

content = content.replace(oldSubmitReset, newSubmitReset);

fs.writeFileSync('src/App.jsx', content, 'utf8');
console.log('App.jsx patched successfully');
