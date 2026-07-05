import React, { useState } from 'react';

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

export default function NewGuestProfileForm({ onBack, onSave, guest }) {
  const [formData, setFormData] = useState(() => {
    if (guest) {
      return {
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
      };
    }
    return {
      title: '',
      first_name: '',
      middle_name: '',
      last_name: '',
      gender: '',
      date_of_birth: '',
      nationality: 'Filipino',
      id_type: '',
      id_number: '',
      expiry_date: '',
      issuing_country: 'Philippines',
      phone_number: '',
      telephone: '',
      email: '',
      address_line_1: '',
      address_line_2: '',
      city: '',
      province_state: '',
      zip_postal_code: '',
      country: 'Philippines',
      preferred_room_type: '',
      preferred_floor: '',
      bed_type: '',
      smoking_preference: 'Non-Smoking',
      pillow_type: '',
      language: 'English',
      special_requests_notes: '',
      vip_status: 'Standard',
      source: 'Walk-In',
      market_segment: 'Leisure',
      referred_by: '',
      tags: '',
      notes: '',
      purpose_of_visit: ''
    };
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.first_name.trim() || !formData.last_name.trim()) {
      setError('First Name and Last Name are required.');
      return;
    }

    setSaving(true);
    setError('');
    setSuccessMsg('');

    try {
      const url = guest 
        ? `${API_BASE_URL}/api/admin/guests/${guest.dbId}`
        : `${API_BASE_URL}/api/admin/guests`;
      const method = guest ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      if (data.success) {
        setSuccessMsg(guest ? 'Guest profile updated successfully!' : 'Guest profile created successfully!');
        if (onSave) {
          setTimeout(() => {
            onSave(data.guest);
          }, 1000);
        }
      } else {
        setError(data.message || `Failed to ${guest ? 'update' : 'create'} guest profile.`);
      }
    } catch (err) {
      console.error(err);
      setError('Network error. Failed to connect to server.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: '120px', right: 0, bottom: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden', zIndex: 10, background: '#f8f9fa' }}>
      
      {/* Header Bar */}
      <div className="px-8 py-5 border-b border-black/5 bg-white shrink-0 flex items-center justify-between">
        <div className="flex flex-col">
          <button 
            type="button"
            onClick={onBack}
            className="flex items-center gap-1 text-[13px] font-medium text-black/60 hover:text-black transition-colors mb-1"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
            Back to Guests
          </button>
          <h1 className="text-[24px] font-black text-black/90 tracking-tight leading-tight">{guest ? 'Edit Guest Profile' : 'New Guest Profile'}</h1>
          <p className="text-[12px] font-medium text-black/40">{guest ? 'Modify details for this guest profile' : 'Create a new guest profile'}</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            type="button"
            onClick={onBack}
            className="px-5 py-2 border border-black/10 rounded-lg text-[13px] font-bold text-black/80 hover:bg-gray-50 shadow-sm transition-colors"
          >
            Cancel
          </button>
          <button 
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2 bg-[#005530] text-white hover:bg-[#004420] disabled:bg-[#005530]/50 rounded-lg text-[13px] font-bold shadow-sm transition-colors"
          >
            {saving ? 'Saving...' : guest ? 'Update Profile' : 'Save Profile'}
          </button>
        </div>
      </div>

      {/* Form Content Area */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-[1200px] mx-auto space-y-6">
          
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

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* 1. PERSONAL INFORMATION */}
            <div className="bg-white rounded-2xl shadow-sm border border-black/5 p-6 space-y-5">
              <h2 className="text-[14px] font-black text-black/80 tracking-wider uppercase border-b border-black/5 pb-2">Personal Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="flex flex-col">
                  <label className="text-[11px] font-bold text-black/60 mb-1.5">Title</label>
                  <select name="title" value={formData.title} onChange={handleChange} className="w-full px-3 py-2 border border-black/10 rounded-lg text-[13px] outline-none focus:border-[#005530] focus:ring-1 focus:ring-[#005530] bg-white font-medium text-black/80 shadow-sm">
                    <option value="">Select</option>
                    <option value="Mr.">Mr.</option>
                    <option value="Ms.">Ms.</option>
                    <option value="Mrs.">Mrs.</option>
                    <option value="Dr.">Dr.</option>
                    <option value="Prof.">Prof.</option>
                  </select>
                </div>
                
                <div className="flex flex-col">
                  <label className="text-[11px] font-bold text-black/60 mb-1.5">First Name <span className="text-red-500">*</span></label>
                  <input type="text" name="first_name" value={formData.first_name} onChange={handleChange} placeholder="Enter first name" required className="w-full px-3 py-2 border border-black/10 rounded-lg text-[13px] outline-none focus:border-[#005530] focus:ring-1 focus:ring-[#005530] bg-white font-medium text-black/80 placeholder-black/30 shadow-sm" />
                </div>
                
                <div className="flex flex-col">
                  <label className="text-[11px] font-bold text-black/60 mb-1.5">Middle Name</label>
                  <input type="text" name="middle_name" value={formData.middle_name} onChange={handleChange} placeholder="Enter middle name" className="w-full px-3 py-2 border border-black/10 rounded-lg text-[13px] outline-none focus:border-[#005530] focus:ring-1 focus:ring-[#005530] bg-white font-medium text-black/80 placeholder-black/30 shadow-sm" />
                </div>
                
                <div className="flex flex-col">
                  <label className="text-[11px] font-bold text-black/60 mb-1.5">Last Name <span className="text-red-500">*</span></label>
                  <input type="text" name="last_name" value={formData.last_name} onChange={handleChange} placeholder="Enter last name" required className="w-full px-3 py-2 border border-black/10 rounded-lg text-[13px] outline-none focus:border-[#005530] focus:ring-1 focus:ring-[#005530] bg-white font-medium text-black/80 placeholder-black/30 shadow-sm" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="flex flex-col">
                  <label className="text-[11px] font-bold text-black/60 mb-1.5">Gender</label>
                  <select name="gender" value={formData.gender} onChange={handleChange} className="w-full px-3 py-2 border border-black/10 rounded-lg text-[13px] outline-none focus:border-[#005530] focus:ring-1 focus:ring-[#005530] bg-white font-medium text-black/80 shadow-sm">
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                
                <div className="flex flex-col">
                  <label className="text-[11px] font-bold text-black/60 mb-1.5">Date of Birth</label>
                  <input type="date" name="date_of_birth" value={formData.date_of_birth} onChange={handleChange} className="w-full px-3 py-2 border border-black/10 rounded-lg text-[13px] outline-none focus:border-[#005530] focus:ring-1 focus:ring-[#005530] bg-white font-medium text-black/80 shadow-sm" />
                </div>
                
                <div className="flex flex-col">
                  <label className="text-[11px] font-bold text-black/60 mb-1.5">Nationality</label>
                  <select name="nationality" value={formData.nationality} onChange={handleChange} className="w-full px-3 py-2 border border-black/10 rounded-lg text-[13px] outline-none focus:border-[#005530] focus:ring-1 focus:ring-[#005530] bg-white font-medium text-black/80 shadow-sm">
                    <option value="Filipino">Filipino</option>
                    <option value="American">American</option>
                    <option value="British">British</option>
                    <option value="Canadian">Canadian</option>
                    <option value="Australian">Australian</option>
                    <option value="Japanese">Japanese</option>
                    <option value="German">German</option>
                    <option value="Korean">Korean</option>
                  </select>
                </div>
                
                <div className="flex flex-col">
                  <label className="text-[11px] font-bold text-black/60 mb-1.5">ID Type</label>
                  <select name="id_type" value={formData.id_type} onChange={handleChange} className="w-full px-3 py-2 border border-black/10 rounded-lg text-[13px] outline-none focus:border-[#005530] focus:ring-1 focus:ring-[#005530] bg-white font-medium text-black/80 shadow-sm">
                    <option value="">Select</option>
                    <option value="Passport">Passport</option>
                    <option value="Driver's License">Driver's License</option>
                    <option value="National ID">National ID</option>
                    <option value="SSS / GSIS UMID">SSS / GSIS UMID</option>
                    <option value="PRC ID">PRC ID</option>
                    <option value="Company ID">Company ID</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex flex-col">
                  <label className="text-[11px] font-bold text-black/60 mb-1.5">ID / Passport No.</label>
                  <input type="text" name="id_number" value={formData.id_number} onChange={handleChange} placeholder="Enter ID or passport number" className="w-full px-3 py-2 border border-black/10 rounded-lg text-[13px] outline-none focus:border-[#005530] focus:ring-1 focus:ring-[#005530] bg-white font-medium text-black/80 placeholder-black/30 shadow-sm" />
                </div>
                
                <div className="flex flex-col">
                  <label className="text-[11px] font-bold text-black/60 mb-1.5">Expiry Date</label>
                  <input type="date" name="expiry_date" value={formData.expiry_date} onChange={handleChange} className="w-full px-3 py-2 border border-black/10 rounded-lg text-[13px] outline-none focus:border-[#005530] focus:ring-1 focus:ring-[#005530] bg-white font-medium text-black/80 shadow-sm" />
                </div>
                
                <div className="flex flex-col">
                  <label className="text-[11px] font-bold text-black/60 mb-1.5">Issuing Country</label>
                  <select name="issuing_country" value={formData.issuing_country} onChange={handleChange} className="w-full px-3 py-2 border border-black/10 rounded-lg text-[13px] outline-none focus:border-[#005530] focus:ring-1 focus:ring-[#005530] bg-white font-medium text-black/80 shadow-sm">
                    <option value="Philippines">Philippines</option>
                    <option value="United States">United States</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="Canada">Canada</option>
                    <option value="Australia">Australia</option>
                    <option value="Japan">Japan</option>
                    <option value="South Korea">South Korea</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 2. CONTACT INFORMATION */}
            <div className="bg-white rounded-2xl shadow-sm border border-black/5 p-6 space-y-5">
              <h2 className="text-[14px] font-black text-black/80 tracking-wider uppercase border-b border-black/5 pb-2">Contact Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex flex-col">
                  <label className="text-[11px] font-bold text-black/60 mb-1.5">Mobile Number</label>
                  <div className="flex shadow-sm rounded-lg border border-black/10 focus-within:border-[#005530] focus-within:ring-1 focus-within:ring-[#005530] overflow-hidden bg-white">
                    <span className="bg-gray-50 border-r border-black/10 px-3 py-2 text-[13px] font-medium text-black/60 select-none flex items-center gap-1">
                      🇵🇭 +63
                    </span>
                    <input type="tel" name="phone_number" value={formData.phone_number} onChange={handleChange} placeholder="Enter mobile number" className="w-full px-3 py-2 text-[13px] outline-none bg-transparent font-medium text-black/80 placeholder-black/30" />
                  </div>
                </div>
                
                <div className="flex flex-col">
                  <label className="text-[11px] font-bold text-black/60 mb-1.5">Telephone</label>
                  <input type="tel" name="telephone" value={formData.telephone} onChange={handleChange} placeholder="Enter telephone number" className="w-full px-3 py-2 border border-black/10 rounded-lg text-[13px] outline-none focus:border-[#005530] focus:ring-1 focus:ring-[#005530] bg-white font-medium text-black/80 placeholder-black/30 shadow-sm" />
                </div>
                
                <div className="flex flex-col">
                  <label className="text-[11px] font-bold text-black/60 mb-1.5">Email Address</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Enter email address" className="w-full px-3 py-2 border border-black/10 rounded-lg text-[13px] outline-none focus:border-[#005530] focus:ring-1 focus:ring-[#005530] bg-white font-medium text-black/80 placeholder-black/30 shadow-sm" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex flex-col md:col-span-1">
                  <label className="text-[11px] font-bold text-black/60 mb-1.5">Address Line 1</label>
                  <input type="text" name="address_line_1" value={formData.address_line_1} onChange={handleChange} placeholder="Enter address" className="w-full px-3 py-2 border border-black/10 rounded-lg text-[13px] outline-none focus:border-[#005530] focus:ring-1 focus:ring-[#005530] bg-white font-medium text-black/80 placeholder-black/30 shadow-sm" />
                </div>
                <div className="flex flex-col md:col-span-2">
                  <label className="text-[11px] font-bold text-black/60 mb-1.5">Address Line 2 (Optional)</label>
                  <input type="text" name="address_line_2" value={formData.address_line_2} onChange={handleChange} placeholder="Enter address (optional)" className="w-full px-3 py-2 border border-black/10 rounded-lg text-[13px] outline-none focus:border-[#005530] focus:ring-1 focus:ring-[#005530] bg-white font-medium text-black/80 placeholder-black/30 shadow-sm" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="flex flex-col">
                  <label className="text-[11px] font-bold text-black/60 mb-1.5">City</label>
                  <input type="text" name="city" value={formData.city} onChange={handleChange} placeholder="Enter city" className="w-full px-3 py-2 border border-black/10 rounded-lg text-[13px] outline-none focus:border-[#005530] focus:ring-1 focus:ring-[#005530] bg-white font-medium text-black/80 placeholder-black/30 shadow-sm" />
                </div>
                
                <div className="flex flex-col">
                  <label className="text-[11px] font-bold text-black/60 mb-1.5">Province / State</label>
                  <input type="text" name="province_state" value={formData.province_state} onChange={handleChange} placeholder="Enter province / state" className="w-full px-3 py-2 border border-black/10 rounded-lg text-[13px] outline-none focus:border-[#005530] focus:ring-1 focus:ring-[#005530] bg-white font-medium text-black/80 placeholder-black/30 shadow-sm" />
                </div>
                
                <div className="flex flex-col">
                  <label className="text-[11px] font-bold text-black/60 mb-1.5">ZIP / Postal Code</label>
                  <input type="text" name="zip_postal_code" value={formData.zip_postal_code} onChange={handleChange} placeholder="Enter zip / postal code" className="w-full px-3 py-2 border border-black/10 rounded-lg text-[13px] outline-none focus:border-[#005530] focus:ring-1 focus:ring-[#005530] bg-white font-medium text-black/80 placeholder-black/30 shadow-sm" />
                </div>
                
                <div className="flex flex-col">
                  <label className="text-[11px] font-bold text-black/60 mb-1.5">Country</label>
                  <select name="country" value={formData.country} onChange={handleChange} className="w-full px-3 py-2 border border-black/10 rounded-lg text-[13px] outline-none focus:border-[#005530] focus:ring-1 focus:ring-[#005530] bg-white font-medium text-black/80 shadow-sm">
                    <option value="Philippines">Philippines</option>
                    <option value="United States">United States</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="Canada">Canada</option>
                    <option value="Australia">Australia</option>
                    <option value="Singapore">Singapore</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 3. STAY PREFERENCES */}
            <div className="bg-white rounded-2xl shadow-sm border border-black/5 p-6 space-y-5">
              <h2 className="text-[14px] font-black text-black/80 tracking-wider uppercase border-b border-black/5 pb-2">Stay Preferences</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="flex flex-col">
                  <label className="text-[11px] font-bold text-black/60 mb-1.5">Preferred Room Type</label>
                  <select name="preferred_room_type" value={formData.preferred_room_type} onChange={handleChange} className="w-full px-3 py-2 border border-black/10 rounded-lg text-[13px] outline-none focus:border-[#005530] focus:ring-1 focus:ring-[#005530] bg-white font-medium text-black/80 shadow-sm">
                    <option value="">Select</option>
                    <option value="Standard Room">Standard Room</option>
                    <option value="Deluxe Room">Deluxe Room</option>
                    <option value="Suite">Suite</option>
                    <option value="Family Room">Family Room</option>
                    <option value="Presidential Suite">Presidential Suite</option>
                  </select>
                </div>
                
                <div className="flex flex-col">
                  <label className="text-[11px] font-bold text-black/60 mb-1.5">Preferred Floor</label>
                  <select name="preferred_floor" value={formData.preferred_floor} onChange={handleChange} className="w-full px-3 py-2 border border-black/10 rounded-lg text-[13px] outline-none focus:border-[#005530] focus:ring-1 focus:ring-[#005530] bg-white font-medium text-black/80 shadow-sm">
                    <option value="">Select</option>
                    <option value="Floor 1">Floor 1</option>
                    <option value="Floor 2">Floor 2</option>
                    <option value="Floor 3">Floor 3</option>
                    <option value="Floor 4">Floor 4</option>
                    <option value="Floor 5">Floor 5</option>
                  </select>
                </div>
                
                <div className="flex flex-col">
                  <label className="text-[11px] font-bold text-black/60 mb-1.5">Bed Type</label>
                  <select name="bed_type" value={formData.bed_type} onChange={handleChange} className="w-full px-3 py-2 border border-black/10 rounded-lg text-[13px] outline-none focus:border-[#005530] focus:ring-1 focus:ring-[#005530] bg-white font-medium text-black/80 shadow-sm">
                    <option value="">Select</option>
                    <option value="Queen Bed">Queen Bed</option>
                    <option value="King Bed">King Bed</option>
                    <option value="Double Bed">Double Bed</option>
                    <option value="Single Bed">Single Bed</option>
                  </select>
                </div>
                
                <div className="flex flex-col">
                  <label className="text-[11px] font-bold text-black/60 mb-1.5">Smoking Preference</label>
                  <select name="smoking_preference" value={formData.smoking_preference} onChange={handleChange} className="w-full px-3 py-2 border border-black/10 rounded-lg text-[13px] outline-none focus:border-[#005530] focus:ring-1 focus:ring-[#005530] bg-white font-medium text-black/80 shadow-sm">
                    <option value="Non-Smoking">Non-Smoking</option>
                    <option value="Smoking">Smoking</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="flex flex-col">
                  <label className="text-[11px] font-bold text-black/60 mb-1.5">Pillow Type</label>
                  <select name="pillow_type" value={formData.pillow_type} onChange={handleChange} className="w-full px-3 py-2 border border-black/10 rounded-lg text-[13px] outline-none focus:border-[#005530] focus:ring-1 focus:ring-[#005530] bg-white font-medium text-black/80 shadow-sm">
                    <option value="">Select</option>
                    <option value="Feather">Feather</option>
                    <option value="Foam">Foam</option>
                    <option value="Latex">Latex</option>
                    <option value="Memory Foam">Memory Foam</option>
                  </select>
                </div>
                
                <div className="flex flex-col">
                  <label className="text-[11px] font-bold text-black/60 mb-1.5">Language</label>
                  <select name="language" value={formData.language} onChange={handleChange} className="w-full px-3 py-2 border border-black/10 rounded-lg text-[13px] outline-none focus:border-[#005530] focus:ring-1 focus:ring-[#005530] bg-white font-medium text-black/80 shadow-sm">
                    <option value="English">English</option>
                    <option value="Tagalog">Tagalog</option>
                    <option value="Spanish">Spanish</option>
                    <option value="Japanese">Japanese</option>
                    <option value="Korean">Korean</option>
                    <option value="Mandarin">Mandarin</option>
                  </select>
                </div>
                
                <div className="flex flex-col md:col-span-2">
                  <label className="text-[11px] font-bold text-black/60 mb-1.5">Special Requests / Notes</label>
                  <input type="text" name="special_requests_notes" value={formData.special_requests_notes} onChange={handleChange} placeholder="Enter special requests or notes" className="w-full px-3 py-2 border border-black/10 rounded-lg text-[13px] outline-none focus:border-[#005530] focus:ring-1 focus:ring-[#005530] bg-white font-medium text-black/80 placeholder-black/30 shadow-sm" />
                </div>
              </div>
            </div>

            {/* 4. ADDITIONAL INFORMATION (Optional) */}
            <div className="bg-white rounded-2xl shadow-sm border border-black/5 p-6 space-y-5">
              <h2 className="text-[14px] font-black text-black/80 tracking-wider uppercase border-b border-black/5 pb-2">Additional Information (Optional)</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="flex flex-col">
                  <label className="text-[11px] font-bold text-black/60 mb-1.5">VIP Status</label>
                  <select name="vip_status" value={formData.vip_status} onChange={handleChange} className="w-full px-3 py-2 border border-black/10 rounded-lg text-[13px] outline-none focus:border-[#005530] focus:ring-1 focus:ring-[#005530] bg-white font-medium text-black/80 shadow-sm">
                    <option value="Standard">Standard</option>
                    <option value="VIP">VIP</option>
                    <option value="Blacklisted">Blacklisted</option>
                  </select>
                </div>
                
                <div className="flex flex-col">
                  <label className="text-[11px] font-bold text-black/60 mb-1.5">Source</label>
                  <select name="source" value={formData.source} onChange={handleChange} className="w-full px-3 py-2 border border-black/10 rounded-lg text-[13px] outline-none focus:border-[#005530] focus:ring-1 focus:ring-[#005530] bg-white font-medium text-black/80 shadow-sm">
                    <option value="Walk-In">Walk-In</option>
                    <option value="Direct Website">Direct Website</option>
                    <option value="Booking.com">Booking.com</option>
                    <option value="Agoda">Agoda</option>
                    <option value="Expedia">Expedia</option>
                    <option value="Airbnb">Airbnb</option>
                  </select>
                </div>
                
                <div className="flex flex-col">
                  <label className="text-[11px] font-bold text-black/60 mb-1.5">Market Segment</label>
                  <select name="market_segment" value={formData.market_segment} onChange={handleChange} className="w-full px-3 py-2 border border-black/10 rounded-lg text-[13px] outline-none focus:border-[#005530] focus:ring-1 focus:ring-[#005530] bg-white font-medium text-black/80 shadow-sm">
                    <option value="Leisure">Leisure</option>
                    <option value="Corporate">Corporate</option>
                    <option value="Government">Government</option>
                    <option value="Groups">Groups</option>
                  </select>
                </div>
                
                <div className="flex flex-col">
                  <label className="text-[11px] font-bold text-black/60 mb-1.5">Referred By</label>
                  <input type="text" name="referred_by" value={formData.referred_by} onChange={handleChange} placeholder="Enter name or company (optional)" className="w-full px-3 py-2 border border-black/10 rounded-lg text-[13px] outline-none focus:border-[#005530] focus:ring-1 focus:ring-[#005530] bg-white font-medium text-black/80 placeholder-black/30 shadow-sm" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="flex flex-col col-span-1">
                  <label className="text-[11px] font-bold text-black/60 mb-1.5">Purpose of Visit</label>
                  <input type="text" name="purpose_of_visit" value={formData.purpose_of_visit} onChange={handleChange} placeholder="e.g. Vacation, Business" className="w-full px-3 py-2 border border-black/10 rounded-lg text-[13px] outline-none focus:border-[#005530] focus:ring-1 focus:ring-[#005530] bg-white font-medium text-black/80 placeholder-black/30 shadow-sm" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <label className="text-[11px] font-bold text-black/60 mb-1.5">Tags</label>
                  <input type="text" name="tags" value={formData.tags} onChange={handleChange} placeholder="Add tags (e.g., VIP, Repeat Guest, Birthday)" className="w-full px-3 py-2 border border-black/10 rounded-lg text-[13px] outline-none focus:border-[#005530] focus:ring-1 focus:ring-[#005530] bg-white font-medium text-black/80 placeholder-black/30 shadow-sm" />
                </div>
                
                <div className="flex flex-col">
                  <label className="text-[11px] font-bold text-black/60 mb-1.5">Notes</label>
                  <textarea name="notes" value={formData.notes} onChange={handleChange} placeholder="Add notes about the guest (optional)" rows="2" className="w-full px-3 py-2 border border-black/10 rounded-lg text-[13px] outline-none focus:border-[#005530] focus:ring-1 focus:ring-[#005530] bg-white font-medium text-black/80 placeholder-black/30 shadow-sm resize-none"></textarea>
                </div>
              </div>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}
