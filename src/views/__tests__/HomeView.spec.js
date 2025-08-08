import HomeView from "../HomeView";
import LogoWrapper from "../../components/LogoWrapper";

import { mount } from "@vue/test-utils";

describe("HomeView.vue", () => {
  test('displays "New session" button', () => {
    const wrapper = mount(HomeView, {
      mocks: {
        $t: () => {},
        $tc: () => {},
      },
      stubs: ["router-link"],
    });

    expect(wrapper.findComponent(LogoWrapper).exists()).toBe(true);

    expect(
      wrapper.find(".new-section .text-capitalize:nth-child(1)")
    ).toBeTruthy();
    // expect(wrapper.text()).toContain("New session");

    expect(
      wrapper.find(".open-section .text-capitalize:nth-child(1)")
    ).toBeTruthy();
    // expect(wrapper.text()).toContain("Open Saved Session");
  });

  test('trigger the click envent of "New Session" button', () => {
    const wrapper = mount(HomeView, {
      mocks: {
        $t: () => {},
        $tc: () => {},
      },
      stubs: ["router-link"],
    });

    const button = wrapper.find(".new-section .text-capitalize:nth-child(1)");
    const event = jest.fn();

    button.vm.$on("click", event);
    button.trigger("click");

    expect(event).toHaveBeenCalled();
  });

  test('trigger the click event of "Open Saved Session"', () => {
    const wrapper = mount(HomeView, {
      mocks: {
        $t: () => {},
        $tc: () => {},
      },
      stubs: ["router-link"],
    });

    const button = wrapper.find(".open-section .text-capitalize:nth-child(1)");
    const event = jest.fn();

    button.vm.$on("click", event);
    button.trigger("click");

    expect(event).toHaveBeenCalled();
  });
});
