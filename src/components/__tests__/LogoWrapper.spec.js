import { mount } from "@vue/test-utils";

import LogoWrapper from "../LogoWrapper";

describe("LogoWrapper.vue", () => {
  test("displays logo", () => {
    const wrapper = mount(LogoWrapper);

    expect(wrapper.find(".v-image")).toBeTruthy();

    const images = wrapper.findAll(".v-image");
    expect(images.length).toBe(1);
  });
});
