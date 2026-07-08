const fs = require('fs');
const file = 'c:\\website\\northomes-system\\src\\App.jsx';
let content = fs.readFileSync(file, 'utf8');

const hookOriginal = `  useEffect(() => {
    fetch(\`\${API_BASE_URL}/api/room-types\`)
      .then(r => r.json())
      .then(data => { if (data.success) setRoomTypes(data.roomTypes); })
      .catch(() => { });
  }, []);`;

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

const heroImgOriginal = `        <img
          src="/assets/images/hero/hero1.jpg"
          alt="Northomes Pensionne"
          className="w-full h-full object-cover"
        />`;

const heroImgReplacement = `        <img
          src={heroImage.startsWith('http') ? heroImage : \`\${API_BASE_URL}\${heroImage}\`}
          alt="Northomes Pensionne"
          className="w-full h-full object-cover"
        />`;

const galleryMapOriginal = `        <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
          {[
            { src: "/assets/images/gallery/exterior.jpg", alt: "Northomes Exterior", aspect: "aspect-[4/3]" },
            { src: "/assets/images/gallery/lobby.jpg", alt: "Lobby Reception", aspect: "aspect-[3/4]" },
            { src: "/assets/images/gallery/cafe.jpg", alt: "Cafe and Dining", aspect: "aspect-square" },
            { src: "/assets/images/gallery/room_standard.jpg", alt: "Standard Room", aspect: "aspect-[4/5]" },
            { src: "/assets/images/gallery/bathroom.jpg", alt: "Clean Amenities", aspect: "aspect-[3/2]" },
            { src: "/assets/images/gallery/parking.jpg", alt: "Secure Parking", aspect: "aspect-[4/3]" },
          ].map((img, i) => (
            <div key={i} className="break-inside-avoid relative group overflow-hidden rounded-2xl cursor-pointer bg-white border border-black/5 shadow-sm">`;

const galleryMapReplacement = `        <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
          {galleryItems.map((img, i) => (
            <div key={i} className="break-inside-avoid relative group overflow-hidden rounded-2xl cursor-pointer bg-white border border-black/5 shadow-sm">`;

// Normalizing line endings for safe replacement
content = content.replace(hookOriginal.replace(/\r/g, ''), hookReplacement);
content = content.replace(hookOriginal, hookReplacement);

content = content.replace(heroImgOriginal.replace(/\r/g, ''), heroImgReplacement);
content = content.replace(heroImgOriginal, heroImgReplacement);

content = content.replace(galleryMapOriginal.replace(/\r/g, ''), galleryMapReplacement);
content = content.replace(galleryMapOriginal, galleryMapReplacement);

fs.writeFileSync(file, content, 'utf8');
console.log('Successfully patched HomePage gallery and hero images!');
