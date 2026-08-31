const fs = require('fs');
let c = fs.readFileSync('src/App.jsx', 'utf8');

const regex = /try\s*\{\s*const res = await fetch\(`\$\{API_BASE_URL\}\/api\/front-desk\/walkin`, \{[\s\S]*?\} catch \(e\) \{ setWkError\(e\.message \|\| 'Network error — is the server running\?'\); \}/;

const replacement = `try {
        let firstReservation = null;
        for (let i = 0; i < wkRoomSelections.length; i++) {
          const sel = wkRoomSelections[i];
          const guestsPerRoom = Math.max(1, Math.ceil((wkAdults + wkChildren) / wkRoomSelections.length));
          
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
              room_type: sel.roomType, rate_code: wkRateCode,
              check_in_date: wkCheckIn, check_out_date: wkCheckOut,
              eta: wkEta, number_of_guests: guestsPerRoom, room_number: sel.roomNumber,
              purpose: wkPurpose, payment_method: wkPaymentMethod, deposit_amount: i === 0 ? (wkGuaranteeAmount || 0) : 0,
              payment_collected: wkPayment, special_requests: wkSpecialReq.trim(), notes: wkNotes.trim(), add_to_profile: wkAddToProfile, is_vip: wkVipGuest, is_repeat: wkRepeatGuest,
            }),
          });
          let data;
          try { data = await res.json(); } catch { throw new Error(\`Server returned status \${res.status} (\${res.statusText})\`); }
          
          if (!data.success) {
            setWkError(data.message || \`Server error \${res.status}\`);
            setWkSubmitting(false);
            return;
          }
          if (i === 0) firstReservation = data.reservation;
        }
        
        setWkResult(firstReservation);
        setWkSuccess(true);
        fetchInHouse();
        fetchArrivals(arrivalDate);
      } catch (e) { setWkError(e.message || 'Network error — is the server running?'); }`;

if(regex.test(c)) {
    c = c.replace(regex, replacement);
    fs.writeFileSync('src/App.jsx', c);
    console.log("Patched successfully!");
} else {
    console.log("Regex not found!");
}
