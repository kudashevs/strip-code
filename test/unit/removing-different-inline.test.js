import {describe, it, expect} from 'vitest';
import sut from '../../lib/index';

describe('remove multi-line block from a line test suite', () => {
  it.each([
    ['visible /* debug_start */ will be removed /* debug_end */', 'visible '],
    ['  visible /* debug_start */ will be removed /* debug_end */', '  visible '],
    ['/* debug_start */ will be removed /* debug_end */ visible', ' visible'],
    ['/* debug_start */ will be removed /* debug_end */ visible  ', ' visible  '],
    ['visible /* debug_start */ will be removed /* debug_end */ visible', 'visible  visible'],
    ['  visible /* debug_start */ will be removed /* debug_end */  visible', '  visible   visible'],
  ])('can remove a multi-line comment "%s"', (input, expected) => {
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

    const output = sut(input, options);

    expect(output).toStrictEqual(expected);
  });
});

describe('remove single-line block from a line test suite', () => {
  it.each([
    ['visible // debug_start will be removed // debug_end', 'visible '],
    ['  visible // debug_start will be removed // debug_end', '  visible '],
    ['visible // debug_start will be removed // debug_end  ', 'visible '],
    ['  visible // debug_start will be removed // debug_end  ', '  visible '],
  ])('can remove a single-line comment "%s"', (input, expected) => {
    const options = {
      blocks: [
        {
          start: 'debug_start',
          end: 'debug_end',
          prefix: '//',
          suffix: '',
        },
      ],
    };

    const output = sut(input, options);

    expect(output).toStrictEqual(expected);
  });
});
