# TMX Unbeaten ATs

Updater for Season 3(and hopefully future ones) of Unbeaten ATs mappack in Trackmania Exchange


## Prerequisites

- git
- A typescript runtime of your preference (instructions will be for `bun`)

## Installation 

- Clone the project

```bash
git clone git@github.com:forsureitsme/tmx-unbeaten-ats.git
```

- Go to the project directory and install dependencies

```bash
cd tmx-unbeaten-ats
bun i
```

- Adjust environment variables

Create an `.env` file at the root and add the following environment variables to it:

```.env
# ID of the mappack (Can be found on mappack page)
SEASON_3_ID=
```
![Mappack ID location](https://github.com/user-attachments/assets/1bf35488-b16f-4da8-bbc2-5cfc9344e7c8)


```.env
# Mappack secret API Key (Can be found on `Edit Mappack Info` page)
SEASON_3_SECRET=
```
![Secret API Key location](https://github.com/user-attachments/assets/23910d39-bcc6-4a80-8424-e265d06baefd)


## Usage

After setting up, run the following command

```bash
bun run index.ts
```
