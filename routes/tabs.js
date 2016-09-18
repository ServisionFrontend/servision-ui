var express = require('express');
var router = express.Router();
var xlsxtoJson = require('../server/xlsxtoJson.js');
var apiList = xlsxtoJson('./api-doc/tabs.xlsx');

// tree
var featureList = [{
	text: '经典',
	href: '/tabs'
}, {
	text: '自定义内容',
	href: '/tabs/custom'
}, {
	text: '禁用项',
	href: '/tabs/disabled'
}];

router.get('/', function(req, res, next) {
	res.render('index.ejs', {
		apiPage: './tabs/api.ejs',
		apiList: apiList,
		page: './tabs/basic.ejs',
		featureList: featureList,
		componentName: 'tabs',
		activeItem: 0
	});
});

router.get('/custom', function(req, res, next) {
	res.render('index.ejs', {
		apiPage: './tabs/api.ejs',
		apiList: apiList,
		page: './tabs/custom.ejs',
		featureList: featureList,
		componentName: 'tabs',
		activeItem: 1
	});
});
router.get('/disabled', function(req, res, next) {
	res.render('index.ejs', {
		apiPage: './tabs/api.ejs',
		apiList: apiList,
		page: './tabs/disabled.ejs',
		featureList: featureList,
		componentName: 'tabs',
		activeItem: 2
	});
});
module.exports = router;