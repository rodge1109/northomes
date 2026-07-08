const fs = require('fs');
const file = 'c:\\website\\northomes-system\\src\\CorporateProfileView.jsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Inject handleDelete
const findHandleSave = `  const handleSave = async () => {`;
const injectHandleDelete = `  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this corporate account?')) return;
    
    setSaving(true);
    try {
      const response = await fetch(\`\${API_BASE_URL}/api/corporate-accounts/\${account.id}\`, {
        method: 'DELETE'
      });
      const data = await response.json();
      if (data.success) {
        if (onSave) onSave(null);
      } else {
        setError(data.message || 'Failed to delete account.');
        setSaving(false);
      }
    } catch (err) {
      console.error(err);
      setError('Network error. Failed to connect to server.');
      setSaving(false);
    }
  };

  const handleSave = async () => {`;
content = content.replace(findHandleSave, injectHandleDelete);

// 2. Inject Delete Button
const findButtons = `              <button 
                onClick={() => setIsEditing(true)} 
                className="px-5 py-2 border border-black/10 rounded-lg text-[13px] font-bold text-black/80 hover:bg-gray-50 shadow-sm transition-colors"
              >
                Edit Account
              </button>`;
const replButtons = `              <button 
                onClick={handleDelete} 
                className="px-5 py-2 border border-red-200 bg-red-50 text-red-700 rounded-lg text-[13px] font-bold hover:bg-red-100 shadow-sm transition-colors"
              >
                Delete
              </button>
              <button 
                onClick={() => setIsEditing(true)} 
                className="px-5 py-2 border border-black/10 rounded-lg text-[13px] font-bold text-black/80 hover:bg-gray-50 shadow-sm transition-colors"
              >
                Edit Account
              </button>`;
content = content.replace(findButtons, replButtons);

fs.writeFileSync(file, content, 'utf8');
console.log('Delete feature added!');
