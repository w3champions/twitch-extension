<template>
  <div v-if="state.matchDetail" class="team-match-details">
    <div class="actions-bar">
      <div class="left-actions">
        <WButton @click="$router.back()">Back</WButton>
      </div>
      <div class="right-actions">
        <a
          :href="`https://w3champions.com/match/${matchId}`"
          target="_blank"
          class="w-button-link"
        >
          <WButton>Full Details</WButton>
        </a>
      </div>
    </div>

    <!-- Teams Left/Right with VS -->
    <div class="teams-vs-container">
      <!-- Left Team -->
      <div class="team-column left-team">
        <div
          v-for="player in leftTeam?.players ?? []"
          :key="player.battleTag"
          class="player-row"
        >
          <div class="player-info">
            <div class="player-header" :class="{ 'has-aka': !!playerAkas[player.battleTag]}">
              <div
                class="mmr-display"
                :style="{
                  color:
                    player.mmrGain > 0
                      ? 'var(--color-green)'
                      : player.mmrGain < 0
                        ? 'var(--color-red)'
                        : 'var(--color-gray)',
                }"
              >
                <span v-if="player.currentMmr" class="current-mmr">{{ player.currentMmr }}</span>
                <span v-else class="current-mmr">Unranked</span>
                <span v-if="player.mmrGain" class="mmr-change">
                  ({{ player.mmrGain > 0 ? "+" : "" }}{{ player.mmrGain }})
                </span>
              </div>
              <div
                class="player-name"
                :class="{ 'is-me': player.battleTag === store.battleTag, 'has-aka': !!playerAkas[player.battleTag] }"
              >
                <a
                  :href="`https://w3champions.com/player/${encodeURIComponent(player.battleTag)}`"
                  target="_blank"
                >
                  {{ playerAkas[player.battleTag] || player.name }}
                </a>
              </div>
            </div>
            <div
              v-if="
                playerAkas[player.battleTag] &&
                player.name !== playerAkas[player.battleTag]
              "
              class="player-aka"
            >
              as {{ player.name }}
            </div>
            <div
              v-if="reverseSortedHeroes(player).length > 0"
              class="player-heroes"
            >
              <div
                v-for="hero in reverseSortedHeroes(player)"
                :key="hero.icon"
                class="hero-icon"
              >
                <img :src="getHeroIcon(hero.icon)" width="32" height="32" />
                <span class="hero-level">{{ hero.level }}</span>
              </div>
            </div>
            <div v-else class="player-heroes-pad"></div>
          </div>
          <div class="race-icon">
            <img :src="getRaceIcon(player.race, player.rndRace)" />
          </div>
        </div>
      </div>

      <!-- VS + Match Info + Crown -->
      <div class="vs-column">
        <div class="vs-wrapper">
          <img
            v-if="leftTeam?.won"
            src="/Crown_Indicator.png"
            class="crown-icon crown-left"
            width="40"
            height="40"
            alt="winner"
          />
          <div class="vs-text">VS</div>
          <img
            v-if="rightTeam?.won"
            src="/Crown_Indicator.png"
            class="crown-icon crown-right"
            width="40"
            height="40"
            alt="winner"
          />
        </div>
        <div class="match-info">
          <div class="info-line">
            <span class="info-label">Mode:</span>
            <span>{{ gameModes[state.matchDetail.match.gameMode] }}</span>
          </div>
          <div class="info-line">
            <span class="info-label">Map:</span>
            <span>{{ state.matchDetail.match.mapName }}</span>
          </div>
          <div class="info-line">
            <span class="info-label">Server:</span>
            <span>{{
              state.matchDetail.match.serverInfo?.name || "Unknown"
            }}</span>
          </div>
          <div class="info-line">
            <span class="info-label">Duration:</span>
            <span>{{ gameDuration }}</span>
          </div>
          <div class="info-line">
            <span class="info-label">Start time:</span>
            <span>{{ gameDate.toLocaleString() }}</span>
          </div>
        </div>
      </div>

      <!-- Right Team -->
      <div class="team-column right-team">
        <div
          v-for="player in rightTeam?.players ?? []"
          :key="player.battleTag"
          class="player-row"
        >
          <div class="race-icon">
            <img :src="getRaceIcon(player.race, player.rndRace)" />
          </div>
          <div class="player-info">
            <div class="player-header" :class="{ 'has-aka': !!playerAkas[player.battleTag]}">
              <!-- Name first, then MMR on the right -->
              <div
                class="player-name"
                :class="{ 'is-me': player.battleTag === store.battleTag }"
              >
                <a
                  :href="`https://w3champions.com/player/${encodeURIComponent(player.battleTag)}`"
                  target="_blank"
                >
                  {{ playerAkas[player.battleTag] || player.name }}
                </a>
              </div>
              <div
                class="mmr-display"
                :style="{
                  color:
                    player.mmrGain > 0
                      ? 'var(--color-green)'
                      : player.mmrGain < 0
                        ? 'var(--color-red)'
                        : 'var(--color-gray)',
                }"
              >
                <span v-if="player.currentMmr" class="current-mmr">{{ player.currentMmr }}</span>
                <span v-else class="current-mmr">Unranked</span>
                <span v-if="player.mmrGain" class="mmr-change">
                  ({{ player.mmrGain > 0 ? "+" : "" }}{{ player.mmrGain }})
                </span>
              </div>
            </div>
            <div
              v-if="
                playerAkas[player.battleTag] &&
                player.name !== playerAkas[player.battleTag]
              "
              class="player-aka"
            >
              as {{ player.name }}
            </div>
            <div v-if="sortedHeroes(player).length > 0" class="player-heroes">
              <div
                v-for="hero in sortedHeroes(player)"
                :key="hero.icon"
                class="hero-icon"
              >
                <img :src="getHeroIcon(hero.icon)" width="32" height="32" />
                <span class="hero-level">{{ hero.level }}</span>
              </div>
            </div>
            <div v-else class="player-heroes-pad"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, reactive, computed } from "vue";
import { MatchDetail, PlayerInTeam } from "@/typings";
import { getRaceIcon, getHeroIcon } from "@/utils/assets";
import { formatMatchDuration } from "@/utils/time";
import { formatDuration } from "date-fns/formatDuration";
import { intervalToDuration } from "date-fns/intervalToDuration";
import { gameModes } from "@/constants/constants";
import usePlayerAka from "@/composables/usePlayerAka";
import { useW3CStore } from "@/store/w3c";
import WButton from "@/components/WButton.vue";

export default defineComponent({
  name: "TeamMatchDetails",
  components: { WButton },
  props: {
    matchId: {
      type: String,
      required: true,
    },
  },

  setup(props) {
    const { fetchPlayerAka, playerAkas } = usePlayerAka();
    const store = useW3CStore();
    const state = reactive({ matchDetail: null as MatchDetail | null });

    const leftTeam = computed(() => {
      if (!state.matchDetail) return null;
      return (
        state.matchDetail.match.teams.find((t) =>
          t.players.some((p) => p.battleTag === store.battleTag),
        ) || state.matchDetail.match.teams[0]
      );
    });

    const rightTeam = computed(() => {
      if (!state.matchDetail) return null;
      return (
        state.matchDetail.match.teams.find((t) => t !== leftTeam.value) ||
        state.matchDetail.match.teams[1]
      );
    });

    const gameDuration = computed(() => {
      if (!state.matchDetail) return "";
      return formatDuration(
        intervalToDuration({
          start: 0,
          end: state.matchDetail.match.durationInSeconds * 1000,
        }),
      );
    });

    const gameDate = computed(() => {
      if (!state.matchDetail) return new Date();
      return new Date(state.matchDetail.match.startTime);
    });

    onMounted(async () => {
      state.matchDetail = await store.fetchMatchDetails(props.matchId);

      // Preload akas
      const players = state.matchDetail.match.teams.flatMap((t) => t.players);
      await Promise.all(players.map((p) => fetchPlayerAka(p.battleTag)));
    });

    const getPlayerHeroes = (player: PlayerInTeam) => {
      if (state.matchDetail?.playerScores) {
        const score = state.matchDetail.playerScores.find(
          (s) => s.battleTag === player.battleTag,
        );
        if (score) return score.heroes;
      }
      return [];
    };

    const sortedHeroes = (player: PlayerInTeam) => {
      const heroes = getPlayerHeroes(player);
      return heroes.slice().sort((a, b) => b.level - a.level);
    };

    const reverseSortedHeroes = (player: PlayerInTeam) => {
      const heroes = getPlayerHeroes(player);
      return heroes
        .slice()
        .sort((a, b) => b.level - a.level)
        .reverse();
    };

    return {
      formatMatchDuration,
      getRaceIcon,
      getHeroIcon,
      playerAkas,
      getPlayerHeroes,
      sortedHeroes,
      reverseSortedHeroes,
      leftTeam,
      rightTeam,
      gameModes,
      gameDuration,
      gameDate,
      store,
      state,
    };
  },
});
</script>

<style lang="scss" scoped>
.team-match-details {
  display: flex;
  flex-direction: column;
  gap: 15px;
  padding: 15px 10px;
}

.actions-bar {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  margin-bottom: 5px;
}

.left-actions {
  grid-column: 2;
}

.right-actions {
  grid-column: 3;
  justify-self: end;
  display: flex;
  gap: 8px;
}

.w-button-link {
  text-decoration: none;
}

.teams-vs-container {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 20px;
  align-items: flex-start;
  margin-top: 10px;
}

.team-column {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.player-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.race-icon {
  align-self: flex-start;
  height: 48px;
  width: 48px;
  margin-top: -8px;
  img {
    height: 48px;
    width: 48px;
  }
}

.left-team .player-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0;
  align-items: flex-end;
  text-align: right;
}

.right-team .player-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0;
  align-items: flex-start;
  text-align: left;
}

.player-header {
  display: flex;
  align-items: center;
  gap: 12px;

  &.has-aka {
    margin-top: -9px;
  }
}

.left-team .player-header {
  justify-content: flex-end;
}

.right-team .player-header {
  justify-content: flex-start;
}

.player-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.player-name {
  font-size: 18px;
  color: white;

  &.is-me {
    color: var(--color-yellow);
    font-weight: bold;
  }

  a {
    text-decoration: none;
    color: inherit;
    padding: 0 4px;
    margin: 0 -4px;
    border-radius: 6px;
    display: inline-block;

    &:hover {
      background-color: rgba(255, 255, 255, 0.1);
    }
  }
}

.mmr-display {
  display: flex;
  align-items: center;
  gap: 2px;
}

.current-mmr {
  font-size: 13px;
}

.mmr-change {
  font-size: 13px;
}

.player-aka {
  font-size: 10px;
  color: var(--color-gray);
  margin-top: -6px;
}

.player-heroes {
  display: flex;
  gap: 4px;
  margin-bottom: 16px;
}

.player-heroes-pad {
  height: 48px;
}

.hero-icon {
  position: relative;
  width: 32px;
  height: 32px;

  .hero-level {
    position: absolute;
    width: 24px;
    height: 16px;
    bottom: -16px;
    right: 4px;
    background: rgba(50, 194, 165, 0.4);
    clip-path: polygon(0 0, 100% 0, 100% 68%, 50% 100%, 0 68%);
    display: block;
    font-size: 11px;
    line-height: 1.3em;
    font-weight: bold;
    color: white;
    text-align: center;
  }
}

.vs-column {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
  min-width: 200px;
  padding: 0 10px;
}

.vs-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 120px;
  height: 50px;
}

.vs-text {
  font-size: 22px;
  font-weight: bold;
  color: var(--color-yellow);
}

.crown-icon {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);

  &.crown-left {
    left: -20px;
    transform: translateY(-50%) rotate(30deg);
  }

  &.crown-right {
    right: -20px;
    transform: translateY(-50%) rotate(30deg);
  }
}

.match-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  text-align: center;
  font-size: 13px;
}

.info-line {
  display: flex;
  gap: 4px;
  justify-content: center;
}

.info-label {
  color: var(--color-gray);
}
</style>
