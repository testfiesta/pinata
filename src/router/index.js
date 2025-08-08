import Vue from "vue";
import VueRouter from "vue-router";

import HomeView from "../views/HomeView.vue";
import MainView from "../views/MainView.vue";
import ResultView from "../views/ResultView.vue";
import PrintView from "../views/PrintView.vue";
import LowProfileView from "../views/LowProfileView.vue";

import AuthenticationView from "../views/AuthenticationView.vue";
import SignupMainWrapper from "@/components/authentication/SignupMainWrapper";
import SignupPinataWrapper from "@/components/authentication/SignupPinataWrapper";
import SigninWrapper from "@/components/authentication/SigninWrapper";
import SigninTestfiestaWrapper from "@/components/authentication/SigninTestfiestaWrapper";
import SigninJiraWrapper from "@/components/authentication/SigninJiraWrapper";
import SigninTestRailWrapper from "@/components/authentication/SigninTestRailWrapper";
import SigninXrayWrapper from "@/components/authentication/SigninXrayWrapper";
import SigninZephyrSquadWrapper from "@/components/authentication/SigninZephyrSquadWrapper";
import SigninZephyrScaleWrapper from "@/components/authentication/SigninZephyrScaleWrapper";

import SettingView from "../views/SettingView.vue";
import ConnectionsTab from "@/components/settings/ConnectionsTab.vue";
import GeneralTab from "@/components/settings/GeneralTab.vue";
import SupportTab from "@/components/settings/SupportTab.vue";
import TemplateTab from "@/components/settings/TemplateTab.vue";
import ConfigCheckListTab from "@/components/settings/ConfigCheckListTab.vue";
import ReportsTab from "@/components/settings/ReportsTab.vue";
import AddonsTab from "@/components/settings/AddonsTab.vue";
import HotkeysTab from "@/components/settings/HotkeysTab.vue";
import TagsTab from "@/components/settings/TagsTab.vue";

import store from "@/store";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "home",
    component: HomeView,
  },
  {
    path: "/authentication",
    component: AuthenticationView,
    children: [
      {
        path: "signupMain",
        name: "signupMain",
        component: SignupMainWrapper,
        props: true,
      },
      {
        path: "signupPinata",
        name: "signupPinata",
        component: SignupPinataWrapper,
        props: true,
      },
      {
        path: "signin",
        name: "signin",
        component: SigninWrapper,
        props: true,
      },
      {
        path: "signinTestfiesta",
        name: "signinTestfiesta",
        component: SigninTestfiestaWrapper,
        props: true,
      },
      {
        path: "signinJira",
        name: "signinJira",
        component: SigninJiraWrapper,
        props: true,
      },
      {
        path: "signinTestRail",
        name: "signinTestRail",
        component: SigninTestRailWrapper,
        props: true,
      },
      {
        path: "signinXray",
        name: "signinXray",
        component: SigninXrayWrapper,
        props: true,
      },
      {
        path: "signinZephyrSquad",
        name: "signinZephyrSquad",
        component: SigninZephyrSquadWrapper,
        props: true,
      },
      {
        path: "signinZephyrScale",
        name: "signinZephyrScale",
        component: SigninZephyrScaleWrapper,
        props: true,
      },
    ],
  },
  {
    path: "/main",
    name: "main",
    component: MainView,
    children: [{ path: "workspace" }, { path: "workspace/:execID" }],
  },
  {
    path: "/settings",
    component: SettingView,
    children: [
      {
        path: "/",
        name: "general",
        component: GeneralTab,
        props: true,
      },
      {
        path: "connections",
        name: "connections",
        component: ConnectionsTab,
        props: true,
      },
      {
        path: "support",
        name: "support",
        component: SupportTab,
        props: true,
      },
      {
        path: "template",
        name: "template",
        component: TemplateTab,
        props: true,
      },
      {
        path: "checklist",
        name: "checklist",
        component: ConfigCheckListTab,
        props: true,
      },
      {
        path: "reports",
        name: "reports",
        component: ReportsTab,
        props: true,
      },
      {
        path: "addons",
        name: "addons",
        component: AddonsTab,
        props: true,
      },
      {
        path: "hotkeys",
        name: "hotkeys",
        component: HotkeysTab,
        props: true,
      },
      {
        path: "tabs",
        name: "tabs",
        component: TagsTab,
        props: true,
      },
    ],
  },
  {
    path: "/result",
    name: "result",
    component: ResultView,
  },
  {
    path: "/print",
    name: "print",
    component: PrintView,
  },
  {
    path: "/minimize",
    name: "minimize",
    meta: { layout: "minimize" },
    component: LowProfileView,
  },
];

const router = new VueRouter({
  mode: process.env.IS_ELECTRON ? "hash" : "history",
  base: process.env.BASE_URL,
  routes,
});

router.beforeEach((to, from, next) => {
  // This prevents us from saving store on initial load where name is null
  if (
    from.matched.length > 0 &&
    !to.path.includes("settings") &&
    store.state.session.sessionID
  ) {
    store.commit("setSessionPath", to.path);
  }
  next();
});

export default router;
