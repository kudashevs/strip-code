import {describe, it, expect} from 'vitest';
import converter from '../helpers/converter';
import reader from '../helpers/reader';
import sut from '../../lib/index';

describe('replace multi-line inlined block from inside code test suite', () => {
  const input = reader('multi-line-inside');
  const expected = `console.log('User was created ' + user.name + ' ' + /* replaced */ user.age);`;

  it('can replace a multi-line comment inside string generated from an object parameter', () => {
    const options = {
      blocks: [
        {
          start: 'dev-start',
          end: 'dev-end',
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
