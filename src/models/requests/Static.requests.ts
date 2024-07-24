import { ParamsDictionary } from 'express-serve-static-core';

export interface ServeImageParams extends ParamsDictionary {
  name: string;
}
