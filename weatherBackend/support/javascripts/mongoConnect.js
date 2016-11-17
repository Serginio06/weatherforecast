var MongoClient = require('mongodb').MongoClient,
    assert = require('assert');

// var dboper = require('./dbOperations');

// Connection URL
var url = 'mongodb://localhost:27017/testWeatherDB';

//==============================================
exports.db = function (callback) {

    // Use connect method to connect to the Server
    MongoClient.connect(url, function (err, db) {
        assert.equal(null, err);
        console.log("Connected correctly to server ");
        callback(err, db);

    });
};

// Use connect method to connect to the Server
// MongoClient.connect(url, function (err, db) {
//     assert.equal(null, err);
//     console.log("Connected correctly to server");

    // dboper.insertDocument(db, { name: "Vadonut", description: "Test" },
    //     "dishes", function (result) {
    //         console.log(result.ops);
    //
    //         dboper.findDocumentsByQuerry(db, "dishes", function (docs) {
    //             console.log(docs);
    //
    //             dboper.updateDocument(db, { name: "Vadonut" },
    //                 { description: "Updated Test" },
    //                 "dishes", function (result) {
    //                     console.log(result.result);
    //
    //                     dboper.findDocumentsByQuerry(db, "dishes", function (docs) {
    //                         console.log(docs)
    //
    //                         db.dropCollection("dishes", function (result) {
    //                             console.log(result);
    //
    //                             db.close();
    //                         });
    //                     });
    //                 });
    //         });
    //     });

// });

// module.exports = MongoClient;

