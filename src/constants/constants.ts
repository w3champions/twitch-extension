import { EGameMode } from "@/typings";

export const heroNames = {
  all: "Any hero selection",
  none: "No hero selection",
  archmage: "Archmage",
  alchemist: "Goblin Alchemist",
  avatarofflame: "Firelord",
  bansheeranger: "Dark Ranger",
  beastmaster: "Beastmaster",
  blademaster: "Blademaster",
  cryptlord: "Crypt Lord",
  deathknight: "Death Knight",
  demonhunter: "Demon Hunter",
  dreadlord: "Dread Lord",
  farseer: "Farseer",
  keeperofthegrove: "Keeper of the Grove",
  lich: "Lich",
  mountainking: "Mountain King",
  paladin: "Paladin",
  pandarenbrewmaster: "Pandaren Brewmaster",
  pitlord: "Pit Lord",
  priestessofthemoon: "Priestress of the Moon",
  seawitch: "Naga Sea Witch",
  shadowhunter: "Shadow Hunter",
  sorceror: "Bloodmage",
  taurenchieftain: "Tauren Chieftain",
  tinker: "Goblin Tinker",
  warden: "Warden",
};

export const leagues = [
  "grandmaster",
  "master",
  "adept",
  "diamond",
  "platinum",
  "gold",
  "silver",
  "bronze",
  "grass",
];

export const leagueNames: { [key: string]: string } = {
  grandmaster: "Grandmaster",
  master: "Master",
  adept: "Adept",
  diamond: "Diamond",
  platinum: "Platinum",
  gold: "Gold",
  silver: "Silver",
  bronze: "Bronze",
  grass: "Grass",
};

export const gameModes = {
  [EGameMode.UNDEFINED]: "Unknown",
  [EGameMode.GM_1ON1]: "1 vs 1",
  [EGameMode.GM_2ON2]: "2 vs 2",
  [EGameMode.GM_3ON3]: "3 vs 3",
  [EGameMode.GM_4ON4]: "4 vs 4",
  [EGameMode.GM_FFA]: "FFA",
  [EGameMode.GM_2ON2_AT]: "2 vs 2 AT",
  [EGameMode.GM_3ON3AT]: "3 vs 3 AT",
  [EGameMode.GM_4ON4_AT]: "4 vs 4 AT",
  [EGameMode.GM_CUSTOM]: "Custom",
  [EGameMode.GM_1ON1_TOURNAMENT]: "1 vs 1 Tournament",
  [EGameMode.GM_LEGION_4v4_X20]: "Legion 4v4 x20",
  [EGameMode.GM_LEGION_1v1_x20]: "Legion 1v1 x20",
  [EGameMode.GM_LEGION_4v4_X20_AT]: "Legion 4v4 x20 AT",
  [EGameMode.GM_LEGION_2v2_X20]: "Legion 2v2 x20",
  [EGameMode.GM_ROC_1ON1]: "RoC 1v1",
  [EGameMode.GM_LTW_1ON1]: "LTW 1v1",
  [EGameMode.GM_LTW_FFA]: "LTW FFA",
  [EGameMode.GM_FROSTCRAFT_4ON4]: "Frostcraft 4v4",
  [EGameMode.GM_ATR_1ON1]: "All the Randoms 1v1",
  [EGameMode.GM_BANJOBALL_4ON4]: "Banjoball 4v4",
  [EGameMode.GM_PTR_1ON1]: "PTR 1v1",
  [EGameMode.GM_DOTA_5ON5]: "DotA 5v5",
  [EGameMode.GM_DOTA_5ON5_AT]: "DotA 5v5 AT",
  [EGameMode.GM_SC_FFA_4]: "Survival Chaos FFA 4",
  [EGameMode.GM_SC_OZ]: "Survival Chaos OZ",
  [EGameMode.GM_DS]: "Direct Strike",
  [EGameMode.GM_DS_AT]: "Direct Strike AT",
  [EGameMode.GM_WARHAMMER_1ON1]: "Warhammer 1v1",
  [EGameMode.GM_CF]: "Castle Fight",
  [EGameMode.GM_CF_AT]: "Castle Fight AT",
  [EGameMode.GM_RISK_EUROPE_1ON1]: "Risk Europe 1v1",
  [EGameMode.GM_MINIDOTA_3ON3]: "MiniDota 3v3",
  [EGameMode.GM_MINIDOTA_3ON3_AT]: "MiniDota 3v3 AT",
};

export const raceNames = {
  [0]: "Random",
  [1]: "Human",
  [2]: "Orc",
  [4]: "Night Elf",
  [8]: "Undead",
  [16]: "Total",
};

export const atEquivalent: { [key: number]: EGameMode } = {
  [EGameMode.GM_2ON2]: EGameMode.GM_2ON2_AT,
  [EGameMode.GM_3ON3]: EGameMode.GM_3ON3AT,
  [EGameMode.GM_4ON4]: EGameMode.GM_4ON4_AT,
  [EGameMode.GM_LEGION_4v4_X20]: EGameMode.GM_LEGION_4v4_X20_AT,
  [EGameMode.GM_DOTA_5ON5]: EGameMode.GM_DOTA_5ON5_AT,
  [EGameMode.GM_DS]: EGameMode.GM_DS_AT,
  [EGameMode.GM_CF]: EGameMode.GM_CF_AT,
  [EGameMode.GM_MINIDOTA_3ON3]: EGameMode.GM_MINIDOTA_3ON3_AT,
};

// Game mode categories
export const gameModes1v1 = [
  EGameMode.GM_1ON1,
  EGameMode.GM_ROC_1ON1,
  EGameMode.GM_LTW_1ON1,
  EGameMode.GM_ATR_1ON1,
  EGameMode.GM_PTR_1ON1,
  EGameMode.GM_WARHAMMER_1ON1,
  EGameMode.GM_RISK_EUROPE_1ON1,
  EGameMode.GM_LEGION_1v1_x20,
];

export const gameModesFFA = [
  EGameMode.GM_FFA,
  EGameMode.GM_LTW_FFA,
  EGameMode.GM_SC_FFA_4,
  EGameMode.GM_SC_OZ,
];

export const gameModesAT = [
  EGameMode.GM_2ON2_AT,
  EGameMode.GM_3ON3AT,
  EGameMode.GM_4ON4_AT,
  EGameMode.GM_LEGION_4v4_X20_AT,
  EGameMode.GM_DOTA_5ON5_AT,
  EGameMode.GM_DS_AT,
  EGameMode.GM_CF_AT,
  EGameMode.GM_MINIDOTA_3ON3_AT,
];

// The twitch extension's ID
export const TwitchClientID = "38ac0gifyt5khcuq23h2p8zpcqosbc";
