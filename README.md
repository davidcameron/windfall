# Windfall
========

Generic, simple CMS for Node.js

========

## Use Case

You need **posts** and **pages**, but also **products**, or **portfolio examples**. More importantly, you're looking for content type *inheritance*.

## Overview

### Content

The basic unit in Windfall is a ``card``. A card represents both a content unit, and a template. Any card inherit any other card, pulling in the data fields, each defaulting to the value of the parent card.

#### Example Post Inheritance

##### Post:
<pre>
{
    'name':         'post',
    'slug':         'blog',
    'title':    {
        'dataType':     'text',
        'value':        'Hello World'
    },
    'author':   {
        'dataType':     'slug',
        'value':        'first_last',
    },
    'date':     {
        'dataType':     'date',
        'value':        '11-20-1984'
    },
    'tags':     {
        'dataType':     'text',
        'array':        true
    },
    'content':  {
        'dataType':     'text'
        'format':   'markdown',
        'body':     '## Lorum Ipsum
                    1. First
                    2. Second
                    3. Third
                    Paragraph text.'
    }
}
</pre>

Here ``post`` inherits ``card``, which only gives it the ``name`` and ``slug`` fields by default. ``Post`` then defines its own fields, as well as populates content for them.

##### Review
<pre>
{
    'inherits':     'post',
    'name':         'review',
    'title':        'Clever Pun',
    'subtitle': {
        'dataType':     'text',
        'format':       'markdown',
        'value':        'Something a bit more descriptive'
    },
    'date':         '12-24-2012',
    'score': {
        'dataType:      'percent',
        'value':        '.75'
    },
    'tags':         ['technology', 'devices'],
    content':       '## Specs
                    Lorum ipsum
                    ## Look and Feel
                    Etc etc'
    }
}
</pre>

``review`` gets a couple things by inheriting ``post``. It doesn't need to declare data types for inherited properties, and it doesn't even name the post author, as all (or most) reviews are written by the author declared in ``post``.

Let's check out a real example, something you'd actually want to display on your site:

##### Example Review
<pre>
{
    'inherits':     'review',
    'name':         'iphone-5',
    'title':        'Long in the Tooth',
    'subtitle':     'iPhone gets a bigger screen and 4G. **Is that enough?**',
    'date':         '9-15-2012',
    'tags':         ['apple', 'iphone5, 'iphone, 'phone'],
    'score':        '.7',
    'content':      'We've had some time with the latest and greatest from Cupertino. It\'s better than the 4S, 
                    but can\'t quite match the competion.'
}
</pre>

All that inheritance gives this post a nice, simple structure, but still validates and casts its fields.

#### URLs

All the inheritance also gives us a default URL structure. Let's check it out.

The URL for our iPhone 5 review: ``/blog/review/iphone-5``

The URL gets constructed by hopping up the inheritance chain, prepending the 'name' attribute of each parent unless a 'slug' is defined (this makes the URL root ``/blog`` instead of ``/post``). You can actually have more than one post with the name "iphone-5", as long as they each have a unique direct parent. E.g. if you wanted a page that just listed all the iPhone 5 specs, it could inherit your ``spec-list`` card and still have the ``iphone-5`` name, getting ``/spec-list/iphone-5`` as the URL.

#### Complex Data Structure

I know what you're thinking: this is super cool, but not really compelling enough to switch from Wordpress. While that is false, the real hook is are the nested data structures.

##### Hero Slide Example

Let's say you want a hero with 5 slides, each with a title, an image, and a series of "hotzones" over the image that popover some text when hovered. Trust me, this is a pain in Wordpress, but crazy easy in Windfall.

````
{
    'inherits':         'image-detail/iphone-5',
    'parent':           'hero/iphone-5',
    'name':             'front',
    'image':            '/images/iphone-5-front.png',
    'hotzones': {
        'home-button': {
            'x': ['.45', '.55'],
            'y': ['.8', '.9']
        },
        'volume-rocker': {
            'x': ['.1', '.15'],
            'y': ['.2', '.35']
        }
    }
    'subtitle':         'Front'
}

{
    'inherits':         'hotzone',
    'parent':           'hero/iphone-5/front',
    'name':             'home-button',
    'title':            'Home Button',
    'content':          'Exactly the same as the 4S'
}

{
    'inherits':         'hero/iphone-5/front/home-button',
    'name':             'volume-rocker',
    'title':            'Volume Rocker',
    'content':          'Still best-in-class'
}
````