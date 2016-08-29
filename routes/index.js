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

router.get('/tree/getData', function(req, res, next) {
	var data = [{
		id: 1,
		text: 'node-1',
		children: [{
			id: 2,
			text: 'node-2',
			children: [{
				id: 4,
				text: 'node-4',
				children: [{
					id: 5,
					text: 'node-5'
				}, {
					id: 6,
					text: 'node-6'
				}]
			}]
		}, {
			id: 3,
			text: 'node-3',
			children: [{
				id: 333,
				text: 'node-333'
			}, {
				id: 444,
				text: 'node-444'
			}]
		}]
	}, {
		id: 11,
		text: 'node-11',
		children: [{
			id: 22,
			text: 'node-22',
			children: [{
				id: 221,
				text: 'node-221'
			}, {
				id: 222,
				text: 'node-222'
			}]
		}, {
			id: 33,
			text: 'node-33',
			children: [{
				id: 66,
				text: 'node-66',
				children: [{
					id: 77,
					text: 'node-77'
				}, {
					id: 88,
					text: 'node-88'
				}]
			}, {
				id: 55,
				text: 'node-55'
			}]
		}]
	}];

	res.json({
		success: true,
		data: data
	});
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
		};

	if (!q.parentId) return rst;
	if (!q.q || !q.q.length) return res.json({
		Data: comboList.Year
	});
	console.log(q.parentId);
	q.parentId.forEach(function(pv, pi) {
		comboList.Year.forEach(function(val, idx) {
			if (!val.Series || pv.toLowerCase() == val.Series.toLowerCase()) {

				rst.Data.push(val);
			}
		});
	});
	return res.json(rst);
});

module.exports = router;