<template>
  <div class="content" v-if="status !== 'pending' && status !== 'end'">
    <div
      class="time-counter"
      @mousemove="mouseMove($event)"
      @mousedown="mouseDown($event)"
      @mouseup="mouseUp()"
      @mouseleave="mouseleave()"
    >
      <span class="time-title">Time</span>
      <span class="time-value">{{ elapsedTime }}</span>
    </div>
    <div class="control-panel">
      <v-btn
        v-if="status !== 'pause'"
        id="btn_pause_session"
        icon
        class="icon-btn"
        @click="pauseSession()"
      >
        <img
          :src="require('../assets/icon/pause-white.svg')"
          width="20"
          height="20"
        />
      </v-btn>
      <v-btn
        v-if="status === 'pause'"
        id="btn_resume_session"
        icon
        class="icon-btn"
        @click="resumeSession()"
      >
        <img
          :src="require('../assets/icon/play-white.svg')"
          width="24"
          height="24"
        />
      </v-btn>
      <v-btn id="btn_end_session" icon class="icon-btn" @click="endSession()">
        <img
          :src="require('../assets/icon/stop-white.svg')"
          width="20"
          height="20"
        />
      </v-btn>
      <v-btn
        v-if="!recordVideoStarted"
        id="btn_start_record_video"
        icon
        class="icon-btn"
        :disabled="status === 'pause'"
        @click="startRecordVideo()"
      >
        <img
          :src="require('../assets/icon/video-solid-white.svg')"
          width="24"
          height="24"
        />
      </v-btn>
      <v-btn
        v-if="recordVideoStarted"
        id="btn_stop_record_video"
        icon
        class="icon-btn"
        :disabled="status === 'pause'"
        @click="stopRecordVideo()"
      >
        <img
          :src="require('../assets/icon/video-slash-solid-white.svg')"
          width="24"
          height="24"
        />
      </v-btn>
      <v-divider vertical class="icon-divider"></v-divider>
      <v-btn
        id="btn_screenshot"
        icon
        class="icon-btn"
        :disabled="status === 'pause'"
        @click="screenshot()"
      >
        <img
          :src="require('../assets/icon/camera-white.svg')"
          width="19"
          height="17"
        />
      </v-btn>
      <v-btn
        v-if="!recordAudioStarted"
        id="btn_start_record_audio"
        icon
        class="icon-btn"
        :disabled="status === 'pause'"
        @click="startRecordAudio()"
      >
        <img
          :src="require('../assets/icon/microphone-solid-white.svg')"
          width="27"
          height="27"
        />
      </v-btn>
      <v-btn
        v-if="recordAudioStarted"
        id="btn_stop_record_audio"
        icon
        class="icon-btn"
        :disabled="status === 'pause'"
        @click="stopRecordAudio()"
      >
        <img
          :src="require('../assets/icon/microphone-slash-solid-white.svg')"
          width="26"
          height="26"
        />
      </v-btn>
      <v-btn
        id="btn_note"
        icon
        class="icon-btn"
        :disabled="status === 'pause'"
        @click="showNoteDialog"
      >
        <img
          :src="require('../assets/icon/pencil-white1.svg')"
          width="17"
          height="17"
        />
      </v-btn>
      <v-btn
        icon
        class="icon-btn"
        :disabled="status === 'pause'"
        @click="mindMap"
      >
        <img
          :src="require('../assets/icon/connect-white.svg')"
          width="24"
          height="24"
        />
      </v-btn>
      <v-menu offset-y>
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            id="btn_change_source"
            class="icon-btn"
            icon
            color="white"
            v-on="on"
            v-bind="attrs"
          >
            <v-icon>mdi-dots-vertical</v-icon>
          </v-btn>
        </template>
        <v-list>
          <v-list-item
            @click="showSourcePickerDialog"
            :disabled="
              status === 'pause' || recordVideoStarted || recordAudioStarted
            "
          >
            <v-list-item-title> Change recording target </v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </div>
  </div>
</template>
<script>
import { IPC_HANDLERS, IPC_FUNCTIONS } from "../modules/constants";
export default {
  name: "LowProfileControlWrapper",
  props: {
    pElapsedTime: {
      type: String,
      default: () => "",
    },
    pStatus: {
      type: String,
      default: () => "",
    },
  },
  watch: {
    pElapsedTime(newValue) {
      this.elapsedTime = newValue;
    },
    pStatus(newValue) {
      this.status = newValue;
    },
  },
  data() {
    return {
      status: this.pStatus,
      elapsedTime: this.pElapsedTime,
      recordVideoStarted: false,
      recordAudioStarted: false,
      originalPos: {
        x: 0,
        y: 0,
      },
    };
  },
  methods: {
    showSourcePickerDialog() {
      this.$emit("show-source-picker");
    },
    pauseSession() {
      this.$emit("pause-session");
    },
    resumeSession() {
      this.$emit("resume-session");
    },
    endSession() {
      this.$emit("end-session");
    },
    startRecordVideo() {
      this.$emit("start-record-video");
      this.recordVideoStarted = true;
    },
    stopRecordVideo() {
      this.$emit("stop-record-video");
      this.recordVideoStarted = false;
    },
    screenshot() {
      this.$emit("screenshot");
    },
    startRecordAudio() {
      this.$emit("start-record-audio");
      this.recordAudioStarted = true;
    },
    stopRecordAudio() {
      this.$emit("stop-record-audio");
      this.recordAudioStarted = false;
    },
    showNoteDialog() {
      this.$emit("show-note-dialog");
    },
    mindMap() {
      this.$emit("show-mindmap-dialog");
    },
    mouseMove(event) {
      if (!this.mouseDowned) return;

      const deltaPos = {
        x: event.screenX - this.originalPos.x,
        y: event.screenY - this.originalPos.y,
      };

      this.originalPos = {
        x: event.screenX,
        y: event.screenY,
      };

      if (!window.ipc) return;

      window.ipc.invoke(IPC_HANDLERS.WINDOW, {
        func: IPC_FUNCTIONS.MOVE_WINDOW,
        data: deltaPos,
      });
    },
    mouseDown(event) {
      this.mouseDowned = true;
      this.originalPos = {
        x: event.screenX,
        y: event.screenY,
      };
    },
    mouseUp() {
      this.mouseDowned = false;
    },
    mouseleave() {
      this.mouseDowned = false;
    },
  },
};
</script>
<style scoped>
.content {
  background-color: #4c1d95;
  border-radius: 6px;
  display: flex;
  flex-direction: row;
  position: absolute;
  right: 0px;
  width: 480px;
  height: 50px;
  overflow: hidden;
}
.time-counter {
  width: 30%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: #7c3aed;
  cursor: move;
  user-select: none;
}
.time-counter .time-title {
  font-style: normal;
  font-weight: 500;
  font-size: 12px;
  line-height: 1.2;
  text-align: center;
  text-transform: uppercase;
  color: #ddd6fe;
}
.time-counter .time-value {
  font-style: normal;
  font-weight: 600;
  font-size: 16px;
  line-height: 1.2;
  text-align: center;
  color: #fff;
}
.control-panel {
  width: 70%;
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 15px;
}
.icon-btn {
  text-align: center;
}
.icon-btn:hover {
  background: #0c0fd3;
}
.icon-divider {
  background: #0c2ff3;
  margin-left: 3px;
  margin-right: 3px;
}
</style>
