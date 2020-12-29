import { Match, MatchDetail } from "@/typings";

export async function fetchMatchStats(matchId: string): Promise<MatchDetail> {
  const url = `https://statistic-service.w3champions.com/api/matches/${matchId}`;
  const response = await fetch(url);
  return response.json();
}

export async function fetchRecentMatches(
  battleTag: string
): Promise<{ count: number; matches: Match[] }> {
  const encodedBattleTag = encodeURIComponent(battleTag);
  const url = `https://statistic-service.w3champions.com/api/matches/search?playerId=${encodedBattleTag}&gateway=20&offset=0&pageSize=1&season=5`;

  const response = await fetch(url);
  return response.json();
}

export async function fetchOngoingMatch(battleTag: string): Promise<Match> {
  const encodedBattleTag = encodeURIComponent(battleTag);
  const url = `https://statistic-service.w3champions.com/api/matches/ongoing/${encodedBattleTag}`;

  const response = await fetch(url);

  return response.json();
}
