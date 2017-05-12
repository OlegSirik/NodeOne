var express = require('express');
var router = express.Router();
var parser = require('./parts_parser');
var jsonxml = require('jsontoxml');

function resp(result, response) {
	var xml = jsonxml(JSON.stringify(result, null, 4));
	response.send(xml);
}

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/foo', function(req, res){
  res.send({'name':'Oleg Sirik', 'phone':'2116'})
});

router.get('/renault/:id', function(req1, res1){
	var results = [];

	parser.getPlRenault(req1.params.id
		, results
		, function(res) {

			console.log('request:Renault; part:'+ req1.params.id + '; result ln: ' + res.length);

			resp(results, res1)
		}
	);
});

router.get('/majorauto/:id', function(req1, res1){
	var results = [];

	parser.getPlMajorAuto(req1.params.id
		, results
		, function(res) {

			console.log('request:MAJOR; part:'+ req1.params.id + '; result ln: ' + results.length);		

			resp(results, res1);
	});	
});

router.get('/rolf/:id', function(req1, res1){
	var results = [];

	parser.getPlRolf(req1.params.id
		, results
		, function(res) {

			console.log('request:Rolf; part:'+ req1.params.id + '; result ln: ' + results.length);		

			resp(results, res1);
	});	
});

router.get('/vw/:id', function(req1, res1){
	var results = [];

	parser.getPlVW(req1.params.id
		, results
		, function(res) {

			console.log('request:VW; part:'+ req1.params.id + '; result ln: ' + results.length);		

			resp(results, res1);
	});	
});

router.get('/skoda/:id', function(req1, res1){
	var results = [];

	parser.getPlSkoda(req1.params.id
		, results
		, function(res) {

			console.log('request:Skoda; part:'+ req1.params.id + '; result ln: ' + results.length);		

			resp(results, res1);
	});	
});

router.get('/kia/:id', function(req1, res1){
	var results = [];

	parser.getPlKia(req1.params.id
		, results
		, function(res) {

			console.log('request:kia; part:'+ req1.params.id + '; result ln: ' + results.length);		

			resp(results, res1);
	});	
});

router.get('/mbenz/:id', function(req1, res1){
	var results = [];

	parser.getPlMBenz(req1.params.id
		, results
		, function(res) {

			console.log('request:mbenz; part:'+ req1.params.id + '; result ln: ' + results.length);		

			resp(results, res1);
	});	
});


module.exports = router;
