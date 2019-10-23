import { Do } from 'fp-ts-contrib/lib/Do';
import * as E from 'fp-ts/lib/Either';
import { pipe } from 'fp-ts/lib/pipeable';

import Either = E.Either;

const parseJson = (input: string): Either<Error, number[]> => {
  try {
    const numbers = JSON.parse(input);
    return E.right(numbers);
  } catch (error) {
    return E.left(error);
  }
};

const avg = (ns: number[]): Either<Error, number> => {
  const total = ns.length;
  if (total === 0) {
    return E.left(new Error('Empty input'));
  }
  const sum = ns.reduce((a, b) => a + b, 0);
  return E.right(sum / total);
};

const check4NaN = (n: number): Either<Error, number> => {
  if (isNaN(n)) {
    return E.left(new Error('Numbers only, MF!'));
  } else {
    return E.right(n);
  }
};

const inp = E.fromNullable(new Error('Argv[2] is missing'))(process.argv[2]);

const program = Do(E.either)
  .bind('input', inp)
  .bindL('parsedJson', ({ input }) => parseJson(input))
  .bindL('average', ({ parsedJson }) => avg(parsedJson))
  .bindL('check', ({ average }) => check4NaN(average))
  .return(({ check }) => check);

pipe(
  program,
  E.fold(
    (error) => console.error(error.message),
    (avgNumber) => console.log(avgNumber),
  ),
);
