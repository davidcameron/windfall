    console.log('content');
    var mongo = require('mongoskin');
    var Q = require("q");

    var db = mongo.db('localhost/windfall', {safe: false});
    db.collection('unit').ensureIndex([['fullName', 1]], true);
    db.bind('unit');

    var Unit = {
        name: {
            type:   'text',
            value:  'root'
        },
        slug: {
            type:   'text'
        },
        archetype: {
            type:   'unit',
            value:  'root'
        },
        parent: {
            type:   'unit'
        },
        namespace: {
            type:   'text'
        }
    };

    var exampleContent = {
        slug: {
            type: 'slug',
            value: 'hello-world'
        }
    };

    var failContent = {
        slug: {
            type: 'slug',
            value: 'hello!!!'
        }
    };

    var typeMap = {
        text: String,
        slug: String,
        unit: String
    };

    // Creates the full name (unique ID) of the unit
    // Does a few lookups in order
    function fullName (unit) {
        var namePrefix =
            unit.namespace  ||
            unit.parent     ||
            '';
        if (namePrefix.length > 0) {
            namePrefix += '/';
        }
        return namePrefix + unit.name;
    }

    function TypeTester () {}

    TypeTester.prototype.slug = function (slug) {
        var patt = /^[a-z0-9-]+$/;
        return patt.test(slug);
    };

    TypeTester.prototype.unit = function (name) {
        return db.find(name);
    };

    TypeTester.prototype.text = function (text) {
        return true;
    };

    function validate (unit) {
        var valid = Q.defer();

        (function () {
            inherit(unit).then(function (tempUnit) {
                for (var field in tempUnit) {

                    // Make sure each field has a type
                    var type = tempUnit[field].type;
                    if (typeof type === 'undefined') {
                        valid.reject(new Error('Field "' + field + '" doesn\'t have a type'));
                    }

                    // Make sure type exists
                    var test = typeTest[type];
                    if (typeof test === 'undefined') {
                        valid.reject(new Error('Type "' + type + '" doesn\'t exist'));
                    }

                    // Make sure value passes test
                    if (test(tempUnit[field].value)) {
                        valid.reject(new Error('Test failed for: ' + field));
                    }
                }
                valid.resolve(unit);

            });
        })();

        return valid.promise;
    }

    // Needs to be made recusive so it can use promises
    function inherit (unit) {
        var deferred = Q.defer();
        console.log(unit);
        if (unit.name.value === 'root') {
            deferred.resolve(unit);
        } else {
            console.log('not root');

            if (!unit.hasOwnProperty('archetype')) {
                unit.archetype = 'root';
            }

            (function () {
                find(unit.archetype).then(function (error, result) {
                    console.log('find then');
                    var archetype = result[0];

                    for (var field in archetype) {
                        if(unit.hasOwnProperty('field') && typeof unit.field.type === 'undefined') {
                            unit[field].type = archetype[field].type;
                        } else {
                            unit[field] = archetype[field];
                        }
                    }
                    inherit(unit);
                });
            })();
        }
        
        return deferred.promise;
    }

    // To work with promises, find takes a failOnFind argument
    // failOnFind pairs 'resolve' and 'reject' to finding or not finding
    function find (unit, failOnFind) {
        console.log('find');
        var defer = Q.defer();
        var promiseSuccess  = failOnFind ? 'reject' : 'resolve';
        var promiseFail = failOnFind ? 'resolve' : 'reject';

        if(!unit.isString);
        var unitName = fullName(unit);

        console.log(unitName);

        (function () {

            db.unit.find({'fullName': unitName}).toArray(function (error, response) {
                if (response.length === 0 || error) {
                    defer[promiseFail](unit);
                } else {
                    defer[promiseSuccess](response);
                }
            });
            
        })();

        return defer.promise;
    }

    function insert (unit) {
        db.unit.insert(unit);
    }

    function create (unit) {
        find(unit, true)
            .then(validate)
            .then(function (unit) {console.log(unit);});
            //.then(insert, error);
    }

    create({
        name:'testunit',
        title: {
            type: 'test',
            value: 'Test Unit'
        }
    });