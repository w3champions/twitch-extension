<template>
  <div class="current-match-container">
    <template v-if="ongoingMatch">
      <OneVsOneMatch
        v-if="is1v1 && state.streamer && state.opponent"
        :streamer="state.streamer!"
        :opponent="state.opponent!"
        :streamer-stats="state.streamerStats"
        :opponent-stats="state.opponentStats"
        :match-history="state.matchHistory"
        :map-name="ongoingMatch.mapName"
        :start-time="ongoingMatch.startTime"
        :streamer-aka="playerAkas[state.streamer!.battleTag] || undefined"
        :opponent-aka="playerAkas[state.opponent!.battleTag] || undefined"
        :game-mode="ongoingMatch.gameMode"
        :server-name="ongoingMatch.serverInfo?.name || ''"
        @show-head-to-head="goToHeadToHead"
      />
      <FFAMatch
        v-else-if="isFFA"
        :teams="ongoingMatch.teams"
        :player-stats="state.allPlayerStats"
        :map-name="ongoingMatch.mapName"
        :mode="ongoingMatch.gameMode"
        :start-time="ongoingMatch.startTime"
        :server-name="ongoingMatch.serverInfo?.name || ''"
      />
      <TeamMatch
        v-else
        :teams="ongoingMatch.teams"
        :player-stats="state.allPlayerStats"
        :map-name="ongoingMatch.mapName"
        :mode="ongoingMatch.gameMode"
        :start-time="ongoingMatch.startTime"
        :server-name="ongoingMatch.serverInfo?.name || ''"
      />
    </template>
    <NoMatchStats
      v-else
      :seasonal-stats="state.seasonalStats"
      :current-season="currentSeason"
    />
  </div>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  onBeforeUnmount,
  onMounted,
  reactive,
  watch,
} from "vue";
import { useRouter } from "vue-router";
import { useW3CStore } from "@/store/w3c";
import { Match, ModeStat, PlayerInTeam } from "@/typings";
import usePlayerAka from "@/composables/usePlayerAka";
import OneVsOneMatch from "@/components/OneVsOneMatch.vue";
import TeamMatch from "@/components/TeamMatch.vue";
import FFAMatch from "@/components/FFAMatch.vue";
import NoMatchStats from "@/components/NoMatchStats.vue";
import { gameModes1v1, gameModesFFA } from "@/constants/constants";

type State = {
  streamer: PlayerInTeam | null;
  streamerStats: ModeStat | null;
  opponent: PlayerInTeam | null;
  opponentStats: ModeStat | null;
  matchHistory: Match[];
  seasonalStats: ModeStat[];
  allPlayerStats: Record<string, ModeStat>;
};

export default defineComponent({
  name: "CurrentMatch",
  components: { OneVsOneMatch, TeamMatch, FFAMatch, NoMatchStats },
  setup() {
    const { fetchPlayerAka, playerAkas } = usePlayerAka();
    const router = useRouter();
    const store = useW3CStore();

    const state = reactive({
      streamer: null,
      streamerStats: null,
      opponent: null,
      opponentStats: null,
      matchHistory: [],
      seasonalStats: [],
      allPlayerStats: {},
    } as State);

    const ongoingMatch = computed(() => store.ongoingMatch);

    const is1v1 = computed(() => {
      if (!ongoingMatch.value) return false;
      return gameModes1v1.includes(ongoingMatch.value.gameMode);
    });

    const isFFA = computed(() => {
      if (!ongoingMatch.value) return false;
      return gameModesFFA.includes(ongoingMatch.value.gameMode);
    });

    const updateMatchData = async () => {
      const match = ongoingMatch.value;
      const battleTag = store.battleTag;
      const currentSeason = store.currentSeason;

      if (!battleTag || !currentSeason) return;

      const seasonalStats = await store.fetchPlayerStats(
        battleTag,
        currentSeason,
      );

      state.seasonalStats = seasonalStats.sort((a, b) => b.games - a.games);

      if (!match) {
        return;
      }

      // If match ID hasn't changed and we already have data, don't refetch everything
      // However, we might want to refresh if it's been a while, but for now let's assume if ID is same, we are good.
      // But wait, we need to populate state if it's the first load even if ID is same (e.g. page refresh? no, store persists in memory)
      // Actually, if we just navigated here, state is fresh.
      // We should check if we already have the data in `state` for this match.

      // Simplified check: if we have data and it matches current match ID (if we stored it)
      // But we don't store match ID in state.
      // Let's just check if we have streamer/opponent set and if they match the current match players.
      // Actually, simpler: just check if we have data.
      // But if match changed, we need to reload.
      // The store handles caching of stats, so calling fetchPlayerStats again is cheap.
      // The main thing is to avoid re-rendering if nothing changed.

      // Let's rely on the fact that this function is called when ongoingMatch changes (via watcher) or on mount.

      const matchPlayers = match.teams.flatMap((t) => t.players);

      // Preload akas
      await Promise.all(matchPlayers.map((p) => fetchPlayerAka(p.battleTag)));

      if (is1v1.value) {
        state.streamer = matchPlayers.find(
          (player) => player.battleTag === battleTag,
        )!;
        state.opponent = matchPlayers.find(
          (player) => player.battleTag !== battleTag,
        )!;

        const [heroStats, opponentStats, matchHistory] = await Promise.all([
          store.fetchPlayerStats(battleTag, currentSeason),
          store.fetchPlayerStats(state.opponent!.battleTag, currentSeason),
          store.fetchHeadToHeadStats(
            state.streamer.battleTag,
            state.opponent.battleTag,
            currentSeason,
          ),
        ]);

        state.streamerStats =
          heroStats.find(
            (s) =>
              s.race === state.streamer!.race && s.gameMode === match.gameMode,
          ) || null;

        state.opponentStats =
          opponentStats.find(
            (s) =>
              s.race === state.opponent!.race && s.gameMode === match.gameMode,
          ) || null;

        state.matchHistory = matchHistory.matches.filter(
          (m) => m.gameMode === match.gameMode,
        );
      } else {
        // For team modes and FFA, fetch stats for all players
        const allStats = await Promise.all(
          matchPlayers.map((p) =>
            store.fetchPlayerStats(p.battleTag, currentSeason),
          ),
        );

        const newAllPlayerStats: Record<string, ModeStat> = {};
        matchPlayers.forEach((player, index) => {
          const playerStats = allStats[index];
          const stats =
            playerStats.find(
              (s) => s.gameMode === match.gameMode && s.race === player.race,
            ) || playerStats.find((s) => s.gameMode === match.gameMode);

          if (stats) {
            newAllPlayerStats[player.battleTag] = stats;
          }
        });

        state.allPlayerStats = newAllPlayerStats;
      }
    };

    watch(ongoingMatch, () => {
      updateMatchData();
    });

    onMounted(async () => {
      await updateMatchData();
    });

    onBeforeUnmount(() => {
      // No cleanup needed
    });

    const goToHeadToHead = () => {
      if (state.opponent) {
        router.push({
          name: "HeadToHead",
          params: {
            opponentBattleTag: state.opponent.battleTag,
          },
        });
      }
    };

    return {
      state,
      ongoingMatch,
      playerAkas,
      is1v1,
      isFFA,
      goToHeadToHead,
      store,
      currentSeason: computed(() => store.currentSeason),
    };
  },
});
</script>

<style lang="scss" scoped>
.current-match-container {
  width: 100%;
  height: 100%;
}
</style>
