const fs = require('fs');
const file = 'c:\\website\\northomes-system\\src\\App.jsx';
let content = fs.readFileSync(file, 'utf8');

let wasCRLF = content.includes('\r\n');
if (wasCRLF) {
  content = content.replace(/\r\n/g, '\n');
}

// Helper code to inject
const parseFullNameCode = `// Robust Full Name Parser
const parseFullName = (fullNameStr) => {
  let last = '', first = '', mi = '—';
  if (!fullNameStr) return { last, first, mi };

  // Strip common salutations (e.g. Mr., Ms., Mrs., Dr., etc.) at the beginning or after comma
  let cleanName = fullNameStr.trim().replace(/\\b(mr|ms|mrs|dr|prof)\\.?\\s+/gi, '');

  if (cleanName.includes(',')) {
    const parts = cleanName.split(',');
    last = parts[0].trim();
    const firstParts = parts[1].trim().split(/\\s+/).filter(Boolean);
    if (firstParts.length > 0) {
      const lastPart = firstParts[firstParts.length - 1];
      if (lastPart.length === 1 || (lastPart.length === 2 && lastPart.endsWith('.'))) {
        first = firstParts.slice(0, -1).join(' ');
        mi = lastPart[0].toUpperCase() + '.';
      } else {
        first = firstParts.join(' ');
      }
    }
  } else {
    const parts = cleanName.split(/\\s+/).filter(Boolean);
    if (parts.length > 1) {
      last = parts[parts.length - 1];
      const remaining = parts.slice(0, -1);
      if (remaining.length === 1) {
        first = remaining[0];
      } else {
        const lastRemaining = remaining[remaining.length - 1];
        if (lastRemaining.length === 1 || (lastRemaining.length === 2 && lastRemaining.endsWith('.'))) {
          first = remaining.slice(0, -1).join(' ');
          mi = lastRemaining[0].toUpperCase() + '.';
        } else {
          first = remaining.join(' ');
        }
      }
    } else if (parts.length === 1) {
      first = parts[0];
    }
  }
  return { last, first, mi };
};`;

// 1. Inject helper right after API_BASE_URL
const apiBaseUrlTarget = `// Dynamically resolve backend API URL depending on current environment
const API_BASE_URL = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ? 'http://localhost:5000'
  : 'https://northomes.onrender.com';`;

if (content.includes(apiBaseUrlTarget)) {
  content = content.replace(apiBaseUrlTarget, `${apiBaseUrlTarget}\n\n${parseFullNameCode}`);
  console.log('parseFullName helper injected.');
} else {
  console.log('API_BASE_URL target NOT found.');
}

// 2. Replace name parsing block in printGuestDataSheet
const printDataSheetTarget = `    // Parse name parts
    let last = '', first = '', mi = '—';
    if (res.full_name) {
      if (res.full_name.includes(',')) {
        const parts = res.full_name.split(',');
        last = parts[0].trim();
        const firstParts = parts[1].trim().split(' ');
        first = firstParts[0];
        if (firstParts.length > 1) {
          mi = firstParts[firstParts.length - 1][0].toUpperCase() + '.';
        }
      } else {
        const parts = res.full_name.trim().split(' ');
        if (parts.length > 1) {
          last = parts[parts.length - 1];
          first = parts[0];
          if (parts.length > 2) {
            mi = parts[1][0].toUpperCase() + '.';
          }
        } else {
          first = parts[0];
        }
      }
    }`;

const printDataSheetReplacement = `    // Parse name parts using robust parser
    const parsedName = parseFullName(res.full_name);
    const { last, first, mi } = parsedName;`;

if (content.includes(printDataSheetTarget)) {
  content = content.replace(printDataSheetTarget, printDataSheetReplacement);
  console.log('printGuestDataSheet name parser replaced.');
} else {
  console.log('printGuestDataSheet parser target NOT found.');
}

// 3. Replace openGuestProfile parsing block
const openGuestProfileTarget = `  // ── Guest Profile helpers ──────────────────────────────────────────────────
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
      middle_name: r.middle_name || middleName,`;

const openGuestProfileReplacement = `  // ── Guest Profile helpers ──────────────────────────────────────────────────
  const openGuestProfile = (r) => {
    setGpRes(r);
    const parsed = parseFullName(r.full_name);
    setGpForm({
      title: r.title || '',
      last_name: parsed.last,
      first_name: parsed.first,
      middle_name: r.middle_name || (parsed.mi !== '—' ? parsed.mi.replace('.', '') : ''),`;

if (content.includes(openGuestProfileTarget)) {
  content = content.replace(openGuestProfileTarget, openGuestProfileReplacement);
  console.log('openGuestProfile name parser replaced.');
} else {
  console.log('openGuestProfile parser target NOT found.');
}

if (wasCRLF) {
  content = content.replace(/\n/g, '\r\n');
}

fs.writeFileSync(file, content, 'utf8');
console.log('Done.');
