<template>
  <div v-if="hero && opponent" class="match-result">
    <img :src="getRaceIcon(opponent.race, opponent.rndRace)" width="24" height="24" :style="{'vertical-align': 'middle'}" />
    <span style="color: var(--color-yellow)">
      {{ opponentAka || opponent.name }}
      <span v-if="opponentAka && !akaIsSameAsName"> ({{ opponent.name }})</span>
    </span>
    <span> in {{ formatMatchDuration(match.durationInSeconds) }}</span>
    <span v-if="headToHead"> on {{ formatMonthDay(match.startTime) }}</span>
    <span v-if="!headToHead" :style="{ color: mmrChange > 0 ? 'var(--color-green)' : 'var(--color-red)' }">
      ({{ mmrChange > 0 ? '+' : '' }}{{ mmrChange }})
    </span>
    <span v-if="!headToHead" style="display: inline-block;"> <relative-time :time="match.endTime" /></span>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { Match, PlayerInTeam } from "@/typings";
import usePlayerAka from "@/composables/usePlayerAka";
import { getRaceIcon } from "@/utils/assets";
import { formatMatchDuration, formatMonthDay } from "@/utils/time";
import RelativeTime from "@/components/RelativeTime.vue";

type PropTypes = {
  match: Match;
  battleTag: string;
  headToHead: boolean;
};

export default defineComponent({
  name: "MatchResult",
  components: { RelativeTime },
  props: {
    battleTag: {
      type: String,
      required: true
    },
    match: {
      type: Object as () => Match,
      required: true
    },
    headToHead: {
      type: Boolean,
      default: false
    }
  },
  async setup(props: PropTypes) {
    const { playerAkas } = usePlayerAka();

    let hero: PlayerInTeam | null = null;
    let opponent: PlayerInTeam | null = null;
    for (const team of props.match.teams) {
      for (const player of team.players) {
        if (player.battleTag === props.battleTag) {
          hero = player;
        } else {
          opponent = player;
        }
      }
    }

    const opponentAka = opponent ? playerAkas[opponent.battleTag] : null;
    const akaIsSameAsName = opponentAka?.toLocaleLowerCase() === opponent?.name.toLocaleLowerCase();

    const mmrChange = props.match.teams
      .flatMap(team => team.players)
      .find(player => player.battleTag === hero?.battleTag)?.mmrGain ?? 0;

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
  }
});
</script>

<style lang="scss" scoped>
.match-result {
  cursor: pointer;
  padding: 4px 8px;
}
.match-result:hover {
  background-color: #4444;
  border-radius: 12px;
}
</style>
