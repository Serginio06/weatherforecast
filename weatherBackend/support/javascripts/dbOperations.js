var assert = require ('assert');

exports.insertDocument = function (db, document, collection, callback) {
    // Get the documents collection
    // console.log("DB is:" + db);
    // console.log("Document to insert is:" + document);
    var coll = db.collection (collection);
    // console.log(coll);
    // Insert some documents
    coll.insertOne (document, function (err, result) {
        assert.equal (err, null);
        // console.log("Inserted " + result.result.n + " documents into the document collection "
        //     + collection);
        callback (result);
    });
};

exports.insertDocuments = function (db, documentsArray, collection, indexes, callback) {
    // Get the documents collection
    var coll = db.collection (collection);
    // Insert some documents

    // console.log("indexes= " + indexes);
    
    if (indexes != "" ) {
        coll.createIndex (indexes, {dropDups: true});
    }


    coll.insertMany (documentsArray, function (err, result) {
        assert.equal (err, null);
        // console.log();
        // console.log(result.result.n);
        callback (result);
    });
};

exports.findAllDocuments = function (db, collection, callback) {
    // Get the documents collection
    var coll = db.collection (collection);

    // Find some documents
    coll.find ({}).toArray (function (err, docs) {
        assert.equal (err, null);
        callback (docs);
    });
};

exports.findDocumentsByQuerry = function (db, DBquerry, collection, callback) {
    // Get the documents collection
    var coll = db.collection (collection);

    // Find some documents
    coll.find (DBquerry).toArray (function (err, docs) {
        assert.equal (err, null);
        callback (docs);
    });
};

exports.findDocumentsByQuerryWithLimit = function (db, DBquerry, collection, resultLimit, projection, sortOrder,  callback) {
    // Get the documents collection
    var coll = db.collection (collection);

    // Find some documents
    coll.find (DBquerry , projection).limit(resultLimit).sort(sortOrder).toArray (function (err, docs) {
        assert.equal (err, null);

        callback (docs);
    });
};

exports.removeGeonamesDuplicates = function (db, key, collection, callback) {
    // Get the documents collection
    var coll = db.collection (collection);
    var count = 0;

    // console.log(key);


    // Find some documents
    // coll.distinct(key, function(err, docs)
    //noinspection JSCheckFunctionSignatures
    coll.aggregate ([
        {
            $group: {
                "_id": "$" + key,
                "dups": {"$push": "$_id"},
                total: {$sum: 1}
            }
        },
        {
            "$match": {
                "total": {"$gt": 1}
            }

        }

    ]).toArray (function (err, docs) {

        console.log (docs.length + " geoname duplicates found in DB");
        console.log(docs);
        var n = 0;


        var deleteDuplicates = function (n) {

            console.log ("this is beginig of self running function. n= " + n);


            if (n < docs.length) {
                console.log("Removing dupicated obj with _id=" + docs[n].dups);
                // console.log (n + " times RECURSIVE functions were run");
                docs[n].dups.shift();
                coll.removeMany (
                    {
                        "_id": {"$in": docs[n].dups}
                    }

                    , function (err, result) {
                        assert.equal (err, null);

                        // console.log (n + " times callback functions were run");
                        n++;
                        deleteDuplicates (n);


                    });

            } else {
                // console.log ("All Duplicates were removed");
                callback ("Duplicates removed");
                // return n;

            }


        };

        deleteDuplicates (n);


    });


};

exports.removeDocument = function (db, document, collection, callback) {

    // Get the documents collection
    var coll = db.collection (collection);


    // Delete the document
    coll.deleteOne (document, function (err, result) {
        assert.equal (err, null);
        console.log ("Removed the document " + document);
        callback (result);
    });
};

exports.updateDocument = function (db,  searchString, newDocToUpdate, collection, callback) {

    // Get the documents collection
    var coll = db.collection (collection);

    // Update document { upsert: true }
    coll.updateOne (searchString
        , {$set: newDocToUpdate}, { upsert: true }, function (err, result) {
            assert.equal (err, null);

            console.log ("New doc inserted: " + result.upsertedCount);
            console.log ("Doc matched to updated: " + result.matchedCount);
            console.log ("Doc updated: " + result.modifiedCount);

            callback (err, result);
        });

};

exports.dropCollection = function (db, collection, callback) {

    var coll = db.collection (collection);

    coll.find ().toArray (function (err, docs) {
        assert.equal (err, null);


        if (docs.length >= 1) {

            // console.log("COLLECTION " + collection + " was found");

            coll.deleteMany ({}, function (err, result) {
                if (err) throw err;

                console.log (result.result.n + " documens were deleted from collection " + collection);
                callback ("Collectin was successfully DROPPED");
            });


        } else {
            // console.log("Collection was not find any more");
            callback ("Collection was not find any more");

        }

    });


};