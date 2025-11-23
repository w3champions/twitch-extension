import type { heroNames } from "./constants/constants";

export enum Segment {
  Global = "global",
  Developer = "developer",
  Broadcaster = "broadcaster",
}

export enum EGameMode {
  UNDEFINED = 0,
  GM_1ON1 = 1,
  GM_2ON2 = 2,
  GM_3ON3 = 3,
  GM_4ON4 = 4,
  GM_FFA = 5,
  GM_2ON2_AT = 6,
  GM_3ON3AT = 7,
  GM_4ON4_AT = 8,
  GM_CUSTOM = 9,

  GM_1ON1_TOURNAMENT = 11,

  GM_LEGION_4v4_X20 = 202,
  GM_LEGION_1v1_x20 = 203,
  GM_LEGION_4v4_X20_AT = 204,
  GM_LEGION_2v2_X20 = 205,

  GM_ROC_1ON1 = 301,

  GM_LTW_1ON1 = 401,
  GM_LTW_FFA = 402,

  GM_FROSTCRAFT_4ON4 = 501,

  GM_ATR_1ON1 = 601,

  GM_BANJOBALL_4ON4 = 701,

  GM_PTR_1ON1 = 801,

  GM_DOTA_5ON5 = 901,
  GM_DOTA_5ON5_AT = 902,

  GM_SC_FFA_4 = 1001,
  GM_SC_OZ = 1002,

  GM_DS = 1101,
  GM_DS_AT = 1102,

  GM_WARHAMMER_1ON1 = 1201,

  GM_CF = 1301,
  GM_CF_AT = 1302,

  GM_RISK_EUROPE_1ON1 = 1401,

  GM_MINIDOTA_3ON3 = 1501,
  GM_MINIDOTA_3ON3_AT = 1502,
}

export const AT_EQUIVALENT: { [key: number]: EGameMode } = {
  [EGameMode.GM_2ON2]: EGameMode.GM_2ON2_AT,
  [EGameMode.GM_4ON4]: EGameMode.GM_4ON4_AT,
  [EGameMode.GM_LEGION_4v4_X20]: EGameMode.GM_LEGION_4v4_X20_AT,
  [EGameMode.GM_DOTA_5ON5]: EGameMode.GM_DOTA_5ON5_AT,
  [EGameMode.GM_DS]: EGameMode.GM_DS_AT,
  [EGameMode.GM_CF]: EGameMode.GM_CF_AT,
  [EGameMode.GM_MINIDOTA_3ON3]: EGameMode.GM_MINIDOTA_3ON3_AT,
};

export enum ERaceEnum {
  RANDOM = 0,
  HUMAN = 1,
  ORC = 2,
  NIGHT_ELF = 4,
  UNDEAD = 8,
  TOTAL = 16,
}
export type ERandomRace =
  | ERaceEnum.HUMAN
  | ERaceEnum.ORC
  | ERaceEnum.NIGHT_ELF
  | ERaceEnum.UNDEAD;

export interface PlayerInTeam {
  oldMmr: number;
  currentMmr: number;
  battleTag: string;
  name: string;
  mmrGain: number;
  race: ERaceEnum;
  rndRace: ERandomRace | null;
  won: boolean;
  location?: string;
  countryCode?: string;
  twitch?: string;
}

export interface Team {
  players: PlayerInTeam[];
  won?: boolean;
}

export interface PlayerServerInfo {
  battleTag: string;
  averagePing: number;
  currentPing: number;
}

export interface ServerInfo {
  provider: string;
  countryCode: string;
  location: string;
  name: string;
  nodeId: number;
  playerServerInfos: PlayerServerInfo[];
}

export enum Gateways {
  America = 10,
  Europe = 20,
  Asia = 30,
}

export interface Match {
  map: string;
  mapName: string;
  id: string;
  durationInSeconds: number;
  number: number;
  startTime: string;
  endTime: string;
  gameMode: EGameMode;
  teams: Team[];
  gateWay: Gateways;
  season: number;
  serverInfo: ServerInfo;
}

export interface OngoingMatch extends Match {
  teams: Team[];
}

export interface UnitScore {
  unitsProduced: number;
  unitsKilled: number;
  largestArmy: number;
}

export interface Hero {
  icon: keyof typeof heroNames;
  level: number;
}

export interface HeroScore {
  heroesKilled: number;
  itemsObtained: number;
  mercsHired: number;
  expGained: number;
}

export interface ResourceScore {
  goldCollected: number;
  lumberCollected: number;
  goldUpkeepLost: number;
}

export interface PlayerScore {
  battleTag: string;
  unitScore: UnitScore;
  heroes: Hero[];
  heroScore: HeroScore;
  resourceScore: ResourceScore;
}

export interface MatchDetail {
  match: Match;
  playerScores: PlayerScore[];
}

export interface TwitchAuthorizationContext {
  channelId: string;
  clientId: string;
  userId: string;
  token: string;
}

export enum HelperMode {
  VIEWER = "viewer",
  DASHBOARD = "dashboard",
  CONFIG = "config",
}

export enum HelperPlaybackMode {
  VIDEO = "video",
  AUDIO = "audio",
  REMOTE = "remote",
  CHAT_ONLY = "chat-only",
}

export enum TwitchTheme {
  DARK = "dark",
  LIGHT = "light",
}

export interface TwitchContext {
  arePlayerControlsVisible: boolean;
  bitrate: number;
  bufferSize: number;
  displayResolution: number;
  game: string;
  hlsLatencyBroadcaster: number;
  hostingInfo:
    | { hostedChannelId: string; hostingChannelId: string }
    | undefined;
  isFullScreen: boolean;
  isMuted: boolean;
  isPaused: boolean;
  isTheatreMode: boolean;
  language: string;
  mode: HelperMode;
  playbackMode: HelperPlaybackMode;
  theme: TwitchTheme;
  videoResolution: string;
  volume: number;
}

export interface PlayerId {
  name: string;
  battleTag: string;
}

export interface ModeStat {
  id: string;
  gameMode: EGameMode;
  gateWay: Gateways;
  race: ERaceEnum;
  wins: number;
  losses: number;
  games: number;
  winrate: number;
  mmr: number;
  leagueId: number;
  leagueOrder: number;
  division: number;
  rank: number;
  season: number;
  rankingPoints: number;
  playerIds: PlayerId[];
  quantile: number;
}

export interface TwitchToken {
  access_token: string;
  expires_in: number;
  token_type: string;
}

export interface TwitchStreamResponse {
  data: TwitchStreamStatus[];
}

export interface TwitchStreamStatus {
  id: string;
  user_id?: string;
  user_name: string;
  game_id: string;
  type: string;
  title: string;
  viewer_count: number;
  started_at: string;
  language: string;
}

export interface Season {
  id: number;
}
export type RaceStat = {
  race: ERaceEnum;
  gateWay: Gateways;
  season: number;
  wins: number;
  losses: number;
  games: number;
  winrate: number;
};

export type AliasData = {
  id: number;
  name: string | null;
  main_race: string | null;
  country: string | null;
  liquipedia: string | null;
};

export interface PlayerProfile {
  id: string;
  name: string;
  battleTag: string;
  participatedInSeasons: Season[];
  winLosses: RaceStat[];
  playerAkaData: AliasData;
}
