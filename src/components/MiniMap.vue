<template>
  <div class="map">
    <img :src="getMinimap(map)" alt="Mini Map" />
    <div class="minimap-overlay" />
  </div>
</template>
<script lang="ts">
import { defineComponent } from "vue";
import { getMinimap } from "@/utils/assets";

export default defineComponent({
  name: "MiniMap",
  props: {
    map: {
      type: String,
      required: true
    }
  },
  setup() {
    return {
      getMinimap
    };
  }
});
</script>
<style lang="scss" scoped>
.map {
  grid-column: 2;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-around;
  width: 135px;
  height: 137px;
  margin: 0 auto;

  img {
    max-width: 135px;
  }
}

.minimap-overlay {
  position: absolute;
  top: 0;
  left: 0;
  background-image: url("/Map_Frame.png");
  background-size: contain;
  width: 135px;
  height: 137px;
}
</style>
