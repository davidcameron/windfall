var post =
{
    name: 'post',
    archetype: 'root',
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

var helloWorld =
{
    name: 'hello-world',
    archetype: 'post',
    data: {
        title: 'Hello World',
        body: 'This is the first test post. It\'s in markdown so the last word should be **bold**',
        author: 'David Cameron'
    }
};