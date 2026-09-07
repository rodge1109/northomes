const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'App.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// Find HomePage function start
const homePageFnIdx = content.indexOf('function HomePage({ setCurrentPage }) {');
if (homePageFnIdx === -1) {
  console.error('ERROR: Cannot find HomePage function');
  process.exit(1);
}
console.log('Found HomePage at char', homePageFnIdx);

// Check if showPolicyModal state is already inside HomePage (between homePageFnIdx and heroImages line)
const heroImagesMarker = 'const [heroImages, setHeroImages] = useState(["/assets/images/hero/hero1.jpg"]);';
const heroImagesIdx = content.indexOf(heroImagesMarker, homePageFnIdx);
if (heroImagesIdx === -1) {
  console.error('ERROR: Cannot find heroImages inside HomePage');
  process.exit(1);
}
console.log('Found heroImages at char', heroImagesIdx);

// Check if state already added in HomePage scope
const homePageSection = content.slice(homePageFnIdx, heroImagesIdx + heroImagesMarker.length + 200);
if (homePageSection.includes('showPolicyModal')) {
  console.log('showPolicyModal already declared inside HomePage. Nothing to do for step 1.');
} else {
  // Insert after heroImages line
  const insertPos = heroImagesIdx + heroImagesMarker.length;
  // Figure out line ending
  const nextChar = content[insertPos];
  const nextTwo = content.slice(insertPos, insertPos + 2);
  const lineEnd = nextTwo === '\r\n' ? '\r\n' : '\n';
  const newState = lineEnd + '  const [showPolicyModal, setShowPolicyModal] = useState(false);';
  content = content.slice(0, insertPos) + newState + content.slice(insertPos);
  console.log('Step 1: Added showPolicyModal state inside HomePage at char', insertPos);
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('Done. File written.');
