"use strict";
var fs = require ('fs');

var yrGeonameTxtfilePath = '../txt/Verda.txt';
var assert = require ('assert');

var request = require ('request');
var connectDB = require ('./mongoConnect');
var dboper = require ('./dbOperations');

var startModule = Date.now ();
// console.log("Start time: " + startModule);


// var openFileToParse = function (filePath) {
//
//
// fs.open(filePath, 'r', function(err, fd) {
//     fs.fstat(fd, function(err, stats) {
//         var bufferSize=stats.size,
//             chunkSize=128;
//             // const buffer = new Buffer(128),
//             const buffer = Buffer.alloc(stats.size );
//             var bytesRead = 0;
//             // console.log('File cration time = ' + stats.ctime);
//
//         // console.log('buffer before initializing= '+ buffer);
//
//         var startReadingFile = Date.now();
//
//         while (bytesRead < bufferSize) {
//             if ((bytesRead + chunkSize) > bufferSize) {
//                 chunkSize = (bufferSize - bytesRead);
//             }
//             fs.read(fd, buffer, bytesRead, chunkSize, bytesRead);
//             bytesRead += chunkSize;
//             // console.log(buffer.toString('utf8', 0, bufferSize));
//             // console.log('\n\r');
//
//         }
//
//         console.log("Reading time (ms): " + (Date.now() - startReadingFile));
//
//         // console.log(buffer.toString('utf8', 0, bufferSize));
//         parsYrTxtGeonameFiletoJSON (buffer.toString('utf8', 0, bufferSize), function (err, JSONobj ) {
//             if (err) throw err;
//
//             return JSONobj;
//
//             console.log("Jsonobj inside callback " + JSONobj.geonames[6]);
//             fs.close(fd);
//
//         } );
//         console.log("Elapsed time (ms): " + (Date.now() - startModule));
//         // var duration = new Date().getTime() - startModule;
//         // console.log("Elapsed time 2 (ms): " + duration);
//
//
//
//     });
// });
//
// };


var parsYrTxtGeonameFiletoJSON = function (fileBuffer, callback) {
    var startParsing = Date.now ();

    var rowsGeonameForecast, keysForJson, parsedGeonameRow = [];
    var objString = '';
    var JSONobj;
    // console.log("this is SOURCE FILE TO BE PARSED: " + fileBuffer);

    rowsGeonameForecast = fileBuffer.split ('\r');
    keysForJson = rowsGeonameForecast[0].split ('\t');


    console.log ('\n\r');
    var startCreateStringObj = Date.now ();
    var counter2 = 0;
    objString = objString + '{ "geonames" :[';
    //
    for (var n = 1; n < rowsGeonameForecast.length; n++) {
        parsedGeonameRow = rowsGeonameForecast[n].split ('\t');
        objString = objString + '{"';
        for (var m = 0; m < parsedGeonameRow.length; m++) {
            objString = objString + keysForJson[m].trim () + '":"' + parsedGeonameRow[m].trim () + '","';
            counter2++;
        }

        objString = objString.slice (0, -2) + '},';
    }

    
    objString = objString.slice (0, -1) + (
            ']}'
        );
    // objString = objString.slice(0, -1) + '£';
    console.log(counter2 + " Elements of array was processed to create JSON obj");
    console.log ("Creating StingObj (ms): " + (
            Date.now () - startCreateStringObj
        ));

    var startParsingStringObj = Date.now ();
    JSONobj = JSON.parse (objString);
    console.log ("Parsing StingObj (ms): " + (
            Date.now () - startParsingStringObj
        ));

    console.log ("number of objects in array - " + JSONobj.geonames.length);
    // console.log("Object number 6 - ");
    // console.log(JSONobj.geonames[6]);

    var err = null;


    if (keysForJson[0] != 'Landskode') {
        err = "Parsing of txt file failed. Please check source data";
        JSONobj = null;
    }

    console.log ("Parsing time (ms): " + (
            Date.now () - startParsing
        ));
    callback (err, JSONobj)
};

var openFileToParse2 = function (filePath) {

    var collection = "geonames";
    fs.readFile (filePath, (err, data) => {
        if (err) throw err;

        console.log ('\r');


        parsYrTxtGeonameFiletoJSON (data.toString ('utf8'), function (err, JSONobj) {
            if (err) throw err;

            //

            insertJSONobjToMongo (JSONobj, collection, function (resultOfInsert) {


            })


        });


        console.log ("Elapsed time (ms): " + (
                Date.now () - startModule
            ));
    });


};


var insertJSONobjToMongo;
insertJSONobjToMongo = function (JSONobj, collection, callback) {
    var key = 'Geonames-ID';
    var indexes = {"Geonames-ID": 1};
    var startinsertJSONobjToMongo = Date.now ();


    connectDB.db (function (err, db) {
        assert.equal (err, null);
        // db.geonames.drop();

        // console.log("Jsonobj inside callback \r");console.log(  JSONobj.geonames[6]);

        dboper.dropCollection (db, collection, function (dropResult) {
            assert.equal (err, null);

            // console.log(JSONobj.geonames);
            dboper.insertDocuments (db, JSONobj.geonames, collection, indexes, function (result) {

                console.log ("Inserted " + result.result.n + " documents into the document collection "
                    + collection);


                // var dbquerry = JSON.parse('{"Geonames-ID": { $in: ["3038832"]}}');

                var startRemoveDuplicates = Date.now ();
                dboper.removeGeonamesDuplicates (db, key, collection, function (docs) {

                    console.log (docs);
                    console.log ("Remove Duplicates (ms): " + (
                            Date.now () - startRemoveDuplicates
                        ));
                    callback (result);
                    db.close ();


                });


                console.log ("Inserting obj to MongoDB (ms): " + (
                        Date.now () - startinsertJSONobjToMongo
                    ));
                // callback(result);
                // db.close();
            });
            // console.log(resultOfCollectionDrop);

            console.log (dropResult);

        });


    });
};


// ==================== FUNCTIONS DESCRIPTION ===================


openFileToParse2 (yrGeonameTxtfilePath);






