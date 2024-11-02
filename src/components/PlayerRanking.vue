<template>
  <div :class="rootClass">
    <div class="player-ranking__name">
      <div class="player-ranking__name__main">
        <a :href="`https://w3champions.com/player/${encodeURIComponent(battleTag)}`" target="_blank">{{ aka || name }}</a>
      </div>
      <div class="player-ranking__name__as" v-if="aka">as {{ name }}</div>
    </div>
    <div class="player-ranking__race">
      <img :src="raceIcon" width="50" height="50" />
    </div>

    <div class="player-ranking__rank">
      <span v-if="rank !== 0">Rank {{ rank }}</span>
      <span v-if="rank === 0">Unranked</span>
      |
      <span class="player-ranking__wins">{{ wins }}</span>
      -
      <span class="player-ranking__losses">{{ losses }}</span>
    </div>

    <div>MMR: {{ mmr }} | RP: {{ Math.round(rankingPoints * 10) / 10 }}</div>

    <div>
      Win probability:
      <span :style="{ color: winProbability >= 50 ? 'var(--color-green)' : 'var(--color-red)' }"
        >{{ winProbability }} %</span
      >
    </div>
  </div>
</template>
<script lang="ts">
import { computed, defineComponent } from "vue";
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
  race: number;
  battleTag: string;
  aka: string | undefined;
};

export default defineComponent({
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
    battleTag: {
      type: String,
      default: ""
    },
    aka: {
      type: String,
      default: ""
    }
  },
  setup(props: Props) {
    const winProbability = computed(() => calculateWinProbability(props.mmr, props.opponentMmr));
    const raceIcon = computed(() => getRaceIcon(props.race));

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
    font-size: 16px;
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

  &__as {
    font-size: 12px;
  }
}
</style>
