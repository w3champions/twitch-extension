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

export interface Match {
  map: string;
  id: number;
  durationInSeconds: number;
  number: number;
  startTime: string;
  endTime: string;
  gameMode: EGameMode;
  teams: Team[];
  gateWay: number;
  season: number;
  serverInfo: ServerInfo;
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