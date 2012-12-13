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