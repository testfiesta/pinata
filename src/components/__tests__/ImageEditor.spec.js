import Vuetify from "vuetify";
import ImageEditor from "../ImageEditor";

import { mount } from "@vue/test-utils";

const vuetify = new Vuetify();

describe("ImageEditor.vue", () => {
  test("render a view", () => {
    const wrapper = mount(ImageEditor, {
      mocks: {
        $t: () => {},
        $tc: () => {},
      },
      propsData: {
        item: {
          filePath: "",
        },
      },
      vuetify,
    });

    expect(wrapper.find(".image-editor").exists()).toBe(true);
  });
});
