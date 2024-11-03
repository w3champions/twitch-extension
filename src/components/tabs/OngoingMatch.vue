<template>
  <div class="ongoing-match">
    <template v-if="state.ongoingMatch">
      <template v-if="!showVSDetails">
        <div class="ongoing-match__column">
          <PlayerRanking
            v-if="state.streamerStats && state.streamer && state.opponentStats && state.opponent"
            :player="state.streamer"
            :stats="state.streamerStats"
            :opponent="state.opponent"
            :opponent-stats="state.opponentStats"
            :aka="playerAkas[state.streamer.battleTag] ?? undefined"
          />
        </div>
        <div>
          <div style="margin-top: 40px; margin-bottom: 20px;">
            Map: {{ state.ongoingMatch.mapName }}
            <br />
            {{ new Date(state.ongoingMatch.startTime).toLocaleString() }}
          </div>
          <template v-if="state.matchHistory.length">
            <h2>Head-to-head this season</h2>
            <div class="ongoing-match__recent-encounters">
              <span style="color: var(--color-green);">{{ wonMatchesAgainstOpponent.length }}</span>
              -
              <span style="color: var(--color-red);">{{ lostMatchesAgainstOpponent.length }}</span>
            </div>
            <WButton @click="showVSDetails = true">Details</WButton>
          </template>
          <h2 v-else>
            No encounters this season
          </h2>
        </div>
        <div class="ongoing-match__column">
          <PlayerRanking
            v-if="state.opponentStats && state.opponent && state.streamerStats && state.streamer"
            :player="state.opponent"
            :stats="state.opponentStats"
            :opponent="state.streamer"
            :opponent-stats="state.streamerStats"
            :aka="playerAkas[state.opponent.battleTag] ?? undefined"
          />
        </div>
      </template>
      <template v-if="showVSDetails && !selectedMatchId">
        <div class="ongoing-match__detailed-vs-matches">
          <div style="grid-area: header;">
            <WButton @click="showVSDetails = false">Back</WButton>
          </div>
          <div style="font-size: 24px;">
            <span class="ongoing-match__player-name">{{ state?.streamer?.name }}</span>
            vs
            <span class="ongoing-match__player-name">{{ state?.opponent?.name }}</span>
            <br />
            Season {{ currentSeason }} <br />
            <span style="color: var(--color-green); font-size: 34px;">{{ wonMatchesAgainstOpponent.length }}</span>
            <span style="font-size: 34px;"> - </span>
            <span style="color: var(--color-red); font-size: 34px;">{{ lostMatchesAgainstOpponent.length }}</span>
          </div>
          <div style="text-align: left;overflow:auto;">
            <h3 style="color: var(--color-green); margin-top: 0;">
              {{ state?.streamer?.name }} won:
            </h3>
            <Suspense
              v-for="match in wonMatchesAgainstOpponent"
              :key="match.id"
            >
              <MatchResult
                :match="match"
                :battle-tag="battleTag"
                :with-opponent-name="false"
                @click="selectedMatchId = match.id"
              />
            </Suspense>
          </div>
          <div style="text-align: left;overflow:auto;">
            <h3 style="color: var(--color-red); margin-top: 0;">
              {{ state?.streamer?.name }} lost:
            </h3>
            <Suspense
              v-for="match in lostMatchesAgainstOpponent"
              :key="match.id"
            >
              <MatchResult
                :match="match"
                :battle-tag="battleTag"
                :with-opponent-name="false"
                @click="selectedMatchId = match.id"
              />
            </Suspense>
          </div>
        </div>
      </template>
      <template v-if="showVSDetails && selectedMatchId">
        <div style="grid-column: 1/4">
          <WButton @click="selectedMatchId = ''">Back</WButton>

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
import usePlayerAka from "@/composables/usePlayerAka";

type Props = {
  battleTag: string;
  currentSeason: number;
};

type State = {
  ongoingMatch: OngoingMatch | null;
  streamer: PlayerInTeam | null;
  streamerStats: ModeStat | null;
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
    const selectedMatchId = ref("");
    const wonMatchesAgainstOpponent: Array<Match> = [];
    const lostMatchesAgainstOpponent: Array<Match> = [];
    const showVSDetails = ref(false);
    const { fetchPlayerAka, playerAkas } = usePlayerAka();

    const state = reactive({
      ongoingMatch: null,
      streamer: null,
      streamerStats: null,
      opponent: null,
      opponentStats: null,
      matchHistory: []
    } as State);

    onMounted(async () => {
      if (!props.battleTag) return;

      const ongoingMatch = await fetchOngoingMatch(props.battleTag);
      if (!ongoingMatch || ongoingMatch.gameMode !== EGameMode.GM_1ON1) {
        state.ongoingMatch = null;
        return;
      }
      state.ongoingMatch = ongoingMatch;

      const matchPlayers = state.ongoingMatch.teams.flatMap(t => t.players);

      state.streamer = matchPlayers.find(player => player.battleTag === props.battleTag)!;
      state.opponent = matchPlayers.find(player => player.battleTag !== props.battleTag)!;

      const [heroStats, opponentStats, matchHistory] = await Promise.all([
        fetchPlayerStats(props.battleTag, props.currentSeason),
        fetchPlayerStats(state.opponent!.battleTag, props.currentSeason),
        fetchPlayerStatsAgainstOpponent(
          state.streamer.battleTag,
          state.opponent.battleTag,
          props.currentSeason
        ),
        fetchPlayerAka(state.streamer.battleTag),
        fetchPlayerAka(state.opponent.battleTag)
      ]);

      state.streamerStats = heroStats.find(
        s => s.race === state.streamer!.race && s.gameMode === EGameMode.GM_1ON1
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
    });

    return {
      state,
      wonMatchesAgainstOpponent,
      lostMatchesAgainstOpponent,
      showVSDetails,
      selectedMatchId,
      playerAkas,
    };
  }
});
</script>

<style lang="scss" scoped>
.ongoing-match {
  display: grid;
  grid-template-columns: 1fr 200px 1fr;
  grid-column-gap: 20px;

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
