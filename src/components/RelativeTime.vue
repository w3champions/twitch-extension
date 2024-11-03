<template>
  {{ formattedRelativeTime }}
</template>

<script lang="ts">
import { formatRelativeTime } from '@/utils/time';
import { computed, defineComponent, onBeforeUnmount, onMounted, ref } from 'vue';

export default defineComponent({
  name: "RelativeTime",
  props: {
    time: {
      type: String,
      required: true
    }
  },
  setup(props) {
    const timer = ref(0);
    const time = ref(new Date(props.time));

    const formattedRelativeTime = computed(() => formatRelativeTime(time.value));

    onMounted(() => {
      timer.value = setInterval(() => {
        time.value = new Date(time.value);
      }, 30 * 1000);
    });

    onBeforeUnmount(() => {
      clearInterval(timer.value);
    });

    return {
      formattedRelativeTime,
    };
  }
});
</script>