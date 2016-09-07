var express = require('express');
var router = express.Router();

// tree
var featureList = [{
	text: 'Basic',
	href: '/tooltip'
}, {
	text: 'Position',
	href: '/tooltip/Position'
}, {
	text: 'Dialog',
	href: '/tooltip/Dialog'
}, {
	text: 'Custom Content',
	href: '/tooltip/CustomContent'
}, {
	text: 'Toolbar',
	href: '/tooltip/Toolbar'
}, {
	text: 'TrackMouse',
	href: '/tooltip/trackmouse'
}];

router.get('/', function(req, res, next) {
	res.render('index.ejs', {
		page: './tooltip/basic.ejs',
		featureList: featureList
	});
});

router.get('/position', function(req, res, next) {
	res.render('index.ejs', {
		page: './tooltip/Position.ejs',
		featureList: featureList
	});
});

router.get('/dialog', function(req, res, next) {
	res.render('index.ejs', {
		page: './tooltip/dialog.ejs',
		featureList: featureList
	});
});

router.get('/customcontent', function(req, res, next) {
	res.render('index.ejs', {
		page: './tooltip/custom-content.ejs',
		featureList: featureList
	});
});

router.get('/toolbar', function(req, res, next) {
	res.render('index.ejs', {
		page: './tooltip/toolbar.ejs',
		featureList: featureList
	});
});

router.get('/trackmouse', function(req, res, next) {
	res.render('index.ejs', {
		page: './tooltip/trackmouse.ejs',
		featureList: featureList
	});
});


module.exports = router;