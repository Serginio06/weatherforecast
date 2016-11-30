        // var dboper = require('../support/javascripts/dbOperations');
        var assert = require('assert');
        // var connectDB = require('../support/javascripts/mongoConnect');
        var forecastOper = require('../support/javascripts/forecastOperations');

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
        // router.route ('/:geobaseId/:timezone')



        router.route ('/:geobaseId/:timezoneUtcoffsetMinutes/:isCurrentForecast/:userID')

            .get(function (req, res) {
                // console.log('Console body to GET is ');
                console.log(req.params);


                // check if it is request for current forecast (isCurrentForecast=1) or week forecast (isCurrentForecast=0)
                if ( +req.params.isCurrentForecast ) {
                    console.log("Forecast for current time");
                    forecastOper.getDaylyForecast(req.params.geobaseId, req.params.timezoneUtcoffsetMinutes, req.params.userID, function (err, cityDaylyForecast) {
                        // asser.equal(err, null);

                        res.send(cityDaylyForecast);
                    });
                } else {
                    console.log("Forecast for week");
                    forecastOper.getCityFullForecast(req.params.geobaseId, req.params.timezoneUtcoffsetMinutes, req.params.userID,function (err, cityFullForecast) {
                        // asser.equal(err, null);

                        res.send(cityFullForecast);
                    });
                }


                // res.send(req.params);

            });



            // .post(function (req, res) {
            // console.log("console body to POST is ");
            //
            //     //
            //
            //     connectDB.db(function(db){
            //
            //
            //         dboper.insertDocument(db, transformXMLtoLocalJSON(req.body),
            //             "forecasts", function (result) {
            //                 console.log(result.ops);
            //
            //                 // dboper.findDocumentsByQuerry(db, "dishes", function (docs) {
            //                     // console.log(docs);
            //
            //                     db.close();
            //                 });
            //             // });
            //     });
        //         res.send(transformXMLtoLocalJSON(req.body));
        // });


        module.exports = router;