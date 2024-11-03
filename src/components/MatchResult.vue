<template>
  <div v-if="hero && opponent" class="match-result">
    <img :src="getRaceIcon(opponent.race, opponent.rndRace)" width="24" height="24" :style="{'vertical-align': 'middle'}" />
    <span v-if="withOpponentName" style="color: var(--color-yellow)">
      {{ opponentAka || opponent.name }}
      <span v-if="opponentAka && !akaIsSameAsName"> ({{ opponent.name }})</span>
    </span>
    in
    {{ formatMatchDuration(match.durationInSeconds) }}
    <span :style="{ color: mmrChange > 0 ? 'var(--color-green)' : 'var(--color-red)' }">
      ({{ mmrChange > 0 ? '+' : '' }}{{ mmrChange }})
    </span>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { Match, PlayerInTeam } from "@/typings";
import { intervalToDuration } from "date-fns/intervalToDuration";
import usePlayerAka from "@/composables/usePlayerAka";
import { getRaceIcon } from "@/utils/assets";
type PropTypes = {
  match: Match;
  battleTag: string;
  withOpponentName: boolean;
};

function formatMatchDuration(interval: number): string {
  const duration = intervalToDuration({ start: 0, end: interval * 1000 });
  const durations = [duration.minutes, duration.seconds ?? 0];
  if (duration.hours && duration.hours > 0) {
    durations.unshift(duration.hours);
  }
  return durations.map(duration => String(duration).padStart(2, "0")).join(":");
}

export default defineComponent({
  name: "MatchResult",
  props: {
    battleTag: {
      type: String,
      required: true
    },
    match: {
      type: Object as () => Match,
      required: true
    },
    withOpponentName: {
      type: Boolean,
      default: true
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
