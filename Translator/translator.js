const Fs = require('fs');

// copy here your Translator URL for your App. 
// Only need url if you want to get language list and/or translations.
var icurl = '';

exports.install = function() {
	CORS();
	ROUTE('GET /$ictranslator/', ict_send);
	ROUTE('POST /$icresource/', exports.saveresource);
};

function ict_send() {
	var self = this;
	var obj = {};
	obj.name = CONF.name;
	obj.icon = CONF.op_icon || 'ti ti-rocket';
	obj.path = PATH.root();
	self.json(obj);
}

exports.languages = async function() {
	var data = await new RESTBuilder.GET(icurl + '&languages=true').promise();

	return data;
};

exports.saveresource = async function(language, resource) {
	var $ = this;

	if ($.body) {
		language = $.body.language;
		resource = $.body.resource;
	}

	if(!language || !resource)
		return;

	var filename = PATH.resources(language + '.resource');
	PATH.mkdir(PATH.resources());

	var builder = [];
	builder.push('// ' + CONF.name + ' translation (' + language + ')');
	builder.push('// Created:  ' + NOW.format('yyyy-MM-dd HH:mm:ss') + ' with Total.js Translator\n');
	for (var i = 0; i < resource.length; i++) {
		var item = resource[i];
		var key = item.hash;
		var val = item.name;
		key && builder.push(key.padRight(25, ' ') + ': ' + (val == null ? '' : val));
	}

	Fs.writeFile(filename, builder.join('\n'), function() {
		$.success();
	});

};

exports.translations = async function() {
	var data = await new RESTBuilder.GET(icurl).promise();

	if(data) {
		for (var i = 0; i < data.languages.length; i++) {
			var language = data.languages[i].id;
			var output = data[language].map(i => { return { 'id': i.hash, 'value': i[language] }; });
			LOADRESOURCE(language, output);
			exports.saveresource(language, output);
		}
	}
};

global.TRN = exports;
