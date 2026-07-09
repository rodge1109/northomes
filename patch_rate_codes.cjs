const fs = require('fs');
const file = 'c:\\website\\northomes-system\\src\\App.jsx';
let content = fs.readFileSync(file, 'utf8');

// Normalize line endings to LF
let wasCRLF = content.includes('\r\n');
if (wasCRLF) {
  content = content.replace(/\r\n/g, '\n');
}

// 1. Signature of FrontDeskTab
const target1 = "function FrontDeskTab({ reservations = [], printGuestDataSheet, pendingCheckInRes, setPendingCheckInRes, roomTypes = [] }) {";
const replacement1 = "function FrontDeskTab({ reservations = [], printGuestDataSheet, pendingCheckInRes, setPendingCheckInRes, roomTypes = [], rateCodes = [] }) {";

// 2. App rendering FrontDeskTab
const target2 = "<FrontDeskTab openFolio={openFolio} reservations={reservations} printGuestDataSheet={printGuestDataSheet} pendingCheckInRes={pendingCheckInRes} setPendingCheckInRes={setPendingCheckInRes} roomTypes={adminRoomTypes} />";
const replacement2 = "<FrontDeskTab openFolio={openFolio} reservations={reservations} printGuestDataSheet={printGuestDataSheet} pendingCheckInRes={pendingCheckInRes} setPendingCheckInRes={setPendingCheckInRes} roomTypes={adminRoomTypes} rateCodes={adminRateCodes} />";

// 3. arrivals getRoomRate and totalAmt calculation
// We look for:
// const getRoomRate = (t) => { ... }; const nights = nightsCount(res); const totalAmt = nights * getRoomRate(res.room_type);
const regex3 = /const getRoomRate = \(t\) => \{\n\s*const matched = roomTypes\.find\(rt => rt\.name === t\);\n\s*if \(matched\) return parseFloat\(matched\.price_per_night\);\n\s*const type = \(t \|\| ''\)\.toLowerCase\(\);\n\s*if \(type\.includes\('presidential'\)\) return 25000;\n\s*if \(type\.includes\('suite'\)\) return 9000;\n\s*if \(type\.includes\('family'\)\) return 6500;\n\s*if \(type\.includes\('deluxe'\)\) return 4500;\n\s*return 2500;\n\s*\};\n\s*const nights = nightsCount\(res\);\n\s*const totalAmt = nights \* getRoomRate\(res\.room_type\);/g;

const replacement3 = `const getRoomRate = (roomTypeName, rateCodeCode) => {
                                if (rateCodeCode) {
                                  const matchedRc = rateCodes.find(rc => rc.code === rateCodeCode);
                                  if (matchedRc && matchedRc.prices) {
                                    const priceObj = matchedRc.prices.find(p => p.room_type_name === roomTypeName);
                                    if (priceObj && priceObj.price_per_night) {
                                      return parseFloat(priceObj.price_per_night);
                                    }
                                  }
                                }
                                const matched = roomTypes.find(rt => rt.name === roomTypeName);
                                if (matched) return parseFloat(matched.price_per_night);
                                const type = (roomTypeName || '').toLowerCase();
                                if (type.includes('presidential')) return 25000;
                                if (type.includes('suite')) return 9000;
                                if (type.includes('family')) return 6500;
                                if (type.includes('deluxe')) return 4500;
                                return 2500;
                              };
                              const nights = nightsCount(res);
                              const totalAmt = nights * getRoomRate(res.room_type, res.rate_code);`;

// 4. in-house getRoomRate calculation
// We look for:
// const getRoomRate = (t) => { ... }; const totalAmt = nights * getRoomRate(res.room_type);
const regex4 = /const getRoomRate = \(t\) => \{\n\s*const matched = \(typeof roomTypes !== 'undefined' \? roomTypes : adminRoomTypes\)\.find\(rt => rt\.name === t\);\n\s*if \(matched\) return parseFloat\(matched\.price_per_night\);\n\s*const type = \(t \|\| ''\)\.toLowerCase\(\);\n\s*if \(type\.includes\('presidential'\)\) return 25000;\n\s*if \(type\.includes\('suite'\)\) return 9000;\n\s*if \(type\.includes\('family'\)\) return 6500;\n\s*if \(type\.includes\('deluxe'\)\) return 4500;\n\s*return 2500; \/\/ Standard Room and fallback\n\s*\};\n\s*const totalAmt = nights \* getRoomRate\(res\.room_type\);/g;

const replacement4 = `const getRoomRate = (roomTypeName, rateCodeCode) => {
                                    if (rateCodeCode) {
                                      const matchedRc = rateCodes.find(rc => rc.code === rateCodeCode);
                                      if (matchedRc && matchedRc.prices) {
                                        const priceObj = matchedRc.prices.find(p => p.room_type_name === roomTypeName);
                                        if (priceObj && priceObj.price_per_night) {
                                          return parseFloat(priceObj.price_per_night);
                                        }
                                      }
                                    }
                                    const matched = roomTypes.find(rt => rt.name === roomTypeName);
                                    if (matched) return parseFloat(matched.price_per_night);
                                    const type = (roomTypeName || '').toLowerCase();
                                    if (type.includes('presidential')) return 25000;
                                    if (type.includes('suite')) return 9000;
                                    if (type.includes('family')) return 6500;
                                    if (type.includes('deluxe')) return 4500;
                                    return 2500; // Standard Room and fallback
                                  };
                                  const totalAmt = nights * getRoomRate(res.room_type, res.rate_code);`;

// 5. printGuestDataSheet getRoomRate
const regex5 = /const getRoomRate = \(t\) => \{\n\s*const matched = adminRoomTypes\.find\(rt => rt\.name === t\);\n\s*if \(matched\) return parseFloat\(matched\.price_per_night\);\n\s*const type = \(t \|\| ''\)\.toLowerCase\(\);\n\s*if \(type\.includes\('presidential'\)\) return 25000;\n\s*if \(type\.includes\('suite'\)\) return 9000;\n\s*if \(type\.includes\('family'\)\) return 6500;\n\s*if \(type\.includes\('deluxe'\)\) return 4500;\n\s*return 2500; \/\/ Standard Room and fallback\n\s*\};\n\s*const rate = getRoomRate\(res\.room_type\);/g;

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


function replaceAll(target, repl) {
  if (content.includes(target)) {
    content = content.replace(target, repl);
    console.log('Direct replacement successful.');
  } else {
    console.log('Direct replacement target NOT found.');
  }
}

console.log('Replacing signature:');
replaceAll(target1, replacement1);

console.log('Replacing render:');
replaceAll(target2, replacement2);

console.log('Replacing regex 3:');
if (regex3.test(content)) {
  content = content.replace(regex3, replacement3);
  console.log('Regex 3 successful.');
} else {
  console.log('Regex 3 failed.');
}

console.log('Replacing regex 4:');
if (regex4.test(content)) {
  content = content.replace(regex4, replacement4);
  console.log('Regex 4 successful.');
} else {
  console.log('Regex 4 failed.');
}

console.log('Replacing regex 5:');
if (regex5.test(content)) {
  content = content.replace(regex5, replacement5);
  console.log('Regex 5 successful.');
} else {
  console.log('Regex 5 failed.');
}

// Restore CRLF if needed
if (wasCRLF) {
  content = content.replace(/\n/g, '\r\n');
}

fs.writeFileSync(file, content, 'utf8');
console.log('Done.');
