<template>
  <div class="no-match-stats">
    <h2>No match currently in progress</h2>
    <div class="seasonal-stats-scroll-container">
      <div class="seasonal-stats-grid">
        <div
          v-for="stat in sortedSeasonalStats"
          :key="stat.id"
          :class="getCardClass(stat)"
        >
          <div class="mode-race-row">
            <span class="mode-name">{{ gameModes[stat.gameMode] }}</span>
            <img
              v-if="stat.race"
              :src="getRaceIcon(stat.race)"
              class="race-icon"
            />
          </div>

          <div v-if="stat.rank !== 0" class="league-info">
            {{ leagues[stat.leagueOrder] }}
            {{ stat.division > 0 ? stat.division : "" }} #{{ stat.rank }}
          </div>

          <div class="stats-row">
            <span class="wins">{{ stat.wins }}</span>
            -
            <span class="losses">{{ stat.losses }}</span>
            |
            <span class="winrate"
              >{{ Math.round(stat.winrate * 10000) / 100 }} %</span
            >
          </div>

          <div class="rp-row">
            <div class="rp-progress">
              <div
                class="rp-progress__bar"
                :style="{
                  width: `${(stat.rankingPoints - Math.floor(stat.rankingPoints)) * 100}%`,
                }"
              />
              <div class="rp-progress__level">
                {{ Math.floor(stat.rankingPoints) }} RP
              </div>
            </div>
          </div>

          <div class="mmr-row">
            <span class="gray">MMR </span><span>{{ stat.mmr }}</span>
            |
            <span class="gray">Top </span>
            {{ formatQuantile(stat.quantile) }} %
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from "vue";
import { ModeStat, EGameMode } from "@/typings";
import {
  atEquivalent,
  gameModes,
  leagues,
  gameModesAT,
} from "@/constants/constants";
import { getRaceIcon } from "@/utils/assets";
import { useW3CStore } from "@/store/w3c";

function formatQuantile(quantile: number): string {
  const percentage = (1 - quantile) * 100;
  let decimals = 1;
  if (percentage < 0.1 || percentage > 99.9) {
    decimals = 2;
  }
  if (percentage < 0.01 || percentage > 99.99) {
    decimals = 3;
  }
  if (percentage < 0.001 || percentage > 99.999) {
    decimals = 4;
  }
  return (Math.round(percentage * Math.pow(10, decimals)) / Math.pow(10, decimals)).toString();
}

export default defineComponent({
  name: "NoMatchStats",
  props: {
    seasonalStats: {
      type: Array as PropType<ModeStat[]>,
      default: () => [],
    },
    currentSeason: {
      type: Number,
      required: true,
    },
  },
  setup(props) {
    const store = useW3CStore();

    // Helper to check if a mode is 1v1
    const modeHasRace = (mode: EGameMode) => {
      return [EGameMode.GM_1ON1].includes(mode);
    };

    const sortedSeasonalStats = computed(() => {
      if (props.seasonalStats.length === 0) return [];

      // Merge AT modes into their non-AT equivalents
      const mergedStats: ModeStat[] = [];
      const statMap = new Map<string, ModeStat>();

      for (const stat of props.seasonalStats) {
        // Map AT modes to their non-AT equivalent
        let effectiveMode = stat.gameMode;
        let effectiveRace = stat.race;
        const isATMode = gameModesAT.includes(stat.gameMode);

        if (isATMode) {
          effectiveRace = 0;
        }

        // Create a unique key for this mode+race combination
        const key = `${effectiveMode}:${effectiveRace}`;

        if (statMap.has(key)) {
          // Merge stats
          const existing = statMap.get(key)!;
          existing.games += stat.games;
          existing.wins += stat.wins;
          existing.losses += stat.losses;
          existing.winrate = existing.wins / existing.games;
          // Keep the higher MMR and ranking from either AT or non-AT
          if (stat.mmr > existing.mmr) {
            existing.mmr = stat.mmr;
            existing.rankingPoints = stat.rankingPoints;
            existing.rank = stat.rank;
            existing.leagueOrder = stat.leagueOrder;
            existing.division = stat.division;
            existing.quantile = stat.quantile;
          }
        } else {
          // Create new merged stat entry with effective mode
          statMap.set(key, {
            ...stat,
            gameMode: effectiveMode,
            race: effectiveRace,
          });
        }
      }

      mergedStats.push(...statMap.values());

      // Find the single most recent match across all modes
      let mostRecentMatch: {
        mode: EGameMode;
        race: number | null;
        date: Date;
      } | null = null;

      const allModesKey = `${store.battleTag}-${store.currentSeason}-ALL`;
      const matchHistory = store.matchHistory[allModesKey];

      if (matchHistory && matchHistory.matches.length > 0) {
        // Find the absolute most recent match
        for (const match of matchHistory.matches) {
          const matchDate = new Date(match.startTime);

          if (!mostRecentMatch || matchDate > mostRecentMatch.date) {
            const player = match.teams
              .flatMap((t) => t.players)
              .find((p) => p.battleTag === store.battleTag);
            const race =
              modeHasRace(match.gameMode) && player ? player.race : null;

            // Map AT mode to non-AT for comparison
            let effectiveMatchMode = match.gameMode;
            const isATMode = Object.values(atEquivalent).includes(
              match.gameMode,
            );
            if (isATMode) {
              const nonATMode = Object.entries(atEquivalent).find(
                ([_, atMode]) => atMode === match.gameMode,
              )?.[0];
              if (nonATMode) {
                effectiveMatchMode = parseInt(nonATMode);
              }
            }

            mostRecentMatch = {
              mode: effectiveMatchMode,
              race,
              date: matchDate,
            };
          }
        }
      }

      // Sort stats: most recent match first, then by games played
      return [...mergedStats].sort((a, b) => {
        const aIsMostRecent =
          mostRecentMatch &&
          a.gameMode === mostRecentMatch.mode &&
          (mostRecentMatch.race === null || a.race === mostRecentMatch.race);
        const bIsMostRecent =
          mostRecentMatch &&
          b.gameMode === mostRecentMatch.mode &&
          (mostRecentMatch.race === null || b.race === mostRecentMatch.race);

        // Most recent match goes first
        if (aIsMostRecent && !bIsMostRecent) return -1;
        if (bIsMostRecent && !aIsMostRecent) return 1;

        // Everything else sorts by games played
        return b.games - a.games;
      });
    });

    const getCardClass = (stat: ModeStat) => {
      const classes: Record<string, boolean> = { "stat-card": true };
      if (leagues[stat.leagueOrder] && stat.rank > 0) {
        classes[`stat-card--${leagues[stat.leagueOrder]}`] = true;
      }
      return classes;
    };

    return {
      gameModes,
      leagues,
      getRaceIcon,
      getCardClass,
      sortedSeasonalStats,
      formatQuantile,
    };
  },
});
</script>

<style lang="scss" scoped>
.no-match-stats {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
  overflow: hidden;
}

.seasonal-stats-scroll-container {
  width: 100%;
  overflow-y: auto;
  padding: 20px;
  /* Hide scrollbar for Chrome, Safari and Opera */
  &::-webkit-scrollbar {
    display: none;
  }
  /* Hide scrollbar for IE, Edge and Firefox */
  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: none; /* Firefox */
}

.seasonal-stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 30px 20px;
  width: 100%;
  justify-items: center;
}

.stat-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  position: relative;
  width: 240px;
  padding: 25px 10px 15px;
  border: 1px solid var(--color-yellow);
  border-radius: 10px;
  background: rgba(0, 0, 0, 0.3);
  margin-top: 30px; /* Space for the league icon */

  &::before {
    content: "";
    position: absolute;
    width: 50px;
    height: 50px;
    left: 50%;
    top: -30px;
    transform: translateX(-50%);
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center;
  }

  &--grandmaster::before {
    background-image: url("/leagues/grandmaster.png");
  }
  &--master::before {
    background-image: url("/leagues/master.png");
  }
  &--adept::before {
    background-image: url("/leagues/adept.png");
  }
  &--diamond::before {
    background-image: url("/leagues/diamond.png");
  }
  &--platinum::before {
    background-image: url("/leagues/platinum.png");
  }
  &--gold::before {
    background-image: url("/leagues/gold.png");
  }
  &--silver::before {
    background-image: url("/leagues/silver.png");
  }
  &--bronze::before {
    background-image: url("/leagues/bronze.png");
  }
  &--grass::before {
    background-image: url("/leagues/grass.png");
  }

  .mode-race-row {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 2px;
  }

  .mode-name {
    font-size: 16px;
    font-weight: bold;
    color: var(--color-yellow);
  }

  .race-icon {
    width: 24px;
    height: 24px;
  }

  .league-info {
    font-size: 14px;
    font-weight: bold;
    text-transform: uppercase;
  }

  .stats-row {
    font-size: 14px;
  }

  .wins {
    color: var(--color-green);
  }
  .losses {
    color: var(--color-red);
  }
  .winrate {
    font-size: 12px;
  }

  .rp-row {
    width: 100%;
    display: flex;
    justify-content: center;
  }

  .rp-progress {
    display: inline-block;
    width: 100px;
    --progress-height: 18px;
    height: var(--progress-height);
    text-align: center;
    border: 1px white solid;
    border-radius: 4px;
    position: relative;
    overflow: hidden;

    &__bar {
      --dark-yellow: color-mix(in srgb, var(--color-yellow), black 70%);
      background: linear-gradient(
        0deg,
        var(--dark-yellow),
        var(--color-yellow),
        var(--dark-yellow)
      );
      height: 100%;
    }
    &__level {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      line-height: var(--progress-height);
      font-size: 11px;
      font-weight: bold;
      text-shadow:
        1px 0 0 black,
        -1px 0 0 black,
        0 1px 0 black,
        0 -1px 0 black;
    }
  }

  .mmr-row {
    font-size: 12px;
  }
}
</style>
