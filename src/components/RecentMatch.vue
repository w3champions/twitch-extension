<template>
  <div v-if="state.lastMatch.match" class="last-match">
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
      <div style="text-align: left;">
        <div>
          {{ heroStats.oldMmr }} <span class="gray">MMR</span> (<span
            :style="{
              color:
                heroStats.mmrGain > 0
                  ? 'var(--color-green)'
                  : 'var(--color-red)'
            }"
            >{{ heroStats.mmrGain > 0 ? "+" : "" }}{{ heroStats.mmrGain }}</span
          >)
        </div>
      </div>
      <div
        class="player-name"
        style="text-align: right;"
        :title="heroStats.name"
      >
        {{ heroStats.name }}
      </div>
      <div class="race-icon"></div>
      <div>VS</div>
      <div class="race-icon"></div>
      <div
        class="player-name"
        style="text-align: left;"
        :title="opponentStats.name"
      >
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
      <div class="heroes-stats-container">
        <div class="heroes-stats">
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
        <div style="text-align: left;">
          XP per minute:
          {{
            Math.round(
              (heroScores.heroScore.expGained /
                state.lastMatch.match.durationInSeconds) *
                60
            )
          }}
          <br />
          Gold per minute:
          {{
            Math.round(
              (heroScores.resourceScore.goldCollected /
                state.lastMatch.match.durationInSeconds) *
                60
            )
          }}
          <br />
          Lumber per minute:
          {{
            Math.round(
              (heroScores.resourceScore.lumberCollected /
                state.lastMatch.match.durationInSeconds) *
                60
            )
          }}
        </div>
      </div>
      <div class="game-stats">
        <div class="game-stats-section">
          <ScoreStat
            title="Heroes killed"
            icon="kills"
            :stat1="heroScores.heroScore.heroesKilled"
            :stat2="opponentScores.heroScore.heroesKilled"
          />
          <ScoreStat
            title="Experience gained"
            icon="plus"
            :stat1="heroScores.heroScore.expGained"
            :stat2="opponentScores.heroScore.expGained"
          />
          <ScoreStat
            title="Items collected"
            icon="items"
            :stat1="heroScores.heroScore.itemsObtained"
            :stat2="opponentScores.heroScore.itemsObtained"
          />
        </div>

        <div class="game-stats-section">
          <ScoreStat
            title="Units killed"
            icon="kills"
            :stat1="heroScores.unitScore.unitsKilled"
            :stat2="opponentScores.unitScore.unitsKilled"
          />
          <ScoreStat
            title="Units produced"
            icon="supply"
            :stat1="heroScores.unitScore.unitsProduced"
            :stat2="opponentScores.unitScore.unitsProduced"
          />
          <ScoreStat
            title="Largest army"
            icon="supply"
            :stat1="heroScores.unitScore.largestArmy"
            :stat2="opponentScores.unitScore.largestArmy"
          />
        </div>

        <div class="game-stats-section">
          <ScoreStat
            title="Gold mined"
            icon="gold"
            :stat1="heroScores.resourceScore.goldCollected"
            :stat2="opponentScores.resourceScore.goldCollected"
          />
          <ScoreStat
            title="Lumber harvested"
            icon="lumber"
            :stat1="heroScores.resourceScore.lumberCollected"
            :stat2="opponentScores.resourceScore.lumberCollected"
          />
          <ScoreStat
            title="Upkeep lost"
            icon="gold"
            :stat1="heroScores.resourceScore.goldUpkeepLost"
            :stat2="opponentScores.resourceScore.goldUpkeepLost"
          />
        </div>
      </div>
      <div class="heroes-stats-container">
        <div class="heroes-stats" style="justify-content: flex-end;">
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
        <div style="text-align: right;">
          XP per minute:
          {{
            Math.round(
              (opponentScores.heroScore.expGained /
                state.lastMatch.match.durationInSeconds) *
                60
            )
          }}
          <br />
          Gold per minute:
          {{
            Math.round(
              (opponentScores.resourceScore.goldCollected /
                state.lastMatch.match.durationInSeconds) *
                60
            )
          }}
          <br />
          Lumber per minute:
          {{
            Math.round(
              (opponentScores.resourceScore.lumberCollected /
                state.lastMatch.match.durationInSeconds) *
                60
            )
          }}
        </div>
      </div>
      <div class="map-stats">
        <div style="text-align: right">
          Map:<br />
          {{ mapNames[state.lastMatch.match.map] }}
        </div>
        <div class="map">
          <img :src="getMinimap(state.lastMatch.match.map)" alt="minimap" />
          <div class="minimap-overlay"></div>
        </div>
        <div style="text-align: left">
          Duration:<br />
          {{ gameDuration }}
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, reactive } from "vue";
import { MatchDetail } from "@/typings";
import formatDuration from "date-fns/formatDuration";
import intervalToDuration from "date-fns/intervalToDuration";
import { getAsset } from "@/utils/assets";
import { heroNames, mapNames } from "@/constants/constants";
import ScoreStat from "@/components/ScoreStat.vue";
import { fetchMatchStats } from "@/utils/fetch";

function getHeroIcon(hero: string) {
  return getAsset(`heroes/${hero}.png`);
}

function getMinimap(map: string) {
  return getAsset(`maps/${map}.png`);
}

type Props = {
  battleTag: string;
  matchId: string;
};

export default defineComponent({
  name: "RecentMatch",
  components: { ScoreStat },
  props: {
    battleTag: {
      type: String,
      default: ""
    },
    matchId: {
      type: String,
      required: true
    }
  },
  setup(props: Props) {
    const state = reactive({ lastMatch: {} as MatchDetail });
    const heroStats = computed(() => {
      let heroPlayer;

      for (const team of state.lastMatch.match.teams) {
        for (const player of team.players) {
          if (player.battleTag === props.battleTag) {
            heroPlayer = player;
            break;
          }
        }
      }

      return heroPlayer;
    });
    const heroScores = computed(() =>
      state.lastMatch.playerScores.find(
        score => score.battleTag === props.battleTag
      )
    );
    const opponentStats = computed(() => {
      let opponentPlayer;

      for (const team of state.lastMatch.match.teams) {
        for (const player of team.players) {
          if (player.battleTag !== props.battleTag) {
            opponentPlayer = player;
            break;
          }
        }
      }

      return opponentPlayer;
    });
    const opponentScores = computed(() =>
      state.lastMatch.playerScores.find(
        score => score.battleTag !== props.battleTag
      )
    );
    const gameDuration = computed(() =>
      formatDuration(
        intervalToDuration({
          start: 0,
          end: state.lastMatch.match.durationInSeconds * 1000
        })
      )
    );

    onMounted(async () => {
      if (props.battleTag) {
        state.lastMatch = await fetchMatchStats(props.matchId);
      }
    });

    return {
      heroStats,
      heroScores,
      opponentStats,
      opponentScores,
      gameDuration,
      state,
      getHeroIcon,
      getMinimap,
      heroNames,
      mapNames
    };
  }
});
</script>

<style lang="scss" scoped>
.last-match {
  display: grid;
  grid-template-rows: 50px 1fr;
  grid-row-gap: 25px;
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

.winner-icon {
  img {
    transform: rotate(30deg);
  }
}

.player-name {
  color: var(--color-yellow);
  font-weight: bold;
  font-size: 28px;
  overflow: hidden;
  text-overflow: ellipsis;
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

.heroes-stats-container {
  display: grid;
  grid-template-rows: 48px 1fr;
  grid-row-gap: 20px;
}
</style>
