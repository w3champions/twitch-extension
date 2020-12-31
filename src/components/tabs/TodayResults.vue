<template>
  <div>
    <h3>Today score</h3>
    <p style="font-size: 36px;">
      <span style="color: green;">{{ results.win }}</span
      >-<span style="color: red;">{{ results.loss }}</span>
    </p>
    <MatchResult
      v-for="match in state.todayMatches"
      :key="match.id"
      :match="match"
      :battle-tag="battleTag"
    />
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, reactive } from "vue";
import { fetchRecentMatches } from "@/utils/fetch";
import { EGameMode, Match } from "@/typings";
import isAfter from "date-fns/isAfter";
import MatchResult from "@/components/MatchResult.vue";

export default defineComponent({
  name: "TodayResults",
  components: { MatchResult },
  props: {
    streamStartedAt: {
      type: String,
      required: true
    },
    battleTag: {
      type: String,
      default: ""
    }
  },
  setup(props) {
    const state = reactive({ todayMatches: [] as Match[] });

    onMounted(async () => {
      const matches = await fetchRecentMatches(props.battleTag, 5, 50);
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
      state,
      results
    };
  }
});
</script>

<style lang="scss" scoped></style>
