<template>
  <Transition name="slide-left">
    <button
      v-if="$props.alwaysVisible || state.twitchConfig.arePlayerControlsVisible"
      class="overlay-toggle"
      @click="isExtensionVisible = !isExtensionVisible"
    />
  </Transition>
  <transition name="slide">
    <div
      v-if="isExtensionVisible"
      class="container"
      :style="{ transform: `scale(${scaleFactor})` }"
    >
      <button class="close-button" @click="isExtensionVisible = false" />
      <header class="layout-header">
        <div class="layout-header-battletag">
          <a
            :href="`https://w3champions.com/player/${encodeURIComponent(store.battleTag)}`"
            target="_blank"
          >{{ store.battleTag }}</a>
        </div>
        <div class="layout-header-tabs">
          <w-button
            :is-active="isActive('/ongoing')"
            @click="navigateTo('/ongoing')"
            >Current match</w-button
          >
          <w-button
            :is-active="isActive('/today')"
            @click="navigateTo('/today')"
            >Today results</w-button
          >
        </div>
      </header>

      <router-view
        v-if="currentSeason"
        :key="currentSeason"
        :battle-tag="battleTag"
        :current-season="currentSeason"
      ></router-view>
    </div>
  </transition>
</template>

<script lang="ts">
import {
  defineComponent,
  watch,
  onMounted,
  onBeforeUnmount,
  reactive,
  ref,
  computed,
} from "vue";
import WButton from "@/components/WButton.vue";
import { TwitchAuthorizationContext, TwitchContext } from "@/typings";
import { authorizeWithTwitch, getStreamStatus } from "@/utils/fetch";
import { useRouter, useRoute } from "vue-router";
import { useW3CStore } from "@/store/w3c";
import usePlayerAka from "@/composables/usePlayerAka";

const EXTENSION_DEFAULT_WIDTH = 1022;
const EXTENSION_WINDOW_SCALE_FACTOR = 0.95;
const POLLING_INTERVAL = 30000;

export default defineComponent({
  name: "VideoOverlay",
  components: { WButton },
  props: {
    battleTag: {
      type: String,
      required: false,
      default: "",
    },
    alwaysVisible: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  setup(props) {
    const store = useW3CStore();
    const router = useRouter();
    const route = useRoute();
    const { playerAkas, fetchPlayerAka } = usePlayerAka();

    // Initialize battleTag from props if available (e.g. dev mode)
    if (props.battleTag) {
      store.setBattleTag(props.battleTag);
      fetchPlayerAka(props.battleTag);
    }

    // Computed properties from store
    const currentSeason = computed(() => store.currentSeason);

    const state = reactive({ twitchConfig: {} as TwitchContext });
    const scaleFactor = ref(1);

    // Default to 24 hours ago, but will be overwritten by the actual stream start time
    // Initial value is already set in store

    const isExtensionVisible = ref(false);
    const pollingTimer = ref(0);

    const startPolling = () => {
      if (pollingTimer.value) return;

      // Initial fetch
      if (store.battleTag && currentSeason.value) {
        store.fetchOngoingMatch(store.battleTag, currentSeason.value);
      }

      pollingTimer.value = window.setInterval(() => {
        if (store.battleTag && currentSeason.value) {
          store.fetchOngoingMatch(store.battleTag, currentSeason.value);
        }
      }, POLLING_INTERVAL);
    };

    const stopPolling = () => {
      if (pollingTimer.value) {
        clearInterval(pollingTimer.value);
        pollingTimer.value = 0;
      }
    };

    watch(
      () => isExtensionVisible.value,
      (isVisible) => {
        if (isVisible) {
          const extensionWindowWidth =
            document.getElementsByTagName("html")[0].offsetWidth;
          scaleFactor.value = Math.min(
            1,
            (extensionWindowWidth * EXTENSION_WINDOW_SCALE_FACTOR) /
              EXTENSION_DEFAULT_WIDTH,
          );
          startPolling();
        } else {
          stopPolling();
        }
      },
    );

    onMounted(async () => {
      window.Twitch.ext.onAuthorized(
        async ({ channelId }: TwitchAuthorizationContext) => {
          const token = await authorizeWithTwitch();
          const streamStatus = await getStreamStatus(
            token.access_token,
            channelId,
          );
          const channelStatus = streamStatus.data.find(
            (stream) => stream.user_id === channelId,
          );
          if (channelStatus) {
            store.setStreamStartedAt(channelStatus.started_at);
          }
        },
      );

      window.Twitch.ext.configuration.onChanged(() => {
        if (window.Twitch.ext.configuration.broadcaster) {
          const config = JSON.parse(
            window.Twitch.ext.configuration.broadcaster?.content,
          );

          store.setBattleTag(config.battleTag);
          fetchPlayerAka(config.battleTag);

          if (isExtensionVisible.value && store.currentSeason) {
            store.fetchOngoingMatch(store.battleTag, store.currentSeason);
          }
        }
      });

      // Check for existing broadcaster config and set battleTag
      if (window.Twitch.ext.configuration.broadcaster) {
        const config = JSON.parse(
          window.Twitch.ext.configuration.broadcaster.content,
        );
        store.setBattleTag(config.battleTag);
        fetchPlayerAka(config.battleTag);
      }

      window.Twitch.ext.onContext((ctx: TwitchContext) => {
        state.twitchConfig = ctx;
      });

      const seasons = await store.fetchSeasons();
      if (seasons.length > 0) {
        store.setCurrentSeason(seasons[0].id);

        if (isExtensionVisible.value && store.battleTag) {
          store.fetchOngoingMatch(store.battleTag, store.currentSeason);
        }
      }
    });

    onBeforeUnmount(() => {
      stopPolling();
    });

    const navigateTo = (path: string) => {
      router.push({ path });
    };

    const isActive = (path: string) => {
      return route.path.startsWith(path);
    };

    return {
      state,
      isExtensionVisible,
      currentSeason,
      scaleFactor,
      navigateTo,
      isActive,
      store,
      playerAkas,
    };
  },
});
</script>

<style lang="scss">
html {
  --color-yellow: #ffe033;
  --color-green: #4caf50;
  --color-red: #ff5252;
  --color-gray: #aeaeae;

  font-family: "Spectral", serif;
}

* {
  box-sizing: border-box;
}

.gray {
  color: var(--color-gray);
}

.overlay-toggle {
  position: fixed;
  top: 50%;
  left: 0;
  width: 70px;
  height: 135px;
  margin-top: -67px;
  background: url("/W3C_TwitchButton.png");
  background-size: contain;
  border: none;
  outline: none;
  cursor: pointer;
}

.container {
  color: white;
  width: 1022px;
  height: 657px;
  position: relative;
  background: url("/background.webp");
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: 85px 470px;
  grid-row-gap: 10px;
  justify-content: center;
  text-align: center;
  padding: 60px 30px 30px;
  margin: -8px auto 0;
  transform-origin: top left;
}

.close-button {
  cursor: pointer;
  width: 48px;
  height: 48px;
  background: url("/exit-button.png");
  background-size: contain;
  position: absolute;
  top: 60px;
  right: 30px;
  border: none;
  outline: none;
  z-index: 2;

  &:hover {
    background: url("/exit-button-hover.png");
    background-size: contain;
  }
}

.slide-enter-active {
  animation: bounceInDown 1s;
}

.slide-leave-active {
  animation: bounceInDown 1s reverse;
}

.slide-left-enter-active {
  animation: slideInLeft 0.5s;
}

.slide-left-leave-active {
  animation: slideInLeft 0.5s reverse;
}

@keyframes bounceInDown {
  0%,
  60%,
  75%,
  90%,
  to {
    animation-timing-function: cubic-bezier(0.215, 0.61, 0.355, 1);
  }

  0% {
    opacity: 0;
    transform: translate3d(0, -3000px, 0) scaleY(3);
  }

  60% {
    opacity: 1;
    transform: translate3d(0, 25px, 0) scaleY(0.9);
  }

  75% {
    transform: translate3d(0, -10px, 0) scaleY(0.95);
  }

  90% {
    transform: translate3d(0, 5px, 0) scaleY(0.985);
  }

  to {
    transform: translateZ(0);
  }
}

@keyframes slideInLeft {
  0% {
    -webkit-transform: translate3d(-100%, 0, 0);
    transform: translate3d(-100%, 0, 0);
    visibility: visible;
  }

  to {
    -webkit-transform: translateZ(0);
    transform: translateZ(0);
  }
}

.layout-header {
  position: relative;
  display: grid;
  grid-template-rows: repeat(1, minmax(0, 1fr));
  grid-template-columns: repeat(3, minmax(0, 1fr));
  grid-auto-flow: column;
  grid-row-gap: 15px;
  padding: 0 0 5px 0;
  margin: 0 30px;
  background: url("/header-logo-yellow.png") no-repeat center top;
  z-index: 1;
}

.layout-header-battletag {
  display: flex;
  align-items: center;
  height: 100%;

  a {
    vertical-align: middle;
    font-size: 24px;
    text-decoration: none;
    color: var(--color-yellow);
    padding: 0 8px;
    &:hover {
      border-radius: 10px;
      background-color: #4447;
    }
  }
}

.layout-header-tabs {
  display: grid;
  grid-auto-flow: column;
  grid-column-gap: 10px;
  grid-auto-columns: min-content;
  justify-content: center;
  margin-top: 45px;
}
</style>
