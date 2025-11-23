import { fetchPlayerProfile } from "@/utils/fetch";
import { reactive } from "vue";

const playerAkas: Record<string, string | null> = reactive({});

export default function () {
  async function fetchPlayerAka(battleTag: string) {
    if (!playerAkas.hasOwnProperty(battleTag)) {
      try {
        const profile = await fetchPlayerProfile(battleTag);
        playerAkas[battleTag] = profile.playerAkaData?.name || null;
      } catch {
        // If profile fetch fails, set to null
        playerAkas[battleTag] = null;
      }
    }
  }

  return {
    playerAkas,
    fetchPlayerAka,
  };
}
