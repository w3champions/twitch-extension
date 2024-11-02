import { createApp } from "vue";
import VideoOverlay from "./VideoOverlay.vue";

createApp(
  VideoOverlay,
  {
    battleTag: import.meta.env.PROD ? "" : ((import.meta.env.VITE_BATTLE_TAG as string|undefined) ?? ""),
    alwaysVisible: !import.meta.env.PROD,
  }
).mount("#app");
