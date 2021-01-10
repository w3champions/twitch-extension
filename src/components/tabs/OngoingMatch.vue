<template>
  <div class="ongoing-match">
    <template v-if="state.ongoingMatch">
      <template v-if="!showVSDetails">
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
            :race="state.heroStats.race"
          />
        </div>
        <div style="padding-top: 10px">
          <template v-if="state.matchHistory.length">
            <h2>Encounters this season:</h2>
            <p
              v-if="state.matchHistory.length"
              class="ongoing-match__recent-encounters"
            >
              <span style="color: green;">{{
                wonMatchesAgainstOpponent.length
              }}</span>
              -
              <span style="color: red;">{{
                lostMatchesAgainstOpponent.length
              }}</span>
            </p>
            <WButton @click="showVSDetails = true">Details</WButton>
          </template>
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
            :race="state.opponentStats.race"
          />
        </div>
      </template>
      <template v-if="showVSDetails && !selectedMatchId">
        <div class="ongoing-match__detailed-vs-matches">
          <div style="grid-area: header;">
            <WButton @click="showVSDetails = false">Back</WButton>
          </div>
          <div style="font-size: 24px;">
            <span class="ongoing-match__player-name">{{
              state.hero.name
            }}</span>
            vs
            <span class="ongoing-match__player-name">{{
              state.opponent.name
            }}</span>
            <br />
            season {{ currentSeason }} <br />
            <span style="color: green; font-size: 34px;">{{
              wonMatchesAgainstOpponent.length
            }}</span
            ><span style="font-size: 34px;"> - </span>
            <span style="color: red; font-size: 34px;">{{
              lostMatchesAgainstOpponent.length
            }}</span>
          </div>
          <div style="text-align: left;overflow:auto;">
            <h3 style="color: green; margin-top: 0;">
              {{ state.hero.name }} won:
            </h3>
            <MatchResult
              v-for="match in wonMatchesAgainstOpponent"
              :key="match.id"
              :match="match"
              :battle-tag="battleTag"
              :with-opponent-name="false"
              @click="selectedMatchId = match.id"
            />
          </div>
          <div style="text-align: left;overflow:auto;">
            <h3 style="color: red;margin-top: 0;">
              {{ state.hero.name }} lost:
            </h3>
            <MatchResult
              v-for="match in lostMatchesAgainstOpponent"
              :key="match.id"
              :match="match"
              :battle-tag="battleTag"
              :with-opponent-name="false"
              @click="selectedMatchId = match.id"
            />
          </div>
        </div>
      </template>
      <template v-if="showVSDetails && selectedMatchId">
        <div style="grid-column: 1/4">
          <WButton @click="selectedMatchId = 0">Back</WButton>

          <RecentMatch :match-id="selectedMatchId" :battle-tag="battleTag" />
        </div>
      </template>
    </template>
    <p v-else style="font-size: 24px; grid-column: 2;">
      No 1v1 match currently in progress
    </p>
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
import WButton from "@/components/common/WButton.vue";
import MatchResult from "@/components/MatchResult.vue";
import RecentMatch from "@/components/RecentMatch.vue";

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
  components: { WButton, PlayerRanking, MatchResult, RecentMatch },
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
    const selectedMatchId = ref(0);
    const wonMatchesAgainstOpponent: Array<Match> = [];
    const lostMatchesAgainstOpponent: Array<Match> = [];
    const showVSDetails = ref(false);

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
          state.matchHistory = matchHistory.matches.filter(
            match => match.gameMode === EGameMode.GM_1ON1
          );

          if (state.matchHistory.length) {
            for (const match of state.matchHistory) {
              for (const team of match.teams) {
                for (const player of team.players) {
                  if (player.battleTag === props.battleTag) {
                    if (player.won) {
                      wonMatchesAgainstOpponent.push(match);
                    } else {
                      lostMatchesAgainstOpponent.push(match);
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
      wonMatchesAgainstOpponent,
      lostMatchesAgainstOpponent,
      showVSDetails,
      selectedMatchId
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

  &__detailed-vs-matches {
    grid-column: 1 / 4;
    display: grid;
    grid-template-columns: 240px 1fr 1fr;
    grid-template-areas: "header header header" "left center right";
    grid-template-rows: 30px 420px;
    grid-row-gap: 15px;
    grid-column-gap: 25px;
  }

  &__player-name {
    color: var(--color-yellow);
  }
}
</style>
