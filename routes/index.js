var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
	res.render('home.ejs');
});
router.get('/windowDemo', function(req, res, next) {
	res.render('window.ejs');
});
router.get('/grid', function(req, res, next) {
	res.render('grid.ejs');
});
router.get('/pagination', function(req, res, next) {
	res.render('pagination.ejs');
});

module.exports = router;