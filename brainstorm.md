# Inheritance

Records are stored w/o parent values, so they can be looked up at read time, like prototypal inheritance.

When a Redis cache is created, a set of hash keys are created all the way up the archetype chain,
each of which point to caches that need to get updated.

E.g, Hello World post inherits Post and Record. A Redis cache of JSON and HTML is created at `hello-word`.
As soon as that cache gets made, `Post` now points to `hello-world`. If Post is changed in any way, any caches for records
inheriting Post get purged.