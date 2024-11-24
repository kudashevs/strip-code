Strip Code ![test workflow](https://github.com/kudashevs/strip-code/actions/workflows/run-tests.yml/badge.svg)
==========================

The `strip-code` is a library that strips marked blocks from any type of code.


## Install

```bash
# NPM
npm install --save-dev strip-code
# Yarn
yarn add --dev strip-code
```


## Usage

It strips blocks of code marked with two paired tags. A pair of tags consists of a start tag and an end tag. The format
of each tag is `prefix name suffix` (e.g. `/* debug-start */`). The name of a start tag, name of an end tag,
prefix, and suffix are configurable.
```js
/* debug-start */ 
console.log('debug');
/* debug-end */
```

**Note**: The blocks cannot overlap each other.


## Options

`options.skips` an array of environments where the processing will be skipped.

`options.blocks` an array of blocks' representations. Each element of this array describes a unique pair of tags with
start, end, prefix, and suffix. These values are represented by an object with the properties or by a string:
```
start: 'dev-start'             # a string defines a name of the start tag (unique)
end: 'dev-end',                # a string defines a name of the end tag (unique)
prefix: '/*',                  # a string defines the beginning of a tag (non-empty string)
suffix: '*/',                  # a string defines the end of a tag (can be an empty string)
```
When a pair of tags is represented by a string, the default name of the start tag is `string-start`, the default name of
the end of tag is `string-end`. The default prefix and suffix are `/*` and `*/`, respectively.


## License

The MIT License (MIT). Please see the [License file](LICENSE.md) for more information.