const fs = require('fs');
let content = fs.readFileSync('src/App.jsx', 'utf8');

// 1. Add States
const stateAnchor = '  const [editModal, setEditModal] = useState(null);';
const newStates = `
  const [confirmModal, setConfirmModal] = React.useState(null);
  const [confirmRoomNumber, setConfirmRoomNumber] = React.useState('');
  const [confirmOccupiedRooms, setConfirmOccupiedRooms] = React.useState([]);

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
  };

  const submitConfirmBooking = () => {
    if (!confirmModal) return;
    const id = confirmModal.id || confirmModal.dbId;
    updateStatus(id, 'confirmed', confirmRoomNumber);
    setConfirmModal(null);
  };
`;
if (!content.includes('const [confirmModal')) {
  content = content.replace(stateAnchor, stateAnchor + '\n' + newStates);
}

// 2. Update updateStatus 1 (line 2590)
content = content.replace(
  'const updateStatus = async (id, newStatus) => {',
  'const updateStatus = async (id, newStatus, roomNumber) => {'
);
content = content.replace(
  'body: JSON.stringify({ status: newStatus })',
  'body: JSON.stringify({ status: newStatus, room_number: roomNumber })'
);

// 3. Update updateStatus 2 (line 11533)
content = content.replace(
  'const updateStatus = async (id, status) => {',
  'const updateStatus = async (id, status, roomNumber) => {'
);
content = content.replace(
  'body: JSON.stringify({ status }),',
  'body: JSON.stringify({ status, room_number: roomNumber }),'
);

// 4. AdminOnlineReservationsTab
content = content.replace(
  'updateStatus={updateStatus}',
  'updateStatus={updateStatus} openConfirmModal={handleOpenConfirmModal}'
);

fs.writeFileSync('src/App.jsx', content, 'utf8');
console.log('App.jsx partially updated');
