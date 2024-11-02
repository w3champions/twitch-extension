import { createApp } from "vue";
import VideoOverlay from "./VideoOverlay.vue";

createApp(
  VideoOverlay,
  {
    battleTag: import.meta.env.PROD ? "" : (import.meta.env.VITE_BATTLE_TAG ?? ""),
    alwaysVisible: !import.meta.env.PROD,
  }
).mount("#app");
