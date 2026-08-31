const fs = require('fs');
let c = fs.readFileSync('src/App.jsx', 'utf8');

const regex = /const printGuestDataSheet = \(res\) => \{[\s\S]*?const totalAmt = nights \* rate;/;

const replacement = `const printGuestDataSheet = (originalRes) => {
      if (!originalRes) return;
      
      // Consolidate reservations for the same guest and dates
      const group = (typeof reservations !== 'undefined' ? reservations : []).filter(r => 
        r.full_name === originalRes.full_name && 
        r.check_in_date === originalRes.check_in_date && 
        r.check_out_date === originalRes.check_out_date
      );
      const activeGroup = group.length > 0 ? group : [originalRes];

      const getRoomRate = (roomTypeName, rateCodeCode) => {
        if (rateCodeCode) {
          const matchedRc = typeof adminRateCodes !== 'undefined' ? adminRateCodes.find(rc => rc.code === rateCodeCode) : null;
          if (matchedRc && matchedRc.prices) {
            const priceObj = matchedRc.prices.find(p => p.room_type_name === roomTypeName);
            if (priceObj && priceObj.price_per_night) {
              return parseFloat(priceObj.price_per_night);
            }
          }
        }
        const matched = typeof adminRoomTypes !== 'undefined' ? adminRoomTypes.find(rt => rt.name === roomTypeName) : null;
        if (matched) return parseFloat(matched.price_per_night);
        const type = (roomTypeName || '').toLowerCase();
        if (type.includes('presidential')) return 25000;
        if (type.includes('suite')) return 9000;
        if (type.includes('family')) return 6500;
        if (type.includes('deluxe')) return 4500;
        return 2500;
      };

      const combinedRoomNumber = activeGroup.map(r => r.room_number || 'TBA').join(', ');
      const combinedRoomType = [...new Set(activeGroup.map(r => r.room_type || ''))].join(' + ');
      const combinedGuests = activeGroup.reduce((sum, r) => sum + (r.number_of_guests || 1), 0);
      
      const nights = Math.max(1, Math.round((new Date(originalRes.check_out_date || originalRes.check_in_date) - new Date(originalRes.check_in_date)) / 86400000));
      const totalAmt = activeGroup.reduce((sum, r) => sum + (nights * getRoomRate(r.room_type, r.rate_code)), 0);

      // Create a unified object for printing
      const res = {
         ...originalRes,
         room_number: combinedRoomNumber,
         room_type: combinedRoomType,
         number_of_guests: combinedGuests
      };

      const fmtD = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';
      const fmtCurrency = (n) => \`₱\${parseFloat(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\`;

      // Parse name parts using robust parser
      const parsedName = parseFullName(res.full_name);
      const { last, first, mi } = parsedName;

      const rate = getRoomRate(originalRes.room_type, originalRes.rate_code); // display rate of first room`;

if(regex.test(c)) {
    c = c.replace(regex, replacement);
    fs.writeFileSync('src/App.jsx', c);
    console.log("Patched successfully!");
} else {
    console.log("Regex not found!");
}
