const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  page.on('console', msg => console.log('BROWSER_CONSOLE:', msg.text()));
  page.on('pageerror', error => console.log('BROWSER_ERROR:', error.message));

  await page.goto('http://localhost:5174/', { waitUntil: 'networkidle0' });

  // Click Front Desk in the sidebar
  // The sidebar has a button with text "Front Desk" or a class that we can click.
  // We can just evaluate a script to click it.
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const fdBtn = buttons.find(b => b.textContent.includes('Front Desk'));
    if (fdBtn) {
      console.log('Clicking Front Desk button');
      fdBtn.click();
    } else {
      console.log('Front Desk button not found');
    }
  });

  await new Promise(r => setTimeout(r, 3000));
  await browser.close();
})();
