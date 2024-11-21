import {describe, expect, it} from 'vitest';
import sut from '../../lib/index.js';
import schema from '../../lib/options.json';

describe('default test suite', () => {
  const originalMode = process.env.NODE_ENV;
  const defaultOptions = {blocks: ['dev']};

  it.each([
    ['production', '/* dev-start */ any /* dev-end */', ''],
    ['test', '/* dev-start */ any /* dev-end */', ''],
  ])('proceeds in %s environment', (environment, input, expected) => {
    process.env.NODE_ENV = environment;

    expect(process.env.NODE_ENV).toStrictEqual(environment);
    expect(sut(input, defaultOptions)).toStrictEqual(expected);

    process.env.NODE_ENV = originalMode;
  });

  it('skips in development environment by default', () => {
    process.env.NODE_ENV = 'development';

    const input = '/* dev-start */ visible /* dev-end */';
    const expected = '/* dev-start */ visible /* dev-end */';

    expect(process.env.NODE_ENV).toStrictEqual('development');
    expect(sut(input, defaultOptions)).toStrictEqual(expected);

    process.env.NODE_ENV = originalMode;
  });

  it('can skip in test environment when an option provided', () => {
    process.env.NODE_ENV = 'test';

    const input = '/* dev-start */ visible /* dev-end */';
    const expected = '/* dev-start */ visible /* dev-end */';

    expect(process.env.NODE_ENV).toStrictEqual('test');
    expect(sut(input, {skips: ['test']})).toStrictEqual(expected);

    process.env.NODE_ENV = originalMode;
  });

  it('can handle an empty skips option', () => {
    const input = 'visible /* dev-start */ will be removed /* dev-end */';
    const expected = 'visible /* dev-start */ will be removed /* dev-end */';

    expect(sut(input, {skips: []})).toStrictEqual(expected);
  });

  it.each([
    ['is of a wrong type', {skips: 'wrong'}, 'skips option must be an array'],
    ['has a wrong value', {skips: [42]}, 'skips.0 should be a string'],
  ])('can validate skips option when it %s', (_, options, expected) => {
    try {
      sut(schema, options);
    } catch (e) {
      expect(e.message).toStrictEqual(expected);
    }
    expect.assertions(1);
  });

  it('can handle an empty blocks option', () => {
    const input = 'visible /* dev-start */ will be removed /* dev-end */';
    const expected = 'visible /* dev-start */ will be removed /* dev-end */';

    expect(sut(input, {blocks: []})).toStrictEqual(expected);
  });

  it.each([
    ['is of a wrong type', {blocks: 'wrong'}, 'blocks option must be an array'],
    ['has a wrong value', {blocks: [42]}, 'blocks.0 should be a string or a valid object'],
  ])('can validate blocks option when it %s', (_, options, expected) => {
    try {
      sut(schema, options);
    } catch (e) {
      expect(e.message).toStrictEqual(expected);
    }
    expect.assertions(1);
  });

  it('can remove a block generated from a string parameter', () => {
    const options = {blocks: ['debug']};
    const input = 'visible /* debug-start */ will be removed /* debug-end */';
    const expected = 'visible ';

    const output = sut(input, options);

    expect(output).toStrictEqual(expected);
  });

  it('can remove a block generated from an object parameter', () => {
    const options = {
      blocks: [
        {
          start: 'debug_start',
          end: 'debug_end',
          prefix: '/*',
          suffix: '*/',
        },
      ],
    };
    const input = 'visible /* debug_start */ will be removed /* debug_end */';
    const expected = 'visible ';

    const output = sut(input, options);

    expect(output).toStrictEqual(expected);
  });

  it.each([
    ['no spaces', 'visible <!--debug_start--> will be removed <!--debug_end-->', 'visible '],
    ['spaces', 'visible <!-- debug_start --> will be removed <!-- debug_end -->', 'visible '],
    ['tabulations', 'visible <!--\tdebug_start\t--> will be removed <!--\tdebug_end\t-->', 'visible '],
  ])('can use %s between start/end and a label', (_, input, expected) => {
    const options = {
      blocks: [
        {
          start: 'debug_start',
          end: 'debug_end',
          prefix: '<!--',
          suffix: '-->',
        },
      ],
    };

    const output = sut(input, options);

    expect(output).toStrictEqual(expected);
  });

  it('can use multiple characters between start/end and a label', () => {
    const options = {
      blocks: [
        {
          start: 'debug_start',
          end: 'debug_end',
          prefix: '<!--',
          suffix: '-->',
        },
      ],
    };
    const input = 'visible <!--   debug_start   --> will be removed <!--\t \tdebug_end\t \t-->';
    const expected = 'visible ';

    const output = sut(input, options);

    expect(output).toStrictEqual(expected);
  });

  it('can use special characters in names from a string', () => {
    const options = {
      blocks: ['*devblock!'],
    };
    const input = 'visible /* *devblock!-start */ will be removed /* *devblock!-end */';
    const expected = 'visible ';

    const output = sut(input, options);

    expect(output).toStrictEqual(expected);
  });

  it('can use special characters in names from an object', () => {
    const options = {
      blocks: [
        {
          start: '*devblock#start!',
          end: '*devblock#end!',
          prefix: '<!--',
          suffix: '-->',
        },
      ],
    };
    const input = 'visible <!-- *devblock#start! --> will be removed <!-- *devblock#end! -->';
    const expected = 'visible ';

    const output = sut(input, options);

    expect(output).toStrictEqual(expected);
  });

  it('can remove a block marked in lower case', () => {
    const input = 'visible /* dev-start */ will be removed /* dev-end */';
    const expected = 'visible ';

    const output = sut(input, defaultOptions);

    expect(output).toStrictEqual(expected);
  });

  it('cannot remove a block marked in upper case with default options', () => {
    const input = "visible /* DEVBLOCK-START */ won't be removed /* DEVBLOCK-END */";
    const expected = "visible /* DEVBLOCK-START */ won't be removed /* DEVBLOCK-END */";

    const output = sut(input, defaultOptions);

    expect(output).toStrictEqual(expected);
  });

  it('can remove a block marked in upper case with the specific options', () => {
    const options = {
      blocks: [
        {
          start: 'DEVBLOCK-START',
          end: 'DEVBLOCK-END',
          prefix: '/*',
          suffix: '*/',
        },
      ],
    };
    const input = 'visible /* DEVBLOCK-START */ will be removed /* DEVBLOCK-END */';
    const expected = 'visible ';

    const output = sut(input, options);

    expect(output).toStrictEqual(expected);
  });
});
