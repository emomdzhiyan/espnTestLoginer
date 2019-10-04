const express = require('express');
const puppeteer = require('puppeteer');
const router = express.Router();

const browserOptions = {
  defaultViewport: {
    width: 1920,
    height: 1080,
  },
};
const url = 'https://www.espn.com/';
const loginSelector = '#sideLogin-left-rail > button.button-alt.med';
const usernameSelector = 'span.input-wrapper > input[type="email"][class="ng-pristine ng-untouched ng-invalid ng-invalid-required ng-valid-pattern"]';
const passwordSelector = 'span.input-wrapper > input[type="password"][class="ng-pristine ng-untouched ng-invalid ng-invalid-required"]';
const submitSelector = 'div.btn-group.touch-print-btn-group-wrapper > button[type="submit"][class="btn btn-primary btn-submit ng-isolate-scope"]';
const loginIframeName = 'disneyid-iframe';

router.post('/', async (req, res) => {
  try {
    const { login, password } = req.body;
    if (!login || !password) return res.sendStatus(400);

    const browser = await puppeteer.launch(browserOptions);
    const page = await browser.newPage();

    await page.goto(url, { waitUntil: 'networkidle2' });
    await page.screenshot({path: 'screenshots/initialScreenshot.png'});
    await page.click(loginSelector);
    await page.waitFor(1000);
    const frames = await page.frames();
    const loginFrame = frames.find(frame => frame.name() === loginIframeName);
    await loginFrame.type(usernameSelector, login);
    await loginFrame.type(passwordSelector, password);
    await page.screenshot({path: 'screenshots/loginScreenshot.png'});
    await loginFrame.click(submitSelector);
    await page.waitFor(5000);
    await page.screenshot({path: 'screenshots/finalScreenshot.png'});

    await page.close();
    await browser.close();

    res.send('OK');
  } catch (e) {
    res.status(500).send(`Server error: ${e}`)
  }
});

module.exports = router;
