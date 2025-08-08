import FileWrapper from "../FileWrapper";
import Vuetify from "vuetify";

import { mount } from "@vue/test-utils";

describe("FileWrapper.vue", () => {
  const vuetify = new Vuetify();

  test("load a view", () => {
    const wrapper = mount(FileWrapper, {
      mocks: {
        $t: () => {},
        $tc: () => {},
      },
      propsData: {
        item: {
          fileName: "test.pdf",
        },
      },
      vuetify,
    });

    expect(wrapper.find(".wrapper .file-icon").exists()).toBe(true);
    expect(wrapper.find(".wrapper p").exists()).toBe(true);
    expect(wrapper.find(".wrapper p").text()).toContain("test.pdf");
  });
});
