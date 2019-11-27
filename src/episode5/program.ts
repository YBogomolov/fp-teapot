import { sequenceT } from 'fp-ts/lib/Apply';
import * as C from 'fp-ts/lib/Console';
import * as E from 'fp-ts/lib/Either';
import { absurd } from 'fp-ts/lib/function';
import { pipe } from 'fp-ts/lib/pipeable';
import * as RTE from 'fp-ts/lib/ReaderTaskEither';
import * as T from 'fp-ts/lib/Task';
import * as TE from 'fp-ts/lib/TaskEither';
import { promises as fs } from 'fs';
import { getDefaultContext } from 'io-ts';
import { PathReporter } from 'io-ts/lib/PathReporter';
import { mergeDeepRight } from 'ramda';

import { Config, ConfigPartial, TConfig } from '../episode4/types';

import { FileReadingError, MissingEnvVariableError, ValidationError } from './errors';

import TaskEither = TE.TaskEither;
import ReaderTaskEither = RTE.ReaderTaskEither;

const defaultContext = getDefaultContext(TConfig);
// seqE :: (ea: Either<E, A>, eb: Either<E, B>, ...) => Either<E, [A, B, ...]>
const seqE = sequenceT(E.either);

// Шаг 1: читаем две строки с путями из окружения процесса:
export const readEnv: ReaderTaskEither<NodeJS.ProcessEnv, MissingEnvVariableError, string[]> =
  (env) => TE.fromIOEither(
    () => seqE(
      E.fromNullable(new MissingEnvVariableError('COMMON was not defined'))(env.COMMON),
      E.fromNullable(new MissingEnvVariableError('DEV was not defined'))(env.DEV),
    ),
  );

// Шаг 2: читаем файлы по переданным путям:
export const read: ReaderTaskEither<string[], FileReadingError, ConfigPartial[]> =
  (paths) => TE.tryCatch(
    () => Promise.all<ConfigPartial>(paths.map(
      async (path) => {
        const configStr = await fs.readFile(path, { encoding: 'utf8' });
        return JSON.parse(configStr);
      }),
    ),
    (reason) => new FileReadingError(String(reason)),
  );

// Шаг 3: сливаем и валидируем прочитанные конфиги:
export const validatedConfig: ReaderTaskEither<string[], ValidationError, Config> =
  pipe(
    read,
    RTE.map((partials) => partials.reduce(mergeDeepRight, {})),
    RTE.chain((config) => RTE.fromEither(pipe(
      TConfig.validate(config, defaultContext),
      E.mapLeft((errs) => new ValidationError(PathReporter.report(E.left(errs)).join('\n'))),
    ))),
  );

// Шаг 4: нормальная бизнес-логика — логируем конфиг, запускаем сервер, выходим из приложения…
export const logEnv: ReaderTaskEither<Config, never, void> =
  (config) => TE.rightIO(C.log(config));

export const startServer: ReaderTaskEither<Config, Error, never> =
  (_config) => TE.tryCatch(
    async () => {
      while (true) { /* Старт сервера с использованием данных из config; обработка запросов */ }
    },
    (reason) => new Error(String(reason)),
  );

export const logAndStart: ReaderTaskEither<Config, Error, never> =
  pipe(
    logEnv,
    RTE.chain(() => startServer),
  );

export const exit: TaskEither<never, never> =
  async () => E.right(process.exit(1));

// Шаг 5: связываем все кусочки логики воедино:
export const program: ReaderTaskEither<NodeJS.ProcessEnv, never, never> =
  (env) => pipe(
    readEnv(env),
    TE.chain(validatedConfig),
    TE.chain(logAndStart),
    TE.fold(
      // Error => TaskEither<never, never>
      (err) => pipe(
        TE.rightIO(C.log(err.message)),
        TE.chain(() => {
          switch (true) { // паттерн-матчинг для бедных
            case err instanceof FileReadingError:
            case err instanceof ValidationError:
            case err instanceof MissingEnvVariableError:
              return exit;
            default:
              return T.delay(1000)(program(env)); // крутимся непрерывно с задержкой в 1 секунду
          }
        }),
      ),
      // never => never
      absurd, // функция, которую никогда нельзя вызвать: const absurd: <A>(x: never) => A;
    ),
  );
