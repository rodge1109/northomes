const fs = require('fs');
const file = 'c:\\website\\northomes-system\\src\\App.jsx';
let content = fs.readFileSync(file, 'utf8');

const targetHookRegex = /  useEffect\(\(\) => \{\s*fetch\(`\$\{API_BASE_URL\}\/api\/room-types`\)\s*\.then\(r => r\.json\(\)\)\s*\.then\(data => \{ if \(data\.success\) setRoomTypes\(data\.roomTypes\); \}\)\s*\.catch\(\(\) => \{ \}\);\s*\}, \[\]\);/g;

const hookReplacement = `  const [hotelSettings, setHotelSettings] = useState({});
  useEffect(() => {
    fetch(\`\${API_BASE_URL}/api/room-types\`)
      .then(r => r.json())
      .then(data => { if (data.success) setRoomTypes(data.roomTypes); })
      .catch(() => { });

    fetch(\`\${API_BASE_URL}/api/hotel-settings\`)
      .then(r => r.json())
      .then(data => { if (data.success && data.settings) setHotelSettings(data.settings); })
      .catch(() => { });
  }, []);

  let heroImage = "/assets/images/hero/hero1.jpg";
  try {
    const parsed = JSON.parse(hotelSettings.hero_images || '[]');
    if (parsed.length > 0) heroImage = parsed[0];
  } catch(e) {}

  let galleryItems = [
    { src: "/assets/images/gallery/exterior.jpg", alt: "Northomes Exterior", aspect: "aspect-[4/3]" },
    { src: "/assets/images/gallery/lobby.jpg", alt: "Lobby Reception", aspect: "aspect-[3/4]" },
    { src: "/assets/images/gallery/cafe.jpg", alt: "Cafe and Dining", aspect: "aspect-square" },
    { src: "/assets/images/gallery/room_standard.jpg", alt: "Standard Room", aspect: "aspect-[4/5]" },
    { src: "/assets/images/gallery/bathroom.jpg", alt: "Clean Amenities", aspect: "aspect-[3/2]" },
    { src: "/assets/images/gallery/parking.jpg", alt: "Secure Parking", aspect: "aspect-[4/3]" },
  ];
  try {
    const parsed = JSON.parse(hotelSettings.gallery_images || '[]');
    if (parsed.length > 0) {
      const aspects = ["aspect-[4/3]", "aspect-[3/4]", "aspect-square", "aspect-[4/5]", "aspect-[3/2]"];
      galleryItems = parsed.map((img, i) => ({
        src: img.startsWith('http') ? img : \`\${API_BASE_URL}\${img}\`,
        alt: \`Gallery Image \${i+1}\`,
        aspect: aspects[i % aspects.length]
      }));
    }
  } catch(e) {}`;

content = content.replace(targetHookRegex, hookReplacement);

const targetHeroRegex = /src="\/assets\/images\/hero\/hero1\.jpg"/g;
content = content.replace(targetHeroRegex, `src={heroImage.startsWith('http') ? heroImage : \`\${API_BASE_URL}\${heroImage}\`}`);

const targetGalleryRegex = /\[\s*\{\s*src:\s*\"\/assets\/images\/gallery\/exterior\.jpg\".*?\]\.map/gs;
content = content.replace(targetGalleryRegex, "galleryItems.map");

fs.writeFileSync(file, content, 'utf8');
console.log('Regex patch successful!');
