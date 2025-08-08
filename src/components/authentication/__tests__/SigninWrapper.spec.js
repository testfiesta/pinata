import Vuetify from "vuetify";
import SigninWrapper from "../SigninWrapper.vue";

import { mount } from "@vue/test-utils";

const vuetify = new Vuetify();

describe("SigninWrapper.vue", () => {
  test("render a view", () => {
    const wrapper = mount(SigninWrapper, {
      mocks: {
        $t: () => {},
        $tc: () => {},
      },
      vuetify,
    });

    expect(wrapper.find(".wrapper .header").exists()).toBe(true);
    expect(wrapper.find(".wrapper .subtitle-1").exists()).toBe(true);
    expect(wrapper.find(".wrapper .content").exists()).toBe(true);
    expect(
      wrapper.findAll(".wrapper .content .row:first-child button").length
    ).toBe(2);
  });

  test('trigger the click event of "signin with pinata" button', () => {
    const wrapper = mount(SigninWrapper, {
      mocks: {
        $t: () => {},
        $tc: () => {},
      },
      data() {
        return {};
      },
      vuetify,
    });

    const event = jest.fn();
    const button = wrapper.find("button.pinata");

    button.vm.$on("click", event);
    button.trigger("click");

    expect(event).toHaveBeenCalled();
  });

  test('trigger the click event of "signin with jira" button', () => {
    const wrapper = mount(SigninWrapper, {
      mocks: {
        $t: () => {},
        $tc: () => {},
      },
      data() {
        return {};
      },
      vuetify,
    });

    const event = jest.fn();
    const button = wrapper.find("button.jira");

    button.vm.$on("click", event);
    button.trigger("click");

    expect(event).toHaveBeenCalled();
  });
});
