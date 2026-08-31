const fs = require('fs');
let c = fs.readFileSync('src/App.jsx', 'utf8');

const regex = /\{rooms\.filter\(r => r\.room_type === sel\.roomType && r\.computed_status !== 'occupied' && r\.computed_status !== 'arriving' && r\.computed_status !== 'out_of_order' && !wkRoomSelections\.some\(\(s, sIdx\) => sIdx !== idx && s\.roomNumber === r\.room_number\)\)\.map\(r => \(\s*<option key=\{r\.room_number\} value=\{r\.room_number\}>\{r\.room_number\}<\/option>\s*\)\)\}/;

const replacement = `{(() => {
                                        const rt = wkRoomTypes.find(r => r.name === sel.roomType);
                                        if (rt && rt.availableRooms) {
                                          return rt.availableRooms.filter(rn => !wkRoomSelections.some((s, sIdx) => sIdx !== idx && s.roomNumber === rn)).map(rn => (
                                            <option key={rn} value={rn}>{rn}</option>
                                          ));
                                        }
                                        return rooms.filter(r => r.room_type === sel.roomType && r.computed_status !== 'occupied' && r.computed_status !== 'arriving' && r.computed_status !== 'out_of_order' && !wkRoomSelections.some((s, sIdx) => sIdx !== idx && s.roomNumber === r.room_number)).map(r => (
                                          <option key={r.room_number} value={r.room_number}>{r.room_number}</option>
                                        ));
                                      })()}`;

if(regex.test(c)) {
    c = c.replace(regex, replacement);
    fs.writeFileSync('src/App.jsx', c);
    console.log("App.jsx Patched successfully!");
} else {
    console.log("Regex not found in App.jsx!");
}
