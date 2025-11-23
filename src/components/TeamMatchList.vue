<template>
  <div class="team-match-list">
    <div class="list-container">
      <Suspense v-for="match in matches" :key="match.id">
        <TeamMatchResult :match="match" @click="$emit('select-match', match)" />
      </Suspense>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import { Match } from "@/typings";
import TeamMatchResult from "@/components/TeamMatchResult.vue";

export default defineComponent({
  name: "TeamMatchList",
  components: { TeamMatchResult },
  props: {
    matches: {
      type: Array as PropType<Match[]>,
      required: true,
    },
  },
  emits: ["select-match"],
});
</script>

<style lang="scss" scoped>
.team-match-list {
  display: flex;
  flex-direction: column;
  text-align: left;
}

.header {
  color: var(--color-yellow);
  padding: 0 8px;
  margin-bottom: 10px;
  margin-top: 0;
}

.list-container {
  display: flex;
  flex-direction: column;
  gap: 5px;
}
</style>
