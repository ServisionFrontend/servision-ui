var express = require('express');
var router = express.Router();
var comboList = require('../public/data/combobox.json');

var featureList = [{
	text: '经典',
	href: '/combobox'
}, {
	text: '动态数据加载',
	href: '/combobox/dynamic'
}, {
	text: '多行选择',
	href: '/combobox/multiple'
}, {
	text: '分组',
	href: '/combobox/group'
}, {
	text: '自定义格式',
	href: '/combobox/custom'
}, {
	text: '多级联动',
	href: '/combobox/cascade'
}, {
	text: '默认配置',
	href: '/combobox/feature'
}];

router.get('/', function(req, res, next) {
	res.render('index.ejs', {
		page: './combobox/basic.ejs',
		featureList: featureList,
		componentName: 'Combobox',
		activeItem: 0
	});
});

router.get('/dynamic', function(req, res, next) {
	res.render('index.ejs', {
		page: './combobox/dynamic.ejs',
		featureList: featureList,
		componentName: 'Combobox',
		activeItem: 1
	});
});
router.get('/multiple', function(req, res, next) {
	res.render('index.ejs', {
		page: './combobox/multiple.ejs',
		featureList: featureList,
		componentName: 'Combobox',
		activeItem: 2
	});
});
router.get('/group', function(req, res, next) {
	res.render('index.ejs', {
		page: './combobox/group.ejs',
		featureList: featureList,
		componentName: 'Combobox',
		activeItem: 3
	});
});
router.get('/custom', function(req, res, next) {
	res.render('index.ejs', {
		page: './combobox/custom.ejs',
		featureList: featureList,
		componentName: 'Combobox',
		activeItem: 4
	});
});
router.get('/cascade', function(req, res, next) {
	res.render('index.ejs', {
		page: './combobox/cascade.ejs',
		featureList: featureList,
		componentName: 'Combobox',
		activeItem: 5
	});
});
router.get('/feature', function(req, res, next) {
	res.render('index.ejs', {
		page: './combobox/feature.ejs',
		featureList: featureList,
		componentName: 'Combobox',
		activeItem: 6
	});
});


router.get('/getComboList/brand', function(req, res, next) {
	var q = req.query,
		rst = {
			Data: []
		};
	return res.json({
		Data: comboList.Brand
	});

	if (!q.q) {
		return res.json({
			Data: comboList.Brand
		});
	}


	var hash = {},
		arr = [];

	comboList.Brand.forEach(function(val, idx) {
		q.q.forEach(function(v, i) {
			if (!v.toLowerCase() || val.Description.toLowerCase().indexOf(v.toLowerCase()) > -1) {
				arr.push(val);
			}
		});
	});

	arr.length && arr.forEach(function(v, i) {
		if (!hash[v.Code]) {
			hash[v.Code] = true;
			rst.Data.push(v);
		}
	});

	res.json(rst);
});

router.get('/getComboList/series', function(req, res, next) {
	var q = req.query,
		rst = {
			Data: []
		};

	if (!q.parentId) return rst;
	if (!q.q || !q.q.length) return res.json({
		Data: comboList.Series
	});

	q.parentId.forEach(function(pv, pi) {
		comboList.Series.forEach(function(val, idx) {
			if (pv.toLowerCase() == val.BrandCode.toLowerCase()) {
				rst.Data.push(val);
			}
		});
	});
	return res.json(rst);

	q.parentId.forEach(function(pv, pi) {
		q.q.forEach(function(v, i) {
			comboList.Series.forEach(function(val, idx) {
				if ((pv.toLowerCase() == val.BrandCode.toLowerCase()) && (!v.toLowerCase() || val.Description.toLowerCase().indexOf(v.toLowerCase()) > -1)) {
					rst.Data.push(val);
				}
			});
		});
	});
	res.json(rst);
});

router.get('/getComboList/year', function(req, res, next) {
	var q = req.query,
		rst = {
			Data: []
		},
		hash = {},
		arr = [];

	if (!q.parentId) return rst;
	if (!q.q || !q.q.length) return res.json({
		Data: comboList.Year
	});

	q.parentId.forEach(function(pv, pi) {
		comboList.Year.forEach(function(val, idx) {
			if (!val.Series || pv.toLowerCase() == val.Series.toLowerCase()) {

				arr.push(val);
			}
		});
	});

	arr.length && arr.forEach(function(v, i) {
		if (!hash[v.Code]) {
			hash[v.Code] = true;
			rst.Data.push(v);
		}
	});
	return res.json(rst);
});



module.exports = router;