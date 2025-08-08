import Vuetify from "vuetify";

import LogoWrapper from "../../LogoWrapper";
import DeleteConfirmDialog from "../DeleteConfirmDialog";

import { mount, createLocalVue } from "@vue/test-utils";

let vuetify;
let wrapper;
let localVue;

describe("Delete.vue", () => {
  beforeEach(() => {
    const rootDiv = document.createElement("div");
    rootDiv.id = "root";
    document.body.appendChild(rootDiv);

    localVue = createLocalVue();
    vuetify = new Vuetify();

    const App = localVue.component("App", {
      components: { DeleteConfirmDialog },
      data() {
        return {
          dialog: false,
        };
      },
      template: `
        <v-app>
          <DeleteConfirmDialog
            title="Confirm delete"
            text="Are you sure you want to delete?"
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
    expect(wrapper.find(".text").exists()).toBe(true);
    expect(wrapper.findAll(".btn").length).toBe(2);
  });

  test('trigger the click event of "Confirm" button', async () => {
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
