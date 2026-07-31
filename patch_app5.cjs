const fs = require('fs');
let content = fs.readFileSync('src/App.jsx', 'utf8');

// 1. Move the ConfirmModal UI back to before {editModal && (
const startStr = '      {confirmModal && (() => {';
const addPayOpenStr = '      {addPayOpen && (() => {';

let startIndex = content.indexOf(startStr);
let endIndex = content.indexOf(addPayOpenStr, startIndex);

if (startIndex !== -1 && endIndex !== -1) {
  // Extract block (subtract 7 chars for the newline and spaces before {addPayOpen)
  const blockToMove = content.substring(startIndex, endIndex - 7);
  
  // Fix the block to use confirmAllRooms instead of rooms
  const fixedBlock = blockToMove.replace('const typeRooms = rooms.filter', 'const typeRooms = confirmAllRooms.filter');
  
  // Remove block from current position
  content = content.replace(blockToMove, '');
  
  // Insert before {editModal && (
  content = content.replace('{editModal && (', fixedBlock + '\n      {editModal && (');
  console.log('UI block moved back and fixed.');
} else {
  console.log('UI block not found at bottom.');
}

// 2. Add confirmAllRooms state
if (!content.includes('const [confirmAllRooms')) {
  content = content.replace(
    'const [confirmOccupiedRooms, setConfirmOccupiedRooms] = React.useState([]);',
    'const [confirmOccupiedRooms, setConfirmOccupiedRooms] = React.useState([]);\n  const [confirmAllRooms, setConfirmAllRooms] = React.useState([]);'
  );
  console.log('Added confirmAllRooms state.');
}

// 3. Update handleOpenConfirmModal to fetch rooms
const oldHandler = `
  const handleOpenConfirmModal = async (res) => {
    setConfirmModal(res);
    setConfirmRoomNumber(res.room_number || '');
    try {
      const checkIn = res.check_in_date ? res.check_in_date.slice(0, 10) : res.preferred_date;
      const checkOut = res.check_out_date ? res.check_out_date.slice(0, 10) : res.preferred_date;
      const resp = await fetch(\`\${API_BASE_URL}/api/rooms/occupied?checkIn=\${checkIn}&checkOut=\${checkOut}&ignoreReservationId=\${res.id || res.dbId || ''}\`);
      const data = await resp.json();
      if (data.success) {
        setConfirmOccupiedRooms(data.occupiedRooms);
      }
    } catch (e) {
      console.error(e);
      setConfirmOccupiedRooms([]);
    }
  };`;

const newHandler = `
  const handleOpenConfirmModal = async (res) => {
    setConfirmModal(res);
    setConfirmRoomNumber(res.room_number || '');
    try {
      const checkIn = res.check_in_date ? res.check_in_date.slice(0, 10) : res.preferred_date;
      const checkOut = res.check_out_date ? res.check_out_date.slice(0, 10) : res.preferred_date;
      
      const [occResp, roomsResp] = await Promise.all([
        fetch(\`\${API_BASE_URL}/api/rooms/occupied?checkIn=\${checkIn}&checkOut=\${checkOut}&ignoreReservationId=\${res.id || res.dbId || ''}\`),
        fetch(\`\${API_BASE_URL}/api/rooms\`)
      ]);
      
      const occData = await occResp.json();
      if (occData.success) {
        setConfirmOccupiedRooms(occData.occupiedRooms);
      }
      
      const roomsData = await roomsResp.json();
      if (roomsData.rooms) {
        setConfirmAllRooms(roomsData.rooms);
      }
    } catch (e) {
      console.error(e);
      setConfirmOccupiedRooms([]);
      setConfirmAllRooms([]);
    }
  };`;

if (content.includes('const resp = await fetch(`${API_BASE_URL}/api/rooms/occupied')) {
  // It's a bit hard to replace the exact multiline string because of whitespace variations.
  // We can just replace the function body using a regex.
  content = content.replace(
    /const handleOpenConfirmModal = async \(res\) => \{[\s\S]*?setConfirmOccupiedRooms\(\[\]\);\s*\}\s*\};\s*/,
    newHandler + '\n\n'
  );
  console.log('Updated handleOpenConfirmModal.');
}

fs.writeFileSync('src/App.jsx', content, 'utf8');
console.log('App.jsx fixed successfully.');
