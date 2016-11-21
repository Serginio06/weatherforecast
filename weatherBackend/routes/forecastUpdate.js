        var dboper = require('../scripts/dbOperations');
        var assert = require('assert');
        var connectDB = require('../javascripts/mongoConnect');

        var express = require('express');
        var router = express.Router();

        // var transformXMLtoLocalJSON = function (reqBody) {
        //     var localForecast;
        //     var dailyForecast = [];
        //
        //     for (var n = 0; n < reqBody.weatherdata.forecast.tabular.time.length; n++) {
        //
        //         dailyForecast.push({
        //             timeFrom: reqBody.weatherdata.forecast.tabular.time[n].$.from,
        //             timeTo: reqBody.weatherdata.forecast.tabular.time[n].$.to,
        //             timePeriod: reqBody.weatherdata.forecast.tabular.time[n].$.period,
        //             symbolName: reqBody.weatherdata.forecast.tabular.time[n].symbol.$.name,
        //             symbolnumberEx: reqBody.weatherdata.forecast.tabular.time[n].symbol.$.numberEx,
        //             precipitationValue: reqBody.weatherdata.forecast.tabular.time[n].precipitation.$.value,
        //             windDirectionCode: reqBody.weatherdata.forecast.tabular.time[n].windDirection.$.code,
        //             windSpeedName: reqBody.weatherdata.forecast.tabular.time[n].windSpeed.$.name,
        //             windSpeedMPS: reqBody.weatherdata.forecast.tabular.time[n].windSpeed.$.mps,
        //             temperatureUnit: reqBody.weatherdata.forecast.tabular.time[n].temperature.$.unit,
        //             temperatureValue: reqBody.weatherdata.forecast.tabular.time[n].temperature.$.value,
        //             pressureUnit: reqBody.weatherdata.forecast.tabular.time[n].pressure.$.unit,
        //             pressureValue: reqBody.weatherdata.forecast.tabular.time[n].pressure.$.value
        //         }
        //     );
        //
        //     }
        //
        //     localForecast = {
        //         location: {
        //             "Geonames-ID": reqBody.weatherdata.location.location.$.geobaseid,
        //             name: reqBody.weatherdata.location.name,
        //             type: reqBody.weatherdata.location.type,
        //             country: reqBody.weatherdata.location.country,
        //             timezoneUtcoffsetMinutes: reqBody.weatherdata.location.timezone.$.utcoffsetMinutes
        //         },
        //         credit: {
        //             link_text: reqBody.weatherdata.credit.link.$.text,
        //             link_url: reqBody.weatherdata.credit.link.$.url
        //         },
        //         meta: {
        //             lastupdate: reqBody.weatherdata.meta.lastupdate,
        //             nextupdate: reqBody.weatherdata.meta.nextupdate
        //         },
        //         sun: {
        //             rise: reqBody.weatherdata.sun.$.rise,
        //             set: reqBody.weatherdata.sun.$.set
        //         },
        //         forecast:dailyForecast
        //
        //
        //     };
        //
        //     return localForecast;
        //
        // };

        /* Post forecast from req body. */
        router.route ('/')
            .get(function (req, res) {
                console.log('Condole body to GET is ' + req.body);
                res.writeHead(200, { 'Content-Type': 'text/plain' });
                res.write ('This is second line of body of GET response. ');
                res.end('In fact, it was GET request to forecastUpdate');
                // res.send(req.body);
            })
            .post(function (req, res) {
            console.log("console body to POST is ");

                //

                connectDB.db(function(db){


                    dboper.insertDocument(db, transformXMLtoLocalJSON(req.body),
                        "forecasts", function (result) {
                            console.log(result.ops);

                            // dboper.findDocumentsByQuerry(db, "dishes", function (docs) {
                                // console.log(docs);

                                db.close();
                            });
                        // });
                });




                res.send(transformXMLtoLocalJSON(req.body));
        });


        module.exports = router;