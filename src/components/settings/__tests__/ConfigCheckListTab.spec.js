import Vuetify from "vuetify";
import Vuex from "vuex";
import storeConfig from "@/store/store-config";
import ConfigCheckListTab from "../ConfigCheckListTab.vue";

import { mount, createLocalVue } from "@vue/test-utils";
import { cloneDeep } from "lodash";

const localVue = createLocalVue();
localVue.use(Vuex);

const vuetify = new Vuetify();

describe("ConfigCheckListTab.vue", () => {
  let wrapper;
  let store;
  beforeEach(() => {
    store = new Vuex.Store(cloneDeep(storeConfig));
  });

  test("render a view", () => {
    wrapper = mount(ConfigCheckListTab, {
      mocks: {
        $t: () => {},
        $tc: () => {},
      },
      data() {
        return {
          preTaskList: [],
          postTaskList: [],
          presessionStatus: false,
          postsessionStatus: false,
          tab: "pre",
        };
      },
      propsData: {
        config: {
          checklist: {
            presession: {
              status: false,
              tasks: [],
            },
            postsession: {
              status: false,
              tasks: [],
            },
          },
        },
      },
      localVue,
      store,
      vuetify,
    });

    expect(wrapper.find(".wrapper > .title").exists()).toBe(true);
    expect(wrapper.findAll(".wrapper .v-tab").length).toBe(2);
    expect(wrapper.find(".wrapper #pre").exists()).toBe(true);
    expect(wrapper.find(".wrapper #post").exists()).toBe(false);
  });

  test("show a presession tab view", async () => {
    wrapper = mount(ConfigCheckListTab, {
      mocks: {
        $t: () => {},
        $tc: () => {},
      },
      data() {
        return {
          preTaskList: [],
          postTaskList: [],
          presessionStatus: false,
          postsessionStatus: false,
          tab: "pre",
        };
      },
      propsData: {
        config: {
          checklist: {
            presession: {
              status: false,
              tasks: [],
            },
            postsession: {
              status: false,
              tasks: [],
            },
          },
        },
      },
      localVue,
      vuetify,
    });

    expect(wrapper.find("#pre .status").exists()).toBe(true);
    expect(wrapper.find("#pre .content").exists()).toBe(true);
    expect(wrapper.find("#pre .content .overlay").exists()).toBe(true);
    expect(wrapper.findAll("#pre .content .check-list .one").length).toBe(1);

    await wrapper.setData({
      presessionStatus: true,
      preTaskList: [{ id: 1, reuquired: false, content: "" }],
    });

    expect(wrapper.find("#pre .content .overlay").exists()).toBe(true);
    expect(wrapper.findAll("#pre .content .check-list .one").length).toBe(1);

    const event = jest.fn();
    const button = wrapper.find("#pre .content button");

    expect(button.exists()).toBe(true);

    button.vm.$on("click", event);
    button.trigger("click");

    // expect(event).toHaveBeenCalled();
  });

  test("show a postsession tab view", async () => {
    wrapper = mount(ConfigCheckListTab, {
      mocks: {
        $t: () => {},
        $tc: () => {},
      },
      data() {
        return {
          preTaskList: [],
          postTaskList: [],
          presessionStatus: false,
          postsessionStatus: true,
          tab: "post",
        };
      },
      propsData: {
        config: {
          checklist: {
            presession: {
              status: false,
              tasks: [],
            },
            postsession: {
              status: false,
              tasks: [],
            },
          },
        },
      },
      localVue,
      vuetify,
    });

    await wrapper.setData({
      tab: "post",
      postsessionStatus: true,
      postTaskList: [{ id: 1, reuquired: false, content: "" }],
    });

    expect(wrapper.find("#post").exists()).toBe(true);
    expect(wrapper.find("#post .content .overlay").exists()).toBe(true);
    expect(wrapper.findAll("#post .content .check-list .one").length).toBe(1);

    // const event = jest.fn();
    const button = wrapper.find("#post .footer button");

    expect(button.exists()).toBe(true);

    // button.vm.$on("click", event);
    // button.trigger("click");

    // expect(event).toHaveBeenCalled(true);
  });
});
