var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
	res.render('home.ejs');
});
router.get('/windowDemo', function(req, res, next) {
	res.render('window.ejs');
});


module.exports = router;