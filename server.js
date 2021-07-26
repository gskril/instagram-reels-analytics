const express = require('express')
const app = express()
const path = require('path')
const main = require('./main')
const port = main.getAvailPort
const scrape = require('./app')

app.use(express.json())
app.use(express.static(__dirname + '/public'))
app.use(express.urlencoded({extended: true}));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))
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
    res.render('pages/result')
})