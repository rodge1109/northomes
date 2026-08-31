const fs = require('fs');
let content = fs.readFileSync('src/App.jsx', 'utf8');

// 1. State Replacement
content = content.replace(
  /const \[wkRoomType, setWkRoomType\] = React\.useState\(''\);\s*const \[wkRoomNumber, setWkRoomNumber\] = React\.useState\(''\);/,
  \const [wkRoomSelections, setWkRoomSelections] = React.useState([{ roomType: '', roomNumber: '' }]);\
);

// 2. Fetch Room Types Side Effect
content = content.replace(
  /setWkRoomTypes\(list\);\s*if \(list\.length > 0\) setWkRoomType\(rt => rt \|\| list\[0\]\.name\);/g,
  \setWkRoomTypes(list);
      if (list.length > 0) {
        setWkRoomSelections(prev => {
          if (!prev[0].roomType) {
            const next = [...prev];
            next[0].roomType = list[0].name;
            return next;
          }
          return prev;
        });
      }\
);

// 3. resetWalkin
content = content.replace(
  /setWkRoomType\(wkRoomTypes\[0\]\?\.name \|\| ''\); setWkRateCode\(''\);\s*setWkCheckIn\(today\); setWkCheckOut\(''\); setWkEta\(''\); setWkGuests\(1\); setWkRoomNumber\(''\);/g,
  \setWkRoomSelections([{ roomType: wkRoomTypes[0]?.name || '', roomNumber: '' }]); setWkRateCode('');
    setWkCheckIn(today); setWkCheckOut(''); setWkEta(''); setWkGuests(1);\
);

// 4. submitWalkin validation
content = content.replace(
  /if \(!wkLastName\.trim\(\) \|\| !wkFirstName\.trim\(\) \|\| !wkRoomType \|\| !wkCheckIn \|\| !wkCheckOut \|\| !wkRoomNumber\.trim\(\)\) \{/g,
  \const hasEmptyRoom = wkRoomSelections.some(r => !r.roomType || !r.roomNumber);
    if (!wkLastName.trim() || !wkFirstName.trim() || !wkCheckIn || !wkCheckOut || hasEmptyRoom) {\
);

// 5. submitWalkin body
const oldSubmitBody = \const res = await fetch(\\\\/api/front-desk/walkin\\\, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: \\\\, \\\\\,
          title: wkTitle, gender: wkGender, birth_date: wkBirthDate,
          nationality: wkNationality, country: wkCountry,
          email: wkEmail.trim(), phone: wkPhone.trim(),
          address: wkAddress.trim(), city: wkCity.trim(),
          id_type: wkIdType, id_number: wkIdNumber.trim(),
          room_type: wkRoomType, rate_code: wkRateCode,
          check_in_date: wkCheckIn, check_out_date: wkCheckOut,
          eta: wkEta, number_of_guests: wkAdults + wkChildren, room_number: wkRoomNumber.trim(),
          purpose: wkPurpose, payment_method: wkPaymentMethod, deposit_amount: wkGuaranteeAmount || 0,
          payment_collected: wkPayment, special_requests: wkSpecialReq.trim(), notes: wkNotes.trim(), add_to_profile: wkAddToProfile, is_vip: wkVipGuest, is_repeat: wkRepeatGuest,
        }),
      });
      let data;
      try { data = await res.json(); } catch { throw new Error(\\\Server returned status \ (\)\\\); }
      if (data.success) { setWkResult(data.reservation); setWkSuccess(true); fetchInHouse(); fetchArrivals(arrivalDate); }
      else setWkError(data.message || \\\Server error \\\\);\;

const newSubmitBody = \let firstReservation = null;
      for (let i = 0; i < wkRoomSelections.length; i++) {
        const sel = wkRoomSelections[i];
        const res = await fetch(\\\\/api/front-desk/walkin\\\, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            full_name: \\\\, \\\\\,
            title: wkTitle, gender: wkGender, birth_date: wkBirthDate,
            nationality: wkNationality, country: wkCountry,
            email: wkEmail.trim(), phone: wkPhone.trim(),
            address: wkAddress.trim(), city: wkCity.trim(),
            id_type: wkIdType, id_number: wkIdNumber.trim(),
            room_type: sel.roomType, rate_code: wkRateCode,
            check_in_date: wkCheckIn, check_out_date: wkCheckOut,
            eta: wkEta, number_of_guests: Math.ceil((wkAdults + wkChildren) / wkRoomSelections.length),
            room_number: sel.roomNumber.trim(),
            purpose: wkPurpose, payment_method: wkPaymentMethod, 
            deposit_amount: i === 0 ? (wkGuaranteeAmount || 0) : 0,
            payment_collected: wkPayment, special_requests: wkSpecialReq.trim(), notes: wkNotes.trim(), 
            add_to_profile: wkAddToProfile, is_vip: wkVipGuest, is_repeat: wkRepeatGuest,
          }),
        });
        let data;
        try { data = await res.json(); } catch { throw new Error(\\\Server returned status \\\\); }
        if (!data.success) {
           setWkError(data.message || \\\Server error \\\\); return;
        }
        if (i === 0) firstReservation = data.reservation;
      }
      setWkResult(firstReservation); setWkSuccess(true); fetchInHouse(); fetchArrivals(arrivalDate);\;

content = content.replace(oldSubmitBody, newSubmitBody);

fs.writeFileSync('src/App.jsx', content, 'utf8');
console.log('Patch step 1 applied.');

