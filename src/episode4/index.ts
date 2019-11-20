import * as E from 'fp-ts/lib/Either';
import { pipe } from 'fp-ts/lib/pipeable';
import {
  chain,
  fromEither,
  map,
  ReaderTaskEither,
} from 'fp-ts/lib/ReaderTaskEither';
import * as TE from 'fp-ts/lib/TaskEither';
import { promises as fs } from 'fs';
import { getDefaultContext } from 'io-ts';
import { mergeDeepRight } from 'ramda';

import { Config, ConfigPartial, TConfig } from './types';

const defaultContext = getDefaultContext(TConfig);

const read = (paths: string[]): ReaderTaskEither<void, Error, ConfigPartial[]> =>
  () => TE.tryCatch(
    () => Promise.all(paths.map(
      (path) => fs.readFile(path, { encoding: 'utf8' }).then(
        (configStr: string) => JSON.parse(configStr) as ConfigPartial,
      ),
    )),
    (reason) => new Error(String(reason)),
  );

const validatedConfig: ReaderTaskEither<void, Error, Config> = pipe(
  read(['./src/episode4/config/common.json', './src/episode4/config/dev.json']),
  map((configs) => configs.reduce(mergeDeepRight, {})),
  chain((config) => fromEither(pipe(
    TConfig.validate(config, defaultContext),
    E.mapLeft((errs) => new Error(errs.join('|'))),
  ))),
);

// ---------

async function main(config: Config) {
  console.dir(config, { depth: null });
}

main({}).catch((err) => {
  console.log(err.stack || err.message || err);
  process.exit(1);
});
