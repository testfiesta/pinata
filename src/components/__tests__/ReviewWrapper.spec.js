import Vuetify from "vuetify";

import ReviewWrappper from "../ReviewWrapper";
import ImageEditor from "../ImageEditor";
import VideoWrapper from "../VideoWrapper";
import AudioWrapper from "../AudioWrapper";
import FileWrapper from "../FileWrapper";
import MindmapEditor from "../MindmapEditor.vue";

import { mount } from "@vue/test-utils";

const vuetify = new Vuetify();

describe("ReivewWrapper.vue", () => {
  test("render a view", async () => {
    const wrapper = mount(ReviewWrappper, {
      mocks: {
        $t: () => {},
        $tc: () => {},
      },
      propsData: {
        item: {
          fileType: "application/mindmap",
          content: { nodes: [] },
        },
        processing: false,
        triggerSave: false,
        autoSave: false,
        currentView: false,
        config: {
          defaultColor: "#000000",
        },
      },
      data() {
        return {
          sessionItem: {
            fileType: "application/mindmap",
          },
        };
      },
      vuetify,
    });

    expect(wrapper.findComponent(MindmapEditor).exists()).toBe(true);

    await wrapper.setData({
      sessionItem: {
        fileType: "image/png",
      },
    });

    expect(wrapper.findComponent(ImageEditor).exists()).toBe(true);

    await wrapper.setData({
      sessionItem: {
        fileType: "video/mp4",
      },
    });
    expect(wrapper.findComponent(VideoWrapper).exists()).toBe(true);

    await wrapper.setData({
      sessionItem: {
        fileType: "audio/mp3",
      },
    });
    expect(wrapper.findComponent(AudioWrapper).exists()).toBe(true);

    await wrapper.setData({
      sessionItem: {
        fileType: "other",
      },
    });
    expect(wrapper.findComponent(FileWrapper).exists()).toBe(true);
  });
});
