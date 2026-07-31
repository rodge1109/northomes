const fs = require('fs');

// 1. Patch server/index.js
let serverContent = fs.readFileSync('server/index.js', 'utf8');
const deleteEndpoint = `
app.delete('/api/reservations/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const check = await pool.query('SELECT status FROM hotel_reservations WHERE id = $1', [id]);
    if (check.rows.length === 0) return res.status(404).json({ success: false, message: 'Reservation not found.' });
    if (check.rows[0].status !== 'cancelled') return res.status(400).json({ success: false, message: 'Only cancelled reservations can be deleted.' });

    await pool.query('DELETE FROM hotel_folio_items WHERE reservation_id = $1', [id]);
    await pool.query('DELETE FROM hotel_folio_payments WHERE reservation_id = $1', [id]);
    await pool.query('DELETE FROM hotel_reservations WHERE id = $1', [id]);
    
    res.json({ success: true, message: 'Reservation deleted.' });
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});
`;

if (!serverContent.includes("app.delete('/api/reservations/:id'")) {
  serverContent = serverContent.replace(
    /app\.patch\('\/api\/reservations\/:id\/edit',/,
    `${deleteEndpoint}\napp.patch('/api/reservations/:id/edit',`
  );
  fs.writeFileSync('server/index.js', serverContent, 'utf8');
}

// 2. Patch App.jsx
let appContent = fs.readFileSync('src/App.jsx', 'utf8');
const deleteFunc = `
  const deleteReservation = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this cancelled booking?")) return;
    try {
      const response = await fetch(\`\${API_BASE_URL}/api/reservations/\${id}\`, { method: 'DELETE' });
      const data = await response.json();
      if (data.success) {
        setReservations(prev => prev.filter(apt => apt.id !== id));
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('Error deleting:', error);
    }
  };
`;

if (!appContent.includes("const deleteReservation = async")) {
  appContent = appContent.replace(
    /const updateStatus = async \(id, newStatus, roomNumber\) => \{/,
    `${deleteFunc}\n\n  const updateStatus = async (id, newStatus, roomNumber) => {`
  );
  
  appContent = appContent.replace(
    /<AdminOnlineReservationsTab reservations=\{reservations \|\| \[\]\} stats=\{stats \|\| \{\}\} updateStatus=\{updateStatus\}/,
    `<AdminOnlineReservationsTab reservations={reservations || []} stats={stats || {}} updateStatus={updateStatus} deleteReservation={deleteReservation}`
  );
  fs.writeFileSync('src/App.jsx', appContent, 'utf8');
}

// 3. Patch AdminOnlineReservationsTab.jsx
let adminResContent = fs.readFileSync('src/AdminOnlineReservationsTab.jsx', 'utf8');
if (!adminResContent.includes("deleteReservation={deleteReservation}")) {
  // Update props
  adminResContent = adminResContent.replace(
    /export default function AdminOnlineReservationsTab\(\{([^}]+)\}\) \{/,
    `export default function AdminOnlineReservationsTab({$1, deleteReservation}) {`
  );
  
  // Add Delete button
  const deleteBtn = `
                                {(res.status === 'cancelled') && deleteReservation && (
                                  <button 
                                    onClick={() => { deleteReservation(res.dbId); setOpenDropdown(null); }}
                                    className="w-full px-4 py-2 text-left text-[12px] font-bold text-red-700 hover:bg-red-50 flex items-center gap-2"
                                  >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                                    Delete Booking
                                  </button>
                                )}
`;
  
  // Find where Cancel Booking is, and add Delete Booking after it
  adminResContent = adminResContent.replace(
    /(Cancel Booking\s*<\/button>\s*\)}?)/,
    `$1${deleteBtn}`
  );
  
  fs.writeFileSync('src/AdminOnlineReservationsTab.jsx', adminResContent, 'utf8');
}

console.log('Successfully added delete reservation feature.');
