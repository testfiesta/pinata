import Vuetify from "vuetify";
import AuthenticationView from "../AuthenticationView.vue";

import { mount } from "@vue/test-utils";

const vuetify = new Vuetify();

describe("AutheticationView.vue", () => {
  test("render a view", () => {
    const wrapper = mount(AuthenticationView, {
      mocks: {
        $t: () => {},
        $tc: () => {},
      },
      vuetify,
    });

    expect(wrapper.find(".authentication-wrapper").exists()).toBe(true);
  });
});
