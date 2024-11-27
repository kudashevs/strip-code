/* this comment should not be removed */
let fizzBuzz = function (n) {
  let result = '';
  for (i = 1; i <= n; i++) {
    if (i % 15 === 0) {
      /* dev-start */ console.debug('gives fizzbuzz') /* dev-end */
      result += "FizzBuzz\n";
    } else if (i % 3 === 0) {
      /* dev-start */ console.debug('gives fizz') /* dev-end */
      result += "Fizz\n";
    } else if (i % 5 === 0) {
      /* dev-start */ console.debug('gives buzz') /* dev-end */
      result += "Buzz\n";
    } else {
      /* dev-start */
      console.debug('gives number')
      console.debug(i)
      /* dev-end */
      result += i.toString() + "\n";
    }
  }

  return result;
};