<template>
  <div class="ongoing-match">
    <template v-if="state.ongoingMatch">
      <div class="ongoing-match__column">
        <PlayerRanking
          v-if="state.heroStats"
          :name="state.hero.name"
          :league-id="state.heroStats.leagueId"
          :wins="state.heroStats.wins"
          :losses="state.heroStats.losses"
          :ranking-points="state.heroStats.rankingPoints"
          :mmr="state.heroStats.mmr"
          :opponent-mmr="state.opponentStats.mmr"
          :rank="state.heroStats.rank"
        />
      </div>
      <div style="padding-top: 10px">
        <h2>Encounters this season:</h2>
        <p
          v-if="state.matchHistory.length"
          class="ongoing-match__recent-encounters"
        >
          <span style="color: green;">{{ winsAgainstOpponent }}</span> -
          <span style="color: red;">{{ lossesAgainstOpponent }}</span>
        </p>
        <p v-else>
          No encounters this season
        </p>
      </div>
      <div class="ongoing-match__column">
        <PlayerRanking
          v-if="state.opponentStats"
          :name="state.opponent.name"
          :league-id="state.opponentStats.leagueId"
          :wins="state.opponentStats.wins"
          :losses="state.opponentStats.losses"
          :ranking-points="state.opponentStats.rankingPoints"
          :mmr="state.opponentStats.mmr"
          :opponent-mmr="state.heroStats.mmr"
          :rank="state.opponentStats.rank"
        />
      </div>
    </template>
    <p v-else style="font-size: 24px;">No 1v1 match currently in progress</p>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, reactive, ref } from "vue";
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
import PlayerRanking from "@/components/PlayerRanking.vue";

type Props = {
  battleTag: string;
  currentSeason: number;
};

type State = {
  ongoingMatch: OngoingMatch | null;
  hero: PlayerInTeam | null;
  heroStats: ModeStat | null;
  opponent: PlayerInTeam | null;
  opponentStats: ModeStat | null;
  matchHistory: Match[];
};

export default defineComponent({
  name: "OngoingMatch",
  components: { PlayerRanking },
  props: {
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
    const winsAgainstOpponent = ref(0);
    const lossesAgainstOpponent = ref(0);

    const state = reactive({
      ongoingMatch: null,
      hero: null,
      heroStats: null,
      opponent: null,
      opponentStats: null,
      matchHistory: []
    } as State);

    onMounted(async () => {
      if (props.battleTag) {
        const ongoingMatch = await fetchOngoingMatch(props.battleTag);
        if (ongoingMatch && ongoingMatch.gameMode === EGameMode.GM_1ON1) {
          state.ongoingMatch = ongoingMatch;

          const matchPlayers = state.ongoingMatch.teams.flatMap(t => t.players);

          state.hero = matchPlayers.find(
            player => player.battleTag === props.battleTag
          )!;
          state.opponent = matchPlayers.find(
            player => player.battleTag !== props.battleTag
          )!;

          const [heroStats, opponentStats, matchHistory] = await Promise.all([
            fetchPlayerStats(props.battleTag, props.currentSeason),
            fetchPlayerStats(state.opponent!.battleTag, props.currentSeason),
            fetchPlayerStatsAgainstOpponent(
              state.hero.battleTag,
              state.opponent.battleTag,
              props.currentSeason
            )
          ]);

          state.heroStats = heroStats.find(
            s => s.race === state.hero!.race && s.gameMode === EGameMode.GM_1ON1
          )!;
          state.opponentStats = opponentStats.find(
            s =>
              s.race === state.opponent!.race &&
              s.gameMode === EGameMode.GM_1ON1
          )!;
          state.matchHistory = matchHistory.matches;

          if (state.matchHistory.length) {
            for (const match of state.matchHistory) {
              for (const team of match.teams) {
                for (const player of team.players) {
                  if (player.battleTag === props.battleTag) {
                    if (player.won) {
                      winsAgainstOpponent.value++;
                    } else {
                      lossesAgainstOpponent.value++;
                    }
                  }
                }
              }
            }
          }
        } else {
          state.ongoingMatch = null;
        }
      }
    });

    return {
      state,
      winsAgainstOpponent,
      lossesAgainstOpponent
    };
  }
});
</script>

<style lang="scss" scoped>
.ongoing-match {
  display: grid;
  grid-template-columns: 1fr 200px 1fr;
  grid-column-gap: 50px;

  &__column {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  &__recent-encounters {
    font-size: 50px;
  }
}
</style>
