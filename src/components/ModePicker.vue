<template>
  <div class="mode-picker">
    <WSelect
      v-if="options.length > 0"
      v-model="selectedValue"
      :options="options"
      placeholder="Select Mode..."
    />
    <div v-else class="mode-picker__loading">Loading modes...</div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch, onMounted, computed } from "vue";
import { EGameMode, ModeStat } from "@/typings";
import { useW3CStore } from "@/store/w3c";
import { atEquivalent, gameModes } from "@/constants/constants";
import { getRaceIcon } from "@/utils/assets";
import WSelect, { SelectOption } from "./WSelect.vue";

export default defineComponent({
  name: "ModePicker",
  components: { WSelect },
  props: {
    currentSeason: {
      type: Number,
      required: true,
    },
  },
  emits: ["selection-changed"],
  setup(props, { emit }) {
    const store = useW3CStore();
    const playerStats = ref<ModeStat[]>([]);
    const selectedValue = ref<string>("");

    const options = computed<SelectOption[]>(() => {
      if (playerStats.value.length === 0) return [];

      const opts: SelectOption[] = [];

      // Create a map to track games played (aggregate AT and non-AT)
      const modeData: Record<string, { games: number }> = {};

      // Build options, merging AT modes into their non-AT equivalents
      for (const stat of playerStats.value) {
        // Map AT modes to their non-AT equivalent
        let effectiveMode = stat.gameMode;
        const isATMode = Object.values(atEquivalent).includes(stat.gameMode);

        if (isATMode) {
          // Find the non-AT mode that this AT mode maps to
          const nonATMode = Object.entries(atEquivalent).find(
            ([_, atMode]) => atMode === stat.gameMode,
          )?.[0];
          if (nonATMode) {
            effectiveMode = parseInt(nonATMode);
          }
        }

        const modeLabel = gameModes[effectiveMode] || `Mode ${effectiveMode}`;

        // For 1v1 mode, include the race icon
        // For team modes, just show the mode (they don't track per-race stats)
        if (effectiveMode === EGameMode.GM_1ON1) {
          const raceIcon = getRaceIcon(stat.race);
          const label = modeLabel;
          const value = `${effectiveMode}:${stat.race}`;

          // Aggregate games from both AT and non-AT
          if (opts.find((o) => o.value === value)) {
            modeData[value].games += stat.games;
          } else {
            opts.push({ value, label, icon: raceIcon });
            modeData[value] = { games: stat.games };
          }
        } else {
          // For team modes, just show the mode
          const value = `${effectiveMode}:null`;

          // Aggregate games from both AT and non-AT
          if (opts.find((o) => o.value === value)) {
            modeData[value].games += stat.games;
          } else {
            opts.push({ value, label: modeLabel });
            modeData[value] = { games: stat.games };
          }
        }
      }

      // Find the single most recent match across all modes
      let mostRecentMatchValue: string | null = null;

      const allModesKey = `${store.battleTag}-${store.currentSeason}-ALL`;
      const matchHistory = store.matchHistory[allModesKey];

      if (matchHistory && matchHistory.matches.length > 0) {
        let mostRecentDate: Date | null = null;

        // Find the absolute most recent match
        for (const match of matchHistory.matches) {
          const matchDate = new Date(match.startTime);

          if (!mostRecentDate || matchDate > mostRecentDate) {
            // For 1v1, match by mode and race
            const player = match.teams
              .flatMap((t) => t.players)
              .find((p) => p.battleTag === store.battleTag);
            const value =
              match.gameMode === EGameMode.GM_1ON1 && player
                ? `${match.gameMode}:${player.race}`
                : `${match.gameMode}:null`;

            // Only track if this mode exists in our options
            if (modeData[value]) {
              mostRecentMatchValue = value;
              mostRecentDate = matchDate;
            }
          }
        }
      }

      // Sort: most recent match first, then by games played
      return opts.sort((a, b) => {
        const aIsMostRecent = mostRecentMatchValue === a.value;
        const bIsMostRecent = mostRecentMatchValue === b.value;

        // Most recent match goes first
        if (aIsMostRecent && !bIsMostRecent) return -1;
        if (bIsMostRecent && !aIsMostRecent) return 1;

        // Everything else sorts by games played
        return (
          (modeData[b.value]?.games || 0) - (modeData[a.value]?.games || 0)
        );
      });
    });

    const loadPlayerStats = async () => {
      if (!store.battleTag || !store.currentSeason) return;

      try {
        const [stats] = await Promise.all([
          store.fetchPlayerStats(store.battleTag, store.currentSeason),
          // Fetch all match history to enable recency sorting
          store.fetchMatchHistory(store.battleTag, store.currentSeason, 50),
        ]);
        playerStats.value = stats;

        // Set initial selection from store if available, otherwise default to first option
        if (options.value.length > 0) {
          const storeMode = store.selectedGameMode;
          const storeRace = store.selectedRace;

          // Construct value from store state
          const storeValue = `${storeMode}:${storeRace !== null ? storeRace : "null"}`;

          // Check if store value exists in options
          const optionExists = options.value.find(
            (o) => o.value === storeValue,
          );

          if (optionExists) {
            selectedValue.value = storeValue;
          } else {
            // Default to first option
            selectedValue.value = options.value[0].value;
          }
        }
      } catch (error) {
        console.error("Failed to load player stats:", error);
        playerStats.value = [];
      }
    };

    watch(selectedValue, (newValue) => {
      if (!newValue) return;

      const [modeStr, raceStr] = newValue.split(":");
      const mode = parseInt(modeStr);
      const race = raceStr === "null" ? null : parseInt(raceStr);

      store.setSelectedMode(mode, race);
      emit("selection-changed", { mode, race });
    });

    watch([() => store.battleTag, () => store.currentSeason], () => {
      loadPlayerStats();
    });

    onMounted(() => {
      loadPlayerStats();
    });

    return {
      selectedValue,
      options,
    };
  },
});
</script>

<style lang="scss" scoped>
.mode-picker {
  margin-bottom: 15px;

  &__loading {
    color: var(--color-yellow);
    padding: 8px 12px;
    text-align: center;
  }
}
</style>
