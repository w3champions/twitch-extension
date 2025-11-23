<template>
  <button v-bind="$attrs" :class="rootClass">
    <slot />
  </button>
</template>

<script lang="ts">
import { defineComponent, computed } from "vue";

export default defineComponent({
  name: "WButton",
  inheritAttrs: false,
  props: {
    isActive: {
      type: Boolean,
      default: false,
    },
  },
  setup(props) {
    const rootClass = computed(() => ({
      "w-button": true,
      "w-button--active": props.isActive,
    }));

    return {
      rootClass,
    };
  },
});
</script>

<style lang="scss" scoped>
.w-button {
  color: var(--color-yellow);
  width: 107px;
  height: 28px;
  background-image: url("/Button_Blue.png");
  background-size: contain;
  border: none;
  outline: none;
  cursor: pointer;
  background-color: transparent;

  &:hover {
    background-image: url("/Button_Blue_Hover.png");
  }

  &:active,
  &--active,
  &--active:hover {
    background-image: url("/Button_Blue_Active.png");
  }
}
</style>
