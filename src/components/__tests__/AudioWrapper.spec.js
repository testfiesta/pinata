import { mount } from "@vue/test-utils";
import Vuetify from "vuetify";

import AudioWrapper from "../AudioWrapper";

const vuetify = new Vuetify();

describe("AudioPlayer.vue", () => {
  const itemData = {};

  test("loads audio player", () => {
    const wrapper = mount(AudioWrapper, {
      mocks: {
        $t: () => {},
        $tc: () => {},
      },
      propsData: {
        item: itemData,
      },
      vuetify,
    });

    expect(wrapper.find(".audio-wrapper").exists()).toBe(true);
    expect(wrapper.find(".waveform").exists()).toBe(true);
    expect(wrapper.find(".progress-bar").exists()).toBe(true);
    expect(wrapper.findAll(".btn-panel button").length).toBe(3);
    expect(wrapper.find("#btn_rewind").exists()).toBe(true);
    expect(wrapper.find("#btn_pause").exists()).toBe(false);
    expect(wrapper.find("#btn_play").exists()).toBe(true);
    expect(wrapper.findAll(".volume-control button").length).toBe(1);
    expect(wrapper.find("#btn_volume_off").exists()).toBe(true);
    expect(wrapper.find("#btn_volume_on").exists()).toBe(false);
    expect(wrapper.find(".volume-control .volume-progress").exists()).toBe(
      true
    );
  });

  test('show the "Pause" button and trigger the click event after stop', () => {
    const wrapper = mount(AudioWrapper, {
      mocks: {
        $t: () => {},
        $tc: () => {},
      },
      propsData: {
        item: itemData,
      },
      data() {
        return {
          isPlaying: true,
        };
      },
      vuetify,
    });

    const button = wrapper.find("#btn_pause");
    const event = jest.fn();
    expect(button.exists()).toBe(true);

    button.vm.$on("click", event);
    button.trigger("click");

    expect(event).toHaveBeenCalled();
  });

  test('show the "Mute On" button and trigger the click event after stop', () => {
    const wrapper = mount(AudioWrapper, {
      mocks: {
        $t: () => {},
        $tc: () => {},
      },
      propsData: {
        item: itemData,
      },
      data() {
        return {
          isMute: true,
        };
      },
      vuetify,
    });

    const button = wrapper.find("#btn_volume_on");
    const event = jest.fn();
    expect(button.exists()).toBe(true);

    button.vm.$on("click", event);
    button.trigger("click");

    expect(event).toHaveBeenCalled();
  });

  test('trigger the click event of "rewind" button', () => {
    const wrapper = mount(AudioWrapper, {
      mocks: {
        $t: () => {},
        $tc: () => {},
      },
      propsData: {
        item: itemData,
      },
      vuetify,
    });

    const button = wrapper.find("#btn_rewind");
    const event = jest.fn();

    button.vm.$on("click", event);
    button.trigger("click");

    expect(event).toHaveBeenCalled();
  });

  test('trigger the click event of "play" button', () => {
    const wrapper = mount(AudioWrapper, {
      mocks: {
        $t: () => {},
        $tc: () => {},
      },
      propsData: {
        item: itemData,
      },
      vuetify,
    });

    const button = wrapper.find("#btn_play");
    const event = jest.fn();

    button.vm.$on("click", event);
    button.trigger("click");

    expect(event).toHaveBeenCalled();
  });

  test('trigger the click event of "volumn" button', () => {
    const wrapper = mount(AudioWrapper, {
      mocks: {
        $t: () => {},
        $tc: () => {},
      },
      propsData: {
        item: itemData,
      },
      vuetify,
    });

    const button = wrapper.find("#btn_volume_off");
    const event = jest.fn();

    button.vm.$on("click", event);
    button.trigger("click");

    expect(event).toHaveBeenCalled();
  });
});
