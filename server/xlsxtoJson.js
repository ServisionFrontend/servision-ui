var xlsxJson = require('jsonify-excel');
var defaultSheetsName = ['properties', 'events', 'methods'];
var defaultMap = [{
	name: '*A',
	type: '*B',
	describe: '*C',
	default: '*D'
}, {
	name: '*A',
	param: '*B',
	describe: '*C'
}, {
	name: '*A',
	param: '*B',
	describe: '*C'
}];

function convert(url, maps, config, sheetsName) {
	var maps = maps || defaultMap,
		sheetsName = sheetsName || defaultSheetsName,
		result = {};
	if (!Array.isArray(maps)) {
		return console.log("need an array");
	}
	maps.forEach(function(element, index) {
		var config = Object.assign({
			automap: false,
			sheet: index,
			start: 2
		}, config || {});

		var map = [element];
		result[sheetsName[index]] = new xlsxJson(url).toJSON(config, map);
	});

	return result || {};
}

module.exports = convert;