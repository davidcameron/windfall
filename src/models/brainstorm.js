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


function find(record) {
    if (typeof record.name === 'undefined') {
        recordName = record;
    } else {
        recordName = record.name;
    }
    //console.log("name:", recordName);
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

function validate (record, defer) {
    if (typeof defer === 'undefined') {
        defer = Q.defer();
    }
    console.log(record);
    if (typeof record.archetype === 'undefined') {
        console.log('isRoot');
        defer.resolve(record);
    } else {
        (function (defer, record) {

            return find(record.archetype).then(function (newRecord) {

                record = inherit(record, newRecord);

                if (!record) {
                    defer.reject('Faild Inherit');
                    return;
                }

                return (function (defer) {
                    validate (record, defer);
                })(defer);
            });
        })(defer, record);
    }

    return defer.promise;
}

function inherit (record, parent) {
    for (var x in parent.structure) {
        if(parent.structure[x].required && typeof record.data[x] === 'undefined') {
            return false;
        }
        if(parent.structure[x].defaultValue && typeof record.data[x] === 'undefined') {
            record.data[x] = parent.structure[x].defaultValue;
        }
    }

    for (var y in parent.data) {
        if(typeof record.data[y] === 'undefined') {
            record.data[y] = parent.data[y];
        }
    }

    record.archetype = parent.archetype;

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
    name: 'hello-world',
    archetype: 'post',
    data: {
        title: 'Hello World',
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
        return validate(record);
    })
    .then(insert)
    .fail(function (error) {
        console.log('fail', error);
    });
}

function fieldsFor (record) {
    find(record);
    //.then()
}

create(validPost);