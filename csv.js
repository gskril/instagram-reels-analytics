const createCsvWriter = require('csv-writer').createObjectCsvWriter;

function generateCSV(reelArray, viewsArray, likesArray, commentsArray) {
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
			link: reelArray[i],
			views: viewsArray[i],
			likes: likesArray[i],
			comments: commentsArray[i]
		})
	}

	csvWriter
		.writeRecords(data)
		.then(()=> console.log('The CSV file was written successfully'));
}

module.exports = { generateCSV }