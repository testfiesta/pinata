import Vuetify from "vuetify";

import DurationConfirmDialog from "../DurationConfirmDialog";
import LogoWrapper from "../../LogoWrapper";

import { mount, createLocalVue } from "@vue/test-utils";

let vuetify;
let wrapper;
let localVue;

describe("DurationConfirmDialog.vue", () => {
  beforeEach(() => {
    const rootDiv = document.createElement("div");
    rootDiv.id = "root";
    document.body.appendChild(rootDiv);

    localVue = createLocalVue();
    vuetify = new Vuetify();

    const App = localVue.component("App", {
      components: { DurationConfirmDialog },
      data() {
        return {
          dialog: false,
        };
      },
      template: `
        <v-app>
          <DurationConfirmDialog
            title="Session Time"
            text="Do you want to proceed with testing or end the test session?"
            ref="dialog"
            v-model="dialog"
          />
        </v-app>
      `,
    });

    wrapper = mount(App, {
      mocks: {
        $t: () => {},
        $tc: () => {},
      },
      localVue,
      vuetify,
      attachTo: "#root",
    });
  });

  test("render a dialog", async () => {
    wrapper.setData({ dialog: true });

    await wrapper.vm.$nextTick();

    expect(wrapper.findComponent(LogoWrapper).exists()).toBe(true);
    expect(wrapper.find(".title").exists()).toBe(true);
    expect(wrapper.find(".title").text()).toContain("Session Time");
    expect(wrapper.find(".text").exists()).toBe(true);

    expect(wrapper.findAll(".btn").length).toBe(2);
  });

  test('trigger the click event of "Procced" button', async () => {
    wrapper.setData({ dialog: true });

    await wrapper.vm.$nextTick();

    const button = wrapper.find(".btn:first-child");
    const event = jest.fn();

    button.vm.$on("click", event);
    button.trigger("click");

    expect(event).toHaveBeenCalled();
  });

  test('trigger the click event of "Cancel" button', async () => {
    wrapper.setData({ dialog: true });

    await wrapper.vm.$nextTick();

    const button = wrapper.find(".btn:last-child");
    const event = jest.fn();

    button.vm.$on("click", event);
    button.trigger("click");

    expect(event).toHaveBeenCalled();
  });
});
