/**
 * Created by sergiiivanchenko on 21/11/2016.
 */
// Functions:
// checkForecastValidity('city') - check forecast valididty in local db
// checkCityForecast ('city') - check forecast existance for 'city' in local db. Callback (err, isForecast, result)
// updateCityForecast ('city') - update forecast for chosen city
// getCityFullForecast ('city') - call checkCityForecast and callback (err, Forecast)  forecast for the city in JSON
// getDaylyForecast ('city')  - call  getCityFullForecast and callback (err, daylyForecast) weekly forecast for the
// quickCitySearch (requestCityName) - do search for cities in db and give back result as array of object (geonameid,
// name, country)  city in JSON updateAllForecasts () - update forecast for all USED city transformXMLtoLocalJSON
// (reqBody) - parse XML from Yr.no and transform it to JSON

"use strict";

var assert = require ('assert');
var request = require ('request');
var connectDB = require ('./mongoConnect');
var dboper = require ('./dbOperations');
var xml2js = require ('xml2js');
// var options = {
//     valueProcessors: [ xml2js.processors.parseNumbers ]
// };


var startModule = Date.now ();

function parseNumbers(name) {
    if (!isNaN (name)) {
        name = name % 1 === 0 ? parseInt (name, 10) : parseFloat (name);
    }
    return name;
}


var checkCityForecast = function (geobaseId, callback) {

    connectDB.db (function (err, db) {
        assert.equal (err, null);

        var requestString = '{"location.location.@.geobaseid" : ' + geobaseId + '}';
        // // console.log ("Request string: " + requestString);

        dboper.findDocumentsByQuerry (db, JSON.parse (requestString), "forecasts", function (result) {
            err = null;
            console.log (" Number of objs found:");
            console.log (result.length);
            if (result.length == 0) {
                callback (err, false, null);
                db.close ();
            } else if (result.length == 1) {
                callback (err, true, result);
                db.close ();
            } else {
                // err = " Forecast for more then one city found";
                console.log (" Forecast for more then one city found. Removing duplicates");

                var startRemoveDuplicates = Date.now ();
                var key = "location.location.@.geobaseid";
                var collection = "forecasts"
                dboper.removeGeonamesDuplicates (db, key, collection, function (docs) {

                    console.log (docs);
                    console.log ("Remove Duplicates (ms): " + (
                            Date.now () - startRemoveDuplicates
                        ));
                    callback (err, true, result);
                    db.close ();


                });

                // callback (err, null, null);
            }

            // db.close ();

        });
    });
};

var checkForecastValidity = function (geobaseId, callback) {
    connectDB.db (function (err, db) {
        assert.equal (err, null);

        var requestString = '{"location.location.@.geobaseid" : ' + geobaseId + '}';
        console.log ("Request string: " + requestString);

        dboper.findDocumentsByQuerry (db, JSON.parse (requestString), "forecasts", function (result) {
            err = null;
            console.log (" Number of objs found:");
            console.log (result.length);
            console.log (result[0].meta.nextupdate);
            // console.log(Date.parse (result[0].meta.nextupdate));

            if (!result.length) {
                console.log ("Forecasts for this city not found");
                callback (err, false);
                db.close ();
            } else {

                var isForecastValid = Date.parse (result[0].meta.nextupdate) - Date.now ();

                console.log ("is forecast valide (compare ms ):" + isForecastValid);

                if (isForecastValid <= 0) {
                    callback (err, false);
                    db.close ();
                } else if (isForecastValid >= 1) {
                    callback (err, true)
                    db.close ();
                }
                else {
                    err = "No timestamp available";
                    callback (err, null)
                    db.close ();
                }
            }
            // db.close ();

        });
    });
};

var updateCityForecast = function (geobaseId, callback) {


    connectDB.db (function (err, db) {
        assert.equal (err, null);

        var requestString = '{"Geonames-ID" : ' + geobaseId + '}';
        // console.log ("Request string: " + requestString);
        //
        // var startSearchXMLlink = Date.now ();

        dboper.findDocumentsByQuerry (db, JSON.parse (requestString), "geonames", function (result) {
            // var err = null;

            var xmlURLToUpdate = result[0]["Lenke til engelsk-XML"];
            // var xmlURLToUpdate = "http://www.yr.no/place/Armenia/Gegharkunik/Nerk’in_Getashen/forecast.xml";
            xmlURLToUpdate = encodeURI (xmlURLToUpdate);

            console.log ("xmlURLToUpdate: " + xmlURLToUpdate);
            db.close ();

            // console.log ("Search for XML link for requested city (ms):" + (Date.now () - startSearchXMLlink));


            // var startRequestForecast = Date.now ();

            request ({
                url: xmlURLToUpdate, //URL to hit
                method: 'GET'

            }, function (error, response, body) {

                // console.log("body= " + body);
                // console.log("response= " + response);
                // console.log(response);

                if (body.indexOf ("weatherdata") == -1) {
                    callback ("Wrong response. Please try again later", null);
                }

                if (error || body == "") {
                    // throw error;
                    // console.log("YR server error:");
                    callback ("YR server error. Cannot get forecast", null);

                    // console.log (error);
                } else {

                    // console.log("YR server response");
                    // console.log(response);
                    // console.log ("Forecast request time (ms)" + (Date.now () - startRequestForecast));

                    // var startParseString = Date.now ();
                    xml2js.parseString (body, {
                        trim: true,
                        explicitArray: false,
                        attrkey: '@',
                        attrValueProcessors: [parseNumbers]
                    }, function (err, parsedJSON) {
                        assert.equal (err, null);
                        // console.log("ParsedJSON.weatherdata= " + parsedJSON.weatherdata);
                        console.log ("ParsedJSON.wetherdata.location.location.@.geobaseid =");
                        console.log (parsedJSON.weatherdata.location.location['@'].geobaseid);
                        // console.log("Err from parsedJSON= " + err);

                        // console.log ("Time to parse XML to JSON (ms):" + (Date.now () - startParseString));

                        if (typeof (
                                parsedJSON.weatherdata.location.location['@'].geobaseid
                            ) != 'number') {
                            console.log ("Geobaseid is not number after xml parcing. Something goes wrong");
                        }

                        connectDB.db (function (err, db2) {
                            assert.equal (err, null);
                            // // console.log (reqBody.weatherdata);
                            var requestStringToForecastsColl = JSON.parse ('{"location.location.@.geobaseid" : ' + geobaseId + '}');
                            // var requestStringToForecastsColl = JSON.parse ('{location:"{location:{@:{geobaseid" : ' + geobaseId + '}');
                            // var docFiltertoUpdate = {};
                            //     docFiltertoUpdate.location.location['@'].geobaseid = geobaseId;



                            // console.log ("requestStringToForecastsColl= ");
                            // console.log(requestStringToForecastsColl);

                            dboper.updateDocument (db2, requestStringToForecastsColl, parsedJSON.weatherdata, "forecasts", function (err, result2) {
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


            });


        });
    });
};


var getCityFullForecast = function (geobaseId, userTimezoneUtcoffsetMinutes, userID, callback) {

    checkCityForecast (geobaseId, function (err, isForecast, result) {
        assert.equal (err, null);

        if (isForecast) {
            console.log ("We get forecast for city " + geobaseId);
            // console.log (result);
            console.log ('Lets check if it valid');
            checkForecastValidity (geobaseId, function (err, result2) {
                assert.equal (err, null);

                if (result2) {
                    console.log ('Forecast available and Valid! HURA');

                    var CityFullForecast = result[0];
                    // updateUsersCityCollection (geobaseId, userTimezoneUtcoffsetMinutes, userID);
                    callback (err, CityFullForecast);
                } else {
                    console.log ('Forecast should be updated');
                    // callback (err, false, null);
                    updateCityForecast (geobaseId, function (err, result3) {
                        assert.equal (err, null);

                        console.log ('Forecast was updated and now it is Valid! HURA');
                        // updateUsersCityCollection (geobaseId, userTimezoneUtcoffsetMinutes, userID);
                        var CityFullForecast = result3[0];
                        callback (err, CityFullForecast);

                    });

                }

            });

        } else {
            console.log ("There is NO forecast for city " + geobaseId);
            console.log ("Try to get it for You");
            updateCityForecast (geobaseId, function (err, result3) {
                assert.equal (err, null);

                console.log ('Forecast was updated and now it is Valid! HURA');
                // updateUsersCityCollection (geobaseId, userTimezoneUtcoffsetMinutes, userID);
                callback (err, result3);

            });
        }


    });


};

var getDaylyForecast = function (geobaseId, userTimezoneUtcoffsetMinutes, userID, callback) {


    getCityFullForecast (geobaseId, userTimezoneUtcoffsetMinutes, userID, function (err, cityCurrentForecast) {
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
        // currentDate.setHours(currentDate.getHours() + (currentDate.getTimezoneOffset()/60));

        // get forecast for current time;

        for (var n = 0; n < cityCurrentForecast.forecast.tabular.time.length; n++) {

            forecastDate = new Date (cityCurrentForecast.forecast.tabular.time[n]['@'].to);
            // console.log("Current date");
            // console.log(currentDate);
            // console.log("Forecast date");
            // console.log(forecastDate);

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


        // updateUsersCityCollection (geobaseId, userTimezoneUtcoffsetMinutes, userID);

        callback (err, cityCurrentForecast);


    });
};


var quickCitySearch = function (rqstCityName, callback) {
    var limitCitiesInResponse = 5;
    var searchRequest = eval ('(' + '{"Stadnamn engelsk":/^' + rqstCityName + '.*/}' + ')');
    var searchProjection = {"Stadnamn engelsk": 1, "Landsnamn engelsk": 1, "Geonames-ID": 1, "Folketal": 1};
    var sortOrder = {"Folketal": -1};
    // var searchProjection = { projection: {b:1}, sort: {a:1} }
    // var searchProjection = { "projection": {"Stadnamn engelsk":1,"Landsnamn engelsk":1, "Geonames-ID":1 } }

    connectDB.db (function (err, db) {
        assert.equal (err, null);

        // console.log("Projections string:");
        // console.log(searchProjection);

        dboper.findDocumentsByQuerryWithLimit (db, searchRequest, 'geonames', limitCitiesInResponse, searchProjection, sortOrder, function (docs) {

            // console.log(docs);
            callback (err, docs);
            db.close ();
        });
    });

};

var updateUsersCityCollection = function (geobaseId, userTimezoneUtcoffsetMinutes, userID) {
    var usersCity = eval ('(' + '{"geobaseId":' + geobaseId + ', "userID":' + userID + '}' + ')');
    var usersCityCollection = "usersCity";
    var searchQuerry = eval ('(' + '{"geobaseId":' + geobaseId + ', "userID":' + userID + '}' + ')');

    connectDB.db (function (err, db) {
        assert.equal (err, null);
        
        console.log("Updating user - City collection");
        dboper.updateDocument (db, searchQuerry, usersCity, usersCityCollection, function (err, result4) {

            // console.log ( result4);
            db.close();
        });
    });
};

module.exports = {
    getDaylyForecast: getDaylyForecast,
    getCityFullForecast: getCityFullForecast,
    updateCityForecast: updateCityForecast,
    checkForecastValidity: checkForecastValidity,
    checkCityForecast: checkCityForecast,
    quickCitySearch: quickCitySearch
};
//==================

// getCityFullForecast (703448, 1, 1, function (err, CityFullForecast) {
//
//     console.log ("User's city forecasts have been updated");
//     // console.log("END of check);
//
// });


// var start_quickCitySearch = Date.now();
// quickCitySearch('Kyi', function (err, docs) {
//
//     console.log("start_quickCitySearch (ms) =" + (Date.now() - start_quickCitySearch));
//     console.log("Found some cities");
// });

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
