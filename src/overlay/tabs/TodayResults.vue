<template>
  <div class="today-results">
    <div class="today-results__results">
      <div>
        <ModePicker
          :current-season="currentSeason"
          @selection-changed="onSelectionChanged"
        />
        <template
          v-if="state.todayMatches && state.todayMatches.matches.length > 0"
        >
          <h3 class="today-results__header-score">Score Today</h3>
          <p v-if="isFFA" class="today-results__score">
            <span style="color: #ffd700">{{ ffaRanks.first }}</span>
            - <span style="color: #c0c0c0">{{ ffaRanks.second }}</span> -
            <span style="color: #cd7f32">{{ ffaRanks.third }}</span> -
            <span style="color: #999999">{{ ffaRanks.fourth }}</span>
          </p>
          <p v-else class="today-results__score">
            <span style="color: var(--color-green)">{{
              results.won.length
            }}</span>
            -
            <span style="color: var(--color-red)">{{
              results.lost.length
            }}</span>
          </p>
          <template v-if="currentMmr > 0">
            <h3 class="today-results__header-mmr">MMR Today</h3>
            <p class="today-results__mmr">
              <span class="gray">{{ currentMmr }}</span>
              <span
                :style="{
                  color:
                    mmrChange > 0 ? 'var(--color-green)' : 'var(--color-red)',
                }"
              >
                ({{ mmrChange > 0 ? "+" : "" }}{{ mmrChange }})</span
              >
            </p>
          </template>
        </template>
      </div>
      <div v-if="isLoading" class="today-results__loading">
        Loading matches...
      </div>
      <div
        v-else-if="state.todayMatches && state.todayMatches.matches.length > 0"
        class="today-results__match-list-container"
      >
        <OneVsOneMatchList
          v-if="is1v1"
          :matches="results"
          @select-match="selectMatch"
        />
        <FFAMatchList
          v-else-if="isFFA"
          :matches="state.todayMatches.matches"
        />
        <TeamMatchList
          v-else
          :matches="state.todayMatches.matches"
          @select-match="selectMatch"
        />
      </div>
      <p v-else class="today-results__no-matches">No matches played today</p>
    </div>
  </div>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  onMounted,
  ref,
  reactive,
  watch,
} from "vue";
import { useRouter } from "vue-router";
import { useW3CStore } from "@/store/w3c";
import { Match } from "@/typings";
import { isAfter } from "date-fns/isAfter";
import OneVsOneMatchList from "@/components/OneVsOneMatchList.vue";
import TeamMatchList from "@/components/TeamMatchList.vue";
import FFAMatchList from "@/components/FFAMatchList.vue";
import ModePicker from "@/components/ModePicker.vue";
import usePlayerAka from "@/composables/usePlayerAka";
import { gameModes1v1, gameModesFFA, gameModesAT } from "@/constants/constants";

export default defineComponent({
  name: "TodayResults",
  components: {
    OneVsOneMatchList,
    TeamMatchList,
    FFAMatchList,
    ModePicker,
  },
  setup() {
    const { fetchPlayerAka } = usePlayerAka();
    const router = useRouter();
    const store = useW3CStore();

    const selectedMode = computed(() => store.selectedGameMode);
    const selectedRace = computed(() => store.selectedRace);
    const currentMmr = ref(0);
    const mmrChange = ref(0);
    const isLoading = ref(false);

    // Track the current request to prevent race conditions
    let currentRequestId = 0;

    const state = reactive({
      todayMatches: null as { matches: Match[] } | null,
    });

    const is1v1 = computed(() => {
      return gameModes1v1.includes(selectedMode.value);
    });

    const isFFA = computed(() => {
      return gameModesFFA.includes(selectedMode.value);
    });

    const ffaRanks = computed(() => {
      if (!state.todayMatches || !isFFA.value) {
        return { first: 0, second: 0, third: 0, fourth: 0 };
      }

      const ranks = { first: 0, second: 0, third: 0, fourth: 0 };

      for (const match of state.todayMatches.matches) {
        // Sort players by MMR gain to determine placement
        const allPlayers = match.teams.flatMap((t) => t.players);
        const sortedPlayers = allPlayers.sort((a, b) => {
          const aWon = match.teams.find((t) =>
            t.players.some((p) => p.battleTag === a.battleTag),
          )?.won;
          const bWon = match.teams.find((t) =>
            t.players.some((p) => p.battleTag === b.battleTag),
          )?.won;

          if (aWon !== bWon) {
            return aWon ? -1 : 1;
          }

          return b.mmrGain - a.mmrGain;
        });

        const myIndex = sortedPlayers.findIndex(
          (p) => p.battleTag === store.battleTag,
        );
        if (myIndex === 0) ranks.first++;
        else if (myIndex === 1) ranks.second++;
        else if (myIndex === 2) ranks.third++;
        else if (myIndex === 3) ranks.fourth++;
      }

      return ranks;
    });

    const loadMatches = async () => {
      const battleTag = store.battleTag;
      const currentSeason = store.currentSeason;

      if (!battleTag || !currentSeason) return;

      // Increment request ID to track this request
      const requestId = ++currentRequestId;

      isLoading.value = true;
      try {
        const pageSize = 50;
        const mode = selectedMode.value;
        const race = selectedRace.value;

        const history = await store.fetchMatchHistory(
          battleTag,
          currentSeason,
          pageSize,
          mode,
        );

        // Ignore stale responses
        if (requestId !== currentRequestId) {
          return;
        }

        const streamStartedAt = new Date(store.streamStartedAt);

        let matches = history.matches.filter((match) =>
          isAfter(new Date(match.startTime), streamStartedAt),
        );

        if (!gameModesAT.includes(mode)) {
          matches = matches.filter((m) => !gameModesAT.includes(m.gameMode));
        }

        if (race !== null) {
          matches = matches.filter((match) => {
            const player = match.teams
              .flatMap((t) => t.players)
              .find((p) => p.battleTag === battleTag);
            return player && player.race === race;
          });
        }

        state.todayMatches = { matches };

        // Preload all player akas
        if (state.todayMatches) {
          await Promise.all(
            state.todayMatches.matches
              .flatMap((match) => match.teams)
              .flatMap((team) => team.players)
              .map((player) => player.battleTag)
              .reduce((acc, battleTag) => {
                acc.add(battleTag);
                return acc;
              }, new Set<string>())
              .values()
              .map((battleTag) => fetchPlayerAka(battleTag)),
          );
        }

        calculateStats();
      } finally {
        isLoading.value = false;
      }
    };

    const calculateStats = () => {
      if (!state.todayMatches) return;
      const battleTag = store.battleTag;

      // For 1v1 modes, filter by selected race
      // For team/FFA modes, selectedRace is null, so don't filter by race
      const filterByRace = selectedRace.value !== null;

      currentMmr.value =
        state
          .todayMatches!.matches.sort(
            (a, b) =>
              new Date(b.startTime).getTime() - new Date(a.startTime).getTime(),
          )
          .flatMap((match) => match.teams)
          .flatMap((team) => team.players)
          .find(
            (player) =>
              player.battleTag === battleTag &&
              (!filterByRace || player.race === selectedRace.value),
          )?.currentMmr ?? 0;

      mmrChange.value = state.todayMatches!.matches.reduce((acc, match) => {
        acc +=
          match.teams
            .flatMap((team) => team.players)
            .find(
              (player) =>
                player.battleTag === battleTag &&
                (!filterByRace || player.race === selectedRace.value),
            )?.mmrGain ?? 0;
        return acc;
      }, 0);
    };

    onMounted(loadMatches);

    // Watch for store changes (e.g. invalidation)
    watch(
      () => store.matchHistory,
      async (newHistory) => {
        if (!newHistory) {
          // History invalidated, reload
          await loadMatches();
        }
      },
    );

    const onSelectionChanged = () => {
      // Store is updated by ModePicker, we just need to reload matches
      // But wait, since selectedMode is computed from store, we should wait for store update?
      // Actually ModePicker updates store before emitting, so we are good.
      loadMatches();
    };

    const selectMatch = (match: Match) => {
      if (is1v1.value) {
        router.push({
          name: "OneVsOneMatchDetails",
          params: { id: match.id },
        });
      } else {
        router.push({
          name: "TeamMatchDetails",
          params: { id: match.id },
        });
      }
    };

    return {
      selectedMode,
      selectedRace,
      state,
      results: computed(() => {
        const r = { won: [] as Match[], lost: [] as Match[] };
        for (const match of state.todayMatches?.matches ?? []) {
          for (const team of match.teams) {
            for (const player of team.players) {
              if (player.battleTag !== store.battleTag) continue;
              if (player.won) {
                r.won.push(match);
              } else {
                r.lost.push(match);
              }
            }
          }
        }
        return r;
      }),
      currentMmr,
      mmrChange,
      onSelectionChanged,
      selectMatch,
      is1v1,
      isFFA,
      ffaRanks,
      isLoading,
      store,
      currentSeason: computed(() => store.currentSeason),
    };
  },
});
</script>

<style lang="scss" scoped>
.today-results {
  margin: 0 10px;

  &__results {
    display: grid;
    grid-template-columns: 200px 1fr;
    grid-column-gap: 15px;
    height: 100%;
    margin-top: 15px;
  }

  &__header-score {
    margin: 0;
  }

  &__score {
    font-size: 36px;
    margin: 0;
  }

  &__header-mmr {
    margin: 30px 0 0 0;
  }

  &__mmr {
    font-size: 28px;
    margin: 0;
  }

  &__match-list-container {
    margin-bottom: 15px;
    max-height: 100%;
    overflow: auto;
  }

  &__no-matches {
    margin-top: 20px;
    font-size: 24px;
  }

  &__loading {
    margin-top: 20px;
    font-size: 24px;
    color: var(--color-yellow);
  }
}
</style>
