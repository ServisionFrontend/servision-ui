var express = require('express');
var router = express.Router();

// tree
var featureList = [{
	text: '经典',
	href: '/tabs'
}];

router.get('/', function(req, res, next) {
	res.render('index.ejs', {
		page: './tabs/basic.ejs',
		featureList: featureList,
		componentName: 'tabs',
		activeItem: 0
	});
});

module.exports = router;