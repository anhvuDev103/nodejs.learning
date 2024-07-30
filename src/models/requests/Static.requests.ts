import { ParamsDictionary } from 'express-serve-static-core';

export interface ServeImageParams extends ParamsDictionary {
  name: string;
}

export interface ServeM3u8Params extends ParamsDictionary {
  id: string;
}

export interface ServeSegmentParams extends ParamsDictionary {
  id: string;
  v: string;
  segment: string;
}

export interface VideoStatusParams extends ParamsDictionary {
  id: string;
}
