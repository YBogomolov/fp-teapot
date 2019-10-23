import * as O from 'fp-ts/lib/Option';
import { pipe } from 'fp-ts/lib/pipeable';

import Option = O.Option;

const a: Option<number> = O.some(41);

const addOne = (n: number) => n + 1;

const aPlusOne = O.map(addOne)(a);

const aPlusTwo = pipe(
  a,
  O.map(addOne),
  O.map(addOne),
);

console.log(aPlusOne);
console.log(aPlusTwo);

const one: number | null = pipe(
  aPlusOne,
  O.fold(
    () => null,
    (n) => n,
  ),
);

const two: number | null = pipe(
  aPlusTwo,
  O.toNullable,
);

// O.toNullable(aPlusTwo);

console.log(one, two);
