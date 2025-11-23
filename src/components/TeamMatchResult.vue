<template>
  <div class="team-match-result" @click="$emit('click')">
    <div class="teams-layout">
      <!-- Left Team (My Team) -->
      <div class="team-column left-team">
        <div
          v-for="player in leftTeam.players"
          :key="player.battleTag"
          class="player-row"
        >
          <span class="player-name-info">
            <span
              class="player-name"
              :class="{
                'is-me': player.battleTag === store.battleTag,
                'is-winner': leftTeam.won,
                'is-loser': !leftTeam.won,
              }"
            >
              {{ playerAkas[player.battleTag] || player.name }}
            </span>
            <span
              v-if="
                playerAkas[player.battleTag] &&
                player.name !== playerAkas[player.battleTag]
              "
              class="player-aka"
            >
              as {{ player.name }}</span
            >
          </span>
          <div class="race-icon">
            <img
              :src="getRaceIcon(player.race, player.rndRace)"
              width="24"
              height="24"
            />
          </div>
        </div>
      </div>

      <!-- VS -->
      <div class="vs-column">VS</div>

      <!-- Right Team (Opponent Team) -->
      <div class="team-column right-team">
        <div
          v-for="player in rightTeam.players"
          :key="player.battleTag"
          class="player-row"
        >
          <div class="race-icon">
            <img
              :src="getRaceIcon(player.race, player.rndRace)"
              width="24"
              height="24"
            />
          </div>
          <span class="player-name-info">
            <span
              class="player-name"
              :class="{
                'is-winner': rightTeam.won,
                'is-loser': !rightTeam.won,
              }"
            >
              {{ playerAkas[player.battleTag] || player.name }}
            </span>
            <span
              v-if="
                playerAkas[player.battleTag] &&
                player.name !== playerAkas[player.battleTag]
              "
              class="player-aka"
            >
              as {{ player.name }}</span
            >
          </span>
        </div>
      </div>
    </div>

    <!-- Match Info -->
    <div class="match-info-column">
      <div class="info-row">
        <span>{{ formatMatchDuration(match.durationInSeconds) }}</span>
        <span
          :style="{
            color: mmrChange > 0 ? 'var(--color-green)' : 'var(--color-red)',
          }"
        >
          ({{ mmrChange > 0 ? "+" : "" }}{{ mmrChange }})
        </span>
      </div>
      <div class="info-row time-ago">
        <relative-time :time="match.endTime" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from "vue";
import { Match } from "@/typings";
import { getRaceIcon } from "@/utils/assets";
import { formatMatchDuration } from "@/utils/time";
import RelativeTime from "@/components/RelativeTime.vue";
import usePlayerAka from "@/composables/usePlayerAka";
import { useW3CStore } from "@/store/w3c";

export default defineComponent({
  name: "TeamMatchResult",
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

    const leftTeam = computed(() => {
      return (
        props.match.teams.find((t) =>
          t.players.some((p) => p.battleTag === store.battleTag),
        ) || props.match.teams[0]
      );
    });

    const rightTeam = computed(() => {
      return (
        props.match.teams.find((t) => t !== leftTeam.value) ||
        props.match.teams[1]
      );
    });

    const mmrChange = computed(() => {
      return (
        leftTeam.value.players.find((p) => p.battleTag === store.battleTag)
          ?.mmrGain ?? 0
      );
    });

    return {
      leftTeam,
      rightTeam,
      mmrChange,
      getRaceIcon,
      formatMatchDuration,
      playerAkas,
      store,
    };
  },
});
</script>

<style lang="scss" scoped>
.team-match-result {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  cursor: pointer;

  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
    border-radius: 8px;
  }
}

.teams-layout {
  display: flex;
  align-items: center;
  gap: 15px;
  flex: 1;
}

.team-column {
  display: flex;
  flex-direction: column;
  align-content: center;
  // gap: 4px;
  flex: 1;
}

.race-icon {
  display: inline-flex;

  img {
    width: 32px;
    height: 32px;
  }
}

.left-team {
  align-items: flex-end;

  .player-row {
    justify-content: flex-end;
  }
  .player-name {
    text-align: right;
  }
}

.right-team {
  align-items: flex-start;

  .player-row {
    justify-content: flex-start;
  }
  .player-name {
    text-align: left;
  }
}

.vs-column {
  font-weight: bold;
  color: var(--color-yellow);
  font-size: 14px;
}

.player-row {
  display: flex;
  align-items: center;
  gap: 8px;
  vertical-align: middle;
}

.player-name-info {
  display: inline-flex;
  flex-direction: column;
}

.player-name {
  color: var(--color-yellow);
  font-size: 14px;
  line-height: 1.2rem;
  white-space: nowrap;
  vertical-align: middle;

  &.is-me {
    font-weight: bold;
  }

  &.is-winner {
    color: var(--color-green);
  }

  &.is-loser {
    color: var(--color-red);
  }
}

.player-aka {
  color: var(--color-gray);
  font-size: 11px;
  margin-top: -6px;
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
