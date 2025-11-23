import { createApp } from "vue";
import VideoOverlay from "./VideoOverlay.vue";
import router from "../router";

const app = createApp(VideoOverlay, {
  battleTag: import.meta.env.PROD
    ? ""
    : ((import.meta.env.VITE_BATTLE_TAG as string | undefined) ?? ""),
  alwaysVisible: !import.meta.env.PROD,
});

import { createPinia } from "pinia";

app.use(router);
app.use(createPinia());
app.mount("#app");
