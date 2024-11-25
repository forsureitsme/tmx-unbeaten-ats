import type {
  IMapPack,
  IMapPacksBySeason,
  MapMonitorUnbeatenAt,
  MapPackField,
  TmxTrack,
} from "types";

const tmxApiBaseUrl = "https://trackmania.exchange/api";
const startingSeason = 3;
const mapPacksBySeason: IMapPacksBySeason = {};
const seasonFields = ["id", "secret"];

let season = startingSeason;
while (process.env[`SEASON_${season}_ID`]) {
  mapPacksBySeason[season] = {};

  seasonFields.forEach((field: MapPackField) => {
    mapPacksBySeason[season][field] = process.env[
      `SEASON_${season}_${(field as string).toUpperCase()}`
    ] as string;
  });

  season++;
}

const allUnbeatenATs = await fetch(
  "https://map-monitor.xk.io/tmx/unbeaten_ats",
).then((r) => r.json());
const unbeatenTrackIds: number[] = allUnbeatenATs.tracks.map(
  (t: MapMonitorUnbeatenAt) => t[0],
);

const removeTrackFromMapPack = async (trackId: number, mapPack: IMapPack) => {
  const r = await fetch(
    `${tmxApiBaseUrl}/mappack/manage/${mapPack.id}/remove_map/${trackId}?secret=${mapPack.secret}`,
    {
      method: "DELETE",
    },
  ).then((r) => r.json());
  console.log(`${trackId}: ${r.Message}`);
};

const addTrackToMapPack = async (trackId: number, mapPack: IMapPack) => {
  const r = await fetch(
    `${tmxApiBaseUrl}/mappack/manage/${mapPack.id}/add_map/${trackId}?secret=${mapPack.secret}`,
    {
      method: "POST",
    },
  ).then((r) => r.json());
  console.log(`${trackId}: ${r.Message}`);
};

Object.keys(mapPacksBySeason).forEach(async (s) => {
  const mapPack = mapPacksBySeason[s];
  const mapPackTracks = await fetch(
    `${tmxApiBaseUrl}/mappack/get_mappack_tracks/${mapPack.id}?secret=${mapPack.secret}`,
  ).then((r) => r.json());

  const mapPackTrackIds: number[] = mapPackTracks.map(
    (m: TmxTrack) => m.TrackID,
  );
  const unbeatenThisSeason = unbeatenTrackIds.filter(
    (id) => id >= (+s - 1) * 100000 && id < +s * 100000,
  );

  const beatenMapsInMapPack = mapPackTrackIds.filter(
    (id) => !unbeatenThisSeason.includes(id),
  );
  await beatenMapsInMapPack.reduce(async (_, trackId) => {
    await removeTrackFromMapPack(trackId, mapPack);
  }, Promise.resolve());
  console.log("Finished removing beaten maps.");

  const unbeatenMapsNotInMapPack = unbeatenThisSeason.filter(
    (id) => !mapPackTrackIds.includes(id),
  );
  await unbeatenMapsNotInMapPack.reduce(async (_, trackId) => {
    await addTrackToMapPack(trackId, mapPack);
  }, Promise.resolve());
  console.log("Finished adding unbeaten maps.");
});
