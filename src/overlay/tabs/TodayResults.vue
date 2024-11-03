<template>
  <div class="today-results">
    <template v-if="selectedMatchId">
      <WButton @click="selectedMatchId = ''">Back</WButton>
      <RecentMatch :match-id="selectedMatchId" :battle-tag="battleTag" />
    </template>

    <template v-else>
      <div v-if="state.todayMatches.length > 0" class="today-results__results">
        <div>
          <h3 class="today-results__header-score">Score Today</h3>
          <p class="today-results__score">
            <span style="color: var(--color-green);">{{ results.won.length }}</span
            > - <span style="color: var(--color-red);">{{ results.lost.length }}</span>
          </p>
          <template v-if="currentMmr > 0">
            <h3 class="today-results__header-mmr">MMR Today</h3>
            <p class="today-results__mmr">
              <span class="gray">{{ currentMmr }}</span>
              <span :style="{color: mmrChange > 0 ? 'var(--color-green)' : 'var(--color-red)'}">
                ({{ mmrChange > 0 ? "+" : "" }}{{ mmrChange }})
              </span>
            </p>
          </template>
        </div>
        <div class="today-results__match-list">
          <div>
            <h3 class="today-results__wins">WINS:</h3>
            <Suspense v-for="match in results.won" :key="match.id">
              <MatchResult
                :match="match"
                :battle-tag="battleTag"
                @click="selectedMatchId = match.id.toString()"
              />
            </Suspense>
          </div>

          <div>
            <h3 class="today-results__losses">LOSSES:</h3>
            <Suspense v-for="match in results.lost" :key="match.id">
              <MatchResult
                :match="match"
                :battle-tag="battleTag"
                @click="selectedMatchId = match.id.toString()"
              />
            </Suspense>
          </div>
        </div>
      </div>
      <div v-else>
        <p>No matches played today</p>
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, ref, reactive } from "vue";
import { fetchRecentMatches } from "@/utils/fetch";
import { EGameMode, ERaceEnum, Match } from "@/typings";
import { isAfter } from "date-fns/isAfter";
import MatchResult from "@/components/MatchResult.vue";
import RecentMatch from "@/components/RecentMatch.vue";
import WButton from "@/components/WButton.vue";
import usePlayerAka from "@/composables/usePlayerAka";

type Props = {
  streamStartedAt: Date;
  battleTag: string;
  currentSeason: number;
};

export default defineComponent({
  name: "TodayResults",
  components: { WButton, RecentMatch, MatchResult },
  props: {
    streamStartedAt: {
      type: Date,
      required: true
    },
    battleTag: {
      type: String,
      default: ""
    },
    currentSeason: {
      type: Number,
      required: true
    }
  },
  setup(props: Props) {
    const { fetchPlayerAka } = usePlayerAka();

    const selectedMatchId = ref("");
    const state = reactive({ todayMatches: [] as Match[] });
    const currentMmr = ref(0);
    const mmrChange = ref(0);

    onMounted(async () => {
      const pageSize = 50;
      const matches = await fetchRecentMatches(
        props.battleTag,
        props.currentSeason,
        pageSize
      );
      state.todayMatches = matches.matches.filter(match =>
        match.gameMode === EGameMode.GM_1ON1 &&
        isAfter(new Date(match.startTime), props.streamStartedAt)
      );

      // Preload all player akas
      await Promise.all(
        state.todayMatches
          .flatMap(match => match.teams)
          .flatMap(team => team.players)
          .map(player => player.battleTag)
          .reduce((acc, battleTag) => {
            acc.add(battleTag);
            return acc;
          }, new Set<string>())
          .values()
          .map(battleTag => fetchPlayerAka(battleTag))
      );

      const mostPlayedRace = (() => {
        const raceCounts = state.todayMatches
          .flatMap(match => match.teams)
          .flatMap(team => team.players)
          .filter(player => player.battleTag === props.battleTag)
          .reduce((acc, player) => {
            acc[player.race] = (acc[player.race] ?? 0) + 1;
            return acc;
          }, {} as Record<ERaceEnum, number>);
        if (Object.keys(raceCounts).length === 0) return null;
        const mostKey = Object.entries(raceCounts).sort((a, b) => b[1] - a[1])[0][0];
        return Number(mostKey) as ERaceEnum;
      })();

      if (mostPlayedRace) {
        currentMmr.value = state.todayMatches
          .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
          .flatMap(match => match.teams)
          .flatMap(team => team.players)
          .find(player => player.battleTag === props.battleTag && player.race === mostPlayedRace)
          ?.currentMmr ?? 0;

        mmrChange.value = state.todayMatches.reduce((acc, match) => {
          acc += match.teams
            .flatMap(team => team.players)
            .find(player => player.battleTag === props.battleTag && player.race === mostPlayedRace)
            ?.mmrGain ?? 0;
          return acc;
        }, 0);
      }
    });

    const results = computed(() => {
      const r = { won: [] as Match[], lost: [] as Match[] };
      for (const match of state.todayMatches) {
        for (const team of match.teams) {
          for (const player of team.players) {
            if (player.battleTag !== props.battleTag) continue;
            if (player.won) {
              r.won.push(match);
            } else {
              r.lost.push(match);
            }
          }
        }
      }
      return r;
    });

    return {
      selectedMatchId,
      state,
      results,
      currentMmr,
      mmrChange,
    };
  }
});
</script>

<style lang="scss" scoped>
.today-results {
  &__results {
    display: grid;
    grid-template-columns: 140px 1fr;
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

  &__match-list {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-column-gap: 20px;
    text-align: left;
    margin-bottom: 15px;
    max-height: 100%;
    overflow: auto;
  }

  &__back {
    cursor: pointer;
  }

  &__wins,
  &__losses {
    margin-top: 0;
  }

  &__wins {
    color: var(--color-green);
    padding: 0 8px;
    margin-bottom: 10px;
  }

  &__losses {
    color: var(--color-red);
    padding: 0 8px;
    margin-bottom: 10px;
  }
}
</style>
