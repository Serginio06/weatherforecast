/**
 * Created by sergiiivanchenko on 21/11/2016.
 */
// Functions:
// checkForecastValidity('city') - check forecast valididty in local db
// checkCityForecast ('city') - check forecast existance for 'city' in local db. Callback (err, isForecast, result)
// updateCityForecast ('city') - update forecast for chosen city
// getCityFullForecast ('city') - call checkCityForecast and callback (err, Forecast)  forecast for the city in JSON
// getDaylyForecast ('city')  - call  getCityFullForecast and callback (err, daylyForecast) weekly forecast for the
//
// city in JSON updateAllForecasts () - update forecast for all USED city transformXMLtoLocalJSON (reqBody) - parse XML
// from Yr.no and transform it to JSON

"use strict";

var assert = require ('assert');
var request = require ('request');
var connectDB = require ('./mongoConnect');
var dboper = require ('./dbOperations');
var parseString = require ('xml2js').parseString;


var startModule = Date.now ();

var checkCityForecast = function (geobaseId, callback) {
    connectDB.db (function (err, db) {
        assert.equal (err, null);

        var requestString = '{"location.location.@.geobaseid" : "' + geobaseId + '"}';
        // // console.log ("Request string: " + requestString);

        dboper.findDocumentsByQuerry (db, JSON.parse (requestString), "forecasts", function (result) {
            err = null;
            // // // console.log(" Number of objs found:");
            // // // console.log(result.length);
            if (result.length == 0) {
                callback (err, false, null);
            } else if (result.length == 1) {
                callback (err, true, result);
            } else {
                err = " Forecast for more then one city found";
                callback (err, null, null);
            }

            db.close ();

        });
    });
};

var checkForecastValidity = function (geobaseId, callback) {
    connectDB.db (function (err, db) {
        assert.equal (err, null);

        var requestString = '{"location.location.@.geobaseid" : "' + geobaseId + '"}';
        // console.log ("Request string: " + requestString);

        dboper.findDocumentsByQuerry (db, JSON.parse (requestString), "forecasts", function (result) {
            err = null;
            // // console.log(" Number of objs found:");
            // // console.log(result.length);
            // // console.log(Date.parse (result[0].meta.nextupdate));

            var isForecastValid = Date.parse (result[0].meta.nextupdate) - Date.now ();

            // console.log ("is forecast valide (compare ms ):" + isForecastValid);

            if (isForecastValid <= 0) {
                callback (err, false);
            } else if (isForecastValid >= 1) {
                callback (err, true)
            }
            else {
                err = "No timestamp available";
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
        // console.log ("Request string: " + requestString);
        //
        // var startSearchXMLlink = Date.now ();

        dboper.findDocumentsByQuerry (db, JSON.parse (requestString), "geonames", function (result) {
            // var err = null;

            var xmlURLToUpdate = result[0]["Lenke til engelsk-XML"];
            // // console.log (xmlURLToUpdate);

            // console.log ("Search for XML link for requested city (ms):" + (Date.now () - startSearchXMLlink));


            // var startRequestForecast = Date.now ();

            request ({
                url: xmlURLToUpdate, //URL to hit
                method: 'GET'

            }, function (error, response, body) {
                if (error) {
                    // console.log (error);
                } else {

                    // // console.log(body);
                    // console.log ("Forecast request time (ms)" + (Date.now () - startRequestForecast));

                    // var startParseString = Date.now ();
                    parseString (body, {trim: true, explicitArray: false, attrkey: '@'}, function (err, parsedJSON) {
                        assert.equal (err, null);


                        // console.log ("Time to parse XML to JSON (ms):" + (Date.now () - startParseString));


                        connectDB.db (function (err, db2) {
                            assert.equal (err, null);
                            // // console.log (reqBody.weatherdata);
                            var requestStringToForecastsColl = '{"location.location.@.geobaseid" : "' + geobaseId + '"}';

                            dboper.updateDocument (db2, JSON.parse (requestStringToForecastsColl), parsedJSON.weatherdata, "forecasts", function (err, result2) {
                                assert.equal (err, null);

                                // console.log ("New doc inserted: " + result2.upsertedCount);
                                // console.log ("Doc matched to updated: " + result2.matchedCount);
                                // console.log ("Doc updated: " + result2.modifiedCount);

                                var forecastData = [];
                                forecastData.push (parsedJSON.weatherdata);

                                callback (err, forecastData);

                                db2.close ();

                            });


                            // dboper.insertDocument (db2, parsedJSON.weatherdata, "forecasts", function (result) {
                            //     // // console.log (result.ops);
                            //
                            //     // console.log(result.upsertedCount);
                            //
                            //     callback (true);
                            //
                            //     db2.close ();
                            //
                            // });


                        });

                    });


                }
                db.close ();

            });


        });
    });
};


var getCityFullForecast = function (geobaseId, callback) {

    checkCityForecast (geobaseId, function (err, isForecast, result) {
        assert.equal (err, null);

        if (isForecast) {
            // console.log ("We get forecast for city " + geobaseId);
            // // console.log (result);
            // console.log ('Lets check if it valid');
            checkForecastValidity (geobaseId, function (err, result2) {
                assert.equal (err, null);

                if (result2) {
                    // console.log ('Forecast Valid! HURA');
                    var CityFullForecast = result[0];
                    callback (err, CityFullForecast);
                } else {
                    // console.log ('Forecast should be updated');
                    // callback (err, false, null);
                    updateCityForecast (geobaseId, function (err, result3) {
                        assert.equal (err, null);

                        // console.log ('Forecast was updated and now it is Valid! HURA');
                        var CityFullForecast = result3[0];
                        callback (err, CityFullForecast);

                    });

                }

            });

        } else {
            // console.log ("There is NO forecast for city " + geobaseId);
            // console.log ("Try to get it for You");
            updateCityForecast (geobaseId, function (err, result3) {
                assert.equal (err, null);

                // console.log ('Forecast was updated and now it is Valid! HURA');
                callback (err, result3);

            });
        }


    });


};

var getDaylyForecast = function (geobaseId, userTimezoneUtcoffsetMinutes, callback) {

        getCityFullForecast (geobaseId, function (err, cityCurrentForecast) {
            assert.equal (err, null);

            // var cityCurrentForecast = cityFullForecast

            delete cityCurrentForecast._id;
            delete cityCurrentForecast.location.location;
            delete cityCurrentForecast.location.type;
            delete cityCurrentForecast.location.country;

            delete cityCurrentForecast.credit;
            delete cityCurrentForecast.links;
            // delete result[0].meta;

            var currentDate = new Date ();
            var forecastDate;

            // get forecast for current time;

            for (var n = 0; n < cityCurrentForecast.forecast.tabular.time.length; n++) {

                forecastDate = new Date (cityCurrentForecast.forecast.tabular.time[n]['@'].to);

                if (currentDate < forecastDate) {
                    // console.log ("This is forecast for current time");
                    // console.log (cityCurrentForecast.forecast.tabular.time[n]['@'].to);
                    // console.log (n);
                    // console.log (cityCurrentForecast.forecast.tabular.time.length);
                    // console.log (cityCurrentForecast.forecast.tabular.time.length - (n + 1));

                    cityCurrentForecast.forecast.tabular.time.splice (0, n);
                    cityCurrentForecast.forecast.tabular.time.splice (1, cityCurrentForecast.forecast.tabular.time.length - 1);
                    break;
                }

// console.log ("This is NOT forecast for current time");
// console.log (cityCurrentForecast.forecast.tabular.time[n]['@'].to);
// console.log (currentDate - forecastDate);
            }


// convert properties time from Server's to User's taking timezone gap
// var serverTimezoneUtcoffsetMinutes = cityFullForecast.location.timezone['@'].utcoffsetMinutes;
// var offsetMinutesGapUserServer = (serverTimezoneUtcoffsetMinutes) - userTimezoneUtcoffsetMinutes;
// // console.log("offsetTimeGapUserServer= " + offsetMinutesGapUserServer);
// var sunRiseDate = new Date(cityFullForecast.sun['@'].rise);
// var sunSetDate =  new Date(cityFullForecast.sun['@'].set);
// sunRiseDate.setHours(sunRiseDate.getHours() - offsetMinutesGapUserServer/60);
// sunSetDate.setHours(sunSetDate.getHours() - offsetMinutesGapUserServer/60);
// cityFullForecast.sun['@'].rise = sunRiseDate.toUTCString();
// cityFullForecast.sun['@'].set = sunSetDate.toUTCString();

            callback (err, cityCurrentForecast);


        })
        ;
    }
    ;


module.exports = {
    getDaylyForecast: getDaylyForecast,
    getCityFullForecast: getCityFullForecast,
    updateCityForecast: updateCityForecast,
    checkForecastValidity: checkForecastValidity,
    checkCityForecast: checkCityForecast
};
//==================
// getDaylyForecast ("2988507", 60, function (err, ciryDaylyForecast) {
//     assert.equal (err, null);
//
//     // console.log (ciryDaylyForecast);
//     // console.log ("Module execution time (ms): " + (
//             Date.now () - startModule
//         ));
//
//
// });


//
// updateCityForecast ("703448", function (result) {
//     // if (err != null) throw err;
//
//     // console.log ( result);
//     // console.log ("Module execution time (ms): " + (
//             Date.now () - startModule
//         ));
// });

// checkForecastValidity ("703448", function (err, result) {
//     if (err != null) throw err;
//
//     // console.log ( result);
//     // console.log ("Module execution time (ms): " + (
//             Date.now () - startModule
//         ));
//
// });

// updateCityForecast("618542",function (result) {
//     // assert.equal(err, null);
//     // assert.equal(result, true, "City found");
//     // assert.equal(result, false, "City NOT found");
//
//     // console.log(result);
//
//
// });