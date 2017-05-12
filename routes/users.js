var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/foo', function(req, res){
  res.send({'name':'Bob Goldcat', 'age': '41'})
});

module.exports = router;
