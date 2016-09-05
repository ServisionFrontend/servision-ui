var express = require('express');
var router = express.Router();
var comboList = require('../public/data/tooltip.json');

// tree
var featureList = [{
	text: 'Basic',
	href: '/tooltip'
}];

router.get('/tooltip', function(req, res, next) {
	res.view();
	// res.render('index.ejs', {
	// 	page: './tooltip/basic.ejs',
	// 	featureList: featureList
	// });
});



module.exports = router;