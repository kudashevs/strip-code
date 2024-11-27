import {describe, it, expect} from 'vitest';
import converter from '../helpers/converter';
import reader from '../helpers/reader';
import sut from '../../lib/index';

describe('remove repeated multi-line blocks from code test suite', () => {
  const input = reader('multi-line-repeated');
  const expected = `/* this comment should not be removed */
let fizzBuzz = function (n) {
  let result = '';
  for (i = 1; i <= n; i++) {
    if (i % 15 === 0) {
      result += "FizzBuzz\\n";
    } else if (i % 3 === 0) {
      result += "Fizz\\n";
    } else if (i % 5 === 0) {
      result += "Buzz\\n";
    } else {
      result += i.toString() + "\\n";
    }
  }

  return result;
};`;

  it('can remove blocks generated from a string parameter', () => {
    const output = sut(input, {blocks: ['dev']});

    expect(converter(output)).toStrictEqual(converter(expected));
  });

  it('can remove blocks generated from an object parameter', () => {
    const options = {
      blocks: [
        {
          start: 'dev-start',
          end: 'dev-end',
          prefix: '/*',
          suffix: '*/',
        },
      ],
    };

    const output = sut(input, options);

    expect(converter(output)).toStrictEqual(converter(expected));
  });
});
