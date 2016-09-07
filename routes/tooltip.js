var express = require('express');
var router = express.Router();

// tree
var featureList = [{
	text: '经典',
	href: '/tooltip'
}, {
	text: '定位',
	href: '/tooltip/Position'
}, {
	text: '模态框',
	href: '/tooltip/Dialog'
}, {
	text: '自定义内容',
	href: '/tooltip/CustomContent'
}, {
	text: '工具条',
	href: '/tooltip/Toolbar'
}, {
	text: '鼠标跟随',
	href: '/tooltip/trackmouse'
}];

router.get('/', function(req, res, next) {
	res.render('index.ejs', {
		page: './tooltip/basic.ejs',
		featureList: featureList,
		componentName: 'Tooltip',
		activeItem: 0
	});
});

router.get('/position', function(req, res, next) {
	res.render('index.ejs', {
		page: './tooltip/Position.ejs',
		featureList: featureList,
		componentName: 'Tooltip',
		activeItem: 1
	});
});

router.get('/dialog', function(req, res, next) {
	res.render('index.ejs', {
		page: './tooltip/dialog.ejs',
		featureList: featureList,
		componentName: 'Tooltip',
		activeItem: 2
	});
});

router.get('/customcontent', function(req, res, next) {
	res.render('index.ejs', {
		page: './tooltip/custom-content.ejs',
		featureList: featureList,
		componentName: 'Tooltip',
		activeItem: 3
	});
});

router.get('/toolbar', function(req, res, next) {
	res.render('index.ejs', {
		page: './tooltip/toolbar.ejs',
		featureList: featureList,
		componentName: 'Tooltip',
		activeItem: 4
	});
});

router.get('/trackmouse', function(req, res, next) {
	res.render('index.ejs', {
		page: './tooltip/trackmouse.ejs',
		featureList: featureList,
		componentName: 'Tooltip',
		activeItem: 5
	});
});


module.exports = router;