import Vuetify from "vuetify";
import LowProfileView from "../LowProfileView.vue";
import ControlPanel from "../../components/ControlPanel.vue";

import { shallowMount } from "@vue/test-utils";

const vuetify = new Vuetify();

describe("LowProfileView.vue", () => {
  test("render a view", () => {
    const wrapper = shallowMount(LowProfileView, {
      mocks: {
        $t: () => {},
        $tc: () => {},
      },
      data() {
        return {
          overlay: true,
        };
      },
      vuetify,
    });

    expect(wrapper.find(".header").exists()).toBe(true);
    expect(wrapper.find(".header .maximize-btn").exists()).toBe(true);
    expect(wrapper.find(".body").exists()).toBe(true);
    expect(wrapper.find(".body .overlay").exists()).toBe(true);
    expect(wrapper.findComponent(ControlPanel).exists()).toBe(true);
  });

  test('trigger the click event of "Maximize" button', () => {
    const wrapper = shallowMount(LowProfileView, {
      mocks: {
        $t: () => {},
        $tc: () => {},
      },
      data() {
        return {
          overlay: false,
        };
      },
      vuetify,
    });

    const event = jest.fn();
    const button = wrapper.find(".header .maximize-btn");

    button.vm.$on("click", event);
    // button.trigger("click");

    // expect(event).toHaveBeenCalled();
  });
});
