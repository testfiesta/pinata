import Vuetify from "vuetify";
import GeneralTab from "../GeneralTab";

import { mount, createLocalVue } from "@vue/test-utils";

const localVue = createLocalVue();
const vuetify = new Vuetify();

describe("GeneralTab.vue", () => {
  test("render a view", () => {
    const wrapper = mount(GeneralTab, {
      mocks: {
        $t: () => {},
        $tc: () => {},
      },
      propsData: {
        config: {},
      },
      localVue,
      vuetify,
    });

    expect(wrapper.find(".content-wrapper .theme-mode-section").exists()).toBe(
      true
    );
    expect(
      wrapper
        .find(".content-wrapper .theme-mode-section .radio-control")
        .exists()
    ).toBe(true);

    expect(wrapper.find(".content-wrapper .screenshot-section").exists()).toBe(
      true
    );
    expect(
      wrapper
        .find(".content-wrapper .screenshot-section .color-picker-wrapper")
        .exists()
    ).toBe(true);

    expect(wrapper.find(".content-wrapper .note-section").exists()).toBe(true);
    expect(wrapper.find(".content-wrapper .note-section input").exists()).toBe(
      true
    );

    expect(
      wrapper.find(".content-wrapper .screen-recording-section").exists()
    ).toBe(true);
    expect(
      wrapper
        .find(".content-wrapper .screen-recording-section .switch-control")
        .exists()
    ).toBe(true);
  });
});
