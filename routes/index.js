var express = require('express');
var router = express.Router();
var comboList = require('../public/data/combobox.json');

router.get('/', function(req, res, next) {
	res.render('index.ejs');
});

router.get('/combobox', function(req, res, next) {
	res.render('combobox.ejs');
});

router.get('/window', function(req, res, next) {
	res.render('window.ejs');
});

router.get('/grid', function(req, res, next) {
	res.render('grid.ejs');
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