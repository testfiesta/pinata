import Vuetify from "vuetify";
import SupportTab from "../SupportTab.vue";

import { mount, createLocalVue } from "@vue/test-utils";

const localVue = createLocalVue();
localVue.use(Vuetify);

const vuetify = new Vuetify();

describe("SupportTab.vue", () => {
  test("render a view", () => {
    const wrapper = mount(SupportTab, {
      mocks: {
        $t: () => {},
        $tc: () => {},
      },
      localVue,
      vuetify,
    });

    expect(wrapper.find(".content-wrapper").exists()).toBe(true);
  });
});
