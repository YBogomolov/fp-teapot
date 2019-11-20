import * as E from 'fp-ts/lib/Either';
import { pipe } from 'fp-ts/lib/pipeable';

import Either = E.Either;

export const parseJson = (input: string): Either<Error, number[]> => {
  try {
    const numbers = JSON.parse(input);
    return E.right(numbers);
  } catch (error) {
    return E.left(error);
  }
};

export const avg = (ns: number[]): Either<Error, number> => {
  const total = ns.length;
  if (total === 0) {
    return E.left(new Error('Empty input'));
  }
  const sum = ns.reduce((a, b) => a + b, 0);
  return E.right(sum / total);
};

export const check4NaN = (n: number): Either<Error, number> => {
  if (isNaN(n)) {
    return E.left(new Error('Numbers only, MF!'));
  } else {
    return E.right(n);
  }
};

export const inp = E.fromNullable(new Error('Argv[2] is missing'));

export const result = (input: string) => pipe(
  inp(input),
  E.chain(parseJson),
  E.chain(avg),
  E.chain(check4NaN),
);
