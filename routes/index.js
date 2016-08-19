var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
	res.render('textbox.ejs');
});

router.get('/combobox', function(req, res, next) {
	res.render('combobox.ejs');
});

router.get('/window', function(req, res, next) {
	res.render('window.ejs');
});

module.exports = router;