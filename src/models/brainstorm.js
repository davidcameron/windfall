var mongo = require('mongoskin');
var Q = require("q");

var db = mongo.db('localhost/windfall', {safe: false});
db.collection('record').ensureIndex([['name', 1]], true);
db.bind('record');

var inputMap =
{
    'Text': 'text',
    'HTML': 'textarea',
    'Boolean': 'checkbox',
    'Author': 'text',
    'Slug': 'text'
};


// Promise wrapper for Mongo find
function find(record) {
    if (typeof record.name === 'undefined') {
        recordName = record;
    } else {
        recordName = record.name;
    }
    var defer = Q.defer();
    
    (function (defer, recordName) {

        db.record.find({'name': recordName}).toArray(function (error, response) {
            if (response.length === 0 || error) {
                defer.reject();
            } else {
                defer.resolve(response[0]);
            }
        });

    })(defer, recordName);

    return defer.promise;
}


// Inherits defaults and structure up the chain recursively
// Adds inherited structure in inherited : {structure: {}}
function populate (record, defer) {
    // Setup in the first populate call
    if (typeof defer === 'undefined') {
        defer = Q.defer();
        record.inherited = {};
        record.inherited.structure = {};
        record.inherited.data = {};
        record.inherited.archetype = record.archetype;
        if(typeof record.structure === 'undefined') {
            record.structure = {};
        }
    }

    if (typeof record.inherited.archetype === 'undefined') {
        // Inheritance chain ends when there's no archetype
        defer.resolve(record);
    } else {
        // Closure to send deferred and record to inherit
        (function (defer, record) {
            return find(record.inherited.archetype).then(function (newRecord) {
                record = inherit(record, newRecord);
                // No record w/ the name of the archetype
                if (!record) {
                    defer.reject('Faild Inherit');
                    return;
                }
                return (function (defer) {
                    // recurse
                    populate (record, defer);
                })(defer);
            });
        })(defer, record);
    }

    return defer.promise;
}

function inherit (record, parent) {
    for (var x in parent.structure) {
        if (parent.structure[x].required && typeof record.data[x] === 'undefined') {
            return false;
        }
        if (parent.structure[x].defaultValue && typeof record.data[x] === 'undefined') {
            record.inherited.data[x] = parent.structure[x].defaultValue;
        }
        if (typeof record.structure[x] === 'undefined') {
            record.inherited.structure[x] = parent.structure[x];
        }

    }

    for (var y in parent.data) {
        if(typeof record.data[y] === 'undefined') {
            record.inherited.data[y] = parent.data[y];
        }
    }

    record.inherited.archetype = parent.archetype;

    return record;
}

function insert (record) {
    var defer = Q.defer();

    (function (defer, record) {
        return db.record.insert(record, function () {
            defer.resolve(record);
        });
    })(defer, record);
    
    return defer.promise;
}

var validPost =
{
    name: 'new-test-post',
    archetype: 'post',
    data: {
        title: 'Hello World2',
        body: '<p>Hello, this is my first post!</p>'
    }
};

function create (record) {

    find(record)
    //  First function gets called on success, second on fail
    //  Throwing an error in the first function sets up the error pipe
    //  And returning w/o throwing keeps going on the success pipe
    .then(function () {
        throw new Error("Already exists!");
    }, function () {
        return "OK";
    })
    .then(function () {
        return populate(record);
    })
    .then(function (r) {
        console.log(r);
    })
    //.then(insert)
    .fail(function (error) {
        console.log('fail', error);
    });
}

function createFields (record) {
    console.log(record);
    fieldJson = {};

    for (var y in record.inherited.structure) {
        fieldJson[y] = inputMap[record.inherited.structure[y].type];
    }

    for (var x in record.structure) {
        fieldJson[x] = inputMap[record.structure[x].type];
    }
    return JSON.stringify(fieldJson);
}

function fieldsFor (record) {
    var defer = Q.defer();

    populate(record)
    .then(createFields)
    .then(function (json) {
        defer.resolve(json);
    })
    .fail(function (err) {
        defer.reject(err);
    });

    return defer.promise;
}

find('post')
.then(fieldsFor)
.then(function (r) {
    console.log(r);
});