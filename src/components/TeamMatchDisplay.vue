<template>
  <div class="team-match-display">
    <div class="teams-container">
      <div class="team-box">
        <div class="players-list">
          <div
            v-for="player in teams[0].players"
            :key="player.battleTag"
            class="player-row player-row-left"
          >
            <div class="player-content">
              <div class="player-info">
                <a
                  :href="`https://w3champions.com/player/${encodeURIComponent(player.battleTag)}`"
                  target="_blank"
                  class="player-name"
                >
                  {{ playerAkas[player.battleTag] || player.name }}
                </a>
                <span v-if="playerStats[player.battleTag]" class="mmr-info">
                  <span class="gray">MMR</span>
                  {{ playerStats[player.battleTag].mmr }} |
                  <span class="gray">Top </span
                  >{{
                    Math.round(
                      (1 - playerStats[player.battleTag].quantile) * 1000,
                    ) / 10
                  }}
                  %
                </span>
                <span v-if="playerStats[player.battleTag]" class="rank-info">
                  <img
                    :src="
                      getLeagueIcon(playerStats[player.battleTag].leagueOrder)
                    "
                    class="league-icon"
                  />
                  {{ getLeagueName(playerStats[player.battleTag].leagueOrder) }}
                  {{
                    playerStats[player.battleTag].division
                      ? playerStats[player.battleTag].division
                      : ""
                  }}
                  #{{ playerStats[player.battleTag].rank }}
                </span>
              </div>
              <div class="race-icon">
                <img :src="getRaceIcon(player.race)" width="32" height="32" />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="vs-column">
        <div class="vs-text">VS</div>
        <div class="map-info">
          <div>
            <span class="label">Mode:</span>
            <span class="map-name">{{ getModeName(mode) }}</span>
          </div>
          <div>
            <span class="label">Map:</span>
            <span class="map-name">{{ mapName }}</span>
          </div>
          <div v-if="serverName">
            <span class="label">Server:</span>
            <span class="map-name">{{ serverName }}</span>
          </div>
          <div>
            <span class="label">Start Time:</span>
            <span class="map-name"><slot name="time"></slot></span>
          </div>
        </div>
      </div>
      <div class="team-box">
        <div class="players-list">
          <div
            v-for="player in teams[1].players"
            :key="player.battleTag"
            class="player-row player-row-right"
          >
            <div class="player-content reversed">
              <div class="player-info">
                <a
                  :href="`https://w3champions.com/player/${encodeURIComponent(player.battleTag)}`"
                  target="_blank"
                  class="player-name"
                >
                  {{ playerAkas[player.battleTag] || player.name }}
                </a>
                <span v-if="playerStats[player.battleTag]" class="mmr-info">
                  <span class="gray">MMR</span>
                  {{ playerStats[player.battleTag].mmr }} |
                  <span class="gray">Top </span
                  >{{
                    Math.round(
                      (1 - playerStats[player.battleTag].quantile) * 1000,
                    ) / 10
                  }}
                  %
                </span>
                <span v-if="playerStats[player.battleTag]" class="rank-info">
                  <img
                    :src="
                      getLeagueIcon(playerStats[player.battleTag].leagueOrder)
                    "
                    class="league-icon"
                  />
                  {{ getLeagueName(playerStats[player.battleTag].leagueOrder) }}
                  {{
                    playerStats[player.battleTag].division
                      ? playerStats[player.battleTag].division
                      : ""
                  }}
                  #{{ playerStats[player.battleTag].rank }}
                </span>
              </div>
              <div class="race-icon">
                <img :src="getRaceIcon(player.race)" width="32" height="32" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import { Team, ModeStat, EGameMode } from "@/typings";
import { getLeagueIcon, getRaceIcon } from "@/utils/assets";
import usePlayerAka from "@/composables/usePlayerAka";
import { leagues, leagueNames, gameModes } from "@/constants/constants";

export default defineComponent({
  name: "TeamMatchDisplay",
  props: {
    teams: {
      type: Array as PropType<Team[]>,
      required: true,
    },
    mode: {
      type: Number,
      required: true,
    },
    playerStats: {
      type: Object as PropType<Record<string, ModeStat>>,
      default: () => ({}),
    },
    mapName: {
      type: String,
      default: "",
    },
    serverName: {
      type: String,
      default: "",
    },
  },
  setup() {
    const { playerAkas } = usePlayerAka();

    const getLeagueName = (leagueOrder: number) => {
      const leagueName = leagues[leagueOrder];
      return leagueNames[leagueName];
    };

    const getModeName = (mode: EGameMode) => {
      return gameModes[mode];
    };

    return {
      getRaceIcon,
      playerAkas,
      getLeagueIcon,
      getLeagueName,
      getModeName,
    };
  },
});
</script>

<style lang="scss" scoped>
.team-match-display {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  margin-top: 30px;
  padding: 0 30px;
}

.map-info {
  text-align: center;
  margin-bottom: 10px;

  .label {
    font-size: 14px;
    color: #aaa;
    vertical-align: middle;
  }

  .map-name {
    font-size: 14px;
    color: white;
    margin-bottom: 5px;
    vertical-align: middle;
  }

  .start-time {
    font-size: 14px;
    color: #aaa;
    vertical-align: middle;
  }
}

.teams-container {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 30px;
  width: 100%;
  align-items: start;
}

.team-box {
  border: 2px solid var(--color-yellow);
  border-radius: 8px;
  padding: 20px;
  background: transparent;
}

.players-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.player-content {
  display: flex;
  align-items: center;
  gap: 12px;
  justify-content: flex-start;

  .player-info {
    align-items: flex-end;
  }

  &.reversed {
    flex-direction: row-reverse;
    justify-content: flex-start;

    .player-info {
      align-items: flex-start;
    }
  }

  .player-name {
    font-size: 18px;
    font-weight: bold;
    color: var(--color-yellow);
    text-decoration: none;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;

    &:hover {
      border-radius: 10px;
      padding: 0 5px;
      margin: 0 -5px;
      background-color: #4447;
    }
  }
}

.player-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0;
}

.mmr-info {
  font-size: 14px;
}

.rank-info {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
}

.league-icon {
  width: 16px;
  height: 16px;
  vertical-align: middle;
}

.race-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  img {
    width: 48px;
    height: 48px;
  }
}

.vs-column {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 40px;

  .vs-text {
    font-size: 32px;
    font-weight: bold;
    color: var(--color-yellow);
  }
}
</style>
