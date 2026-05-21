import re

path = r'c:\website\hotel-reservation-system\src\App.jsx'
with open(path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Remove lines 7854 to 7887 (0-indexed: 7853 to 7886)
# And replace with global constants
new_constants = r'''
// ── Constants & Helpers (Global Scope) ────────────────────────────────────────

const roomStatusConfig = {
    available: { label: 'Available', bg: 'bg-green-500/20', border: 'border-green-400/30', text: 'text-green-300', dot: 'bg-green-400', pill: 'bg-green-500/25 text-green-200' },
    occupied: { label: 'Occupied', bg: 'bg-blue-500/20', border: 'border-blue-400/30', text: 'text-blue-300', dot: 'bg-blue-400', pill: 'bg-blue-500/25 text-blue-200' },
    due_out: { label: 'Due Out', bg: 'bg-orange-500/20', border: 'border-orange-400/30', text: 'text-orange-300', dot: 'bg-orange-400', pill: 'bg-orange-500/25 text-orange-200' },
    arriving: { label: 'Arriving', bg: 'bg-purple-500/20', border: 'border-purple-400/30', text: 'text-purple-300', dot: 'bg-purple-400', pill: 'bg-purple-500/25 text-purple-200' },
    dirty: { label: 'Dirty', bg: 'bg-yellow-500/20', border: 'border-yellow-400/30', text: 'text-yellow-300', dot: 'bg-yellow-400', pill: 'bg-yellow-500/25 text-yellow-200' },
    inspected: { label: 'Inspected', bg: 'bg-teal-500/20', border: 'border-teal-400/30', text: 'text-teal-300', dot: 'bg-teal-400', pill: 'bg-teal-500/25 text-teal-200' },
    out_of_order: { label: 'Out of Order', bg: 'bg-red-500/20', border: 'border-red-400/30', text: 'text-red-300', dot: 'bg-red-400', pill: 'bg-red-500/25 text-red-200' },
};

const sidebarItems = [
    { id: 'arrivals', label: 'Arrivals', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
    { id: 'inhouse', label: 'In-House', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { id: 'rooms', label: 'Rooms', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
    { id: 'walkin', label: 'Walk-In', icon: 'M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z' },
    { id: 'calendar', label: 'Tape Chart', icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
    { id: 'search', label: 'Search', icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' },
];

const statusColors = {
  pending: { bg: 'bg-amber-500/10', text: 'text-amber-400', bar: 'bg-amber-500' },
  confirmed: { bg: 'bg-blue-500/10', text: 'text-blue-400', bar: 'bg-blue-500' },
  checked_in: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', bar: 'bg-emerald-500' },
  checked_out: { bg: 'bg-gray-500/10', text: 'text-gray-400', bar: 'bg-gray-500' },
  cancelled: { bg: 'bg-rose-500/10', text: 'text-rose-400', bar: 'bg-rose-500' },
};

const statusLabel = (s) => s.replace('_', ' ').toUpperCase();
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—';
const nightsCount = (r) => {
  if (!r.check_in_date || !r.check_out_date) return 0;
  return Math.max(0, Math.floor((new Date(r.check_out_date) - new Date(r.check_in_date)) / 86400000));
};

'''

output_lines = lines[:7853] + [new_constants] + lines[7887:]

with open(path, 'w', encoding='utf-8') as f:
    f.writelines(output_lines)

print("Cleaned up garbage block and added global constants.")
