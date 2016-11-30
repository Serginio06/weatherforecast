/**
 * Created by sergiiivanchenko on 24/11/2016.
 */
// This file contain API to get data about cities from geonames DB

"use strict";

var assert = require('assert');
var forecastOper = require('../support/javascripts/forecastOperations')

var express = require('express');
var router = express.Router();

router.route ('/:cityRequest')
      .get(function (req, res) {
          // console.log('Console body to GET is ');
          console.log (req.params);

          forecastOper.quickCitySearch(req.params.cityRequest, function (err, cityArray) {

              res.send(cityArray);
          });




      });

module.exports = router;