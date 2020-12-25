<template>
  <button class="stats-toggler" @click="isRecentMatchStatsVisible = true">
    W3C
  </button>
  <transition name="slide">
    <div
      v-if="isRecentMatchStatsVisible && recentMatch.match"
      class="container"
    >
      <button class="close-button" @click="isRecentMatchStatsVisible = false" />
      <header />
      <div class="player-infos">
        <div class="winner-icon"></div>
        <div class="mmr-stats">
          <div>
            {{ recentMatch.match.teams[0].players[0].currentMmr }} MMR ({{
              recentMatch.match.teams[0].players[0].mmrGain
            }})
          </div>
        </div>
        <div class="player-name">
          {{ recentMatch.match.teams[0].players[0].name }}
        </div>
        <div class="race-icon"></div>
        <div>VS</div>
        <div class="race-icon"></div>
        <div class="player-name">
          {{ recentMatch.match.teams[1].players[0].name }}
        </div>
        <div class="mmr-stats">
          <div>
            {{ recentMatch.match.teams[1].players[0].currentMmr }} MMR ({{
              recentMatch.match.teams[1].players[0].mmrGain
            }})
          </div>
        </div>
        <div class="winner-icon"></div>
      </div>
      <div class="stats-container">
        <div class="heroes-stats">
          <div
            v-for="hero in recentMatch.playerScores[0].heroes"
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
          <div>{{ recentMatch.playerScores[0].heroScore.heroesKilled }}</div>
          <div>Heroes killed</div>
          <div>{{ recentMatch.playerScores[1].heroScore.heroesKilled }}</div>

          <div>{{ recentMatch.playerScores[0].heroScore.expGained }}</div>
          <div>Experience gained</div>
          <div>{{ recentMatch.playerScores[1].heroScore.expGained }}</div>

          <div>{{ recentMatch.playerScores[0].heroScore.itemsObtained }}</div>
          <div>Items collected</div>
          <div>{{ recentMatch.playerScores[1].heroScore.itemsObtained }}</div>

          <div>114</div>
          <div>Units killed</div>
          <div>43</div>

          <div>{{ recentMatch.playerScores[0].unitScore.unitsProduced }}</div>
          <div>Units produced</div>
          <div>{{ recentMatch.playerScores[1].unitScore.unitsProduced }}</div>

          <div>{{ recentMatch.playerScores[0].unitScore.largestArmy }}</div>
          <div>Largest army</div>
          <div>{{ recentMatch.playerScores[1].unitScore.largestArmy }}</div>

          <div>
            {{ recentMatch.playerScores[0].resourceScore.goldCollected }}
          </div>
          <div>Gold mined</div>
          <div>
            {{ recentMatch.playerScores[1].resourceScore.goldCollected }}
          </div>

          <div>
            {{ recentMatch.playerScores[0].resourceScore.lumberCollected }}
          </div>
          <div>Lumber harvested</div>
          <div>
            {{ recentMatch.playerScores[1].resourceScore.lumberCollected }}
          </div>

          <div>
            {{ recentMatch.playerScores[0].resourceScore.goldUpkeepLost }}
          </div>
          <div>Upkeep lost</div>
          <div>
            {{ recentMatch.playerScores[1].resourceScore.goldUpkeepLost }}
          </div>
        </div>
        <div class="heroes-stats">
          <div
            v-for="hero in recentMatch.playerScores[1].heroes"
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
        <div class="map-stats"></div>
      </div>
    </div>
  </transition>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { EGameMode, Match, MatchDetail } from "@/typings";

interface ComponentData {
  battleTag: string;
  matchHistory: { count: number; matches: Array<Match> };
  isRecentMatchStatsVisible: boolean;
  recentMatch: MatchDetail;
  heroNames: Record<string, string>;
}

const heroNames = {
  all: "Any hero selection",
  none: "No hero selection",
  archmage: "Archmage",
  alchemist: "Goblin Alchemist",
  avatarofflame: "Firelord",
  bansheeranger: "Dark Ranger",
  beastmaster: "Beastmaster",
  blademaster: "Blademaster",
  cryptlord: "Crypt Lord",
  deathknight: "Death Knight",
  demonhunter: "Demon Hunter",
  dreadlord: "Dread Lord",
  farseer: "Farseer",
  keeperofthegrove: "Keeper of the Grove",
  lich: "Lich",
  mountainking: "Mountain King",
  paladin: "Paladin",
  pandarenbrewmaster: "Pandaren Brewmaster",
  pitlord: "Pit Lord",
  priestessofthemoon: "Priestress of the Moon",
  seawitch: "Naga Sea Witch",
  shadowhunter: "Shadow Hunter",
  sorceror: "Bloodmage",
  taurenchieftain: "Tauren Chieftain",
  tinker: "Goblin Tinker",
  warden: "Warden"
};

function getAsset(path: string) {
  return require(`../assets/${path}`);
}

export default defineComponent({
  name: "VideoOverlay",
  data(): ComponentData {
    return {
      battleTag: "",
      matchHistory: {
        count: 0,
        matches: []
      },
      isRecentMatchStatsVisible: false,
      recentMatch: {} as MatchDetail,
      heroNames
    };
  },
  computed: {
    meleeMatches(): Match[] {
      return this.matchHistory.matches.filter(
        (match: Match) => match.gameMode === EGameMode.GM_1ON1
      );
    }
  },
  mounted() {
    window.Twitch.ext.configuration.onChanged(async () => {
      if (window.Twitch.ext.configuration.broadcaster) {
        const config = JSON.parse(
          window.Twitch.ext.configuration.broadcaster?.content
        );

        this.battleTag = config.battleTag;
        this.fetchRecentMatches();
      }
    });
  },
  methods: {
    async fetchRecentMatches() {
      if (this.battleTag) {
        const encodedBattleTag = encodeURIComponent(this.battleTag);
        const url = `https://statistic-service.w3champions.com/api/matches/search?playerId=${encodedBattleTag}&gateway=20&offset=0&pageSize=10&season=5`;

        const response = await fetch(url);
        this.matchHistory = await response.json();

        this.fetchMatchStats(String(this.matchHistory.matches[0].id));
      }
    },
    async fetchMatchStats(matchId: string): Promise<void> {
      const url = `https://statistic-service.w3champions.com/api/matches/${matchId}`;
      const response = await fetch(url);
      this.recentMatch = await response.json();
    },
    getHeroIcon(hero: string) {
      return getAsset(`heroes/${hero}.png`);
    }
  }
});
</script>

<style scoped lang="scss">
* {
  box-sizing: border-box;
}

.stats-toggler {
  color: #fede32;
  position: fixed;
  top: 0;
  left: 0;
  width: 107px;
  height: 28px;
  background-image: url("../assets/Button_Blue.png");
  background-size: contain;
  border: none;
  outline: none;
  cursor: pointer;
  background-color: transparent;

  &:hover {
    background-image: url("../assets/Button_Blue_Hover.png");
  }

  &:active {
    background-image: url("../assets/Button_Blue_Active.png");
  }

  &::before {
    content: "";
    position: absolute;
    background-image: url("../assets/logo.png");
    width: 20px;
    height: 20px;
    left: 12px;
    top: 4px;
  }
}

.container {
  background: white;
  color: white;
  width: 1022px;
  height: 657px;
  position: relative;
  background: url("../assets/background.webp");
  display: grid;
  grid-template-areas: "header" "players" "stats";
  grid-template-columns: 1fr;
  grid-template-rows: 85px 50px 1fr;
  grid-row-gap: 25px;
  justify-content: center;
  text-align: center;
  padding: 60px 60px 30px;
  margin: -8px auto 0;
}

.player-infos {
  display: grid;
  grid-template-columns: 50px 150px 1fr 50px 50px 50px 1fr 150px 50px;
  align-items: center;
  grid-column-gap: 10px;
}

.stats-container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-column-gap: 12px;
}

.game-stats {
  display: grid;
  grid-template-columns: 25% 50% 25%;
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
  grid-template-columns: repeat(3, 48px);
  grid-template-rows: 48px;
  grid-column-gap: 16px;
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
</style>
