import * as io from 'io-ts';

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends Array<infer U>
  ? Array<DeepPartial<U>>
  : T[P] extends ReadonlyArray<infer R>
  ? ReadonlyArray<DeepPartial<R>>
  : DeepPartial<T[P]>
};

export const TPaths = io.keyof({
  uploads: null,
  static: null,
});

export const TBind = io.type({
  host: io.string,
  port: io.number,
});

export const TServer = io.type({
  bind: TBind,
  paths: io.record(TPaths, io.string),
});

export const TSite = io.type({
  domain: io.string,
  url: io.string,
  title: io.string,
});

export const TConfig = io.type({
  server: TServer,
  site: TSite,
});

export type Config = typeof TConfig._A;

export type ConfigPartial = DeepPartial<Config>;
