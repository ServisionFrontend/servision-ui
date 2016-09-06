var express = require('express');
var router = express.Router();

// tree
var featureList = [{
	text: 'Basic',
	href: '/tooltip'
}];

router.get('/', function(req, res, next) {
	res.render('./tooltip/basic.ejs');
	// res.render('index.ejs', {
	// 	page: './tooltip/basic.ejs',
	// 	featureList: featureList
	// });
});



module.exports = router;