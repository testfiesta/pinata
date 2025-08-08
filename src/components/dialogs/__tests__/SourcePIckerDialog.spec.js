import SourcePickerDialog from "../SourcePickerDialog";
import Vuetify from "vuetify";

import { mount, createLocalVue } from "@vue/test-utils";

let wrapper;
let vuetify;
let localVue;

describe("SourcePickerDialog", () => {
  beforeEach(() => {
    const rootDiv = document.createElement("div");
    rootDiv.id = "root";
    document.body.appendChild(rootDiv);

    localVue = createLocalVue();
    vuetify = new Vuetify();

    const App = localVue.component("App", {
      components: { SourcePickerDialog },
      data() {
        return {
          dialog: false,
        };
      },
      template: `
        <v-app>
          <SourcePickerDialog
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
    await wrapper.setData({ dialog: true });

    expect(wrapper.find(".header span").exists()).toBe(true);

    expect(wrapper.find(".content").exists()).toBe(true);
    expect(wrapper.findAll(".footer button").length).toBe(2);
  });

  test('trigger the click event of "Cancel" button', async () => {
    await wrapper.setData({ dialog: true });

    const button = wrapper.find(".footer button:first-child");
    const event = jest.fn();

    button.vm.$on("click", event);
    button.trigger("click");

    expect(event).toHaveBeenCalled();
  });

  test('trigger the click event of "Start Recording" button', async () => {
    await wrapper.setData({ dialog: true });

    const button = wrapper.find(".footer button:first-child");
    const event = jest.fn();

    button.vm.$on("click", event);
    button.trigger("click");

    expect(event).toHaveBeenCalled();
  });
});
