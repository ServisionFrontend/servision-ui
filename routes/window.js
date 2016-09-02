var express = require('express');
var router = express.Router();

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
		featureList: featureList
	});
});

router.get('/partialWindow', function(req, res, next) {
	res.render('index.ejs', {
		page: './window/partWindow.ejs',
		featureList: featureList
	});
});

router.get('/dragWindow', function(req, res, next) {
	res.render('index.ejs', {
		page: './window/dragWindow.ejs',
		featureList: featureList
	});
});

router.get('/dialogWindow', function(req, res, next) {
	res.render('index.ejs', {
		page: './window/dialogWindow.ejs',
		featureList: featureList
	});
});

router.get('/displayWindow', function(req, res, next) {
	res.render('index.ejs', {
		page: './window/displayWindow.ejs',
		featureList: featureList
	});
});

router.get('/windowClosing', function(req, res, next) {
	res.render('index.ejs', {
		page: './window/windowClosing.ejs',
		featureList: featureList
	});
});

router.get('/configWindow', function(req, res, next) {
	res.render('index.ejs', {
		page: './window/configWindow.ejs',
		featureList: featureList
	});
});

module.exports = router;