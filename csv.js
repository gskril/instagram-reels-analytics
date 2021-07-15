const createCsvWriter = require('csv-writer').createObjectCsvWriter;

function generateCSV(link, reelArray, viewsArray, likesArray, commentsArray) {
	const csvWriter = createCsvWriter({
		path: 'out.csv',
		header: [
			{id: 'link', title: 'Link'},
			{id: 'views', title: 'Views'},
			{id: 'likes', title: 'Likes'},
			{id: 'comments', title: 'Comments'},
		]
	});

	const data = []

	for (let i = 0; i < reelArray.length; i++) {
		data.push( {
			link: link + reelArray[i],
			views: viewsArray[i],
			likes: likesArray[i],
			comments: commentsArray[i]
		})
	}

	csvWriter
		.writeRecords(data)
		.then(()=> console.log('\nThe CSV file was written successfully with ' + reelArray.length + ' records'));
}

module.exports = { generateCSV }