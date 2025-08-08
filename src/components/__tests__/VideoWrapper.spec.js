import { mount } from "@vue/test-utils";
import VideoWrapper from "../VideoWrapper";

describe("VideoWrapper.vue", () => {
  const itemData = {
    filePath: "",
  };

  test("render a component", () => {
    const wrapper = mount(VideoWrapper, {
      mocks: {
        $t: () => {},
        $tc: () => {},
      },
      propsData: {
        item: itemData,
      },
    });

    expect(wrapper.find(".video-player video")).toBeTruthy();

    const videos = wrapper.findAll(".video-player video");
    expect(videos.length).toBe(1);
  });

  test("show the progress bar", () => {
    const wrapper = mount(VideoWrapper, {
      mocks: {
        $t: () => {},
        $tc: () => {},
      },
      propsData: {
        item: itemData,
      },
      data() {
        return {
          isProcessing: true,
        };
      },
    });
    expect(wrapper.find(".preview-wrapper .progress-bar").exists()).toBe(true);
  });

  test("triggers an input of start time text field", async () => {
    const wrapper = mount(VideoWrapper, {
      mocks: {
        $t: () => {},
        $tc: () => {},
      },
      propsData: {
        item: itemData,
      },
    });

    const startTimeInput = wrapper.find(".video-control .start-time input");
    expect(startTimeInput.exists()).toBe(true);

    await startTimeInput.setValue("00:00");

    expect(startTimeInput.element.value).toContain("00:00");
  });

  test("triggers an input of end time text field", async () => {
    const wrapper = mount(VideoWrapper, {
      mocks: {
        $t: () => {},
        $tc: () => {},
      },
      propsData: {
        item: itemData,
      },
    });

    const endTimeInput = wrapper.find(".video-control .end-time input");
    expect(endTimeInput.exists()).toBe(true);

    await endTimeInput.setValue("00:00");

    expect(endTimeInput.element.value).toContain("00:00");
  });

  test("displays length of video", async () => {
    const wrapper = mount(VideoWrapper, {
      mocks: {
        $t: () => {},
        $tc: () => {},
      },
      propsData: {
        item: itemData,
      },
      data() {
        return {
          duration: 10,
        };
      },
    });

    const date = new Date(null);
    const temp = parseFloat(10).toFixed(2);
    date.setSeconds(temp);
    const durationTime = date.toISOString().substr(14, 5);

    expect(
      wrapper.find(".video-control .cut-duration .duration-time")
    ).toBeTruthy();
    expect(
      wrapper.find(".video-control .cut-duration .duration-time").text()
    ).toContain(`: ${durationTime}`);

    const endTimeInput = wrapper.find(".video-control .end-time input");

    await wrapper.vm.$nextTick();

    expect(endTimeInput.element.value).toContain(durationTime);
  });
});
