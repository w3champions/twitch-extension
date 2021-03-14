<template>
  <div class="today-results">
    <template v-if="selectedMatchId">
      <WButton @click="selectedMatchId = ''">Back</WButton>
      <RecentMatch :match-id="selectedMatchId" :battle-tag="battleTag" />
    </template>

    <template v-else>
      <div class="today-results__results">
        <div>
          <h3 class="today-results__header">Today score</h3>
          <p class="today-results__score">
            <span style="color: green;">{{ results.won.length }}</span
            >-<span style="color: red;">{{ results.lost.length }}</span>
          </p>
        </div>
        <div class="today-results__match-list">
          <div>
            <h3 class="today-results__wins">WINS:</h3>
            <Suspense v-for="match in results.won" :key="match.id">
              <MatchResult
                :match="match"
                :battle-tag="battleTag"
                @click="selectedMatchId = match.id"
              />
            </Suspense>
          </div>

          <div>
            <h3 class="today-results__losses">LOSSES:</h3>
            <Suspense v-for="match in results.lost" :key="match.id">
              <MatchResult
                :match="match"
                :battle-tag="battleTag"
                @click="selectedMatchId = match.id"
              />
            </Suspense>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, ref, reactive } from "vue";
import { fetchRecentMatches } from "@/utils/fetch";
import { EGameMode, Match } from "@/typings";
import isAfter from "date-fns/isAfter";
import MatchResult from "@/components/MatchResult.vue";
import RecentMatch from "@/components/RecentMatch.vue";
import WButton from "@/components/common/WButton.vue";

type Props = {
  streamStartedAt: string;
  battleTag: string;
  currentSeason: number;
};

export default defineComponent({
  name: "TodayResults",
  components: { WButton, RecentMatch, MatchResult },
  props: {
    streamStartedAt: {
      type: String,
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
    const selectedMatchId = ref("");
    const state = reactive({ todayMatches: [] as Match[] });

    onMounted(async () => {
      const pageSize = 50;
      const matches = await fetchRecentMatches(
        props.battleTag,
        props.currentSeason,
        pageSize
      );
      const streamStartedAtDate = new Date(props.streamStartedAt);

      state.todayMatches = matches.matches.filter(
        match =>
          match.gameMode === EGameMode.GM_1ON1 &&
          isAfter(new Date(match.startTime), streamStartedAtDate)
      );
    });

    const results = computed(() => {
      const r = { won: [] as Match[], lost: [] as Match[] };

      for (const match of state.todayMatches) {
        for (const team of match.teams) {
          for (const player of team.players) {
            if (player.battleTag === props.battleTag) {
              if (player.won) {
                r.won.push(match);
              } else {
                r.lost.push(match);
              }
            }
          }
        }
      }

      return r;
    });

    return {
      selectedMatchId,
      state,
      results
    };
  }
});
</script>

<style lang="scss" scoped>
.today-results {
  &__results {
    display: grid;
    grid-template-columns: 200px 1fr;
    grid-column-gap: 15px;
    height: 100%;
  }

  &__header {
    margin: 0;
  }

  &__score {
    font-size: 36px;
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
  }

  &__losses {
    color: var(--color-red);
  }
}
</style>
