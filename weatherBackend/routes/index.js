var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  console.log('request body is ' + req.body);
  // res.render('index', { title: 'Express' });
  res.send('it was get to ');
});

module.exports = router;
