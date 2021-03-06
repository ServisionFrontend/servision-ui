var express = require('express');
var xlsxtoJson = require('../server/xlsxtoJson.js');
var router = express.Router();

var apiList = xlsxtoJson('./api-doc/window.xlsx');

var featureList = [{
	text: '打开整个窗口的window',
	href: '/window'
}, {
	text: '打开局部window(多个层)',
	href: '/window/partialWindow'
}, {
	text: '配置弹出层可拖动',
	href: '/window/dragWindow'
}, {
	text: '打开默认样式的对话框',
	href: '/window/dialogWindow'
}, {
	text: '展示型的弹层',
	href: '/window/displayWindow'
}, {
	text: '关闭弹层',
	href: '/window/windowClosing'
}, {
	text: '配置',
	href: '/window/configWindow'
}];

router.get('/', function(req, res, next) {
	res.render('index.ejs', {
		page: './window/globalWindow.ejs',
		apiPage: './window/api.ejs',
		featureList: featureList,
		apiList: apiList,
		componentName: 'window',
		activeItem: 0
	});
});

router.get('/partialWindow', function(req, res, next) {
	res.render('index.ejs', {
		page: './window/partWindow.ejs',
		apiPage: './window/api.ejs',
		featureList: featureList,
		apiList: apiList,
		componentName: 'window',
		activeItem: 1
	});
});

router.get('/dragWindow', function(req, res, next) {
	res.render('index.ejs', {
		page: './window/dragWindow.ejs',
		apiPage: './window/api.ejs',
		featureList: featureList,
		apiList: apiList,
		componentName: 'window',
		activeItem: 2
	});
});

router.get('/dialogWindow', function(req, res, next) {
	res.render('index.ejs', {
		page: './window/dialogWindow.ejs',
		apiPage: './window/api.ejs',
		featureList: featureList,
		apiList: apiList,
		componentName: 'window',
		activeItem: 3
	});
});

router.get('/displayWindow', function(req, res, next) {
	res.render('index.ejs', {
		page: './window/displayWindow.ejs',
		apiPage: './window/api.ejs',
		featureList: featureList,
		apiList: apiList,
		componentName: 'window',
		activeItem: 4
	});
});

router.get('/windowClosing', function(req, res, next) {
	res.render('index.ejs', {
		page: './window/windowClosing.ejs',
		apiPage: './window/api.ejs',
		featureList: featureList,
		apiList: apiList,
		componentName: 'window',
		activeItem: 5
	});
});

router.get('/configWindow', function(req, res, next) {
	res.render('index.ejs', {
		page: './window/configWindow.ejs',
		apiPage: './window/api.ejs',
		featureList: featureList,
		apiList: apiList,
		componentName: 'window',
		activeItem: 6
	});
});

module.exports = router;