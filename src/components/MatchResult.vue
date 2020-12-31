<template>
  <div v-if="hero && opponent" :style="{ color: hero.won ? 'green' : 'red' }">
    {{ hero.won ? "Win" : "Loss" }} against {{ opponent.name }} on
    {{ mapNames[match.map] }} in
    {{ formatMatchDuration(match.durationInSeconds) }}
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { Match } from "@/typings";
import { mapNames } from "@/constants/constants";
import formatDuration from "date-fns/formatDuration";
import intervalToDuration from "date-fns/intervalToDuration";

type PropTypes = {
  match: Match;
  battleTag: string;
};

function formatMatchDuration(duration: number) {
  return formatDuration(
    intervalToDuration({
      start: 0,
      end: duration * 1000
    })
  );
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

<style lang="scss" scoped></style>
