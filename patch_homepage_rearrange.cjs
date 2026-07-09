const fs = require('fs');

// ─── PART 1: index.html ──────────────────────────────────────────────────────
const htmlFile = 'c:\\website\\northomes-system\\index.html';
let htmlContent = fs.readFileSync(htmlFile, 'utf8');
const htmlTarget = `<link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">`;
const htmlReplacement = `<link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@300;400;500;600;700;800;900&family=Dancing+Script:wght@700&family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet">`;

if (htmlContent.includes(htmlTarget)) {
  htmlContent = htmlContent.replace(htmlTarget, htmlReplacement);
  fs.writeFileSync(htmlFile, htmlContent, 'utf8');
  console.log('index.html: Google Fonts updated.');
} else {
  console.log('index.html: Google Fonts target NOT found.');
}


// ─── PART 2: src/App.jsx ──────────────────────────────────────────────────────
const appFile = 'c:\\website\\northomes-system\\src\\App.jsx';
let appContent = fs.readFileSync(appFile, 'utf8');

let wasAppCRLF = appContent.includes('\r\n');
if (wasAppCRLF) appContent = appContent.replace(/\r\n/g, '\n');

// 1. Replace Top Pre-header Bar & Header Layout
const headerTarget = `      {/* Top Pre-header Bar */}
      <div className="sticky top-0 z-[60] h-[50px] w-full bg-[#1E3932] flex items-center justify-between px-3 md:px-8 overflow-hidden">
        <div className="flex items-center gap-2 sm:gap-6 w-full">
          <a href="mailto:info@northomespensione.com" className="text-white/90 text-[12px] sm:text-[15px] font-semibold tracking-wide hover:text-white transition-colors flex items-center gap-1 sm:gap-2 whitespace-nowrap">
            <svg className="w-3.5 h-3.5 flex-shrink-0 hidden sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
            <span>info@northomespensione.com</span>
          </a>
          <a href="tel:+639171323715" className="text-white/90 text-[12px] sm:text-[15px] font-semibold tracking-wide hover:text-white transition-colors flex items-center gap-1 sm:gap-2 whitespace-nowrap">
            <svg className="w-3.5 h-3.5 flex-shrink-0 hidden sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
            +63 917 132 3715
          </a>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); setIsMobileMenuOpen(!isMobileMenuOpen); }}
          className="lg:hidden text-white/90 hover:text-white p-1 ml-2 flex-shrink-0 z-50"
        >
          {isMobileMenuOpen ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
          )}
        </button>
      </div>

      <header className="relative z-50 border-b border-black/5" style={{ background: '#ffffff', backdropFilter: 'blur(32px)', WebkitBackdropFilter: 'blur(32px)' }}>
        <div className="relative">
          <div className="w-full px-8 py-4 relative z-10">
            <div className="flex flex-col items-center justify-center gap-3">
            <div className="flex flex-col items-center justify-center cursor-pointer group text-center" onClick={() => setCurrentPage('home')}>
              <img
                src="/assets/images/hero/logo.jpg"
                alt="Northomes Pensionne Logo"
                className="h-[178px] w-auto object-contain rounded-lg"
              />
            </div>

            <nav className="hidden lg:flex items-center justify-center space-x-2">
              {[
                { name: 'Home', id: 'home' },
                { name: 'About Us', id: 'about' },
                { name: 'Accommodations', id: 'accommodations', hasSubmenu: true },
                { name: 'Dining', id: 'menu' },
                { name: 'Gallery', id: 'gallery' },
                { name: 'Monthly Promo', id: 'promo' },
              ].map((item) => (
                <div key={item.id} className="relative group">
                  <button
                    onClick={() => {
                      if (item.id === 'gallery') {
                        setCurrentPage('home');
                        setTimeout(() => {
                          const el = document.getElementById('gallery');
                          if (el) {
                            const offset = 80;
                            const top = el.getBoundingClientRect().top + window.scrollY - offset;
                            window.scrollTo({ top, behavior: 'smooth' });
                          }
                        }, 100);
                      } else {
                        if (item.id === 'accommodations') setAccommodationFilter(null);
                        setCurrentPage(item.id);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }
                    }}
                    className={\`font-bold transition-all py-2 px-3 text-xs uppercase tracking-widest flex items-center gap-1 \${currentPage === item.id || (currentPage === 'home' && item.id === 'gallery') ? 'text-[#00754A]' : 'text-black/60 hover:text-[#000000]/87'}\`}
                  >
                    {item.name}
                    {item.hasSubmenu && (
                      <svg className="w-3 h-3 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    )}
                  </button>

                  {item.hasSubmenu && roomTypes.length > 0 && (
                    <div className="absolute left-1/2 -translate-x-1/2 top-full pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 w-48">
                      <div className="bg-white rounded-xl shadow-lg border border-black/5 overflow-hidden py-1">
                        {roomTypes.map(rt => (
                          <button
                            key={rt.id}
                            onClick={() => {
                              setAccommodationFilter(rt.name);
                              setCurrentPage('accommodations');
                            }}
                            className="w-full text-left px-4 py-2.5 text-[11px] font-bold text-black/60 hover:text-[#00754A] hover:bg-[#f2f0eb] transition-colors uppercase tracking-widest"
                          >
                            {rt.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
              <button
                onClick={() => { setCurrentPage('contact'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className={\`font-bold transition-all py-2 px-3 text-xs uppercase tracking-widest rounded-lg shadow-sm \${currentPage === 'contact' ? 'bg-[#00754A] text-white border border-transparent' : 'text-black/60 hover:text-[#000000]/87 border border-black/5 bg-white'}\`}
              >
                Contact
              </button>
            </nav>
          </div>
        </div>`;

const headerReplacement = `      {/* Top Pre-header Bar */}
      <div className="sticky top-0 z-[60] h-[50px] w-full bg-[#1E3932] flex items-center justify-between px-4 md:px-8 overflow-hidden">
        <div className="flex items-center gap-2 sm:gap-6">
          <a href="mailto:info@northomespensione.com" className="text-white/95 text-[11px] sm:text-xs font-semibold tracking-wide hover:text-white transition-colors flex items-center gap-1.5 whitespace-nowrap">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
            <span>info@northomespensione.com</span>
          </a>
          <a href="tel:+639171323715" className="text-white/95 text-[11px] sm:text-xs font-semibold tracking-wide hover:text-white transition-colors flex items-center gap-1.5 whitespace-nowrap">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
            <span>+63 917 132 3715</span>
          </a>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-3">
            <a href="https://facebook.com" target="_blank" rel="noreferrer" className="text-white/80 hover:text-white transition-colors">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z"/></svg>
            </a>
            <a href="https://instagram.com" target="_blank" rel="noreferrer" className="text-white/80 hover:text-white transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
            </a>
          </div>
          <div className="text-white/95 text-[11px] sm:text-xs font-semibold tracking-wide flex items-center gap-1.5 border-l border-white/20 pl-4 whitespace-nowrap">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
            <span>Bogo City, Cebu</span>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); setIsMobileMenuOpen(!isMobileMenuOpen); }}
            className="lg:hidden text-white/90 hover:text-white p-1 ml-2"
          >
            {isMobileMenuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
            )}
          </button>
        </div>
      </div>

      <header className="relative z-50 border-b border-black/5" style={{ background: '#ffffff', backdropFilter: 'blur(32px)', WebkitBackdropFilter: 'blur(32px)' }}>
        <div className="relative max-w-7xl mx-auto px-6 py-2.5">
          <div className="flex items-center justify-between gap-4">
            {/* Logo Left */}
            <div className="flex items-center cursor-pointer" onClick={() => setCurrentPage('home')}>
              <img
                src="/assets/images/hero/logo.jpg"
                alt="Northomes Pensionne Logo"
                className="h-[65px] sm:h-[80px] w-auto object-contain"
              />
            </div>

            {/* Navigation Center */}
            <nav className="hidden lg:flex items-center space-x-1">
              {[
                { name: 'Home', id: 'home' },
                { name: 'About Us', id: 'about' },
                { name: 'Accommodations', id: 'accommodations', hasSubmenu: true },
                { name: 'Dining', id: 'menu' },
                { name: 'Gallery', id: 'gallery' },
                { name: 'Monthly Promo', id: 'promo' },
                { name: 'Contact', id: 'contact' },
              ].map((item) => (
                <div key={item.id} className="relative group">
                  <button
                    onClick={() => {
                      if (item.id === 'gallery') {
                        setCurrentPage('home');
                        setTimeout(() => {
                          const el = document.getElementById('gallery');
                          if (el) {
                            const offset = 80;
                            const top = el.getBoundingClientRect().top + window.scrollY - offset;
                            window.scrollTo({ top, behavior: 'smooth' });
                          }
                        }, 100);
                      } else {
                        if (item.id === 'accommodations') setAccommodationFilter(null);
                        setCurrentPage(item.id);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }
                    }}
                    className={\`relative font-bold transition-all py-2 px-3 text-xs uppercase tracking-widest flex items-center gap-1 \${
                      currentPage === item.id || (currentPage === 'home' && item.id === 'gallery') 
                        ? 'text-[#00754A] after:absolute after:bottom-0 after:left-3 after:right-3 after:h-[2px] after:bg-[#00754A]' 
                        : 'text-black/60 hover:text-[#000000]/87'
                    }\`}
                  >
                    {item.name}
                    {item.hasSubmenu && (
                      <svg className="w-3 h-3 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    )}
                  </button>

                  {item.hasSubmenu && roomTypes.length > 0 && (
                    <div className="absolute left-1/2 -translate-x-1/2 top-full pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 w-48">
                      <div className="bg-white rounded-xl shadow-lg border border-black/5 overflow-hidden py-1">
                        {roomTypes.map(rt => (
                          <button
                            key={rt.id}
                            onClick={() => {
                              setAccommodationFilter(rt.name);
                              setCurrentPage('accommodations');
                            }}
                            className="w-full text-left px-4 py-2.5 text-[11px] font-bold text-black/60 hover:text-[#00754A] hover:bg-[#f2f0eb] transition-colors uppercase tracking-widest"
                          >
                            {rt.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </nav>

            {/* Book Now Button Right */}
            <div className="hidden lg:block">
              <button
                onClick={() => { setCurrentPage('accommodations'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#1E3932] hover:opacity-90 text-white font-bold text-xs uppercase tracking-widest rounded-lg transition-all shadow-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                Book Now
              </button>
            </div>
          </div>
        </div>`;

if (appContent.includes(headerTarget)) {
  appContent = appContent.replace(headerTarget, headerReplacement);
  console.log('App: Header layout updated successfully.');
} else {
  console.log('App: Header target NOT found.');
}


// 2. Replace Hero Slideshow, Booking Widget, and Welcome Statement inside HomePage component
const homeHeroTarget = `      {/* Hero Image Container */}
      <div className="w-full h-[60vh] md:h-[70vh] relative">
        {heroImages.map((img, idx) => (
          <img
            key={idx}
            src={img}
            alt="Northomes Pensionne"
            className={\`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 \${idx === currentHeroImg ? 'opacity-100' : 'opacity-0 pointer-events-none'}\`}
          />
        ))}
        {/* Beautiful Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#006241]/40 via-[#1E3932]/10 to-[#CBA258]/30 mix-blend-multiply"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#f2f0eb] via-transparent to-transparent opacity-80"></div>
      </div>

      {/* Horizontal Booking Bar - Overlapping the Hero */}
      <div className="relative -mt-10 z-20 px-4">
        <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-xl border border-black/5 p-4 flex flex-col md:flex-row items-center gap-4">
          <div className="flex-1 w-full px-4 md:px-6 py-2 border-b md:border-b-0 md:border-r border-black/5 flex flex-col">
            <span className="text-[10px] font-black text-black/40 uppercase tracking-widest block mb-1">Check In</span>
            <input
              type="date"
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              className="w-full text-sm font-bold text-[#006241] focus:outline-none bg-transparent"
            />
          </div>
          <div className="flex-1 w-full px-4 md:px-6 py-2 border-b md:border-b-0 md:border-r border-black/5 flex flex-col">
            <span className="text-[10px] font-black text-black/40 uppercase tracking-widest block mb-1">Check Out</span>
            <input
              type="date"
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              className="w-full text-sm font-bold text-[#006241] focus:outline-none bg-transparent"
            />
          </div>
          <div className="flex-1 w-full px-4 md:px-6 py-2 border-b md:border-b-0 border-black/5 flex flex-col">
            <span className="text-[10px] font-black text-black/40 uppercase tracking-widest block mb-1">Guests</span>
            <select className="w-full text-sm font-bold text-[#006241] focus:outline-none bg-transparent">
              <option>1 Guest</option>
              <option>2 Guests</option>
              <option>3 Guests</option>
              <option>4+ Guests</option>
            </select>
          </div>
          <div className="w-full md:w-auto mt-2 md:mt-0 pl-2">
            <button
              onClick={handleBookingSearch}
              className="w-full md:w-auto px-8 py-4 bg-[#A98C51] hover:bg-[#8e7644] text-white rounded-full font-bold text-xs uppercase tracking-[0.15em] transition-all whitespace-nowrap shadow-md hover:shadow-lg"
            >
              Check Availability
            </button>
          </div>
        </div>
      </div>

      {/* Welcome Statement */}
      <div className="py-24 px-4 text-center max-w-3xl mx-auto">
        <h4 className="text-[#CBA258] text-[10px] font-black uppercase tracking-[0.2em] mb-4">Welcome to Northomes</h4>
        <h2 className="text-4xl md:text-5xl font-bold text-[#006241] tracking-tight mb-8">A Sanctuary of Comfort and Style</h2>
        <p className="text-black/60 text-lg leading-relaxed mb-10">
          Welcome to Northomes Pensione — an affordable and comfortable stay in Bogo City, Cebu. We offer clean rooms with Wi-Fi, secure parking, and meals available. Perfect for business travelers, families & balikbayans.
        </p>
        <button
          onClick={() => setCurrentPage(\'about\')}
          className="border border-[#006241] text-[#006241] hover:bg-[#006241] hover:text-white px-8 py-3 rounded-full font-black text-[10px] uppercase tracking-widest transition-colors"
        >
          Our Story
        </button>
      </div>`;

const homeHeroReplacement = `      {/* Unified Side-by-Side Hero Section */}
      <div className="w-full relative bg-[#FAF8F5] overflow-hidden border-b border-black/5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row relative min-h-[550px] md:min-h-[620px] z-10">
          
          {/* Left Column: Brand & Trust Details */}
          <div className="w-full md:w-1/2 flex flex-col justify-center px-6 py-12 md:py-20 md:pl-8 md:pr-4 z-20 space-y-5 text-left">
            <div>
              <span className="font-['Dancing_Script'] text-2.5xl md:text-3xl text-[#00754A] font-bold block mb-1">Your Home in</span>
              <h1 className="font-['Playfair_Display'] text-4xl md:text-5xl lg:text-6xl font-black text-[#1E3932] leading-tight">Northern Cebu</h1>
              
              {/* Cursive divider */}
              <div className="flex items-center gap-2 mt-3 mb-1">
                <div className="h-[1.5px] w-12 bg-[#1E3932]/15"></div>
                <div className="w-1.5 h-1.5 rotate-45 border border-[#1E3932]/40 bg-[#FAF8F5]"></div>
                <div className="h-[1.5px] w-12 bg-[#1E3932]/15"></div>
              </div>
            </div>

            <p className="text-black/70 text-sm md:text-base leading-relaxed font-medium max-w-lg">
              Whether you&apos;re here for business, family visits, or island adventures, Northomes Pensione offers clean, spacious accommodations with warm Filipino hospitality.
            </p>

            {/* Icons list */}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-3.5 pt-2 text-[10px] font-extrabold uppercase tracking-widest text-[#1E3932]/80">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-[#00754A]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-3.08-3.079a9 9 0 016.16 0M6.105 12.58a13.5 13.5 0 0111.79 0"></path></svg>
                <span>Free Wi-Fi</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-[#00754A]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.17a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 9.172V5L8 4z"></path></svg>
                <span>Hot &amp; Cold Shower</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-[#00754A]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 13a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"></path></svg>
                <span>24/7 Front Desk</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-[#00754A]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"></path></svg>
                <span>Free Parking</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-[#00754A]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                <span>Prime Location</span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <button
                onClick={() => { setCurrentPage('accommodations'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="flex items-center justify-center gap-2.5 px-6 py-3.5 bg-[#1E3932] hover:opacity-95 text-white font-bold text-xs uppercase tracking-widest rounded-lg transition-all shadow-md"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                Book Your Stay
              </button>
              <button
                onClick={() => { setCurrentPage('accommodations'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="flex items-center justify-center gap-2.5 px-6 py-3.5 border border-[#1E3932]/30 hover:bg-black/5 text-[#1e3932] font-bold text-xs uppercase tracking-widest rounded-lg transition-all"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                View Rooms
              </button>
            </div>

            {/* Rating Stars */}
            <div className="pt-2 text-left space-y-1">
              <div className="flex items-center gap-0.5 text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-4.5 h-4.5 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                ))}
              </div>
              <p className="text-black/60 text-[10px] font-bold uppercase tracking-wider">Trusted by Business Travelers, Families &amp; Balikbayans</p>
              <p className="text-[#00754A] text-xs font-semibold italic">Serving guests with genuine hospitality since 2010.</p>
            </div>
          </div>

          {/* Right Column: Slideshow with fade mask */}
          <div className="absolute inset-y-0 right-0 w-full md:w-3/5 hidden md:block">
            {heroImages.map((img, idx) => (
              <img
                key={idx}
                src={img}
                className={\`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 \${idx === currentHeroImg ? 'opacity-100' : 'opacity-0 pointer-events-none'}\`}
                alt="Hero Background"
              />
            ))}
            {/* Smooth left-to-right fade overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#FAF8F5] via-[#FAF8F5]/30 to-transparent w-full md:w-1/2"></div>
          </div>

        </div>
      </div>

      {/* Floating Horizontal Booking Bar */}
      <div className="relative -mt-12 z-30 px-6">
        <div className="max-w-6xl mx-auto bg-white rounded-3xl shadow-xl border border-black/5 p-5 flex flex-col items-center">
          
          <div className="flex flex-col md:flex-row items-center gap-4 w-full pb-4">
            {/* Check In */}
            <div className="flex-1 w-full px-4 py-2.5 border-b md:border-b-0 md:border-r border-black/5 flex items-center gap-3">
              <svg className="w-5 h-5 text-black/35" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
              <div className="flex-1">
                <span className="text-[9px] font-black text-black/40 uppercase tracking-widest block mb-0.5">Check In</span>
                <input
                  type="date"
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  className="w-full text-sm font-bold text-[#1E3932] focus:outline-none bg-transparent"
                />
              </div>
            </div>

            {/* Check Out */}
            <div className="flex-1 w-full px-4 py-2.5 border-b md:border-b-0 md:border-r border-black/5 flex items-center gap-3">
              <svg className="w-5 h-5 text-black/35" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
              <div className="flex-1">
                <span className="text-[9px] font-black text-black/40 uppercase tracking-widest block mb-0.5">Check Out</span>
                <input
                  type="date"
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  className="w-full text-sm font-bold text-[#1E3932] focus:outline-none bg-transparent"
                />
              </div>
            </div>

            {/* Guests */}
            <div className="flex-1 w-full px-4 py-2.5 flex items-center gap-3">
              <svg className="w-5 h-5 text-black/35" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
              <div className="flex-1">
                <span className="text-[9px] font-black text-black/40 uppercase tracking-widest block mb-0.5">Guests</span>
                <select className="w-full text-sm font-bold text-[#1E3932] focus:outline-none bg-transparent cursor-pointer">
                  <option>1 Guest</option>
                  <option>2 Guests</option>
                  <option>3 Guests</option>
                  <option>4+ Guests</option>
                </select>
              </div>
            </div>

            {/* Button */}
            <div className="w-full md:w-auto mt-2 md:mt-0 pl-2">
              <button
                onClick={handleBookingSearch}
                className="w-full md:w-auto px-8 py-4 bg-[#1E3932] hover:opacity-95 text-white rounded-xl font-bold text-xs uppercase tracking-widest transition-all whitespace-nowrap shadow-md"
              >
                Check Availability
              </button>
            </div>
          </div>

          {/* Trust indicators row */}
          <div className="border-t border-black/5 pt-4 mt-2 flex flex-col sm:flex-row justify-center items-center gap-8 text-[11px] font-bold text-black/60 w-full">
            <div className="flex items-center gap-2">
              <svg className="w-4.5 h-4.5 text-[#00754A]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
              <span>Best Rate Guaranteed</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4.5 h-4.5 text-[#00754A]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3-3v8a3 3 0 003 3z"></path></svg>
              <span>Secure Booking</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4.5 h-4.5 text-[#00754A]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
              <span>Prime Location</span>
            </div>
          </div>

        </div>
      </div>`;

if (appContent.includes(homeHeroTarget)) {
  appContent = appContent.replace(homeHeroTarget, homeHeroReplacement);
  console.log('App: HomePage hero layout updated successfully.');
} else {
  console.log('App: HomePage hero target NOT found.');
}

if (wasAppCRLF) appContent = appContent.replace(/\n/g, '\r\n');
fs.writeFileSync(appFile, appContent, 'utf8');

console.log('Completed.');
