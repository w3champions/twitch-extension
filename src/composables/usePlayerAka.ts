import { fetchPlayerProfile } from "@/utils/fetch";
import { reactive } from "vue";

const playerAkas: Record<string, string | null> = reactive({});

export default function() {
  async function fetchPlayerAka(battleTag: string) {
    if (!playerAkas.hasOwnProperty(battleTag)) {
      const profile = await fetchPlayerProfile(battleTag);
      playerAkas[battleTag] = profile.playerAkaData.name;
    }
  }

  return {
    playerAkas,
    fetchPlayerAka
  };
}
