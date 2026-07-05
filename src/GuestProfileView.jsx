import React, { useState, useEffect } from 'react';

const API_BASE_URL = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ? 'http://localhost:5000'
  : 'https://northomes.onrender.com';

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

export default function GuestProfileView({ guest, onBack, onSave }) {
  if (!guest) return null;

  const [activeTab, setActiveTab] = useState('Profile');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

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
        <label className="text-[11px] font-bold text-black/60 mb-1.5">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        {options ? (
          <select name={name} value={value} onChange={handleChange} className="w-full px-3 py-2 border border-black/10 rounded-lg text-[13px] outline-none focus:border-[#005530] focus:ring-1 focus:ring-[#005530] bg-white font-medium text-black/80 shadow-sm">
            <option value="">Select</option>
            {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        ) : type === 'textarea' ? (
          <textarea name={name} value={value} onChange={handleChange} placeholder={`Enter ${label.toLowerCase()}`} rows="2" className="w-full px-3 py-2 border border-black/10 rounded-lg text-[13px] outline-none focus:border-[#005530] focus:ring-1 focus:ring-[#005530] bg-white font-medium text-black/80 placeholder-black/30 shadow-sm resize-none"></textarea>
        ) : name === 'phone_number' ? (
          <div className="flex shadow-sm rounded-lg border border-black/10 focus-within:border-[#005530] focus-within:ring-1 focus-within:ring-[#005530] overflow-hidden bg-white">
            <span className="bg-gray-50 border-r border-black/10 px-3 py-2 text-[13px] font-medium text-black/60 select-none flex items-center gap-1">
              🇵🇭 +63
            </span>
            <input type="tel" name="phone_number" value={value} onChange={handleChange} placeholder="Enter mobile number" className="w-full px-3 py-2 text-[13px] outline-none bg-transparent font-medium text-black/80 placeholder-black/30" />
          </div>
        ) : (
          <input type={type} name={name} value={value} onChange={handleChange} placeholder={`Enter ${label.toLowerCase()}`} required={required} className="w-full px-3 py-2 border border-black/10 rounded-lg text-[13px] outline-none focus:border-[#005530] focus:ring-1 focus:ring-[#005530] bg-white font-medium text-black/80 placeholder-black/30 shadow-sm" />
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
                className="px-5 py-2 border border-black/10 rounded-lg text-[13px] font-bold text-black/80 hover:bg-gray-50 shadow-sm transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSave} 
                disabled={saving} 
                className="px-5 py-2 bg-[#005530] text-white hover:bg-[#004420] disabled:bg-[#005530]/50 rounded-lg text-[13px] font-bold shadow-sm transition-colors"
              >
                {saving ? 'Saving...' : 'Save Profile'}
              </button>
            </>
          ) : (
            <>
              <button 
                onClick={() => setIsEditing(true)} 
                className="px-5 py-2 border border-black/10 rounded-lg text-[13px] font-bold text-black/80 hover:bg-gray-50 shadow-sm transition-colors"
              >
                Edit Profile
              </button>
              <button className="flex items-center gap-2 px-5 py-2 bg-[#005530] text-white hover:bg-[#004420] rounded-lg text-[13px] font-bold shadow-sm transition-colors">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                New Reservation
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Content Scrollable Area */}
      <div className="flex-1 overflow-y-auto p-8">
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
          
          <div className="flex gap-6">
            
            {/* Left Column (Main Info & Form) */}
            <div className="flex-1 space-y-6">
              
              {/* Top Identity Card */}
              <div className="bg-white rounded-2xl shadow-sm border border-black/5 p-6 relative">
                <div className="flex items-center gap-4">
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
              <div className="border-b border-black/10 flex items-center gap-8 text-[13px] font-bold text-black/50 px-2 mt-4">
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
                  <div className="bg-white rounded-2xl shadow-sm border border-black/5 p-6 space-y-5">
                    <h3 className="text-[14px] font-black text-black/85 tracking-tight border-b border-black/5 pb-2 uppercase">Personal Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      {renderField('Title', 'title', 'text', ["Mr.", "Ms.", "Mrs.", "Dr.", "Prof."])}
                      {renderField('First Name', 'first_name', 'text', null, true)}
                      {renderField('Middle Name', 'middle_name', 'text')}
                      {renderField('Last Name', 'last_name', 'text', null, true)}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      {renderField('Gender', 'gender', 'text', ["Male", "Female", "Other"])}
                      {renderField('Date of Birth', 'date_of_birth', 'date')}
                      {renderField('Nationality', 'nationality', 'text', ["Filipino", "American", "British", "Canadian", "Australian", "Japanese", "German", "Korean"])}
                      {renderField('ID Type', 'id_type', 'text', ["Passport", "Driver's License", "National ID", "SSS / GSIS UMID", "PRC ID", "Company ID"])}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {renderField('ID / Passport No.', 'id_number')}
                      {renderField('Expiry Date', 'expiry_date', 'date')}
                      {renderField('Issuing Country', 'issuing_country', 'text', ["Philippines", "United States", "United Kingdom", "Canada", "Australia", "Japan", "South Korea"])}
                    </div>
                  </div>

                  {/* 2. CONTACT INFORMATION */}
                  <div className="bg-white rounded-2xl shadow-sm border border-black/5 p-6 space-y-5">
                    <h3 className="text-[14px] font-black text-black/85 tracking-tight border-b border-black/5 pb-2 uppercase">Contact Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {renderField('Mobile Number', 'phone_number')}
                      {renderField('Telephone', 'telephone')}
                      {renderField('Email Address', 'email')}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="md:col-span-1">{renderField('Address Line 1', 'address_line_1')}</div>
                      <div className="md:col-span-2">{renderField('Address Line 2 (Optional)', 'address_line_2')}</div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      {renderField('City', 'city')}
                      {renderField('Province / State', 'province_state')}
                      {renderField('ZIP / Postal Code', 'zip_postal_code')}
                      {renderField('Country', 'country', 'text', ["Philippines", "United States", "United Kingdom", "Canada", "Australia", "Singapore"])}
                    </div>
                  </div>

                  {/* 3. STAY PREFERENCES */}
                  <div className="bg-white rounded-2xl shadow-sm border border-black/5 p-6 space-y-5">
                    <h3 className="text-[14px] font-black text-black/85 tracking-tight border-b border-black/5 pb-2 uppercase">Stay Preferences</h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      {renderField('Preferred Room Type', 'preferred_room_type', 'text', ["Standard Room", "Deluxe Room", "Suite", "Family Room", "Presidential Suite"])}
                      {renderField('Preferred Floor', 'preferred_floor', 'text', ["Floor 1", "Floor 2", "Floor 3", "Floor 4", "Floor 5"])}
                      {renderField('Bed Type', 'bed_type', 'text', ["Queen Bed", "King Bed", "Double Bed", "Single Bed"])}
                      {renderField('Smoking Preference', 'smoking_preference', 'text', ["Non-Smoking", "Smoking"])}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      {renderField('Pillow Type', 'pillow_type', 'text', ["Feather", "Foam", "Latex", "Memory Foam"])}
                      {renderField('Language', 'language', 'text', ["English", "Tagalog", "Spanish", "Japanese", "Korean", "Mandarin"])}
                      <div className="md:col-span-2">{renderField('Special Requests / Notes', 'special_requests_notes')}</div>
                    </div>
                  </div>

                  {/* 4. ADDITIONAL INFORMATION */}
                  <div className="bg-white rounded-2xl shadow-sm border border-black/5 p-6 space-y-5">
                    <h3 className="text-[14px] font-black text-black/85 tracking-tight border-b border-black/5 pb-2 uppercase">Additional Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      {renderField('VIP Status', 'vip_status', 'text', ["Standard", "VIP", "Blacklisted"])}
                      {renderField('Source', 'source', 'text', ["Walk-In", "Direct Website", "Booking.com", "Agoda", "Expedia", "Airbnb"])}
                      {renderField('Market Segment', 'market_segment', 'text', ["Leisure", "Corporate", "Government", "Groups"])}
                      {renderField('Referred By', 'referred_by')}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                <div className="bg-white rounded-2xl shadow-sm border border-black/5 overflow-hidden">
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
                                <td className="px-6 py-4">
                                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${stay.status === 'checked_in' ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-600'}`}>
                                    {stay.status === 'checked_in' ? 'In-House' : stay.status}
                                  </span>
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
                <div className="bg-white rounded-2xl shadow-sm border border-black/5 overflow-hidden">
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
                <div className="bg-white rounded-2xl shadow-sm border border-black/5 overflow-hidden">
                  <div className="px-6 py-4 border-b border-black/5 flex items-center justify-between">
                    <h3 className="text-[14px] font-black text-black/85 tracking-tight uppercase">Uploaded Documents</h3>
                    <button className="text-[12px] font-bold text-[#005530] hover:underline flex items-center gap-1">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                      Add Document
                    </button>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-3 p-3 border border-black/10 rounded-xl max-w-md bg-gray-50/50">
                      <div className="w-10 h-10 border border-[#EF5350] bg-[#FFEBEE] rounded flex items-center justify-center shrink-0">
                        <span className="text-[10px] font-black text-[#EF5350]">PDF</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[12px] font-bold text-black/90 truncate">Passport - {guest.name}.pdf</div>
                        <div className="text-[10px] text-black/40 font-medium truncate mt-0.5">Uploaded on Jan 12, 2024 by Maria Santos</div>
                      </div>
                      <button className="text-black/40 hover:text-black/80 cursor-pointer">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'Notes' && (
                <div className="bg-white rounded-2xl shadow-sm border border-black/5 overflow-hidden">
                  <div className="px-6 py-4 border-b border-black/5 flex items-center justify-between">
                    <h3 className="text-[14px] font-black text-black/85 tracking-tight uppercase">Internal Notes</h3>
                    <button className="text-[12px] font-bold text-[#005530] hover:underline flex items-center gap-1">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                      Add Note
                    </button>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="bg-[#FFF8E1] border border-[#FFECB3] rounded-xl p-3 relative">
                      <p className="text-[12px] font-medium text-black/80 pr-6">Prefers rooms away from elevator.</p>
                      <p className="text-[10px] text-black/40 mt-1 font-medium">May 10, 2025 10:15 AM by Maria Santos</p>
                    </div>
                    <div className="bg-[#E3F2FD] border border-[#BBDEFB] rounded-xl p-3 relative">
                      <p className="text-[12px] font-medium text-black/80 pr-6">Celebrated birthday last stay. Sent cake to room.</p>
                      <p className="text-[10px] text-black/40 mt-1 font-medium">Apr 12, 2025 4:30 PM by John Cruz</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column (Widgets) - Hidden when editing to give full width */}
            {!isEditing && (
              <div className="w-[360px] shrink-0 space-y-6">
                
                {/* Account Summary */}
                <div className="bg-white rounded-2xl shadow-sm border border-black/5 overflow-hidden">
                  <div className="px-5 py-4 border-b border-black/5">
                    <h3 className="text-[14px] font-black text-black/90 tracking-tight">Account Summary</h3>
                  </div>
                  <div className="p-5 space-y-3">
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
                      <span className="font-bold text-black/90">{fmtCurrency(guest.totalSpent)}</span>
                    </div>
                    <div className="flex items-center justify-between text-[13px] pt-2 border-t border-black/5">
                      <span className="text-black/80 font-black">Outstanding Balance</span>
                      <span className="font-bold text-emerald-600">₱0.00</span>
                    </div>
                  </div>
                </div>

                {/* Stay History Summary (Last 5) */}
                <div className="bg-white rounded-2xl shadow-sm border border-black/5 overflow-hidden">
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
    </div>
  );
}
