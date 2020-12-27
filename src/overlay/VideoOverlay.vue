<template>
  <w-button class="overlay-toggle" @click="isRecentMatchStatsVisible = true">
    W3C
  </w-button>
  <transition name="slide">
    <div v-if="isRecentMatchStatsVisible" class="container">
      <button class="close-button" @click="isRecentMatchStatsVisible = false" />
      <header class="header">
        <div class="promo">Welcome to W3C</div>
        <div class="header-tabs">
          <w-button
            v-for="tab in tabs"
            :key="tab"
            :is-active="currentTab === tab"
            @click="currentTab = tab"
            >{{ tabNames[tab] }}</w-button
          >
        </div>
      </header>
      <div v-if="currentTab === 'currentMatch' && currentMatch.data.id">
        {{
          getWinProbability(
            currentMatch.data.teams[0].players[0].oldMmr,
            currentMatch.data.teams[1].players[0].oldMmr
          )
        }}% {{ currentMatch.data.teams[0].players[0].name }} -
        {{ currentMatch.data.teams[0].players[0].oldMmr }}
        {{ currentMatch.data.teams[1].players[0].name }} -
        {{ currentMatch.data.teams[1].players[0].oldMmr }}
      </div>
      <div
        v-if="currentTab === 'recentMatch' && recentMatch.data.match"
        class="tab-area"
      >
        <div class="player-infos">
          <div class="winner-icon">
            <img
              v-if="heroStats.won"
              src="../assets/Crown_Indicator.png"
              width="50"
              height="50"
              alt="winner"
            />
          </div>
          <div class="mmr-stats" style="text-align: left;">
            <div>
              {{ heroStats.oldMmr }} <span class="gray">MMR</span> (<span
                :style="{
                  color:
                    heroStats.mmrGain > 0
                      ? 'var(--color-green)'
                      : 'var(--color-red)'
                }"
                >{{ heroStats.mmrGain > 0 ? "+" : ""
                }}{{ heroStats.mmrGain }}</span
              >)
            </div>
          </div>
          <div class="player-name" style="text-align: right;">
            {{ heroStats.name }}
          </div>
          <div class="race-icon"></div>
          <div>VS</div>
          <div class="race-icon"></div>
          <div class="player-name" style="text-align: left;">
            {{ opponentStats.name }}
          </div>
          <div class="mmr-stats" style="text-align: right;">
            <div>
              {{ opponentStats.oldMmr }} <span class="gray">MMR</span> (<span
                :style="{
                  color:
                    opponentStats.mmrGain > 0
                      ? 'var(--color-green)'
                      : 'var(--color-red)'
                }"
                >{{ opponentStats.mmrGain > 0 ? "+" : ""
                }}{{ opponentStats.mmrGain }}</span
              >)
            </div>
          </div>
          <div class="winner-icon">
            <img
              v-if="opponentStats.won"
              src="../assets/Crown_Indicator.png"
              width="50"
              height="50"
              alt="winner"
            />
          </div>
        </div>
        <div class="stats-container">
          <div class="heroes-stats" style="justify-content: flex-end;">
            <div
              v-for="hero in heroScores.heroes"
              :key="hero.icon"
              class="hero-icon"
            >
              <img
                :src="getHeroIcon(hero.icon)"
                width="48"
                height="48"
                :alt="heroNames[hero.icon]"
              />
              <span class="hero-level"> {{ hero.level }} </span>
            </div>
          </div>
          <div class="game-stats">
            <div class="game-stats-section">
              <ScoreStatRow
                title="Heroes killed"
                icon="kills"
                :stat1="heroScores.heroScore.heroesKilled"
                :stat2="opponentScores.heroScore.heroesKilled"
              />
              <ScoreStatRow
                title="Experience gained"
                icon="plus"
                :stat1="heroScores.heroScore.expGained"
                :stat2="opponentScores.heroScore.expGained"
              />
              <ScoreStatRow
                title="Items collected"
                icon="items"
                :stat1="heroScores.heroScore.itemsObtained"
                :stat2="opponentScores.heroScore.itemsObtained"
              />
            </div>

            <div class="game-stats-section">
              <ScoreStatRow
                title="Units killed"
                icon="kills"
                :stat1="heroScores.unitScore.unitsKilled"
                :stat2="opponentScores.unitScore.unitsKilled"
              />
              <ScoreStatRow
                title="Units produced"
                icon="supply"
                :stat1="heroScores.unitScore.unitsProduced"
                :stat2="opponentScores.unitScore.unitsProduced"
              />
              <ScoreStatRow
                title="Largest army"
                icon="supply"
                :stat1="heroScores.unitScore.largestArmy"
                :stat2="opponentScores.unitScore.largestArmy"
              />
            </div>

            <div class="game-stats-section">
              <ScoreStatRow
                title="Gold mined"
                icon="gold"
                :stat1="heroScores.resourceScore.goldCollected"
                :stat2="opponentScores.resourceScore.goldCollected"
              />
              <ScoreStatRow
                title="Lumber harvested"
                icon="lumber"
                :stat1="heroScores.resourceScore.lumberCollected"
                :stat2="opponentScores.resourceScore.lumberCollected"
              />
              <ScoreStatRow
                title="Upkeep lost"
                icon="gold"
                :stat1="heroScores.resourceScore.goldUpkeepLost"
                :stat2="opponentScores.resourceScore.goldUpkeepLost"
              />
            </div>
          </div>
          <div class="heroes-stats">
            <div
              v-for="hero in opponentScores.heroes"
              :key="hero.icon"
              class="hero-icon"
            >
              <img
                :src="getHeroIcon(hero.icon)"
                width="48"
                height="48"
                :alt="heroNames[hero.icon]"
              />
              <span class="hero-level"> {{ hero.level }} </span>
            </div>
          </div>
          <div class="map-stats">
            <div style="text-align: right">
              Map:<br />
              {{ mapNames[recentMatch.data.match.map] }}
            </div>
            <div class="map">
              <img
                :src="getMinimap(recentMatch.data.match.map)"
                alt="minimap"
              />
              <div class="minimap-overlay"></div>
            </div>
            <div style="text-align: left">
              Duration:<br />
              {{ gameDuration }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  onMounted,
  reactive,
  ref,
  watch
} from "vue";
import ScoreStatRow from "@/components/ScoreStat.vue";
import formatDuration from "date-fns/formatDuration";
import intervalToDuration from "date-fns/intervalToDuration";
import WButton from "@/components/common/WButton.vue";
import { heroNames, mapNames } from "@/constants/constants";
import { Match, MatchDetail } from "@/typings";

enum Tabs {
  CURRENT_MATCH = "currentMatch",
  RECENT_MATCH = "recentMatch"
}

function getAsset(path: string) {
  return require(`../assets/${path}`);
}

async function fetchMatchStats(matchId: string): Promise<MatchDetail> {
  const url = `https://statistic-service.w3champions.com/api/matches/${matchId}`;
  const response = await fetch(url);
  return response.json();
}

async function fetchRecentMatches(battleTag: string): Promise<MatchDetail> {
  const encodedBattleTag = encodeURIComponent(battleTag);
  const url = `https://statistic-service.w3champions.com/api/matches/search?playerId=${encodedBattleTag}&gateway=20&offset=0&pageSize=1&season=5`;

  const response = await fetch(url);
  const matchHistory = await response.json();

  return fetchMatchStats(String(matchHistory.matches[0].id));
}

async function fetchOngoingMatch(battleTag: string): Promise<Match> {
  const encodedBattleTag = encodeURIComponent(battleTag);
  const url = `https://statistic-service.w3champions.com/api/matches/ongoing/${encodedBattleTag}`;

  const response = await fetch(url);

  return response.json();
}

function getHeroIcon(hero: string) {
  return getAsset(`heroes/${hero}.png`);
}
function getMinimap(map: string) {
  return getAsset(`maps/${map}.png`);
}

function getWinProbability(ratingA: number, ratingB: number) {
  const diff = (ratingB - ratingA) / 400;
  return Math.floor((1 / (1 + Math.pow(10, diff))) * 100);
}

export default defineComponent({
  name: "VideoOverlay",
  components: { WButton, ScoreStatRow },
  setup() {
    const battleTag = ref("");
    const recentMatch = reactive({ data: {} as MatchDetail });
    const currentMatch = reactive({ data: {} as Match });

    const currentTab = ref(Tabs.CURRENT_MATCH);
    const tabs = [Tabs.CURRENT_MATCH, Tabs.RECENT_MATCH];
    const isRecentMatchStatsVisible = ref(false);

    watch(currentTab, async tab => {
      if (isRecentMatchStatsVisible.value) {
        if (tab === Tabs.RECENT_MATCH) {
          recentMatch.data = await fetchRecentMatches(battleTag.value);
        }

        if (tab === Tabs.CURRENT_MATCH) {
          currentMatch.data = await fetchOngoingMatch(battleTag.value);
        }
      }
    });
    watch(isRecentMatchStatsVisible, async isVisible => {
      if (!isVisible) {
        currentTab.value = Tabs.CURRENT_MATCH;
      } else {
        if (currentTab.value === Tabs.RECENT_MATCH) {
          recentMatch.data = await fetchRecentMatches(battleTag.value);
        }

        if (currentTab.value === Tabs.CURRENT_MATCH) {
          currentMatch.data = await fetchOngoingMatch(battleTag.value);
        }
      }
    });

    const heroStats = computed(() => {
      let heroPlayer;

      for (const team of recentMatch.data.match.teams) {
        for (const player of team.players) {
          if (player.battleTag === battleTag.value) {
            heroPlayer = player;
            break;
          }
        }
      }

      return heroPlayer;
    });
    const heroScores = computed(() =>
      recentMatch.data.playerScores.find(
        score => score.battleTag === battleTag.value
      )
    );
    const opponentStats = computed(() => {
      let opponentPlayer;

      for (const team of recentMatch.data.match.teams) {
        for (const player of team.players) {
          if (player.battleTag !== battleTag.value) {
            opponentPlayer = player;
            break;
          }
        }
      }

      return opponentPlayer;
    });
    const opponentScores = computed(() =>
      recentMatch.data.playerScores.find(
        score => score.battleTag !== battleTag.value
      )
    );
    const gameDuration = computed(() =>
      formatDuration(
        intervalToDuration({
          start: 0,
          end: recentMatch.data.match.durationInSeconds * 1000
        })
      )
    );

    onMounted(() => {
      window.Twitch.ext.configuration.onChanged(() => {
        if (window.Twitch.ext.configuration.broadcaster) {
          const config = JSON.parse(
            window.Twitch.ext.configuration.broadcaster?.content
          );

          battleTag.value = config.battleTag;
        }
      });
    });

    return {
      battleTag,
      isRecentMatchStatsVisible,
      recentMatch,
      currentMatch,
      currentTab,
      tabs,
      heroNames,
      mapNames,
      heroStats,
      heroScores,
      opponentStats,
      opponentScores,
      gameDuration,
      getHeroIcon,
      getMinimap,
      tabNames: {
        [Tabs.CURRENT_MATCH]: "Current match",
        [Tabs.RECENT_MATCH]: "Last match"
      },
      getWinProbability
    };
  }
});
</script>

<style lang="scss">
html {
  --color-yellow: #ffe033;
  --color-green: #34c264;
  --color-red: #bf301f;
  --color-gray: #83817e;

  font-family: "Spectral", serif;
}

* {
  box-sizing: border-box;
}

.gray {
  color: var(--color-gray);
}

.overlay-toggle {
  position: fixed;
  top: 0;
  left: 0;
}

.container {
  color: white;
  width: 1022px;
  height: 657px;
  position: relative;
  background: url("../assets/background.webp");
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: 85px 1fr;
  grid-row-gap: 25px;
  justify-content: center;
  text-align: center;
  padding: 60px 60px 30px;
  margin: -8px auto 0;
}

.player-infos {
  display: grid;
  grid-template-columns: 50px 150px 1fr 50px 50px 50px 1fr 150px 50px;
  grid-template-rows: 50px;
  align-items: center;
  grid-column-gap: 10px;
}

.stats-container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: 1fr 150px;
  grid-column-gap: 12px;
  grid-row-gap: 20px;
}

.close-button {
  cursor: pointer;
  width: 48px;
  height: 48px;
  background: url("../assets/exit-button.png");
  background-size: contain;
  position: absolute;
  top: 60px;
  right: 30px;
  border: none;
  outline: none;

  &:hover {
    background: url("../assets/exit-button-hover.png");
    background-size: contain;
  }
}

.slide-enter-active {
  animation: bounceInDown 1s;
}

.slide-leave-active {
  animation: bounceInDown 1s reverse;
}

@keyframes bounceInDown {
  0%,
  60%,
  75%,
  90%,
  to {
    animation-timing-function: cubic-bezier(0.215, 0.61, 0.355, 1);
  }

  0% {
    opacity: 0;
    transform: translate3d(0, -3000px, 0) scaleY(3);
  }

  60% {
    opacity: 1;
    transform: translate3d(0, 25px, 0) scaleY(0.9);
  }

  75% {
    transform: translate3d(0, -10px, 0) scaleY(0.95);
  }

  90% {
    transform: translate3d(0, 5px, 0) scaleY(0.985);
  }

  to {
    transform: translateZ(0);
  }
}

.heroes-stats {
  display: grid;
  grid-auto-flow: column;
  grid-template-rows: 48px;
  grid-column-gap: 16px;
  grid-auto-columns: 48px;
}

.hero-icon {
  position: relative;
}

.hero-level {
  position: absolute;
  bottom: 1px;
  right: 1px;
  background: black;
  width: 15px;
  display: block;
  font-size: 10px;
}

.player-name {
  color: var(--color-yellow);
  font-weight: bold;
  font-size: 28px;
}

.winner-icon {
  img {
    transform: rotate(30deg);
  }
}

.game-stats-section {
  margin-bottom: 15px;
  display: grid;
  grid-auto-flow: row;
  grid-row-gap: 5px;

  &:last-of-type {
    margin-bottom: 0;
  }
}

.map-stats {
  grid-column: 1/4;
  display: grid;
  grid-template-columns: 1fr 135px 1fr;
  grid-column-gap: 12px;
}

.map {
  grid-column: 2;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-around;
  width: 135px;
  height: 137px;
  margin: 0 auto;

  img {
    max-width: 135px;
  }
}

.minimap-overlay {
  position: absolute;
  top: 0;
  left: 0;
  background-image: url("../assets/Map_Frame.png");
  background-size: contain;
  width: 135px;
  height: 137px;
}

.header {
  display: grid;
  grid-template-rows: 1fr 28px;
  grid-row-gap: 15px;
  padding: 10px 0;
}

.header-tabs {
  display: grid;
  grid-auto-flow: column;
  grid-column-gap: 10px;
  grid-auto-columns: min-content;
  justify-content: center;
}

.tab-area {
  display: grid;
  grid-template-rows: 50px 1fr;
  grid-row-gap: 25px;
}
</style>
