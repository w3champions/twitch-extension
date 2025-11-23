<template>
  <div class="one-vs-one-match-list">
    <div>
      <h3 class="wins-header">Wins:</h3>
      <Suspense v-for="match in matches.won" :key="match.id">
        <OneVsOneMatchResult
          :match="match"
          @click="$emit('select-match', match)"
        />
      </Suspense>
    </div>

    <div>
      <h3 class="losses-header">Losses:</h3>
      <Suspense v-for="match in matches.lost" :key="match.id">
        <OneVsOneMatchResult
          :match="match"
          @click="$emit('select-match', match)"
        />
      </Suspense>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import { Match } from "@/typings";
import OneVsOneMatchResult from "@/components/OneVsOneMatchResult.vue";

export default defineComponent({
  name: "OneVsOneMatchList",
  components: { OneVsOneMatchResult },
  props: {
    matches: {
      type: Object as PropType<{ won: Match[]; lost: Match[] }>,
      required: true,
    },
  },
  emits: ["select-match"],
});
</script>

<style lang="scss" scoped>
.one-vs-one-match-list {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-column-gap: 20px;
  text-align: left;
}

.wins-header {
  color: var(--color-green);
  padding: 0 8px;
  margin-bottom: 10px;
  margin-top: 0;
}

.losses-header {
  color: var(--color-red);
  padding: 0 8px;
  margin-bottom: 10px;
  margin-top: 0;
}
</style>
