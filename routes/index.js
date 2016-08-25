var express = require('express');
var router = express.Router();
var comboList = require('../public/data/combobox.json');

router.get('/', function(req, res, next) {
	res.render('index.ejs');
});

router.get('/textbox', function(req, res, next) {
	res.render('textbox.ejs');
});

router.get('/tree', function(req, res, next) {
	res.render('treeview.ejs');
});

router.get('/combobox', function(req, res, next) {
	res.render('combobox.ejs');
});

router.get('/window', function(req, res, next) {
	res.render('window.ejs');
});

router.get('/getComboList/brand', function(req, res, next) {
	var q = req.query,
		rst = {
			Data: []
		};

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
		q.q.forEach(function(v, i) {
			comboList.Series.forEach(function(val, idx) {
				if ((pv.toLowerCase() == val.BrandCode.toLowerCase()) && (!v.toLowerCase() || val.Description.toLowerCase().indexOf(v.toLowerCase()) > -1)) {
					console.log(val.BrandCode.toLowerCase());
					rst.Data.push(val);
				}
			});
		});
	});
	res.json(rst);
});

module.exports = router;