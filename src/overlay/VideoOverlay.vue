<template>
  <Transition name="slide-left">
    <button
      v-if="state.twitchConfig.arePlayerControlsVisible"
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
      <header class="header">
        <div class="promo"></div>
        <div class="header-tabs">
          <w-button
            v-for="tab in tabs"
            :key="tab"
            :is-active="currentTab === tab"
            @click="currentTab = tab"
            >{{ tabNames[tab] }}</w-button
          >
        </div>
      </header>

      <OngoingMatch
        v-if="currentTab === 'currentMatch'"
        :battle-tag="battleTag"
        :current-season="currentSeason"
      />

      <TodayResults
        v-if="currentTab === 'todayResults'"
        :battle-tag="battleTag"
        :stream-started-at="streamStartedAt"
        :current-season="currentSeason"
      />
    </div>
  </transition>
</template>

<script lang="ts">
import { defineComponent, watch, onMounted, reactive, ref, Ref } from "vue";
import WButton from "@/components/common/WButton.vue";
import { TwitchAuthorizationContext, TwitchContext } from "@/typings";
import OngoingMatch from "@/components/tabs/OngoingMatch.vue";
import {
  authorizeWithTwitch,
  fetchSeasons,
  getStreamStatus
} from "@/utils/fetch";
import TodayResults from "@/components/tabs/TodayResults.vue";

enum Tabs {
  CURRENT_MATCH = "currentMatch",
  TODAY_RESULTS = "todayResults"
}

const EXTENSION_DEFAULT_WIDTH = 1022;
const EXTENSION_WINDOW_SCALE_FACTOR = 0.95;

export default defineComponent({
  name: "VideoOverlay",
  components: { TodayResults, OngoingMatch, WButton },
  setup() {
    const state = reactive({ twitchConfig: {} as TwitchContext });
    const battleTag = ref("");
    const currentSeason: Ref<number> = ref(0);
    const scaleFactor = ref(1);

    // Default to 24 hours ago, but will be overwritten by the actual stream start time
    const streamStartedAt = ref(new Date(new Date().getTime() - (24 * 60 * 60 * 1000)));

    const currentTab: Ref<string> = ref(Tabs.CURRENT_MATCH);
    const tabs = [Tabs.CURRENT_MATCH, Tabs.TODAY_RESULTS];
    const isExtensionVisible = ref(false);
    watch(
      () => isExtensionVisible.value,
      isVisible => {
        if (isVisible) {
          const extensionWindowWidth = document.getElementsByTagName("html")[0]
            .offsetWidth;
          scaleFactor.value = Math.min(
            1,
            (extensionWindowWidth * EXTENSION_WINDOW_SCALE_FACTOR) /
              EXTENSION_DEFAULT_WIDTH
          );
        }
      }
    );

    onMounted(async () => {
      window.Twitch.ext.onAuthorized(
        async ({ channelId }: TwitchAuthorizationContext) => {
          const token = await authorizeWithTwitch();
          const streamStatus = await getStreamStatus(
            token.access_token,
            channelId
          );
          const channelStatus = streamStatus.data.find(
            stream => stream.user_id === channelId
          );
          if (channelStatus) {
            streamStartedAt.value = new Date(channelStatus.started_at);
          }
        }
      );

      window.Twitch.ext.configuration.onChanged(() => {
        if (window.Twitch.ext.configuration.broadcaster) {
          const config = JSON.parse(
            window.Twitch.ext.configuration.broadcaster?.content
          );

          battleTag.value = config.battleTag;
        }
      });

      window.Twitch.ext.onContext((ctx: TwitchContext) => {
        state.twitchConfig = ctx;
      });

      const seasons = await fetchSeasons();
      currentSeason.value = seasons[0].id;
    });

    return {
      state,
      battleTag,
      isExtensionVisible,
      currentTab,
      tabs,
      tabNames: {
        [Tabs.CURRENT_MATCH]: "Current match",
        [Tabs.TODAY_RESULTS]: "Today results"
      },
      streamStartedAt,
      currentSeason,
      scaleFactor
    };
  }
});
</script>

<style lang="scss">
html {
  --color-yellow: #ffe033;
  --color-green: #34c264;
  --color-red: #bf301f;
  --color-gray: #83817e;

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
  background: url("../assets/W3C_TwitchButton.png");
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
  background: url("../assets/background.webp");
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: 85px 470px;
  grid-row-gap: 10px;
  justify-content: center;
  text-align: center;
  padding: 60px 60px 30px;
  margin: -8px auto 0;
  transform-origin: top left;
}

.close-button {
  cursor: pointer;
  width: 48px;
  height: 48px;
  background: url("../assets/exit-button.png");
  background-size: contain;
  position: absolute;
  top: 60px;
  right: 30px;
  border: none;
  outline: none;

  &:hover {
    background: url("../assets/exit-button-hover.png");
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

.header {
  display: grid;
  grid-template-rows: 1fr 28px;
  grid-row-gap: 15px;
  padding: 10px 0;
  background: url("../assets/header-logo-yellow.png") no-repeat center top;
}

.header-tabs {
  display: grid;
  grid-auto-flow: column;
  grid-column-gap: 10px;
  grid-auto-columns: min-content;
  justify-content: center;
}
</style>
