var express = require('express');
var xlsxtoJson = require('../server/xlsxtoJson.js');
var router = express.Router();

var apiList = xlsxtoJson('./api-doc/pagination.xlsx');

var featureList = [{
	text: 'epc常用模式',
	href: '/pagination'
}];

router.get('/', function(req, res, next) {
	res.render('index.ejs', {
		page: './pagination/epc.ejs',
		apiPage: './pagination/api.ejs',
		featureList: featureList,
		apiList: apiList,
		componentName: 'pagination',
		activeItem: 0
	});
});

module.exports = router;