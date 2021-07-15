/* --------------------

Try extra stealth plugin:
https://www.npmjs.com/package/puppeteer-extra-plugin-stealth

And/or add fallback login to sign into spam account if Instagram redirects to login page
process.env.INSTAGRAM_LOGIN
process.env.INSTAGRAM_PW

-------------------- */

const puppeteer = require("puppeteer");
const csv = require('./csv');
require('dotenv').config()

(async () => {
	if (process.argv[2]) {
		var link = "https://www.instagram.com/" + process.argv[2] + "/"
	} else {
		console.log('You must enter an Instagram username')
		process.exit()
	}
    const browser = await puppeteer.launch({headless: true});
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36');
	await page.setViewport({ width: 950, height: 950 })
	await page.goto(link, { waitUntil: 'networkidle2' });
	console.log(`Scraping ${link}`)

	try {
		await page.waitForSelector('.fx7hk', {timeout: 5000})
	} catch (error) {

		let isUsernameNotFound = await page.evaluate(() => {
			if(document.getElementsByTagName('h2')[0]) {
				if(document.getElementsByTagName('h2')[0].textContent == "Sorry, this page isn't available.") {
					return true;
				}
			}
		});
	
		if(isUsernameNotFound) {
			console.log('Account does not exist.\n');
			return await browser.close();
		} else {
			console.log('Couldn\'t load Instagram before 5s timeout\n')
			return await browser.close();
		}
	}
	
	await page.waitForTimeout(1500)
	
	// Click on reels tab
	await page.evaluate(() => {
		document.querySelectorAll('a._9VEo1')[1].click()
	})
	
	await page.waitForTimeout(1000)
	await page.waitForSelector('._2z6nI')

	const reelLink = 'div._2z6nI > div a'
	const viewsCount = 'div.T1pqg > div > div > div > div._7UhW9.vy6Bb.qyrsm.h_zdq.uL8Hv > span'
	const likesCount = 'div.T1pqg div.vrLJa > div > ul > li:nth-child(1) > span:nth-child(1)'
	const commentsCount = 'div.T1pqg div.vrLJa > div > ul > li:nth-child(2) > span:nth-child(1)'
	
	const reelArray = await page.$$eval(reelLink, el => el.map(x => x.getAttribute("href")));
	const viewsArray = await page.$$eval(viewsCount, (options) => options.map((option) => option.textContent));
	const likesArray = await page.$$eval(likesCount, (options) => options.map((option) => option.textContent));
	const commentsArray = await page.$$eval(commentsCount, (options) => options.map((option) => option.textContent));

	console.log('Links: ' + reelArray)
	console.log('\n\nViews: ' + viewsArray)
	console.log('\n\nLikes: ' + likesArray)
	console.log('\n\nComments: ' + commentsArray)

	/* 
	// SAMPLE DATA
	const reelArray = ["link1", "link2", "link3", "link4", "link5"]
	const viewsArray = ["1000", "2000", "3000", "4000", "5000"]
	const likesArray = ["100", "200", "300", "400", "500"]
	const commentsArray = ["1", "2", "3", "4", "5"]
	*/

	// Call generateCSV function from csv.js where it creates out.csv with all data
	csv.generateCSV(reelArray, viewsArray, likesArray, commentsArray);

	await browser.close();
})();