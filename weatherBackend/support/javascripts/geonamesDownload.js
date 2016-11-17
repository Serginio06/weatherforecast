var request = require('request');
var connectDB = require('./mongoConnect');
var dboper = require('./dbOperations');



//Lets configure and request
request({
    url: 'http://api.geonames.org/searchJSON?name=london&maxRows=10&featureClass=P&username=Serginio06', //URL to hit
    method: 'GET'

}, function(error, response, body){
    if(error) {
        console.log(error);
    } else {
        var x=5;
        connectDB.db(function (db) {

            dboper.insertDocument(db, JSON.parse(body),"geonames",function (result) {
                console.log(result);
            });



            db.close();
        })


    }
});