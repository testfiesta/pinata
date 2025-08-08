import Vuetify from "vuetify";
import MindmapEditor from "../MindmapEditor.vue";
import NodeEditDialog from "../dialogs/NodeEditDialog.vue";

import { mount, createLocalVue } from "@vue/test-utils";

const vuetify = new Vuetify();
const localVue = createLocalVue();

describe("MindmapEditor.vue", () => {
  test("render a view", () => {
    const wrapper = mount(MindmapEditor, {
      mocks: {
        $t: () => {},
        $tc: () => {},
      },
      localVue,
      vuetify,
    });

    expect(wrapper.find(".wrapper").exists()).toBe(true);
    expect(wrapper.findComponent(NodeEditDialog).exists()).toBe(true);
  });
});
