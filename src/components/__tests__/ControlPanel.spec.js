import Vuetify from "vuetify";
import Vuex from "vuex";
import VueRouter from "vue-router";

import ControlPanel from "../ControlPanel.vue";
import SourcePickerDialog from "../dialogs/SourcePickerDialog.vue";
import NoteDialog from "../dialogs/NoteDialog.vue";
import DeleteConfirmDialog from "../dialogs/DeleteConfirmDialog.vue";
import ResetConfirmDialog from "../dialogs/ResetConfirmDialog.vue";
import NewSessionDialog from "../dialogs/NewSessionDialog.vue";
import DurationConfirmDialog from "../dialogs/DurationConfirmDialog.vue";
import AudioErrorDialog from "../dialogs/AudioErrorDialog.vue";
import EndSessionDialog from "../dialogs/EndSessionDialog.vue";
import storeConfig from "@/store/store-config";

import { mount, createLocalVue } from "@vue/test-utils";
import { cloneDeep } from "lodash";
import { SESSION_STATUSES } from "../../modules/constants";

const vuetify = new Vuetify();
const localVue = createLocalVue();
localVue.use(Vuex);
localVue.use(VueRouter);

const router = new VueRouter();

describe("ControlPanel.vue", () => {
  const dataInfo = {
    selected: [],
  };

  let store;

  beforeEach(() => {
    store = new Vuex.Store(cloneDeep(storeConfig));
  });

  test('displays "Start Session" button', () => {
    const wrapper = mount(ControlPanel, {
      mocks: {
        $t: () => {},
        $tc: () => {},
      },
      data() {
        return dataInfo;
      },
      propsData: {
        postSessionData: {
          status: true,
          tasks: [],
        },
        configItem: {
          checklist: {
            presession: {
              status: false,
              tasks: [],
            },
            postsession: {
              status: false,
              tasks: [],
            },
          },
        },
      },
      localVue,
      router,
      store: {
        ...store,
        state: {
          status: SESSION_STATUSES.PENDING,
        },
      },
      vuetify,
    });

    expect(wrapper.findComponent(SourcePickerDialog).exists()).toBe(true);
    expect(wrapper.findComponent(NoteDialog).exists()).toBe(true);
    expect(wrapper.findComponent(DeleteConfirmDialog).exists()).toBe(true);
    expect(wrapper.findComponent(ResetConfirmDialog).exists()).toBe(true);
    expect(wrapper.findComponent(NewSessionDialog).exists()).toBe(true);
    expect(wrapper.findComponent(DurationConfirmDialog).exists()).toBe(true);
    expect(wrapper.findComponent(AudioErrorDialog).exists()).toBe(true);
    expect(wrapper.findComponent(EndSessionDialog).exists()).toBe(true);

    expect(wrapper.find("#btn_new_session").exists()).toBe(true);
  });

  test('displays "Delete", "Export" buttons', () => {
    const wrapper = mount(ControlPanel, {
      mocks: {
        $t: () => {},
        $tc: () => {},
      },
      data() {
        return {
          selected: ["selected"],
        };
      },
      propsData: {
        postSessionData: {
          status: true,
          tasks: [],
        },
        configItem: {
          checklist: {
            presession: {
              status: false,
              tasks: [],
            },
            postsession: {
              status: false,
              tasks: [],
            },
          },
        },
      },
      localVue,
      router,
      store: {
        ...store,
        state: {
          ...store.state,
          status: SESSION_STATUSES.PENDING,
        },
      },
      vuetify,
    });

    expect(wrapper.find("#btn_delete").exists()).toBe(true);
    expect(wrapper.find("#btn_download").exists()).toBe(true);
  });

  test("displays icon buttons", async () => {
    const wrapper = mount(ControlPanel, {
      mocks: {
        $t: () => {},
        $tc: () => {},
      },
      data() {
        return {
          selected: ["selected"],
        };
      },
      propsData: {
        postSessionData: {
          status: true,
          tasks: [],
        },
        configItem: {
          checklist: {
            presession: {
              status: false,
              tasks: [],
            },
            postsession: {
              status: false,
              tasks: [],
            },
          },
        },
      },
      localVue,
      router,
      store: {
        ...store,
        state: {
          ...store.state,
          status: SESSION_STATUSES.START,
        },
      },
      vuetify,
    });

    expect(wrapper.find("#btn_resume").exists()).toBe(false);
    expect(wrapper.find("#btn_save").exists()).toBe(false);
    expect(wrapper.find("#btn_reset").exists()).toBe(false);

    expect(wrapper.find("#btn_pause_session").exists()).toBe(true);
    expect(wrapper.find("#btn_resume_session").exists()).toBe(false);
    expect(wrapper.find("#btn_end_session").exists()).toBe(true);
    expect(wrapper.find("#btn_start_record_video").exists()).toBe(true);
    expect(wrapper.find("#btn_stop_record_video").exists()).toBe(false);
    expect(wrapper.find("#btn_screenshot").exists()).toBe(true);
    expect(wrapper.find("#btn_start_record_audio").exists()).toBe(true);
    expect(wrapper.find("#btn_stop_record_audio").exists()).toBe(false);
    expect(wrapper.find("#btn_note").exists()).toBe(true);
  });

  test('show the "pause", "reset", "new session" buttons', () => {
    const wrapper = mount(ControlPanel, {
      mocks: {
        $t: () => {},
        $tc: () => {},
      },
      data() {
        return {
          selected: ["selected"],
        };
      },
      propsData: {
        configItem: {
          checklist: {
            presession: {
              status: false,
              tasks: [],
            },
            postsession: {
              status: false,
              tasks: [],
            },
          },
        },
        viewMode: "normal",
      },
      localVue,
      router,
      store: {
        ...store,
        state: {
          ...store.status,
          status: SESSION_STATUSES.END,
        },
      },
      vuetify,
    });

    expect(wrapper.find("#btn_resume").exists()).toBe(true);
    expect(wrapper.find("#btn_save").exists()).toBe(true);
    expect(wrapper.find("#btn_reset").exists()).toBe(true);
  });

  test('trigger the click event of "new session" button', () => {
    const wrapper = mount(ControlPanel, {
      mocks: {
        $t: () => {},
        $tc: () => {},
      },
      propsData: {
        configItem: {
          checklist: {
            presession: {
              status: false,
              tasks: [],
            },
            postsession: {
              status: false,
              tasks: [],
            },
          },
        },
        viewMode: "normal",
      },
      localVue,
      router,
      store: {
        ...store,
        state: {
          status: SESSION_STATUSES.PENDING,
        },
      },
      vuetify,
    });

    const button = wrapper.find("#btn_new_session");
    const event = jest.fn();

    button.vm.$on("click", event);
    button.trigger("click");

    expect(event).toHaveBeenCalled();
  });

  test('trigger the click event of "delete" button', () => {
    const wrapper = mount(ControlPanel, {
      mocks: {
        $t: () => {},
        $tc: () => {},
      },
      data() {
        return {
          selected: ["selected"],
        };
      },
      propsData: {
        configItem: {
          checklist: {
            presession: {
              status: false,
              tasks: [],
            },
            postsession: {
              status: false,
              tasks: [],
            },
          },
        },
        viewMode: "normal",
      },
      localVue,
      router,
      store: {
        ...store,
        state: {
          status: SESSION_STATUSES.START,
        },
      },
      vuetify,
    });

    const button = wrapper.find("#btn_delete");
    const event = jest.fn();

    button.vm.$on("click", event);
    button.trigger("click");

    expect(event).toHaveBeenCalled();
  });

  test('trigger the click event of "download" button', () => {
    const wrapper = mount(ControlPanel, {
      mocks: {
        $t: () => {},
        $tc: () => {},
      },
      data() {
        return {
          selected: ["selected"],
        };
      },
      propsData: {
        configItem: {
          checklist: {
            presession: {
              status: false,
              tasks: [],
            },
            postsession: {
              status: false,
              tasks: [],
            },
          },
        },
        viewMode: "normal",
      },
      localVue,
      router,
      store: {
        ...store,
        state: {
          status: SESSION_STATUSES.START,
        },
      },
      vuetify,
    });

    const button = wrapper.find("#btn_download");
    const event = jest.fn();

    button.vm.$on("click", event);
    button.trigger("click");

    expect(event).toHaveBeenCalled();
  });

  test('trigger the click event of "resume" button', () => {
    const wrapper = mount(ControlPanel, {
      mocks: {
        $t: () => {},
        $tc: () => {},
      },
      propsData: {
        configItem: {
          checklist: {
            presession: {
              status: false,
              tasks: [],
            },
            postsession: {
              status: false,
              tasks: [],
            },
          },
        },
        viewMode: "normal",
      },
      localVue,
      router,
      store: {
        ...store,
        state: {
          status: SESSION_STATUSES.END,
        },
      },
      vuetify,
    });

    const button = wrapper.find("#btn_resume");
    const event = jest.fn();

    button.vm.$on("click", event);
    // button.trigger("click");

    // expect(event).toHaveBeenCalled();
  });

  test('trigger the click event of "plus" button', () => {
    const wrapper = mount(ControlPanel, {
      mocks: {
        $t: () => {},
        $tc: () => {},
      },
      propsData: {
        configItem: {
          checklist: {
            presession: {
              status: false,
              tasks: [],
            },
            postsession: {
              status: false,
              tasks: [],
            },
          },
        },
        viewMode: "normal",
      },
      localVue,
      router,
      store: {
        ...store,
        state: {
          status: SESSION_STATUSES.END,
        },
      },
      vuetify,
    });

    const button = wrapper.find("#btn_save");
    const event = jest.fn();

    button.vm.$on("click", event);
    button.trigger("click");

    expect(event).toHaveBeenCalled();
  });

  test('trigger the click event of "reset" button', () => {
    const wrapper = mount(ControlPanel, {
      mocks: {
        $t: () => {},
        $tc: () => {},
      },
      propsData: {
        configItem: {
          checklist: {
            presession: {
              status: false,
              tasks: [],
            },
            postsession: {
              status: false,
              tasks: [],
            },
          },
        },
        viewMode: "normal",
      },
      localVue,
      router,
      store: {
        ...store,
        state: {
          status: SESSION_STATUSES.END,
        },
      },
      vuetify,
    });

    const button = wrapper.find("#btn_reset");
    const event = jest.fn();

    button.vm.$on("click", event);
    button.trigger("click");

    expect(event).toHaveBeenCalled();
  });

  test('trigger the click event of "pause session" button', () => {
    const wrapper = mount(ControlPanel, {
      mocks: {
        $t: () => {},
        $tc: () => {},
      },
      propsData: {
        configItem: {
          checklist: {
            presession: {
              status: false,
              tasks: [],
            },
            postsession: {
              status: false,
              tasks: [],
            },
          },
        },
        viewMode: "normal",
      },
      localVue,
      router,
      store: {
        ...store,
        state: {
          status: SESSION_STATUSES.START,
        },
      },
      vuetify,
    });

    const button = wrapper.find("#btn_pause_session");
    const event = jest.fn();

    button.vm.$on("click", event);
    button.trigger("click");

    expect(event).toHaveBeenCalled();
  });

  test('trigger the click event of "resume session" button', () => {
    const wrapper = mount(ControlPanel, {
      mocks: {
        $t: () => {},
        $tc: () => {},
      },
      propsData: {
        configItem: {
          checklist: {
            presession: {
              status: false,
              tasks: [],
            },
            postsession: {
              status: false,
              tasks: [],
            },
          },
        },
        viewMode: "normal",
      },
      localVue,
      router,
      store: {
        ...store,
        state: {
          status: SESSION_STATUSES.PAUSE,
        },
      },
      vuetify,
    });

    const button = wrapper.find("#btn_resume_session");
    const event = jest.fn();

    button.vm.$on("click", event);
    // button.trigger("click");

    // expect(event).toHaveBeenCalled();
  });

  test('trigger the click event of "end session" button', () => {
    const wrapper = mount(ControlPanel, {
      mocks: {
        $t: () => {},
        $tc: () => {},
      },
      propsData: {
        configItem: {
          checklist: {
            presession: {
              status: false,
              tasks: [],
            },
            postsession: {
              status: false,
              tasks: [],
            },
          },
        },
        viewMode: "normal",
      },
      localVue,
      router,
      store: {
        ...store,
        state: {
          status: SESSION_STATUSES.START,
        },
      },
      vuetify,
    });

    const button = wrapper.find("#btn_end_session");
    const event = jest.fn();

    button.vm.$on("click", event);
    button.trigger("click");

    expect(event).toHaveBeenCalled();
  });

  test('trigger the click event of "start video record" button', () => {
    const wrapper = mount(ControlPanel, {
      mocks: {
        $t: () => {},
        $tc: () => {},
      },
      data() {
        return {
          recordVideoStarted: false,
        };
      },
      propsData: {
        configItem: {
          checklist: {
            presession: {
              status: false,
              tasks: [],
            },
            postsession: {
              status: false,
              tasks: [],
            },
          },
        },
        viewMode: "normal",
      },
      localVue,
      router,
      store: {
        ...store,
        state: {
          status: SESSION_STATUSES.START,
        },
      },
      vuetify,
    });

    const button = wrapper.find("#btn_start_record_video");
    const event = jest.fn();

    button.vm.$on("click", event);
    // button.trigger("click");

    // expect(event).toHaveBeenCalled();
  });

  test('trigger the click event of "stop video record" button', () => {
    const wrapper = mount(ControlPanel, {
      mocks: {
        $t: () => {},
        $tc: () => {},
      },
      data() {
        return {
          recordVideoStarted: true,
        };
      },
      propsData: {
        configItem: {
          checklist: {
            presession: {
              status: false,
              tasks: [],
            },
            postsession: {
              status: false,
              tasks: [],
            },
          },
        },
        viewMode: "normal",
      },
      localVue,
      router,
      store: {
        ...store,
        state: {
          status: SESSION_STATUSES.START,
        },
      },
      vuetify,
    });

    const button = wrapper.find("#btn_stop_record_video");
    const event = jest.fn();

    button.vm.$on("click", event);
    button.trigger("click");

    expect(event).toHaveBeenCalled();
  });

  // test('trigger the click event of "screenshot" button', async () => {
  //   const wrapper = mount(ControlPanel, {
  //     mocks: {
  //       $t: () => {},
  //       $tc: () => {},
  //     },
  //     propsData: {
  //       configItem: {
  //         checklist: {
  //           presession: {
  //             status: false,
  //             tasks: [],
  //           },
  //           postsession: {
  //             status: false,
  //             tasks: [],
  //           },
  //         },
  //       },
  //       viewMode: "normal",
  //     },
  //     localVue,
  //     router,
  //     store: {
  //       ...store,
  //       state: {
  //         status: SESSION_STATUSES.PAUSE,
  //       },
  //     },
  //     vuetify,
  //   });

  //   const button = wrapper.find("#btn_screenshot");
  //   const event = jest.fn();

  //   button.vm.$on("click", event);
  //   button.trigger("click");

  //   expect(event).toHaveBeenCalled();
  // });

  test('trigger the click event of "start record audio" button', () => {
    const wrapper = mount(ControlPanel, {
      mocks: {
        $t: () => {},
        $tc: () => {},
      },
      localVue,
      data() {
        return {
          recordAudioStarted: false,
        };
      },
      propsData: {
        configItem: {
          checklist: {
            presession: {
              status: false,
              tasks: [],
            },
            postsession: {
              status: false,
              tasks: [],
            },
          },
        },
        viewMode: "normal",
      },
      store: {
        ...store,
        state: {
          status: SESSION_STATUSES.START,
        },
      },
      router,
      vuetify,
    });

    const button = wrapper.find(".btn:first-child");
    const event = jest.fn();

    button.vm.$on("click", event);
    button.trigger("click");

    expect(event).toHaveBeenCalled();
  });

  test('trigger the click event of "stop record audio" button', () => {
    const wrapper = mount(ControlPanel, {
      mocks: {
        $t: () => {},
        $tc: () => {},
      },
      data() {
        return {
          recordAudioStarted: true,
        };
      },
      propsData: {
        configItem: {
          checklist: {
            presession: {
              status: false,
              tasks: [],
            },
            postsession: {
              status: false,
              tasks: [],
            },
          },
        },
        viewMode: "normal",
      },
      localVue,
      router,
      store: {
        ...store,
        state: {
          status: SESSION_STATUSES.START,
        },
      },
      vuetify,
    });

    const button = wrapper.find("#btn_stop_record_audio");
    const event = jest.fn();

    button.vm.$on("click", event);
    button.trigger("click");

    expect(event).toHaveBeenCalled();
  });

  test('trigger the click event of "note" button', async () => {
    const wrapper = mount(ControlPanel, {
      mocks: {
        $t: () => {},
        $tc: () => {},
      },
      propsData: {
        configItem: {
          checklist: {
            presession: {
              status: false,
              tasks: [],
            },
            postsession: {
              status: false,
              tasks: [],
            },
          },
        },
        viewMode: "normal",
      },
      localVue,
      router,
      store: {
        ...store,
        state: {
          status: SESSION_STATUSES.START,
        },
      },
      vuetify,
    });

    const button = wrapper.find("#btn_note");
    const event = jest.fn();

    button.vm.$on("click", event);
    button.trigger("click");

    expect(event).toHaveBeenCalled();
  });
});
