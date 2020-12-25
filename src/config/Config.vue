<template>
  <form @submit.prevent="saveSettings" class="form">
    <div>
      <label for="gateway">
        Gateway:
        <select name="gateway" id="gateway" v-model="gateway">
          <option value="1">Europe</option>
          <option value="2">NA</option>
          <option value="4">Asia</option>
        </select>
      </label>
    </div>
    <div>
      <label for="battleTag">
        Battle Tag:
        <input
          type="text"
          id="battleTag"
          v-model="battleTag"
          placeholder="cacxa#2727"
        />
      </label>
    </div>
    <div>
      <button type="submit">Save config</button>
    </div>
  </form>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { Segment } from "@/typings";

export default defineComponent({
  name: "Config",
  mounted() {
    window.Twitch.ext.configuration.onChanged(() => {
      if (window.Twitch.ext.configuration.broadcaster) {
        window.Twitch.ext.rig.log("config changed");

        const config = JSON.parse(
          window.Twitch.ext.configuration.broadcaster.content
        );
        window.Twitch.ext.rig.log(config);
      }
    });
  },
  data() {
    return {
      gateway: null,
      battleTag: ""
    };
  },
  methods: {
    saveSettings() {
      const content = JSON.stringify({
        battleTag: this.battleTag,
        gateway: this.gateway
      });
      window.Twitch.ext.rig.log(Segment.Broadcaster);
      window.Twitch.ext.configuration.set(Segment.Broadcaster, "", content);
    }
  }
});
</script>

<style scoped lang="scss">
.form {
  display: grid;
  grid-auto-flow: row;
  grid-row-gap: 16px;
}
</style>
