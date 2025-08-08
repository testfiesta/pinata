import Vuetify from "vuetify";
import WorkspaceWrapper from "../WorkspaceWrapper.vue";
import NotesWrapper from "../NotesWrapper.vue";
import TimelineWrapper from "../TimelineWrapper.vue";

import { shallowMount } from "@vue/test-utils";

const vuetify = new Vuetify();

describe("WorkspaceWrapper.vue", () => {
  test("render a view", () => {
    const wrapper = shallowMount(WorkspaceWrapper, {
      mocks: {
        $t: () => {},
        $tc: () => {},
      },
      propsData: {
        items: [],
        selectedItems: [],
        eventType: "",
      },
      vuetify,
    });

    expect(wrapper.find(".tab-bar .timeline-tab").exists()).toBe(true);
    expect(wrapper.find(".tab-bar .notes-tab").exists()).toBe(true);
    expect(wrapper.findComponent(NotesWrapper).exists()).toBe(true);
    expect(wrapper.findComponent(TimelineWrapper).exists()).toBe(true);
  });
});
