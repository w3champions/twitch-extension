<template>
  <div class="team-match-container">
    <TeamMatchDisplay
      :teams="teams"
      :player-stats="playerStats"
      :map-name="mapName"
      :mode="mode"
      :server-name="serverName"
    >
      <template #time>
        <relative-time :time="startTime" />
      </template>
    </TeamMatchDisplay>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import { Team, ModeStat, EGameMode } from "@/typings";
import TeamMatchDisplay from "@/components/TeamMatchDisplay.vue";
import RelativeTime from "@/components/RelativeTime.vue";

export default defineComponent({
  name: "TeamMatch",
  components: { TeamMatchDisplay, RelativeTime },
  props: {
    teams: {
      type: Array as PropType<Team[]>,
      required: true,
    },
    playerStats: {
      type: Object as PropType<Record<string, ModeStat>>,
      default: () => ({}),
    },
    mapName: {
      type: String,
      required: true,
    },
    mode: {
      type: Number as PropType<EGameMode>,
      required: true,
    },
    startTime: {
      type: String,
      required: true,
    },
    serverName: {
      type: String,
      default: "",
    },
  },
});
</script>

<style lang="scss" scoped>
.team-match-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}
</style>
