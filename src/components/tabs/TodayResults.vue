<template>
  <div class="today-results">
    <template v-if="selectedMatchId">
      <span class="today-results__back" @click="selectedMatchId = ''"
        >Back</span
      >
      <RecentMatch :match-id="selectedMatchId" :battle-tag="battleTag" />
    </template>

    <template v-else>
      <div class="today-results__results">
        <div>
          <h3 class="today-results__header">Today score</h3>
          <p class="today-results__score">
            <span style="color: green;">{{ results.win }}</span
            >-<span style="color: red;">{{ results.loss }}</span>
          </p>
        </div>
        <div class="today-results__match-list">
          <MatchResult
            v-for="match in state.todayMatches"
            :key="match.id"
            :match="match"
            :battle-tag="battleTag"
            @click="selectedMatchId = match.id"
          />
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

type Props = {
  streamStartedAt: string;
  battleTag: string;
  currentSeason: number;
};

export default defineComponent({
  name: "TodayResults",
  components: { RecentMatch, MatchResult },
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
      const r = { win: 0, loss: 0 };

      for (const match of state.todayMatches) {
        for (const team of match.teams) {
          for (const player of team.players) {
            if (player.battleTag === props.battleTag) {
              if (player.won) {
                r.win++;
              } else {
                r.loss++;
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
    text-align: left;
    margin-bottom: 15px;
    max-height: 100%;
    overflow: auto;
  }

  &__back {
    cursor: pointer;
  }
}
</style>
