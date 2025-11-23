<template>
  <div v-if="hero" class="match-result">
    <div class="race-icon-col">
      <img
        v-if="opponent"
        :src="getRaceIcon(opponent.race, opponent.rndRace)"
        width="24"
        height="24"
      />
    </div>
    <div class="info-col">
      <div class="main-line">
        <template v-if="opponent">
          <span style="color: var(--color-yellow)">
            {{ opponentAka || opponent.name }}
          </span>
        </template>
        <template v-else>
          <span style="color: var(--color-yellow)">Team Match</span>
        </template>
        <span> in {{ formatMatchDuration(match.durationInSeconds) }}</span>
        <span v-if="headToHead"> on {{ formatMonthDay(match.startTime) }}</span>
        <span
          v-if="!headToHead"
          :style="{
            color: mmrChange > 0 ? 'var(--color-green)' : 'var(--color-red)',
          }"
        >
          ({{ mmrChange > 0 ? "+" : "" }}{{ mmrChange }})
        </span>
        <span v-if="!headToHead" style="display: inline-block">
          <relative-time :time="match.endTime"
        /></span>
      </div>
      <div v-if="opponent && opponentAka && !akaIsSameAsName" class="sub-line">
        as {{ opponent.name }}
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { Match, PlayerInTeam } from "@/typings";
import usePlayerAka from "@/composables/usePlayerAka";
import { getRaceIcon } from "@/utils/assets";
import { formatMatchDuration, formatMonthDay } from "@/utils/time";
import RelativeTime from "@/components/RelativeTime.vue";
import { useW3CStore } from "@/store/w3c";

type PropTypes = {
  match: Match;
  headToHead: boolean;
};

export default defineComponent({
  name: "MatchResult",
  components: { RelativeTime },
  props: {
    match: {
      type: Object as () => Match,
      required: true,
    },
    headToHead: {
      type: Boolean,
      default: false,
    },
  },
  async setup(props: PropTypes) {
    const { playerAkas } = usePlayerAka();
    const store = useW3CStore();

    let hero: PlayerInTeam | null = null;
    let opponent: PlayerInTeam | null = null;
    for (const team of props.match.teams) {
      for (const player of team.players) {
        if (player.battleTag === store.battleTag) {
          hero = player;
        } else if (!opponent && props.match.gameMode === 1) {
          // Only set opponent for 1v1
          opponent = player;
        }
      }
    }

    const opponentAka = opponent ? playerAkas[opponent.battleTag] : null;
    const akaIsSameAsName =
      opponentAka?.toLocaleLowerCase() === opponent?.name.toLocaleLowerCase();

    const mmrChange =
      props.match.teams
        .flatMap((team) => team.players)
        .find((player) => player.battleTag === hero?.battleTag)?.mmrGain ?? 0;

    return {
      hero,
      opponent,
      formatMatchDuration,
      formatMonthDay,
      opponentAka,
      akaIsSameAsName,
      getRaceIcon,
      mmrChange,
    };
  },
});
</script>

<style lang="scss" scoped>
.match-result {
  cursor: pointer;
  padding: 4px 8px;
  display: grid;
  grid-template-columns: 24px 1fr;
  grid-column-gap: 8px;
  align-items: center;
}
.match-result:hover {
  background-color: #4444;
  border-radius: 12px;
}

.race-icon-col {
  display: flex;
  align-items: center;
  justify-content: center;
}

.info-col {
  display: flex;
  flex-direction: column;
  text-align: left;
}

.sub-line {
  font-size: 0.8em;
  color: var(--color-yellow);
  margin-top: -8px;
}
</style>
