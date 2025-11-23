import { defineStore } from "pinia";
import { LRUCache } from "lru-cache";
import {
  OngoingMatch,
  Match,
  MatchDetail,
  ModeStat,
  EGameMode,
  ERaceEnum,
  Season,
} from "@/typings";
import {
  fetchOngoingMatch as apiFetchOngoingMatch,
  fetchRecentMatches as apiFetchRecentMatches,
  fetchMatchStats as apiFetchMatchStats,
  fetchPlayerStats as apiFetchPlayerStats,
  fetchPlayerStatsAgainstOpponent as apiFetchPlayerStatsAgainstOpponent,
  fetchSeasons as apiFetchSeasons,
} from "@/utils/fetch";
import { atEquivalent, gameModes1v1 } from "@/constants/constants";

interface HistoryData {
  matches: Match[];
  count: number;
  lastFetch: number;
  battleTag: string;
  season: number;
  mode: EGameMode;
}

interface H2HData {
  count: number;
  matches: Match[];
}

interface W3CState {
  ongoingMatch: OngoingMatch | null;
  matchHistory: Record<string, HistoryData>;
  matchDetailsCache: LRUCache<string, MatchDetail>;
  playerStatsCache: Map<string, ModeStat[]>;
  headToHeadStatsCache: LRUCache<string, H2HData>;
  lastOngoingMatchFetch: number;
  seasons: Season[];
  lastSeasonsFetch: number;
  selectedGameMode: EGameMode;
  selectedRace: ERaceEnum | null;
  previousOngoingOpponent: string | null;
  battleTag: string;
  currentSeason: number;
  streamStartedAt: string;
}

export const useW3CStore = defineStore("w3c", {
  state: (): W3CState => ({
    ongoingMatch: null,
    matchHistory: {},
    matchDetailsCache: new LRUCache<string, MatchDetail>({ max: 20 }),
    playerStatsCache: new Map(),
    headToHeadStatsCache: new LRUCache<string, H2HData>({ max: 10 }),
    lastOngoingMatchFetch: 0,
    seasons: [],
    lastSeasonsFetch: 0,
    selectedGameMode: EGameMode.GM_1ON1,
    selectedRace: null,
    previousOngoingOpponent: null,
    battleTag: "",
    currentSeason: 0,
    streamStartedAt: new Date(
      new Date().getTime() - 24 * 60 * 60 * 1000,
    ).toISOString(),
  }),

  actions: {
    setBattleTag(battleTag: string) {
      this.battleTag = battleTag || "";
    },

    setCurrentSeason(season: number) {
      this.currentSeason = season;
    },

    setStreamStartedAt(date: string) {
      this.streamStartedAt = date;
    },

    async fetchOngoingMatch(battleTag: string, season: number) {
      const now = Date.now();
      // Return cached match if fetched within last 15 seconds
      if (
        this.lastOngoingMatchFetch &&
        now - this.lastOngoingMatchFetch < 15000
      ) {
        return this.ongoingMatch;
      }

      const match = await apiFetchOngoingMatch(battleTag);
      this.lastOngoingMatchFetch = now;

      // Check if match changed to invalidate history and h2h cache
      if (
        (this.ongoingMatch && !match) || // Match ended
        (!this.ongoingMatch && match) || // Match started
        (this.ongoingMatch && match && this.ongoingMatch.id !== match.id) // New match
      ) {
        this.matchHistory = {}; // Invalidate all history

        // Invalidate player stats for the streamer when match changes/ends
        // This ensures fresh stats (MMR, wins, losses) are fetched after a game
        const playerStatsKey = `${battleTag}-${season}`;
        this.playerStatsCache.delete(playerStatsKey);

        // Evict h2h cache for previous opponent when match ends or changes
        if (this.previousOngoingOpponent) {
          this.evictHeadToHeadCache(
            battleTag,
            this.previousOngoingOpponent,
            season,
          );
        }

        // Auto-select mode when match ends
        if (this.ongoingMatch && !match) {
          // Match just ended - set selected mode to the ended match's mode
          const endedMatch = this.ongoingMatch;
          const endedMatchMode = endedMatch.gameMode;

          // For 1v1 modes, use the player's race, otherwise null
          const is1v1 = gameModes1v1.includes(endedMatchMode);

          const playerRace = is1v1
            ? endedMatch.teams
                .flatMap((team) => team.players)
                .find((player) => player.battleTag === battleTag)?.race || null
            : null;

          this.setSelectedMode(endedMatchMode, playerRace);
        }
      }

      // Track current opponent for future eviction
      if (match) {
        const opponent = match.teams
          .flatMap((team) => team.players)
          .find((player) => player.battleTag !== battleTag);
        this.previousOngoingOpponent = opponent?.battleTag || null;
      } else {
        this.previousOngoingOpponent = null;
      }

      this.ongoingMatch = match;
      return match;
    },

    async fetchSeasons() {
      const now = Date.now();
      // Return cached seasons if fetched within last 10 minutes
      if (this.seasons.length > 0 && now - this.lastSeasonsFetch < 600000) {
        return this.seasons;
      }

      const seasons = await apiFetchSeasons();
      this.seasons = seasons;
      this.lastSeasonsFetch = now;
      return seasons;
    },

    async fetchMatchHistory(
      battleTag: string,
      season: number,
      pageSize: number,
      mode?: EGameMode,
    ) {
      // Use a special key for "all modes" cache
      const allModesKey = `${battleTag}-${season}-ALL`;
      const allModesHistory = this.matchHistory[allModesKey];
      const now = Date.now();
      const isStale =
        !allModesHistory || now - allModesHistory.lastFetch > 60000; // 1 minute

      if (isStale) {
        // Fetch all modes by omitting gameMode parameter
        const data = await apiFetchRecentMatches(battleTag, season, pageSize);

        // Store the complete result under "ALL" key
        this.matchHistory[allModesKey] = {
          matches: data.matches,
          count: data.count,
          lastFetch: now,
          battleTag,
          season,
          mode: EGameMode.UNDEFINED,
        };

        // Also split and cache by individual modes
        const matchesByMode: Partial<Record<EGameMode, Match[]>> = {};
        for (const match of data.matches) {
          if (!matchesByMode[match.gameMode]) {
            matchesByMode[match.gameMode] = [];
          }
          matchesByMode[match.gameMode]!.push(match);
        }

        // Cache each mode separately
        for (const [gameMode, matches] of Object.entries(matchesByMode)) {
          const modeKey = `${battleTag}-${season}-${gameMode}`;
          this.matchHistory[modeKey] = {
            matches,
            count: matches.length,
            lastFetch: now,
            battleTag,
            season,
            mode: Number(gameMode) as EGameMode,
          };
        }
      }

      // Return matches for the requested mode, or all if no mode specified
      if (mode !== undefined) {
        const modeKey = `${battleTag}-${season}-${mode}`;
        const nonATMatches = this.matchHistory[modeKey] || {
          matches: [],
          count: 0,
          lastFetch: now,
          battleTag,
          season,
          mode,
        };

        // Check if this mode has an AT equivalent and merge those matches
        const atMode = atEquivalent[mode];
        if (atMode) {
          const atModeKey = `${battleTag}-${season}-${atMode}`;
          const atMatches = this.matchHistory[atModeKey];

          if (atMatches && atMatches.matches.length > 0) {
            // Merge AT matches with non-AT matches
            return {
              matches: [...nonATMatches.matches, ...atMatches.matches].sort(
                (a, b) =>
                  new Date(b.startTime).getTime() -
                  new Date(a.startTime).getTime(),
              ),
              count: nonATMatches.count + atMatches.count,
              lastFetch: Math.max(nonATMatches.lastFetch, atMatches.lastFetch),
              battleTag,
              season,
              mode,
            };
          }
        }

        return nonATMatches;
      }

      return this.matchHistory[allModesKey];
    },

    async fetchMatchDetails(matchId: string) {
      if (this.matchDetailsCache.has(matchId)) {
        return this.matchDetailsCache.get(matchId)!;
      }

      const details = await apiFetchMatchStats(matchId);
      this.matchDetailsCache.set(matchId, details);
      return details;
    },

    async fetchPlayerStats(battleTag: string, season: number) {
      const key = `${battleTag}-${season}`;
      if (this.playerStatsCache.has(key)) {
        return this.playerStatsCache.get(key)!;
      }

      const stats = await apiFetchPlayerStats(battleTag, season);
      this.playerStatsCache.set(key, stats);
      return stats;
    },

    async fetchHeadToHeadStats(
      battleTag: string,
      opponentBattleTag: string,
      season: number,
    ) {
      const key = `${battleTag}-${opponentBattleTag}-${season}`;
      if (this.headToHeadStatsCache.has(key)) {
        return this.headToHeadStatsCache.get(key)!;
      }

      const stats = await apiFetchPlayerStatsAgainstOpponent(
        battleTag,
        opponentBattleTag,
        season,
      );
      this.headToHeadStatsCache.set(key, stats);
      return stats;
    },

    setSelectedMode(mode: EGameMode, race: ERaceEnum | null) {
      this.selectedGameMode = mode;
      this.selectedRace = race;
    },

    evictHeadToHeadCache(
      battleTag: string,
      opponentBattleTag: string,
      season: number,
    ) {
      const key = `${battleTag}-${opponentBattleTag}-${season}`;
      this.headToHeadStatsCache.delete(key);
    },

    shouldEvictHeadToHeadCache(
      battleTag: string,
      opponentBattleTag: string,
      season: number,
      currentMatchDate: string,
    ): boolean {
      const key = `${battleTag}-${opponentBattleTag}-${season}`;
      const cachedData = this.headToHeadStatsCache.get(key);

      if (!cachedData || cachedData.matches.length === 0) {
        return false; // No cache to evict
      }

      // Find the newest match in the cached h2h data
      const newestCachedMatch = cachedData.matches.reduce((newest, match) => {
        return new Date(match.startTime) > new Date(newest.startTime)
          ? match
          : newest;
      }, cachedData.matches[0]);

      // Evict if current match is newer than the newest cached match
      return new Date(currentMatchDate) > new Date(newestCachedMatch.startTime);
    },
  },
});
