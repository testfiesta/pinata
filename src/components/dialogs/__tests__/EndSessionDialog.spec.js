import Vuetify from "vuetify";
import CheckTaskWrapper from "../../CheckTaskWrapper.vue";
import EndSessionDialog from "../EndSessionDialog.vue";

import { mount, createLocalVue } from "@vue/test-utils";

let vuetify;
let wrapper;
let localVue;

describe("EndSessionDialog.vue", () => {
  beforeEach(() => {
    const rootDiv = document.createElement("div");
    rootDiv.id = "root";
    document.body.appendChild(rootDiv);

    localVue = createLocalVue();

    vuetify = new Vuetify();

    const App = localVue.component("App", {
      components: { EndSessionDialog },
      data() {
        return {
          dialog: false,
          showTaskError: false,
        };
      },
      template: `
        <v-app>
          <EndSessionDialog
            ref="dialog"
            v-model="dialog"
            type="postsession"
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
    wrapper.setData({
      dialog: true,
    });

    await wrapper.vm.$nextTick();

    expect(wrapper.findComponent(CheckTaskWrapper).exists()).toBe(true);
    expect(wrapper.find(".btn-end").exists()).toBe(true);
  });

  test('trigger the click event of "End Session" button', async () => {
    wrapper.setData({
      dialog: true,
    });

    await wrapper.vm.$nextTick();

    const button = wrapper.find(".btn-end");
    const event = jest.fn();

    button.vm.$on("click", event);
    button.trigger("click");

    expect(event).toHaveBeenCalled();
  });
});
