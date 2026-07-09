const fs = require('fs');
const file = 'c:\\website\\northomes-system\\src\\App.jsx';
let content = fs.readFileSync(file, 'utf8');

// Normalize line endings to LF for easier regex matching
let wasCRLF = content.includes('\r\n');
if (wasCRLF) {
  content = content.replace(/\r\n/g, '\n');
}

// 1. arrivals list totalAmt calculation
const regex3 = /const nights = nightsCount\(res\);\n\s*const totalAmt = nights \* 3500;/g;
const replacement3 = `const getRoomRate = (t) => {
                                const matched = roomTypes.find(rt => rt.name === t);
                                if (matched) return parseFloat(matched.price_per_night);
                                const type = (t || '').toLowerCase();
                                if (type.includes('presidential')) return 25000;
                                if (type.includes('suite')) return 9000;
                                if (type.includes('family')) return 6500;
                                if (type.includes('deluxe')) return 4500;
                                return 2500;
                              };
                              const nights = nightsCount(res);
                              const totalAmt = nights * getRoomRate(res.room_type);`;

if (regex3.test(content)) {
  content = content.replace(regex3, replacement3);
  console.log('Replacement 3 successful.');
} else {
  console.log('Replacement 3 failed.');
}

// 2. getRoomRate (both in-house list and printGuestDataSheet)
const regex4 = /const getRoomRate = \(t\) => \{\n\s*const type = \(t \|\| ''\)\.toLowerCase\(\);\n\s*if \(type\.includes\('presidential'\)\) return 25000;\n\s*if \(type\.includes\('suite'\)\) return 9000;\n\s*if \(type\.includes\('family'\)\) return 6500;\n\s*if \(type\.includes\('deluxe'\)\) return 4500;\n\s*return 2500; \/\/ Standard Room and fallback\n\s*\};/g;

const replacement4 = `const getRoomRate = (t) => {
      const matched = (typeof roomTypes !== 'undefined' ? roomTypes : adminRoomTypes).find(rt => rt.name === t);
      if (matched) return parseFloat(matched.price_per_night);
      const type = (t || '').toLowerCase();
      if (type.includes('presidential')) return 25000;
      if (type.includes('suite')) return 9000;
      if (type.includes('family')) return 6500;
      if (type.includes('deluxe')) return 4500;
      return 2500; // Standard Room and fallback
    };`;

if (regex4.test(content)) {
  content = content.replace(regex4, replacement4);
  console.log('Replacement 4 & 5 successful.');
} else {
  console.log('Replacement 4 & 5 failed.');
}

// Restore line endings
if (wasCRLF) {
  content = content.replace(/\n/g, '\r\n');
}

fs.writeFileSync(file, content, 'utf8');
console.log('Done.');
