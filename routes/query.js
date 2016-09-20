var express = require('express');
var xlsxtoJson = require('../server/xlsxtoJson.js');
var queryData = require('../public/data/query.json');
var router = express.Router();

var apiList = xlsxtoJson('./api-doc/query.xlsx');

var featureList = [{
    text: '集成combobox',
    href: '/query'
}, {
    text: '原生select',
    href: '/query/withSelect'
}];

router.get('/', function (req, res, next) {
    res.render('index.ejs', {
        page: './query/withCombobox.ejs',
        apiPage: './query/api.ejs',
        featureList: featureList,
        apiList: apiList,
        componentName: 'query',
        activeItem: 0
    });
});

router.get('/withSelect', function (req, res, next) {
    res.render('index.ejs', {
        page: './query/withSelect.ejs',
        apiPage: './query/api.ejs',
        featureList: featureList,
        apiList: apiList,
        componentName: 'query',
        activeItem: 1
    });
});


router.get('/data', function (req, res, next) {


    res.send(queryData);
});

module.exports = router;