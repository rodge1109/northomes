const fs = require('fs');
const file = 'c:\\website\\northomes-system\\src\\App.jsx';
let content = fs.readFileSync(file, 'utf8');

const target1 = `  let heroImage = "/assets/images/hero/hero1.jpg";
  try {
    const parsed = JSON.parse(hotelSettings.hero_images || '[]');
    if (parsed.length > 0) heroImage = parsed[0];
  } catch(e) {}`;

const replacement1 = `  const [currentHeroImg, setCurrentHeroImg] = useState(0);

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

const target2 = `      <div className="w-full h-[60vh] md:h-[70vh] relative">
        <img
          src={heroImage.startsWith('http') ? heroImage : \`\${API_BASE_URL}\${heroImage}\`}
          alt="Northomes Pensionne"
          className="w-full h-full object-cover"
        />`;

const replacement2 = `      <div className="w-full h-[60vh] md:h-[70vh] relative overflow-hidden bg-[#1E3932]">
        {heroImages.map((img, idx) => (
          <img
            key={idx}
            src={img}
            alt="Northomes Pensionne"
            className={\`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 \${idx === currentHeroImg ? 'opacity-100 z-10' : 'opacity-0 z-0'}\`}
          />
        ))}`;

content = content.replace(target1.replace(/\r/g, ''), replacement1);
content = content.replace(target1, replacement1);

content = content.replace(target2.replace(/\r/g, ''), replacement2);
content = content.replace(target2, replacement2);

fs.writeFileSync(file, content, 'utf8');
console.log('Successfully added hero carousel logic!');
