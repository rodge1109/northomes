const fs = require('fs');
const file = 'c:\\website\\northomes-system\\src\\App.jsx';
let content = fs.readFileSync(file, 'utf8');

// We want to replace the whole block starting from const [hotelSettings, setHotelSettings] = useState({});
// all the way down to }, [heroImages.length]);

const regex = /const \[hotelSettings, setHotelSettings\] = useState\(\{\}\);\s*useEffect\(\(\) => \{.*?\}, \[heroImages\.length\]\);/gs;

const replacement = `const [hotelSettings, setHotelSettings] = useState({});
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

if (regex.test(content)) {
  content = content.replace(regex, replacement);
  fs.writeFileSync(file, content, 'utf8');
  console.log('REPLACEMENT SUCCESSFUL!');
} else {
  console.log('REGEX DID NOT MATCH!');
}
