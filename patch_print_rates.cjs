const fs = require('fs');
const file = 'c:\\website\\northomes-system\\src\\App.jsx';
let content = fs.readFileSync(file, 'utf8');

let wasCRLF = content.includes('\r\n');
if (wasCRLF) {
  content = content.replace(/\r\n/g, '\n');
}

const regex5 = /const getRoomRate = \(t\) => \{\n\s*const matched = \(typeof roomTypes !== 'undefined' \? roomTypes : adminRoomTypes\)\.find\(rt => rt\.name === t\);\n\s*if \(matched\) return parseFloat\(matched\.price_per_night\);\n\s*const type = \(t \|\| ''\)\.toLowerCase\(\);\n\s*if \(type\.includes\('presidential'\)\) return 25000;\n\s*if \(type\.includes\('suite'\)\) return 9000;\n\s*if \(type\.includes\('family'\)\) return 6500;\n\s*if \(type\.includes\('deluxe'\)\) return 4500;\n\s*return 2500; \/\/ Standard Room and fallback\n\s*\};\n\s*const rate = getRoomRate\(res\.room_type\);/g;

const replacement5 = `const getRoomRate = (roomTypeName, rateCodeCode) => {
      if (rateCodeCode) {
        const matchedRc = adminRateCodes.find(rc => rc.code === rateCodeCode);
        if (matchedRc && matchedRc.prices) {
          const priceObj = matchedRc.prices.find(p => p.room_type_name === roomTypeName);
          if (priceObj && priceObj.price_per_night) {
            return parseFloat(priceObj.price_per_night);
          }
        }
      }
      const matched = adminRoomTypes.find(rt => rt.name === roomTypeName);
      if (matched) return parseFloat(matched.price_per_night);
      const type = (roomTypeName || '').toLowerCase();
      if (type.includes('presidential')) return 25000;
      if (type.includes('suite')) return 9000;
      if (type.includes('family')) return 6500;
      if (type.includes('deluxe')) return 4500;
      return 2500; // Standard Room and fallback
    };
    const rate = getRoomRate(res.room_type, res.rate_code);`;

if (regex5.test(content)) {
  content = content.replace(regex5, replacement5);
  console.log('Regex 5 successfully updated!');
} else {
  console.log('Regex 5 NOT matched.');
}

if (wasCRLF) {
  content = content.replace(/\n/g, '\r\n');
}

fs.writeFileSync(file, content, 'utf8');
console.log('Completed.');
