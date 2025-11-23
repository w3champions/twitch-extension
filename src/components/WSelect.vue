<template>
  <div class="w-select" ref="selectRef">
    <div class="w-select__trigger" @click="toggleDropdown">
      <span class="w-select__value">
        {{ selectedOption?.label || placeholder }}
        <img
          v-if="selectedOption?.icon"
          :src="selectedOption.icon"
          class="w-select__icon"
        />
      </span>
      <span class="w-select__arrow" :class="{ 'w-select__arrow--open': isOpen }"
        >▼</span
      >
    </div>
    <transition name="dropdown">
      <div v-if="isOpen" class="w-select__dropdown">
        <div
          v-for="option in options"
          :key="option.value"
          class="w-select__option"
          :class="{ 'w-select__option--selected': option.value === modelValue }"
          @click="selectOption(option)"
        >
          {{ option.label }}
          <img v-if="option.icon" :src="option.icon" class="w-select__icon" />
        </div>
      </div>
    </transition>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  ref,
  computed,
  onMounted,
  onUnmounted,
  PropType,
} from "vue";

export interface SelectOption {
  value: string;
  label: string;
  icon?: string;
}

export default defineComponent({
  name: "WSelect",
  props: {
    modelValue: {
      type: String,
      default: null,
    },
    options: {
      type: Array as PropType<SelectOption[]>,
      required: true,
    },
    placeholder: {
      type: String,
      default: "Select...",
    },
  },
  emits: ["update:modelValue"],
  setup(props, { emit }) {
    const isOpen = ref(false);
    const selectRef = ref<HTMLElement | null>(null);

    const selectedOption = computed(() => {
      return props.options.find((opt) => opt.value === props.modelValue);
    });

    const selectedLabel = computed(() => {
      return selectedOption.value?.label || "";
    });

    const toggleDropdown = () => {
      isOpen.value = !isOpen.value;
    };

    const selectOption = (option: SelectOption) => {
      emit("update:modelValue", option.value);
      isOpen.value = false;
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.value && !selectRef.value.contains(event.target as Node)) {
        isOpen.value = false;
      }
    };

    onMounted(() => {
      document.addEventListener("click", handleClickOutside);
    });

    onUnmounted(() => {
      document.removeEventListener("click", handleClickOutside);
    });

    return {
      isOpen,
      selectRef,
      selectedOption,
      selectedLabel,
      toggleDropdown,
      selectOption,
    };
  },
});
</script>

<style lang="scss" scoped>
.w-select {
  position: relative;
  width: 100%;

  &__trigger {
    background-color: rgba(0, 0, 0, 0.5);
    color: white;
    border: 1px solid var(--color-yellow);
    padding: 8px 12px;
    border-radius: 4px;
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-family: inherit;
    font-size: 16px;
    transition: all 0.2s ease;

    &:hover {
      box-shadow: 0 0 5px var(--color-yellow);
    }
  }

  &__value {
    flex: 1;
    text-align: left;
  }

  &__arrow {
    margin-left: 8px;
    font-size: 12px;
    transition: transform 0.2s ease;

    &--open {
      transform: rotate(180deg);
    }
  }

  &__dropdown {
    position: absolute;
    top: calc(100% + 4px);
    left: 0;
    right: 0;
    background-color: rgba(20, 20, 20, 0.95);
    border: 1px solid var(--color-yellow);
    border-radius: 4px;
    max-height: 300px;
    overflow-y: auto;
    z-index: 1000;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
  }

  &__option {
    padding: 10px 12px;
    cursor: pointer;
    color: white;
    transition: background-color 0.15s ease;
    text-align: left;

    &:hover {
      background-color: rgba(255, 255, 255, 0.1);
    }

    &--selected {
      background-color: rgba(255, 205, 0, 0.2);
      color: var(--color-yellow);
      font-weight: 500;
    }
  }
  &__icon {
    width: 20px;
    height: 20px;
    vertical-align: middle;
    margin-right: 8px;
  }
}

.dropdown-enter-active,
.dropdown-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
