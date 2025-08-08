import Vuetify from "vuetify";
import AudioErrorDialog from "../AudioErrorDialog";
import LogoWrapper from "../../LogoWrapper";

import { mount, createLocalVue } from "@vue/test-utils";

describe("AudioErrorDialog.vue", () => {
  let vuetify;
  let localVue;
  let wrapper;
  let onClick;

  beforeEach(() => {
    const rootDiv = document.createElement("div");
    rootDiv.id = "root";
    document.body.appendChild(rootDiv);

    onClick = jest.fn();

    localVue = createLocalVue();
    vuetify = new Vuetify();

    const App = localVue.component("App", {
      components: { AudioErrorDialog },
      listeners: { onClick },
      data() {
        return {
          dialog: false,
        };
      },
      template: `
        <v-app>
          <AudioErrorDialog
            title="Error Recording Audio"
            text="An error occurred while recording the audio."
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
    expect(wrapper.find(".v-dialog").exists()).toBe(true);
    expect(wrapper.find(".v-card .v-card__title").exists()).toBe(true);
    expect(wrapper.find(".v-card .v-card__title").text()).toContain(
      "Error Recording Audio"
    );
    expect(wrapper.find(".v-card .v-card__text").exists()).toBe(true);
    expect(wrapper.find(".v-card .v-card__text").text()).toContain(
      "An error occurred while recording the audio."
    );
    expect(wrapper.find(".v-card .v-card__actions .v-btn").exists()).toBe(true);
  });

  test('trigger "OK" button click event', async () => {
    wrapper.setData({ dialog: true });

    await wrapper.vm.$nextTick();

    const button = wrapper.find(".v-card .v-card__actions .v-btn");
    button.vm.$on("click", onClick);
    button.trigger("click");

    expect(onClick).toHaveBeenCalled();
  });
});
