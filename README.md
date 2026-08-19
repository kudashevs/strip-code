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
of each tag is `prefix name suffix` (e.g. `/* debug-start */`). The name of a start tag, name of an end tag, prefix, and
suffix are configurable.
```js
/* debug-start */ 
console.log('debug');
/* debug-end */
```

**Note**: The blocks cannot overlap each other.


## Options

`options.skips` is an array of environment names where the processing will be skipped.

`options.blocks` is an array of blocks' representations. Each element of this array describes a unique pair of tags.
Pairs can be defined as a string or an object with different properties (let's call them [ways of defining pairs](#ways)).

An object accepts the following properties:
```
name: 'name'            # string defines a name for a pair of tags - required in an object with a name
separator: '-'          # string defines a separator between a name and a position - optional in an object with a name
start: 'dev-start'      # string defines a name for the start tag (unique) - required in an object with start/end
end: 'dev-end'          # string defines a name for the end tag (unique) - required in an object with start/end
prefix: '/*'            # string defines the beginning of a tag (non-empty string) - optional
suffix: '*/'            # string defines the end of a tag (can be an empty string) - optional
replacement: 'any'      # string defines a substitution for a removed block - optional
```
When a pair of tags is defined by a string, this string will be used to generate the values of the start and end tags
(e.g. `string-start` and `string-end`). If prefix and suffix are not provided, the default values `/*` and `*/` are used.

#### Ways

There are different ways of defining a block:
- via a string
```js
blocks: ['debug'] // equal to start: 'debug-start', end: 'debug-end'
```
- via an object with a name
```js
blocks: [
  {
    name: 'debug', // equal to start: 'debug-start', end: 'debug-end'
  },
]
```
- via an object with start/end
```js
blocks: [
  {
    start: 'debug_start',
    end: 'debug_end',
  },
]
```


## License

The MIT License (MIT). Please see the [License file](LICENSE.md) for more information.
