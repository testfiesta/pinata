import Vuetify from "vuetify";
import Vuex from "vuex";

import ResultView from "../ResultView";
import SearchWrapper from "../../components/SearchWrapper";
import WorkspaceWrapper from "../../components/WorkspaceWrapper";
import LogoWrapper from "../../components/LogoWrapper";
import TestWrapper from "../../components/TestWrapper";
import ExportPanel from "../../components/ExportPanel";
import ControlPanel from "../../components/ControlPanel";
import ReviewWrapper from "../../components/ReviewWrapper.vue";

import storeConfig from "@/store/store-config";

import { mount, createLocalVue } from "@vue/test-utils";
import { cloneDeep } from "lodash";

import { TEXT_TYPES } from "../../modules/constants";

const vuetify = new Vuetify();
const localVue = createLocalVue();

localVue.use(Vuex);

describe("ResultView.vue", () => {
  let store;

  beforeEach(() => {
    store = new Vuex.Store(cloneDeep(storeConfig));
  });

  test("render view", () => {
    const wrapper = mount(ResultView, {
      mocks: {
        $t: () => {},
        $tc: () => {},
      },
      data() {
        return {
          items: [],
          activeSession: { comment: "" },
          commentTypes: Object.keys(TEXT_TYPES),
          type: "Comment",
          search: "",
          selected: [],
        };
      },
      localVue,
      vuetify,
      store,
    });

    expect(wrapper.find(".d-flex")).toBeTruthy();
    expect(wrapper.findComponent(LogoWrapper).exists()).toBe(true);
    expect(wrapper.findComponent(TestWrapper).exists()).toBe(true);
    expect(wrapper.findComponent(ExportPanel).exists()).toBe(true);
    expect(wrapper.findComponent(SearchWrapper).exists()).toBe(true);
    expect(wrapper.findComponent(WorkspaceWrapper).exists()).toBe(true);
    expect(wrapper.findComponent(ControlPanel).exists()).toBe(true);
    expect(wrapper.findComponent(ReviewWrapper).exists()).toBe(true);
    expect(wrapper.find(".comment-wrapper button").exists()).toBe(true);
  });

  test('trigger the click event of "Clear" button', async () => {
    const wrapper = mount(ResultView, {
      mocks: {
        $t: () => {},
        $tc: () => {},
      },
      data() {
        return {
          items: [],
          activeSession: { comment: "" },
          commentTypes: Object.keys(TEXT_TYPES),
          type: "Comment",
          search: "",
          selected: [],
        };
      },
      localVue,
      vuetify,
      store,
    });

    const button = wrapper.find(".comment-wrapper button");
    const event = jest.fn();

    button.vm.$on("click", event);
    button.trigger("click");

    expect(event).toHaveBeenCalled();
  });
});
