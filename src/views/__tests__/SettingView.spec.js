import Vuetify from "vuetify";
import VueRouter from "vue-router";

import SettingView from "../SettingView.vue";

import { mount, createLocalVue } from "@vue/test-utils";

const vuetify = new Vuetify();

const localVue = createLocalVue();
localVue.use(VueRouter);

const router = new VueRouter();

describe("SettingView.vue", () => {
  test("loadin a view", () => {
    const wrapper = mount(SettingView, {
      mocks: {
        $t: () => {},
        $tc: () => {},
      },
      data() {
        return {
          activeTab: "/settings",
          tabs: [{ id: 1, name: "General", route: `/settings` }],
          config: {},
        };
      },
      localVue,
      router,
      vuetify,
    });

    expect(wrapper.find(".settings-menu").exists()).toBe(true);
    expect(wrapper.findAll(".v-tab").length).toBe(1);
    expect(wrapper.findAll(".v-tab-item").length).toBe(0);
  });
});
