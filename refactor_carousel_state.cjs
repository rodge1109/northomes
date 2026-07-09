const fs = require('fs');
const file = 'c:\\website\\northomes-system\\src\\App.jsx';
let content = fs.readFileSync(file, 'utf8');

const targetHook = `  const [hotelSettings, setHotelSettings] = useState({});

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

  const [currentHeroImg, setCurrentHeroImg] = useState(0);

  let heroImages = ["/assets/images/hero/hero1.jpg"];
  try {
    const parsed = JSON.parse(hotelSettings.hero_images || '[]');
    if (parsed.length > 0) {
      heroImages = parsed.map(img => img.startsWith('http') ? img : \`\${API_BASE_URL}\${img}\`);
    }
  } catch(e) {}

  useEffect(() => {
    if (heroImages.length > 1) {
      const interval = setInterval(() => {
        setCurrentHeroImg(prev => (prev + 1) % heroImages.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [heroImages.length]);`;

const replacementHook = `  const [hotelSettings, setHotelSettings] = useState({});
  const [currentHeroImg, setCurrentHeroImg] = useState(0);
  const [heroImages, setHeroImages] = useState(["/assets/images/hero/hero1.jpg"]);

  useEffect(() => {
    fetch(\`\${API_BASE_URL}/api/room-types\`)
      .then(r => r.json())
      .then(data => { if (data.success) setRoomTypes(data.roomTypes); })
      .catch(() => { });

    fetch(\`\${API_BASE_URL}/api/hotel-settings\`)
      .then(r => r.json())
      .then(data => { 
        if (data.success && data.settings) {
          setHotelSettings(data.settings);
          try {
            const parsed = JSON.parse(data.settings.hero_images || '[]');
            if (parsed.length > 0) {
              const mapped = parsed.map(img => img.startsWith('http') ? img : \`\${API_BASE_URL}\${img}\`);
              setHeroImages(mapped);
            }
          } catch(e) {}
        }
      })
      .catch(() => { });
  }, []);

  useEffect(() => {
    if (heroImages.length > 1) {
      const interval = setInterval(() => {
        setCurrentHeroImg(prev => (prev + 1) % heroImages.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [heroImages]);`;

// Normalize content replacements
content = content.replace(targetHook.replace(/\r/g, ''), replacementHook);
content = content.replace(targetHook, replacementHook);

fs.writeFileSync(file, content, 'utf8');
console.log('Successfully refactored Carousel to use React state!');
