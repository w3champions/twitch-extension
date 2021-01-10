import { ERaceEnum } from "@/typings";

export function getAsset(path: string) {
  return require(`../assets/${path}`);
}

export function getRaceIcon(race: ERaceEnum) {
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
