import {
  EGameMode,
  Gateways,
  Match,
  MatchDetail,
  ModeStat,
  OngoingMatch,
  TwitchStreamResponse,
  TwitchToken
} from "@/typings";

export async function fetchMatchStats(matchId: string): Promise<MatchDetail> {
  const url = `https://statistic-service.w3champions.com/api/matches/${matchId}`;
  const response = await fetch(url);
  return response.json();
}

export async function fetchRecentMatches(
  battleTag: string,
  season: number
): Promise<{ count: number; matches: Match[] }> {
  const encodedBattleTag = encodeURIComponent(battleTag);
  const url = `https://statistic-service.w3champions.com/api/matches/search?playerId=${encodedBattleTag}&gateway=${Gateways.Europe}&offset=0&pageSize=1&season=${season}&gameMode=${EGameMode.GM_1ON1}`;

  const response = await fetch(url);
  return response.json();
}

export async function fetchOngoingMatch(
  battleTag: string
): Promise<OngoingMatch> {
  const encodedBattleTag = encodeURIComponent(battleTag);
  const url = `https://statistic-service.w3champions.com/api/matches/ongoing/${encodedBattleTag}`;

  const response = await fetch(url);

  return response.json();
}

export async function fetchPlayerStats(
  battleTag: string,
  season: number
): Promise<ModeStat[]> {
  const response = await fetch(
    `https://statistic-service.w3champions.com/api/players/${encodeURIComponent(
      battleTag
    )}/game-mode-stats?gateWay=${Gateways.Europe}&season=${season}`
  );

  return response.json();
}

export async function fetchPlayerStatsAgainstOpponent(
  battleTag: string,
  opponentBattleTag: string,
  season: number
): Promise<{ count: number; matches: Match[] }> {
  const encodedBattleTag = encodeURIComponent(battleTag);
  const encodedOpponentBattleTag = encodeURIComponent(opponentBattleTag);

  const query = {
    playerId: encodedBattleTag,
    gateWay: Gateways.Europe,
    opponentId: encodedOpponentBattleTag,
    offset: 0,
    pageSize: 200,
    season
  };
  const queryString = Object.entries(query)
    .map(([key, value]) => `${key}=${value}`)
    .join("&");
  const url = `https://statistic-service.w3champions.com/api/matches/search?${queryString}`;

  const response = await fetch(url);
  return response.json();
}

export async function authorizeWithTwitch(): Promise<TwitchToken> {
  const url = `https://identification-service.test.w3champions.com/api/oauth/twitch`;
  const response = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json"
    }
  });

  return await response.json();
}

export async function getStreamStatus(
  token: string,
  twitchUserId: string
): Promise<TwitchStreamResponse> {
  const baseUrl = "https://api.twitch.tv";
  const params = `user_id=${twitchUserId}`;

  const url = `${baseUrl}/helix/streams?first=1&${params}`;
  const response = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "Client-ID": "38ac0gifyt5khcuq23h2p8zpcqosbc",
      Authorization: `Bearer ${token}`
    }
  });
  return response.json();
}
