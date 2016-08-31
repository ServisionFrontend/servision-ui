var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
	res.render('index.ejs');
});


router.get('/window', function(req, res, next) {
	res.render('window.ejs');
});

router.get('/grid', function(req, res, next) {
	res.render('grid.ejs');
});

module.exports = router;