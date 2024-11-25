import { IMapPack, TmxMapStatus } from "index.d";

export default class TMXAPI {
  static baseUrl = "https://trackmania.exchange/api";

  static removeTrackFromMapPack = async (
    trackId: number,
    mapPack: IMapPack,
  ) => {
    const r = await fetch(
      `${this.baseUrl}/mappack/manage/${mapPack.id}/remove_map/${trackId}?secret=${mapPack.secret}`,
      {
        method: "DELETE",
      },
    ).then(async (r) => await r.json());
    console.log(`${trackId}: ${r.Message}`);
  };

  static addTrackToMapPack = async (trackId: number, mapPack: IMapPack) => {
    const r = await fetch(
      `${this.baseUrl}/mappack/manage/${mapPack.id}/add_map/${trackId}?secret=${mapPack.secret}`,
      {
        method: "POST",
      },
    ).then(async (r) => await r.json());
    console.log(`${trackId}: ${r.Message}`);
  };

  static setTrackStatusOnMapPack = async (
    trackId: number,
    mapStatus: TmxMapStatus,
    mapPack: IMapPack,
  ) => {
    const r = await fetch(
      `${this.baseUrl}/mappack/manage/${mapPack.id}/map_status/${mapStatus}/${trackId}?secret=${mapPack.secret}`,
      {
        method: "POST",
      },
    ).then(async (r) => await r.json());
    console.log(`${trackId}: ${r.Message}`);
  };

  static getMapPackTracks = async (mapPack: IMapPack) =>
    await fetch(
      `${this.baseUrl}/mappack/get_mappack_tracks/${mapPack.id}?secret=${mapPack.secret}`,
    ).then(async (r) => await r.json());
}
