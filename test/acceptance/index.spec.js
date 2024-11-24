import {describe, expect, it} from 'vitest';
import sut from '../../lib/index.js';
import schema from '../../lib/options.json';
import config from '../../lib/config.json';

describe('specification test', () => {
  it('should validate and fail on a skips option with a wrong value', () => {
    const options = {skips: [42]};

    try {
      sut(schema, options, config);
    } catch (e) {
      expect(e.message).toMatch(/^skips.0 should be a string/);
    }
    expect.assertions(1);
  });

  it('should validate and fail on a blocks option with a wrong value', () => {
    const options = {blocks: [42]};

    try {
      sut(schema, options, config);
    } catch (e) {
      expect(e.message).toMatch(/^blocks.0 should be a string or.+object/);
    }
    expect.assertions(1);
  });

  it('should validate, fail on a wrong blocks option, and keep the default order from config', () => {
    const options = {
      blocks: [{start: '', end: '', prefix: '', suffix: 42}],
    };

    try {
      sut(schema, options, config);
    } catch (e) {
      expect(e.message).toMatch(/start should be a non empty string and.+end.+and.+prefix.+and.+suffix/);
    }
    expect.assertions(1);
  });

  it('should remove a multi-line block marked with the provided options', () => {
    const options = {blocks: [{start: 'dev-start', end: 'dev-end', prefix: '<!--', suffix: '-->'}]};
    const input = `test
    <!-- dev-start -->
    console.log('log an operation');
    <!-- dev-end -->`;
    const expected = 'test\n';

    expect(sut(input, options)).toStrictEqual(expected);
  });

  it('should remove a single-line block marked with the provided options', () => {
    const options = {blocks: [{start: 'dev-start', end: 'dev-end', prefix: '//', suffix: ''}]};
    const input = `test
    // dev-start
    console.log('log an operation');
    // dev-end`;
    const expected = 'test\n';

    expect(sut(input, options)).toStrictEqual(expected);
  });

  it('should remove an inlined multi-line block with the provided options', () => {
    const options = {blocks: [{start: 'dev-start', end: 'dev-end', prefix: '<!--', suffix: '-->'}]};
    const input = `test<!-- dev-start -->console.log('log an operation')<!-- dev-end -->`;
    const expected = 'test';

    expect(sut(input, options)).toStrictEqual(expected);
  });

  it('should remove repeated blocks with the provided options', () => {
    const options = {blocks: [{start: 'dev-start', end: 'dev-end', prefix: '<!--', suffix: '-->'}]};
    const input = `<!-- dev-start -->console.log('log an operation')<!-- dev-end -->test<!-- dev-start -->console.log('log an operation')<!-- dev-end -->`;
    const expected = 'test';

    expect(sut(input, options)).toStrictEqual(expected);
  });

  it('should remove multiple blocks with the provided options', () => {
    const options = {blocks: ['dev', {start: 'dev-start', end: 'dev-end', prefix: '<!--', suffix: '-->'}]};
    const input = `<!-- dev-start -->console.log('log an operation')<!-- dev-end -->test<!-- dev-start -->console.log('log an operation')<!-- dev-end -->
    /* dev-start */
    console.log('log an operation');
    /* dev-end */`;
    const expected = 'test\n';

    expect(sut(input, options)).toStrictEqual(expected);
  });
});
