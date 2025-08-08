import { mount, createLocalVue } from "@vue/test-utils";
import Vuex from "vuex";
import Vuetify from "vuetify";
import { cloneDeep } from "lodash";

import TestWrapper from "../TestWrapper";
import MindmapEditor from "../MindmapEditor";
import storeConfig from "../../store/store-config";

const vuetify = new Vuetify();
const localVue = createLocalVue();

localVue.use(Vuex);

describe("TestWrapper.vue", () => {
  let store;

  beforeEach(() => {
    store = new Vuex.Store(cloneDeep(storeConfig));
  });

  test("loads test wrapper", () => {
    const wrapper = mount(TestWrapper, {
      mocks: {
        $t: () => {},
        $tc: () => {},
      },
      data() {
        return {
          duration: "10:05",
        };
      },
      localVue,
      store: {
        ...store,
        state: {
          ...store.state,
          title: "title",
        },
      },
      vuetify,
    });

    expect(wrapper.findAll(".title .subtitle-2.label-text").length).toBe(1);
    expect(wrapper.find(".title input").exists()).toBe(true);
    expect(wrapper.findAll(".timelimit .subtitle-2.label-text").length).toBe(1);
    expect(wrapper.find(".timelimit input").exists()).toBe(true);

    // expect(wrapper.find(".title .subtitle-2.label-text").text()).toContain(
    //   "Title"
    // );
    // expect(wrapper.find(".timelimit .subtitle-2.label-text").text()).toContain(
    //   "Time limit"
    // );

    const charterTabWrapper = wrapper.find(".charter-tab");
    expect(charterTabWrapper.findComponent(MindmapEditor).exists()).toBe(false);
    expect(wrapper.find(".pre-cond").exists()).toBe(true);
  });

  test('change the value of "Time limit" input box', async () => {
    const wrapper = mount(TestWrapper, {
      mocks: {
        $t: () => {},
        $tc: () => {},
      },
      data() {
        return {
          duration: "10:05",
        };
      },
      localVue,
      store: {
        ...store,
        state: {
          ...store.state,
        },
      },
      vuetify,
    });

    const timelineInput = wrapper.find(".timelimit input");
    await timelineInput.setValue("Test");

    expect(wrapper.vm.duration).toBe("Test");
  });

  test('change the value of "Title" input box', async () => {
    const wrapper = mount(TestWrapper, {
      mocks: {
        $t: () => {},
        $tc: () => {},
      },
      data() {
        return {
          duration: "10:05",
        };
      },
      localVue,
      store: {
        ...store,
        state: {
          ...store.state,
        },
      },
      vuetify,
    });

    const titleInput = wrapper.find(".title input");
    await titleInput.setValue("Test");

    expect(wrapper.vm.title).toBe("Test");
  });

  test('change the value of "Timelimit" input box', async () => {
    const wrapper = mount(TestWrapper, {
      mocks: {
        $t: () => {},
        $tc: () => {},
      },
      data() {
        return {
          duration: "10:05",
        };
      },
      localVue,
      store: {
        ...store,
        state: {
          ...store.state,
        },
      },
      vuetify,
    });

    const timelimitInput = wrapper.find(".timelimit input");
    await timelimitInput.setValue("10:00");

    expect(wrapper.vm.duration).toBe("10:00");
  });
});
