import { mount } from "@vue/test-utils";
import Vuetify from "vuetify";

import ExportPanel from "../ExportPanel.vue";

const vuetify = new Vuetify();

describe("ExportPanel.vue", () => {
  const items = [];

  test("Display buttons", () => {
    const wrapper = mount(ExportPanel, {
      mocks: {
        $t: () => {},
        $tc: () => {},
      },
      propsData: {
        items: items,
      },
      vuetify,
    });

    expect(wrapper.find("button.v-btn").exists()).toBe(true);
  });

  test('trigger the click event of "export session report" button', async () => {
    const wrapper = mount(ExportPanel, {
      mocks: {
        $t: () => {},
        $tc: () => {},
      },
      items: items,
      vuetify,
    });

    const button = wrapper.find("button.v-btn");
    const event = jest.fn();

    button.vm.$on("click", event);
    button.trigger("click");

    expect(event).toHaveBeenCalled();
  });
});
