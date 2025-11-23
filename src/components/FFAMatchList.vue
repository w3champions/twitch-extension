<template>
  <div class="ffa-match-list">
    <div class="list-container">
      <Suspense v-for="match in matches" :key="match.id">
        <FFAMatchResult :match="match" />
      </Suspense>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import { Match } from "@/typings";
import FFAMatchResult from "@/components/FFAMatchResult.vue";

export default defineComponent({
  name: "FFAMatchList",
  components: { FFAMatchResult },
  props: {
    matches: {
      type: Array as PropType<Match[]>,
      required: true,
    },
  },
});
</script>

<style lang="scss" scoped>
.ffa-match-list {
  display: flex;
  flex-direction: column;
  text-align: left;
}

.list-container {
  display: flex;
  flex-direction: column;
  gap: 5px;
}
</style>
