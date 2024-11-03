<template>
  <div :class="rootClass">
    <div class="player-ranking__name">
      <div class="player-ranking__name__main">
        <a :href="`https://w3champions.com/player/${encodeURIComponent($props.player.battleTag)}`" target="_blank">{{ aka || $props.player.name }}</a>
      </div>
      <div class="player-ranking__name__as" v-if="aka">as {{ $props.player.name }}</div>
    </div>
    <div class="player-ranking__race">
      <img :src="raceIcon" width="50" height="50" />
    </div>

    <div v-if="$props.stats.rank !== 0" class="player-ranking__league">
      {{ leagues[$props.stats.leagueOrder] }} {{ $props.stats.division > 0 ? $props.stats.division : "" }} #{{ $props.stats.rank }}
    </div>
    <div class="player-ranking__rank">
      <span class="player-ranking__wins">{{ $props.stats.wins }}</span>
      -
      <span class="player-ranking__losses">{{ $props.stats.losses }}</span>
      |
      <span class="player-ranking__winrate">{{ Math.round($props.stats.winrate * 10000) / 100 }} %</span>
    </div>

    <div class="player-rp">
      <div class="player-rp__text">Ranking Points</div>
      <div class="player-rp__progress">
        <div class="player-rp__progress__bar" :style="{ width: `${($props.stats.rankingPoints - Math.floor($props.stats.rankingPoints)) * 100}%` }" />
        <div class="player-rp__progress__level">{{ Math.round($props.stats.rankingPoints) }}</div>
      </div>
    </div>
    
    <div>
      <span class="gray">MMR </span><span>{{ $props.stats.mmr }}</span>
      |
      <span class="gray">Top </span>{{ Math.round((1 - $props.stats.quantile) * 1000) / 10 }} %
    </div>
    <div>
      Win probability
      <span :style="{
        color: winProbability >= 50 ? 'var(--color-green)' : 'var(--color-red)'
      }">{{ winProbability }} %</span>
    </div>
  </div>
</template>
<script lang="ts">
import { computed, defineComponent } from "vue";
import { getRaceIcon } from "@/utils/assets";
import { ModeStat, PlayerInTeam } from "@/typings";

const leagues = [
  "grandmaster",
  "master",
  "adept",
  "diamond",
  "platinum",
  "gold",
  "silver",
  "bronze",
  "grass"
];

function calculateWinProbability(mmr1: number, mmr2: number): number {
  const m = (mmr2 - mmr1) / 400;

  const winProbability = (1 / (1 + Math.pow(10, m))) * 100;

  return Math.round(winProbability * 100) / 100;
}

type Props = {
  player: PlayerInTeam;
  stats: ModeStat;
  opponent: PlayerInTeam;
  opponentStats: ModeStat;
  aka: string | undefined;
};

export default defineComponent({
  name: "PlayerRanking",
  props: {
    player: {
      type: Object as () => PlayerInTeam,
      required: true
    },
    stats: {
      type: Object as () => ModeStat,
      required: true
    },
    opponent: {
      type: Object as () => PlayerInTeam,
      required: true
    },
    opponentStats: {
      type: Object as () => ModeStat,
      required: true
    },
    aka: {
      type: String,
      default: ""
    }
  },
  setup(props: Props) {
    const winProbability = computed(() => calculateWinProbability(props.stats.mmr, props.opponentStats.mmr));
    const raceIcon = computed(() => getRaceIcon(props.stats.race));

    const rootClass = computed(() => {
      const classes = { "player-ranking": true };

      if (leagues[props.stats.leagueOrder] && props.stats.rank > 0) {
        Object.assign(classes, {
          [`player-ranking--${leagues[props.stats.leagueOrder]}`]: true
        });
      }

      return classes;
    });

    return {
      rootClass,
      leagues,
      winProbability,
      raceIcon,
      getRaceIcon
    };
  }
});
</script>

<style lang="scss" scoped>
.player-ranking {
  display: grid;
  grid-row-gap: 10px;
  position: relative;
  width: 265px;
  margin-top: 40px;
  padding: 30px 14px;
  border: 1px solid var(--color-yellow);
  border-radius: 10px;

  &::before {
    content: "";
    position: absolute;
    width: 64px;
    height: 64px;
    left: 50%;
    top: -40px;
    transform: translateX(-50%);
  }

  &--grandmaster {
    &::before {
      background: url("/leagues/grandmaster.png");
    }
  }

  &--master::before {
    background: url("/leagues/master.png");
  }

  &--adept::before {
    background: url("/leagues/adept.png");
  }

  &--diamond::before {
    background: url("/leagues/diamond.png");
  }

  &--platinum::before {
    background: url("/leagues/platinum.png");
  }

  &--gold::before {
    background: url("/leagues/gold.png");
  }

  &--silver::before {
    background: url("/leagues/silver.png");
  }

  &--bronze::before {
    background: url("/leagues/bronze.png");
  }

  &--grass::before {
    background: url("/leagues/grass.png");
  }

  &__name {
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

  &__league {
    font-size: 20px;
    font-weight: bold;
    text-transform: uppercase;
  }

  &__rank {
    font-size: 20px;
  }

  &__wins {
    color: var(--color-green);
  }

  &__losses {
    color: var(--color-red);
  }

  &__winrate {
    font-size: 16px;
  }

  &__as {
    font-size: 12px;
  }

  .player-rp {
    &__text {
      font-size: 12px;
      color: var(--color-gray);
    }
    &__progress {
      display: inline-block;
      vertical-align: middle;
      width: 120px;
      --progress-height: 25px;
      height: var(--progress-height);
      text-align: center;
      border: 1px white solid;
      border-radius: 4px;
      position: relative;
      overflow: hidden;

      &__bar {
        --dark-yellow: color-mix(in srgb, var(--color-yellow), black 70%);
        background: linear-gradient(0deg, var(--dark-yellow), var(--color-yellow), var(--dark-yellow));
        height: 100%;
      }
      &__level {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        line-height: var(--progress-height);
        font-weight: bold;
        text-shadow: 2px 0 0 black, -2px 0 0 black, 0 2px 0 black, 0 -2px 0 black, 1px 1px black, -1px -1px 0 black, 1px -1px 0 black, -1px 1px 0 black;
      }
    }
  }
}
</style>
