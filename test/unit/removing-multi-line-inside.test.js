import {describe, it, expect} from 'vitest';
import converter from '../helpers/converter';
import reader from '../helpers/reader';
import sut from '../../lib/index';

describe('remove multi-line inlined block from inside code test suite', () => {
  const input = reader('multi-line-inside');
  const expected = `console.log('User was created ' + user.name + ' ' +  user.age);`;

  it('can remove a multi-line comment inside string generated from a string parameter', () => {
    const output = sut(input, {blocks: ['dev']});

    expect(converter(output)).toStrictEqual(converter(expected));
  });

  it('can remove a multi-line comment inside string generated from an object parameter', () => {
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
