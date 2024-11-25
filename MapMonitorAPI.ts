import { MapMonitorUnbeatenAt } from "index.d";

export default class MapMonitorAPI {
  static baseUrl = "https://map-monitor.xk.io";

  static getUnbeatenTracks = async () => {
    const allUnbeatenATs = await fetch(`${this.baseUrl}/tmx/unbeaten_ats`).then(
      (r) => r.json(),
    );
    return allUnbeatenATs.tracks.map((t: MapMonitorUnbeatenAt) => t[0]);
  };
}
