const fs = require('fs');
const file = 'c:\\website\\northomes-system\\src\\App.jsx';
let content = fs.readFileSync(file, 'utf8');

// Replacement 1: FrontDeskTab prop signature
const target1 = "function FrontDeskTab({ reservations = [], printGuestDataSheet, pendingCheckInRes, setPendingCheckInRes }) {";
const replacement1 = "function FrontDeskTab({ reservations = [], printGuestDataSheet, pendingCheckInRes, setPendingCheckInRes, roomTypes = [] }) {";

// Replacement 2: Rendering FrontDeskTab inside App component
const target2 = "<FrontDeskTab openFolio={openFolio} reservations={reservations} printGuestDataSheet={printGuestDataSheet} pendingCheckInRes={pendingCheckInRes} setPendingCheckInRes={setPendingCheckInRes} />";
const replacement2 = "<FrontDeskTab openFolio={openFolio} reservations={reservations} printGuestDataSheet={printGuestDataSheet} pendingCheckInRes={pendingCheckInRes} setPendingCheckInRes={setPendingCheckInRes} roomTypes={adminRoomTypes} />";

// Replacement 3: arrivals list totalAmt calculation
const target3 = `                              const nights = nightsCount(res);
                              const totalAmt = nights * 3500;`;
const replacement3 = `                              const getRoomRate = (t) => {
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

// Replacement 4: in-house list getRoomRate function
const target4 = `                                  const getRoomRate = (t) => {
                                    const type = (t || '').toLowerCase();
                                    if (type.includes('presidential')) return 25000;
                                    if (type.includes('suite')) return 9000;
                                    if (type.includes('family')) return 6500;
                                    if (type.includes('deluxe')) return 4500;
                                    return 2500; // Standard Room and fallback
                                  };`;
const replacement4 = `                                  const getRoomRate = (t) => {
                                    const matched = roomTypes.find(rt => rt.name === t);
                                    if (matched) return parseFloat(matched.price_per_night);
                                    const type = (t || '').toLowerCase();
                                    if (type.includes('presidential')) return 25000;
                                    if (type.includes('suite')) return 9000;
                                    if (type.includes('family')) return 6500;
                                    if (type.includes('deluxe')) return 4500;
                                    return 2500; // Standard Room and fallback
                                  };`;

// Replacement 5: printGuestDataSheet getRoomRate function
const target5 = `    const getRoomRate = (t) => {
      const type = (t || '').toLowerCase();
      if (type.includes('presidential')) return 25000;
      if (type.includes('suite')) return 9000;
      if (type.includes('family')) return 6500;
      if (type.includes('deluxe')) return 4500;
      return 2500; // Standard Room and fallback
    };`;
const replacement5 = `    const getRoomRate = (t) => {
      const matched = adminRoomTypes.find(rt => rt.name === t);
      if (matched) return parseFloat(matched.price_per_night);
      const type = (t || '').toLowerCase();
      if (type.includes('presidential')) return 25000;
      if (type.includes('suite')) return 9000;
      if (type.includes('family')) return 6500;
      if (type.includes('deluxe')) return 4500;
      return 2500; // Standard Room and fallback
    };`;

function replaceAll(target, repl) {
  if (content.includes(target)) {
    content = content.replace(target, repl);
    console.log('Direct match replacement successful.');
  } else if (content.includes(target.replace(/\r/g, ''))) {
    content = content.replace(target.replace(/\r/g, ''), repl);
    console.log('Normalized line endings match replacement successful.');
  } else {
    console.log('Target NOT found for replacement.');
  }
}

console.log('Applying replacement 1:');
replaceAll(target1, replacement1);

console.log('Applying replacement 2:');
replaceAll(target2, replacement2);

console.log('Applying replacement 3:');
replaceAll(target3, replacement3);

console.log('Applying replacement 4:');
replaceAll(target4, replacement4);

console.log('Applying replacement 5:');
replaceAll(target5, replacement5);

fs.writeFileSync(file, content, 'utf8');
console.log('App.jsx pricing updates written.');
