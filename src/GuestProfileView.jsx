import React, { useState, useEffect } from 'react';

import { API_BASE_URL } from './utils/apiConfig';

const formatDateForInput = (dateStr) => {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  } catch (e) {
    return '';
  }
};

export default function GuestProfileView({ guest, onBack, onSave, printGuestDataSheet, captureSignature, openFolio, printGuestFolioDirect, initialTab = 'Profile' }) {
  if (!guest) return null;

  const [activeTab, setActiveTab] = useState(initialTab);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Documents & Notes State
  const [documents, setDocuments] = useState([]);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [showAddDocModal, setShowAddDocModal] = useState(false);
  const [newDocTitle, setNewDocTitle] = useState('');
  const [newDocType, setNewDocType] = useState('PDF');
  const [newDocFile, setNewDocFile] = useState(null);
  const [newDocUrl, setNewDocUrl] = useState('');
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [docError, setDocError] = useState('');

  const [notes, setNotes] = useState([]);
  const [loadingNotes, setLoadingNotes] = useState(false);
  const [showAddNoteModal, setShowAddNoteModal] = useState(false);
  const [newNoteText, setNewNoteText] = useState('');
  const [savingNote, setSavingNote] = useState(false);
  const [noteError, setNoteError] = useState('');

  const guestId = guest.dbId || guest.id || 0;
  const guestEmail = guest.email || '';

  const fetchGuestDocuments = async () => {
    if (!guestId && !guestEmail) return;
    setLoadingDocs(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/guests/${guestId}/documents?email=${encodeURIComponent(guestEmail)}`);
      const data = await res.json();
      if (data.success) setDocuments(data.documents || []);
    } catch (err) {
      console.error('Fetch guest documents error:', err);
    } finally {
      setLoadingDocs(false);
    }
  };

  const fetchGuestNotes = async () => {
    if (!guestId && !guestEmail) return;
    setLoadingNotes(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/guests/${guestId}/notes?email=${encodeURIComponent(guestEmail)}`);
      const data = await res.json();
      if (data.success) setNotes(data.notes || []);
    } catch (err) {
      console.error('Fetch guest notes error:', err);
    } finally {
      setLoadingNotes(false);
    }
  };

  useEffect(() => {
    fetchGuestDocuments();
    fetchGuestNotes();
  }, [guestId, guestEmail]);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setNewDocFile(file);
    if (!newDocTitle.trim()) {
      setNewDocTitle(file.name);
    }
    const ext = file.name.split('.').pop().toUpperCase();
    if (['JPG', 'JPEG', 'PNG', 'WEBP', 'GIF'].includes(ext)) setNewDocType('Image');
    else if (ext === 'PDF') setNewDocType('PDF');
    else if (['DOC', 'DOCX'].includes(ext)) setNewDocType('Word');
    else setNewDocType('Document');

    const reader = new FileReader();
    reader.onload = () => {
      setNewDocUrl(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveDocument = async (e) => {
    e.preventDefault();
    if (!newDocTitle.trim()) {
      setDocError('Please enter a document title.');
      return;
    }
    if (!newDocUrl) {
      setDocError('Please select a file to upload.');
      return;
    }

    setUploadingDoc(true);
    setDocError('');
    try {
      let finalUrl = newDocUrl;
      if (newDocFile) {
        try {
          const formDataObj = new FormData();
          formDataObj.append('photos', newDocFile);
          const uploadRes = await fetch(`${API_BASE_URL}/api/upload`, {
            method: 'POST',
            body: formDataObj
          });
          const uploadData = await uploadRes.json();
          if (uploadData.success && uploadData.urls && uploadData.urls[0]) {
            finalUrl = uploadData.urls[0];
          }
        } catch (uploadErr) {
          console.warn('Cloudinary upload fallback to data URL:', uploadErr);
        }
      }

      const res = await fetch(`${API_BASE_URL}/api/admin/guests/${guestId}/documents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          file_name: newDocTitle.trim(),
          file_url: finalUrl,
          file_type: newDocType,
          uploaded_by: 'Front Desk Staff',
          guest_email: guestEmail
        })
      });
      const data = await res.json();
      if (data.success) {
        setDocuments(prev => [data.document, ...prev]);
        setShowAddDocModal(false);
        setNewDocTitle('');
        setNewDocFile(null);
        setNewDocUrl('');
      } else {
        setDocError(data.message || 'Failed to save document.');
      }
    } catch (err) {
      console.error(err);
      setDocError('Network error while saving document.');
    } finally {
      setUploadingDoc(false);
    }
  };

  const handleDeleteDocument = async (docId) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/guests/documents/${docId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setDocuments(prev => prev.filter(d => d.id !== docId));
      }
    } catch (err) {
      console.error('Delete document error:', err);
    }
  };

  const handleSaveNote = async (e) => {
    e.preventDefault();
    if (!newNoteText.trim()) {
      setNoteError('Note text cannot be empty.');
      return;
    }
    setSavingNote(true);
    setNoteError('');
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/guests/${guestId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          note_text: newNoteText.trim(),
          created_by: 'Front Desk Staff',
          guest_email: guestEmail
        })
      });
      const data = await res.json();
      if (data.success) {
        setNotes(prev => [data.note, ...prev]);
        setShowAddNoteModal(false);
        setNewNoteText('');
      } else {
        setNoteError(data.message || 'Failed to save note.');
      }
    } catch (err) {
      console.error(err);
      setNoteError('Network error while saving note.');
    } finally {
      setSavingNote(false);
    }
  };

  const handleDeleteNote = async (noteId) => {
    if (!window.confirm('Are you sure you want to delete this note?')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/guests/notes/${noteId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setNotes(prev => prev.filter(n => n.id !== noteId));
      }
    } catch (err) {
      console.error('Delete note error:', err);
    }
  };

  useEffect(() => {
    if (guest) {
      setFormData({
        title: guest.title || '',
        first_name: guest.first_name || '',
        middle_name: guest.middle_name || '',
        last_name: guest.last_name || '',
        gender: guest.gender || '',
        date_of_birth: formatDateForInput(guest.dob || guest.date_of_birth),
        nationality: guest.nationality || 'Filipino',
        id_type: guest.id_type || '',
        id_number: guest.id_number || '',
        expiry_date: formatDateForInput(guest.expiry_date),
        issuing_country: guest.issuing_country || 'Philippines',
        phone_number: guest.phone || guest.phone_number || '',
        telephone: guest.telephone || '',
        email: guest.email || '',
        address_line_1: guest.address_line_1 || '',
        address_line_2: guest.address_line_2 || '',
        city: guest.city || '',
        province_state: guest.province_state || '',
        zip_postal_code: guest.zip_postal_code || '',
        country: guest.country || 'Philippines',
        preferred_room_type: guest.preferred_room_type || '',
        preferred_floor: guest.preferred_floor || '',
        bed_type: guest.bed_type || '',
        smoking_preference: guest.smoking_preference || 'Non-Smoking',
        pillow_type: guest.pillow_type || '',
        language: guest.language || 'English',
        special_requests_notes: guest.special_requests_notes || '',
        vip_status: guest.vip_status || 'Standard',
        source: guest.source || 'Walk-In',
        market_segment: guest.market_segment || 'Leisure',
        referred_by: guest.referred_by || '',
        tags: guest.tags || '',
        notes: guest.notes || '',
        purpose_of_visit: guest.purpose_of_visit || ''
      });
    }
  }, [guest, isEditing]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!formData.first_name?.trim() || !formData.last_name?.trim()) {
      setError('First Name and Last Name are required.');
      return;
    }

    setSaving(true);
    setError('');
    setSuccessMsg('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/guests/${guest.dbId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      if (data.success) {
        setSuccessMsg('Guest profile updated successfully!');
        setIsEditing(false);
        if (onSave) {
          onSave(data.guest);
        }
      } else {
        setError(data.message || 'Failed to update guest profile.');
      }
    } catch (err) {
      console.error(err);
      setError('Network error. Failed to connect to server.');
    } finally {
      setSaving(false);
    }
  };

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';
  const fmtCurrency = (n) => `₱${(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const getInitialsColor = (name) => {
    const colors = ['bg-[#E8F5E9] text-[#2E7D32]', 'bg-[#E3F2FD] text-[#1565C0]', 'bg-[#FFF3E0] text-[#E65100]', 'bg-[#FCE4EC] text-[#C2185B]', 'bg-[#F3E5F5] text-[#6A1B9A]'];
    const idx = (name || '').charCodeAt(0) % colors.length;
    return colors[idx] || colors[0];
  };

  const renderField = (label, name, type = 'text', options = null, required = false) => {
    const value = formData[name] !== undefined ? formData[name] : '';

    if (!isEditing) {
      let displayVal = value || '—';
      if (type === 'date' && value) {
        displayVal = fmtDate(value);
      }
      return (
        <div className="flex flex-col pb-2">
          <label className="text-[11px] font-bold text-black/40 mb-1">{label}</label>
          <div className="text-[13px] font-semibold text-black/80 min-h-[20px] tracking-tight">{displayVal}</div>
        </div>
      );
    }

    return (
      <div className="flex flex-col">
        <label className="text-[11px] font-bold text-black/60 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        {options ? (
          <select name={name} value={value} onChange={handleChange} className="w-full px-2 py-1.5 border border-black/10 rounded-md text-[13px] outline-none focus:border-[#005530] focus:ring-1 focus:ring-[#005530] bg-white font-medium text-black/80 shadow-sm">
            <option value="">Select</option>
            {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        ) : type === 'textarea' ? (
          <textarea name={name} value={value} onChange={handleChange} placeholder={`Enter ${label.toLowerCase()}`} rows="2" className="w-full px-2 py-1.5 border border-black/10 rounded-md text-[13px] outline-none focus:border-[#005530] focus:ring-1 focus:ring-[#005530] bg-white font-medium text-black/80 placeholder-black/30 shadow-sm resize-none"></textarea>
        ) : name === 'phone_number' ? (
          <div className="flex shadow-sm rounded-md border border-black/10 focus-within:border-[#005530] focus-within:ring-1 focus-within:ring-[#005530] overflow-hidden bg-white">
            <span className="bg-gray-50 border-r border-black/10 px-2 py-1.5 text-[13px] font-medium text-black/60 select-none flex items-center gap-1">
              🇵🇭 +63
            </span>
            <input type="tel" name="phone_number" value={value} onChange={handleChange} placeholder="Enter mobile number" className="w-full px-2 py-1.5 text-[13px] outline-none bg-transparent font-medium text-black/80 placeholder-black/30" />
          </div>
        ) : (
          <input type={type} name={name} value={value} onChange={handleChange} placeholder={`Enter ${label.toLowerCase()}`} required={required} className="w-full px-2 py-1.5 border border-black/10 rounded-md text-[13px] outline-none focus:border-[#005530] focus:ring-1 focus:ring-[#005530] bg-white font-medium text-black/80 placeholder-black/30 shadow-sm" />
        )}
      </div>
    );
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: '120px', right: 0, bottom: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden', zIndex: 10, background: '#f8f9fa' }}>
      
      {/* Header Bar */}
      <div className="px-8 py-5 border-b border-black/5 bg-white shrink-0 flex items-center justify-between">
        <div className="flex items-center gap-2 text-[13px] font-medium text-black/60">
          <span className="hover:text-black cursor-pointer transition-colors" onClick={onBack}>Guests</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
          <span className="text-black font-black">{isEditing ? 'Edit Guest Profile' : 'Guest Profile'}</span>
        </div>
        <div className="flex items-center gap-3">
          {isEditing ? (
            <>
              <button 
                onClick={() => setIsEditing(false)} 
                className="px-5 py-2 border border-black/10 rounded-md text-[13px] font-bold text-black/80 hover:bg-gray-50 shadow-sm transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSave} 
                disabled={saving} 
                className="px-5 py-2 bg-[#005530] text-white hover:bg-[#004420] disabled:bg-[#005530]/50 rounded-md text-[13px] font-bold shadow-sm transition-colors"
              >
                {saving ? 'Saving...' : 'Save Profile'}
              </button>
            </>
          ) : (
            <>
              <button 
                onClick={() => setIsEditing(true)} 
                className="px-5 py-2 border border-black/10 rounded-md text-[13px] font-bold text-black/80 hover:bg-gray-50 shadow-sm transition-colors"
              >
                Edit Profile
              </button>
              {guest.stays && guest.stays.length > 0 && printGuestDataSheet && (
                <button 
                  onClick={() => printGuestDataSheet(guest.stays[0])}
                  className="flex items-center gap-2 px-5 py-2 border border-black/10 text-black/80 hover:bg-gray-50 rounded-md text-[13px] font-bold shadow-sm transition-colors bg-white"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2M6 14h12v6H6z"/></svg>
                  Print Data Sheet
                </button>
              )}
              <button className="flex items-center gap-2 px-5 py-2 bg-[#005530] text-white hover:bg-[#004420] rounded-md text-[13px] font-bold shadow-sm transition-colors">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                New Reservation
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Content Scrollable Area */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-[1500px] mx-auto space-y-6">

          {error && (
            <div className="p-4 bg-rose-50 border border-rose-100 text-rose-700 text-[13px] font-semibold rounded-xl flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
              {error}
            </div>
          )}

          {successMsg && (
            <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-700 text-[13px] font-semibold rounded-xl flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
              {successMsg}
            </div>
          )}
          
          <div className="flex gap-3">
            
            {/* Left Column (Main Info & Form) */}
            <div className="flex-1 space-y-6">
              
              {/* Top Identity Card */}
              <div className="bg-white rounded-xl shadow-sm border border-black/5 p-4 relative">
                <div className="flex items-center gap-2">
                  <div className={`w-[72px] h-[72px] rounded-full flex items-center justify-center font-black text-[24px] ${getInitialsColor(guest.name)}`}>
                    {guest.initials}
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <h1 className="text-[26px] font-black tracking-tight text-black/90">{guest.name}</h1>
                      {guest.isVip && <span className="bg-amber-100 text-amber-700 text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-widest shadow-sm">VIP</span>}
                      {guest.totalStays > 1 && <span className="bg-[#E8F5E9] text-[#2E7D32] text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-widest shadow-sm">Repeat Guest</span>}
                    </div>
                  </div>
                </div>
              </div>

              {/* Horizontal Tabs */}
              <div className="border-b border-black/10 flex items-center gap-2 text-[13px] font-bold text-black/50 px-2 mt-4">
                {['Profile', 'Stay History', 'Reservations', 'Documents', 'Notes'].map(tab => (
                  <div 
                    key={tab}
                    onClick={() => !isEditing && setActiveTab(tab)}
                    className={`pb-3 border-b-2 cursor-pointer transition-colors ${activeTab === tab ? 'border-[#005530] text-[#005530]' : 'border-transparent hover:text-black'} ${isEditing ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {tab}
                  </div>
                ))}
              </div>

              {/* Tab Contents */}
              {activeTab === 'Profile' && (
                <div className="space-y-6">
                  {/* 1. PERSONAL INFORMATION */}
                  <div className="bg-white rounded-xl shadow-sm border border-black/5 p-4 space-y-5">
                    <h3 className="text-[14px] font-black text-black/85 tracking-tight border-b border-black/5 pb-2 uppercase">Personal Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                      {renderField('Title', 'title', 'text', ["Mr.", "Ms.", "Mrs.", "Dr.", "Prof."])}
                      {renderField('First Name', 'first_name', 'text', null, true)}
                      {renderField('Middle Name', 'middle_name', 'text')}
                      {renderField('Last Name', 'last_name', 'text', null, true)}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                      {renderField('Gender', 'gender', 'text', ["Male", "Female", "Other"])}
                      {renderField('Date of Birth', 'date_of_birth', 'date')}
                      {renderField('Nationality', 'nationality', 'text', ["Filipino", "American", "British", "Canadian", "Australian", "Japanese", "German", "Korean"])}
                      {renderField('ID Type', 'id_type', 'text', ["Passport", "Driver's License", "National ID", "SSS / GSIS UMID", "PRC ID", "Company ID"])}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      {renderField('ID / Passport No.', 'id_number')}
                      {renderField('Expiry Date', 'expiry_date', 'date')}
                      {renderField('Issuing Country', 'issuing_country', 'text', ["Philippines", "United States", "United Kingdom", "Canada", "Australia", "Japan", "South Korea"])}
                    </div>
                  </div>

                  {/* 2. CONTACT INFORMATION */}
                  <div className="bg-white rounded-xl shadow-sm border border-black/5 p-4 space-y-5">
                    <h3 className="text-[14px] font-black text-black/85 tracking-tight border-b border-black/5 pb-2 uppercase">Contact Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      {renderField('Mobile Number', 'phone_number')}
                      {renderField('Telephone', 'telephone')}
                      {renderField('Email Address', 'email')}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      <div className="md:col-span-1">{renderField('Address Line 1', 'address_line_1')}</div>
                      <div className="md:col-span-2">{renderField('Address Line 2 (Optional)', 'address_line_2')}</div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                      {renderField('City', 'city')}
                      {renderField('Province / State', 'province_state')}
                      {renderField('ZIP / Postal Code', 'zip_postal_code')}
                      {renderField('Country', 'country', 'text', ["Philippines", "United States", "United Kingdom", "Canada", "Australia", "Singapore"])}
                    </div>
                  </div>

                  {/* 3. STAY PREFERENCES */}
                  <div className="bg-white rounded-xl shadow-sm border border-black/5 p-4 space-y-5">
                    <h3 className="text-[14px] font-black text-black/85 tracking-tight border-b border-black/5 pb-2 uppercase">Stay Preferences</h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                      {renderField('Preferred Room Type', 'preferred_room_type', 'text', ["Standard Room", "Deluxe Room", "Suite", "Family Room", "Presidential Suite"])}
                      {renderField('Preferred Floor', 'preferred_floor', 'text', ["Floor 1", "Floor 2", "Floor 3", "Floor 4", "Floor 5"])}
                      {renderField('Bed Type', 'bed_type', 'text', ["Queen Bed", "King Bed", "Double Bed", "Single Bed"])}
                      {renderField('Smoking Preference', 'smoking_preference', 'text', ["Non-Smoking", "Smoking"])}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                      {renderField('Pillow Type', 'pillow_type', 'text', ["Feather", "Foam", "Latex", "Memory Foam"])}
                      {renderField('Language', 'language', 'text', ["English", "Tagalog", "Spanish", "Japanese", "Korean", "Mandarin"])}
                      <div className="md:col-span-2">{renderField('Special Requests / Notes', 'special_requests_notes')}</div>
                    </div>
                  </div>

                  {/* 4. ADDITIONAL INFORMATION */}
                  <div className="bg-white rounded-xl shadow-sm border border-black/5 p-4 space-y-5">
                    <h3 className="text-[14px] font-black text-black/85 tracking-tight border-b border-black/5 pb-2 uppercase">Additional Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                      {renderField('VIP Status', 'vip_status', 'text', ["Standard", "VIP", "Blacklisted"])}
                      {renderField('Source', 'source', 'text', ["Walk-In", "Direct Website", "Booking.com", "Agoda", "Expedia", "Airbnb"])}
                      {renderField('Market Segment', 'market_segment', 'text', ["Leisure", "Corporate", "Government", "Groups"])}
                      {renderField('Referred By', 'referred_by')}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                      {renderField('Purpose of Visit', 'purpose_of_visit')}
                      <div className="md:col-span-3">{renderField('Tags', 'tags')}</div>
                    </div>
                    <div>
                      {renderField('Notes', 'notes', 'textarea')}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'Stay History' && (
                <div className="bg-white rounded-xl shadow-sm border border-black/5 overflow-hidden">
                  <div className="px-6 py-4 border-b border-black/5">
                    <h3 className="text-[14px] font-black text-black/85 tracking-tight uppercase">Stay History</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-[13px] text-left text-black/80">
                      <thead className="bg-gray-50 text-[11px] font-bold text-black/40 uppercase border-b border-black/5">
                        <tr>
                          <th className="px-6 py-3">Dates</th>
                          <th className="px-6 py-3">Room Type</th>
                          <th className="px-6 py-3">Nights</th>
                          <th className="px-6 py-3">Rate</th>
                          <th className="px-6 py-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-black/5">
                        {guest.stays && guest.stays.length > 0 ? (
                          guest.stays.map((stay, idx) => {
                            const checkIn = new Date(stay.check_in_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                            const checkOut = new Date(stay.check_out_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                            return (
                              <tr key={idx} className="hover:bg-gray-50/50">
                                <td className="px-6 py-4 font-semibold">{checkIn} - {checkOut}</td>
                                <td className="px-6 py-4">{stay.room_type}</td>
                                <td className="px-6 py-4 font-bold">{stay.nights}</td>
                                <td className="px-6 py-4 font-bold">{fmtCurrency(stay.total)}</td>
                                <td className="px-6 py-4 flex items-center gap-3">
                                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${stay.status === 'checked_in' ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-600'}`}>
                                    {stay.status === 'checked_in' ? 'In-House' : stay.status}
                                  </span>
                                  {printGuestDataSheet && (
                                    <button 
                                      onClick={(e) => { e.stopPropagation(); printGuestDataSheet(stay); }}
                                      className="p-1 border border-black/10 rounded-md hover:bg-gray-100 text-black/50 hover:text-black/80 transition-colors bg-white shadow-sm"
                                      title="Print Guest Data Sheet"
                                    >
                                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2M6 14h12v6H6z"/></svg>
                                    </button>
                                  )}
                                  {(printGuestFolioDirect || openFolio) && (
                                    <button 
                                      onClick={(e) => { 
                                        e.stopPropagation(); 
                                        if (printGuestFolioDirect) {
                                          printGuestFolioDirect(stay);
                                        } else if (openFolio) {
                                          openFolio(stay);
                                        }
                                      }}
                                      className="p-1 border border-black/10 rounded-md hover:bg-gray-100 text-black/50 hover:text-black/80 transition-colors bg-white shadow-sm"
                                      title="Print Guest Folio"
                                    >
                                      <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="3" y="1" width="10" height="14" rx="1.5" />
                                        <path d="M6 5h4M6 8h4M6 11h2" />
                                      </svg>
                                    </button>
                                  )}
                                </td>
                              </tr>
                            );
                          })
                        ) : (
                          <tr>
                            <td colSpan="5" className="px-6 py-8 text-center text-black/40 font-medium">No stays recorded for this guest.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'Reservations' && (
                <div className="bg-white rounded-xl shadow-sm border border-black/5 overflow-hidden">
                  <div className="px-6 py-4 border-b border-black/5">
                    <h3 className="text-[14px] font-black text-black/85 tracking-tight uppercase">Linked Reservations</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-[13px] text-left text-black/80">
                      <thead className="bg-gray-50 text-[11px] font-bold text-black/40 uppercase border-b border-black/5">
                        <tr>
                          <th className="px-6 py-3">Reservation ID</th>
                          <th className="px-6 py-3">Room Type</th>
                          <th className="px-6 py-3">Dates</th>
                          <th className="px-6 py-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-black/5">
                        {guest.stays && guest.stays.length > 0 ? (
                          guest.stays.map((stay, idx) => (
                            <tr key={idx} className="hover:bg-gray-50/50">
                              <td className="px-6 py-4 font-bold text-[#005530]">RES-{String(stay.id).padStart(5, '0')}</td>
                              <td className="px-6 py-4">{stay.room_type}</td>
                              <td className="px-6 py-4 font-semibold">
                                {new Date(stay.check_in_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(stay.check_out_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                              </td>
                              <td className="px-6 py-4">
                                <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${stay.status === 'checked_in' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
                                  {stay.status}
                                </span>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="4" className="px-6 py-8 text-center text-black/40 font-medium">No reservations linked to this guest.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'Documents' && (
                <div className="bg-white rounded-xl shadow-sm border border-black/5 overflow-hidden">
                  <div className="px-6 py-4 border-b border-black/5 flex items-center justify-between">
                    <h3 className="text-[14px] font-black text-black/85 tracking-tight uppercase">Uploaded Documents</h3>
                    <button 
                      onClick={() => { setShowAddDocModal(true); setDocError(''); }}
                      className="text-[12px] font-bold text-[#005530] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                      Add Document
                    </button>
                  </div>
                  <div className="p-4">
                    {loadingDocs ? (
                      <div className="p-8 text-center text-xs font-bold text-black/40">Loading documents...</div>
                    ) : documents.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {documents.map((doc) => {
                          const fileType = (doc.file_type || doc.file_name.split('.').pop() || 'PDF').toUpperCase();
                          let badgeBg = 'bg-[#FFEBEE] border-[#EF5350] text-[#EF5350]';
                          if (['PNG', 'JPG', 'JPEG', 'IMAGE'].includes(fileType)) badgeBg = 'bg-[#E3F2FD] border-[#2196F3] text-[#2196F3]';
                          else if (['DOC', 'DOCX', 'WORD'].includes(fileType)) badgeBg = 'bg-[#E8F5E9] border-[#4CAF50] text-[#4CAF50]';

                          return (
                            <div key={doc.id} className="flex items-center gap-3 p-3 border border-black/10 rounded-xl bg-gray-50/50 hover:bg-gray-50 transition-colors">
                              <div className={`w-10 h-10 border rounded flex items-center justify-center shrink-0 ${badgeBg}`}>
                                <span className="text-[10px] font-black">{fileType.slice(0, 4)}</span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-[12px] font-bold text-black/90 truncate">{doc.file_name}</div>
                                <div className="text-[10px] text-black/40 font-medium truncate mt-0.5">
                                  Uploaded on {fmtDate(doc.uploaded_at)} by {doc.uploaded_by || 'Staff'}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <a 
                                  href={doc.file_url} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className="p-1 text-black/40 hover:text-[#005530] transition-colors"
                                  title="View / Download Document"
                                >
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                                </a>
                                <button 
                                  onClick={() => handleDeleteDocument(doc.id)} 
                                  className="p-1 text-black/30 hover:text-red-600 transition-colors cursor-pointer"
                                  title="Delete Document"
                                >
                                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="p-8 text-center border-2 border-dashed border-black/10 rounded-xl bg-gray-50/50">
                        <svg className="w-8 h-8 mx-auto text-black/20 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                        <p className="text-[13px] font-bold text-black/60 mb-1">No uploaded documents yet</p>
                        <p className="text-[11px] text-black/40 mb-4">Upload IDs, passports, or guest registration agreements.</p>
                        <button 
                          onClick={() => { setShowAddDocModal(true); setDocError(''); }}
                          className="px-4 py-2 bg-[#005530] text-white text-[12px] font-bold rounded-lg hover:bg-[#004225] transition-colors cursor-pointer shadow-sm"
                        >
                          + Add Document
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'Notes' && (
                <div className="bg-white rounded-xl shadow-sm border border-black/5 overflow-hidden">
                  <div className="px-6 py-4 border-b border-black/5 flex items-center justify-between">
                    <h3 className="text-[14px] font-black text-black/85 tracking-tight uppercase">Internal Notes</h3>
                    <button 
                      onClick={() => { setShowAddNoteModal(true); setNoteError(''); }}
                      className="text-[12px] font-bold text-[#005530] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                      Add Note
                    </button>
                  </div>
                  <div className="p-4">
                    {loadingNotes ? (
                      <div className="p-8 text-center text-xs font-bold text-black/40">Loading notes...</div>
                    ) : notes.length > 0 ? (
                      <div className="space-y-3">
                        {notes.map(note => (
                          <div key={note.id} className="bg-[#FFF8E1] border border-[#FFECB3] rounded-xl p-3.5 relative group">
                            <p className="text-[12px] font-medium text-black/85 pr-8 whitespace-pre-wrap">{note.note_text}</p>
                            <p className="text-[10px] text-black/40 mt-2 font-semibold">
                              {fmtDate(note.created_at)} by {note.created_by || 'Staff'}
                            </p>
                            <button 
                              onClick={() => handleDeleteNote(note.id)}
                              className="absolute top-3 right-3 text-black/30 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                              title="Delete note"
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-8 text-center border-2 border-dashed border-black/10 rounded-xl bg-gray-50/50">
                        <svg className="w-8 h-8 mx-auto text-black/20 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                        <p className="text-[13px] font-bold text-black/60 mb-1">No internal notes yet</p>
                        <p className="text-[11px] text-black/40 mb-4">Record guest preferences, special requests, or operational notes.</p>
                        <button 
                          onClick={() => { setShowAddNoteModal(true); setNoteError(''); }}
                          className="px-4 py-2 bg-[#005530] text-white text-[12px] font-bold rounded-lg hover:bg-[#004225] transition-colors cursor-pointer shadow-sm"
                        >
                          + Add Note
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column (Widgets) - Hidden when editing to give full width */}
            {!isEditing && (
              <div className="w-[360px] shrink-0 space-y-6">
                
                {/* Account Summary */}
                <div className="bg-white rounded-xl shadow-sm border border-black/5 overflow-hidden">
                  <div className="px-5 py-4 border-b border-black/5">
                    <h3 className="text-[14px] font-black text-black/90 tracking-tight">Account Summary</h3>
                  </div>
                  <div className="p-3 space-y-3">
                    <div className="flex items-center justify-between text-[13px]">
                      <span className="text-black/60 font-medium">Total Stays</span>
                      <span className="font-bold text-black/90">{guest.totalStays}</span>
                    </div>
                    <div className="flex items-center justify-between text-[13px]">
                      <span className="text-black/60 font-medium">Total Nights</span>
                      <span className="font-bold text-black/90">{guest.totalNights}</span>
                    </div>
                    <div className="flex items-center justify-between text-[13px] pt-2 border-t border-black/5">
                      <span className="text-black/60 font-medium">Total Charges</span>
                      <span className="font-bold text-black/90">{fmtCurrency(guest.totalSpent)}</span>
                    </div>
                    <div className="flex items-center justify-between text-[13px]">
                      <span className="text-black/60 font-medium">Total Payments</span>
                      <span className="font-bold text-black/90">{fmtCurrency(guest.totalPayments || 0)}</span>
                    </div>
                    <div className="flex items-center justify-between text-[13px] pt-2 border-t border-black/5">
                      <span className="text-black/80 font-black">Outstanding Balance</span>
                      <span className={`font-bold ${(guest.totalSpent - (guest.totalPayments || 0)) > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                        {fmtCurrency(Math.max(0, guest.totalSpent - (guest.totalPayments || 0)))}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Stay History Summary (Last 5) */}
                <div className="bg-white rounded-xl shadow-sm border border-black/5 overflow-hidden">
                  <div className="px-5 py-4 border-b border-black/5 flex items-center justify-between">
                    <h3 className="text-[14px] font-black text-black/90 tracking-tight">Recent Stay History</h3>
                  </div>
                  <div className="flex flex-col divide-y divide-black/5">
                    {guest.stays && guest.stays.slice(0, 5).map((stay, idx) => {
                      const checkIn = new Date(stay.check_in_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                      const checkOut = new Date(stay.check_out_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                      return (
                        <div key={idx} className="px-5 py-3 flex items-center justify-between text-[12px]">
                          <span className="text-black/80 font-medium">{checkIn} - {checkOut}</span>
                          <span className="text-black/60">{stay.nights} Night{stay.nights > 1 ? 's' : ''}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Document Modal */}
      {showAddDocModal && (
        <div className="fixed inset-0 z-[99999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-black/10 flex items-center justify-between bg-gray-50">
              <div>
                <h3 className="text-base font-black text-black">Upload Guest Document</h3>
                <p className="text-xs text-black/50">Attach guest ID, passport scan, or agreement</p>
              </div>
              <button 
                onClick={() => setShowAddDocModal(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-black/40 hover:bg-black/5 hover:text-black cursor-pointer font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveDocument} className="p-6 space-y-4">
              {docError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl">
                  {docError}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-black/70 mb-1">Document Title / File Name *</label>
                <input 
                  type="text" 
                  value={newDocTitle} 
                  onChange={(e) => setNewDocTitle(e.target.value)}
                  placeholder="e.g. Passport - John Doe.pdf" 
                  className="w-full px-3 py-2 border border-black/15 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#005530]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-black/70 mb-1">Document Category</label>
                <select 
                  value={newDocType} 
                  onChange={(e) => setNewDocType(e.target.value)}
                  className="w-full px-3 py-2 border border-black/15 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#005530]"
                >
                  <option value="PDF">Passport / ID (PDF)</option>
                  <option value="Image">Photo / ID Scan (Image)</option>
                  <option value="Word">Word Document</option>
                  <option value="Contract">Guest Registration / Contract</option>
                  <option value="Other">Other File</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-black/70 mb-1">Choose File *</label>
                <input 
                  type="file" 
                  accept="image/*,.pdf,.doc,.docx,.txt"
                  onChange={handleFileSelect}
                  className="w-full text-xs text-black/70 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#005530]/10 file:text-[#005530] hover:file:bg-[#005530]/20 cursor-pointer"
                />
                {newDocFile && (
                  <p className="text-[11px] text-emerald-600 font-bold mt-1">Selected: {newDocFile.name} ({(newDocFile.size / 1024).toFixed(1)} KB)</p>
                )}
              </div>

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-black/10">
                <button 
                  type="button" 
                  onClick={() => setShowAddDocModal(false)}
                  className="px-4 py-2 border border-black/15 text-xs font-bold text-black/70 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={uploadingDoc}
                  className="px-5 py-2 bg-[#005530] text-white text-xs font-bold rounded-xl hover:bg-[#004225] transition-colors cursor-pointer shadow-sm disabled:opacity-50"
                >
                  {uploadingDoc ? 'Uploading...' : 'Save Document'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Note Modal */}
      {showAddNoteModal && (
        <div className="fixed inset-0 z-[99999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-black/10 flex items-center justify-between bg-gray-50">
              <div>
                <h3 className="text-base font-black text-black">Add Internal Note</h3>
                <p className="text-xs text-black/50">Record preferences, special requests, or operational notes</p>
              </div>
              <button 
                onClick={() => setShowAddNoteModal(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-black/40 hover:bg-black/5 hover:text-black cursor-pointer font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveNote} className="p-6 space-y-4">
              {noteError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl">
                  {noteError}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-black/70 mb-1">Note Content *</label>
                <textarea 
                  rows="4"
                  value={newNoteText} 
                  onChange={(e) => setNewNoteText(e.target.value)}
                  placeholder="e.g. Guest prefers upper floor room away from elevator..." 
                  className="w-full px-3 py-2 border border-black/15 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#005530]"
                  required
                ></textarea>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-black/10">
                <button 
                  type="button" 
                  onClick={() => setShowAddNoteModal(false)}
                  className="px-4 py-2 border border-black/15 text-xs font-bold text-black/70 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={savingNote}
                  className="px-5 py-2 bg-[#005530] text-white text-xs font-bold rounded-xl hover:bg-[#004225] transition-colors cursor-pointer shadow-sm disabled:opacity-50"
                >
                  {savingNote ? 'Saving...' : 'Save Note'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
