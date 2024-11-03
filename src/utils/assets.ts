import { ERaceEnum, ERandomRace } from "@/typings";

export function getAsset(path: string) {
  return new URL(`../assets/${path}`, import.meta.url).href;
}

export function getRaceIcon(race: ERaceEnum, rndRace?: ERandomRace | null) {
  if (rndRace) {
    const randRaceIcon = {
      [ERaceEnum.HUMAN]: "HUMAN_RANDOM",
      [ERaceEnum.UNDEAD]: "UNDEAD_RANDOM",
      [ERaceEnum.ORC]: "ORC_RANDOM",
      [ERaceEnum.NIGHT_ELF]: "NIGHT_ELF_RANDOM",
    }[rndRace];
    return getAsset(`races/${randRaceIcon}.png`);
  }
  const raceIconName = {
    [ERaceEnum.RANDOM]: "RANDOM",
    [ERaceEnum.HUMAN]: "HUMAN",
    [ERaceEnum.UNDEAD]: "UNDEAD",
    [ERaceEnum.ORC]: "ORC",
    [ERaceEnum.NIGHT_ELF]: "NIGHT_ELF",
    [ERaceEnum.TOTAL]: "TOTAL"
  }[race];
  return getAsset(`races/${raceIconName}.png`);
}

export function getHeroIcon(hero: string) {
  return getAsset(`heroes/${hero}.png`);
}

export function getStatIcon(icon: string) {
  return getAsset(`${icon}-icon.png`);
}

export function getMinimap(map: string) {
  return getAsset(`maps/${map}.png`);
}