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
  const beatenMapsInMapPack = mapPackTracks.filter(
    (t) => !unbeatenThisSeason.includes(t.TrackID),
  );
  await beatenMapsInMapPack.reduce(async (_, t) => {
    await TMXAPI.removeTrackFromMapPack(t.TrackID, mapPack);
  }, Promise.resolve());
  console.log("## Finished removing beaten maps.");
};

//const approvePendingUnbeatenMapsOnMapPack = async (
//  mapPackTracks: TmxTrack[],
//  unbeatenThisSeason: MapId[],
//  mapPack: IMapPack,
//) => {
//  console.log("# Approving pending unbeaten maps.");
//  const pendingUnbeatenMapsInMapPack = mapPackTracks.filter(
//    (t) =>
//      t.Status === TmxMapStatus.Pending &&
//      !unbeatenThisSeason.includes(t.TrackID),
//  );
//  await pendingUnbeatenMapsInMapPack.reduce(async (_, t) => {
//    await TMXAPI.setTrackStatusOnMapPack(
//      t.TrackID,
//      TmxMapStatus.Approved,
//      mapPack,
//    );
//  }, Promise.resolve());
//  console.log("## Finished approving pending unbeaten maps.");
//};

const addUnbeatenMapsToMapPack = async (
  mapPackTracks: TmxTrack[],
  unbeatenThisSeason: MapId[],
  mapPack: IMapPack,
) => {
  console.log("# Adding unbeaten maps.");
  const unbeatenMapsNotInMapPack = unbeatenThisSeason.filter(
    (id) => !mapPackTracks.some((t: TmxTrack) => t.TrackID === id),
  );
  await unbeatenMapsNotInMapPack.reduce(async (_, trackId) => {
    await TMXAPI.addTrackToMapPack(trackId, mapPack);
  }, Promise.resolve());
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
