var express = require('express');
var xlsxtoJson = require('../server/xlsxtoJson.js');
var router = express.Router();

var apiList = xlsxtoJson('./api-doc/grid.xlsx');

var featureList = [{
	text: '集成pagination等插件',
	href: '/grid'
}, {
	text: '无固定列',
	href: '/grid/noFrozen'
}, {
	text: '左侧固定列',
	href: '/grid/leftFrozen'
}, {
	text: '右侧固定列',
	href: '/grid/rightFrozen'
}, {
	text: '左右固定列',
	href: '/grid/leftRightFrozen'
}];

router.get('/', function(req, res, next) {
	console.log(2222);
	res.render('index.ejs', {
		page: './grid/withPlugin.ejs',
		apiPage: './grid/api.ejs',
		featureList: featureList,
		apiList: apiList,
		componentName: 'grid',
		activeItem: 0
	});
});

router.get('/noFrozen', function(req, res, next) {
	res.render('index.ejs', {
		page: './grid/noFrozen.ejs',
		apiPage: './grid/api.ejs',
		featureList: featureList,
		apiList: apiList,
		componentName: 'grid',
		activeItem: 1
	});
});

router.get('/leftFrozen', function(req, res, next) {
	res.render('index.ejs', {
		page: './grid/leftFrozen.ejs',
		apiPage: './grid/api.ejs',
		featureList: featureList,
		apiList: apiList,
		componentName: 'grid',
		activeItem: 2
	});
});

router.get('/rightFrozen', function(req, res, next) {
	res.render('index.ejs', {
		page: './grid/rightFrozen.ejs',
		apiPage: './grid/api.ejs',
		featureList: featureList,
		apiList: apiList,
		componentName: 'grid',
		activeItem: 3
	});
});

router.get('/leftRightFrozen', function(req, res, next) {
	res.render('index.ejs', {
		page: './grid/leftRightFrozen.ejs',
		apiPage: './grid/api.ejs',
		featureList: featureList,
		apiList: apiList,
		componentName: 'grid',
		activeItem: 4
	});
});

module.exports = router;