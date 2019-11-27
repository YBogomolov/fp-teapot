#!/usr/bin/env ts-node

import { run } from 'fp-ts/lib/ReaderTaskEither';

import { program } from './program';

// Шаг 6: на краю мира мы можем, наконец-то, запустить наш код:
run(program, process.env);
