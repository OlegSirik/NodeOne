var express = require('express');
var router = express.Router();
var request = require('request');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/start', function(req, res){  
  var r = request('http://smosesb05:8080/mtc/intouch/devicecontroller/start');
  res.send("OK")
});

module.exports = router;
