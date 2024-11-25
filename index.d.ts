export interface IMapPack {
  [field: string]: string;
}
export type MapPackField = keyof IMapPack;
export interface IMapPacksBySeason {
  [s: string]: IMapPack | Record<string, never>;
}
export type Season = keyof IMapPacksBySeason;

export type MapId = number;

export type MapMonitorUnbeatenAt = ArrayLike<{
  0: MapId;
}>;

export enum TmxMapStatus {
  "Approved" = 0,
  "Pending" = 1,
  "Changes Requested" = 2,
  "Declined" = 3,
  "Retired" = 4,
}

export type TmxTrack = {
  TrackID: MapId;
  Status: TmxMapStatus;
};
