var mongo = require('mongoskin'),
    Q = require("q"),
    db = mongo.db('localhost/windfall', {safe: false});
//    read = require('read');

db.collection('record').ensureIndex([['name', 1]], true);
db.bind('record');

function insert (record) {
    console.log(record);
    var defer = Q.defer();

    (function (defer, record) {
        return db.record.insert(record, function () {
            defer.resolve(record);
        });
    })(defer, record);
    
    return defer.promise;
}

function create (record) {

    read.find(record)
    //  First function gets called on success, second on fail
    //  Throwing an error in the first function sets up the error pipe
    //  And returning w/o throwing keeps going on the success pipe
    .then(function () {
        throw new Error("Already exists!");
    }, function () {
        return "OK";
    })
    .then(function () {insert(record);})
    .fail(function (error) {
        console.log(error);
    });
}

module.exports.create = create;

// Tests
var root =
{
    name: 'root',
    structure: {
        display: {
            type: 'Boolean',
            defaultValue: true
        }
    }
};
var read = {};
read.find = function (record) {
    var deferred = Q.defer();
    deferred.reject();
    return deferred.promise;

};
create (root);