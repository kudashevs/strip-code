import {describe, it, expect} from 'vitest';
import sut from '../../lib/index';

describe('replace multi-line block from a line test suite', () => {
  it.each([
    ['visible /* debug_start */ will be replaced /* debug_end */', 'visible /* replaced */'],
    ['  visible /* debug_start */ will be replaced /* debug_end */', '  visible /* replaced */'],
    ['/* debug_start */ will be replaced /* debug_end */ visible', '/* replaced */ visible'],
    ['/* debug_start */ will be replaced /* debug_end */ visible  ', '/* replaced */ visible  '],
    ['visible /* debug_start */ will be replaced /* debug_end */ visible', 'visible /* replaced */ visible'],
    ['  visible /* debug_start */ will be replaced /* debug_end */  visible', '  visible /* replaced */  visible'],
  ])('can replace a multi-line comment "%s"', (input, expected) => {
    const options = {
      blocks: [
        {
          start: 'debug_start',
          end: 'debug_end',
          prefix: '/*',
          suffix: '*/',
          replacement: '/* replaced */',
        },
      ],
    };

    const output = sut(input, options);

    expect(output).toStrictEqual(expected);
  });
});

describe('replace single-line block from a line test suite', () => {
  it.each([
    ['visible // debug_start will be replaced // debug_end', 'visible // replaced'],
    ['  visible // debug_start will be replaced // debug_end', '  visible // replaced'],
    ['visible // debug_start will be replaced // debug_end  ', 'visible // replaced'],
    ['  visible // debug_start will be replaced // debug_end  ', '  visible // replaced'],
  ])('can replace a single-line comment "%s"', (input, expected) => {
    const options = {
      blocks: [
        {
          start: 'debug_start',
          end: 'debug_end',
          prefix: '//',
          suffix: '',
          replacement: '// replaced',
        },
      ],
    };

    const output = sut(input, options);

    expect(output).toStrictEqual(expected);
  });
});
