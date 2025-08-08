import { mount, createLocalVue } from "@vue/test-utils";
import Vuex from "vuex";
import Vuetify from "vuetify";
import { cloneDeep } from "lodash";

import TimelineWrapper from "../TimelineWrapper";
import storeConfig from "../../store/store-config";

const vuetify = new Vuetify();
const localVue = createLocalVue();

localVue.use(Vuex);

describe("TimelineWrapper.vue", () => {
  const dataInfo = {
    itemLists: [
      {
        sessionType: "Screenshot",
        comment: {
          type: "",
          text: "",
        },
      },
    ],
    selected: [],
    activeItem: {},
  };

  let store;

  beforeEach(() => {
    store = new Vuex.Store(cloneDeep(storeConfig));
  });

  test("render a view", () => {
    const wrapper = mount(TimelineWrapper, {
      mocks: {
        $t: () => {},
        $tc: () => {},
      },
      propsData: {
        items: [],
        selectedItems: [],
      },
      data() {
        return dataInfo;
      },
      localVue,
      store: {
        ...store,
        state: {
          ...store.state,
          started: "11-08-2022",
          timer: 10298359,
        },
      },
      vuetify,
    });

    expect(wrapper.find(".subtitle-2.label-text")).toBeTruthy();

    expect(wrapper.find(".date-text span").text()).toContain("11-08-2022");
    expect(wrapper.find(".timeline-wrap").exists()).toBe(true);

    expect(wrapper.find(".duration-text span").text()).toContain(
      wrapper.vm.formatTime
    );
    expect(wrapper.find("button").exists()).toBe(false);

    expect(wrapper.findAll(".drag-item").length).toBe(1);
  });

  test('show the "Upload evidence" button', () => {
    const wrapper = mount(TimelineWrapper, {
      mocks: {
        $t: () => {},
        $tc: () => {},
      },
      propsData: {
        items: [],
        selectedItems: [],
        activeSession: {},
      },
      data() {
        return dataInfo;
      },
      localVue,
      store: {
        ...store,
        state: {
          ...store.state,
          status: "start",
        },
      },
      vuetify,
    });

    expect(wrapper.find("button").exists()).toBe(true);
  });

  test('trigger the "Upload evidence" button', () => {
    const wrapper = mount(TimelineWrapper, {
      mocks: {
        $t: () => {},
        $tc: () => {},
      },
      propsData: {
        items: [],
        selectedItems: [],
        activeSession: {},
      },
      data() {
        return dataInfo;
      },
      localVue,
      store: {
        ...store,
        state: {
          ...store.state,
          status: "start",
        },
      },
      vuetify,
    });

    const event = jest.fn();
    const button = wrapper.find("button");

    button.vm.$on("click", event);
    button.trigger("click");

    expect(event).toHaveBeenCalled();
  });

  test("render a timeline", async () => {
    const wrapper = mount(TimelineWrapper, {
      mocks: {
        $t: () => {},
        $tc: () => {},
      },
      data() {
        return dataInfo;
      },
      localVue,
      store: {
        ...store,
        state: {
          ...store.state,
          status: "start",
        },
      },
      vuetify,
    });

    expect(wrapper.findAll(".drag-item").length).toBe(1);
    expect(wrapper.findAll(".drag-item .screenshot").exists()).toBe(true);

    await wrapper.setData({
      itemLists: [
        {
          sessionType: "Video",
          comment: {
            type: "",
            text: "",
          },
        },
      ],
    });

    expect(wrapper.find(".drag-item .video-wrapper").exists()).toBe(true);

    await wrapper.setData({
      itemLists: [
        {
          sessionType: "Audio",
          comment: {
            type: "",
            text: "",
          },
        },
      ],
    });

    expect(wrapper.find(".drag-item .audio-wrapper").exists()).toBe(true);

    await wrapper.setData({
      itemLists: [
        {
          sessionType: "File",
          comment: {
            type: "",
            text: "",
          },
        },
      ],
    });

    expect(wrapper.find(".drag-item .file-wrapper").exists()).toBe(true);

    await wrapper.setData({
      itemLists: [
        {
          sessionType: "Note",
          comment: {
            type: "",
            text: "",
            tags: [{ text: "" }],
          },
        },
      ],
    });

    expect(wrapper.find(".drag-item .note-wrapper").exists()).toBe(true);
    expect(wrapper.find(".drag-item .tags-wrapper").exists()).toBe(true);

    await wrapper.setData({
      itemLists: [
        {
          sessionType: "Mindmap",
          comment: {
            type: "",
            text: "",
          },
        },
      ],
    });

    expect(wrapper.find(".drag-item .map-wrapper").exists()).toBe(true);
  });
});
