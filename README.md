Strip Code ![test workflow](https://github.com/kudashevs/strip-code/actions/workflows/run-tests.yml/badge.svg)
==========================

The `strip-code` is a library that strips marked blocks from any type of code.


## Usage

It strips blocks of code marked with two paired tags. A pair of tags consists of a start tag and an end tag. The format
of each tag is `prefix name:position suffix` (e.g. `/* debug-start */`). The name of a start tag, name of an end tag,
prefix, and suffix are configurable.
```js
/* debug-start */ 
console.log('debug');
/* debug-end */
```

**Note**: The blocks cannot overlap each other.


## License

The MIT License (MIT). Please see the [License file](LICENSE.md) for more information.