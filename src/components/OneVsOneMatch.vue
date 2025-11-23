<template>
  <div class="one-vs-one-match">
    <div class="match-column">
      <PlayerRanking
        v-if="streamer"
        :player="streamer"
        :stats="streamerStats"
        :opponent="opponent"
        :opponent-stats="opponentStats"
        :aka="streamerAka"
      />
    </div>
    <div class="center-column">
      <div class="match-info">
        <div v-if="gameMode" class="mode-info">
          <span class="gray">Mode:</span> {{ gameModeName }}
        </div>
        <div><span class="gray">Map:</span> {{ mapName }}</div>
        <div v-if="serverName">
          <span class="gray">Server:</span> {{ serverName }}
        </div>
        <div>
          <span class="gray">Start:</span> <relative-time :time="startTime" />
        </div>
      </div>
      <template v-if="matchHistory.length">
        <h2>This season:</h2>
        <div class="recent-encounters">
          <span class="wins">{{ wonMatches }}</span>
          -
          <span class="losses">{{ lostMatches }}</span>
        </div>
        <WButton @click="$emit('show-head-to-head')">Head-to-Head</WButton>
      </template>
      <h2 v-else>No encounters this season</h2>
    </div>
    <div class="match-column">
      <PlayerRanking
        v-if="opponent"
        :player="opponent"
        :stats="opponentStats"
        :opponent="streamer"
        :opponent-stats="streamerStats"
        :aka="opponentAka"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from "vue";
import { Match, ModeStat, PlayerInTeam, EGameMode } from "@/typings";
import PlayerRanking from "@/components/PlayerRanking.vue";
import WButton from "@/components/WButton.vue";
import RelativeTime from "@/components/RelativeTime.vue";
import { gameModes } from "@/constants/constants";

export default defineComponent({
  name: "OneVsOneMatch",
  components: { WButton, PlayerRanking, RelativeTime },
  props: {
    streamer: {
      type: Object as PropType<PlayerInTeam>,
      required: true,
    },
    opponent: {
      type: Object as PropType<PlayerInTeam>,
      required: true,
    },
    streamerStats: {
      type: Object as PropType<ModeStat | null>,
      default: null,
    },
    opponentStats: {
      type: Object as PropType<ModeStat | null>,
      default: null,
    },
    matchHistory: {
      type: Array as PropType<Match[]>,
      default: () => [],
    },
    mapName: {
      type: String,
      required: true,
    },
    startTime: {
      type: String,
      required: true,
    },
    streamerAka: {
      type: String,
      default: undefined,
    },
    opponentAka: {
      type: String,
      default: undefined,
    },
    gameMode: {
      type: Number as PropType<EGameMode>,
      required: true,
    },
    serverName: {
      type: String,
      default: "",
    },
  },
  emits: ["show-head-to-head"],
  setup(props) {
    const wonMatches = computed(() => {
      return props.matchHistory.filter((match) => {
        const playerTeam = match.teams.find((t) =>
          t.players.some((p) => p.battleTag === props.streamer.battleTag),
        );
        return playerTeam?.won; // In 1v1, if the team won, the player won
      }).length;
    });

    const lostMatches = computed(() => {
      return props.matchHistory.length - wonMatches.value;
    });

    const gameModeName = computed(() => {
      return gameModes[props.gameMode] || "Unknown Mode";
    });

    return {
      wonMatches,
      lostMatches,
      gameModeName,
    };
  },
});
</script>

<style lang="scss" scoped>
.one-vs-one-match {
  display: grid;
  grid-template-columns: 1fr 280px 1fr;
  width: 100%;
  margin-top: 10px;

  h2 {
    margin-bottom: 0;
  }

  .match-column {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .center-column {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .match-info {
    margin-top: 40px;
    margin-bottom: 20px;
  }

  .recent-encounters {
    font-size: 50px;

    .wins {
      color: var(--color-green);
    }
    .losses {
      color: var(--color-red);
    }
  }
}
</style>
