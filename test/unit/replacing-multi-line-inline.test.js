import {describe, it, expect} from 'vitest';
import converter from '../helpers/converter';
import reader from '../helpers/reader';
import sut from '../../lib/index';

describe('replace multi-line inlined block from code test suite', () => {
  const input = reader('multi-line-inline');
  const expected = `/* this comment should not be removed */
module.exports = function addOne(num) {
    const one = 1;
    /* replaced */
    return num + one;
}`;

  it('can replace a multi-line comment generated from an object parameter', () => {
    const options = {
      blocks: [
        {
          start: 'debug-start',
          end: 'debug-end',
          prefix: '/*',
          suffix: '*/',
          replacement: '/* replaced */',
        },
      ],
    };

    const output = sut(input, options);

    expect(converter(output)).toStrictEqual(converter(expected));
  });
});
