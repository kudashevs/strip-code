import {describe, it, expect} from 'vitest';
import sut from '../../lib/validator';
import schema from '../../lib/options.json';

describe('options validator test suite', () => {
  it('passes when options value is an empty object', () => {
    expect(() => sut(schema, {})).not.toThrow(Error);
  });

  it('fails when options value is not an object', () => {
    const options = [];

    try {
      sut(schema, options);
    } catch (e) {
      expect(e.message).toStrictEqual('must be an object');
    }
    expect.assertions(1);
  });

  it('fails when options.skips value is not an array', () => {
    const options = {skips: 'wrong'};

    try {
      sut(schema, options);
    } catch (e) {
      expect(e.message).toStrictEqual('skips option must be an array');
    }
    expect.assertions(1);
  });

  it.each([
    ['first element is not a string', {skips: [42]}, 'skips.0 should be a string'],
    ['first element is an empty string', {skips: ['']}, 'skips.0 should be a non empty string'],
    ['second element is an empty string', {skips: ['test', '']}, 'skips.1 should be a non empty string'],
  ])('fails when in options.skips the %s', (_, options, expected) => {
    try {
      sut(schema, options);
    } catch (e) {
      expect(e.message).toStrictEqual(expected);
    }
    expect.assertions(1);
  });

  it('fails when options.blocks element is not an array', () => {
    const options = {blocks: 'wrong'};

    try {
      sut(schema, options);
    } catch (e) {
      expect(e.message).toStrictEqual('blocks option must be an array');
    }
    expect.assertions(1);
  });

  it.each([
    ['first element is not a string neither an object', {blocks: [42]}, 'blocks.0 should be a string or a valid'],
    ['first element is an empty string', {blocks: ['']}, 'blocks.0 should be a non empty string'],
    ['first element is an empty object', {blocks: [{}]}, 'blocks.0 should be a valid object with start, end'],
    [
      'second element is an empty string',
      {
        blocks: [{start: 'any', end: 'any', prefix: 'any', suffix: 'any'}, ''],
      },
      'blocks.1 should be a non empty string',
    ],
    [
      'second element is an empty object',
      {
        blocks: [{start: 'any', end: 'any', prefix: 'any', suffix: 'any'}, {}],
      },
      'blocks.1 should be a valid object with start, end',
    ],
  ])('fails when in options.blocks the %s', (_, options, expected) => {
    try {
      sut(schema, options);
    } catch (e) {
      expect(e.message).toMatch(expected);
    }
    expect.assertions(1);
  });

  it.each([
    [
      'start in the first element is wrong',
      {
        blocks: [{start: 42, end: 'any', prefix: 'any', suffix: 'any'}],
      },
      /^blocks.0.start should be a string/,
    ],
    [
      'end in the first element is wrong',
      {
        blocks: [{start: 'any', end: 42, prefix: 'any', suffix: 'any'}],
      },
      /^blocks.0.end should be a string/,
    ],
    [
      'prefix in the first element is wrong',
      {
        blocks: [{start: 'any', end: 'any', prefix: 42, suffix: 'any'}],
      },
      /^blocks.0.prefix should be a string/,
    ],
    [
      'suffix in the first element is wrong',
      {
        blocks: [{start: 'any', end: 'any', prefix: 'any', suffix: 42}],
      },
      /^blocks.0.suffix should be a string/,
    ],
    [
      'prefix and suffix in the first element are wrong',
      {
        blocks: [{start: 'any', end: 'any', prefix: 42, suffix: 42}],
      },
      /^blocks.0.prefix should be a string and blocks.0.suffix should be a string/,
    ],
    [
      'name in the second element is wrong',
      {
        blocks: [
          {start: 'any', end: 'any', prefix: 'any', suffix: 'any'},
          {start: 42, end: 'any', prefix: 'any', suffix: 'any'},
        ],
      },
      /^blocks.1.start should be a string/,
    ],
  ])('fails when options.blocks type of the %s', (_, options, expected) => {
    try {
      sut(schema, options);
    } catch (e) {
      expect(e.message).toMatch(expected);
    }
    expect.assertions(1);
  });

  it.each([
    [
      'first element is an object without start',
      {
        blocks: [{end: 'any', prefix: 'any', suffix: 'any'}],
      },
      /^blocks.0 should be a valid object/,
    ],
    [
      'first element is an object with empty start',
      {
        blocks: [{start: '', end: 'any', prefix: 'any', suffix: 'any'}],
      },
      'start should be a non empty string',
    ],
    [
      'first element is an object without end',
      {
        blocks: [{start: 'any', prefix: 'any', suffix: 'any'}],
      },
      /^blocks.0 should be a valid object/,
    ],
    [
      'first element is an object with empty end',
      {
        blocks: [{start: 'any', end: '', prefix: 'any', suffix: 'any'}],
      },
      'end should be a non empty string',
    ],
    [
      'first element is an object with empty prefix',
      {
        blocks: [{start: 'any', end: 'any', prefix: '', suffix: 'any'}],
      },
      'prefix should be a non empty string',
    ],
    [
      'second element is an object without start and end',
      {
        blocks: [
          {start: 'any', end: "any", prefix: 'any', suffix: 'any'},
          {prefix: 'any', suffix: 'any'},
        ],
      },
      /^blocks.1 should be a valid object/,
    ],
  ])('fails when options.blocks value of the %s', (_, options, expected) => {
    try {
      sut(schema, options);
    } catch (e) {
      expect(e.message).toMatch(expected);
    }
    expect.assertions(1);
  });

  it('fails with a combined error when in options.blocks the first element is an object without end and empty start and prefix', () => {
    const options = {
      blocks: [{start: '', prefix: '', any: 'any'}],
    };

    try {
      sut(schema, options);
    } catch (e) {
      expect(e.message).toMatch(/^blocks.0 should be a valid object with start, end and blocks.0.prefix.+and.+start/);
    }
    expect.assertions(1);
  });

  it('fails with a combined error when in options.blocks the first element is an object that breaks all of the rules', () => {
    const options = {
      blocks: [{start: '', end: '', prefix: '', suffix: 42}],
    };
    const config = {name: 'RemoveBlocks', orders: {blocks: ['start', 'end', 'prefix', 'suffix']}};

    try {
      sut(schema, options, config);
    } catch (e) {
      expect(e.message).toMatch(/blocks.0.start should be a non empty string and blocks.0.end.+and.+prefix/);
    }
    expect.assertions(1);
  });

  it('fails with a combined error when in options.blocks the first and second elements are objects without end and empty start and prefix', () => {
    const options = {
      blocks: [
        {start: '', prefix: '', any: 'any'},
        {start: '', prefix: '', any: 'any'},
      ],
    };
    const config = {name: 'RemoveBlocks', orders: {blocks: ['start', 'end', 'prefix', 'suffix']}};

    try {
      sut(schema, options, config);
    } catch (e) {
      expect(e.message).toMatch(/^blocks.0 should be a valid object with start, end and blocks.0.start.+and.+prefix.+and.+blocks.1/);
    }
    expect.assertions(1);
  });
});
