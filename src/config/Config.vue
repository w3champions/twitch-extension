<template>
  <div class="config-page">
    <p class="config-page__disclaimer">
      This extension only supports 1v1 matches.
    </p>
    <p v-if="battleTagFromConfig" class="config-page__saved-battletag">
      Your saved battle tag is: <strong>{{ battleTagFromConfig }}</strong>
    </p>
    <p>
      Please provide your BattleTag exactly as it appears on your battle.net
      account page (it is case sensitive).
    </p>
    <img
      class="config-page__img"
      src="../assets/battletag.png"
      alt="battle tag"
      width="568"
      height="325"
    />
    <form @submit.prevent="saveSettings" class="config-page__form">
      <div>
        <label for="battleTag">
          Battle Tag:
          <input
            type="text"
            id="battleTag"
            v-model="battleTag"
            pattern="(^([A-zÀ-ú][A-zÀ-ú0-9]{2,11})|(^([а-яёА-ЯЁÀ-ú][а-яёА-ЯЁ0-9À-ú]{2,11})))(#[0-9]{4,})$"
            placeholder="BattleTag#1234"
            required
          />
        </label>
      </div>
      <div>
        <button type="submit">Save</button>
      </div>
      <p v-if="saved" style="color: green">Battletag saved!</p>
    </form>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from "vue";
import { Segment } from "@/typings";

export default defineComponent({
  name: "Config",
  setup() {
    const battleTagFromConfig = ref("");
    const battleTag = ref("");
    const saved = ref(false);

    function saveSettings() {
      const content = JSON.stringify({
        battleTag: battleTag.value
      });
      window.Twitch.ext.configuration.set(Segment.Broadcaster, "", content);

      saved.value = true;
      battleTagFromConfig.value = battleTag.value;

      setTimeout(() => {
        saved.value = false;
      }, 4000);
    }

    onMounted(() => {
      window.Twitch.ext.configuration.onChanged(() => {
        if (window.Twitch.ext.configuration.broadcaster) {
          const config = JSON.parse(
            window.Twitch.ext.configuration.broadcaster?.content
          );

          battleTagFromConfig.value = config.battleTag;
        }
      });
    });

    return {
      battleTagFromConfig,
      battleTag,
      saved,
      saveSettings
    };
  }
});
</script>

<style scoped lang="scss">
.config-page {
  background: white;

  &__disclaimer {
    background: #fb755d;
    padding: 10px;
    font-size: 18px;
    border-radius: 8px;
  }

  &__saved-battletag {
    font-size: 20px;
    margin-bottom: 25px;
    padding-bottom: 10px;
    border-bottom: 1px solid #83817e;
  }

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
