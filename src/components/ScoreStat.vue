<template>
  <div class="score-stat-row">
    <div style="text-align: right" :style="{ color: stat1Color }">
      {{ stat1 }}
    </div>
    <div>
      <img :src="getStatIcon(icon)" width="16" height="16" :alt="icon" />
    </div>
    <div>{{ title }}</div>
    <div>
      <img :src="getStatIcon(icon)" width="16" height="16" :alt="icon" />
    </div>
    <div style="text-align: left" :style="{ color: stat2Color }">
      {{ stat2 }}
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { getStatIcon } from "@/utils/assets";

export default defineComponent({
  name: "ScoreStatRow",
  props: {
    stat1: {
      type: Number,
      required: true,
    },
    icon: {
      type: String,
      required: true,
    },
    stat2: {
      type: Number,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    reverse: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    stat1Color(): string {
      if (this.stat1 === this.stat2) return "white";
      return this.stat1 > this.stat2
        ? "var(--color-green)"
        : "var(--color-red)";
    },
    stat2Color(): string {
      if (this.stat1 === this.stat2) return "white";
      return this.stat1 < this.stat2
        ? "var(--color-green)"
        : "var(--color-red)";
    },
  },
  methods: {
    getStatIcon,
  },
});
</script>

<style lang="scss">
.score-stat-row {
  display: grid;
  grid-template-areas: "stat1" "icon1" "title" "icon2" "stat2";
  grid-template-columns: 1fr 16px 135px 16px 1fr;
  grid-template-rows: 16px;
  grid-column-gap: 10px;
  line-height: 1;

  &--reverse {
    grid-template-areas: "icon" "stat";
    grid-template-columns: 10px 1fr;
  }
}
</style>
