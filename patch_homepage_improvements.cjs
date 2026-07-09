const fs = require('fs');

const appFile = 'c:\\website\\northomes-system\\src\\App.jsx';
let appContent = fs.readFileSync(appFile, 'utf8');

let wasCRLF = appContent.includes('\r\n');
if (wasCRLF) appContent = appContent.replace(/\r\n/g, '\n');

// ─── 1. MAKE STARS SMALL ─────────────────────────────────────────────────────
// Replace the amber stars class from w-4.5 h-4.5 to w-4 h-4 if not already done
if (appContent.includes('w-4.5 h-4.5 fill-current')) {
  appContent = appContent.replace(
    'className="w-4.5 h-4.5 fill-current"',
    'className="w-4 h-4 fill-current"'
  );
  console.log('App: Stars class size updated.');
}


// ─── 2. PUSH HERO IMAGE TO THE SIDE ──────────────────────────────────────────

// Target A: Insert full-width absolute slideshow right under outer relative div
const topTarget = `      {/* Unified Side-by-Side Hero Section */}
      <div className="w-full relative bg-[#FAF8F5] overflow-hidden border-b border-black/5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row relative min-h-[550px] md:min-h-[620px] z-10">`;

const topReplacement = `      {/* Unified Side-by-Side Hero Section */}
      <div className="w-full relative bg-[#FAF8F5] overflow-hidden border-b border-black/5">
        
        {/* Right Column: Slideshow with fade mask - pushed to full right side of window */}
        <div className="absolute inset-y-0 right-0 w-full md:w-1/2 hidden md:block z-0">
          {heroImages.map((img, idx) => (
            <img
              key={idx}
              src={img}
              className={\`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 \${idx === currentHeroImg ? 'opacity-100' : 'opacity-0 pointer-events-none'}\`}
              alt="Hero Background"
            />
          ))}
          {/* Smooth left-to-right fade overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#FAF8F5] via-[#FAF8F5]/35 to-transparent w-full md:w-1/2"></div>
        </div>

        <div className="max-w-7xl mx-auto flex flex-col md:flex-row relative min-h-[550px] md:min-h-[620px] z-10">`;

if (appContent.includes(topTarget)) {
  appContent = appContent.replace(topTarget, topReplacement);
  console.log('App: Hero layout top part updated.');
} else {
  console.log('App: Hero layout top target NOT found.');
}

// Target B: Remove the old local slideshow inside the max-w-7xl container
const bottomTarget = `          {/* Right Column: Slideshow with fade mask */}
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
          </div>`;

if (appContent.includes(bottomTarget)) {
  appContent = appContent.replace(bottomTarget, '');
  console.log('App: Old local slideshow container removed.');
} else {
  console.log('App: Hero layout bottom target NOT found.');
}


// ─── 3. SHOW HEADER MENU AND BOOK BUTTON ON MEDIUM SCREENS AND UP ────────────

// A. Mobile menu button breakpoint in pre-header
appContent = appContent.replace(
  `          <button
            onClick={(e) => { e.stopPropagation(); setIsMobileMenuOpen(!isMobileMenuOpen); }}
            className="lg:hidden text-white/90 hover:text-white p-1 ml-2"
          >`,
  `          <button
            onClick={(e) => { e.stopPropagation(); setIsMobileMenuOpen(!isMobileMenuOpen); }}
            className="md:hidden text-white/90 hover:text-white p-1 ml-2"
          >`
);

// B. Desktop Nav menu container breakpoint in main header
appContent = appContent.replace(
  `            {/* Navigation Center */}
            <nav className="hidden lg:flex items-center space-x-1">`,
  `            {/* Navigation Center */}
            <nav className="hidden md:flex items-center space-x-1">`
);

// C. Book Now button container breakpoint in main header
appContent = appContent.replace(
  `            {/* Book Now Button Right */}
            <div className="hidden lg:block">`,
  `            {/* Book Now Button Right */}
            <div className="hidden md:block">`
);

// D. Mobile Menu Dropdown container breakpoint at bottom of header
appContent = appContent.replace(
  `        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <nav className="lg:hidden flex flex-col items-center space-y-4 py-6 bg-white border-t border-black/5 shadow-lg absolute top-full left-0 w-full z-50">`,
  `        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <nav className="md:hidden flex flex-col items-center space-y-4 py-6 bg-white border-t border-black/5 shadow-lg absolute top-full left-0 w-full z-50">`
);

if (wasCRLF) appContent = appContent.replace(/\n/g, '\r\n');
fs.writeFileSync(appFile, appContent, 'utf8');

console.log('Completed.');
