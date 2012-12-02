
    var mongoose = require('mongoose');
    var Q = require("q");

    var db = mongoose.createConnection('localhost', 'gw2tips');

    var content = {
        name: {
            type:   text
        },
        slug: {
            type:   text
        },
        prototype: {
            type:   card,
            value:  content
        },
        parent: {
            type:   card
        },
        namespace: {
            type:   text
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
        card: String
    };

    function TypeTester () {}

    TypeTester.prototype.slug = function (slug) {
        var patt = /^[a-z0-9-]+$/;
        return patt.test(slug);
    };

    TypeTester.prototype.card = function (name) {
        // return db.find(name);
        return true;
    };

    TypeTester.prototype.text = function (text) {
        // return db.find(name);
        return true;
    };

    function insert (card) {
        var typeTest = new TypeTester();

        for(var field in card) {
            var test = card[field].type;
            
            if(!typeTest[test](card[field].value)) {
                // throw error
                return false;
            }
        }
        // do insert
        return true;
    }

    function extend (card) {
        if (card.hasOwnProperty('prototype')) {
            var prototype = find(card.prototype);
            for (var field in prototype) {
                if(card.hasOwnProperty('field')) {
                    card[field].type = prototype[field].type;
                } else {
                    card.field = prototype.field;
                }
            }
        }
    }

    function find (name) {
        return card;
    }

    console.log(exampleContent.slug.value + ": " + insert(exampleContent));
    console.log(failContent.slug.value + ": " + insert(failContent));