var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
	res.render('treeview.ejs');
});

router.get('/combobox', function(req, res, next) {
	res.render('combobox.ejs');
});

module.exports = router;