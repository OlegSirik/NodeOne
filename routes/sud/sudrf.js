var express = require('express');
var router = express.Router();
var parser = require('./sudrf_parser');
var jsonxml = require('jsontoxml');

function resp(result, response) {
	var xml = jsonxml(JSON.stringify(result, null, 4));
	response.send(xml);
}

function resp1(result, response) {
	
	response.send(result);
}

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/foo', function(req, res){
  res.send({'name':'Bob Goldcat', 'age': '41'})
});

router.get('/sud/:id', function(req1, res1){
	var results = [];
	
	parser.getSudRfByRegion(req1.params.id
		, results
		, function(res) {

			console.log('request:sudRf; part:'+ req1.params.id + '; result ln: ' + results.length);		

			resp(results, res1);
	});	
});

router.get('/sudmir/:id', function(req1, res1){
	var results = [];

	parser.getSudRfMirByRegion(req1.params.id
		, results
		, function(res) {

			console.log('request:SudRfMir; part:'+ req1.params.id + '; result ln: ' + results.length);		

			resp(results, res1);
	});	
});

router.get('/sudmir77/:id', function(req1, res1){
	var results = [];

	parser.getMosMirByNr(req1.params.id
		, results
		, function(res) {

			console.log('request:sudmir77; id:'+ req1.params.id + '; result ln: ' + results.length);		
			
			resp(results, res1);
	});	
});

router.get('/arbitr/:id', function(req1, res1){
	var results = [];

	parser.getArbitrByNr(req1.params.id
		, results
		, function(res) {

			console.log('request: arbitr; id:'+ req1.params.id + '; result ln: ' + results.length);		
			
			resp(results, res1);
	});	
});

router.get('/mosgor', function(req1, res1){
	var results = [];	
	var caseNr = req1.query.caseNr;
	var uid = req1.query.uid;
	var page = req1.query.page;
	
	if ( caseNr != undefined ) {
	parser.getMosGorByNr(req1.query.caseNr
		, results
		, function(res) {

			console.log('request: mosgor; id:'+ req1.query.caseNr + '; result ln: ' + results.length);		
			
			resp(results, res1);
	});
	} 
	else if ( uid != undefined ) {
	parser.getMosGorByUID(req1.query.uid
		, results
		, function(res) {
			
			resp(results, res1);
	});	
	}
	else if ( page != undefined ) {
	parser.getMosGorByPage(req1.query.page
		, results
		, function(res) {
			
			resp(results, res1);
	});	
	}
	else  {
	res1.send("NotFound");
	}
});


module.exports = router;
