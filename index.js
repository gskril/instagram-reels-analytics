const puppeteer = require("puppeteer");
const csv = require('./csv');
require('dotenv').config();

(async () => {
	if (process.argv[2]) {
		var link = "https://www.instagram.com/" + process.argv[2]
	} else {
		console.log("Enter an Instagram username after the start command")
		process.exit()
	}
    const browser = await puppeteer.launch({headless: true});
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36');
	await page.setViewport({ width: 800, height: 1400 })
	await page.goto(link + '/', { waitUntil: 'networkidle2' });
	console.log(`Scraping ${link}`)

	// Check if Instagram redirects to login page
	if (await page.url() == "https://www.instagram.com/accounts/login/") {
		console.log('Instagram redirected to Login page')
		if (!process.env.INSTAGRAM_LOGIN || !process.env.INSTAGRAM_PW) {
			console.log('No credentials available in .env file.\n')
			return await browser.close();
		}

		const loginFormLoaded = await page.evaluate(() => {
			if (document.querySelector('#loginForm input[name="username"]')) { return true }
		})

		if (!loginFormLoaded) {
			console.log('Instagram login form not loading. Try again later.')
			return await browser.close()
		}

		// Login to Instagram using credentials in .env file
		await page.type('#loginForm input[name="username"]', process.env.INSTAGRAM_LOGIN, { delay: 50 })
		await page.type('#loginForm input[name="password"]', process.env.INSTAGRAM_PW, { delay: 50 })
		await page.click('button[type="submit"]', { delay: 500 })
		
		// Wait for successful login then go to specified profile
		await page.waitForTimeout(3000);
		await page.waitForSelector('#react-root');

		// Check if browser is still on login page, meaning a failed login
		if (await page.url() == "https://www.instagram.com/accounts/login/") {
			console.log('Failed logging in to Instagram.\n')
			return await browser.close()
		} else {
			console.log('Successfully logged in')
		}

		try {
			await page.goto(link + '/', { waitUntil: 'networkidle2' });
		} catch (error) {
			console.log('Unable to visit profile after attempted login.\n')
			return await browser.close()
		}
	}

	try {
		await page.waitForSelector('.fx7hk', {timeout: 5000})
		console.log('Found Instagram profile')
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
		}
		else if (await page.$eval('h2.rkEop', el => el.textContent) == "This Account is Private") {
			console.log('Account is private.\n');
			return await browser.close();
		} else {
			console.log('Couldn\'t load Instagram before 5s timeout.\n')
			return await browser.close();
		}
	}
	
	await page.waitForTimeout(1000)
	
	// Click on reels tab
	await page.evaluate(() => {
		document.querySelectorAll('a._9VEo1')[1].click()
	})
	
	await page.waitForTimeout(1000)
	await page.waitForSelector('._2z6nI')

	// Scroll to load more reels
	console.log('Scrolling down reels page...\n')
	await page.evaluate(() => new Promise((resolve) => {
        var scrollTop = -1;
        const interval = setInterval(() => {
			window.scrollBy(0, 100);
			if (document.documentElement.scrollTop !== scrollTop) {
				scrollTop = document.documentElement.scrollTop;
				return;
			}
			clearInterval(interval);
			resolve();
        }, 200);
	}));
	await page.setViewport({ width: 800, height: 6000 })
	await page.evaluate(() => window.scrollTo(0,500))
	await page.waitForTimeout(1000)

	// Selectors for desired data (url of reel, views, likes, and comments)
	const reelLink = 'div._2z6nI > div a'
	const viewsCount = 'div.T1pqg > div > div > div > div._7UhW9.vy6Bb.qyrsm.h_zdq.uL8Hv > span'
	const likesCount = 'div.vrLJa > div > ul > li:nth-child(1) > span:nth-child(1)'
	const commentsCount = 'div.vrLJa > div > ul > li:nth-child(2) > span:nth-child(1)'
	
	// Create an array using querySelectorAll for each data point
	const reelArray = await page.$$eval(reelLink, el => el.map(x => x.getAttribute("href")));
	const viewsArray = await page.$$eval(viewsCount, (options) => options.map((option) => option.textContent));
	const likesArray = await page.$$eval(likesCount, (options) => options.map((option) => option.textContent));
	const commentsArray = await page.$$eval(commentsCount, (options) => options.map((option) => option.textContent));

	/* 
	SAMPLE DATA: 
	reelArray = ["/reel/CRCi1qIhBei/", "/reel/CRB3cuABeF9/", "/reel/CRA2BEZhdQR/"]
	viewsArray = ["4m", "4.7m", "3.5m"]
	likesArray = ["267k", "699k", "148k"]
	commentsArray = ["1,366", "2,452", "559"]
	*/

	for (i=0; i<reelArray.length; i++) {
		console.log('Reel ' + (i+1) + ': ' + viewsArray[i] + ' views, ' + likesArray[i] + ' likes, ' + commentsArray[i] + ' comments')
	}

	// Call generateCSV function from csv.js where it creates out.csv with all data
	csv.generateCSV(link, reelArray, viewsArray, likesArray, commentsArray);

	await browser.close();
})();