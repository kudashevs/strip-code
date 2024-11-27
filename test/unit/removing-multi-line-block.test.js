import {describe, it, expect} from 'vitest';
import converter from '../helpers/converter';
import reader from '../helpers/reader';
import sut from '../../lib/index';

describe('remove multi-line block from code test suite', () => {
  const input = reader('multi-line-block');
  const expected = `/* this comment should not be removed */
module.exports = function addOne(num) {
    const one = 1;
    return num + one;
}`;

  it('can remove a multi-line comment generated from a string parameter', () => {
    const output = sut(input, {blocks: ['debug']});

    expect(converter(output)).toStrictEqual(converter(expected));
  });

  it('can remove a multi-line comment generated from an object parameter', () => {
    const options = {
      blocks: [
        {
          start: 'debug-start',
          end: 'debug-end',
          prefix: '/*',
          suffix: '*/',
        },
      ],
    };

    const output = sut(input, options);

    expect(converter(output)).toStrictEqual(converter(expected));
  });
});
