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
        title: {
            type: 'Text',
            required: true
        },
        subtitle: {
            type: 'Text'
        },
        slug: {
            type: 'Slug'
        },
        author: {
            type: 'Author'
        },
        excerpt: {
            type: 'Text'
        },
        body: {
            type: 'HTML',
            required: true
        },
        $order: [
            'title',
            'subtitle',
            'slug',
            'author',
            'excerpt',
            'body'
        ]

    }
    
};