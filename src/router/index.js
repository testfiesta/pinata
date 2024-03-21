import Vue from "vue";
import VueRouter from "vue-router";

import HomeView from "../views/HomeView.vue";
import MainView from "../views/MainView.vue";
import AddEvidence from "../views/AddEvidence.vue";
import EditEvidence from "../views/EditEvidence.vue";
import ResultView from "../views/ResultView.vue";
import PrintView from "../views/PrintView.vue";
import NoteView from "../views/NoteView.vue";
import MinimizeView from "../views/MinimizeView.vue";

import AuthenticationView from "../views/AuthenticationView.vue";
import SignupMainWrapper from "@/components/authentication/SignupMainWrapper";
import SignupYattieWrapper from "@/components/authentication/SignupYattieWrapper";
import SigninWrapper from "@/components/authentication/SigninWrapper";
import SigninYattWrapper from "@/components/authentication/SigninYattWrapper";
import SigninJiraWrapper from "@/components/authentication/SigninJiraWrapper";
import SigninTestRailWrapper from "@/components/authentication/SigninTestRailWrapper";
import SigninXrayWrapper from "@/components/authentication/SigninXrayWrapper";

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

import NoteEditorView from "../views/NoteEditorView.vue";
import SummaryEditorView from "../views/SummaryEditorView.vue";
import EndSessionView from "../views/EndSessionView.vue";
import ShareOAuthView from "../views/ShareOAuthView.vue";

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
        path: "signupYattie",
        name: "signupYattie",
        component: SignupYattieWrapper,
        props: true,
      },
      {
        path: "signin",
        name: "signin",
        component: SigninWrapper,
        props: true,
      },
      {
        path: "signinYatt",
        name: "signinYatt",
        component: SigninYattWrapper,
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
    ],
  },
  {
    path: "/main",
    name: "main",
    component: MainView,
    children: [
      {
        path: "workspace",
      },
    ],
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
    path: "/addEvidence",
    name: "addEvidence",
    component: AddEvidence,
  },
  {
    path: "/EditEvidence",
    name: "EditEvidence",
    component: EditEvidence,
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
    path: "/note",
    name: "note",
    component: NoteView,
  },
  {
    path: "/minimize",
    name: "minimize",
    meta: { layout: "minimize" },
    component: MinimizeView,
  },
  {
    path: "/noteEditor",
    name: "noteEditor",
    component: NoteEditorView,
  },
  {
    path: "/summaryEditor",
    name: "summaryEditor",
    component: SummaryEditorView,
  },
  {
    path: "/shareOAuth",
    name: "shareOAuth",
    component: ShareOAuthView,
  },
  {
    path: "/endsession",
    name: "endsession",
    component: EndSessionView,
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
