#!/usr/bin/env ts-node

import * as E from 'fp-ts/lib/Either';
import { pipe } from 'fp-ts/lib/pipeable';

import { result } from './avg';

pipe(
  result(process.argv[2]),
  E.fold(
    (error) => console.error(error.message),
    (avgNumber) => console.log(avgNumber),
  ),
);
