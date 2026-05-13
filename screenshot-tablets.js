const puppeteer = require('puppeteer');

async function shot(page, path) {
  await page.screenshot({ path, fullPage: false });
  console.log('Saved:', path);
}

async function loginAndShoot(browser, width, height, prefix) {
  const page = await browser.newPage();
  await page.setViewport({ width, height, deviceScaleFactor: 2 });

  // Login
  await page.goto('https://www.tulon.co.il/login', { waitUntil: 'networkidle0', timeout: 30000 });
  await new Promise(r => setTimeout(r, 2000));

  await page.$eval('input[type="email"]', el => { el.value = ''; });
  await page.type('input[type="email"]', 'shayeis@gmail.com');
  await page.$eval('input[type="password"]', el => { el.value = ''; });
  await page.type('input[type="password"]', '220174');

  const buttons = await page.$$('button');
  for (const btn of buttons) {
    const cls = await page.evaluate(el => el.className, btn);
    if (cls && cls.includes('btn-main')) { await btn.click(); break; }
  }
  await new Promise(r => setTimeout(r, 5000));

  // Screenshot 1 – trip list
  await shot(page, `D:/One Drive/OneDrive/Desktop/new trip app/${prefix}_1_home.png`);

  // Click first trip card
  try {
    await page.evaluate(() => {
      const divs = document.querySelectorAll('div');
      for (const d of divs) {
        if (d.style && d.style.cursor === 'pointer' && d.style.borderRadius) {
          d.click(); return;
        }
      }
    });
    await new Promise(r => setTimeout(r, 4000));

    // Click expenses nav button
    await page.evaluate(() => {
      const buttons = document.querySelectorAll('button');
      for (const b of buttons) {
        if (b.textContent && b.textContent.includes('הוצאות')) { b.click(); return; }
      }
    });
    await new Promise(r => setTimeout(r, 1500));

    // Screenshot 2 – expenses
    await shot(page, `D:/One Drive/OneDrive/Desktop/new trip app/${prefix}_2_expenses.png`);

    // Click budget nav button
    await page.evaluate(() => {
      const buttons = document.querySelectorAll('button');
      for (const b of buttons) {
        if (b.textContent && b.textContent.includes('תקציב')) { b.click(); return; }
      }
    });
    await new Promise(r => setTimeout(r, 2000));

    // Screenshot 3 – budget
    await shot(page, `D:/One Drive/OneDrive/Desktop/new trip app/${prefix}_3_budget.png`);

    // Click calendar nav button
    await page.evaluate(() => {
      const buttons = document.querySelectorAll('button');
      for (const b of buttons) {
        if (b.textContent && b.textContent.includes('לוח')) { b.click(); return; }
      }
    });
    await new Promise(r => setTimeout(r, 2000));

    // Screenshot 4 – calendar
    await shot(page, `D:/One Drive/OneDrive/Desktop/new trip app/${prefix}_4_calendar.png`);

  } catch(e) {
    console.log('Error:', e.message);
  }

  await page.close();
}

(async () => {
  const browser = await puppeteer.launch({ headless: true });

  console.log('Shooting 7-inch tablet (1024x600)...');
  await loginAndShoot(browser, 1024, 600, 'tablet7');

  console.log('Shooting 10-inch tablet (1280x800)...');
  await loginAndShoot(browser, 1280, 800, 'tablet10');

  await browser.close();
  console.log('All done!');
})().catch(e => console.error(e));
