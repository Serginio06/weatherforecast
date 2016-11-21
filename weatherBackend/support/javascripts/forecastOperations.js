/**
 * Created by sergiiivanchenko on 21/11/2016.
 */
// Functions:
// checkForecastValidity('city') - check forecast valididty in local db
// checkCityPresence ('city') - check city existance in local db
// updateCityForecast ('city') - update forecast for chosen city
// updateAllForecasts () - update forecast for all USED city
// transformXMLtoLocalJSON (reqBody) - parse XML from Yr.no and transform it to JSON
//

"use strict";

var assert = require ('assert');
var request = require ('request');
var connectDB = require ('./mongoConnect');
var dboper = require ('./dbOperations');
var parseString = require ('xml2js').parseString;


var startModule = Date.now ();


var checkCityPresence = function (geobaseId, callback) {
    connectDB.db (function (err, db) {
        assert.equal (err, null);

        var requestString = '{"location.location.@.geobaseid" : "' + geobaseId + '"}';
        console.log("Request string: " + requestString);

        dboper.findDocumentsByQuerry (db, JSON.parse (requestString), "forecasts", function (result) {
            err = null;
            // console.log(" Number of objs found:");
            // console.log(result.length);
            if (result.length == 0) {
                callback (err, false);
            } else if (result.length == 1) {
                callback (err, true)
            } else {
                err = " Forecast for more then one city found";
                callback (err, null)
            }

            db.close ();

        });
    });
};

var checkForecastValidity = function (geobaseId, callback) {
    connectDB.db (function (err, db) {
        assert.equal (err, null);

        var requestString = '{"location.location.@.geobaseid" : "' + geobaseId + '"}';
        console.log ("Request string: " + requestString);

        dboper.findDocumentsByQuerry (db, JSON.parse (requestString), "forecasts", function (result) {
            err = null;
            // console.log(" Number of objs found:");
            // console.log(result.length);
            // console.log(Date.parse (result[0].meta.nextupdate));

            var isForecastValid = Date.parse (result[0].meta.nextupdate) - Date.now ();

            console.log ("is forecast valide:" + isForecastValid);

            if (isForecastValid <= 0) {
                callback (err, false);
            } else if (isForecastValid >= 1) {
                callback (err, true)
            }
            else {
                err = " No timestamp available";
                callback (err, null)
            }

            db.close ();

        });
    });
};

var updateCityForecast = function (geobaseId, callback) {


    connectDB.db (function (err, db) {
        assert.equal (err, null);

        var requestString = '{"Geonames-ID" : "' + geobaseId + '"}';
        console.log ("Request string: " + requestString);
        //
        var startSearchXMLlink = Date.now ();

        dboper.findDocumentsByQuerry (db, JSON.parse (requestString), "geonames", function (result) {
            // var err = null;

            var xmlURLToUpdate = result[0]["Lenke til engelsk-XML"];
            // console.log (xmlURLToUpdate);

            console.log ("Search for XML link for requested city (ms):" + (
                Date.now () - startSearchXMLlink
                ));

            var startRequestForecast = Date.now ();

            request ({
                url: xmlURLToUpdate, //URL to hit
                method: 'GET'

            }, function (error, response, body) {
                if (error) {
                    console.log (error);
                } else {

                    // console.log(body);
                    console.log ("Forecast request time (ms)" + (
                        Date.now () - startRequestForecast
                        ));

                    var startParseString = Date.now ();
                    parseString (body, {trim: true, explicitArray: false, attrkey: '@'}, function (err, parsedJSON) {
                        assert.equal (err, null);


                        console.log ("Time to parse XML to JSON (ms):" + (
                                Date.now () - startParseString
                            ));


                        connectDB.db (function (err, db2) {
                            assert.equal (err, null);
                            // console.log (reqBody.weatherdata);

                            dboper.insertDocument (db2, parsedJSON.weatherdata, "forecasts", function (result) {
                                // console.log (result.ops);

                                callback (true);

                                db2.close ();

                            });


                        });

                    });


                }
                db.close ();

            });


        });
    });
};


//==================
//
// updateCityForecast ("703448", function (result) {
//     // if (err != null) throw err;
//
//     console.log ( result);
//     console.log ("Module execution time (ms): " + (
//             Date.now () - startModule
//         ));
// });

checkForecastValidity ("703448", function (err, result) {
    if (err != null) throw err;

    console.log ( result);
    console.log ("Module execution time (ms): " + (
            Date.now () - startModule
        ));

});