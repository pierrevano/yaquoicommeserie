const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    const override = Object.assign(page.viewport(), {
        width: 1440,
        height: 930,
        deviceScaleFactor: 3
    });
    await page.setViewport(override);
    await page.emulateMediaFeatures([{
        name: 'prefers-color-scheme',
        value: 'dark'
    }]);
    await page.goto('https://yaquoicommeserie.fr/', {
        waitUntil: 'networkidle2'
    });
    await page.evaluate((text) => {
        document.querySelector('.Typewriter__wrapper').innerText = text;
    }, '"C\'est quoi LA série à ne pas manquer ?"');
    await page.screenshot({
        path: './assets/homepage/screely.png'
    });
    await browser.close();
})();