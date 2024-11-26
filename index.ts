import {
  IMapPack,
  IMapPacksBySeason,
  MapId,
  MapPackField,
  //TmxMapStatus,
  TmxTrack,
} from "index.d";
import TMXAPI from "TMXAPI";
import MapMonitorAPI from "MapMonitorAPI";

const startingSeason = 3;
const mapPacksBySeason: IMapPacksBySeason = {};
const seasonFields = ["id", "secret"];

let season = startingSeason;
while (
  process.env[`SEASON_${season}_ID`] &&
  process.env[`SEASON_${season}_SECRET`]
) {
  mapPacksBySeason[season] = {};

  seasonFields.forEach((field: MapPackField) => {
    mapPacksBySeason[season][field] = process.env[
      `SEASON_${season}_${(field as string).toUpperCase()}`
    ] as string;
  });

  season++;
}
const removeBeatenMapsFromMapPack = async (
  mapPackTracks: TmxTrack[],
  unbeatenThisSeason: MapId[],
  mapPack: IMapPack,
) => {
  console.log("# Removing beaten maps from mappack.");
  for (const tmxTrack of mapPackTracks) {
    if (!unbeatenThisSeason.includes(tmxTrack.TrackID))
      await TMXAPI.removeTrackFromMapPack(tmxTrack.TrackID, mapPack);
  }
  console.log("## Finished removing beaten maps.");
};

// TODO: Don't loop again through mapPackTracks.
// Refactor in such a way this and `removeBeatenMapsFromMapPack` loop through the array once
//const approvePendingUnbeatenMapsOnMapPack = async (
//  mapPackTracks: TmxTrack[],
//  unbeatenThisSeason: MapId[],
//  mapPack: IMapPack,
//) => {
//  console.log("# Approving pending unbeaten maps.");
//  for (const tmxTrack of mapPackTracks) {
//    if (
//      tmxTrack.Status === TmxMapStatus.Pending &&
//      !unbeatenThisSeason.includes(tmxTrack.TrackID)
//    ) {
//      await TMXAPI.setTrackStatusOnMapPack(
//        tmxTrack.TrackID,
//        TmxMapStatus.Approved,
//        mapPack,
//      );
//    }
//  }
//  console.log("## Finished approving pending unbeaten maps.");
//};

const addUnbeatenMapsToMapPack = async (
  mapPackTracks: TmxTrack[],
  unbeatenThisSeason: MapId[],
  mapPack: IMapPack,
) => {
  console.log("# Adding unbeaten maps.");
  for (const unbeatenTrackId of unbeatenThisSeason) {
    if (
      !mapPackTracks.some(
        (tmxTrack: TmxTrack) => tmxTrack.TrackID === unbeatenTrackId,
      )
    )
      await TMXAPI.addTrackToMapPack(unbeatenTrackId, mapPack);
  }
  console.log("## Finished adding unbeaten maps.");
};

const unbeatenTrackIds = await MapMonitorAPI.getUnbeatenTracks();
Object.keys(mapPacksBySeason).forEach(async (season) => {
  const mapPack = mapPacksBySeason[season];
  const mapPackTracks = await TMXAPI.getMapPackTracks(mapPack);

  const unbeatenThisSeason = unbeatenTrackIds.filter(
    (id: MapId) => id >= (+season - 1) * 100000 && id < +season * 100000,
  );

  await removeBeatenMapsFromMapPack(mapPackTracks, unbeatenThisSeason, mapPack);
  // Uncomment after https://api2.mania.exchange/Issue/Index/18 resolves
  // Status is missing in Tmx Track responses
  //await approvePendingUnbeatenMapsOnMapPack(
  //  mapPackTracks,
  //  unbeatenThisSeason,
  //  mapPack,
  //);
  await addUnbeatenMapsToMapPack(mapPackTracks, unbeatenThisSeason, mapPack);
});
