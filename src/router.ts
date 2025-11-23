import { createRouter, createWebHashHistory, RouteRecordRaw } from "vue-router";
import CurrentMatch from "@/overlay/tabs/CurrentMatch.vue";
import TodayResults from "@/overlay/tabs/TodayResults.vue";
import OneVsOneMatchDetails from "@/components/OneVsOneMatchDetails.vue";
import TeamMatchDetails from "@/components/TeamMatchDetails.vue";
import HeadToHead from "@/components/HeadToHead.vue";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    redirect: "/ongoing",
  },
  {
    path: "/ongoing",
    name: "CurrentMatch",
    component: CurrentMatch,
  },
  {
    path: "/today",
    name: "TodayResults",
    component: TodayResults,
  },
  {
    path: "/match/:id",
    name: "OneVsOneMatchDetails",
    component: OneVsOneMatchDetails,
    props: (route) => ({
      matchId: route.params.id,
    }),
  },
  {
    path: "/team-match/:id",
    name: "TeamMatchDetails",
    component: TeamMatchDetails,
    props: (route) => ({
      matchId: route.params.id,
    }),
  },
  {
    path: "/head-to-head/:opponentBattleTag",
    name: "HeadToHead",
    component: HeadToHead,
    props: (route) => ({
      opponentBattleTag: route.params.opponentBattleTag,
    }),
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
