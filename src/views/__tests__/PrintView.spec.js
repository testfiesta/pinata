import Vuetify from "vuetify";
import Vuex from "vuex";

import PrintView from "../PrintView";
import storeConfig from "@/store/store-config";

import { mount, createLocalVue } from "@vue/test-utils";
import { cloneDeep } from "lodash";

const vuetify = new Vuetify();
const items = [];
const selected = [];
const localVue = createLocalVue();

localVue.use(Vuex);

// const formatTime = (timer) => {
//   const seconds = ("0" + (timer % 60)).slice(-2);
//   const minutes = ("0" + (parseInt(timer / 60, 10) % 60)).slice(-2);
//   const hours = ("0" + (parseInt(timer / 3600, 10) % 24)).slice(-2);

//   return hours + ":" + minutes + ":" + seconds;
// };

describe("PrintView.vue", () => {
  let store;

  beforeEach(() => {
    store = new Vuex.Store(cloneDeep(storeConfig));
  });

  test("render view", () => {
    const wrapper = mount(PrintView, {
      mocks: {
        $t: () => {},
        $tc: () => {},
      },
      data() {
        return {
          items,
          titie: "",
          charter: "",
          precondition: "",
          window: "",
          screenWidth: "",
          screenHeight: "",
          selected,
          timer: "10287209",
        };
      },
      store: {
        ...store,
        state: {
          ...store.state,
        },
      },
      localVue,
      vuetify,
    });

    expect(wrapper.find(".header").exists()).toBe(true);
    expect(wrapper.find(".header img").exists()).toBe(true);
    expect(wrapper.find(".content .timeline").exists()).toBe(true);
    expect(wrapper.find(".content .detail").exists()).toBe(true);

    expect(wrapper.find(".duration-text span").text()).toContain("");
    expect(wrapper.find(".detail .title").exists()).toBe(true);
    expect(wrapper.find(".detail .charter").exists()).toBe(true);
    expect(wrapper.find(".detail .pre-condition").exists()).toBe(true);
    expect(wrapper.find(".detail .session-time").exists()).toBe(true);
    expect(wrapper.find(".detail .session-elapsed-time").exists()).toBe(true);
    expect(wrapper.find(".detail .environment").exists()).toBe(true);
  });
});
