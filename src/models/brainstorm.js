var mongo = require('mongoskin');
var Q = require("q");

var db = mongo.db('localhost/windfall', {safe: false});
db.collection('record').ensureIndex([['name', 1]], true);
db.bind('record');

// Map data types with inputs for creating / editing records
var inputMap =
{
    'Text': 'text',
    'Markdown': 'textarea',
    'Boolean': 'checkbox',
    'Author': 'text',
    'Slug': 'text'
};


// Promise wrapper for Mongo find
function find (query) {
    if (typeof query === 'string') {
        query = {name: query}; // Lets you just pass find the name
    }
    
    var defer = Q.defer();
    
    (function (defer, query) {

        db.record.find(query).toArray(function (error, response) {
            if (response.length === 0 || error) {
                defer.reject();
            } else {
                defer.resolve(response);
            }
        });

    })(defer, query);

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
                    defer.reject('Failed Inherit');
                    return;
                }
                return (function (defer) {
                    // recurse
                    populate(record, defer);
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

// Adds child records to a parent record
// Whole thing gets returned and looks like one record
function populateChildren (record, childrenKey) {
    record = record[0].data; // Need to make find not return array when find by name
    var defer = Q.defer();

    // Going to run find once for each child
    // Each function call returns a promise
    promiseList = [];

    var children = record[childrenKey].members;

    for(var index in children) {
        var promise = find(children[index].name);
        promiseList.push(promise);
    }

    Q.allResolved(promiseList).then(function (children) {

        if(typeof record.children === 'undefined') {
            record.children = {};
        }

        // Add a 'children' subdoc to record

        record.children[childrenKey] = {};

        // Has its own subdoc, the same as the original key
        var childBucket = record.children[childrenKey];

        // This is the Override All object
        // Overrides every child
        var override = record[childrenKey].override;

        // Children here are promises, either resolved or rejected
        for (var index in children) {
            var child = children[index];

            // This gets us the resolved promise value
            var childData = child.valueOf()[0];
            
            // Filter out rejected promises (not found)
            if(typeof childData !== "undefined") {

                // Deal with default override for all children
                for(var overrideKey in override) {
                    childData.data[overrideKey] = override[overrideKey];
                }

                // Override for specific child
                if (record[childrenKey].members[index].override) {
                    var specificOverride = record[childrenKey].members[index].override;

                    for (var specificOverrideKey in specificOverride) {
                        childData.data[specificOverrideKey] = specificOverride[specificOverrideKey];
                    }
                }
                
                childBucket[childData.name] = childData;
            }
        }
        defer.resolve(record);
    });
}

function create (record) {
    var defer = Q.defer();
    find(record.name)
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
    .then(insert)
    .then(function () {
        defer.resolve();
    })
    .fail(function (error) {
        defer.resolve();
    });

    return defer.promise;
}

function createFields (record) {
    record = record[0];
    var fields = [];

    var order = record.structure._order;
    var length = order.length;

    var structure = record.structure;
    var key = "";

    for (var i = 0; i < length; i++) {
        key = order[i];
        var field = {};
        field.type = inputMap[structure[key].type];
        field.label = structure[key].label;
        field.name = key;

        console.log(fields);

        fields.push(field);
    }

    return JSON.stringify(fields);
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

var post =
{
    name: 'post',
    data: {
        title: 'This is a Title',
        body: 'This is a post',
        author: 'John Doe'
    },
    structure: {
        title: {
            type: 'Text',
            required: true,
            label: 'Title'
        },
        subtitle: {
            type: 'Text',
            label: 'Subtitle'
        },
        slug: {
            type: 'Slug',
            label: 'URL Slug'
        },
        author: {
            type: 'Author',
            label: 'Author (First Last)'
        },
        excerpt: {
            type: 'Text',
            label: 'Excerpt'
        },
        body: {
            type: 'Markdown',
            label: 'Content Body',
            required: true
        },
        _order: [
            'title',
            'subtitle',
            'slug',
            'author',
            'excerpt',
            'body'
        ]
    }
};

var review =
{
    name: 'review',
    data: {
        title: 'This is a Title',
        body: 'This is a post',
        author: 'John Doe'
    },
    structure: {
        title: {
            type: 'Text',
            required: true,
            label: 'Title'
        },
        subtitle: {
            type: 'Text',
            label: 'Subtitle'
        },
        slug: {
            type: 'Slug',
            label: 'URL Slug'
        },
        author: {
            type: 'Author',
            label: 'Author (First Last)'
        },
        excerpt: {
            type: 'Text',
            label: 'Excerpt'
        },
        body: {
            type: 'Markdown',
            label: 'Content Body',
            required: true
        },
        score: {
            type: 'String',
            label: 'Review Score',
            required: true
        },
        _order: [
            'title',
            'subtitle',
            'slug',
            'author',
            'excerpt',
            'body',
            'score'
        ]
    }
};

create(review);

module.exports.find = find;
module.exports.createFields = createFields;
module.exports.populate = populate;
module.exports.fieldsFor = fieldsFor;