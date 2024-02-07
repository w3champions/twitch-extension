export enum Segment {
  Global = "global",
  Developer = "developer",
  Broadcaster = "broadcaster"
}

export enum EGameMode {
  UNDEFINED,
  GM_1ON1 = 1,
  GM_2ON2 = 2,
  GM_2ON2_AT = 6,
  GM_4ON4 = 4,
  GM_FFA = 5
}

export enum ERaceEnum {
  RANDOM = 0,
  HUMAN = 1,
  ORC = 2,
  NIGHT_ELF = 4,
  UNDEAD = 8,
  TOTAL = 16
}

export interface PlayerInTeam {
  oldMmr: number;
  currentMmr: number;
  battleTag: string;
  name: string;
  mmrGain: number;
  race: ERaceEnum;
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
  Asia = 30
}

export interface Match {
  map: string;
  mapName: string;
  id: number;
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
  icon: string;
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
  CONFIG = "config"
}

export enum HelperPlaybackMode {
  VIDEO = "video",
  AUDIO = "audio",
  REMOTE = "remote",
  CHAT_ONLY = "chat-only"
}

export enum TwitchTheme {
  DARK = "dark",
  LIGHT = "light"
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
