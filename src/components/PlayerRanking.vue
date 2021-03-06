<template>
  <div :class="rootClass">
    <div class="player-ranking__name">
      <div class="player-ranking__display-name">{{ aka || name }}</div>
      <div class="player-ranking__as" v-if="aka">as {{ name }}</div>
    </div>
    <div class="player-ranking__race">
      <img :src="getRaceIcon(race)" width="50" height="50" />
    </div>

    <div class="player-ranking__rank">
      Rank {{ rank }} | <span class="player-ranking__wins">{{ wins }}</span> -
      <span class="player-ranking__losses">{{ losses }}</span>
    </div>

    <div>MMR: {{ mmr }} | RP: {{ rankingPoints }}</div>

    <div>
      Win probability:
      <span :style="{ color: winProbability >= 50 ? 'green' : 'red' }"
        >{{ winProbability }} %</span
      >
    </div>
  </div>
</template>
<script lang="ts">
import { computed } from "vue";
import { getRaceIcon } from "@/utils/assets";

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
  name: string;
  wins: number;
  losses: number;
  rank: number;
  mmr: number;
  opponentMmr: number;
  rankingPoints: number;
  leagueId: number;
  aka: string | undefined;
};

export default {
  name: "PlayerRanking",
  props: {
    name: {
      type: String,
      required: true
    },
    wins: {
      type: Number,
      default: 0
    },
    losses: {
      type: Number,
      default: 0
    },
    rank: {
      type: Number,
      default: 0
    },
    mmr: {
      type: Number,
      default: 0
    },
    opponentMmr: {
      type: Number,
      default: 0
    },
    rankingPoints: {
      type: Number,
      default: 0
    },
    leagueId: {
      type: Number,
      required: true
    },
    race: {
      type: Number,
      required: true
    },
    aka: {
      type: String,
      default: ""
    }
  },
  setup(props: Props) {
    const winProbability = computed(() => {
      return calculateWinProbability(props.mmr, props.opponentMmr);
    });
    const rootClass = computed(() => {
      const classes = { "player-ranking": true };

      if (leagues[props.leagueId]) {
        Object.assign(classes, {
          [`player-ranking--${leagues[props.leagueId]}`]: true
        });
      }

      return classes;
    });

    return {
      rootClass,
      leagues,
      winProbability,
      getRaceIcon
    };
  }
};
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
      background: url("../assets/leagues/grandmaster.png");
    }
  }

  &--master::before {
    background: url("../assets/leagues/master.png");
  }

  &--adept::before {
    background: url("../assets/leagues/adept.png");
  }

  &--diamond::before {
    background: url("../assets/leagues/diamond.png");
  }

  &--platinum::before {
    background: url("../assets/leagues/platinum.png");
  }

  &--gold::before {
    background: url("../assets/leagues/gold.png");
  }

  &--silver::before {
    background: url("../assets/leagues/silver.png");
  }

  &--bronze::before {
    background: url("../assets/leagues/bronze.png");
  }

  &--grass::before {
    background: url("../assets/leagues/grass.png");
  }

  &__name {
    color: var(--color-yellow);
    font-size: 24px;
    height: 55px;
    overflow: hidden;
  }

  &__league {
    font-size: 16px;
    text-transform: uppercase;
  }

  &__rank {
    font-size: 20px;
  }

  &__wins {
    color: green;
  }

  &__losses {
    color: red;
  }

  &__as {
    font-size: 12px;
  }
}
</style>
