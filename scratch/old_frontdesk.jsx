function FrontDeskTab() {
  const today = new Date().toISOString().split('T')[0];
  const [fdView, setFdView] = React.useState('arrivals');

  // Arrivals state
  const [arrivalDate, setArrivalDate] = React.useState(today);
  const [arrivals, setArrivals] = React.useState([]);
  const [arrivalStats, setArrivalStats] = React.useState({ total: 0, checkedIn: 0, pending: 0, confirmed: 0, noShow: 0 });
  const [arrivalsLoading, setArrivalsLoading] = React.useState(false);
  const [selectedArrival, setSelectedArrival] = React.useState(null);
  const [guestNotes, setGuestNotes] = React.useState({});

  // In-House state
  const [inHouseGuests, setInHouseGuests] = React.useState([]);
  const [inHouseLoading, setInHouseLoading] = React.useState(false);

  // Search state
  const [searchQ, setSearchQ] = React.useState('');
  const [searchResults, setSearchResults] = React.useState([]);
  const [searchLoading, setSearchLoading] = React.useState(false);

  // Wizard state
  const [wizardOpen, setWizardOpen] = React.useState(false);
  const [wizardReservation, setWizardReservation] = React.useState(null);
  const [wizardStep, setWizardStep] = React.useState(1);
  const [wizardIdVerified, setWizardIdVerified] = React.useState(false);
  const [wizardRoomNumber, setWizardRoomNumber] = React.useState('');
  const [wizardPayment, setWizardPayment] = React.useState(false);
  const [wizardNotes, setWizardNotes] = React.useState('');
  const [wizardSubmitting, setWizardSubmitting] = React.useState(false);
  const [wizardSuccess, setWizardSuccess] = React.useState(false);
  const [wizardError, setWizardError] = React.useState('');

  // Checkout confirm state
  const [checkoutConfirmId, setCheckoutConfirmId] = React.useState(null);
  const [checkoutSubmitting, setCheckoutSubmitting] = React.useState(false);

  // Transfer / upgrade state
  const [transferGuest, setTransferGuest] = React.useState(null);
  const [transferRoomType, setTransferRoomType] = React.useState('');
  const [transferRoomNumber, setTransferRoomNumber] = React.useState('');
  const [transferSubmitting, setTransferSubmitting] = React.useState(false);
  const [transferError, setTransferError] = React.useState('');
  const [transferSuccess, setTransferSuccess] = React.useState('');

  // Status update state
  const [statusUpdating, setStatusUpdating] = React.useState(null);

  // ── Folio state ──────────────────────────────────────────────────────────────
  const [folioOpen, setFolioOpen] = React.useState(false);
  const [folioRes, setFolioRes] = React.useState(null);
  const [folioItems, setFolioItems] = React.useState([]);
  const [folioPayments, setFolioPayments] = React.useState([]);
  const [folioTotals, setFolioTotals] = React.useState({ charges: 0, payments: 0, balance: 0 });
  const [folioLoading, setFolioLoading] = React.useState(false);
  const [folioError, setFolioError] = React.useState('');
  // Add charge form
  const [fcType, setFcType] = React.useState('Room Charge');
  const [fcDesc, setFcDesc] = React.useState('');
  const [fcQty, setFcQty] = React.useState(1);
  const [fcPrice, setFcPrice] = React.useState('');
  const [fcSaving, setFcSaving] = React.useState(false);
  const [fcError, setFcError] = React.useState('');
  // Add payment form
  const [fpMethod, setFpMethod] = React.useState('Cash');
  const [fpAmount, setFpAmount] = React.useState('');
  const [fpRef, setFpRef] = React.useState('');
  const [fpSaving, setFpSaving] = React.useState(false);
  const [fpError, setFpError] = React.useState('');
  // Checkout folio balance
  const [checkoutFolioBalance, setCheckoutFolioBalance] = React.useState(null);
  // Folio email
  const [folioEmailSending, setFolioEmailSending] = React.useState(false);
  const [folioEmailMsg, setFolioEmailMsg] = React.useState('');

  // Guest Profile modal state
  const [gpOpen, setGpOpen] = React.useState(false);
  const [gpRes, setGpRes] = React.useState(null);
  const [gpForm, setGpForm] = React.useState({});
  const [gpSaving, setGpSaving] = React.useState(false);
  const [gpError, setGpError] = React.useState('');
  const [gpSaved, setGpSaved] = React.useState(false);

  // Walk-In state
  const [wkRoomTypes, setWkRoomTypes] = React.useState([]);
  const [wkRateCodes, setWkRateCodes] = React.useState([]);
  const [wkRateCode, setWkRateCode] = React.useState('');
  const [wkLastName, setWkLastName] = React.useState('');
  const [wkFirstName, setWkFirstName] = React.useState('');
  const [wkEmail, setWkEmail] = React.useState('');
  const [wkPhone, setWkPhone] = React.useState('');
  const [wkRoomType, setWkRoomType] = React.useState('');
  const [wkCheckIn, setWkCheckIn] = React.useState(today);
  const [wkCheckOut, setWkCheckOut] = React.useState('');
  const [wkGuests, setWkGuests] = React.useState(1);
  const [wkRoomNumber, setWkRoomNumber] = React.useState('');
  const [wkSpecialReq, setWkSpecialReq] = React.useState('');
  const [wkPayment, setWkPayment] = React.useState(false);
  const [wkNotes, setWkNotes] = React.useState('');
  const [wkTitle, setWkTitle] = React.useState('Mr.');
  const [wkMiddleName, setWkMiddleName] = React.useState('');
  const [wkGender, setWkGender] = React.useState('');
  const [wkBirthDate, setWkBirthDate] = React.useState('');
  const [wkNationality, setWkNationality] = React.useState('');
  const [wkCountry, setWkCountry] = React.useState('');
  const [wkAddress, setWkAddress] = React.useState('');
  const [wkCity, setWkCity] = React.useState('');
  const [wkIdType, setWkIdType] = React.useState('');
  const [wkIdNumber, setWkIdNumber] = React.useState('');
  const [wkPurpose, setWkPurpose] = React.useState('');
  const [wkEta, setWkEta] = React.useState('');
  const [wkPaymentMethod, setWkPaymentMethod] = React.useState('Cash');
  const [wkDepositAmount, setWkDepositAmount] = React.useState('');
  const [wkSubmitting, setWkSubmitting] = React.useState(false);
  const [wkSuccess, setWkSuccess] = React.useState(false);
  const [wkResult, setWkResult] = React.useState(null);
  const [wkError, setWkError] = React.useState('');

  // ── Rooms state ─────────────────────────────────────────────────────────────
  const [rooms, setRooms] = React.useState([]);
  const [roomsLoading, setRoomsLoading] = React.useState(false);
  const [roomFilter, setRoomFilter] = React.useState('all');
  const [selectedRoom, setSelectedRoom] = React.useState(null);
  const [hkUpdating, setHkUpdating] = React.useState(null);

  // ── Tape Chart state ─────────────────────────────────────────────────────────
  const [tcFrom, setTcFrom] = React.useState(today);
  const [tcRooms, setTcRooms] = React.useState([]);
  const [tcReservations, setTcReservations] = React.useState([]);
  const [tcLoading, setTcLoading] = React.useState(false);
  const [tcSelectedRes, setTcSelectedRes] = React.useState(null);
  const [tcTypeView, setTcTypeView] = React.useState(false);
  const [addRoomOpen, setAddRoomOpen] = React.useState(false);
  const [newRoomNumber, setNewRoomNumber] = React.useState('');
  const [newRoomType, setNewRoomType] = React.useState('');
  const [newRoomFloor, setNewRoomFloor] = React.useState(1);

  // ── Data fetchers ──────────────────────────────────────────────────────────
  const fetchArrivals = React.useCallback(async (date) => {
    setArrivalsLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/front-desk/arrivals?date=${date}`);
      const data = await res.json();
      const fresh = data.arrivals || [];
      setArrivals(fresh);
      setArrivalStats(data.stats || { total: 0, checkedIn: 0, pending: 0, confirmed: 0, noShow: 0 });
      setSelectedArrival(prev => prev ? (fresh.find(r => r.id === prev.id) ?? null) : null);
    } catch (e) { console.error(e); }
    setArrivalsLoading(false);
  }, []);

  const fetchInHouse = React.useCallback(async () => {
    setInHouseLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/front-desk/in-house');
      const data = await res.json();
      setInHouseGuests(data.guests || []);
    } catch (e) { console.error(e); }
    setInHouseLoading(false);
  }, []);

  const runSearch = React.useCallback(async (q) => {
    if (!q.trim()) { setSearchResults([]); return; }
    setSearchLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/front-desk/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setSearchResults(data.reservations || []);
    } catch (e) { console.error(e); }
    setSearchLoading(false);
  }, []);

  React.useEffect(() => { fetchArrivals(arrivalDate); }, [arrivalDate, fetchArrivals]);
  React.useEffect(() => { if (fdView === 'inhouse') fetchInHouse(); }, [fdView, fetchInHouse]);

  React.useEffect(() => {
    const t = setTimeout(() => runSearch(searchQ), 350);
    return () => clearTimeout(t);
  }, [searchQ, runSearch]);

  // ── Wizard helpers ─────────────────────────────────────────────────────────
  const openWizard = (r) => {
    setWizardReservation(r);
    setWizardStep(1);
    setWizardIdVerified(false);
    setWizardRoomNumber('');
    setWizardPayment(false);
    setWizardNotes('');
    setWizardSubmitting(false);
    setWizardSuccess(false);
    setWizardError('');
    setWizardOpen(true);
    fetchRooms();
  };

  const closeWizard = () => {
    setWizardOpen(false);
    setWizardReservation(null);
    setWizardSuccess(false);
    fetchArrivals(arrivalDate);
    fetchInHouse();
  };

  const submitCheckin = async () => {
    if (!wizardReservation) return;
    setWizardSubmitting(true);
    setWizardError('');
    try {
      const res = await fetch(`http://localhost:5000/api/reservations/${wizardReservation.id}/checkin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomNumber: wizardRoomNumber,
          idVerified: wizardIdVerified,
          paymentCollected: wizardPayment,
          notes: wizardNotes,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setWizardSuccess(true);
      } else {
        setWizardError(data.message || `Check-in failed (${res.status}).`);
      }
    } catch (e) {
      setWizardError('Network error — is the server running?');
    }
    setWizardSubmitting(false);
  };

  const submitCheckout = async (id) => {
    setCheckoutSubmitting(true);
    try {
      const res = await fetch(`http://localhost:5000/api/reservations/${id}/checkout`, { method: 'POST' });
      if (res.ok) {
        setCheckoutConfirmId(null);
        fetchInHouse();
        fetchArrivals(arrivalDate);
      }
    } catch (e) { console.error(e); }
    setCheckoutSubmitting(false);
  };

  // ── Folio functions ───────────────────────────────────────────────────────────
  const fetchFolio = React.useCallback(async (reservationId) => {
    setFolioLoading(true);
    setFolioError('');
    try {
      const res = await fetch(`http://localhost:5000/api/folio/${reservationId}`);
      const data = await res.json();
      if (data.success) {
        setFolioItems(data.items);
        setFolioPayments(data.payments);
        setFolioTotals(data.totals);
      } else {
        setFolioError(data.message || 'Failed to load folio');
      }
    } catch (e) { setFolioError('Server error'); }
    setFolioLoading(false);
  }, []);

  const openFolio = (r) => {
    setFolioRes(r);
    setFolioItems([]);
    setFolioPayments([]);
    setFolioTotals({ charges: 0, payments: 0, balance: 0 });
    setFolioError('');
    setFcType('Room Charge'); setFcDesc(''); setFcQty(1); setFcPrice(''); setFcError('');
    setFpMethod('Cash'); setFpAmount(''); setFpRef(''); setFpError('');
    setFolioEmailMsg('');
    setFolioOpen(true);
    fetchFolio(r.id);
  };

  const addCharge = async () => {
    if (!fcPrice || isNaN(parseFloat(fcPrice))) { setFcError('Enter a valid price'); return; }
    setFcSaving(true); setFcError('');
    try {
      const res = await fetch(`http://localhost:5000/api/folio/${folioRes.id}/charge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ charge_type: fcType, description: fcDesc, quantity: fcQty, unit_price: fcPrice }),
      });
      const data = await res.json();
      if (data.success) { fetchFolio(folioRes.id); setFcDesc(''); setFcQty(1); setFcPrice(''); }
      else setFcError(data.message || 'Failed');
    } catch (e) { setFcError('Server error'); }
    setFcSaving(false);
  };

  const addPayment = async () => {
    if (!fpAmount || isNaN(parseFloat(fpAmount))) { setFpError('Enter a valid amount'); return; }
    setFpSaving(true); setFpError('');
    try {
      const res = await fetch(`http://localhost:5000/api/folio/${folioRes.id}/payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payment_method: fpMethod, amount: fpAmount, reference: fpRef }),
      });
      const data = await res.json();
      if (data.success) { fetchFolio(folioRes.id); setFpAmount(''); setFpRef(''); }
      else setFpError(data.message || 'Failed');
    } catch (e) { setFpError('Server error'); }
    setFpSaving(false);
  };

  const voidCharge = async (itemId) => {
    await fetch(`http://localhost:5000/api/folio/charge/${itemId}/void`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ void_reason: '' }),
    });
    fetchFolio(folioRes.id);
  };

  const voidPayment = async (payId) => {
    await fetch(`http://localhost:5000/api/folio/payment/${payId}/void`, { method: 'PATCH' });
    fetchFolio(folioRes.id);
  };

  const fetchCheckoutBalance = React.useCallback(async (id) => {
    setCheckoutFolioBalance(null);
    try {
      const res = await fetch(`http://localhost:5000/api/folio/${id}`);
      const data = await res.json();
      if (data.success) setCheckoutFolioBalance(data.totals.balance);
    } catch (e) {}
  }, []);

  const sendFolioEmail = async () => {
    if (!folioRes) return;
    setFolioEmailSending(true);
    setFolioEmailMsg('');
    try {
      const res = await fetch(`http://localhost:5000/api/folio/${folioRes.id}/email`, { method: 'POST' });
      const data = await res.json();
      setFolioEmailMsg(data.success ? `✓ ${data.message}` : `✗ ${data.message}`);
    } catch (e) {
      setFolioEmailMsg('✗ Failed to send email.');
    } finally {
      setFolioEmailSending(false);
      setTimeout(() => setFolioEmailMsg(''), 4000);
    }
  };

  const printFolio = () => {
    if (!folioRes) return;
    const fmtD = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';
    const fmtA = (n) => `₱${parseFloat(n).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`;
    const nights = Math.round((new Date(folioRes.check_out_date) - new Date(folioRes.check_in_date)) / 86400000);
    const totalCharges = folioTotals.charges;
    const totalPaid = folioTotals.payments;
    const balance = folioTotals.balance;

    const chargeRows = folioItems.map(i => `
      <tr style="${i.voided ? 'opacity:0.4;text-decoration:line-through;' : ''}">
        <td>${i.charge_type}</td><td>${i.description || '—'}</td>
        <td style="text-align:center;">${i.quantity}</td>
        <td style="text-align:right;">${fmtA(i.unit_price)}</td>
        <td style="text-align:right;">${i.voided ? 'VOID' : fmtA(i.amount)}</td>
      </tr>`).join('');

    const paymentRows = folioPayments.map(p => `
      <tr style="${p.voided ? 'opacity:0.4;text-decoration:line-through;' : ''}">
        <td>${p.payment_method}</td><td>${p.reference || '—'}</td>
        <td style="text-align:right;">${p.voided ? 'VOID' : fmtA(p.amount)}</td>
        <td style="color:#888;">${fmtD(p.posted_at)}</td>
      </tr>`).join('');

    const win = window.open('', '_blank', 'width=700,height=900');
    win.document.write(`<!DOCTYPE html><html><head><title>Folio — ${folioRes.full_name}</title>
      <style>
        body{font-family:Arial,sans-serif;max-width:640px;margin:32px auto;padding:0 24px;color:#222;}
        h2{margin:0 0 4px;} p.sub{margin:0 0 20px;color:#666;font-size:13px;}
        table{width:100%;border-collapse:collapse;font-size:13px;margin-bottom:16px;}
        th{background:#f5f5f5;padding:6px 8px;text-align:left;}
        td{padding:6px 8px;border-bottom:1px solid #f0f0f0;}
        .total-row{font-weight:bold;background:#eff6ff;}
        .paid-row{font-weight:bold;background:#f0fdf4;}
        .balance{margin-top:16px;padding:14px;border-radius:6px;text-align:right;font-size:15px;font-weight:bold;}
        .bal-due{background:#fef3c7;color:#b45309;}
        .bal-ok{background:#f0fdf4;color:#15803d;}
        @media print{button{display:none;}}
      </style></head><body>
      <h2>Guest Folio</h2>
      <p class="sub">${folioRes.full_name} &middot; Room ${folioRes.room_number || '—'} &middot; ${folioRes.room_type}</p>
      <table style="margin-bottom:20px;">
        <tr><td style="color:#666;width:120px;">Check-in</td><td>${fmtD(folioRes.check_in_date)}</td></tr>
        <tr><td style="color:#666;">Check-out</td><td>${fmtD(folioRes.check_out_date)}</td></tr>
        <tr><td style="color:#666;">Nights</td><td>${nights}</td></tr>
      </table>
      <h3 style="margin:0 0 6px;border-bottom:1px solid #ddd;padding-bottom:4px;">Charges</h3>
      ${folioItems.length === 0 ? '<p style="color:#999;font-size:13px;">No charges posted.</p>' : `
      <table>
        <thead><tr><th>Type</th><th>Description</th><th style="text-align:center;">Qty</th><th style="text-align:right;">Unit Price</th><th style="text-align:right;">Amount</th></tr></thead>
        <tbody>${chargeRows}</tbody>
        <tfoot><tr class="total-row"><td colspan="4" style="text-align:right;">Total Charges</td><td style="text-align:right;">${fmtA(totalCharges)}</td></tr></tfoot>
      </table>`}
      <h3 style="margin:0 0 6px;border-bottom:1px solid #ddd;padding-bottom:4px;">Payments</h3>
      ${folioPayments.length === 0 ? '<p style="color:#999;font-size:13px;">No payments recorded.</p>' : `
      <table>
        <thead><tr><th>Method</th><th>Reference</th><th style="text-align:right;">Amount</th><th>Date</th></tr></thead>
        <tbody>${paymentRows}</tbody>
        <tfoot><tr class="paid-row"><td colspan="2" style="text-align:right;">Total Paid</td><td style="text-align:right;">${fmtA(totalPaid)}</td><td></td></tr></tfoot>
      </table>`}
      <div class="balance ${balance > 0 ? 'bal-due' : 'bal-ok'}">
        ${balance > 0 ? `Balance Due: ${fmtA(balance)}` : 'Folio Settled ✓'}
      </div>
      <script>window.onload=()=>{window.print();}</script>
    </body></html>`);
    win.document.close();
  };

  const openTransfer = (r) => {
    setTransferGuest(r);
    setTransferRoomType(''); // Start with empty to show all available rooms
    setTransferRoomNumber('');
    setTransferError('');
    setTransferSuccess('');
    fetchRooms();
    fetchWkRoomTypes('', '');
  };

  const submitTransfer = async () => {
    if (!transferGuest || !transferRoomNumber.trim()) return;
    setTransferSubmitting(true);
    setTransferError('');
    try {
      const res = await fetch(`http://localhost:5000/api/reservations/${transferGuest.id}/transfer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newRoomNumber: transferRoomNumber.trim(), newRoomType: transferRoomType }),
      });
      const data = await res.json();
      if (data.success) {
        setTransferSuccess(`Transferred to Room ${transferRoomNumber}`);
        fetchInHouse();
        fetchRooms();
        setTimeout(() => setTransferGuest(null), 1500);
      } else {
        setTransferError(data.message || 'Transfer failed.');
      }
    } catch (e) {
      setTransferError('Network error — is the server running?');
    }
    setTransferSubmitting(false);
  };

  const updateStatus = async (id, status) => {
    setStatusUpdating(id);
    try {
      await fetch(`http://localhost:5000/api/reservations/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      fetchArrivals(arrivalDate);
      if (fdView === 'inhouse') fetchInHouse();
      if (fdView === 'search') runSearch(searchQ);
    } catch (e) { console.error(e); }
    setStatusUpdating(null);
  };

  // ── Walk-In helpers ──────────────────────────────────────────────────────────
  const fetchWkRoomTypes = React.useCallback(async (checkIn, checkOut) => {
    try {
      const url = (checkIn && checkOut)
        ? `http://localhost:5000/api/room-types/availability?checkIn=${checkIn}&checkOut=${checkOut}`
        : 'http://localhost:5000/api/room-types';
      const res = await fetch(url);
      const data = await res.json();
      const list = data.availability || data.roomTypes || [];
      setWkRoomTypes(list);
      if (list.length > 0) setWkRoomType(rt => rt || list[0].name);
    } catch (e) { console.error(e); }
  }, []);

  React.useEffect(() => {
    if (fdView === 'walkin') fetchWkRoomTypes(wkCheckIn, wkCheckOut);
    else if (fdView === 'rooms') fetchWkRoomTypes('', '');
  }, [fdView, wkCheckIn, wkCheckOut, fetchWkRoomTypes]);

  React.useEffect(() => {
    if (fdView === 'walkin' && wkRateCodes.length === 0) {
      fetch('http://localhost:5000/api/rate-codes')
        .then(r => r.json())
        .then(d => { if (d.rateCodes) setWkRateCodes(d.rateCodes); })
        .catch(() => {});
    }
  }, [fdView]);

  const submitWalkin = async () => {
    if (!wkLastName.trim() || !wkFirstName.trim() || !wkRoomType || !wkCheckIn || !wkCheckOut || !wkRoomNumber.trim()) {
      setWkError('Please fill in all required fields (last name, first name, room type, dates, room number).'); return;
    }
    if (new Date(wkCheckOut) <= new Date(wkCheckIn)) {
      setWkError('Check-out date must be after check-in date.'); return;
    }
    setWkError(''); setWkSubmitting(true);
    try {
      const res = await fetch('http://localhost:5000/api/front-desk/walkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: `${wkLastName.trim()}, ${wkFirstName.trim()}${wkMiddleName.trim() ? ' ' + wkMiddleName.trim() : ''}`,
          title: wkTitle, gender: wkGender, birth_date: wkBirthDate,
          nationality: wkNationality, country: wkCountry,
          email: wkEmail.trim(), phone: wkPhone.trim(),
          address: wkAddress.trim(), city: wkCity.trim(),
          id_type: wkIdType, id_number: wkIdNumber.trim(),
          room_type: wkRoomType, rate_code: wkRateCode,
          check_in_date: wkCheckIn, check_out_date: wkCheckOut,
          eta: wkEta, number_of_guests: wkGuests, room_number: wkRoomNumber.trim(),
          purpose: wkPurpose, payment_method: wkPaymentMethod, deposit_amount: wkDepositAmount || 0,
          payment_collected: wkPayment, special_requests: wkSpecialReq.trim(), notes: wkNotes.trim(),
        }),
      });
      let data;
      try { data = await res.json(); } catch { throw new Error(`Server returned status ${res.status} (${res.statusText})`); }
      if (data.success) { setWkResult(data.reservation); setWkSuccess(true); fetchInHouse(); fetchArrivals(arrivalDate); }
      else setWkError(data.message || `Server error ${res.status}`);
    } catch (e) { setWkError(e.message || 'Network error — is the server running?'); }
    setWkSubmitting(false);
  };

  const resetWalkin = () => {
    setWkTitle('Mr.'); setWkLastName(''); setWkFirstName(''); setWkMiddleName('');
    setWkGender(''); setWkBirthDate(''); setWkNationality(''); setWkCountry('');
    setWkEmail(''); setWkPhone(''); setWkAddress(''); setWkCity('');
    setWkIdType(''); setWkIdNumber('');
    setWkRoomType(wkRoomTypes[0]?.name || ''); setWkRateCode('');
    setWkCheckIn(today); setWkCheckOut(''); setWkEta(''); setWkGuests(1); setWkRoomNumber('');
    setWkPurpose(''); setWkPaymentMethod('Cash'); setWkDepositAmount('');
    setWkPayment(false); setWkSpecialReq(''); setWkNotes('');
    setWkSuccess(false); setWkResult(null); setWkError('');
  };

  // ── Guest Profile helpers ──────────────────────────────────────────────────
  const openGuestProfile = (r) => {
    setGpRes(r);
    // Parse full_name back into parts — stored as "LastName, FirstName MiddleName"
    const nameParts = (r.full_name || '').split(',');
    const lastName = (nameParts[0] || '').trim();
    const restParts = (nameParts[1] || '').trim().split(' ');
    const firstName = restParts[0] || '';
    const middleName = restParts.slice(1).join(' ');
    setGpForm({
      title: r.title || '',
      last_name: lastName,
      first_name: firstName,
      middle_name: r.middle_name || middleName,
      gender: r.gender || '',
      date_of_birth: r.date_of_birth ? r.date_of_birth.slice(0, 10) : '',
      nationality: r.nationality || '',
      country: r.country || '',
      email: r.email || '',
      phone_number: r.phone_number || '',
      address: r.address || '',
      city: r.city || '',
      id_type: r.id_type || '',
      id_number: r.id_number || '',
      purpose_of_visit: r.purpose_of_visit || '',
      eta: r.eta || '',
      payment_method: r.payment_method || '',
      deposit_amount: r.deposit_amount != null ? r.deposit_amount : '',
      special_requests: r.special_requests || '',
      front_desk_notes: r.front_desk_notes || '',
    });
    setGpError(''); setGpSaved(false);
    setGpOpen(true);
  };

  const saveGuestProfile = async () => {
    if (!gpRes) return;
    setGpSaving(true); setGpError(''); setGpSaved(false);
    try {
      const full_name = `${gpForm.last_name.trim()}, ${gpForm.first_name.trim()}${gpForm.middle_name.trim() ? ' ' + gpForm.middle_name.trim() : ''}`;
      const res = await fetch(`http://localhost:5000/api/reservations/${gpRes.id}/profile`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...gpForm, full_name }),
      });
      const data = await res.json();
      if (data.success) {
        setGpSaved(true);
        setGpRes(data.reservation);
        fetchInHouse();
        fetchArrivals(arrivalDate);
      } else setGpError(data.message || 'Failed to save.');
    } catch (e) { setGpError('Network error.'); }
    setGpSaving(false);
  };

  // ── Helpers ────────────────────────────────────────────────────────────────
  const statusColors = {
    pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-300', bar: 'bg-yellow-400' },
    confirmed: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-300', bar: 'bg-blue-500' },
    checked_in: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-300', bar: 'bg-green-500' },
    checked_out: { bg: 'bg-gray-100', text: 'text-gray-600', border: 'border-gray-300', bar: 'bg-gray-400' },
    cancelled: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-300', bar: 'bg-red-400' },
    no_show: { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-300', bar: 'bg-orange-400' },
  };

  const statusLabel = (s) => ({
    pending: 'Pending', confirmed: 'Confirmed', checked_in: 'Checked In',
    checked_out: 'Checked Out', cancelled: 'Cancelled', no_show: 'No Show',
  }[s] || s);

  const nightsCount = (r) => {
    const d1 = new Date(r.check_in_date), d2 = new Date(r.check_out_date);
    return Math.round((d2 - d1) / 86400000);
  };

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

  // ── Rooms functions ──────────────────────────────────────────────────────────
  const fetchRooms = React.useCallback(async () => {
    setRoomsLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/rooms');
      const data = await res.json();
      setRooms(data.rooms || []);
    } catch (e) { console.error(e); }
    setRoomsLoading(false);
  }, []);

  React.useEffect(() => { if (fdView === 'rooms' || fdView === 'walkin' || fdView === 'calendar') fetchRooms(); }, [fdView, fetchRooms]);

  const fetchTapeChart = React.useCallback(async (from) => {
    setTcLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/front-desk/tape-chart?from=${from}`);
      const data = await res.json();
      if (data.success) { setTcRooms(data.rooms || []); setTcReservations(data.reservations || []); setTcTypeView(!!data.typeView); }
    } catch (e) { console.error(e); }
    setTcLoading(false);
  }, []);

  React.useEffect(() => { if (fdView === 'calendar') fetchTapeChart(tcFrom); }, [fdView, tcFrom, fetchTapeChart]);

  const updateHkStatus = async (roomNumber, status) => {
    setHkUpdating(roomNumber);
    try {
      await fetch(`http://localhost:5000/api/rooms/${encodeURIComponent(roomNumber)}/hk-status`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      await fetchRooms();
      setSelectedRoom(prev => prev && prev.room_number === roomNumber ? { ...prev, hk_status: status } : prev);
    } catch (e) { console.error(e); }
    setHkUpdating(null);
  };

  const addRoom = async () => {
    if (!newRoomNumber.trim()) return;
    try {
      await fetch('http://localhost:5000/api/rooms', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ room_number: newRoomNumber.trim(), room_type: newRoomType, floor: newRoomFloor }),
      });
      setAddRoomOpen(false); setNewRoomNumber(''); setNewRoomType(''); setNewRoomFloor(1);
      fetchRooms();
    } catch (e) { console.error(e); }
  };

  const removeRoom = async (roomNumber) => {
    await fetch(`http://localhost:5000/api/rooms/${encodeURIComponent(roomNumber)}`, { method: 'DELETE' });
    setSelectedRoom(null);
    fetchRooms();
  };

  // ── Sub-components ──────────────────────────────────────────────────────────
  const roomStatusConfig = {
    available: { label: 'Available', bg: 'bg-green-500/20', border: 'border-green-400/30', text: 'text-green-300', dot: 'bg-green-400', pill: 'bg-green-500/25 text-green-200' },
    occupied: { label: 'Occupied', bg: 'bg-blue-500/20', border: 'border-blue-400/30', text: 'text-blue-300', dot: 'bg-blue-400', pill: 'bg-blue-500/25 text-blue-200' },
    due_out: { label: 'Due Out', bg: 'bg-orange-500/20', border: 'border-orange-400/30', text: 'text-orange-300', dot: 'bg-orange-400', pill: 'bg-orange-500/25 text-orange-200' },
    arriving: { label: 'Arriving', bg: 'bg-purple-500/20', border: 'border-purple-400/30', text: 'text-purple-300', dot: 'bg-purple-400', pill: 'bg-purple-500/25 text-purple-200' },
    dirty: { label: 'Dirty', bg: 'bg-yellow-500/20', border: 'border-yellow-400/30', text: 'text-yellow-300', dot: 'bg-yellow-400', pill: 'bg-yellow-500/25 text-yellow-200' },
    inspected: { label: 'Inspected', bg: 'bg-teal-500/20', border: 'border-teal-400/30', text: 'text-teal-300', dot: 'bg-teal-400', pill: 'bg-teal-500/25 text-teal-200' },
    out_of_order: { label: 'Out of Order', bg: 'bg-red-500/20', border: 'border-red-400/30', text: 'text-red-300', dot: 'bg-red-400', pill: 'bg-red-500/25 text-red-200' },
  };

  const RoomCard = ({ r }) => {
    const cfg = roomStatusConfig[r.computed_status] || roomStatusConfig.available;
    const isActive = ['occupied', 'due_out', 'arriving'].includes(r.computed_status);
    return (
      <button
        onClick={() => setSelectedRoom(r)}
        className={`relative rounded-xl border ${cfg.border} ${cfg.bg} p-3 text-left transition-all hover:scale-[1.03] hover:shadow-lg active:scale-100 w-full aspect-square flex flex-col justify-between`}
      >
        <div>
          <div className={`text-xl font-black font-mono ${cfg.text} leading-none`}>{r.room_number}</div>
          <div className="text-white/40 text-[10px] mt-0.5 truncate">{r.room_type || 'Room'}</div>
        </div>
        <div>
          {isActive && r.guest_name && (
            <div className="text-white/60 text-[10px] truncate mb-1">{r.guest_name.split(' ')[0]}</div>
          )}
          <div className="flex items-center gap-1">
            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
            <span className={`text-[10px] font-semibold ${cfg.text}`}>{cfg.label}</span>
          </div>
        </div>
        {hkUpdating === r.room_number && (
          <div className="absolute inset-0 bg-black/30 rounded-xl flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
          </div>
        )}
      </button>
    );
  };

  const ArrivalRow = ({ r }) => {
    const sc = statusColors[r.status] || statusColors.pending;
    const nights = nightsCount(r);
    const isSelected = selectedArrival?.id === r.id;
    return (
      <div
        onClick={() => setSelectedArrival(isSelected ? null : r)}
        className="grid items-center gap-x-3 px-3 cursor-pointer transition-all"
        style={{
          gridTemplateColumns: '1fr 6rem 6rem 2.5rem 5.5rem',
          height: '23px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          background: isSelected ? 'rgba(255,255,255,0.12)' : 'transparent',
        }}
      >
        <span className="text-[12px] font-semibold text-white truncate">{r.full_name}</span>
        <span className="text-[12px] text-white/45 truncate">{r.room_type_name || r.room_type}</span>
        <span className="text-[12px] text-white/40 font-mono">{fmtDate(r.check_in_date)}</span>
        <span className="text-[12px] text-white/35 text-center">{nights}n</span>
        <span className={`text-[12px] font-medium px-2 py-0.5 rounded-full text-center ${sc.bg} ${sc.text}`}>{statusLabel(r.status)}</span>
      </div>
    );
  };

  // ── Guest Profile Modal ────────────────────────────────────────────────────
  const GuestProfileModal = () => {
    if (!gpOpen || !gpRes) return null;
    const lbl = (text) => (
      <div className="text-[9px] font-bold tracking-[0.2em] text-white/30 uppercase mb-0.5">{text}</div>
    );
    const inp = (field, placeholder, type = 'text', extra = {}) => (
      <input type={type} placeholder={placeholder} value={gpForm[field] || ''}
        onChange={e => setGpForm(f => ({ ...f, [field]: e.target.value }))}
        className="w-full px-2 py-1 bg-white/8 border border-white/15 text-white text-[11px] rounded-sm outline-none focus:border-white/40 transition-colors"
        {...extra} />
    );
    const sel = (field, opts) => (
      <select value={gpForm[field] || ''} onChange={e => setGpForm(f => ({ ...f, [field]: e.target.value }))}
        className="w-full px-2 py-1 bg-[#1e2a3a] border border-white/15 text-white text-[11px] rounded-sm outline-none focus:border-white/40 transition-colors">
        <option value="">—</option>
        {opts.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    );
    const divider = (title) => (
      <div className="flex items-center gap-2 mt-3 mb-2">
        <span className="text-[9px] font-bold tracking-[0.2em] text-white/30 uppercase whitespace-nowrap">{title}</span>
        <div className="flex-1 h-px bg-white/10" />
      </div>
    );
    const nights = nightsCount(gpRes);
    return ReactDOM.createPortal(
      <div className="fixed inset-0 z-[70] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
        <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-xl overflow-hidden"
          style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.12)' }}>
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/10">
            <div>
              <div className="text-white font-semibold text-sm">Guest Profile</div>
              <div className="text-white/40 text-[11px] mt-0.5">
                Room {gpRes.room_number || '—'} &middot; {gpRes.room_type_name || gpRes.room_type} &middot; {fmtDate(gpRes.check_in_date)} – {fmtDate(gpRes.check_out_date)} ({nights} nights)
              </div>
            </div>
            <button onClick={() => setGpOpen(false)} className="text-white/30 hover:text-white text-lg leading-none transition-colors">&times;</button>
          </div>

          {/* Scrollable body */}
          <div className="flex-1 overflow-y-auto px-5 pb-5" style={{ scrollbarWidth: 'thin' }}>
            {divider('GUEST PROFILE')}
            <div className="grid grid-cols-4 gap-x-3 gap-y-2">
              <div>{lbl('Title')}{sel('title', ['Mr.','Mrs.','Ms.','Dr.','Prof.','Rev.'])}</div>
              <div>{lbl('Last Name *')}{inp('last_name', 'dela Cruz')}</div>
              <div>{lbl('First Name *')}{inp('first_name', 'Juan')}</div>
              <div>{lbl('Middle Name')}{inp('middle_name', '')}</div>
              <div>{lbl('Gender')}{sel('gender', ['Male','Female','Other','Prefer not to say'])}</div>
              <div>{lbl('Date of Birth')}{inp('date_of_birth', '', 'date')}</div>
              <div>{lbl('Nationality')}{inp('nationality', 'Filipino')}</div>
              <div>{lbl('Country')}{inp('country', 'Philippines')}</div>
            </div>

            {divider('CONTACT INFORMATION')}
            <div className="grid grid-cols-4 gap-x-3 gap-y-2">
              <div className="col-span-2">{lbl('Email')}{inp('email', 'guest@email.com', 'email')}</div>
              <div className="col-span-2">{lbl('Phone')}{inp('phone_number', '+63 9xx xxx xxxx', 'tel')}</div>
              <div className="col-span-2">{lbl('Address')}{inp('address', 'Street / Barangay')}</div>
              <div className="col-span-2">{lbl('City')}{inp('city', 'City / Municipality')}</div>
            </div>

            {divider('IDENTIFICATION')}
            <div className="grid grid-cols-4 gap-x-3 gap-y-2">
              <div className="col-span-2">{lbl('ID Type')}{sel('id_type', ['Passport','Driver\'s License','SSS','PhilHealth','UMID','PhilSys ID','Voter\'s ID','PRC ID','Other'])}</div>
              <div className="col-span-2">{lbl('ID Number')}{inp('id_number', 'ID number')}</div>
            </div>

            {divider('STAY & PAYMENT')}
            <div className="grid grid-cols-4 gap-x-3 gap-y-2">
              <div className="col-span-2">{lbl('Purpose of Visit')}{sel('purpose_of_visit', ['Leisure','Business','Event','Medical','Transit','Other'])}</div>
              <div>{lbl('ETA')}{inp('eta', '14:00', 'time')}</div>
              <div>{lbl('Payment Method')}{sel('payment_method', ['Cash','Credit Card','Debit Card','GCash','Bank Transfer','Other'])}</div>
              <div className="col-span-2">{lbl('Deposit Amount')}<input type="number" min="0" step="0.01" placeholder="0.00" value={gpForm.deposit_amount || ''}
                onChange={e => setGpForm(f => ({ ...f, deposit_amount: e.target.value }))}
                className="w-full px-2 py-1 bg-white/8 border border-white/15 text-white text-[11px] rounded-sm outline-none focus:border-white/40 transition-colors" /></div>
            </div>

            {divider('REMARKS')}
            <div className="grid grid-cols-2 gap-x-3 gap-y-2">
              <div>{lbl('Special Requests')}<textarea rows={3} placeholder="Guest requests..." value={gpForm.special_requests || ''}
                onChange={e => setGpForm(f => ({ ...f, special_requests: e.target.value }))}
                className="w-full px-2 py-1 bg-white/8 border border-white/15 text-white text-[11px] rounded-sm outline-none focus:border-white/40 transition-colors resize-none" /></div>
              <div>{lbl('FD Notes')}<textarea rows={3} placeholder="Internal notes..." value={gpForm.front_desk_notes || ''}
                onChange={e => setGpForm(f => ({ ...f, front_desk_notes: e.target.value }))}
                className="w-full px-2 py-1 bg-white/8 border border-white/15 text-white text-[11px] rounded-sm outline-none focus:border-white/40 transition-colors resize-none" /></div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-5 py-3 border-t border-white/10 flex items-center justify-between gap-3">
            <div className="text-xs">
              {gpError && <span className="text-red-400">{gpError}</span>}
              {gpSaved && !gpError && <span className="text-emerald-400">Profile saved ✓</span>}
            </div>
            <div className="flex gap-2">
              <button onClick={() => setGpOpen(false)}
                className="px-4 py-1.5 text-xs text-white/50 hover:text-white border border-white/15 rounded transition-colors">
                Close
              </button>
              <button onClick={saveGuestProfile} disabled={gpSaving}
                className="px-4 py-1.5 text-xs font-semibold bg-[#576CA8] hover:bg-[#4a5d9a] text-white rounded transition-colors disabled:opacity-50">
                {gpSaving ? 'Saving…' : 'Save Profile'}
              </button>
            </div>
          </div>
        </div>
      </div>,
      document.body
    );
  };

  const InHouseCard = ({ r }) => {
    const nights = nightsCount(r);
    const isDueOut = r.check_out_date && r.check_out_date.slice(0, 10) === today;
    return (
      <div className="grid items-center gap-x-3 px-3 py-2.5 transition-all"
        style={{ gridTemplateColumns: '3rem 1fr 7rem 5.5rem 2.5rem 3rem 3.5rem 3.5rem 5rem', borderBottom: `1px solid ${isDueOut ? 'rgba(251,191,36,0.2)' : 'rgba(255,255,255,0.06)'}`, background: isDueOut ? 'rgba(251,191,36,0.05)' : 'transparent' }}>
        {/* Room */}
        <span className={`font-mono font-bold text-sm ${isDueOut ? 'text-amber-300' : 'text-white/70'}`}>
          {r.room_number || '—'}
        </span>
        {/* Name */}
        <div className="flex items-center gap-2.5 min-w-0">
          <span className={`font-semibold text-sm truncate ${isDueOut ? 'text-amber-100' : 'text-white'}`}>{r.full_name}</span>
          {isDueOut && <span className="flex-shrink-0 text-[10px] font-bold uppercase tracking-wider text-amber-400">Due Out</span>}
        </div>
        {/* Room type */}
        <span className="text-xs text-white/35 truncate">{r.room_type_name || r.room_type}</span>
        {/* Check-out date */}
        <span className={`text-xs font-medium ${isDueOut ? 'text-amber-300' : 'text-white/40'}`}>{fmtDate(r.check_out_date)}</span>
        {/* Nights */}
        <span className="text-xs text-white/30 text-center">{nights}n</span>
        {/* Edit Profile */}
        <button onClick={() => openGuestProfile(r)}
          className="text-xs text-white/25 hover:text-violet-300 transition-all text-right">
          Edit
        </button>
        {/* Folio */}
        <button onClick={() => openFolio(r)}
          className="text-xs text-white/25 hover:text-emerald-300 transition-all text-right">
          Folio
        </button>
        {/* Transfer */}
        <button onClick={() => openTransfer(r)}
          className="text-xs text-white/25 hover:text-sky-300 transition-all text-right">
          Transfer
        </button>
        {/* Check Out */}
        <button onClick={() => { setCheckoutConfirmId(r.id); fetchCheckoutBalance(r.id); }}
          className={`text-xs font-semibold px-2 py-1 rounded transition-all text-right ${isDueOut ? 'text-amber-300 hover:text-amber-100' : 'text-white/30 hover:text-white/70'}`}>
          Check Out
        </button>
      </div>
    );
  };

  const SearchResultCard = ({ r }) => {
    const sc = statusColors[r.status] || statusColors.pending;
    const nights = nightsCount(r);
    return (
      <div className="relative rounded-xl border border-white/15 overflow-hidden flex" style={{ background: 'rgba(255,255,255,0.07)' }}>
        <div className={`w-1.5 flex-shrink-0 ${sc.bar}`} />
        <div className="flex-1 p-4 flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-white text-sm">{r.full_name}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${sc.bg} ${sc.text}`}>{statusLabel(r.status)}</span>
            </div>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className="text-xs text-white/60 bg-white/10 px-2 py-0.5 rounded-md">{r.room_type_name || r.room_type}</span>
              <span className="text-xs text-white/35 font-mono">#{r.id}</span>
              <span className="text-xs text-white/45">CI: {fmtDate(r.check_in_date)}</span>
              <span className="text-xs text-white/45">CO: {fmtDate(r.check_out_date)}</span>
              <span className="text-xs text-white/40">{nights} night{nights !== 1 ? 's' : ''}</span>
            </div>
            {r.room_number && <div className="text-xs text-green-300 mt-0.5">Room {r.room_number}</div>}
          </div>
          <div className="flex-shrink-0">
            {(r.status === 'pending' || r.status === 'confirmed') && (
              <button onClick={() => openWizard(r)} className="bg-gradient-to-br from-[#55A2F5] to-[#2D72C0] hover:opacity-90 text-white text-xs px-3 py-1.5 rounded-lg font-semibold transition-colors">Check In</button>
            )}
            {r.status === 'checked_in' && (
              <button onClick={() => setCheckoutConfirmId(r.id)} className="bg-red-500/15 hover:bg-red-500/25 border border-red-400/30 text-red-300 text-xs px-3 py-1.5 rounded-lg font-semibold transition-all">Check Out</button>
            )}
          </div>
        </div>
      </div>
    );
  };

  // ── Wizard Steps ────────────────────────────────────────────────────────────
  const WizardStepBar = () => {
    const steps = ['Guest ID', 'Reservation', 'Room', 'Payment'];
    return (
      <div className="flex items-center gap-0 mb-6">
        {steps.map((label, idx) => {
          const num = idx + 1;
          const active = num === wizardStep;
          const done = num < wizardStep;
          return (
            <React.Fragment key={num}>
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${done ? 'bg-green-500 text-white' : active ? 'bg-gradient-to-br from-[#55A2F5] to-[#2D72C0] text-white' : 'bg-gray-100 text-gray-400'}`}>
                  {done ? '✓' : num}
                </div>
                <span className={`text-xs mt-1 whitespace-nowrap ${active ? 'text-[#576CA8] font-semibold' : done ? 'text-green-600' : 'text-gray-400'}`}>{label}</span>
              </div>
              {idx < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-1 mb-5 transition-all ${done ? 'bg-green-400' : 'bg-gray-200'}`} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    );
  };

  const WizardStep1 = () => (
    <div>
      <h3 className="font-semibold text-gray-900 mb-1">Verify Guest Identity</h3>
      <p className="text-xs text-gray-500 mb-4">Ask the guest to present a valid government-issued photo ID.</p>
      <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 space-y-2 mb-3">
        <div className="flex justify-between text-sm"><span className="text-gray-500">Name</span><span className="font-medium text-gray-900">{wizardReservation?.full_name}</span></div>
        <div className="flex justify-between text-sm"><span className="text-gray-500">Email</span><span className="font-medium text-gray-900">{wizardReservation?.email || '—'}</span></div>
        <div className="flex justify-between text-sm"><span className="text-gray-500">Phone</span><span className="font-medium text-gray-900">{wizardReservation?.phone_number || '—'}</span></div>
        {wizardReservation?.nationality && <div className="flex justify-between text-sm"><span className="text-gray-500">Nationality</span><span className="font-medium text-gray-900">{wizardReservation.nationality}</span></div>}
        {wizardReservation?.id_type && <div className="flex justify-between text-sm"><span className="text-gray-500">ID</span><span className="font-medium text-gray-900">{wizardReservation.id_type} — {wizardReservation.id_number || '—'}</span></div>}
        <div className="flex justify-between text-sm"><span className="text-gray-500">Confirmation #</span><span className="font-mono text-[#576CA8] font-bold">{wizardReservation?.id}</span></div>
      </div>
      <button onClick={() => wizardReservation && openGuestProfile(wizardReservation)}
        className="w-full mb-4 py-1.5 text-xs text-[#576CA8] border border-[#576CA8]/30 rounded-lg hover:bg-[#576CA8]/5 transition-colors font-medium">
        ✏ Complete / Edit Guest Profile
      </button>
      <label className="flex items-start gap-3 cursor-pointer group">
        <input type="checkbox" checked={wizardIdVerified} onChange={(e) => setWizardIdVerified(e.target.checked)}
          className="mt-0.5 w-4 h-4 accent-[#576CA8] cursor-pointer" />
        <span className="text-sm text-gray-700 group-hover:text-gray-900">
          I have verified the guest&apos;s identity document and it matches the reservation.
        </span>
      </label>
    </div>
  );

  const WizardStep2 = () => {
    const nights = wizardReservation ? nightsCount(wizardReservation) : 0;
    return (
      <div>
        <h3 className="font-semibold text-gray-900 mb-1">Review Reservation</h3>
        <p className="text-xs text-gray-500 mb-4">Confirm all reservation details with the guest.</p>
        <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 space-y-2 mb-4">
          <div className="flex justify-between text-sm"><span className="text-gray-500">Room Type</span><span className="font-medium text-gray-900">{wizardReservation?.room_type_name || wizardReservation?.room_type}</span></div>
          <div className="flex justify-between text-sm"><span className="text-gray-500">Check-In</span><span className="font-medium text-gray-900">{fmtDate(wizardReservation?.check_in_date)}</span></div>
          <div className="flex justify-between text-sm"><span className="text-gray-500">Check-Out</span><span className="font-medium text-gray-900">{fmtDate(wizardReservation?.check_out_date)}</span></div>
          <div className="flex justify-between text-sm"><span className="text-gray-500">Nights</span><span className="font-medium text-gray-900">{nights}</span></div>
          <div className="flex justify-between text-sm"><span className="text-gray-500">Guests</span><span className="font-medium text-gray-900">{wizardReservation?.number_of_guests || 1}</span></div>
        </div>
        {wizardReservation?.special_requests && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
            <div className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-1">Special Requests</div>
            <p className="text-sm text-amber-800 italic">&ldquo;{wizardReservation.special_requests}&rdquo;</p>
          </div>
        )}
      </div>
    );
  };

  const WizardStep3 = () => {
    const roomType = wizardReservation?.room_type;
    const typeRooms = rooms.filter(r => r.room_type === roomType);
    const selRoom = typeRooms.find(r => r.room_number === wizardRoomNumber);
    const isBlocked = selRoom && (selRoom.computed_status === 'occupied' || selRoom.computed_status === 'arriving');
    const isWarn = selRoom && (selRoom.computed_status === 'dirty' || selRoom.computed_status === 'out_of_order');
    return (
      <div>
        <h3 className="font-semibold text-gray-900 mb-1">Assign Room</h3>
        <p className="text-xs text-gray-500 mb-4">Select an available room for this guest.</p>
        <div className="mb-4">
          <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Room Number</label>
          {typeRooms.length === 0 ? (
            <input
              type="text"
              value={wizardRoomNumber}
              onChange={(e) => setWizardRoomNumber(e.target.value)}
              placeholder="e.g. 201"
              autoComplete="off"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#576CA8] focus:ring-2 focus:ring-[#576CA8]/20 text-gray-900 text-lg font-mono font-bold outline-none transition-all"
              autoFocus
            />
          ) : (
            <div>
              <select
                value={wizardRoomNumber}
                onChange={(e) => setWizardRoomNumber(e.target.value)}
                style={{ background: '#f8fafc' }}
                className={`w-full px-4 py-3 rounded-xl border ${isBlocked ? 'border-red-300 bg-red-50' : 'border-gray-300'} focus:border-[#576CA8] focus:ring-2 focus:ring-[#576CA8]/20 text-gray-900 text-base font-mono font-bold outline-none transition-all`}
                autoFocus
              >
                <option value="" style={{ background: '#f8fafc', color: '#9ca3af' }}>— select room —</option>
                {typeRooms.map(r => {
                  const cfg = roomStatusConfig[r.computed_status] || roomStatusConfig.available;
                  const unavailable = r.computed_status === 'occupied' || r.computed_status === 'arriving';
                  return (
                    <option key={r.room_number} value={r.room_number} disabled={unavailable}
                      style={{ background: unavailable ? '#fef2f2' : '#f8fafc', color: unavailable ? '#ef4444' : '#111827' }}>
                      {`Room ${r.room_number}${r.floor ? ` · Fl.${r.floor}` : ''} — ${cfg.label}${unavailable ? ' (unavailable)' : ''}`}
                    </option>
                  );
                })}
              </select>
              {selRoom && (
                <div className={`mt-1.5 flex items-center gap-1.5 text-xs font-semibold ${isBlocked ? 'text-red-500' : isWarn ? 'text-amber-600' : 'text-green-600'}`}>
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${isBlocked ? 'bg-red-400' : isWarn ? 'bg-amber-400' : 'bg-green-400'}`} />
                  {isBlocked
                    ? `Room ${selRoom.room_number} is ${selRoom.computed_status === 'occupied' ? 'occupied' : 'arriving today'} — choose another room`
                    : isWarn
                      ? `Room ${selRoom.room_number} is ${selRoom.hk_status} — confirm it's ready before assigning`
                      : `Room ${selRoom.room_number} is available`}
                </div>
              )}
            </div>
          )}
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Front Desk Notes (optional)</label>
          <textarea
            value={wizardNotes}
            onChange={(e) => setWizardNotes(e.target.value)}
            placeholder="Any notes for housekeeping or other staff..."
            rows={3}
            className="w-full px-3 py-2.5 rounded-xl border border-gray-300 focus:border-[#576CA8] focus:ring-2 focus:ring-[#576CA8]/20 text-gray-900 text-sm outline-none transition-all resize-none"
          />
        </div>
      </div>
    );
  };

  const WizardStep4 = () => {
    const nights = wizardReservation ? nightsCount(wizardReservation) : 0;
    return (
      <div>
        <h3 className="font-semibold text-gray-900 mb-1">Payment &amp; Confirmation</h3>
        <p className="text-xs text-gray-500 mb-4">Collect payment and complete the check-in process.</p>
        <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 space-y-2 mb-4">
          <div className="flex justify-between text-sm"><span className="text-gray-500">Guest</span><span className="font-medium text-gray-900">{wizardReservation?.full_name}</span></div>
          <div className="flex justify-between text-sm"><span className="text-gray-500">Room Assigned</span><span className="font-bold text-[#576CA8] font-mono">{wizardRoomNumber || '—'}</span></div>
          <div className="flex justify-between text-sm"><span className="text-gray-500">Room Type</span><span className="font-medium text-gray-900">{wizardReservation?.room_type_name || wizardReservation?.room_type}</span></div>
          <div className="flex justify-between text-sm"><span className="text-gray-500">Check-Out</span><span className="font-medium text-gray-900">{fmtDate(wizardReservation?.check_out_date)}</span></div>
          <div className="flex justify-between text-sm"><span className="text-gray-500">Nights</span><span className="font-medium text-gray-900">{nights}</span></div>
          {wizardNotes && <div className="flex justify-between text-sm"><span className="text-gray-500">Notes</span><span className="text-gray-700 text-right max-w-[60%]">{wizardNotes}</span></div>}
        </div>
        <label className="flex items-start gap-3 cursor-pointer group">
          <input type="checkbox" checked={wizardPayment} onChange={(e) => setWizardPayment(e.target.checked)}
            className="mt-0.5 w-4 h-4 accent-[#576CA8] cursor-pointer" />
          <span className="text-sm text-gray-700 group-hover:text-gray-900">
            Payment has been collected / verified for this stay.
          </span>
        </label>
      </div>
    );
  };

  const WizardSuccessCard = () => (
    <div className="flex flex-col items-center justify-center py-6 text-center">
      <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4 animate-bounce">
        <span className="text-3xl">✓</span>
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-1">Check-In Complete!</h3>
      <p className="text-sm text-gray-500 mb-5">{wizardReservation?.full_name} is now checked in.</p>
      <div className="bg-green-50 border border-green-200 rounded-2xl px-8 py-4 mb-4">
        <div className="text-4xl font-mono font-black text-green-800">{wizardRoomNumber}</div>
        <div className="text-xs text-green-600 font-semibold uppercase tracking-widest mt-1">Room Number</div>
      </div>
      <span className="inline-block bg-gradient-to-br from-[#55A2F5] to-[#2D72C0] text-white text-xs font-bold px-4 py-1.5 rounded-full tracking-wide mb-6">
        KEY READY
      </span>
      <button onClick={closeWizard} className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2.5 rounded-xl transition-colors">
        Close
      </button>
    </div>
  );

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <>
    <div style={{ position: 'fixed', top: '80px', left: '150px', right: 0, bottom: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div className="flex-1 flex flex-col min-h-0 w-full">
        <div className="flex-1 flex flex-col min-h-0 border-t border-l border-white/20 overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}>
          {/* Header bar */}
          <div className="px-6 pt-0.5 pb-0" style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}>
            {/* Title row */}
            <div className="flex items-center justify-between gap-4 mb-2">
              <div className="shrink-0">
                <h3 className="text-white font-bold text-lg tracking-tight leading-tight">Front Desk</h3>
                <p className="text-white/50 text-xs">Guest management</p>
              </div>
              <div className="flex items-center gap-2 bg-white/15 px-3 py-1.5 rounded-full shrink-0">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
                </span>
                <span className="text-white text-xs font-semibold tracking-wide">
                  {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                </span>
              </div>
            </div>
            {/* Tab row — full width, scrollable */}
            <div className="flex items-center gap-0.5 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
              {[
                { id: 'arrivals', label: 'Arrivals',  svg: <svg width="15" height="15" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 3v9"/><path d="M6 9l3 3 3-3"/><path d="M4 15h10"/></svg> },
                { id: 'inhouse',  label: 'In-House',  svg: <svg width="15" height="15" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 8.5L9 2l7 6.5"/><path d="M5 8v7h3v-4h2v4h3V8"/></svg> },
                { id: 'search',   label: 'Search',    svg: <svg width="15" height="15" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="8" cy="8" r="5"/><path d="M15 15l-3.5-3.5"/></svg> },
                { id: 'walkin',   label: 'Walk-In',   svg: <svg width="15" height="15" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="4" r="1.5"/><path d="M6 9l2-3h2l2 3"/><path d="M7 12l-1 4M11 12l1 4"/><path d="M6 9l1 3h4l1-3"/></svg> },
                { id: 'rooms',    label: 'Rooms',     svg: <svg width="15" height="15" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="6" height="6" rx="1"/><rect x="10" y="2" width="6" height="6" rx="1"/><rect x="2" y="10" width="6" height="6" rx="1"/><rect x="10" y="10" width="6" height="6" rx="1"/></svg> },
                { id: 'calendar', label: 'Tape Chart', svg: <svg width="15" height="15" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="14" height="13" rx="1"/><path d="M6 1v4M12 1v4"/><path d="M2 7h14"/><path d="M5 11h2M9 11h2M13 11h1M5 14h2M9 14h2"/></svg> },
              ].map(v => {
                const active = fdView === v.id;
                return (
                  <button key={v.id} onClick={() => setFdView(v.id)}
                    className="flex items-center gap-1.5 px-4 py-2 text-[11px] font-semibold whitespace-nowrap transition-all border-b-2 shrink-0"
                    style={{ borderBottomColor: active ? 'rgba(147,182,245,0.9)' : 'transparent', color: active ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.38)', background: active ? 'rgba(255,255,255,0.06)' : 'transparent' }}>
                    {v.svg}
                    {v.label}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="p-6 md:p-8 flex-1 overflow-y-auto">

            {/* ── Arrivals View ── */}
            {fdView === 'arrivals' && (
              <div>
                <div className="flex items-center justify-between mb-5 pb-4 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-white/50 uppercase tracking-wider">Date</span>
                    <input
                      type="date"
                      value={arrivalDate}
                      onChange={(e) => setArrivalDate(e.target.value)}
                      className="px-3 py-2 rounded-lg border border-white/20 bg-white/10 text-white focus:border-white/40 focus:ring-2 focus:ring-white/20 text-sm outline-none"
                    />
                    <div className="flex items-center gap-4 ml-2 pl-3 border-l border-white/10">
                      {[
                        { label: 'Total', value: arrivalStats.total, color: 'text-white', svg: <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M2 4h10M2 7h10M2 10h6"/></svg> },
                        { label: 'Checked In', value: arrivalStats.checkedIn, color: 'text-white', svg: <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 7l3.5 3.5L12 4"/></svg> },
                        { label: 'Awaiting', value: (arrivalStats.pending || 0) + (arrivalStats.confirmed || 0), color: 'text-white', svg: <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="7" cy="7" r="5"/><path d="M7 4v3l2 1.5"/></svg> },
                        { label: 'No Show', value: arrivalStats.noShow, color: 'text-white', svg: <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M4 4l6 6M10 4l-6 6"/></svg> },
                      ].map((s) => (
                        <div key={s.label} className="flex flex-col items-center text-white/60">
                          {s.svg}
                          <span className={`text-lg font-bold leading-tight ${s.color}`}>{s.value}</span>
                          <span className="text-[10px] text-white/40 font-medium">{s.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <button onClick={() => fetchArrivals(arrivalDate)} className="text-xs font-semibold text-white/50 hover:text-white bg-white/10 hover:bg-white/15 px-3 py-1.5 rounded-lg transition-all">
                    ↻ Refresh
                  </button>
                </div>

                {/* Arrivals Grid */}
                <div className="border border-white/10 overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)', marginLeft: '10px' }}>
                  {/* Column headers */}
                  <div className="grid gap-x-3 px-3 py-1.5 border-b border-white/10" style={{ gridTemplateColumns: '1fr 6rem 6rem 2.5rem 5.5rem', background: 'rgba(255,255,255,0.05)' }}>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-white/25">Guest</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-white/25">Room Type</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-white/25">Check-In</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-white/25">Nts</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-white/25">Status</span>
                  </div>
                  {/* Rows */}
                  <div style={{ height: '150px', overflowY: 'auto' }}>
                    {arrivalsLoading ? (
                      <div className="flex items-center justify-center h-full text-white/40 text-xs">Loading arrivals…</div>
                    ) : arrivals.length === 0 ? (
                      <div className="flex items-center justify-center h-full text-white/35 text-xs">No arrivals for this date</div>
                    ) : (
                      arrivals.map((r) => <ArrivalRow key={r.id} r={r} />)
                    )}
                  </div>
                </div>

                {/* Detail + Notes row — shown when a row is selected */}
                {selectedArrival && (() => {
                  const r = selectedArrival;
                  const sc = statusColors[r.status] || statusColors.pending;
                  const nights = nightsCount(r);
                  return (
                    <div className="mt-3 flex gap-0" style={{ marginLeft: '10px' }}>
                      {/* Detail panel — 60% */}
                      <div className="border border-white/15 py-3 px-4" style={{ width: '60%', background: 'rgba(255,255,255,0.07)' }}>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-white/25 mb-2">Reservation Details</p>
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-white text-base">{r.full_name}</span>
                              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${sc.bg} ${sc.text}`}>{statusLabel(r.status)}</span>
                              {r.guest_arrived_at && <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-green-500 text-white">ARRIVED</span>}
                            </div>
                            <div className="flex items-center gap-3 mt-1 flex-wrap text-xs text-white/45">
                              <span>{r.room_type_name || r.room_type}</span>
                              <span>·</span>
                              <span>{fmtDate(r.check_in_date)} → {fmtDate(r.check_out_date)}</span>
                              <span>·</span>
                              <span>{nights} night{nights !== 1 ? 's' : ''}</span>
                              {r.number_of_guests && <><span>·</span><span>{r.number_of_guests} guest{r.number_of_guests !== 1 ? 's' : ''}</span></>}
                              {r.rate_code && <><span>·</span><span className="font-mono font-bold text-sky-300 bg-sky-500/15 px-1.5 py-0.5 rounded">{r.rate_code}</span></>}
                              <span className="font-mono text-white/25">#{r.id}</span>
                            </div>
                            {r.special_requests && (
                              <div className="mt-2 text-xs text-amber-200 bg-amber-500/15 border border-amber-400/25 rounded-lg px-2.5 py-1.5 italic">
                                "{r.special_requests}"
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {(r.status === 'pending' || r.status === 'confirmed') && (
                              <button onClick={() => openWizard(r)} className="bg-gradient-to-br from-[#55A2F5] to-[#2D72C0] hover:opacity-90 text-white text-xs px-3 py-1.5 rounded-lg font-semibold transition-colors whitespace-nowrap">
                                Check In
                              </button>
                            )}
                            {r.status !== 'checked_in' && r.status !== 'checked_out' && (
                              <select value={r.status} disabled={statusUpdating === r.id} onChange={(e) => updateStatus(r.id, e.target.value)} className="text-xs border border-white/20 rounded-lg px-2 py-1.5 bg-white/10 text-white/80 cursor-pointer">
                                <option value="pending">Pending</option>
                                <option value="confirmed">Confirmed</option>
                                <option value="cancelled">Cancel</option>
                                <option value="no_show">No Show</option>
                              </select>
                            )}
                            <button onClick={() => setSelectedArrival(null)} className="text-white/30 hover:text-white/70 text-lg leading-none px-1">×</button>
                          </div>
                        </div>
                      </div>
                      {/* Notes panel — 40% */}
                      <div className="border border-white/10 border-l-0 py-3 px-4 flex flex-col gap-1.5" style={{ width: '40%', background: 'rgba(255,255,255,0.04)' }}>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-white/25 mb-0.5">Guest Notes</p>
                        <textarea
                          value={guestNotes[r.id] || ''}
                          onChange={(e) => setGuestNotes(prev => ({ ...prev, [r.id]: e.target.value }))}
                          placeholder="Add notes about this guest…"
                          rows={3}
                          className="flex-1 bg-transparent text-xs text-white/70 placeholder-white/20 outline-none resize-none leading-relaxed"
                        />
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* ── In-House View ── */}
            {fdView === 'inhouse' && (
              <div>
                <div className="flex items-center justify-between mb-5 pb-4 border-b border-white/10">
                  <div>
                    <span className="text-sm font-semibold text-white">{inHouseGuests.length} Guest{inHouseGuests.length !== 1 ? 's' : ''} In-House</span>
                    <span className="text-xs text-white/40 ml-2">as of now</span>
                  </div>
                  <button onClick={fetchInHouse} className="text-xs font-semibold text-white/50 hover:text-white bg-white/10 hover:bg-white/15 px-3 py-1.5 rounded-lg transition-all">
                    ↻ Refresh
                  </button>
                </div>
                {inHouseLoading ? (
                  <div className="text-center py-10 text-white/40">Loading...</div>
                ) : inHouseGuests.length === 0 ? (
                  <div className="text-center py-12 text-white/40 bg-white/5 rounded-xl border border-white/10">
                    <div className="text-4xl mb-3">🏠</div>
                    <div className="font-semibold text-white/50 mb-1">No guests in-house</div>
                    <div className="text-xs text-white/30">All rooms are currently vacant</div>
                  </div>
                ) : (
                  <div>
                    {/* Column header */}
                    <div className="grid gap-x-3 px-3 mb-1" style={{ gridTemplateColumns: '3rem 1fr 7rem 5.5rem 2.5rem 3.5rem 3.5rem 5rem' }}>
                      {['Room', 'Guest', 'Type', 'Check-Out', 'Nts', '', '', ''].map((h, i) => (
                        <span key={i} className="text-[10px] font-bold uppercase tracking-widest text-white/25">{h}</span>
                      ))}
                    </div>
                    <div className="space-y-1">
                      {inHouseGuests.map((r) => <InHouseCard key={r.id} r={r} />)}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── Search View ── */}
            {fdView === 'search' && (
              <div>
                <div className="relative mb-5">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40 text-sm">🔍</span>
                  <input
                    type="text"
                    value={searchQ}
                    onChange={(e) => setSearchQ(e.target.value)}
                    placeholder="Name, email, phone, or confirmation # …"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-white/20 bg-white/10 text-white placeholder-white/40 focus:border-white/40 focus:ring-2 focus:ring-white/20 text-sm outline-none transition-all"
                    autoFocus
                  />
                  {searchLoading && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 text-xs animate-pulse">Searching…</span>}
                </div>
                {searchQ.trim() === '' ? (
                  <div className="text-center py-10 text-white/30">
                    <div className="text-3xl mb-3">🔍</div>
                    <div className="text-sm font-medium text-white/50 mb-4">Look up any reservation to check in a guest</div>
                    <div className="flex flex-col gap-2 text-xs text-white/30 items-center">
                      <span>Type a <strong className="text-white/45">confirmation #</strong> — e.g. <span className="font-mono text-white/45">42</span></span>
                      <span>Or search by <strong className="text-white/45">name</strong>, <strong className="text-white/45">email</strong>, or <strong className="text-white/45">phone</strong></span>
                    </div>
                  </div>
                ) : searchResults.length === 0 && !searchLoading ? (
                  <div className="text-center py-12 text-white/40 bg-white/5 rounded-xl border border-white/10">
                    <div className="text-3xl mb-2">😕</div>
                    <div className="font-semibold text-white/50">No results found</div>
                    <div className="text-xs text-white/30 mt-1">Try a different name, email, or ID</div>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {searchResults.map((r) => <SearchResultCard key={r.id} r={r} />)}
                  </div>
                )}
              </div>
            )}

            {/* ── Walk-In View ── */}
            {fdView === 'walkin' && (
              <div>
                {wkSuccess && wkResult ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="w-16 h-16 rounded-full bg-green-500/20 border border-green-400/30 flex items-center justify-center mb-4">
                      <span className="text-3xl">✅</span>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-1">Walk-In Complete!</h3>
                    <p className="text-sm text-white/60 mb-6">{wkResult.full_name} is now checked in.</p>
                    <div className="bg-green-500/15 border border-green-400/30 rounded-2xl px-12 py-5 mb-4 w-full max-w-xs">
                      <div className="text-5xl font-mono font-black text-green-300">{wkResult.room_number}</div>
                      <div className="text-xs text-green-400 font-semibold uppercase tracking-widest mt-2">Room Assigned</div>
                    </div>
                    <div className="text-xs text-white/35 mb-5 font-mono">Confirmation #{wkResult.id}</div>
                    <span className="inline-block bg-green-500/20 border border-green-400/30 text-green-300 text-xs font-bold px-5 py-2 rounded-full tracking-widest uppercase mb-6">🔑 Key Ready</span>
                    <button onClick={resetWalkin} className="w-full bg-gradient-to-br from-[#55A2F5] to-[#2D72C0] hover:opacity-90 text-white font-semibold py-3 rounded-xl transition-all">
                      + New Walk-In Guest
                    </button>
                  </div>
                ) : (
                  <div>
                    {/* ── 2-COLUMN LAYOUT ── */}
                    <div className="flex gap-4 mt-1">

                      {/* ── LEFT: Guest Profile · Contact · Identification ── */}
                      <div className="flex-1 min-w-0 flex flex-col gap-2">

                        {/* Guest Profile */}
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[9px] font-bold tracking-[0.2em] text-white/30 uppercase whitespace-nowrap">Guest Profile</span>
                          <div className="flex-1 h-px bg-white/15" />
                        </div>
                        <div className="grid grid-cols-4 gap-x-2 gap-y-1.5">
                          <div>
                            <label className="block text-[9px] text-white/35 mb-0.5 uppercase tracking-widest">Title</label>
                            <select value={wkTitle} onChange={e => setWkTitle(e.target.value)}
                              style={{ background: '#4B5563', color: 'white' }}
                              className="w-full px-2 py-1 border border-white/15 text-[11px] outline-none focus:border-white/35 rounded-sm">
                              {['Mr.','Mrs.','Ms.','Dr.','Engr.','Atty.','Prof.','Rev.','Hon.'].map(t => <option key={t} value={t} style={{background:'#4B5563'}}>{t}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className="block text-[9px] text-white/35 mb-0.5 uppercase tracking-widest">Last Name <span className="text-red-400">*</span></label>
                            <input type="text" value={wkLastName} onChange={e => setWkLastName(e.target.value)} placeholder="dela Cruz"
                              className="w-full px-2 py-1 bg-gray-600 border border-white/15 text-white text-[11px] placeholder-white/20 focus:border-white/35 outline-none rounded-sm" />
                          </div>
                          <div>
                            <label className="block text-[9px] text-white/35 mb-0.5 uppercase tracking-widest">First Name <span className="text-red-400">*</span></label>
                            <input type="text" value={wkFirstName} onChange={e => setWkFirstName(e.target.value)} placeholder="Juan"
                              className="w-full px-2 py-1 bg-gray-600 border border-white/15 text-white text-[11px] placeholder-white/20 focus:border-white/35 outline-none rounded-sm" />
                          </div>
                          <div>
                            <label className="block text-[9px] text-white/35 mb-0.5 uppercase tracking-widest">Middle Name</label>
                            <input type="text" value={wkMiddleName} onChange={e => setWkMiddleName(e.target.value)} placeholder="Santos"
                              className="w-full px-2 py-1 bg-gray-600 border border-white/15 text-white text-[11px] placeholder-white/20 focus:border-white/35 outline-none rounded-sm" />
                          </div>
                          <div>
                            <label className="block text-[9px] text-white/35 mb-0.5 uppercase tracking-widest">Gender</label>
                            <select value={wkGender} onChange={e => setWkGender(e.target.value)}
                              style={{ background: '#4B5563', color: wkGender ? 'white' : 'rgba(255,255,255,0.3)' }}
                              className="w-full px-2 py-1 border border-white/15 text-[11px] outline-none focus:border-white/35 rounded-sm">
                              {['','Male','Female','Non-binary','Prefer not to say'].map(g => <option key={g} value={g} style={{background:'#4B5563',color:'white'}}>{g || '— select —'}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className="block text-[9px] text-white/35 mb-0.5 uppercase tracking-widest">Date of Birth</label>
                            <input type="date" value={wkBirthDate} onChange={e => setWkBirthDate(e.target.value)}
                              className="w-full px-2 py-1 bg-gray-600 border border-white/15 text-white text-[11px] focus:border-white/35 outline-none rounded-sm" />
                          </div>
                          <div>
                            <label className="block text-[9px] text-white/35 mb-0.5 uppercase tracking-widest">Nationality</label>
                            <input type="text" value={wkNationality} onChange={e => setWkNationality(e.target.value)} placeholder="Filipino"
                              className="w-full px-2 py-1 bg-gray-600 border border-white/15 text-white text-[11px] placeholder-white/20 focus:border-white/35 outline-none rounded-sm" />
                          </div>
                          <div>
                            <label className="block text-[9px] text-white/35 mb-0.5 uppercase tracking-widest">Country</label>
                            <input type="text" value={wkCountry} onChange={e => setWkCountry(e.target.value)} placeholder="Philippines"
                              className="w-full px-2 py-1 bg-gray-600 border border-white/15 text-white text-[11px] placeholder-white/20 focus:border-white/35 outline-none rounded-sm" />
                          </div>
                        </div>

                        {/* Contact */}
                        <div className="flex items-center gap-2 mt-1 mb-1">
                          <span className="text-[9px] font-bold tracking-[0.2em] text-white/30 uppercase whitespace-nowrap">Contact Information</span>
                          <div className="flex-1 h-px bg-white/15" />
                        </div>
                        <div className="grid grid-cols-4 gap-x-2 gap-y-1.5">
                          <div className="col-span-2">
                            <label className="block text-[9px] text-white/35 mb-0.5 uppercase tracking-widest">Email Address</label>
                            <input type="email" value={wkEmail} onChange={e => setWkEmail(e.target.value)} placeholder="juan@example.com"
                              className="w-full px-2 py-1 bg-gray-600 border border-white/15 text-white text-[11px] placeholder-white/20 focus:border-white/35 outline-none rounded-sm" />
                          </div>
                          <div className="col-span-2">
                            <label className="block text-[9px] text-white/35 mb-0.5 uppercase tracking-widest">Mobile / Phone</label>
                            <input type="tel" value={wkPhone} onChange={e => setWkPhone(e.target.value)} placeholder="09XX XXX XXXX"
                              className="w-full px-2 py-1 bg-gray-600 border border-white/15 text-white text-[11px] placeholder-white/20 focus:border-white/35 outline-none rounded-sm" />
                          </div>
                          <div className="col-span-3">
                            <label className="block text-[9px] text-white/35 mb-0.5 uppercase tracking-widest">Street / Barangay Address</label>
                            <input type="text" value={wkAddress} onChange={e => setWkAddress(e.target.value)} placeholder="123 Rizal St., Brgy. San Antonio"
                              className="w-full px-2 py-1 bg-gray-600 border border-white/15 text-white text-[11px] placeholder-white/20 focus:border-white/35 outline-none rounded-sm" />
                          </div>
                          <div>
                            <label className="block text-[9px] text-white/35 mb-0.5 uppercase tracking-widest">City / Municipality</label>
                            <input type="text" value={wkCity} onChange={e => setWkCity(e.target.value)} placeholder="Makati City"
                              className="w-full px-2 py-1 bg-gray-600 border border-white/15 text-white text-[11px] placeholder-white/20 focus:border-white/35 outline-none rounded-sm" />
                          </div>
                        </div>

                        {/* Identification */}
                        <div className="flex items-center gap-2 mt-1 mb-1">
                          <span className="text-[9px] font-bold tracking-[0.2em] text-white/30 uppercase whitespace-nowrap">Identification</span>
                          <div className="flex-1 h-px bg-white/15" />
                        </div>
                        <div className="grid grid-cols-2 gap-x-2 gap-y-1.5">
                          <div>
                            <label className="block text-[9px] text-white/35 mb-0.5 uppercase tracking-widest">ID Type</label>
                            <select value={wkIdType} onChange={e => setWkIdType(e.target.value)}
                              style={{ background: '#4B5563', color: wkIdType ? 'white' : 'rgba(255,255,255,0.3)' }}
                              className="w-full px-2 py-1 border border-white/15 text-[11px] outline-none focus:border-white/35 rounded-sm">
                              {['','Passport',"Driver's License",'SSS ID','PhilHealth ID','Postal ID','Senior Citizen ID','PWD ID','UMID','PhilSys / National ID','Other'].map(t => (
                                <option key={t} value={t} style={{background:'#4B5563',color:'white'}}>{t || '— select ID type —'}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-[9px] text-white/35 mb-0.5 uppercase tracking-widest">ID Number</label>
                            <input type="text" value={wkIdNumber} onChange={e => setWkIdNumber(e.target.value)} placeholder="ID / reference number"
                              className="w-full px-2 py-1 bg-gray-600 border border-white/15 text-white text-[11px] font-mono placeholder-white/20 focus:border-white/35 outline-none rounded-sm" />
                          </div>
                        </div>

                      </div>

                      {/* ── RIGHT: Stay Details · Payment · Remarks · Submit ── */}
                      <div className="flex-1 min-w-0 flex flex-col gap-2">

                        {/* Stay Details */}
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[9px] font-bold tracking-[0.2em] text-white/30 uppercase whitespace-nowrap">Stay Details</span>
                          <div className="flex-1 h-px bg-white/15" />
                        </div>
                        <div className="grid grid-cols-4 gap-x-2 gap-y-1.5">
                          <div className="col-span-2">
                            <label className="block text-[9px] text-white/35 mb-0.5 uppercase tracking-widest">Room Type <span className="text-red-400">*</span></label>
                            <select value={wkRoomType} onChange={e => { setWkRoomType(e.target.value); setWkRoomNumber(''); }}
                              style={{ background: '#4B5563', color: 'white' }}
                              className="w-full px-2 py-1 border border-white/15 text-[11px] outline-none focus:border-white/35 rounded-sm">
                              {wkRoomTypes.length === 0 && <option value="" style={{ background: '#4B5563' }}>Loading...</option>}
                              {wkRoomTypes.map(rt => {
                                const full = rt.available !== undefined && rt.available <= 0;
                                const label = rt.available !== undefined ? `${rt.name} (${rt.available}/${rt.total_rooms} avail)` : rt.name;
                                return (
                                  <option key={rt.id} value={rt.name} disabled={full}
                                    style={{ background: full ? '#3b1a1a' : '#4B5563', color: full ? '#f87171' : 'white' }}>
                                    {label}{full ? ' — FULL' : ''}
                                  </option>
                                );
                              })}
                            </select>
                            {(() => {
                              const sel = wkRoomTypes.find(rt => rt.name === wkRoomType);
                              if (!sel || sel.available === undefined) return null;
                              const full = sel.available <= 0; const low = sel.available === 1;
                              return (
                                <div className={`mt-0.5 flex items-center gap-1 text-[10px] font-semibold ${full ? 'text-red-300' : low ? 'text-yellow-300' : 'text-green-300'}`}>
                                  <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${full ? 'bg-red-400' : low ? 'bg-yellow-400' : 'bg-green-400'}`} />
                                  {full ? `No rooms available` : low ? `Only 1 left` : `${sel.available}/${sel.total_rooms} available`}
                                </div>
                              );
                            })()}
                          </div>
                          <div className="col-span-2">
                            <label className="block text-[9px] text-white/35 mb-0.5 uppercase tracking-widest">Rate Code</label>
                            <select value={wkRateCode} onChange={e => setWkRateCode(e.target.value)}
                              style={{ background: '#4B5563', color: 'white' }}
                              className="w-full px-2 py-1 border border-white/15 text-[11px] outline-none focus:border-white/35 rounded-sm">
                              <option value="" style={{ background: '#4B5563' }}>— No rate code —</option>
                              {wkRateCodes.map(rc => (
                                <option key={rc.id} value={rc.code} style={{ background: '#4B5563' }}>{rc.code} — {rc.name}</option>
                              ))}
                            </select>
                            {(() => {
                              if (!wkRateCode) return null;
                              const rc = wkRateCodes.find(r => r.code === wkRateCode);
                              const rt = wkRoomTypes.find(r => r.name === wkRoomType);
                              if (!rc || !rt) return null;
                              const priceEntry = rc.prices?.find(p => p.room_type_id === rt.id);
                              const price = priceEntry ? priceEntry.price_per_night : rt.price_per_night;
                              return <div className="mt-0.5 text-[10px] text-sky-300 font-semibold">₱{Number(price).toLocaleString()} / night</div>;
                            })()}
                          </div>
                          <div>
                            <label className="block text-[9px] text-white/35 mb-0.5 uppercase tracking-widest">Check-In <span className="text-red-400">*</span></label>
                            <input type="date" value={wkCheckIn} min={today} onChange={e => setWkCheckIn(e.target.value)}
                              className="w-full px-2 py-1 bg-gray-600 border border-white/15 text-white text-[11px] focus:border-white/35 outline-none rounded-sm" />
                          </div>
                          <div>
                            <label className="block text-[9px] text-white/35 mb-0.5 uppercase tracking-widest">Check-Out <span className="text-red-400">*</span></label>
                            <input type="date" value={wkCheckOut} min={wkCheckIn || today} onChange={e => setWkCheckOut(e.target.value)}
                              className="w-full px-2 py-1 bg-gray-600 border border-white/15 text-white text-[11px] focus:border-white/35 outline-none rounded-sm" />
                          </div>
                          <div>
                            <label className="block text-[9px] text-white/35 mb-0.5 uppercase tracking-widest">ETA</label>
                            <input type="time" value={wkEta} onChange={e => setWkEta(e.target.value)}
                              className="w-full px-2 py-1 bg-gray-600 border border-white/15 text-white text-[11px] focus:border-white/35 outline-none rounded-sm" />
                          </div>
                          <div>
                            <label className="block text-[9px] text-white/35 mb-0.5 uppercase tracking-widest">No. of Guests</label>
                            <input type="number" min="1" max="20" value={wkGuests} onChange={e => setWkGuests(parseInt(e.target.value) || 1)}
                              className="w-full px-2 py-1 bg-gray-600 border border-white/15 text-white text-[11px] focus:border-white/35 outline-none rounded-sm" />
                          </div>
                          <div className="col-span-2">
                            <label className="block text-[9px] text-white/35 mb-0.5 uppercase tracking-widest">Room Number <span className="text-red-400">*</span></label>
                            {(() => {
                              const typeRooms = rooms.filter(r => r.room_type === wkRoomType);
                              const selRoom = typeRooms.find(r => r.room_number === wkRoomNumber);
                              const isBlocked = selRoom && (selRoom.computed_status === 'occupied' || selRoom.computed_status === 'arriving');
                              const isWarn = selRoom && (selRoom.computed_status === 'dirty' || selRoom.computed_status === 'out_of_order');
                              if (typeRooms.length === 0) {
                                return (
                                  <input type="text" value={wkRoomNumber} onChange={e => setWkRoomNumber(e.target.value)}
                                    placeholder="e.g. 201" autoComplete="off"
                                    className="w-full px-2 py-1 border border-white/15 bg-gray-600 text-white text-[11px] font-mono font-bold placeholder-white/20 focus:border-white/35 outline-none rounded-sm" />
                                );
                              }
                              return (
                                <div>
                                  <select value={wkRoomNumber} onChange={e => setWkRoomNumber(e.target.value)}
                                    style={{ background: '#4B5563', color: 'white' }}
                                    className={`w-full px-2 py-1 border ${isBlocked ? 'border-red-400/50' : 'border-white/15'} text-[11px] font-mono font-bold outline-none focus:border-white/35 rounded-sm`}>
                                    <option value="" style={{ background: '#4B5563', color: 'rgba(255,255,255,0.35)' }}>— select room —</option>
                                    {typeRooms.map(r => {
                                      const cfg = roomStatusConfig[r.computed_status] || roomStatusConfig.available;
                                      const unavailable = r.computed_status === 'occupied' || r.computed_status === 'arriving';
                                      return (
                                        <option key={r.room_number} value={r.room_number} disabled={unavailable}
                                          style={{ background: unavailable ? '#3b1a1a' : '#4B5563', color: unavailable ? '#f87171' : 'white' }}>
                                          {`${r.room_number}${r.floor ? ` · F${r.floor}` : ''} — ${cfg.label}${unavailable ? ' ✗' : ''}`}
                                        </option>
                                      );
                                    })}
                                  </select>
                                  {selRoom && (
                                    <div className={`mt-0.5 flex items-center gap-1 text-[10px] font-semibold ${isBlocked ? 'text-red-300' : isWarn ? 'text-yellow-300' : 'text-green-300'}`}>
                                      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${isBlocked ? 'bg-red-400' : isWarn ? 'bg-yellow-400' : 'bg-green-400'}`} />
                                      {isBlocked ? `Unavailable — choose another` : isWarn ? `${selRoom.hk_status} — confirm ready` : `Available`}
                                    </div>
                                  )}
                                </div>
                              );
                            })()}
                          </div>
                          <div className="col-span-2">
                            <label className="block text-[9px] text-white/35 mb-0.5 uppercase tracking-widest">Purpose of Visit</label>
                            <select value={wkPurpose} onChange={e => setWkPurpose(e.target.value)}
                              style={{ background: '#4B5563', color: wkPurpose ? 'white' : 'rgba(255,255,255,0.3)' }}
                              className="w-full px-2 py-1 border border-white/15 text-[11px] outline-none focus:border-white/35 rounded-sm">
                              {['','Leisure / Vacation','Business','Official / Government','Medical','Honeymoon / Anniversary','Transit','Others'].map(p => (
                                <option key={p} value={p} style={{background:'#4B5563',color:'white'}}>{p || '— select —'}</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {/* Payment */}
                        <div className="flex items-center gap-2 mt-1 mb-1">
                          <span className="text-[9px] font-bold tracking-[0.2em] text-white/30 uppercase whitespace-nowrap">Payment</span>
                          <div className="flex-1 h-px bg-white/15" />
                        </div>
                        <div className="grid grid-cols-4 gap-x-2 gap-y-1.5">
                          <div className="col-span-2">
                            <label className="block text-[9px] text-white/35 mb-0.5 uppercase tracking-widest">Payment Method</label>
                            <select value={wkPaymentMethod} onChange={e => setWkPaymentMethod(e.target.value)}
                              style={{ background: '#4B5563', color: 'white' }}
                              className="w-full px-2 py-1 border border-white/15 text-[11px] outline-none focus:border-white/35 rounded-sm">
                              {['Cash','Credit Card','Debit Card','GCash','Maya','Bank Transfer','Check','Other'].map(m => (
                                <option key={m} value={m} style={{background:'#4B5563'}}>{m}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-[9px] text-white/35 mb-0.5 uppercase tracking-widest">Deposit Amount</label>
                            <input type="number" min="0" step="0.01" value={wkDepositAmount} onChange={e => setWkDepositAmount(e.target.value)} placeholder="0.00"
                              className="w-full px-2 py-1 bg-gray-600 border border-white/15 text-white text-[11px] font-mono placeholder-white/20 focus:border-white/35 outline-none rounded-sm" />
                          </div>
                          <div className="flex items-end pb-1">
                            <label className="flex items-center gap-1.5 cursor-pointer">
                              <input type="checkbox" checked={wkPayment} onChange={e => setWkPayment(e.target.checked)}
                                className="w-3 h-3 accent-[#576CA8] cursor-pointer" />
                              <span className="text-[10px] text-white/50 uppercase tracking-wide">Collected</span>
                            </label>
                          </div>
                        </div>

                        {/* Remarks */}
                        <div className="flex items-center gap-2 mt-1 mb-1">
                          <span className="text-[9px] font-bold tracking-[0.2em] text-white/30 uppercase whitespace-nowrap">Remarks</span>
                          <div className="flex-1 h-px bg-white/15" />
                        </div>
                        <div className="grid grid-cols-2 gap-x-2 gap-y-1.5">
                          <div>
                            <label className="block text-[9px] text-white/35 mb-0.5 uppercase tracking-widest">Special Requests</label>
                            <input type="text" value={wkSpecialReq} onChange={e => setWkSpecialReq(e.target.value)} placeholder="non-smoking, high floor, extra pillow..."
                              className="w-full px-2 py-1 bg-gray-600 border border-white/15 text-white text-[11px] placeholder-white/20 focus:border-white/35 outline-none rounded-sm" />
                          </div>
                          <div>
                            <label className="block text-[9px] text-white/35 mb-0.5 uppercase tracking-widest">Front Desk Notes</label>
                            <input type="text" value={wkNotes} onChange={e => setWkNotes(e.target.value)} placeholder="Internal notes..."
                              className="w-full px-2 py-1 bg-gray-600 border border-white/15 text-white text-[11px] placeholder-white/20 focus:border-white/35 outline-none rounded-sm" />
                          </div>
                        </div>

                        <div className="h-px bg-white/10 mt-auto pt-2" />
                        {wkError && (
                          <div className="bg-red-500/15 border border-red-400/30 rounded px-3 py-1.5 text-[11px] text-red-300">{wkError}</div>
                        )}
                        <button onClick={submitWalkin} disabled={wkSubmitting}
                          className="w-full bg-gradient-to-r from-[#2D72C0] to-[#1a4f99] hover:opacity-90 disabled:opacity-50 text-white font-bold py-2 rounded transition-all text-[11px] tracking-[0.12em] uppercase border border-white/10">
                          {wkSubmitting ? 'Processing...' : 'Complete Walk-In Check-In'}
                        </button>

                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── Rooms View ── */}
            {fdView === 'rooms' && (
              <div>
                {/* Toolbar */}
                <div className="flex items-center justify-between mb-5 pb-4 border-b border-white/10">
                  {(() => {
                    const counts = rooms.reduce((acc, r) => { acc[r.computed_status] = (acc[r.computed_status] || 0) + 1; return acc; }, {});
                    const stats = [
                      { label: 'Total',     key: 'all',           value: rooms.length,            svg: <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="1" width="4.5" height="4.5" rx="0.75"/><rect x="7.5" y="1" width="4.5" height="4.5" rx="0.75"/><rect x="1" y="7.5" width="4.5" height="4.5" rx="0.75"/><rect x="7.5" y="7.5" width="4.5" height="4.5" rx="0.75"/></svg> },
                      { label: 'Available', key: 'available',     value: counts.available || 0,   svg: <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 6.5l3 3 6-6"/></svg> },
                      { label: 'Occupied',  key: 'occupied',      value: counts.occupied || 0,    svg: <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="6.5" cy="4" r="2"/><path d="M2 11c0-2.5 2-4 4.5-4s4.5 1.5 4.5 4"/></svg> },
                      { label: 'Due Out',   key: 'due_out',       value: counts.due_out || 0,     svg: <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 6.5h6M8 4l3 2.5L8 9"/><path d="M4 2H2v9h2"/></svg> },
                      { label: 'Arriving',  key: 'arriving',      value: counts.arriving || 0,    svg: <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M8 6.5H2M5 4L2 6.5 5 9"/><path d="M9 2h2v9H9"/></svg> },
                      { label: 'Dirty',     key: 'dirty',         value: counts.dirty || 0,       svg: <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 10l2-5 2 2 2-5 2 4"/></svg> },
                      { label: 'OOO',       key: 'out_of_order',  value: counts.out_of_order || 0,svg: <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M3.5 3.5l6 6M9.5 3.5l-6 6"/></svg> },
                    ];
                    return (
                      <div className="flex items-center gap-1">
                        {stats.map(s => {
                          const active = roomFilter === s.key;
                          return (
                            <button key={s.label} onClick={() => setRoomFilter(s.key)}
                              className={`flex flex-col items-center px-2.5 py-1 rounded-lg transition-all ${active ? 'bg-white/15 text-white' : 'text-white/40 hover:text-white/70 hover:bg-white/8'}`}>
                              {s.svg}
                              <span className="text-base font-bold leading-tight">{s.value}</span>
                              <span className="text-[10px] font-medium">{s.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    );
                  })()}
                  <div className="flex items-center gap-2">
                    <button onClick={fetchRooms} className="text-xs font-semibold text-white/50 hover:text-white bg-white/10 hover:bg-white/15 px-3 py-1.5 rounded-lg transition-all">↻ Refresh</button>
                    <button onClick={() => { setAddRoomOpen(v => !v); if (!newRoomType && wkRoomTypes.length > 0) setNewRoomType(wkRoomTypes[0].name); }}
                      className="text-xs font-semibold text-white bg-gradient-to-br from-[#55A2F5] to-[#2D72C0] hover:opacity-90 px-3 py-1.5 rounded-lg transition-all">
                      + Add Room
                    </button>
                  </div>
                </div>

                {/* Add Room Form */}
                {addRoomOpen && (
                  <div className="mb-5 rounded-xl border border-white/15 p-4" style={{ background: 'rgba(255,255,255,0.06)' }}>
                    <div className="text-xs font-semibold text-white/55 uppercase tracking-widest mb-3">New Room</div>
                    <div className="grid grid-cols-3 gap-3 mb-3">
                      <div>
                        <label className="block text-xs text-white/50 mb-1">Room Number *</label>
                        <input type="text" value={newRoomNumber} onChange={e => setNewRoomNumber(e.target.value)}
                          placeholder="e.g. 201" autoComplete="off"
                          className="w-full px-3 py-2 rounded-lg border border-white/20 bg-white/10 text-white placeholder-white/30 text-sm font-mono font-bold outline-none focus:border-white/40" />
                      </div>
                      <div>
                        <label className="block text-xs text-white/50 mb-1">Room Type</label>
                        <select value={newRoomType} onChange={e => setNewRoomType(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-white/20 text-white text-sm outline-none focus:border-white/40"
                          style={{ background: 'rgba(20,30,60,0.95)' }}>
                          <option value="" style={{ background: '#1a2744' }}>— select —</option>
                          {wkRoomTypes.map(rt => <option key={rt.id} value={rt.name} style={{ background: '#1a2744' }}>{rt.name}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-white/50 mb-1">Floor</label>
                        <input type="number" min="1" max="99" value={newRoomFloor} onChange={e => setNewRoomFloor(parseInt(e.target.value) || 1)}
                          className="w-full px-3 py-2 rounded-lg border border-white/20 bg-white/10 text-white text-sm outline-none focus:border-white/40" />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={addRoom} className="bg-gradient-to-br from-[#55A2F5] to-[#2D72C0] hover:opacity-90 text-white text-xs font-bold px-4 py-2 rounded-lg transition-all">Save Room</button>
                      <button onClick={() => setAddRoomOpen(false)} className="text-white/50 hover:text-white text-xs font-semibold px-4 py-2 rounded-lg bg-white/10 transition-all">Cancel</button>
                    </div>
                  </div>
                )}

                {/* Room Grid */}
                {roomsLoading ? (
                  <div className="text-center py-12 text-white/40">Loading rooms...</div>
                ) : rooms.length === 0 ? (
                  <div className="text-center py-12 text-white/40 bg-white/5 rounded-xl border border-white/10">
                    <div className="text-4xl mb-3">🏨</div>
                    <div className="font-semibold text-white/50 mb-1">No rooms tracked yet</div>
                    <div className="text-xs text-white/30 mb-4">Rooms appear here automatically after check-in, or add them manually.</div>
                    <button onClick={() => setAddRoomOpen(true)} className="text-xs font-bold text-white bg-gradient-to-br from-[#55A2F5] to-[#2D72C0] hover:opacity-90 px-4 py-2 rounded-lg">+ Add Room</button>
                  </div>
                ) : (
                  <div>
                    {(() => {
                      const filtered = roomFilter === 'all' ? rooms : rooms.filter(r => r.computed_status === roomFilter);
                      if (filtered.length === 0) return (
                        <div className="text-center py-10 text-white/40 text-sm">No rooms match this filter.</div>
                      );
                      const byFloor = filtered.reduce((acc, r) => {
                        const f = r.floor || 1;
                        if (!acc[f]) acc[f] = [];
                        acc[f].push(r);
                        return acc;
                      }, {});
                      return Object.keys(byFloor).sort((a, b) => a - b).map(floor => (
                        <div key={floor} className="mb-6">
                          <div className="flex items-center gap-2 mb-3">
                            <span className="text-xs font-bold text-white/60 uppercase tracking-widest">Floor {floor}</span>
                            <div className="flex-1 h-px bg-white/10" />
                            <span className="text-xs text-white/35">{byFloor[floor].length} room{byFloor[floor].length !== 1 ? 's' : ''}</span>
                          </div>
                          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2.5">
                            {byFloor[floor].map(r => <RoomCard key={r.room_number} r={r} />)}
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                )}
              </div>
            )}

            {/* ── Calendar / Tape Chart View ── */}
            {fdView === 'calendar' && (() => {
              const COL_W = 34, LABEL_W = 90, ROW_H = 26;
              const DAY_ABR = ['Su','Mo','Tu','We','Th','Fr','Sa'];
              const startMs = new Date(tcFrom + 'T00:00:00').getTime();

              // Convert any date/datetime to local YYYY-MM-DD string
              const toLocalDate = (dt) => {
                const d = new Date(dt);
                return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
              };

              const tcDays = Array.from({ length: 30 }, (_, i) => {
                const d = new Date(startMs + i * 86400000);
                return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
              });

              const tcGrouped = tcRooms.reduce((acc, r) => {
                if (!acc[r.room_type]) acc[r.room_type] = [];
                acc[r.room_type].push(r);
                return acc;
              }, {});

              const getBar = (resv) => {
                const ci = new Date(toLocalDate(resv.check_in_date) + 'T00:00:00').getTime();
                // For checked-out reservations, use actual checkout date if earlier than booked
                let effectiveOut = resv.check_out_date;
                if (resv.status === 'checked_out' && resv.checked_out_at) {
                  const actualDate = toLocalDate(resv.checked_out_at);
                  const bookedDate = toLocalDate(resv.check_out_date);
                  if (actualDate < bookedDate) effectiveOut = resv.checked_out_at;
                }
                const co = new Date(toLocalDate(effectiveOut) + 'T00:00:00').getTime();
                const endMs = startMs + 30 * 86400000;
                if (co <= startMs || ci >= endMs) return null;
                const l = Math.max(0, Math.round((ci - startMs) / 86400000));
                const r = Math.min(30, Math.max(l + 1, Math.round((co - startMs) / 86400000)));
                return { left: l * COL_W, width: (r - l) * COL_W - 2, clipped: ci < startMs };
              };

              const TC = {
                pending:    { bg: 'rgba(217,119,6,0.88)',  text: '#fef9c3' },
                confirmed:  { bg: 'rgba(37,99,235,0.9)',   text: 'white' },
                checked_in: { bg: 'rgba(22,163,74,0.9)',   text: 'white' },
                checked_out:{ bg: 'rgba(100,116,139,0.55)',text: 'rgba(255,255,255,0.45)' },
                due_out:    { bg: 'rgba(234,88,12,0.85)',  text: 'white' },
              };

              const shiftDays = (n) => {
                const d = new Date(tcFrom + 'T00:00:00');
                d.setDate(d.getDate() + n);
                setTcFrom(d.toISOString().slice(0, 10));
                setTcSelectedRes(null);
              };

              // Match reservations to a row (type-view: by room_type; room-view: by room_number)
              const rowResv = (room) => tcTypeView
                ? tcReservations.filter(r => r.room_type === room.room_type)
                : tcReservations.filter(r => r.room_number === room.room_number);

              const isOccupied = (room, day) => tcTypeView
                ? false  // type-level: always allow click (can't know exact occupancy without room#)
                : tcReservations.some(r => r.room_number === room.room_number && toLocalDate(r.check_in_date) <= day && toLocalDate(r.check_out_date) > day);

              const handleCellClick = (room, day) => {
                if (isOccupied(room, day)) return;
                const co = new Date(day + 'T00:00:00');
                co.setDate(co.getDate() + 1);
                setWkRoomType(room.room_type);
                if (!tcTypeView) setWkRoomNumber(room.room_number);
                setWkCheckIn(day);
                setWkCheckOut(co.toISOString().slice(0, 10));
                setFdView('walkin');
              };

              // Month separator labels for top header
              const monthGroups = tcDays.reduce((acc, d) => {
                const lbl = new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
                if (!acc.length || acc[acc.length - 1].lbl !== lbl) acc.push({ lbl, count: 1 });
                else acc[acc.length - 1].count++;
                return acc;
              }, []);

              const totalW = LABEL_W + 30 * COL_W;
              const lastDay = tcDays[29];

              return (
                <div>
                  {/* ── Toolbar ── */}
                  <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => shiftDays(-14)} className="px-2 py-1 rounded border border-white/15 bg-white/8 text-white/55 hover:text-white text-[11px] transition-colors">← 2w</button>
                      <button onClick={() => shiftDays(-7)}  className="px-2 py-1 rounded border border-white/15 bg-white/8 text-white/55 hover:text-white text-[11px] transition-colors">← 1w</button>
                      <span className="text-[11px] text-white/45 font-mono px-2 select-none">
                        {new Date(tcFrom + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        {' – '}
                        {new Date(lastDay + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                      <button onClick={() => shiftDays(7)}   className="px-2 py-1 rounded border border-white/15 bg-white/8 text-white/55 hover:text-white text-[11px] transition-colors">1w →</button>
                      <button onClick={() => shiftDays(14)}  className="px-2 py-1 rounded border border-white/15 bg-white/8 text-white/55 hover:text-white text-[11px] transition-colors">2w →</button>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => { setTcFrom(today); setTcSelectedRes(null); }}
                        className="px-2.5 py-1 rounded border border-white/20 bg-white/10 text-white/70 hover:text-white text-[11px] font-semibold transition-colors">Today</button>
                      <button onClick={() => fetchTapeChart(tcFrom)}
                        className="px-2 py-1 rounded border border-white/15 bg-white/8 text-white/45 hover:text-white text-[11px] transition-colors">↺</button>
                    </div>
                  </div>

                  {/* ── Legend ── */}
                  <div className="flex items-center gap-3 mb-3 flex-wrap">
                    {[['confirmed','Confirmed'],['checked_in','In-House'],['pending','Pending'],['due_out','Due Out'],['checked_out','Checked Out']].map(([s, lbl]) => (
                      <div key={s} className="flex items-center gap-1">
                        <div style={{ width: 9, height: 9, borderRadius: 2, background: TC[s]?.bg }} />
                        <span className="text-[9px] text-white/35">{lbl}</span>
                      </div>
                    ))}
                    <div className="flex items-center gap-1">
                      <div style={{ width: 9, height: 9, borderRadius: 2, border: '1px dashed rgba(255,255,255,0.2)' }} />
                      <span className="text-[9px] text-white/35">Available — click to book</span>
                    </div>
                  </div>

                  {/* ── Selected reservation strip ── */}
                  {tcSelectedRes && (() => {
                    const r = tcSelectedRes;
                    const effStatus = (r.status === 'checked_in' && r.check_out_date && r.check_out_date.slice(0,10) === today) ? 'due_out' : r.status;
                    const clr = TC[effStatus] || TC.confirmed;
                    const nights = Math.round((new Date(r.check_out_date) - new Date(r.check_in_date)) / 86400000);
                    return (
                      <div className="mb-3 px-3 py-2 rounded border flex items-center justify-between gap-3"
                        style={{ background: clr.bg, borderColor: 'rgba(255,255,255,0.15)' }}>
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className="text-xs font-bold" style={{ color: clr.text }}>{r.full_name}</span>
                          <span className="text-[11px] font-mono" style={{ color: clr.text, opacity: 0.8 }}>Rm {r.room_number}</span>
                          <span className="text-[11px]" style={{ color: clr.text, opacity: 0.75 }}>
                            {new Date(r.check_in_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            {' → '}
                            {new Date(r.check_out_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            {' · '}{nights}n
                          </span>
                          {r.rate_code && <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded" style={{ background: 'rgba(0,0,0,0.2)', color: clr.text }}>{r.rate_code}</span>}
                          <span className="text-[9px] uppercase tracking-widest px-1.5 py-0.5 rounded" style={{ background: 'rgba(0,0,0,0.18)', color: clr.text }}>{r.status.replace('_', ' ')}</span>
                        </div>
                        <button onClick={() => setTcSelectedRes(null)} className="text-[11px] hover:opacity-70 flex-shrink-0" style={{ color: clr.text }}>✕</button>
                      </div>
                    );
                  })()}

                  {/* ── Chart ── */}
                  {tcLoading ? (
                    <div className="text-center py-12 text-white/30 text-sm">Loading chart...</div>
                  ) : tcRooms.length === 0 ? (
                    <div className="text-center py-12 text-white/30 text-sm">No room types found — add room types in Admin → Settings → Rooms first.</div>
                  ) : (
                    <>
                    {tcTypeView && (
                      <div className="mb-2 px-3 py-1.5 rounded text-[10px] text-amber-300/80 border border-amber-400/20 bg-amber-500/8">
                        Showing by room type — no individual rooms assigned yet. Rows show all bookings of that type. Add rooms via Walk-In or the Rooms tab for per-room view.
                      </div>
                    )}
                    <div className="overflow-x-auto rounded border border-white/10" style={{ background: 'rgba(0,0,0,0.3)' }}>
                      <div style={{ minWidth: totalW }}>

                        {/* Month row */}
                        <div className="flex" style={{ paddingLeft: LABEL_W, borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                          {monthGroups.map((mg, i) => (
                            <div key={i} style={{ width: mg.count * COL_W }}
                              className="px-2 py-0.5 text-[9px] font-bold text-white/25 uppercase tracking-widest">
                              {mg.lbl}
                            </div>
                          ))}
                        </div>

                        {/* Day header row */}
                        <div className="flex" style={{ paddingLeft: LABEL_W, borderBottom: '2px solid rgba(255,255,255,0.12)' }}>
                          {tcDays.map(d => {
                            const dt = new Date(d + 'T00:00:00');
                            const isToday = d === today;
                            const isWknd = dt.getDay() === 0 || dt.getDay() === 6;
                            return (
                              <div key={d} style={{ width: COL_W, flexShrink: 0, height: 30,
                                background: isToday ? 'rgba(87,108,168,0.4)' : 'transparent',
                                borderRight: '1px solid rgba(255,255,255,0.05)' }}
                                className="flex flex-col items-center justify-center">
                                <span className={`text-[11px] font-bold leading-none ${isToday ? 'text-[#93b6f5]' : isWknd ? 'text-white/30' : 'text-white/55'}`}>
                                  {dt.getDate()}
                                </span>
                                <span className={`text-[8px] leading-none mt-0.5 ${isToday ? 'text-[#93b6f5]/60' : isWknd ? 'text-white/18' : 'text-white/22'}`}>
                                  {DAY_ABR[dt.getDay()]}
                                </span>
                              </div>
                            );
                          })}
                        </div>

                        {/* Room rows grouped by type */}
                        {Object.entries(tcGrouped).map(([type, typeRooms]) => (
                          <React.Fragment key={type}>
                            {/* Type header */}
                            <div className="flex items-center" style={{ height: 18, background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.06)', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                              <div style={{ width: LABEL_W }} className="px-2">
                                <span className="text-[9px] font-bold text-white/50 uppercase tracking-[0.18em] truncate block" style={{ maxWidth: LABEL_W - 16 }}>{type}</span>
                              </div>
                            </div>
                            {/* Unassigned row — reservations with no room_number for this type */}
                            {(() => {
                              const unassigned = tcReservations.filter(r => !r.room_number && r.room_type === type);
                              if (!unassigned.length) return null;
                              return (
                                <div className="flex" style={{ height: ROW_H, borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,180,0,0.03)' }}>
                                  <div style={{ width: LABEL_W, flexShrink: 0, borderRight: '1px solid rgba(255,255,255,0.08)' }}
                                    className="flex items-center px-2">
                                    <span className="text-[9px] text-amber-400/60 italic">unassigned</span>
                                  </div>
                                  <div className="relative flex" style={{ width: 30 * COL_W, flexShrink: 0 }}>
                                    {tcDays.map(d => {
                                      const isToday = d === today;
                                      const isWknd = new Date(d + 'T00:00:00').getDay() === 0 || new Date(d + 'T00:00:00').getDay() === 6;
                                      return (
                                        <div key={d} style={{ width: COL_W, flexShrink: 0, height: ROW_H,
                                          background: isToday ? 'rgba(87,108,168,0.1)' : isWknd ? 'rgba(255,255,255,0.012)' : 'transparent',
                                          borderRight: '1px solid rgba(255,255,255,0.035)' }} />
                                      );
                                    })}
                                    {unassigned.map(r => {
                                      const bar = getBar(r);
                                      if (!bar) return null;
                                      const effStatus = (r.status === 'checked_in' && r.check_out_date && r.check_out_date.slice(0,10) === today) ? 'due_out' : r.status;
                                      const clr = TC[effStatus] || TC.confirmed;
                                      const isSelected = tcSelectedRes?.id === r.id;
                                      const nights = Math.round((new Date(r.check_out_date) - new Date(r.check_in_date)) / 86400000);
                                      return (
                                        <div key={r.id}
                                          style={{ position: 'absolute', top: 3, height: ROW_H - 6,
                                            left: bar.left + 1, width: bar.width,
                                            background: clr.bg, borderRadius: 3,
                                            border: '1px dashed rgba(255,255,255,0.3)',
                                            boxShadow: isSelected ? '0 0 0 1.5px white' : 'none',
                                            zIndex: 1, cursor: 'pointer', overflow: 'hidden' }}
                                          onClick={e => { e.stopPropagation(); setTcSelectedRes(isSelected ? null : r); }}
                                          title={`${r.full_name} · ${type} · ${nights}n · ${r.status.replace('_',' ')} · No room assigned`}>
                                          {bar.width > 28 && (
                                            <span style={{ color: clr.text, fontSize: 10, fontWeight: 600,
                                              paddingLeft: 5, lineHeight: `${ROW_H - 6}px`,
                                              whiteSpace: 'nowrap', pointerEvents: 'none',
                                              display: 'block', overflow: 'hidden' }}>
                                              {r.full_name.split(',')[0]}
                                            </span>
                                          )}
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              );
                            })()}
                            {/* Individual room rows */}
                            {typeRooms.map(room => {
                              const roomResv = rowResv(room);
                              return (
                                <div key={room.room_number} className="flex"
                                  style={{ height: tcTypeView ? 32 : ROW_H, borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                  {/* Label */}
                                  <div style={{ width: LABEL_W, flexShrink: 0, borderRight: '1px solid rgba(255,255,255,0.08)' }}
                                    className="flex items-center px-2 gap-1.5">
                                    {tcTypeView ? (
                                      <span className="text-[10px] font-semibold text-white/55">{room.room_number}</span>
                                    ) : (
                                      <>
                                        <span className="text-[11px] font-mono font-bold text-white/90 truncate" style={{ maxWidth: LABEL_W - 26 }}>{room.room_number}</span>
                                        {room.floor && <span className="text-[9px] text-white/45 flex-shrink-0">F{room.floor}</span>}
                                      </>
                                    )}
                                  </div>
                                  {/* Date grid + bars */}
                                  <div className="relative flex" style={{ width: 30 * COL_W, flexShrink: 0 }}>
                                    {/* Clickable cells */}
                                    {tcDays.map(d => {
                                      const isToday = d === today;
                                      const isWknd = new Date(d + 'T00:00:00').getDay() === 0 || new Date(d + 'T00:00:00').getDay() === 6;
                                      const occupied = isOccupied(room, d);
                                      return (
                                        <div key={d} style={{ width: COL_W, flexShrink: 0, height: tcTypeView ? 32 : ROW_H,
                                          background: isToday ? 'rgba(87,108,168,0.1)' : isWknd ? 'rgba(255,255,255,0.012)' : 'transparent',
                                          borderRight: '1px solid rgba(255,255,255,0.035)',
                                          cursor: occupied ? 'default' : 'cell' }}
                                          onClick={() => handleCellClick(room, d)}
                                        />
                                      );
                                    })}
                                    {/* Reservation bars */}
                                    {roomResv.map(r => {
                                      const bar = getBar(r);
                                      if (!bar) return null;
                                      const effStatus = (r.status === 'checked_in' && r.check_out_date && r.check_out_date.slice(0,10) === today) ? 'due_out' : r.status;
                                      const clr = TC[effStatus] || TC.confirmed;
                                      const isSelected = tcSelectedRes?.id === r.id;
                                      const nights = Math.round((new Date(r.check_out_date) - new Date(r.check_in_date)) / 86400000);
                                      const rowH = tcTypeView ? 32 : ROW_H;
                                      return (
                                        <div key={r.id}
                                          style={{ position: 'absolute', top: 3, height: rowH - 6,
                                            left: bar.left + 1, width: bar.width,
                                            background: clr.bg,
                                            borderRadius: bar.clipped ? '0 3px 3px 0' : 3,
                                            borderLeft: bar.clipped ? '2px dashed rgba(255,255,255,0.35)' : 'none',
                                            boxShadow: isSelected ? '0 0 0 1.5px white, 0 0 8px rgba(255,255,255,0.3)' : 'none',
                                            zIndex: 1, cursor: 'pointer', overflow: 'hidden' }}
                                          onClick={e => { e.stopPropagation(); setTcSelectedRes(isSelected ? null : r); }}
                                          title={`${r.full_name}${r.room_number ? ' · Rm ' + r.room_number : ''} · ${nights}n · ${r.status.replace('_',' ')}`}>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              );
                            })}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                    </>
                  )}
                </div>
              );
            })()}

            {/* ── Room Detail Panel ── */}
            {selectedRoom && ReactDOM.createPortal(
              <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setSelectedRoom(null)}>
                <div className="bg-[#1a2340] border border-white/20 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
                  onClick={e => e.stopPropagation()}>
                  {/* Header */}
                  {(() => {
                    const cfg = roomStatusConfig[selectedRoom.computed_status] || roomStatusConfig.available;
                    const isActive = ['occupied', 'due_out', 'arriving'].includes(selectedRoom.computed_status);
                    return (
                      <>
                        <div className={`px-5 py-4 border-b border-white/10 ${cfg.bg}`}>
                          <div className="flex items-start justify-between">
                            <div>
                              <div className={`text-3xl font-black font-mono ${cfg.text}`}>{selectedRoom.room_number}</div>
                              <div className="flex items-center gap-2 mt-1 flex-wrap">
                                <span className="text-xs text-white/50 bg-white/10 px-2 py-0.5 rounded">{selectedRoom.room_type || 'Room'}</span>
                                <span className="text-xs text-white/40">Floor {selectedRoom.floor}</span>
                                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${cfg.pill}`}>{cfg.label}</span>
                              </div>
                            </div>
                            <button onClick={() => setSelectedRoom(null)} className="text-white/40 hover:text-white text-lg font-bold leading-none mt-1">✕</button>
                          </div>
                        </div>
                        <div className="p-5 space-y-4">
                          {/* Guest info */}
                          {isActive && selectedRoom.guest_name && (
                            <div className="bg-white/8 border border-white/10 rounded-xl p-3.5 space-y-1.5">
                              <div className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">Current Guest</div>
                              <div className="font-semibold text-white">{selectedRoom.guest_name}</div>
                              <div className="flex items-center gap-3 text-xs text-white/50">
                                <span>CI: {selectedRoom.check_in_date ? new Date(selectedRoom.check_in_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}</span>
                                <span>→</span>
                                <span>CO: {selectedRoom.check_out_date ? new Date(selectedRoom.check_out_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}</span>
                              </div>
                              {selectedRoom.number_of_guests && <div className="text-xs text-white/40">{selectedRoom.number_of_guests} guest{selectedRoom.number_of_guests !== 1 ? 's' : ''}</div>}
                            </div>
                          )}

                          {/* HK Status */}
                          <div>
                            <div className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-2.5">Housekeeping Status</div>
                            <div className="grid grid-cols-2 gap-2">
                              {[
                                { status: 'clean', label: '✓ Clean', active: 'bg-green-500/25 border-green-400/50 text-green-200' },
                                { status: 'dirty', label: '🧹 Dirty', active: 'bg-yellow-500/25 border-yellow-400/50 text-yellow-200' },
                                { status: 'inspected', label: '🔍 Inspected', active: 'bg-teal-500/25 border-teal-400/50 text-teal-200' },
                                { status: 'out_of_order', label: '⚠️ Out of Order', active: 'bg-red-500/25 border-red-400/50 text-red-200' },
                              ].map(({ status, label, active }) => {
                                const isCurrent = selectedRoom.hk_status === status;
                                return (
                                  <button key={status}
                                    onClick={() => updateHkStatus(selectedRoom.room_number, status)}
                                    disabled={hkUpdating === selectedRoom.room_number}
                                    className={`px-3 py-2 rounded-xl border text-xs font-semibold transition-all ${isCurrent ? active : 'border-white/15 bg-white/5 text-white/50 hover:bg-white/10 hover:text-white'}`}>
                                    {label}
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex gap-2 pt-1">
                            {(selectedRoom.computed_status === 'occupied' || selectedRoom.computed_status === 'due_out') && selectedRoom.reservation_id && (
                              <button
                                onClick={() => { setCheckoutConfirmId(selectedRoom.reservation_id); setSelectedRoom(null); }}
                                className="flex-1 bg-red-500/15 hover:bg-red-500/25 border border-red-400/30 text-red-300 text-xs font-bold py-2.5 rounded-xl transition-all">
                                Check Out Guest
                              </button>
                            )}
                            <button
                              onClick={() => removeRoom(selectedRoom.room_number)}
                              className="flex-1 bg-white/5 hover:bg-white/10 border border-white/15 text-white/40 hover:text-white/60 text-xs font-semibold py-2.5 rounded-xl transition-all">
                              Remove Room
                            </button>
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>
            , document.body)}

            {/* ── Check-In Wizard Modal ── */}
            {wizardOpen && wizardReservation && ReactDOM.createPortal(
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
                  <div className="bg-gradient-to-br from-[#55A2F5] to-[#2D72C0] px-6 py-4 flex items-center justify-between">
                    <div>
                      <div className="text-white font-bold">Check-In Wizard</div>
                      <div className="text-white/70 text-xs">{wizardReservation.full_name} · #{wizardReservation.id}</div>
                    </div>
                    {!wizardSuccess && (
                      <button onClick={closeWizard} className="text-white/70 hover:text-white text-lg font-bold transition-colors">✕</button>
                    )}
                  </div>
                  <div className="p-6">
                    {wizardSuccess ? (
                      <WizardSuccessCard />
                    ) : (
                      <>
                        <WizardStepBar />
                        {wizardStep === 1 && <WizardStep1 />}
                        {wizardStep === 2 && <WizardStep2 />}
                        {wizardStep === 3 && <WizardStep3 />}
                        {wizardStep === 4 && <WizardStep4 />}
                        {wizardError && (
                          <div className="mt-4 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600 font-medium">
                            {wizardError}
                          </div>
                        )}
                        <div className="flex gap-3 mt-4">
                          {wizardStep > 1 && (
                            <button
                              onClick={() => { setWizardStep(s => s - 1); setWizardError(''); }}
                              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2.5 rounded-xl transition-colors"
                            >
                              Back
                            </button>
                          )}
                          {wizardStep < 4 ? (
                            <button
                              onClick={() => { setWizardStep(s => s + 1); setWizardError(''); }}
                              disabled={wizardStep === 1 && !wizardIdVerified}
                              className="flex-1 bg-gradient-to-br from-[#55A2F5] to-[#2D72C0] hover:opacity-90 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold py-2.5 rounded-xl transition-colors"
                            >
                              Next
                            </button>
                          ) : (
                            <button
                              onClick={submitCheckin}
                              disabled={!wizardPayment || wizardSubmitting}
                              className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold py-2.5 rounded-xl transition-colors"
                            >
                              {wizardSubmitting ? 'Processing...' : 'Complete Check-In'}
                            </button>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            , document.body)}

            {/* ── Checkout Confirm Modal ── */}
            {checkoutConfirmId && ReactDOM.createPortal(
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
                  <div className="text-center mb-5">
                    <div className="text-4xl mb-3">🔑</div>
                    <h3 className="text-lg font-bold text-gray-900">Confirm Check-Out</h3>
                    <p className="text-sm text-gray-500 mt-1">Are you sure you want to check out this guest? This action cannot be undone.</p>
                  </div>
                  {/* Folio balance */}
                  {checkoutFolioBalance === null ? (
                    <div className="mb-4 text-center text-xs text-gray-400">Checking folio balance...</div>
                  ) : checkoutFolioBalance <= 0 ? (
                    <div className="mb-4 flex items-center justify-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-2.5">
                      <span className="text-green-600 text-sm font-semibold">Folio settled</span>
                    </div>
                  ) : (
                    <div className="mb-4 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5">
                      <div className="text-center text-sm font-bold text-amber-700">Outstanding Balance: ₱{Number(checkoutFolioBalance).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</div>
                      <div className="text-center text-xs text-amber-500 mt-0.5">Please settle folio before checkout</div>
                    </div>
                  )}
                  <div className="flex gap-3">
                    <button
                      onClick={() => setCheckoutConfirmId(null)}
                      disabled={checkoutSubmitting}
                      className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2.5 rounded-xl transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => submitCheckout(checkoutConfirmId)}
                      disabled={checkoutSubmitting}
                      className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-200 text-white font-bold py-2.5 rounded-xl transition-colors"
                    >
                      {checkoutSubmitting ? 'Processing...' : 'Check Out'}
                    </button>
                  </div>
                </div>
              </div>
            , document.body)}
          </div>
        </div>
      </div>
    </div>
    {/* ── Transfer Modal ── */}
    {transferGuest && (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setTransferGuest(null)}>
                <div
                  className="rounded-2xl border border-white/20 shadow-2xl w-full max-w-md overflow-hidden max-h-[90vh] overflow-y-auto"
                  onClick={(e) => e.stopPropagation()}
                  style={{ background: 'rgba(20,25,40,0.95)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}
                >
                  <div className="flex items-center justify-between px-6 py-5 border-b border-white/10" style={{ background: 'rgba(255,255,255,0.08)' }}>
                    <div>
                      <div className="text-white font-bold text-lg tracking-tight">Room Transfer / Upgrade</div>
                      <div className="text-white/70 text-xs mt-0.5">Assign a new room for this guest</div>
                    </div>
                    <button onClick={() => setTransferGuest(null)} className="text-white/70 hover:text-white text-lg font-bold transition-colors leading-none">✕</button>
                  </div>
                  {transferSuccess ? (
                    <div className="px-6 py-12 text-center">
                      <div className="w-14 h-14 rounded-full bg-green-500/25 flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl text-green-300 font-bold">✓</span>
                      </div>
                      <div className="text-white font-bold text-lg mb-1">{transferSuccess}</div>
                      <div className="text-white/60 text-sm">Previous room marked dirty for housekeeping</div>
                      <button onClick={() => setTransferGuest(null)} className="mt-6 w-full bg-white/15 hover:bg-white/20 border border-white/20 text-white font-semibold py-2.5 rounded-xl transition-colors text-sm">Close</button>
                    </div>
                  ) : (
                    <div className="p-6 space-y-5">
                      {/* Current guest info */}
                      <div
                        className="border border-white/20 rounded-xl px-4 py-3 flex items-center justify-between"
                        style={{ background: 'rgba(255,255,255,0.12)' }}
                      >
              <div>
                <div className="text-[10px] text-white/40 font-semibold uppercase tracking-wide mb-0.5">
                  Current Assignment
                </div>
                <div className="font-semibold text-white text-sm">{transferGuest?.full_name}</div>
                <div className="text-xs text-white/50 mt-0.5">
                  {transferGuest?.room_type} · Check-out {fmtDate(transferGuest?.check_out_date)}
                </div>
              </div>
            </div>

            {/* Room Type Filter */}
            <div>
              <label className="block text-xs font-semibold text-white/60 uppercase tracking-wide mb-2">
                Room Type Filter
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    setTransferRoomType('');
                    setTransferRoomNumber('');
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${transferRoomType === ''
                      ? 'bg-teal-500/50 border-teal-400/60 text-white shadow-sm'
                      : 'bg-white/15 border-white/20 text-white/70 hover:bg-white/20 hover:border-white/40 hover:text-white'
                    }`}
                >
                  All Available
                </button>
                {wkRoomTypes.map((rt) => {
                  const isSelected = transferRoomType === rt.name;
                  const isCurrent = rt.name === transferGuest?.room_type;
                  return (
                    <button
                      key={rt.id}
                      onClick={() => {
                        setTransferRoomType(rt.name);
                        setTransferRoomNumber('');
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${isSelected
                          ? 'bg-blue-500/50 border-blue-400/60 text-white shadow-sm'
                          : 'bg-white/15 border-white/20 text-white/70 hover:bg-white/20 hover:border-white/40 hover:text-white'
                        }`}
                    >
                      {rt.name}
                      {isCurrent && <span className={isSelected ? ' text-white/50' : ' text-white/40'}> (current)</span>}
                      {isSelected && !isCurrent && <span className="ml-1">↑</span>}
                    </button>
                  );
                })}
              </div>
              {transferRoomType && transferRoomType !== transferGuest?.room_type && (
                <p className="mt-2 text-xs text-blue-300 font-medium">Filtering: {transferRoomType}</p>
              )}
            </div>

            {/* Room selection */}
            <div>
              <label className="block text-xs font-semibold text-white/60 uppercase tracking-wide mb-2">
                Select Room
              </label>
              {(() => {
                const typeRooms = transferRoomType
                  ? rooms.filter((r) => r.room_type === transferRoomType)
                  : rooms.filter((r) => r.computed_status === 'available' || r.computed_status === 'inspected');

                if (typeRooms.length === 0) {
                  return (
                    <div>
                      <input
                        type="text"
                        value={transferRoomNumber}
                        onChange={(e) => setTransferRoomNumber(e.target.value)}
                        placeholder="Enter room number (e.g. 301)"
                        autoComplete="off"
                        className="w-full px-3 py-2.5 rounded-lg border border-white/20 bg-white/15 text-white placeholder-white/40 text-sm font-mono font-bold outline-none focus:border-white/40 focus:ring-2 focus:ring-white/20 transition-all"
                      />
                      <div className="text-xs text-white/40 mt-2 italic">
                        {transferRoomType
                          ? 'No available rooms of this type. Enter room number manually.'
                          : 'No available rooms.'}
                      </div>
                    </div>
                  );
                }

                const dotColors = {
                  available: 'bg-green-400',
                  occupied: 'bg-blue-400',
                  due_out: 'bg-orange-400',
                  arriving: 'bg-purple-400',
                  dirty: 'bg-yellow-400',
                  inspected: 'bg-teal-400',
                  out_of_order: 'bg-red-400',
                };

                return (
                  <div className="max-h-64 overflow-y-auto pr-2 space-y-1.5">
                    {typeRooms.map((r) => {
                      const isCurrent = r.room_number === transferGuest?.room_number;
                      const isAvailable = r.computed_status === 'available' || r.computed_status === 'inspected';
                      const isSelected = transferRoomNumber === r.room_number;
                      const cfg = roomStatusConfig[r.computed_status] || roomStatusConfig.available;

                      return (
                        <button
                          key={r.room_number}
                          disabled={!isAvailable || isCurrent}
                          onClick={() => setTransferRoomNumber(isSelected ? '' : r.room_number)}
                          title={`Room ${r.room_number} — ${cfg.label}`}
                          className={`relative w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-all text-left ${isSelected
                              ? 'bg-blue-500/40 border-blue-400/60'
                              : isCurrent
                                ? 'bg-white/10 border-white/10 opacity-50 cursor-not-allowed'
                                : !isAvailable
                                  ? 'bg-white/10 border-white/10 opacity-40 cursor-not-allowed'
                                  : 'bg-white/15 border-white/20 hover:bg-white/20 hover:border-white/40'
                            }`}
                        >
                          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${dotColors[r.computed_status] || 'bg-gray-300'}`} />
                          <div className="flex-1">
                            <span
                              className={`font-mono font-bold text-sm ${isSelected ? 'text-white' : isCurrent || !isAvailable ? 'text-white/40' : 'text-white'
                                }`}
                            >
                              Room {r.room_number}
                            </span>
                            {r.floor && <span className="text-[10px] text-white/40 ml-2">Floor {r.floor}</span>}
                          </div>
                          <span className={`text-[10px] font-semibold ${isSelected ? 'text-white' : 'text-white/50'}`}>
                            {cfg.label}
                          </span>
                          {isCurrent && (
                            <span className="text-[10px] bg-white/20 text-white/70 px-2 py-0.5 rounded">Current</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                );
              })()}
            </div>

            {/* Transfer summary */}
            {transferRoomNumber && (
              <div
                className="border border-white/20 rounded-xl px-5 py-3 flex items-center gap-4"
                style={{ background: 'rgba(59, 130, 246, 0.1)' }}
              >
                <div className="text-center min-w-[3rem]">
                  <div className="text-[10px] text-white/40 uppercase tracking-wide font-medium">From</div>
                  <div className="text-2xl font-black font-mono text-white/60">{transferGuest?.room_number}</div>
                </div>
                <div className="flex-1 flex items-center gap-2">
                  <div className="h-px flex-1 bg-white/15" />
                  <span className="text-white/60 font-bold text-base">→</span>
                  <div className="h-px flex-1 bg-white/15" />
                </div>
                <div className="text-center min-w-[3rem]">
                  <div className="text-[10px] text-white/40 uppercase tracking-wide font-medium">To</div>
                  <div className="text-2xl font-black font-mono text-blue-300">{transferRoomNumber}</div>
                </div>
              </div>
            )}

            {/* Error message */}
            {transferError && (
              <div className="bg-red-500/15 border border-red-400/30 rounded-xl px-4 py-3 text-sm text-red-300">
                {transferError}
              </div>
            )}

            {/* Action buttons */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setTransferGuest(null)}
                className="flex-1 bg-white/12 hover:bg-white/18 border border-white/15 text-white/70 hover:text-white text-sm font-semibold py-2.5 rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                onClick={submitTransfer}
                disabled={!transferRoomNumber?.trim() || transferSubmitting}
                className="flex-1 bg-gradient-to-br from-[#55A2F5] to-[#2D72C0] hover:opacity-90 disabled:opacity-40 text-white text-sm font-bold py-2.5 rounded-xl transition-all"
              >
                {transferSubmitting
                  ? 'Moving…'
                  : transferRoomType !== transferGuest?.room_type
                    ? '↑ Upgrade & Transfer'
                    : 'Transfer Room'}
              </button>
            </div>
          </div>
        )}

                </div>
              </div>
    )}

    {/* ── Guest Profile Modal ── */}
    <GuestProfileModal />

    {/* ── Folio Modal ── */}
    {folioOpen && folioRes && (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setFolioOpen(false)}>
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
          {/* Header */}
          <div className="flex items-start justify-between px-6 py-4 border-b border-gray-100">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Guest Folio</h2>
              <p className="text-sm text-gray-500 mt-0.5">
                {folioRes.full_name} &nbsp;&middot;&nbsp; Room {folioRes.room_number || '—'} &nbsp;&middot;&nbsp; {folioRes.room_type}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                {fmtDate(folioRes.check_in_date)} &rarr; {fmtDate(folioRes.check_out_date)} &nbsp;({nightsCount(folioRes)} nights)
              </p>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <button onClick={printFolio} title="Print folio"
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all">
                🖨 Print
              </button>
              <button onClick={sendFolioEmail} disabled={folioEmailSending} title="Email folio to guest"
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-all disabled:opacity-50">
                {folioEmailSending ? '...' : '✉ Email'}
              </button>
              <button onClick={() => setFolioOpen(false)} className="text-gray-400 hover:text-gray-600 text-xl font-bold leading-none ml-1">&#10005;</button>
            </div>
          </div>
          {folioEmailMsg && (
            <div className={`px-6 py-2 text-xs font-medium text-center ${folioEmailMsg.startsWith('✓') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
              {folioEmailMsg}
            </div>
          )}

          {folioLoading ? (
            <div className="flex-1 flex items-center justify-center text-gray-400 py-12">Loading folio...</div>
          ) : folioError ? (
            <div className="flex-1 flex items-center justify-center text-red-500 py-12">{folioError}</div>
          ) : (
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
              {/* Balance summary */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-blue-50 rounded-xl p-3 text-center">
                  <div className="text-xs text-blue-500 font-semibold uppercase tracking-wide mb-1">Total Charges</div>
                  <div className="text-lg font-bold text-blue-700">&#8369;{Number(folioTotals.charges).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</div>
                </div>
                <div className="bg-green-50 rounded-xl p-3 text-center">
                  <div className="text-xs text-green-500 font-semibold uppercase tracking-wide mb-1">Total Payments</div>
                  <div className="text-lg font-bold text-green-700">&#8369;{Number(folioTotals.payments).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</div>
                </div>
                <div className={`rounded-xl p-3 text-center ${folioTotals.balance > 0 ? 'bg-red-50' : 'bg-gray-50'}`}>
                  <div className={`text-xs font-semibold uppercase tracking-wide mb-1 ${folioTotals.balance > 0 ? 'text-red-500' : 'text-gray-400'}`}>Balance Due</div>
                  <div className={`text-lg font-bold ${folioTotals.balance > 0 ? 'text-red-600' : 'text-gray-500'}`}>&#8369;{Number(folioTotals.balance).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</div>
                </div>
              </div>

              {/* Charges */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Charges</h3>
                <div className="border border-gray-100 rounded-xl overflow-hidden">
                  <div className="grid text-xs font-semibold text-gray-400 uppercase tracking-wide px-3 py-2 bg-gray-50 border-b border-gray-100" style={{ gridTemplateColumns: '1fr 2fr 50px 80px 80px 36px' }}>
                    <span>Type</span><span>Description</span><span className="text-center">Qty</span><span className="text-right">Price</span><span className="text-right">Amount</span><span></span>
                  </div>
                  {folioItems.length === 0 ? (
                    <div className="text-center text-gray-400 text-sm py-4">No charges posted yet</div>
                  ) : folioItems.map(item => (
                    <div key={item.id} className={`grid px-3 py-2.5 text-sm items-center border-b border-gray-50 last:border-0 ${item.voided ? 'opacity-40' : 'hover:bg-gray-50'}`} style={{ gridTemplateColumns: '1fr 2fr 50px 80px 80px 36px' }}>
                      <span className={`font-medium text-gray-700 ${item.voided ? 'line-through' : ''}`}>{item.charge_type}</span>
                      <span className={`text-gray-500 truncate ${item.voided ? 'line-through' : ''}`}>{item.description || '—'}</span>
                      <span className="text-center text-gray-500">{item.quantity}</span>
                      <span className="text-right text-gray-500">&#8369;{Number(item.unit_price).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
                      <span className={`text-right font-semibold ${item.voided ? 'text-gray-400 line-through' : 'text-gray-800'}`}>&#8369;{Number(item.amount).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
                      <div className="flex justify-end">
                        {!item.voided
                          ? <button onClick={() => voidCharge(item.id)} title="Void" className="text-red-300 hover:text-red-500 transition-colors">&#10005;</button>
                          : <span className="text-[10px] text-gray-400">void</span>}
                      </div>
                    </div>
                  ))}
                  {folioItems.filter(i => !i.voided).length > 0 && (
                    <div className="flex justify-end px-3 py-2 border-t border-gray-100 bg-gray-50">
                      <span className="text-xs text-gray-400 mr-2">Total Charges</span>
                      <span className="text-sm font-bold text-gray-800">&#8369;{Number(folioTotals.charges).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
                    </div>
                  )}
                </div>
                <div className="mt-3 bg-blue-50 rounded-xl p-3 space-y-2">
                  <div className="text-xs font-semibold text-blue-600 uppercase tracking-wide">Post Charge</div>
                  <div className="flex gap-2 flex-wrap">
                    <select value={fcType} onChange={e => setFcType(e.target.value)} className="px-2 py-1.5 text-sm border border-blue-200 rounded-lg bg-white text-gray-700 focus:outline-none">
                      {['Room Charge','Food & Beverage','Minibar','Laundry','Parking','Damage','Miscellaneous'].map(t => <option key={t}>{t}</option>)}
                    </select>
                    <input type="text" value={fcDesc} onChange={e => setFcDesc(e.target.value)} placeholder="Description" className="flex-1 min-w-[100px] px-2 py-1.5 text-sm border border-blue-200 rounded-lg bg-white text-gray-700 focus:outline-none" />
                    <input type="number" value={fcQty} onChange={e => setFcQty(e.target.value)} min="1" placeholder="Qty" className="w-14 px-2 py-1.5 text-sm border border-blue-200 rounded-lg bg-white text-gray-700 focus:outline-none" />
                    <input type="number" value={fcPrice} onChange={e => setFcPrice(e.target.value)} placeholder="Unit Price" className="w-28 px-2 py-1.5 text-sm border border-blue-200 rounded-lg bg-white text-gray-700 focus:outline-none" />
                    <button onClick={addCharge} disabled={fcSaving} className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition-colors">
                      {fcSaving ? '...' : '+ Add'}
                    </button>
                  </div>
                  {fcError && <p className="text-xs text-red-500">{fcError}</p>}
                </div>
              </div>

              {/* Payments */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Payments</h3>
                <div className="border border-gray-100 rounded-xl overflow-hidden">
                  <div className="grid text-xs font-semibold text-gray-400 uppercase tracking-wide px-3 py-2 bg-gray-50 border-b border-gray-100" style={{ gridTemplateColumns: '1fr 1fr 100px 90px 36px' }}>
                    <span>Method</span><span>Reference</span><span>Date</span><span className="text-right">Amount</span><span></span>
                  </div>
                  {folioPayments.length === 0 ? (
                    <div className="text-center text-gray-400 text-sm py-4">No payments recorded yet</div>
                  ) : folioPayments.map(pay => (
                    <div key={pay.id} className={`grid px-3 py-2.5 text-sm items-center border-b border-gray-50 last:border-0 ${pay.voided ? 'opacity-40' : 'hover:bg-gray-50'}`} style={{ gridTemplateColumns: '1fr 1fr 100px 90px 36px' }}>
                      <span className={`font-medium text-gray-700 ${pay.voided ? 'line-through' : ''}`}>{pay.payment_method}</span>
                      <span className="text-gray-500 truncate">{pay.reference || '—'}</span>
                      <span className="text-gray-400 text-xs">{new Date(pay.posted_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                      <span className={`text-right font-semibold ${pay.voided ? 'text-gray-400 line-through' : 'text-green-700'}`}>&#8369;{Number(pay.amount).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
                      <div className="flex justify-end">
                        {!pay.voided
                          ? <button onClick={() => voidPayment(pay.id)} title="Void" className="text-red-300 hover:text-red-500 transition-colors">&#10005;</button>
                          : <span className="text-[10px] text-gray-400">void</span>}
                      </div>
                    </div>
                  ))}
                  {folioPayments.filter(p => !p.voided).length > 0 && (
                    <div className="flex justify-end px-3 py-2 border-t border-gray-100 bg-gray-50">
                      <span className="text-xs text-gray-400 mr-2">Total Paid</span>
                      <span className="text-sm font-bold text-green-700">&#8369;{Number(folioTotals.payments).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
                    </div>
                  )}
                </div>
                <div className="mt-3 bg-green-50 rounded-xl p-3 space-y-2">
                  <div className="text-xs font-semibold text-green-600 uppercase tracking-wide">Record Payment</div>
                  <div className="flex gap-2 flex-wrap">
                    <select value={fpMethod} onChange={e => setFpMethod(e.target.value)} className="px-2 py-1.5 text-sm border border-green-200 rounded-lg bg-white text-gray-700 focus:outline-none">
                      {['Cash','Credit Card','Debit Card','GCash','Bank Transfer','Other'].map(m => <option key={m}>{m}</option>)}
                    </select>
                    <input type="number" value={fpAmount} onChange={e => setFpAmount(e.target.value)} placeholder="Amount" className="w-32 px-2 py-1.5 text-sm border border-green-200 rounded-lg bg-white text-gray-700 focus:outline-none" />
                    <input type="text" value={fpRef} onChange={e => setFpRef(e.target.value)} placeholder="Reference / Note" className="flex-1 min-w-[100px] px-2 py-1.5 text-sm border border-green-200 rounded-lg bg-white text-gray-700 focus:outline-none" />
                    <button onClick={addPayment} disabled={fpSaving} className="px-3 py-1.5 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition-colors">
                      {fpSaving ? '...' : '+ Pay'}
                    </button>
                  </div>
                  {fpError && <p className="text-xs text-red-500">{fpError}</p>}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    )}
    </>
  );
}