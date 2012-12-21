// Root
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

var post =
{
    name: 'post',
    archetype: 'root',
    data: {
        title: 'Hello World',
        body: '<p>This is a post.</p>',
        author: 'John Doe'
    },
    structure: {
        author: {
            type: 'Author'
        },
        slug: {
            type: 'Slug'
        },
        title: {
            type: 'Text',
            required: true
        },
        subtitle: {
            type: 'Text'
        },
        excerpt: {
            type: 'Text'
        },
        body: {
            type: 'HTML'
        }

    }
    
}

var validPost = 
{
    name: 'hello-word',
    data: {
        archetype: 'post',
        title: 'Hello World',
        body: '<p>Hello, this is my first post!</p>'
    }
}

var invalidPost = 
{
    name: 'hello-word',
    data: {
        archetype: 'post',
        author: 'John Doe',
        subtitle: 'Hello World',
        body: '<p>Hello, this is my first post!</p>'
    }
}


var suit = {
    "name" : "major-arcana",
    "archetype" : "root",
    data: {
        content: {
            title: "Major Arcana",
            body: "The Major Arcana or trumps are a suit of twenty-two cards in the Tarot deck. They serve as a permanent trump suit in games played with the Tarot deck, and are distinguished from the four standard suits collectively known as the Minor Arcana. The terms \"Major\" and \"Minor Arcana\" are used in the occult and divinatory applications of the deck, and originate with Paul Christian."
        },
        cards : {
            members: [
                {
                    name: "the-fool",
                    override: {
                        suit: "Fool in Major Acana"
                    }
                },
                {name: "the-magician"},
                {name: "the-high-priestess"},
                {name: "the-empress"},
                {name: "the-emperor"},
                {name: "the-hierophant"},
                {name: "the-lovers"},
                {name: "the-chariot"},
                {name: "strenght"},
                {name: "the-hermit"},
                {name: "wheel-of-fortune"},
                {name: "justice"},
                {name: "the-hanged-man"},
                {name: "death"},
                {name: "temperance"},
                {name: "the-devil"},
                {name: "the-tower"},
                {name: "the-star"}
            ],
            override: {
                suit: "the-major-arcana"
            }
        }
    }
};