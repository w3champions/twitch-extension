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
      <header>
        <span
          :style="{
            color: heroStats.won ? 'var(--color-green)' : 'var(--color-red)'
          }"
          >{{ heroStats.won ? "Victory" : "Defeat" }}</span
        >
      </header>
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
          <div class="map"></div>
          {{ mapNames[recentMatch.match.map] }}
        </div>
      </div>
    </div>
  </transition>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { Match, MatchDetail, PlayerInTeam, PlayerScore } from "@/typings";
import ScoreStatRow from "@/components/ScoreStat.vue";

interface ComponentData {
  battleTag: string;
  matchHistory: { count: number; matches: Array<Match> };
  isRecentMatchStatsVisible: boolean;
  recentMatch: MatchDetail;
  heroNames: Record<string, string>;
  mapNames: Record<string, string>;
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
/* eslint-disable @typescript-eslint/camelcase */
const mapNames = {
  Overall: "Overall",
  twistedmeadows: "Twisted Meadows",
  echoisles: "Echo Isles",
  lastrefuge: "Last Refuge",
  northernisles: "Northern Isles",
  concealedhill: "Concealed Hill",
  terenasstand: "Terenas Stand LV",
  amazonia: "Amazonia",
  avalanche: "Avalanche LV",
  goldshire: "Goldshire",
  gnollwood: "Gnoll Wood",
  turtlerock: "Turtle Rock",
  losttemple: "Lost Temple LV",
  hillsbradcreek: "Hillsbrad Creek",
  autumnleaves: "Autumn Leaves",
  _1v1_autumnleaves_anon: "Autumn Leaves",
  _ffa_marketsquare_anon: "Market Square",
  _ffa_marketsquare_anon_cd: "Market Square",
  deathrose: "Deathrose",
  _ffa_deathrose_anon: "Deathrose",
  _ffa_deathrose_anon_cd: "Deathrose",
  fountainofmanipulation: "Fountain Of Manipulation",
  _ffa_fountainofmanipulation_anon: "Fountain Of Manipulation",
  _ffa_fountainofmanipulation_anon_cd: "Fountain Of Manipulation",
  anarchycastle: "Anarchy Castle",
  _ffa_anarchycastle_anon: "Anarchy Castle",
  _ffa_anarchycastle_anon_cd: "Anarchy Castle",
  silverpineforest: "Silverpine Forest",
  _ffa_silverpineforest_anon: "Silverpine Forest",
  _ffa_silverpineforest_anon_cd: "Silverpine Forest",
  neoncity: "Neon City",
  _ffa_neoncity_anon: "Neon City",
  _ffa_neoncity_anon_cd: "Neon City",
  harvestofsorrow: "Harvest Of Sorrow",
  _ffa_harvestofsorrow_anon: "Harvest Of Sorrow",
  _ffa_harvestofsorrow_anon_cd: "Harvest Of Sorrow",
  _ffa_twilightruins_anon: "Twilight Ruins",
  _ffa_twilightruins_anon_cd: "Twilight Ruins",
  "deadlock lv": "Deadlock LV",
  "_ffa_deadlock lv_anon": "Deadlock LV",
  "_ffa_deadlock lv_anon_cd": "Deadlock LV",
  "_ffa_sanctuary lv_anon": "Sanctuary LV",
  "_ffa_sanctuary lv_anon_cd": "Sanctuary LV",
  rockslide: "Rockslide",
  _ffa_rockslide_anon: "Rockslide",
  _ffa_rockslide_anon_cd: "Rockslide",
  ferocity: "Ferocity",
  _ffa_ferocity_anon: "Ferocity",
  _ffa_ferocity_anon_cd: "Ferocity",
  frozenmarshlands: "Frozen Marshlands",
  _ffa_frozenmarshlands_anon: "Frozen Marshlands",
  _ffa_frozenmarshlands_anon_cd: "Frozen Marshlands",
  circleoffallenheroes: "Circle of Fallen Heroes",
  tidewaterglades: "Tidewater Glades LV",
  goldrush: "Gold Rush",
  feralas: "Feralas LV",
  murguloasis: "Mur'Gul Oasis LV",
  deadlock: "Deadlock LV",
  sanctuary: "Sanctuary LV",
  tatsascastlegardens: "Tastas Castle Gardens",
  nerubianpassage: "Nerubian Passage",
  battleground: "Battleground",
  northshire: "Northshire LV",
  twilightruins: "Twilight Ruins LV",
  northernfelwood: "Northern Felwood",
  marketsquare: "Market Square",
  golemsinthemist: "Golems in the Mist",
  cherryville: "Cherryville",
  dragonfalls: "Dragon Falls",
  fullscaleassault: "Full Scale Assault",
  _1v1_terenasstand_anon: "Terenas Stand",
  _1v1_lastrefuge_anon: "Last Refuge",
  _1v1_northernisles_anon: "Northern Isles",
  _1v1_amazonia_anon: "Amazonia",
  _1v1_echoisles_anon: "Echo Isles",
  _1v1_concealedhill_anon: "Concealed Hill",
  _1v1_twistedmeadows_anon: "Twisted Meadows",
  _gnollwood_anon: "Gnoll Wood",
  _avalanche_anon: "Avalanche",
  _battlegrounds_anon: "Battleground",
  _cherryville_anon: "Cherryville",
  _circleoffallenheroes_anon: "Circle of Fallen Heroes",
  _deadlock_lv_anon: "Deadlock LV",
  _feralas_lv_anon: "Feralas LV",
  _fullscaleassault_anon: "Full Scale Assault",
  _goldrush_anon: "Goldrush",
  _goldshire_anon: "Goldshire",
  _goleminthemist_lv_anon: "Golems in the Mist LV",
  _hillsbradcreek_anon: "Hillsbrad Creek",
  _losttemple_lv_anon: "Lost Temple LV",
  _marketsquare_anon: "Market Square",
  "_mur'galoasis_lv_anon": "Mur'gal Oasis LV",
  _nerubianpassage_anon: "Nerubian Passage",
  _northernfelwood_anon: "Northern Felwood",
  _northshire_lv_anon: "Northshire LV",
  _sanctuary_lv_anon: "Sanctuary LV",
  "sanctuary lv": "Sanctuary LV",
  _tidewaterglades_lv_anon: "Tidewater Glades LV",
  _tidewaterglades_anon: "Tidewater Glades LV",
  _turtlerock_anon: "Turtle Rock",
  _twilightruins_lv_anon: "Twilight Ruins LV",
  _twilightruins_anon: "Twilight Ruins",
  vilereef: "Vile Reef",
  dalarangarden: "Dalaran Garden",
  phantomgrovew3c: "Phantom Grove W3C",
  tidewatergladesw3c: "Tidewater Glades W3C",
  autumnleaves201016: "Autumn Leaves",
  ruinsofazshara201016: "Ruins of Azshara LV",
  phantomgrovew3c201016: "Phantom Grove W3C",
  vilereef201016: "Vile Reef",
  wellspringtemple201016: "Wellspring Temple",
  ferocity201016: "Ferocity",
  synergyw3c: "Synergy",
  featherville: "Featherville"
};
/* eslint-enable @typescript-eslint/camelcase */

function getAsset(path: string) {
  return require(`../assets/${path}`);
}

export default defineComponent({
  name: "VideoOverlay",
  components: { ScoreStatRow },
  data(): ComponentData {
    return {
      battleTag: "",
      matchHistory: {
        count: 0,
        matches: []
      },
      isRecentMatchStatsVisible: false,
      recentMatch: {} as MatchDetail,
      heroNames,
      mapNames
    };
  },
  computed: {
    heroStats(): PlayerInTeam {
      let heroPlayer;

      for (const team of (this.recentMatch as MatchDetail).match.teams) {
        for (const player of team.players) {
          if (player.battleTag === this.battleTag) {
            heroPlayer = player;
            break;
          }
        }
      }

      return heroPlayer as PlayerInTeam;
    },
    heroScores(): PlayerScore {
      // todo: check for non empty recent match here
      return (this.recentMatch as MatchDetail).playerScores.find(
        score => score.battleTag === this.battleTag
      )!;
    },
    opponentStats(): PlayerInTeam {
      let opponentPlayer;

      for (const team of (this.recentMatch as MatchDetail).match.teams) {
        for (const player of team.players) {
          if (player.battleTag !== this.battleTag) {
            opponentPlayer = player;
            break;
          }
        }
      }

      return opponentPlayer as PlayerInTeam;
    },
    opponentScores(): PlayerScore {
      return (this.recentMatch as MatchDetail).playerScores.find(
        score => score.battleTag !== this.battleTag
      )!;
    }
  },
  watch: {
    isRecentMatchStatsVisible(newVal) {
      if (newVal) this.fetchRecentMatches();
    }
  },
  mounted() {
    window.Twitch.ext.configuration.onChanged(async () => {
      if (window.Twitch.ext.configuration.broadcaster) {
        const config = JSON.parse(
          window.Twitch.ext.configuration.broadcaster?.content
        );

        this.battleTag = config.battleTag;
      }
    });
  },
  methods: {
    async fetchRecentMatches() {
      if (this.battleTag) {
        const encodedBattleTag = encodeURIComponent(this.battleTag);
        const url = `https://statistic-service.w3champions.com/api/matches/search?playerId=${encodedBattleTag}&gateway=20&offset=0&pageSize=1&season=5`;

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

<style lang="scss">
html {
  --color-yellow: #ffe033;
  --color-green: #34c264;
  --color-red: #bf301f;
  --color-gray: #83817e;
}

* {
  box-sizing: border-box;
}

.gray {
  color: var(--color-gray);
}

.stats-toggler {
  color: var(--color-yellow);
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
  grid-template-rows: 50px;
  align-items: center;
  grid-column-gap: 10px;
}

.stats-container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: 1fr 140px;
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
  margin-bottom: 25px;
  display: grid;
  grid-auto-flow: row;
  grid-row-gap: 5px;

  &:last-of-type {
    margin-bottom: 0;
  }
}

.map-stats {
  grid-column: 1/4;
}

.map {
  background-image: url("../assets/Map_Frame.png");
  background-size: contain;
  width: 140px;
  height: 140px;
}
</style>
