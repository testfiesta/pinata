import { mount, createLocalVue } from "@vue/test-utils";
import Vuex from "vuex";
import Vuetify from "vuetify";
import { cloneDeep } from "lodash";

import TimeCounter from "../TimeCounter";
import storeConfig from "../../store/store-config";

const vuetify = new Vuetify();
const localVue = createLocalVue();

localVue.use(Vuex);

describe("TimeCounter.vue", () => {
  let store;

  beforeEach(() => {
    store = new Vuex.Store(cloneDeep(storeConfig));
  });

  test("displays elapsed time title", () => {
    const wrapper = mount(TimeCounter, {
      mocks: {
        $t: () => {},
        $tc: () => {},
      },
      localVue,
      store,
      vuetify,
    });

    expect(
      wrapper.find(".time-wrapper .time:nth-child(1) .time-title")
    ).toBeTruthy();
  });

  test("displays remaining time title", () => {
    const wrapper = mount(TimeCounter, {
      mocks: {
        $t: () => {},
        $tc: () => {},
      },
      localVue,
      store,
      vuetify,
    });

    expect(
      wrapper.find(".time-wrapper .time:nth-child(2) .time-title")
    ).toBeTruthy();
  });

  test("displays elapsed time value", () => {
    const wrapper = mount(TimeCounter, {
      mocks: {
        $t: () => {},
        $tc: () => {},
      },
      localVue,
      store,
      vuetify,
    });

    expect(
      wrapper.find(".time-wrapper .time:nth-child(1) .time-value")
    ).toBeTruthy();
    expect(
      wrapper.find(".time-wrapper .time:nth-child(1) .time-value").text()
    ).toBe("00:00:00");
  });

  test("displays remaining time value", () => {
    const wrapper = mount(TimeCounter, {
      mocks: {
        $t: () => {},
        $tc: () => {},
      },
      localVue,
      store,
      vuetify,
    });

    expect(
      wrapper.find(".time-wrapper .time:nth-child(2) .time-value")
    ).toBeTruthy();
    expect(
      wrapper.find(".time-wrapper .time:nth-child(2) .time-value").text()
    ).toBe("00:00:00");
  });
});
