var express = require('express');
var router = express.Router();

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

module.exports = router;