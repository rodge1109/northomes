const fs = require('fs');
const file = 'c:\\website\\northomes-system\\src\\App.jsx';
let content = fs.readFileSync(file, 'utf8');

let wasCRLF = content.includes('\r\n');
if (wasCRLF) {
  content = content.replace(/\r\n/g, '\n');
}

// 1. Update state declarations
const stateTarget = `  const [newRoomNotes, setNewRoomNotes] = React.useState('');`;
const stateReplacement = `  const [newRoomNotes, setNewRoomNotes] = React.useState('1 single bed');
  const [isOthersBedConfig, setIsOthersBedConfig] = React.useState(false);`;

if (content.includes(stateTarget)) {
  content = content.replace(stateTarget, stateReplacement);
  console.log('State variables updated.');
} else {
  console.log('State target NOT found.');
}

// 2. Update addRoom handler reset
const handlerTarget = `      setAddRoomOpen(false); setNewRoomNumber(''); setNewRoomType(''); setNewRoomFloor(1); setNewRoomNotes('');`;
const handlerReplacement = `      setAddRoomOpen(false); setNewRoomNumber(''); setNewRoomType(''); setNewRoomFloor(1); setNewRoomNotes('1 single bed'); setIsOthersBedConfig(false);`;

if (content.includes(handlerTarget)) {
  content = content.replace(handlerTarget, handlerReplacement);
  console.log('addRoom reset logic updated.');
} else {
  console.log('handlerTarget NOT found.');
}

// 3. Update Input component to dropdown in UI
const inputTarget = `                        <div>
                          <label className="block text-xs text-black/60 mb-1">Bed Config / Notes</label>
                          <input type="text" value={newRoomNotes} onChange={e => setNewRoomNotes(e.target.value)}
                            placeholder="e.g. 1 Queen or 2 Twins"
                            className="w-full px-3 py-2 rounded-lg border border-black/5 bg-white shadow-sm text-[#000000]/87 placeholder-white/30 text-sm outline-none focus:border-[#00754A]" />
                        </div>`;

const inputReplacement = `                        <div>
                          <label className="block text-xs text-black/60 mb-1">Bed Config / Notes</label>
                          <select 
                            value={isOthersBedConfig ? 'others' : newRoomNotes} 
                            onChange={e => {
                              const val = e.target.value;
                              if (val === 'others') {
                                setIsOthersBedConfig(true);
                                setNewRoomNotes('');
                              } else {
                                setIsOthersBedConfig(false);
                                setNewRoomNotes(val);
                              }
                            }}
                            className="w-full px-3 py-2 rounded-lg border border-black/5 bg-white shadow-sm text-[#000000]/87 text-sm outline-none focus:border-black/5 mb-1.5"
                          >
                            <option value="1 single bed">1 single bed</option>
                            <option value="1 queen bed">1 queen bed</option>
                            <option value="2 single bed">2 single bed</option>
                            <option value="2 double bed">2 double bed</option>
                            <option value="4 single bed">4 single bed</option>
                            <option value="others">others</option>
                          </select>
                          {isOthersBedConfig && (
                            <input 
                              type="text" 
                              value={newRoomNotes} 
                              onChange={e => setNewRoomNotes(e.target.value)}
                              placeholder="specify custom config..."
                              className="w-full px-3 py-2 rounded-lg border border-black/5 bg-white shadow-sm text-[#000000]/87 placeholder-white/30 text-xs outline-none focus:border-[#00754A]" 
                            />
                          )}
                        </div>`;

if (content.includes(inputTarget)) {
  content = content.replace(inputTarget, inputReplacement);
  console.log('UI component updated to dropdown.');
} else {
  console.log('UI input target NOT found.');
}

if (wasCRLF) {
  content = content.replace(/\n/g, '\r\n');
}

fs.writeFileSync(file, content, 'utf8');
console.log('Completed.');
