import Vuetify from "vuetify";
import TemplateTab from "../TemplateTab.vue";

import { mount, createLocalVue } from "@vue/test-utils";
import { SESSION_TYPES } from "../../../modules/constants";

const vuetify = new Vuetify();
const localVue = createLocalVue();

describe("TemplateTab.vue", () => {
  test("render a view", () => {
    const wrapper = mount(TemplateTab, {
      mocks: {
        $t: () => {},
        $tc: () => {},
      },
      propsData: {
        config: {
          templates: [{ precondition: {} }],
        },
      },
      data() {
        return {
          setting: {},
          templates: [],
          template: {},
          type: "",
          sessionTypes: SESSION_TYPES,
        };
      },
      localVue,
      vuetify,
    });

    expect(wrapper.find(".content-wrapper .subtitle-1").exists()).toBe(true);
    expect(wrapper.find(".content-wrapper .session-type").exists()).toBe(true);
    expect(wrapper.find(".content-wrapper .session-type input").exists()).toBe(
      true
    );
    expect(wrapper.find(".content-wrapper .precond").exists()).toBe(true);
    // expect(wrapper.find(".content-wrapper .issue").exists()).toBe(true);
    // expect(wrapper.find(".content-wrapper .issue input").exists()).toBe(true);
    // expect(wrapper.find(".content-wrapper .bug").exists()).toBe(true);
    // expect(wrapper.find(".content-wrapper .radio-control").exists()).toBe(true);
    expect(wrapper.find(".content-wrapper .footer").exists()).toBe(true);
    expect(wrapper.findAll(".content-wrapper .footer button").length).toBe(2);
  });

  test("trigger the click event of cancel button", () => {
    const wrapper = mount(TemplateTab, {
      mocks: {
        $t: () => {},
        $tc: () => {},
      },
      propsData: {
        config: {
          templates: [{ precondition: {} }],
        },
      },
      data() {
        return {
          setting: {},
          templates: [],
          template: {},
          type: "",
          sessionTypes: SESSION_TYPES,
        };
      },
      localVue,
      vuetify,
    });

    const button = wrapper.find(".content-wrapper .footer button:first-child");
    const event = jest.fn();

    button.vm.$on("click", event);
    button.trigger("click");

    expect(event).toHaveBeenCalled();
  });

  test("trigger the click event of save button", () => {
    const wrapper = mount(TemplateTab, {
      mocks: {
        $t: () => {},
        $tc: () => {},
      },
      propsData: {
        config: {
          templates: [{ precondition: {} }],
        },
      },
      data() {
        return {
          setting: {},
          templates: [],
          template: {},
          type: "",
          sessionTypes: SESSION_TYPES,
        };
      },
      localVue,
      vuetify,
    });

    const button = wrapper.find(".content-wrapper .footer button:last-child");
    const event = jest.fn();

    button.vm.$on("click", event);
    button.trigger("click");

    expect(event).toHaveBeenCalled();
  });
});
