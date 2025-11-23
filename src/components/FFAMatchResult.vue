<template>
  <a class="ffa-match-result" :href="`https://w3champions.com/match/${match.id}`" target="_blank">
    <div class="players-layout">
      <div
        v-for="(player, index) in sortedPlayers"
        :key="player.battleTag"
        class="player-row"
      >
        <span class="rank" :class="`rank-${index + 1}`">#{{ index + 1 }}</span>
        <div class="race-icon">
          <img
            :src="getRaceIcon(player.race, player.rndRace)"
            width="24"
            height="24"
          />
        </div>
        <div class="player-info">
          <span
            class="player-name"
            :class="{ 'is-me': player.battleTag === store.battleTag }"
          >
            {{ playerAkas[player.battleTag] || player.name }}
          </span>
          <span
            class="mmr-change"
            :class="{ 'is-me': player.battleTag === store.battleTag }"
            :style="{
              color:
                player.mmrGain > 0 ? 'var(--color-green)' : 'var(--color-red)',
            }"
          >
            ({{ player.currentMmr }}){{ player.mmrGain > 0 ? "+" : ""
            }}{{ player.mmrGain }}
          </span>
        </div>
      </div>
    </div>

    <!-- Match Info -->
    <div class="match-info-column">
      <div class="info-row">
        <span>{{ formatMatchDuration(match.durationInSeconds) }}</span>
      </div>
      <div class="info-row time-ago">
        <relative-time :time="match.endTime" />
      </div>
    </div>
  </a>
</template>

<script lang="ts">
import { defineComponent, computed, PropType } from "vue";
import { Match } from "@/typings";
import { getRaceIcon } from "@/utils/assets";
import { formatMatchDuration } from "@/utils/time";
import RelativeTime from "@/components/RelativeTime.vue";
import usePlayerAka from "@/composables/usePlayerAka";
import { useW3CStore } from "@/store/w3c";

export default defineComponent({
  name: "FFAMatchResult",
  components: { RelativeTime },
  props: {
    match: {
      type: Object as PropType<Match>,
      required: true,
    },
  },
  emits: ["click"],
  setup(props) {
    const { playerAkas } = usePlayerAka();
    const store = useW3CStore();

    const sortedPlayers = computed(() => {
      // Sort players by whether they won (placement)
      const allPlayers = props.match.teams.flatMap((t) => t.players);

      // Sort by MMR (higher MMR = better placement in FFA)
      // In FFA, the winner typically has positive MMR gain
      return allPlayers.sort((a, b) => {
        // First sort by team won status
        const aWon = props.match.teams.find((t) =>
          t.players.some((p) => p.battleTag === a.battleTag),
        )?.won;
        const bWon = props.match.teams.find((t) =>
          t.players.some((p) => p.battleTag === b.battleTag),
        )?.won;

        if (aWon !== bWon) {
          return aWon ? -1 : 1;
        }

        // Then by MMR gain (higher is better)
        return b.mmrGain - a.mmrGain;
      });
    });

    return {
      sortedPlayers,
      getRaceIcon,
      formatMatchDuration,
      playerAkas,
      store,
    };
  },
});
</script>

<style lang="scss" scoped>
.ffa-match-result {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  cursor: pointer;
  text-decoration: none;
  color: inherit;

  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
    border-radius: 8px;
  }
}

.players-layout {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
  align-items: center;
}

.player-row {
  display: flex;
  align-items: center;
  gap: 8px;
  width: fit-content;
}

.rank {
  font-size: 14px;
  font-weight: bold;
  width: 24px;
  text-align: right;

  &.rank-1 {
    color: #ffd700; // Gold
  }

  &.rank-2 {
    color: #c0c0c0; // Silver
  }

  &.rank-3 {
    color: #cd7f32; // Bronze
  }

  &.rank-4 {
    color: #999999; // Gray
  }
}

.race-icon {
  width: 24px;
  height: 24px;
}

.player-info {
  width: 260px;
}

.player-name {
  font-size: 14px;
  white-space: nowrap;
  min-width: 120px;

  &.is-me {
    font-weight: bold;
    color: var(--color-yellow);
  }
}

.mmr-change {
  font-size: 14px;
  white-space: nowrap;
  min-width: 110px;
  text-align: left;

  &.is-me {
    font-weight: bold;
  }
}

.match-info-column {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  margin-left: 20px;
  min-width: 160px;
}

.info-row {
  display: flex;
  gap: 6px;
  font-size: 16px;

  &.time-ago {
    font-size: 16px;
  }
}
</style>
