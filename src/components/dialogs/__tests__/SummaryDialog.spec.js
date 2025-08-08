import Vuetify from "vuetify";
import SummaryDialog from "../SummaryDialog.vue";

import { mount, createLocalVue } from "@vue/test-utils";

let vuetify;
let wrapper;
let localVue;

describe("SummaryDialog.vue", () => {
  beforeEach(() => {
    const rootDiv = document.createElement("div");
    rootDiv.id = "root";
    document.body.appendChild(rootDiv);

    localVue = createLocalVue();
    vuetify = new Vuetify();

    const App = localVue.component("App", {
      components: { SummaryDialog },
      data() {
        return {
          dialog: false,
        };
      },
      template: `
        <v-app>
          <SummaryDialog
            title="Confirm Reset"
            text="Are you sure you want to reset?"
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

  test("render a view", async () => {
    wrapper.setData({ dialog: true });

    await wrapper.vm.$nextTick();

    expect(wrapper.find(".dialog-title").exists()).toBe(true);
    expect(wrapper.find(".container").exists()).toBe(true);
    expect(wrapper.find(".container .subtitle-2").exists()).toBe(true);
    expect(wrapper.find(".container input").exists()).toBe(true);
    expect(wrapper.find(".container button").exists()).toBe(true);
    expect(wrapper.findAll(".action-wrapper button").length).toBe(2);
  });

  test('trigger the click event of "dicard" button', async () => {
    wrapper.setData({ dialog: true });

    await wrapper.vm.$nextTick();

    const event = jest.fn();
    const button = wrapper.find(".action-wrapper button:first-child");

    button.vm.$on("click", event);
    button.trigger("click");

    expect(event).toHaveBeenCalled();
  });

  test('trigger the click event of "save" button', async () => {
    wrapper.setData({ dialog: true });

    await wrapper.vm.$nextTick();

    const event = jest.fn();
    const button = wrapper.find(".action-wrapper button:last-child");

    button.vm.$on("click", event);
    button.trigger("click");

    expect(event).toHaveBeenCalled();
  });

  test('trigger the click event of "clear" button', async () => {
    wrapper.setData({ dialog: true });

    await wrapper.vm.$nextTick();

    const event = jest.fn();
    const button = wrapper.find(".container button");

    button.vm.$on("click", event);
    button.trigger("click");

    expect(event).toHaveBeenCalled();
  });
});
