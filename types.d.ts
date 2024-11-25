export interface IMapPack {
  [id?: string]: string;
  [secret?: string]: string;
}
export type MapPackField = keyof IMapPack;
export interface IMapPacksBySeason {
  [s: string]: IMapPack | Record<string, never>;
}
export type Season = keyof IMapPacksBySeason;

export type MapMonitorUnbeatenAt = ArrayLike<{
  0: number;
}>;

export type TmxTrack = {
  TrackID: number;
};
