# Instagram Reels Analytics

Generate a CSV report including views, likes, and comments of Reels from any public Instagram profile.


## Run Locally

Use Node.js 22.23.4+ (22.x), 24.22.1+ (24.x), or 26.12.1+ (26.x). The `.nvmrc` selects 22.23.4.

Puppeteer 24.43.1 installs Chrome for Testing 148.0.7778.97 with the Brotli security fix. Reinstall dependencies after updating; do not override Puppeteer with an older system browser.

Clone the project

```bash
git clone https://github.com/gskril/instagram-reels-analytics.git
```

Go to the project directory

```bash
cd instagram-reels-analytics
```

Install dependencies

```bash
nvm use
npm ci
```

Start scraping a public Instagram profile's reels

```bash
npm start {instagram_profile}
```
## Environment Variables

Instagram sometimes requires users to login before viewing even public profiles. I suggest using a test account.

`INSTAGRAM_LOGIN`

`INSTAGRAM_PW`

  
