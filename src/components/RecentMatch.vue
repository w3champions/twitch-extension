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
          src="../assets/Crown_Indicator.png"
          width="50"
          height="50"
          alt="winner"
        />
      </div>
      <div></div>
      <div class="winner-icon">
        <img
          v-if="opponentStats.won"
          src="../assets/Crown_Indicator.png"
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
              width="48"
              height="48"
              :alt="heroNames[hero.icon]"
            />
            <span class="hero-level" :class="{'hero-level-large': i === streamerScores.heroes.length - 1}"> {{ hero.level }} </span>
          </div>
        </div>
        <div style="text-align: right; margin-right: 30px;">
          <div>
            {{ Math.round(streamerScores.heroScore.expGained / durationMinutes) }}
            <img :src="getStatIcon('plus')" width="16" height="16" :alt="'XP'" style="vertical-align: sub;" />
            XP/min
          </div>
          <div>
            {{ Math.round(streamerScores.resourceScore.goldCollected / durationMinutes) }}
            <img :src="getStatIcon('gold')" width="16" height="16" :alt="'Gold'" style="vertical-align: sub;" />
            Gold/min
          </div>
          <div>
            {{ Math.round(streamerScores.resourceScore.lumberCollected / durationMinutes) }}
            <img :src="getStatIcon('lumber')" width="16" height="16" :alt="'Lumber'" style="vertical-align: sub;" />
            Lumber/min
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
              width="48"
              height="48"
              :alt="heroNames[hero.icon]"
            />
            <span class="hero-level" :class="{'hero-level-large': i === 0}"> {{ hero.level }} </span>
          </div>
        </div>
        <div style="text-align: left; margin-left: 30px;">
          <div>
            XP/min
            <img :src="getStatIcon('plus')" width="16" height="16" :alt="'XP'" style="vertical-align: sub;" />
            {{ Math.round(opponentScores.heroScore.expGained / durationMinutes) }}
          </div>
          <div>
            Gold/min
            <img :src="getStatIcon('gold')" width="16" height="16" :alt="'Gold'" style="vertical-align: sub;" />
            {{ Math.round(opponentScores.resourceScore.goldCollected / durationMinutes) }}
          </div>
          <div>
            Lumber/min
            <img :src="getStatIcon('lumber')" width="16" height="16" :alt="'Lumber'" style="vertical-align: sub;" />
            {{ Math.round(opponentScores.resourceScore.lumberCollected / durationMinutes) }}
          </div>
        </div>
      </div>
      <div></div>
      <div class="map-stats">
        <div style="text-align: center">
          Map: {{ state.lastMatch.match.mapName }}
        </div>
        <div style="text-align: center">
          Duration: {{ gameDuration }}
        </div>
        <div style="text-align: center">
          Start time: {{ gameDate.toLocaleString() }}
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

    return {
      streamerStats,
      streamerScores,
      opponentStats,
      opponentScores,
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
  display: flex;
  flex-direction: column;
}

.heroes-stats {
  display: grid;
  grid-auto-flow: column;
  grid-template-rows: 48px;
  grid-column-gap: 16px;
  grid-auto-columns: 48px;

  &__left {
    justify-content: flex-end;
    margin-right: 30px;
  }

  &__right {
    justify-content: flex-start;
    margin-left: 30px;
  }
}

.hero-icon {
  position: relative;
}

.hero-level {
  position: absolute;
  bottom: 2px;
  right: 2px;
  background: rgb(0.5, 0.5, 0.5, 70%);
  width: 15px;
  display: block;
  font-size: 10px;
  line-height: 1.2em;
  font-weight: bold;
}

.hero-level-large {
  font-size: 14px;
}

.heroes-stats-container {
  display: grid;
  grid-template-rows: 48px 1fr;
  grid-row-gap: 20px;
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
