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

    <div class="player-ranking__league">
      {{ leagues[$props.stats.leagueOrder] }} {{ $props.stats.division > 0 ? $props.stats.division : "" }}
    </div>
    <div class="player-ranking__rank">
      <span v-if="$props.stats.rank !== 0">Rank {{ $props.stats.rank }}</span>
      <span v-if="$props.stats.rank === 0">Unranked</span>
      |
      <span class="player-ranking__wins">{{ $props.stats.wins }}</span>
      -
      <span class="player-ranking__losses">{{ $props.stats.losses }}</span>
    </div>

    <div><span class="gray">MMR:</span> {{ $props.stats.mmr }} | <span class="gray">RP:</span> {{ Math.round($props.stats.rankingPoints * 10) / 10 }}</div>

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

  &__as {
    font-size: 12px;
  }
}
</style>
