const tmxApiBaseUrl = "https://trackmania.exchange/api";
const startingSeason = 3;
const mapPacksBySeason = {};
const seasonFields = ["id", "secret"];

let season = startingSeason;
while (process.env[`SEASON_${season}_ID`]) {
  mapPacksBySeason[season] = {};

  seasonFields.forEach((field) => {
    mapPacksBySeason[season][field] =
      process.env[`SEASON_${season}_${field.toUpperCase()}`];
  });

  season++;
}

const allUnbeatenATs = await fetch(
  "https://map-monitor.xk.io/tmx/unbeaten_ats",
).then((r) => r.json());
const unbeatenTrackIds = allUnbeatenATs.tracks.map((t) => t[0]);

const removeTrackFromMapPack = async (trackId, mapPack) => {
  await fetch(
    `${tmxApiBaseUrl}/mappack/manage/${mapPack.id}/remove_map/${trackId}?secret=${mapPack.secret}`,
    {
      method: "DELETE",
    },
  );
};

const addTrackToMapPack = async (trackId, mapPack) => {
  await fetch(
    `${tmxApiBaseUrl}/mappack/manage/${mapPack.id}/add_map/${trackId}?secret=${mapPack.secret}`,
    {
      method: "POST",
    },
  );
};

Object.keys(mapPacksBySeason).forEach(async (s) => {
  const mapPack = mapPacksBySeason[s];
  const mapPackTracks = await fetch(
    `${tmxApiBaseUrl}/mappack/get_mappack_tracks/${mapPack.id}?secret=${mapPack.secret}`,
  ).then((r) => r.json());

  const mapPackTrackIds = mapPackTracks.map((m) => m.TrackID);
  const unbeatenThisSeason = unbeatenTrackIds.filter(
    (id) => id >= (+s - 1) * 100000 && id < +s * 100000,
  );

  const beatenMapsInMapPack = mapPackTrackIds.filter(
    (id) => !unbeatenThisSeason.includes(id),
  );
  await beatenMapsInMapPack
    .reduce((p, trackId) => {
      return p
        .then(async () => await removeTrackFromMapPack(trackId, mapPack))
        .then(() => {
          console.log(
            `Map beaten removed from Season ${s}'s mappack: ${trackId}`,
          );
        });
    }, Promise.resolve())
    .then(() => {
      console.log("Finished removing beaten maps.");
    });

  const unbeatenMapsNotInMapPack = unbeatenThisSeason.filter(
    (id) => !mapPackTrackIds.includes(id),
  );
  await unbeatenMapsNotInMapPack
    .reduce((p, trackId) => {
      return p
        .then(async () => await addTrackToMapPack(trackId, mapPack))
        .then(() => {
          console.log(`Map added to Season ${s}'s mappack: ${trackId}`);
        });
    }, Promise.resolve())
    .then(() => {
      console.log("Finished adding unbeaten maps.");
    });
});
