import { mount } from "@vue/test-utils";
import Vuetify from "vuetify";

import SearchWrapper from "../SearchWrapper.vue";

const vuetify = new Vuetify();

describe("SearchWrapper.vue", () => {
  test("load serach box", () => {
    const wrapper = mount(SearchWrapper, {
      mocks: {
        $t: () => {},
        $tc: () => {},
      },
      vuetify,
    });

    const searchInput = wrapper.find("input");
    expect(searchInput.exists()).toBe(true);
  });

  test("change the value of searchbox", async () => {
    const wrapper = mount(SearchWrapper, {
      mocks: {
        $t: () => {},
        $tc: () => {},
      },
      vuetify,
    });

    const searchInput = wrapper.find("input");
    await searchInput.setValue("Search");

    expect(wrapper.vm.search).toBe("Search");
  });
});
