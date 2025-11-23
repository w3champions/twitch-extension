<template>
  <div class="ffa-match-container">
    <div class="match-header">
      <div class="mode-info">
        <span class="gray">Mode:</span> {{ gameModeName }}
      </div>
      <div class="map-info"><span class="gray">Map:</span> {{ mapName }}</div>
      <div v-if="serverName" class="server-info">
        <span class="gray">Server:</span> {{ serverName }}
      </div>
      <div class="time-info">
        <span class="gray">Start:</span> <relative-time :time="startTime" />
      </div>
    </div>

    <div class="players-grid">
      <div
        v-for="player in players"
        :key="player.battleTag"
        class="player-card"
      >
        <div class="player-header">
          <div class="race-icon">
            <img :src="getRaceIcon(player.race)" />
          </div>
          <a
            :href="`https://w3champions.com/player/${encodeURIComponent(player.battleTag)}`"
            target="_blank"
            class="player-name"
          >
            {{ playerAkas[player.battleTag] || player.name }}
          </a>
        </div>

        <div v-if="playerStats[player.battleTag]" class="player-stats">
          <div class="stat-row">
            <span class="gray">MMR:</span>
            {{ playerStats[player.battleTag].mmr }}
          </div>
          <div class="stat-row">
            <span class="gray">Rank:</span>
            <img
              :src="getLeagueIcon(playerStats[player.battleTag].leagueOrder)"
              class="league-icon"
            />
            #{{ playerStats[player.battleTag].rank }}
          </div>
          <div class="stat-row">
            <span class="gray">Winrate:</span>
            {{ Math.round(playerStats[player.battleTag].winrate * 100) }}%
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from "vue";
import { Team, ModeStat, EGameMode } from "@/typings";
import RelativeTime from "@/components/RelativeTime.vue";
import { gameModes, leagues } from "@/constants/constants";
import { getRaceIcon } from "@/utils/assets";
import usePlayerAka from "@/composables/usePlayerAka";

export default defineComponent({
  name: "FFAMatch",
  components: { RelativeTime },
  props: {
    teams: {
      type: Array as PropType<Team[]>,
      required: true,
    },
    playerStats: {
      type: Object as PropType<Record<string, ModeStat>>,
      default: () => ({}),
    },
    mapName: {
      type: String,
      required: true,
    },
    mode: {
      type: Number as PropType<EGameMode>,
      required: true,
    },
    startTime: {
      type: String,
      required: true,
    },
    serverName: {
      type: String,
      default: "",
    },
  },
  setup(props) {
    const { playerAkas } = usePlayerAka();

    const players = computed(() => {
      return props.teams.flatMap((t) => t.players);
    });

    const gameModeName = computed(() => {
      return gameModes[props.mode] || "Unknown Mode";
    });

    const getLeagueIcon = (leagueOrder: number) => {
      const leagueName = leagues[leagueOrder];
      return `/leagues/${leagueName}.png`;
    };

    return {
      players,
      gameModeName,
      getRaceIcon,
      playerAkas,
      getLeagueIcon,
    };
  },
});
</script>

<style lang="scss" scoped>
.ffa-match-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.match-header {
  display: flex;
  gap: 30px;
  font-size: 18px;
  margin-bottom: 10px;
}

.players-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  width: 100%;
}

.player-card {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid var(--color-yellow);
  border-radius: 8px;
  padding: 15px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.player-header {
  display: flex;
  align-items: center;
  gap: 10px;
}

.race-icon img {
  width: 32px;
  height: 32px;
}

.player-name {
  font-size: 18px;
  font-weight: bold;
  color: var(--color-yellow);
  text-decoration: none;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.player-stats {
  display: flex;
  flex-direction: column;
  gap: 5px;
  font-size: 14px;
}

.league-icon {
  width: 16px;
  height: 16px;
  vertical-align: middle;
  margin-right: 4px;
}
</style>
