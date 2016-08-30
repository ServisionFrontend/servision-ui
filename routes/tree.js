var express = require('express');
var router = express.Router();

// tree
var treeFeatureList = [{
	text: '基本功能',
	href: '/tree'
}, {
	text: '节点多选',
	href: '/tree/nodeCheckbox'
}, {
	text: '上下选中节点',
	href: '/tree/moveSelection'
}, {
	text: '展开指定节点',
	href: '/tree/expandTo'
}];

router.get('/', function(req, res, next) {
	res.render('index.ejs', {
		page: './tree/basic.ejs',
		featureList: treeFeatureList
	});
});

router.get('/nodeCheckbox', function(req, res, next) {
	res.render('index.ejs', {
		page: './tree/nodeCheckbox.ejs',
		featureList: treeFeatureList
	});
});

router.get('/moveSelection', function(req, res, next) {
	res.render('index.ejs', {
		page: './tree/moveSelection.ejs',
		featureList: treeFeatureList
	});
});

router.get('/expandTo', function(req, res, next) {
	res.render('index.ejs', {
		page: './tree/expandTo.ejs',
		featureList: treeFeatureList
	});
});

router.get('/getData', function(req, res, next) {
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


module.exports = router;