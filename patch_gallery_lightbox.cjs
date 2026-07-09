const fs = require('fs');
const file = 'c:\\website\\northomes-system\\src\\App.jsx';
let content = fs.readFileSync(file, 'utf8');

let wasCRLF = content.includes('\r\n');
if (wasCRLF) {
  content = content.replace(/\r\n/g, '\n');
}

// 1. Declare lightboxIndex state in HomePage (line 6632)
const stateTarget = `function HomePage({ setCurrentPage }) {
  const [checkIn, setCheckIn] = useState(() => sessionStorage.getItem('northomes_checkin') || '');`;

const stateReplacement = `function HomePage({ setCurrentPage }) {
  const [checkIn, setCheckIn] = useState(() => sessionStorage.getItem('northomes_checkin') || '');
  const [lightboxIndex, setLightboxIndex] = useState(null);`;

if (content.includes(stateTarget)) {
  content = content.replace(stateTarget, stateReplacement);
  console.log('lightboxIndex state declared.');
} else {
  console.log('State target NOT found.');
}

// 2. Inject keyboard listener after galleryItems parsing
const effectTarget = `  try {
    const parsed = JSON.parse(hotelSettings.gallery_images || '[]');
    if (parsed.length > 0) {
      const aspects = ["aspect-[4/3]", "aspect-[3/4]", "aspect-square", "aspect-[4/5]", "aspect-[3/2]"];
      galleryItems = parsed.map((img, i) => ({
        src: img.startsWith('http') ? img : \`\${API_BASE_URL}\${img}\`,
        alt: \`Gallery Image \${i + 1}\`,
        aspect: aspects[i % aspects.length]
      }));
    }
  } catch(e) {}`;

const effectReplacement = `  try {
    const parsed = JSON.parse(hotelSettings.gallery_images || '[]');
    if (parsed.length > 0) {
      const aspects = ["aspect-[4/3]", "aspect-[3/4]", "aspect-square", "aspect-[4/5]", "aspect-[3/2]"];
      galleryItems = parsed.map((img, i) => ({
        src: img.startsWith('http') ? img : \`\${API_BASE_URL}\${img}\`,
        alt: \`Gallery Image \${i + 1}\`,
        aspect: aspects[i % aspects.length]
      }));
    }
  } catch(e) {}

  useEffect(() => {
    if (lightboxIndex === null) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setLightboxIndex(null);
      if (e.key === 'ArrowRight') setLightboxIndex(prev => (prev + 1) % galleryItems.length);
      if (e.key === 'ArrowLeft') setLightboxIndex(prev => (prev - 1 + galleryItems.length) % galleryItems.length);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex, galleryItems]);`;

if (content.includes(effectTarget)) {
  content = content.replace(effectTarget, effectReplacement);
  console.log('Keyboard listener useEffect injected.');
} else {
  console.log('Effect target NOT found.');
}

// 3. Replace masonry gallery section with a 4-column grid (line 6831)
const galleryGridTarget = `        <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
          {galleryItems.map((img, i) => (
            <div key={i} className="break-inside-avoid relative group overflow-hidden rounded-2xl cursor-pointer bg-white border border-black/5 shadow-sm">
              <div className={\`w-full \${img.aspect} flex items-center justify-center bg-black/5\`}>
                <img
                  src={img.src}
                  alt={img.alt}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.parentElement.innerHTML = \`<div class="flex flex-col items-center justify-center h-full w-full p-4 text-center"><svg class="w-8 h-8 text-black/20 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg><span class="text-black/40 text-[10px] font-bold uppercase tracking-widest leading-relaxed">Save photo as:<br/>\\\${img.src.split('/').pop()}</span></div>\`;
                  }}
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-[#1E3932]/90 via-[#1E3932]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                <h3 className="text-white font-bold text-lg tracking-tight">{img.alt}</h3>
              </div>
            </div>
          ))}
        </div>`;

const galleryGridReplacement = `        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {galleryItems.map((img, i) => (
            <div key={i} onClick={() => setLightboxIndex(i)} className="relative aspect-square group overflow-hidden rounded-2xl cursor-pointer bg-white border border-black/5 shadow-sm hover:shadow-md transition-all duration-300">
              <div className="w-full h-full flex items-center justify-center bg-black/5">
                <img
                  src={img.src}
                  alt={img.alt}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.parentElement.innerHTML = \`<div class="flex flex-col items-center justify-center h-full w-full p-4 text-center"><svg class="w-8 h-8 text-black/20 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg><span class="text-black/40 text-[10px] font-bold uppercase tracking-widest leading-relaxed">Save photo as:<br/>\\\${img.src.split('/').pop()}</span></div>\`;
                  }}
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-[#1E3932]/80 via-[#1E3932]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-5">
                <h3 className="text-white font-bold text-sm tracking-tight">{img.alt}</h3>
              </div>
            </div>
          ))}
        </div>`;

if (content.includes(galleryGridTarget)) {
  content = content.replace(galleryGridTarget, galleryGridReplacement);
  console.log('Gallery masonry grid updated to 4-column layout.');
} else {
  console.log('Gallery masonry grid target NOT found.');
}

// 4. Inject Lightbox HTML block just before end of HomePage
const homePageEndTarget = `      </footer>
    </div>
  );
}

// Menu Page`;

const homePageEndReplacement = `      </footer>

      {/* Lightbox Modal */}
      {lightboxIndex !== null && (
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 backdrop-blur-sm transition-all duration-300 animate-fadeIn"
          onClick={() => setLightboxIndex(null)}
        >
          {/* Close button */}
          <button 
            className="absolute top-6 right-6 text-white/70 hover:text-white text-3xl font-light p-2 transition-colors cursor-pointer"
            onClick={(e) => { e.stopPropagation(); setLightboxIndex(null); }}
          >
            <X className="w-8 h-8" />
          </button>

          {/* Left Arrow */}
          <button 
            className="absolute left-6 text-white/50 hover:text-white p-3 rounded-full hover:bg-white/10 transition-all cursor-pointer hidden md:flex items-center justify-center"
            onClick={(e) => { e.stopPropagation(); setLightboxIndex((lightboxIndex - 1 + galleryItems.length) % galleryItems.length); }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
          </button>

          {/* Image Container */}
          <div 
            className="relative max-h-[85vh] max-w-[85vw] flex flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img 
              src={galleryItems[lightboxIndex].src} 
              alt={galleryItems[lightboxIndex].alt} 
              className="max-h-[80vh] max-w-[80vw] object-contain rounded-lg shadow-2xl border border-white/10 select-none"
            />
            {galleryItems[lightboxIndex].alt && (
              <span className="text-white/80 text-sm mt-4 font-semibold tracking-wide bg-black/40 px-4 py-1.5 rounded-full border border-white/5">
                {galleryItems[lightboxIndex].alt}
              </span>
            )}
          </div>

          {/* Right Arrow */}
          <button 
            className="absolute right-6 text-white/50 hover:text-white p-3 rounded-full hover:bg-white/10 transition-all cursor-pointer hidden md:flex items-center justify-center"
            onClick={(e) => { e.stopPropagation(); setLightboxIndex((lightboxIndex + 1) % galleryItems.length); }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
          </button>

          {/* Mobile controls */}
          <div className="absolute bottom-6 flex gap-4 md:hidden">
            <button 
              className="text-white/70 bg-white/10 px-4 py-2 rounded-full text-xs font-bold"
              onClick={(e) => { e.stopPropagation(); setLightboxIndex((lightboxIndex - 1 + galleryItems.length) % galleryItems.length); }}
            >
              Prev
            </button>
            <button 
              className="text-white/70 bg-white/10 px-4 py-2 rounded-full text-xs font-bold"
              onClick={(e) => { e.stopPropagation(); setLightboxIndex((lightboxIndex + 1) % galleryItems.length); }}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Menu Page`;

if (content.includes(homePageEndTarget)) {
  content = content.replace(homePageEndTarget, homePageEndReplacement);
  console.log('Lightbox modal markup injected.');
} else {
  console.log('HomePage end target NOT found.');
}

if (wasCRLF) {
  content = content.replace(/\n/g, '\r\n');
}

fs.writeFileSync(file, content, 'utf8');
console.log('Completed.');
