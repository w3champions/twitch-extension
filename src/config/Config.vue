<template>
  <div class="config-page">
    <p>
      Please provide your BattleTag exactly as it appears on your battle.net
      account page (it is case sensitive).
    </p>
    <img
      class="config-page__img"
      src="../assets/battletag.png"
      alt="battle tag"
      width="861"
      height="180"
    />
    <form @submit.prevent="saveSettings" class="config-page__form">
      <div>
        <label for="battleTag">
          Battle Tag:
          <input
            type="text"
            id="battleTag"
            v-model="battleTag"
            placeholder="BattleTag#1234"
          />
        </label>
      </div>
      <div>
        <button type="submit">Save config</button>
      </div>
      <p v-if="saved" style="color: green">Battletag saved!</p>
    </form>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { Segment } from "@/typings";

interface ComponentData {
  battleTag: string;
  saved: boolean;
}

export default defineComponent({
  name: "Config",
  data(): ComponentData {
    return {
      battleTag: "",
      saved: false
    };
  },
  methods: {
    saveSettings() {
      const content = JSON.stringify({
        battleTag: this.battleTag
      });
      window.Twitch.ext.configuration.set(Segment.Broadcaster, "", content);

      this.saved = true;

      setTimeout(() => {
        this.saved = false;
      }, 4000);
    }
  }
});
</script>

<style scoped lang="scss">
.config-page {
  &__img {
    margin-bottom: 25px;
  }
  &__form {
    background: white;
    display: grid;
    grid-auto-flow: row;
    grid-row-gap: 16px;
  }
}
</style>
