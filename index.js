const express = require('express')
const app = express()
const port = process.env.PORT || 3080
const scrape = require('./app')

app.use(express.static('public'))
app.use(express.urlencoded({extended: true}));
app.use(express.json())

app.set('view engine', 'ejs');
app.listen(port)

console.log(`Server is listening on port ${port} \n- http://localhost:${port}/`);

app.get('/', async (req, res) => {
	res.render('pages/index', {
		errorMsg: ''
	})
})

app.post('/scraper', async (req, res) => {
	scrape.scrape(req.body.username, res)
})

app.get('/download', function(req, res){
    const html = `
    
        <a href="./out.csv">Download report</a>

    `
    res.send(html)
})