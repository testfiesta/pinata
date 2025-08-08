import Vuetify from "vuetify";
import ConnectionsTab from "../ConnectionsTab.vue";

import { mount, createLocalVue } from "@vue/test-utils";

const localVue = createLocalVue();
localVue.use(Vuetify);

const vuetify = new Vuetify();

describe("ConnectionsTabConnectionsTab.vue", () => {
  test("render a view", () => {
    const wrapper = mount(ConnectionsTab, {
      mocks: {
        $t: () => {},
        $tc: () => {},
      },
      propsData: {
        config: {},
      },
      data() {
        return {
          setting: {},
          row: null,
          color: "#1976D2FF",
          mask: "!#XXXXXXXX",
          menu: false,
        };
      },
      localVue,
      vuetify,
    });

    expect(wrapper.find(".content-wrapper").exists()).toBe(true);
    expect(wrapper.find(".content-wrapper .ext-conn-section").exists()).toBe(
      true
    );
    expect(wrapper.findAll(".content-wrapper .ext-conn-section a").length).toBe(
      2
    );

    expect(wrapper.find(".content-wrapper .app-role-section").exists()).toBe(
      true
    );
    expect(
      wrapper
        .find(".content-wrapper .app-role-section .switch-control")
        .exists()
    ).toBe(true);

    // expect(wrapper.find(".content-wrapper .color-panel-section").exists()).toBe(
    //   true
    // );
    // expect(
    //   wrapper.find(".content-wrapper .color-panel-section input").exists()
    // ).toBe(true);

    // expect(wrapper.find(".content-wrapper .cur-org-section").exists()).toBe(
    //   true
    // );
    // expect(
    //   wrapper.find(".content-wrapper .cur-org-section input").exists()
    // ).toBe(true);
    // expect(
    //   wrapper.findAll(".content-wrapper .cur-org-section button").length
    // ).toBe(5);
    // expect(
    //   wrapper.find(".content-wrapper .cur-org-section button.add-btn").exists()
    // ).toBe(true);
  });

  // test('trigger the click event of "add org button"', () => {
  //   const wrapper = mount(ConnectionsTab, {
  //     propsData: {
  //       config: {},
  //     },
  //     data() {
  //       return {
  //         setting: {},
  //         row: null,
  //         color: "#1976D2FF",
  //         mask: "!#XXXXXXXX",
  //         menu: false,
  //       };
  //     },
  //     localVue,
  //     vuetify,
  //   });

  //   const event = jest.fn();
  //   const addBtn = wrapper.find(
  //     ".content-wrapper .cur-org-section button.add-btn"
  //   );

  //   addBtn.vm.$on("click", event);
  //   addBtn.trigger("click");

  //   expect(event).toHaveBeenCalled();
  // });
});
