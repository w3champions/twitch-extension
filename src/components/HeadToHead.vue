<template>
  <div class="head-to-head-view">
    <div class="actions-bar">
      <div class="left-actions">
        <WButton @click="$router.back()">Back</WButton>
      </div>
    </div>
    <div v-if="isLoading" class="loading">Loading...</div>
    <div v-else class="h2h-grid">
      <div class="summary-column">
        <div class="player-names">
          <span class="name">{{
            playerAkas[store.battleTag] || store.battleTag.split("#")[0]
          }}</span>
          <span class="vs">vs</span>
          <span class="name">{{ opponentName }}</span>
        </div>
        <div class="season-info">Season {{ currentSeason }}</div>
        <div class="score-display">
          <span class="score-win">{{ wonMatches.length }}</span>
          <span class="score-separator">-</span>
          <span class="score-loss">{{ lostMatches.length }}</span>
        </div>
      </div>

      <div class="list-column">
        <h3 class="column-header win-header">
          {{ playerAkas[store.battleTag] || store.battleTag.split("#")[0] }}
          won:
        </h3>
        <div class="match-list">
          <Suspense v-for="match in wonMatches" :key="match.id">
            <OneVsOneMatchResult
              :match="match"
              :head-to-head="true"
              @click="goToMatch(match.id)"
            />
          </Suspense>
        </div>
      </div>

      <div class="list-column">
        <h3 class="column-header loss-header">
          {{ playerAkas[store.battleTag] || store.battleTag.split("#")[0] }}
          lost:
        </h3>
        <div class="match-list">
          <Suspense v-for="match in lostMatches" :key="match.id">
            <OneVsOneMatchResult
              :match="match"
              :head-to-head="true"
              @click="goToMatch(match.id)"
            />
          </Suspense>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, computed } from "vue";
import { useRouter } from "vue-router";
import { Match, EGameMode } from "@/typings";
import OneVsOneMatchResult from "@/components/OneVsOneMatchResult.vue";
import WButton from "@/components/WButton.vue";
import usePlayerAka from "@/composables/usePlayerAka";
import { useW3CStore } from "@/store/w3c";

export default defineComponent({
  name: "HeadToHead",
  components: { OneVsOneMatchResult, WButton },
  props: {
    opponentBattleTag: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const router = useRouter();
    const store = useW3CStore();
    const wonMatches = ref<Match[]>([]);
    const lostMatches = ref<Match[]>([]);
    const isLoading = ref(true);
    const currentSeason = ref(0);
    const { fetchPlayerAka, playerAkas } = usePlayerAka();

    const opponentName = computed(() => {
      return (
        playerAkas[props.opponentBattleTag] ||
        props.opponentBattleTag.split("#")[0]
      );
    });

    onMounted(async () => {
      try {
        const seasons = await store.fetchSeasons();
        currentSeason.value = seasons[0].id;

        // Preload akas
        await Promise.all([
          fetchPlayerAka(store.battleTag),
          fetchPlayerAka(props.opponentBattleTag),
        ]);

        const h2h = await store.fetchHeadToHeadStats(
          store.battleTag,
          props.opponentBattleTag,
          currentSeason.value,
        );

        const matches1v1 = h2h.matches.filter(
          (m) => m.gameMode === EGameMode.GM_1ON1,
        );

        for (const match of matches1v1) {
          const player = match.teams
            .flatMap((t) => t.players)
            .find((p) => p.battleTag === store.battleTag);
          if (player?.won) {
            wonMatches.value.push(match);
          } else {
            lostMatches.value.push(match);
          }
        }
      } finally {
        isLoading.value = false;
      }
    });

    const goToMatch = (matchId: string) => {
      router.push({
        name: "OneVsOneMatchDetails",
        params: { id: matchId },
        query: { battleTag: store.battleTag },
      });
    };

    return {
      wonMatches,
      lostMatches,
      isLoading,
      opponentName,
      playerAkas,
      currentSeason,
      store,
      goToMatch,
    };
  },
});
</script>

<style lang="scss" scoped>
.head-to-head-view {
  display: grid;
  grid-template-rows: 50px 1fr;
  grid-row-gap: 5px;
}

.actions-bar {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  margin-bottom: 10px;
}

.left-actions {
  grid-column: 2;
}

.right-actions {
  grid-column: 3;
  justify-self: end;
  display: flex;
  gap: 8px;
}

.h2h-grid {
  display: grid;
  grid-template-columns: 240px 1fr 1fr;
  grid-column-gap: 25px;
  height: 100%;
  overflow: hidden;
}

.summary-column {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 20px;

  .player-names {
    font-size: 24px;
    margin-bottom: 10px;
    text-align: center;

    .name {
      color: var(--color-yellow);
      display: block;
    }
    .vs {
      font-size: 18px;
      margin: 5px 0;
    }
  }

  .season-info {
    font-size: 16px;
    margin-bottom: 15px;
  }

  .score-display {
    font-size: 50px;

    .score-win {
      color: var(--color-green);
    }
    .score-loss {
      color: var(--color-red);
    }
    .score-separator {
      margin: 0 10px;
      color: #fff;
    }
  }
}

.list-column {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  text-align: left;

  .column-header {
    margin: 0 0 10px 0;
    &.win-header {
      color: var(--color-green);
    }
    &.loss-header {
      color: var(--color-red);
    }
  }

  .match-list {
    overflow-y: auto;
    flex: 1;
    padding-right: 5px;

    /* Scrollbar styling */
    &::-webkit-scrollbar {
      width: 8px;
    }
    &::-webkit-scrollbar-track {
      background: rgba(0, 0, 0, 0.1);
    }
    &::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.2);
      border-radius: 4px;
    }
  }
}
</style>
