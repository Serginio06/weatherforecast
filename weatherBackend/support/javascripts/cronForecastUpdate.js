/**
 * Created by sergiiivanchenko on 25/11/2016.
 */

var assert = require ('assert');
var connectDB = require ('./mongoConnect');
var dboper = require ('./dbOperations');
var forecastOper = require ('./forecastOperations');

var getUsersCities = function (callback) {

    connectDB.db (function (err, db) {

        db.collection ('usersCity').distinct ("geobaseId", function (err, docs) {
            assert.equal (err, null);

            callback (err, docs);
            db.close ();

        });

    });

};

var updateUsersCityForecasts = function (n, arrayCitiesGeonameid, callback) {

    if (n < arrayCitiesGeonameid.length) {
        console.log ("n=" + n + " from " + arrayCitiesGeonameid.length);
        forecastOper.getCityFullForecast (arrayCitiesGeonameid[n], -1, 1, function (err, CityFullForecast) {

            // console.log ("User's city forecasts have been updated. Geonameid= " + arrayCitiesGeonameid[n]);
            updateUsersCityForecasts (n + 1, arrayCitiesGeonameid, function (err, result) {

            });
        });
    } else {
        console.log ("All users forecasts have been updated");
        callback (null, true);

    }


};

module.exports = {
    getUsersCities: getUsersCities,
    updateUsersCityForecasts: updateUsersCityForecasts

};

// ======================================

getUsersCities (function (err, docs) {

    var n = 0;

    updateUsersCityForecasts (n, docs, function (err, result) {
        assert.equal (err, null);

        console.log (result);

    });


});