/**
 * Created by sergiiivanchenko on 21/11/2016.
 */
// Check time of merge two collections with 50000 documents.
// STR:
// 1. 1. взять первую запись с db_A.tabl_1 и проверить есть ли такая запись в db_A.tabl_2
// 2. Если есть - апдейтим
// 3 если нет - вставляем
// Functions:
// createRecords(numOfReccords, callback) - create records with recursive function
// createMassRecords (numOfReccords, callback) - create records by creating Json array with all documents and insert them at once in DB
//



"use strict";

var assert = require ('assert');
var connectDB = require ('./mongoConnect');
var dboper = require ('./dbOperations');

var createRecords = function (numOfReccords, callback) {
    var startCreateRecords = Date.now();

    connectDB.db(function (err, db) {

        var createRecord = function (counter) {

        var documentJson = {
            guid: counter.toString(),
            name: counter+" Name",
            age: "15",
            // sex: "Male",
            // email: "mail@mail.ru",
            country: "Ukraine",
            city: "Kyiv"

        };
            // JSON.parse("{}");
            // console.log(documentJson.toString());

            if ( counter < numOfReccords ) {
                dboper.insertDocument(db, documentJson, "coll_a", function (result) {

                    // console.log(counter +1 + " record has been created");
                    createRecord(counter +1);

                });


            } else {

                console.log(counter + " record has been created in coll_a");
                callback(true);
                db.close();
                console.log("Time of CreateRecords (ms): " + (Date.now() - startCreateRecords));
            }


        };

        var n = 0;
        createRecord(n);

    });

};

var createMassRecords = function (numOfReccords, callback) {

    var startcreateMassRecords = Date.now();

    connectDB.db(function (err, db) {
       assert.equal(err, null);
        var documentsJson = [];

        for (var n = 0; n < numOfReccords; n++) {
            // console.log("n=" + n);
            documentsJson.push( JSON.parse(' {"guid":"' + n + '", "name":"'+ n + ' name", "age": "15 years", "country": "Ukraine, Kiev", "city": "Kyiv"}'));

        }
        
        // console.log(documentsJson[0]);

        dboper.insertDocuments(db, documentsJson, "coll_a1", "", function (result) {


            // console.log(result.length);
            console.log(n + " record has been created in collection coll_a1");
            callback (true);
            db.close();
            console.log("Time of startcreateMassRecords (ms): " + (Date.now() - startcreateMassRecords));

        } );


    });

};

var mergeCollections = function (coll1, coll2, callback) {


    connectDB.db(function (err, db) {
       assert.equal(err, null);

        var DBquerry = {};

        dboper.findDocumentsByQuerry(db, DBquerry, coll2, function (result) {
            
            console.log("Records found in collection " + coll2);
            console.log(result.length);

            for (var n = 0; n < result.length; n++) {
                // var n=1;

                var docToUpdateQuerry = JSON.parse ('{"guid":"' + result[n].guid + '"}');
                // var docToUpdateQuerry = '{"guid":"'+ result[n].guid + '"}';
                // var docUpdateon = JSON.parse ('{"name":"' + result[n].age + '"}');
                // var docUpdateon = '{"name":"' + result[n].name + '"}';

                // console.log("Obj after remove property");
                // console.log(delete result[1]._id);
                // console.log(result[1]);
                // console.log(docToUpdateQuerry);
                delete result[n]._id;

                dboper.updateDocument (db, docToUpdateQuerry, result[n], coll1, function (result2) {

                    
                    // console.log ("New doc inserted: " + result.upsertedCount);
                    // console.log ("Doc matched to updated: " + result.matchedCount);
                    // console.log ("Doc updated: " + result.modifiedCount);

                    if ( n >= result.length ) {
                        callback (true, db);
                    }

                });
            } //for end



        } );
    });

};

//===========================

var numRecordsTocreate = 50000;

createRecords(numRecordsTocreate/2, function (result) {

    // console.log(result);
    // console.log("Records inserted: ");
    // console.log(result);

    createMassRecords(numRecordsTocreate, function (result) {

        // console.log(result);
        // console.log("Records inserted: ");
        // console.log(result);



    });

});




// var startmergeCollections = Date.now();
// mergeCollections ("coll_a", "coll_a1", function (result2, db) {
//
//
//     console.log(result2);
//
//     db.close();
//     console.log("Time of startmergeCollections (ms): " + (Date.now() - startmergeCollections));
// startmergeCollections was 817250 = 13 min
// });
