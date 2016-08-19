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

router.get('/combobox', function(req, res, next) {
	res.render('combobox.ejs');
});

module.exports = router;