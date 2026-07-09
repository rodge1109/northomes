const fs = require('fs');
const file = 'c:\\website\\northomes-system\\src\\App.jsx';
let content = fs.readFileSync(file, 'utf8');

const regex1 = /  let heroImage = "\/assets\/images\/hero\/hero1\.jpg";\s*try \{\s*const parsed = JSON\.parse\(hotelSettings\.hero_images \|\| '\[\]'\);\s*if \(parsed\.length > 0\) heroImage = parsed\[0\];\s*\} catch\(e\) \{\}/g;

const repl1 = `  const [currentHeroImg, setCurrentHeroImg] = useState(0);

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

const regex2 = /<img\s*src=\{heroImage\.startsWith\('http'\) \? heroImage : `\$\{API_BASE_URL\}\$\{heroImage\}`\}\s*alt="Northomes Pensionne"\s*className="w-full h-full object-cover"\s*\/>/g;

const repl2 = `{heroImages.map((img, idx) => (
          <img
            key={idx}
            src={img}
            alt="Northomes Pensionne"
            className={\`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 \${idx === currentHeroImg ? 'opacity-100 z-10' : 'opacity-0 z-0'}\`}
          />
        ))}`;

content = content.replace(regex1, repl1);
content = content.replace(regex2, repl2);

fs.writeFileSync(file, content, 'utf8');
console.log("Carousel patch applied.");
