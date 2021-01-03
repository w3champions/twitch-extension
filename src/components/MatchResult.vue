<template>
  <div v-if="hero && opponent" class="match-result">
    <span style="color: var(--color-yellow)">{{ opponent.name }}</span> on
    {{ mapNames[match.map] }} in
    {{ formatMatchDuration(match.durationInSeconds) }}
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { Match } from "@/typings";
import { mapNames } from "@/constants/constants";
import intervalToDuration from "date-fns/intervalToDuration";
type PropTypes = {
  match: Match;
  battleTag: string;
};

function formatMatchDuration(interval: number): string {
  const duration = intervalToDuration({ start: 0, end: interval * 1000 });
  const durations = [duration.minutes, duration.seconds];

  if (duration.hours && duration.hours > 0) durations.unshift(duration.hours);

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
    }
  },
  setup(props: PropTypes) {
    let hero;
    let opponent;

    for (const team of props.match.teams) {
      for (const player of team.players) {
        if (player.battleTag === props.battleTag) {
          hero = player;
        } else {
          opponent = player;
        }
      }
    }

    return {
      hero,
      opponent,
      mapNames,
      formatMatchDuration
    };
  }
});
</script>

<style lang="scss" scoped>
.match-result {
  cursor: pointer;
}
</style>
