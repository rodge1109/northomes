const fs = require('fs');

// 1. Update App.jsx
const appFile = 'c:\\website\\northomes-system\\src\\App.jsx';
let appContent = fs.readFileSync(appFile, 'utf8');

let appWasCRLF = appContent.includes('\r\n');
if (appWasCRLF) appContent = appContent.replace(/\r\n/g, '\n');

const appTarget = `{activeTab === 'reservations' && <AdminOnlineReservationsTab reservations={reservations || []} stats={stats || {}} updateStatus={updateStatus} openWizard={handleOpenWizard} />}`;
const appReplacement = `{activeTab === 'reservations' && <AdminOnlineReservationsTab reservations={reservations || []} stats={stats || {}} updateStatus={updateStatus} openWizard={handleOpenWizard} roomTypes={adminRoomTypes} rateCodes={adminRateCodes} />}`;

if (appContent.includes(appTarget)) {
  appContent = appContent.replace(appTarget, appReplacement);
  console.log('App.jsx modified successfully.');
} else if (appContent.includes(appTarget.replace(/\r/g, ''))) {
  appContent = appContent.replace(appTarget.replace(/\r/g, ''), appReplacement);
  console.log('App.jsx modified successfully (normalized).');
} else {
  console.log('App.jsx modification target NOT found.');
}

if (appWasCRLF) appContent = appContent.replace(/\n/g, '\r\n');
fs.writeFileSync(appFile, appContent, 'utf8');


// 2. Update AdminOnlineReservationsTab.jsx
const tabFile = 'c:\\website\\northomes-system\\src\\AdminOnlineReservationsTab.jsx';
let tabContent = fs.readFileSync(tabFile, 'utf8');

let tabWasCRLF = tabContent.includes('\r\n');
if (tabWasCRLF) tabContent = tabContent.replace(/\r\n/g, '\n');

const signatureTarget = "export default function AdminOnlineReservationsTab({ reservations = [], stats = {}, updateStatus, openWizard }) {";
const signatureReplacement = "export default function AdminOnlineReservationsTab({ reservations = [], stats = {}, updateStatus, openWizard, roomTypes = [], rateCodes = [] }) {";

const totalTarget = "          total: `₱${(getNights(r.check_in_date || r.preferred_date, r.check_out_date || r.preferred_date) * 3500).toLocaleString('en-US', {minimumFractionDigits: 2})}`";

const totalReplacement = `          total: (() => {
            const nights = getNights(r.check_in_date || r.preferred_date, r.check_out_date || r.preferred_date);
            const getRoomRate = (roomTypeName, rateCodeCode) => {
              if (rateCodeCode) {
                const matchedRc = rateCodes.find(rc => rc.code === rateCodeCode);
                if (matchedRc && matchedRc.prices) {
                  const priceObj = matchedRc.prices.find(p => p.room_type_name === roomTypeName);
                  if (priceObj && priceObj.price_per_night) {
                    return parseFloat(priceObj.price_per_night);
                  }
                }
              }
              const matched = roomTypes.find(rt => rt.name === roomTypeName);
              if (matched) return parseFloat(matched.price_per_night);
              const type = (roomTypeName || '').toLowerCase();
              if (type.includes('presidential')) return 25000;
              if (type.includes('suite')) return 9000;
              if (type.includes('family')) return 6500;
              if (type.includes('deluxe')) return 4500;
              return 2500;
            };
            return \`₱\${(nights * getRoomRate(r.room_type || r.service_name || 'Standard Room', r.rate_code)).toLocaleString('en-US', {minimumFractionDigits: 2})}\`;
          })()`;

if (tabContent.includes(signatureTarget)) {
  tabContent = tabContent.replace(signatureTarget, signatureReplacement);
  console.log('AdminOnlineReservationsTab signature replaced.');
} else {
  console.log('AdminOnlineReservationsTab signature target NOT found.');
}

if (tabContent.includes(totalTarget)) {
  tabContent = tabContent.replace(totalTarget, totalReplacement);
  console.log('AdminOnlineReservationsTab total price calculation replaced.');
} else {
  console.log('AdminOnlineReservationsTab total price target NOT found.');
}

if (tabWasCRLF) tabContent = tabContent.replace(/\n/g, '\r\n');
fs.writeFileSync(tabFile, tabContent, 'utf8');
console.log('Completed all updates.');
