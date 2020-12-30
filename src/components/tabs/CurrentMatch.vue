<template>
  <div class="current-match">
    <div>
      {{ state.hero.name }}
      {{
        calculateWinProbability(state.heroStats.mmr, state.opponentStats.mmr)
      }}%
      <h2>{{ leagues[state.heroStats.leagueId] }}</h2>
      <div>
        <span
          ><span>Rank</span><span>{{ state.heroStats.rank }} |</span
          ><span>{{ state.heroStats.wins }}</span> -
          <span>{{ state.heroStats.losses }}</span></span
        >
      </div>
      <div>
        <div>
          <span>
            MMR: <span>{{ state.heroStats.mmr }}</span></span
          ><span style="font-size: 13px;">
            RP: <span>{{ state.heroStats.rankingPoints }}</span></span
          >
        </div>
      </div>
    </div>
    <div>
      {{ state.opponent.name }}
      {{
        calculateWinProbability(state.opponentStats.mmr, state.heroStats.mmr)
      }}%

      <h2>{{ leagues[state.opponentStats.leagueId] }}</h2>
      <div>
        <span
          ><span>Rank</span><span>{{ state.opponentStats.rank }} |</span
          ><span>{{ state.opponentStats.wins }}</span> -
          <span>{{ state.opponentStats.losses }}</span></span
        >
      </div>
      <div>
        <div>
          <span>
            MMR: <span>{{ state.opponentStats.mmr }}</span></span
          ><span style="font-size: 13px;">
            RP: <span>{{ state.opponentStats.rankingPoints }}</span></span
          >
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, reactive } from "vue";
import {
  fetchOngoingMatch,
  fetchPlayerStats,
  fetchPlayerStatsAgainstOpponent
} from "@/utils/fetch";
import {
  EGameMode,
  Match,
  ModeStat,
  OngoingMatch,
  PlayerInTeam
} from "@/typings";

const leagues = [
  "grandmaster",
  "master",
  "diamond",
  "platinum",
  "gold",
  "silver",
  "bronze"
];

function calculateWinProbability(mmr1: number, mmr2: number): number {
  const m = (mmr2 - mmr1) / 400;

  const winProbability = (1 / (1 + Math.pow(10, m))) * 100;

  return Math.round(winProbability * 100) / 100;
}

export default defineComponent({
  name: "CurrentMatch",
  props: {
    battleTag: {
      type: String,
      default: ""
    }
  },
  setup(props) {
    const state = reactive({
      ongoingMatch: {} as OngoingMatch,
      hero: {} as PlayerInTeam,
      heroStats: {} as ModeStat,
      opponent: {} as PlayerInTeam,
      opponentStats: {} as ModeStat,
      matchHistory: [] as Match[]
    });

    onMounted(async () => {
      if (props.battleTag) {
        state.ongoingMatch = await fetchOngoingMatch(props.battleTag);

        const matchPlayers = state.ongoingMatch.teams.flatMap(t => t.players);

        state.hero = matchPlayers.find(
          player => player.battleTag === props.battleTag
        )!;
        state.opponent = matchPlayers.find(
          player => player.battleTag !== props.battleTag
        )!;

        const [heroStats, opponentStats, matchHistory] = await Promise.all([
          fetchPlayerStats(props.battleTag, 5),
          fetchPlayerStats(state.opponent!.battleTag, 5),
          fetchPlayerStatsAgainstOpponent(
            state.hero.battleTag,
            state.opponent.battleTag,
            5
          )
        ]);

        state.heroStats = heroStats.find(
          s => s.race === state.hero!.race && s.gameMode === EGameMode.GM_1ON1
        )!;
        state.opponentStats = opponentStats.find(
          s =>
            s.race === state.opponent!.race && s.gameMode === EGameMode.GM_1ON1
        )!;
        state.matchHistory = matchHistory.matches;
      }
    });

    return {
      state,
      leagues,
      calculateWinProbability
    };
  }
});
</script>

<style lang="scss" scoped>
.current-match {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-column-gap: 50px;
}
</style>
