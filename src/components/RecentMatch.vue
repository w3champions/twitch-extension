<template>
  <div v-if="state.lastMatch.match" class="last-match">
    <div class="player-infos">
      <div
        class="player-name"
        style="text-align: right;"
        :title="streamerStats.name"
      >
        <div class="player-name__main">
          <a :href="`https://w3champions.com/player/${encodeURIComponent(battleTag)}`" target="_blank">{{ playerAkas[battleTag] || streamerStats.name }}</a>
        </div>
        <div v-if="playerAkas[battleTag]" class="player-name__as"> as {{ streamerStats.name }}</div>
      </div>
      <div class="race-icon">
        <img
          :src="getRaceIcon(streamerStats.race, streamerStats.rndRace)"
          width="50"
          height="50"
          alt="race"
        />
      </div>
      <div>VS</div>
      <div class="race-icon">
        <img
          :src="getRaceIcon(opponentStats.race, opponentStats.rndRace)"
          width="50"
          height="50"
          alt="race"
        />
      </div>
      <div
        class="player-name"
        style="text-align: left;"
        :title="opponentStats.name"
      >
        <div class="player-name__main">
          <a :href="`https://w3champions.com/player/${encodeURIComponent(opponentStats.battleTag)}`" target="_blank">{{ playerAkas[opponentStats.battleTag] || opponentStats.name }}</a>
        </div>
        <div v-if="playerAkas[opponentStats.battleTag]" class="player-name__as"> as {{ opponentStats.name }}</div>
      </div>
    </div>
    <div class="winners-mmr-container">
      <div class="mmr-stats">
        <div>
          {{ streamerStats.oldMmr }} <span class="gray">MMR</span> <span
            :style="{ color: streamerStats.mmrGain > 0 ? 'var(--color-green)' : 'var(--color-red)' }"
          >({{ streamerStats.mmrGain > 0 ? "+" : "" }}{{ streamerStats.mmrGain }})</span>
        </div>
      </div>
      <div class="winner-icon">
        <img
          v-if="streamerStats.won"
          src="/Crown_Indicator.png"
          width="50"
          height="50"
          alt="winner"
        />
      </div>
      <div></div>
      <div class="winner-icon">
        <img
          v-if="opponentStats.won"
          src="/Crown_Indicator.png"
          width="50"
          height="50"
          alt="winner"
        />
      </div>
      <div class="mmr-stats">
        <div>
          {{ opponentStats.oldMmr }} <span class="gray">MMR</span> <span
            :style="{ color: opponentStats.mmrGain > 0 ? 'var(--color-green)' : 'var(--color-red)' }"
          >({{ opponentStats.mmrGain > 0 ? "+" : "" }}{{ opponentStats.mmrGain }})</span>
        </div>
      </div>
    </div>
    <div class="stats-container">
      <div class="heroes-stats-container">
        <div class="heroes-stats heroes-stats__left">
          <div
            v-for="[i, hero] of streamerScores.heroes.slice().reverse().entries()"
            :key="i"
            class="hero-icon"
          >
            <img
              :src="getHeroIcon(hero.icon)"
              width="64"
              height="64"
              :alt="heroNames[hero.icon]"
            />
            <span class="hero-level" :class="{'hero-level__large': i === streamerScores.heroes.length - 1}"> {{ hero.level }} </span>
          </div>
        </div>
        <div class="resource-stats resource-stats__left">
          <div class="resource-stats-line">
            <span :style="resourceScores.xp.streamerStyle">{{ Math.round(resourceScores.xp.streamer) }}</span>
            <img :src="getStatIcon('plus')" width="16" height="16" :alt="'XP'" style="vertical-align: sub;" />
            <span>XP/min</span>
          </div>
          <div class="resource-stats-line">
            <span :style="resourceScores.gold.streamerStyle">{{ resourceScores.gold.streamer }}</span>
            <img :src="getStatIcon('gold')" width="16" height="16" :alt="'Gold'" style="vertical-align: sub;" />
            <span>Gold/min</span>
          </div>
          <div class="resource-stats-line">
            <span :style="resourceScores.lumber.streamerStyle">{{ resourceScores.lumber.streamer }}</span>
            <img :src="getStatIcon('lumber')" width="16" height="16" :alt="'Lumber'" style="vertical-align: sub;" />
            <span>Lumber/min</span>
          </div>
        </div>
      </div>
      <div class="game-stats">
        <div class="game-stats-section">
          <ScoreStat
            title="Heroes killed"
            icon="kills"
            :stat1="streamerScores.heroScore.heroesKilled"
            :stat2="opponentScores.heroScore.heroesKilled"
          />
          <ScoreStat
            title="Experience gained"
            icon="plus"
            :stat1="streamerScores.heroScore.expGained"
            :stat2="opponentScores.heroScore.expGained"
          />
          <ScoreStat
            title="Items collected"
            icon="items"
            :stat1="streamerScores.heroScore.itemsObtained"
            :stat2="opponentScores.heroScore.itemsObtained"
          />
        </div>

        <div class="game-stats-section">
          <ScoreStat
            title="Units killed"
            icon="kills"
            :stat1="streamerScores.unitScore.unitsKilled"
            :stat2="opponentScores.unitScore.unitsKilled"
          />
          <ScoreStat
            title="Units produced"
            icon="supply"
            :stat1="streamerScores.unitScore.unitsProduced"
            :stat2="opponentScores.unitScore.unitsProduced"
          />
          <ScoreStat
            title="Largest army"
            icon="supply"
            :stat1="streamerScores.unitScore.largestArmy"
            :stat2="opponentScores.unitScore.largestArmy"
          />
        </div>

        <div class="game-stats-section">
          <ScoreStat
            title="Gold mined"
            icon="gold"
            :stat1="streamerScores.resourceScore.goldCollected"
            :stat2="opponentScores.resourceScore.goldCollected"
          />
          <ScoreStat
            title="Lumber harvested"
            icon="lumber"
            :stat1="streamerScores.resourceScore.lumberCollected"
            :stat2="opponentScores.resourceScore.lumberCollected"
          />
          <ScoreStat
            title="Upkeep lost"
            icon="gold"
            :stat1="streamerScores.resourceScore.goldUpkeepLost"
            :stat2="opponentScores.resourceScore.goldUpkeepLost"
          />
        </div>
      </div>
      <div class="heroes-stats-container">
        <div class="heroes-stats heroes-stats__right">
          <div
            v-for="[i, hero] in opponentScores.heroes.entries()"
            :key="i"
            class="hero-icon"
          >
            <img
              :src="getHeroIcon(hero.icon)"
              width="64"
              height="64"
              :alt="heroNames[hero.icon]"
            />
            <span class="hero-level" :class="{'hero-level__large': i === 0}"> {{ hero.level }} </span>
          </div>
        </div>
        <div class="resource-stats resource-stats__right">
          <div class="resource-stats-line">
            <span>XP/min</span>
            <img :src="getStatIcon('plus')" width="16" height="16" :alt="'XP'" style="vertical-align: sub;" />
            <span :style="resourceScores.xp.opponentStyle">{{ resourceScores.xp.opponent }}</span>
          </div>
          <div class="resource-stats-line">
            <span>Gold/min</span>
            <img :src="getStatIcon('gold')" width="16" height="16" :alt="'Gold'" style="vertical-align: sub;" />
            <span :style="resourceScores.gold.opponentStyle">{{ resourceScores.gold.opponent }}</span>
          </div>
          <div class="resource-stats-line">
            <span>Lumber/min</span>
            <img :src="getStatIcon('lumber')" width="16" height="16" :alt="'Lumber'" style="vertical-align: sub;" />
            <span :style="resourceScores.lumber.opponentStyle">{{ resourceScores.lumber.opponent }}</span>
          </div>
        </div>
      </div>
      <div></div>
      <div class="map-stats">
        <div style="text-align: center">
          <span class="gray">Map:</span> {{ state.lastMatch.match.mapName }}
        </div>
        <div style="text-align: center">
          <span class="gray">Duration:</span> {{ gameDuration }}
        </div>
        <div style="text-align: center">
          <span class="gray">Start time:</span> {{ gameDate.toLocaleString() }}
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, reactive } from "vue";
import { MatchDetail } from "@/typings";
import { formatDuration } from "date-fns/formatDuration";
import { intervalToDuration } from "date-fns/intervalToDuration";
import { getRaceIcon, getHeroIcon, getStatIcon } from "@/utils/assets";
import { heroNames } from "@/constants/constants";
import ScoreStat from "@/components/ScoreStat.vue";
import { fetchMatchStats } from "@/utils/fetch";
import usePlayerAka from "@/composables/usePlayerAka";

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
    const { fetchPlayerAka, playerAkas } = usePlayerAka();

    const state = reactive({ lastMatch: {} as MatchDetail });
    const streamerStats = computed(() => 
      state.lastMatch?.match?.teams
        .flatMap(team => team.players)
        .find(player => player.battleTag === props.battleTag)!
    );
    const streamerScores = computed(() =>
      state.lastMatch?.playerScores
        .find(score => score.battleTag === props.battleTag)!
    );
    const opponentStats = computed(() => 
      state.lastMatch?.match?.teams
        .flatMap(team => team.players)
        .find(player => player.battleTag !== props.battleTag)!
    );
    const opponentScores = computed(() =>
      state.lastMatch?.playerScores
        .find(score => score.battleTag !== props.battleTag)!
    );
    const gameDuration = computed(() =>
      formatDuration(
        intervalToDuration({
          start: 0,
          end: state.lastMatch.match.durationInSeconds * 1000
        })
      )
    );
    const gameDate = computed(() => new Date(state.lastMatch.match.startTime));
    const durationMinutes = computed(() => state.lastMatch.match.durationInSeconds / 60);

    onMounted(async () => {
      if (!props.battleTag) return;
      const [lastMatch] = await Promise.all([
        fetchMatchStats(props.matchId),
        fetchPlayerAka(props.battleTag)
      ]);
      state.lastMatch = lastMatch;
      if (opponentStats.value) {
        await fetchPlayerAka(opponentStats.value.battleTag);
      }
    });

    const resourceScores = computed(() => {
      const compareStat = (stat1: number, stat2: number) => {
        if (stat1 === stat2) return "white";
        return stat1 > stat2 ? "var(--color-green)" : "var(--color-red)";
      };
      const minutes = durationMinutes.value;
      const streamerHero = streamerScores.value.heroScore;
      const opponentHero = opponentScores.value.heroScore;
      const streamerRes = streamerScores.value.resourceScore;
      const opponentRes = opponentScores.value.resourceScore;
      return {
        xp: {
          streamer: Math.round(streamerHero.expGained / minutes),
          opponent: Math.round(opponentHero.expGained / minutes),
          streamerStyle: { color: compareStat(streamerHero.expGained, opponentHero.expGained) },
          opponentStyle: { color: compareStat(opponentHero.expGained, streamerHero.expGained) },
        },
        gold: {
          streamer: Math.round(streamerRes.goldCollected / minutes),
          opponent: Math.round(opponentRes.goldCollected / minutes),
          streamerStyle: { color: compareStat(streamerRes.goldCollected, opponentRes.goldCollected) },
          opponentStyle: { color: compareStat(opponentRes.goldCollected, streamerRes.goldCollected) },
        },
        lumber: {
          streamer: Math.round(streamerRes.lumberCollected / minutes),
          opponent: Math.round(opponentRes.lumberCollected / minutes),
          streamerStyle: { color: compareStat(streamerRes.lumberCollected, opponentRes.lumberCollected) },
          opponentStyle: { color: compareStat(opponentRes.lumberCollected, streamerRes.lumberCollected) },
        }
      };
    });

    return {
      streamerStats,
      streamerScores,
      opponentStats,
      opponentScores,
      resourceScores,
      gameDuration,
      gameDate,
      state,
      getHeroIcon,
      getRaceIcon,
      getStatIcon,
      heroNames,
      playerAkas,
      durationMinutes,
    };
  }
});
</script>

<style lang="scss" scoped>
.last-match {
  display: grid;
  grid-template-rows: 50px 1fr;
  grid-row-gap: 5px;
  margin-top: 20px;
}

.player-infos {
  display: grid;
  grid-template-columns: 1fr 50px 50px 50px 1fr;
  grid-template-rows: 50px;
  align-items: center;
  grid-column-gap: 10px;
}

.winners-mmr-container {
  display: grid;
  grid-template-columns: 1fr 50px 50px 50px 1fr;
  grid-template-rows: 50px;
  align-items: center;
  grid-column-gap: 10px;

  .winner-icon {
    img {
      transform: rotate(30deg);
    }
    &:first-of-type {
      text-align: right;
    }
    &:last-of-type {
      text-align: left;
    }
  }

  .mmr-stats {
    &:first-of-type {
      text-align: right;
    }
    &:last-of-type {
      text-align: left;
    }
  }
}

.stats-container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: 1fr 150px;
  grid-column-gap: 12px;
  grid-row-gap: 20px;
}

.player-name {
  color: var(--color-yellow);
  font-weight: bold;
  text-overflow: ellipsis;

  a {
    vertical-align: middle;  
    text-decoration: none;
    color: var(--color-yellow);
    padding: 0 8px;
    margin: 0 -8px;
    &:hover {
      border-radius: 10px;
      background-color: #4447;
    }
  }

  &__main {
    font-size: 28px;
  }

  &__as {
    margin-top: -8px;
    font-size: 12px;
  }
}

.game-stats {
  display: grid;
  grid-row-gap: 15px;

  .game-stats-section {
    display: grid;
    grid-auto-flow: row;
    grid-row-gap: 6px;
  }
}

.map-stats {
  display: flex;
  flex-direction: column;
}

.heroes-stats-container {
  .heroes-stats {
    display: grid;
    grid-auto-flow: column;
    grid-template-rows: 64px;
    grid-auto-columns: 64px;
    grid-column-gap: 16px;
    height: 132px;

    &__left {
      justify-content: flex-end;
      margin-right: 30px;
    }

    &__right {
      justify-content: flex-start;
      margin-left: 30px;
    }

    .hero-icon {
      position: relative;

      .hero-level {
        position: absolute;
        width: 40px;
        height: 24px;
        bottom: -24px;
        right: 12px;
        background: rgba(50, 194, 165, .4);
        clip-path: polygon(0 0, 100% 0, 100% 68%, 50% 100%, 0 68%);
        display: block;
        font-size: 18px;
        line-height: 1.2em;

        &__large {
          width: 48px;
          height: 32px;
          bottom: -32px;
          right: 8px;
          font-size: 1.5em;
        }
      }
    }
  }

  .resource-stats {
    display: grid;
    grid-row-gap: 6px;
    margin-top: 16px;
    
    .resource-stats-line {
      height: 16px;
      line-height: 1;
    }

    &__left {
      text-align: right;
      margin-right: 30px;
      img {
        margin: 0 5px;
      }
    }
    &__right {
      text-align: left;
      margin-left: 30px;
      img {
        margin: 0 5px;
      }
    }
  }
}

.race-icon {
  display: flex;
  align-items: center;

  img {
    width: 100%;
    height: 100%;
  }
}
</style>
