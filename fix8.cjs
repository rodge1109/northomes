const fs = require('fs');
let c = fs.readFileSync('src/App.jsx', 'utf8');

// Add updateMasterResStatus if not exists
const funcStr = `
  const updateMasterResStatus = async (id, newStatus) => {
    setUpdatingId(id);
    try {
      const response = await fetch(\`\${API_BASE_URL}/api/reservations/\${id}/status\`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await response.json();
      if (data.success) {
        setMasterRes(prev => prev.map(apt =>
          apt.id === id ? { ...apt, status: newStatus } : apt
        ));
      }
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setUpdatingId(null);
    }
  };
`;

if (!c.includes('const updateMasterResStatus =')) {
  c = c.replace(
    'const updateStatus = async (id, newStatus) => {',
    funcStr + '\n  const updateStatus = async (id, newStatus) => {'
  );
}

// Replace the Actions buttons in the masterRes map
const oldActions = `                            <div className="flex flex-wrap gap-1 justify-end">
                              <button onClick={() => { setActiveTab('frontdesk'); }} className="px-3 py-1.5 bg-green-50 text-[#00754A] rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-green-100 transition-all border border-green-200 shadow-sm">
                                Manage
                              </button>
                            </div>`;

const newActions = `                            <div className="flex flex-wrap gap-1 justify-end">
                              {apt.status === 'pending' && (
                                <>
                                  <button onClick={() => updateMasterResStatus(apt.id, 'confirmed')} disabled={updatingId === apt.id} className="px-2 py-1 bg-green-50 text-green-600 rounded text-[10px] font-bold uppercase tracking-wider hover:bg-green-100 transition-all border border-green-200 disabled:opacity-50">
                                    Confirm
                                  </button>
                                  <button onClick={() => updateMasterResStatus(apt.id, 'cancelled')} disabled={updatingId === apt.id} className="px-2 py-1 bg-red-50 text-red-600 rounded text-[10px] font-bold uppercase tracking-wider hover:bg-red-100 transition-all border border-red-200 disabled:opacity-50">
                                    Cancel
                                  </button>
                                </>
                              )}
                              {apt.status === 'confirmed' && (
                                <button onClick={() => updateMasterResStatus(apt.id, 'cancelled')} disabled={updatingId === apt.id} className="px-2 py-1 bg-red-50 text-red-600 rounded text-[10px] font-bold uppercase tracking-wider hover:bg-red-100 transition-all border border-red-200 disabled:opacity-50">
                                  Cancel
                                </button>
                              )}
                              {apt.status === 'checked_in' && (
                                <button onClick={() => updateMasterResStatus(apt.id, 'checked_out')} disabled={updatingId === apt.id} className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-[10px] font-bold uppercase tracking-wider hover:bg-blue-100 transition-all border border-blue-200 disabled:opacity-50">
                                  Complete
                                </button>
                              )}
                              {(apt.status === 'cancelled' || apt.status === 'checked_out' || apt.status === 'completed') && (
                                <button onClick={() => updateMasterResStatus(apt.id, 'pending')} disabled={updatingId === apt.id} className="px-2 py-1 bg-amber-50 text-amber-600 rounded text-[10px] font-bold uppercase tracking-wider hover:bg-amber-100 transition-all border border-amber-200 disabled:opacity-50">
                                  Reopen
                                </button>
                              )}
                              <button onClick={() => { setActiveTab('frontdesk'); }} className="px-3 py-1.5 bg-[#00754A] text-white rounded-lg text-[10px] font-bold uppercase tracking-wider hover:bg-[#006241] transition-all shadow-sm ml-1">
                                Manage
                              </button>
                            </div>`;

c = c.replace(oldActions, newActions);
fs.writeFileSync('src/App.jsx', c);
console.log('Done replacing actions');
