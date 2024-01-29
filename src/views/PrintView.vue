<template>
  <v-container class="wrapper">
    <div class="header">
      <img :src="require('../assets/logo.png')" />
    </div>
    <div class="content">
      <v-row>
        <v-col class="timeline" cols="8">
          <div class="summary">
            <h3 class="detail-title mb-1">{{ $tc("caption.summary", 1) }}</h3>
            <div
              class="summary-content mb-1"
              style="display: flex; flex-direction: column"
            >
              <div v-if="Object.keys(textTypes).length">
                <p class="item-title mb-0" style="line-height: 1.5">
                  {{ $tc("caption.notes", 1) }}
                </p>
                <div style="column-gap: 10px; columns: 4">
                  <div
                    v-for="(type, i) in Object.keys(textTypes)"
                    :key="i"
                    style="width: 10rem"
                  >
                    <div v-if="textTypeCounts[type] > 0">
                      <font-awesome-icon
                        :icon="textTypes[type].icon"
                        class="mr-1"
                        :style="{
                          borderColor: textTypes[type].fill,
                          color: textTypes[type].fill,
                          fontSize: '0.5em',
                        }"
                        :border="true"
                      />
                      <span
                        class="text-capitalize"
                        style="line-height: 1; veritical-align: center"
                      >
                        {{ type }}: {{ textTypeCounts[type] }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div v-if="tags.length">
                <p class="item-title mt-2 mb-0" style="line-height: 1.5">
                  {{ $tc("caption.tags", 1) }}
                </p>
                <div style="columns: 4">
                  <div v-for="(tag, i) in tags" :key="i">
                    <span
                      class="text-capitalize"
                      style="line-height: 1; veritical-align: center"
                    >
                      {{ tag.title }}: {{ tag.count }}
                    </span>
                  </div>
                </div>
              </div>
              <div v-if="emojis.length">
                <p class="item-title mt-2 mb-0" style="line-height: 1.5">
                  {{ $tc("caption.reactions", 1) }}
                </p>
                <div style="display: flex; column-gap: 10px">
                  <div v-for="(emoji, i) in emojis" :key="i">
                    <span class="text-capitalize">{{ emoji.data }}</span
                    >:
                    {{ emoji.count }}
                  </div>
                </div>
              </div>
              <div v-if="followUp">
                <p class="item-title mt-2 mb-0" style="line-height: 1.5">
                  {{ $tc("caption.required_follow_up", 1) }}: {{ followUp }}
                </p>
              </div>
            </div>
            <div class="summary-text" v-html="summary"></div>
          </div>
          <hr style="margin-bottom: 1em" />
          <v-timeline align-top dense class="pt-0">
            <v-timeline-item
              class="timeline-item"
              color="primary"
              icon="mdi-play-circle"
              fill-dot
            >
              <div class="duration-text">
                <v-icon>mdi-clock-outline</v-icon>
                <span>{{ formatTime(0) }}</span>
              </div>
            </v-timeline-item>

            <div v-for="(item, i) in items" :key="i">
              <v-timeline-item
                v-if="item.sessionType === 'Screenshot'"
                color="primary"
                icon="mdi-camera-plus"
                fill-dot
              >
                <div class="d-flex flex-column">
                  <div class="d-flex justify-space-between py-2">
                    <div class="duration-text">
                      <v-icon>mdi-clock-outline</v-icon>
                      <span>{{ formatTime(item.timer_mark) }}</span>
                      <span class="filename-text">({{ item.fileName }})</span>
                    </div>
                  </div>
                  <div class="image-wrapper">
                    <img
                      style="max-width: 100%"
                      :src="`file://${item.filePath}`"
                    />
                  </div>
                  <div class="comment-wrapper mt-2">
                    <font-awesome-icon
                      :icon="textTypes[item.comment.type].icon"
                      class="mr-1"
                      :style="{
                        borderColor: textTypes[item.comment.type].fill,
                        color: textTypes[item.comment.type].fill,
                      }"
                      :border="true"
                    />
                    <span class="comment-type">{{ item.comment.type }}: </span>
                    <div class="comment-text" v-html="item.comment.text"></div>
                  </div>
                </div>
              </v-timeline-item>
              <v-timeline-item
                v-if="item.sessionType === 'Video'"
                color="primary"
                icon="mdi-video"
                fill-dot
              >
                <div class="d-flex flex-column">
                  <div class="d-flex justify-space-between py-2">
                    <div class="duration-text">
                      <v-icon>mdi-clock-outline</v-icon>
                      <span>{{ formatTime(item.timer_mark) }}</span>
                      <span class="filename-text">({{ item.fileName }})</span>
                    </div>
                  </div>
                  <div class="video-wrapper">
                    <img
                      style="max-width: 100%"
                      :src="`file://${item.poster}`"
                    />
                    <v-icon class="video-play" x-large>mdi-play</v-icon>
                  </div>
                  <div class="comment-wrapper mt-2">
                    <font-awesome-icon
                      :icon="textTypes[item.comment.type].icon"
                      class="mr-1"
                      :style="{
                        borderColor: textTypes[item.comment.type].fill,
                        color: textTypes[item.comment.type].fill,
                      }"
                      :border="true"
                    />
                    <span class="comment-type">{{ item.comment.type }}: </span>
                    <div class="comment-text" v-html="item.comment.text"></div>
                  </div>
                </div>
              </v-timeline-item>
              <v-timeline-item
                v-if="item.sessionType === 'Audio'"
                color="primary"
                icon="mdi-microphone"
                fill-dot
              >
                <div class="d-flex flex-column">
                  <div class="d-flex justify-space-between py-2">
                    <div class="duration-text">
                      <v-icon>mdi-clock-outline</v-icon>
                      <span>{{ formatTime(item.timer_mark) }}</span>
                      <span class="filename-text">({{ item.fileName }})</span>
                    </div>
                  </div>
                  <div class="audio-wrapper">
                    <div class="audio-wave">
                      <span>{{ $tc("caption.audio_wave", 1) }}</span>
                    </div>
                    <div class="audio-play">
                      <v-icon medium>mdi-play-circle</v-icon>
                    </div>
                  </div>
                  <div class="comment-wrapper mt-2">
                    <font-awesome-icon
                      :icon="textTypes[item.comment.type].icon"
                      class="mr-1"
                      :style="{
                        borderColor: textTypes[item.comment.type].fill,
                        color: textTypes[item.comment.type].fill,
                      }"
                      :border="true"
                    />
                    <span class="comment-type">{{ item.comment.type }}: </span>
                    <div class="comment-text" v-html="item.comment.text"></div>
                  </div>
                </div>
              </v-timeline-item>
              <v-timeline-item
                v-if="item.sessionType === 'Note'"
                color="primary"
                icon="mdi-pencil"
                fill-dot
              >
                <div class="d-flex flex-column">
                  <div class="d-flex justify-space-between py-2">
                    <div class="duration-text">
                      <v-icon>mdi-clock-outline</v-icon>
                      <span>{{ formatTime(item.timer_mark) }}</span>
                    </div>
                  </div>
                  <div class="note-wrapper">
                    <font-awesome-icon
                      :icon="textTypes[item.comment.type].icon"
                      class="mr-1"
                      :style="{
                        borderColor: textTypes[item.comment.type].fill,
                        color: textTypes[item.comment.type].fill,
                      }"
                      :border="true"
                    />
                    <span class="comment-type">{{ item.comment.type }}: </span>
                    <div class="comment-text" v-html="item.comment.text"></div>
                  </div>
                </div>
              </v-timeline-item>
              <v-timeline-item
                v-if="item.sessionType === 'File'"
                color="primary"
                icon="mdi-file"
                fill-dot
              >
                <div class="d-flex flex-column">
                  <div class="d-flex justify-space-between py-2">
                    <div class="duration-text">
                      <v-icon>mdi-clock-outline</v-icon>
                      <span>{{ formatTime(item.timer_mark) }}</span>
                      <span class="filename-text">({{ item.fileName }})</span>
                    </div>
                  </div>
                  <div
                    v-if="item.fileType === 'image'"
                    class="file-wrapper image"
                  >
                    <img
                      class="screen-img"
                      style="max-width: 100%"
                      :src="`file://${item.filePath}`"
                    />
                  </div>
                  <div v-else class="file-wrapper file">
                    <div class="file-name">
                      <span>{{ item.fileName }}</span>
                    </div>
                    <div class="file-icon">
                      <v-icon medium>mdi-file</v-icon>
                    </div>
                  </div>
                  <div class="comment-wrapper mt-2">
                    <font-awesome-icon
                      :icon="textTypes[item.comment.type].icon"
                      class="mr-1"
                      :style="{
                        borderColor: textTypes[item.comment.type].fill,
                        color: textTypes[item.comment.type].fill,
                      }"
                      :border="true"
                    />
                    <span class="comment-type">{{ item.comment.type }}: </span>
                    <div class="comment-text" v-html="item.comment.text"></div>
                  </div>
                </div>
              </v-timeline-item>
              <v-timeline-item
                v-if="item.sessionType === 'Mindmap'"
                color="primary"
                icon="mdi-camera-plus"
                fill-dot
              >
                <div class="d-flex flex-column">
                  <div class="d-flex justify-space-between py-2">
                    <div class="duration-text">
                      <v-icon>mdi-clock-outline</v-icon>
                      <span>{{ formatTime(item.timer_mark) }}</span>
                      <span class="filename-text">({{ item.fileName }})</span>
                    </div>
                  </div>
                  <div class="image-wrapper">
                    <img
                      class="screen-img"
                      style="max-width: 100%"
                      :src="`file://${item.filePath}`"
                    />
                  </div>
                  <div class="comment-wrapper mt-2">
                    <font-awesome-icon
                      :icon="textTypes[item.comment.type].icon"
                      class="mr-1"
                      :style="{
                        borderColor: textTypes[item.comment.type].fill,
                        color: textTypes[item.comment.type].fill,
                      }"
                      :border="true"
                    />
                    <span class="comment-type">{{ item.comment.type }}: </span>
                    <div class="comment-text" v-html="item.comment.text"></div>
                  </div>
                </div>
              </v-timeline-item>
              <v-timeline-item
                v-if="item.sessionType === 'Summary' && item.comment.text"
                color="primary"
                icon="mdi-pencil"
                fill-dot
              >
                <div class="d-flex flex-column">
                  <div class="d-flex justify-space-between py-2">
                    <div class="duration-text">
                      <v-icon>mdi-clock-outline</v-icon>
                      <span>{{ formatTime(item.timer_mark) }}</span>
                    </div>
                  </div>
                  <div class="note-wrapper">
                    <font-awesome-icon
                      :icon="textTypes[item.comment.type].icon"
                      class="mr-1"
                      :style="{
                        borderColor: textTypes[item.comment.type].fill,
                        color: textTypes[item.comment.type].fill,
                      }"
                      :border="true"
                    />
                    <span class="comment-type">{{ item.comment.type }}: </span>
                    <div class="comment-text" v-html="item.comment.text"></div>
                  </div>
                </div>
              </v-timeline-item>
            </div>
            <v-timeline-item
              class="timeline-item pb-0"
              color="primary"
              icon="mdi-stop-circle"
              fill-dot
            >
              <div class="duration-text">
                <v-icon>mdi-clock-outline</v-icon>
                <span>{{ formatTime(timer) }}</span>
              </div>
            </v-timeline-item>
          </v-timeline>
        </v-col>
        <v-divider vertical></v-divider>
        <v-col class="detail" cols="4">
          <h3 class="detail-title">{{ $tc("caption.detail", 1) }}</h3>
          <div class="detail-item title">
            <p class="item-title">{{ $tc("caption.title", 1) }}</p>
            <p class="item-value">{{ this.title }}</p>
          </div>
          <div class="detail-item charter">
            <p class="item-title">Charter</p>
            <div class="item-value" v-html="this.charter.content"></div>
          </div>
          <div class="detail-item pre-condition">
            <p class="item-title">{{ $tc("caption.precondition", 1) }}</p>
            <div class="item-value" v-html="this.preconditions.content"></div>
          </div>
          <div class="detail-item session-time">
            <p class="item-title">{{ $tc("caption.configured_time", 1) }}</p>
            <p class="item-value">{{ formatTime(duration) }}</p>
          </div>
          <div class="detail-item session-elapsed-time">
            <p class="item-title">
              {{ $tc("caption.session_elapsed_time", 1) }}
            </p>
            <p class="item-value">{{ formatTime(timer) }}</p>
          </div>
          <div class="detail-item environment">
            <p class="item-title">{{ $tc("caption.environment", 1) }}</p>
            <p class="item-value os">
              <span class="font-weight-bold">{{ $tc("caption.os", 1) }}:</span>
              &nbsp;
              {{ os }}
            </p>
            <p class="item-value">
              <span class="font-weight-bold">
                {{ $tc("caption.window", 1) }}:
              </span>
              &nbsp;
              {{ $tc("caption.full_screen", 1) }}
            </p>
            <p class="item-value screen-size">
              <span class="font-weight-bold">
                {{ $tc("caption.screen_size", 1) }}:
              </span>
              {{ screenWidth }} x {{ screenHeight }}
            </p>
          </div>
        </v-col>
      </v-row>
    </div>
  </v-container>
</template>

<script>
import {
  VContainer,
  VRow,
  VCol,
  VTimeline,
  VTimelineItem,
  VIcon,
  VDivider,
} from "vuetify/lib/components";
import { IPC_HANDLERS, IPC_FUNCTIONS, TEXT_TYPES } from "../modules/constants";

export default {
  name: "PrintView",
  components: {
    VContainer,
    VRow,
    VCol,
    VTimeline,
    VTimelineItem,
    VIcon,
    VDivider,
  },
  data() {
    return {
      items: [],
      textTypes: TEXT_TYPES,
      title: "",
      charter: "",
      preconditions: "",
      timer: 0,
      duration: 0,
      os: "Unknown OS",
      window: "",
      screenWidth: "",
      screenHeight: "",
    };
  },
  created() {
    this.initialize();
  },
  mounted() {
    this.detectEnvironment();

    if (!window.ipc) return;

    window.ipc.on("ACTIVE_PDF", (data) => {
      this.title = data.title;
      this.charter = data.charter;
      this.preconditions = data.preconditions;
      this.timer = data.timer;
      this.duration = data.duration;
    });
  },
  computed: {
    textTypeCounts() {
      let data = {};
      const tTypes = Object.keys(TEXT_TYPES).filter(
        (item) => item !== "Summary"
      );
      tTypes.map((type) => {
        let i = 0;
        this.items.map((item) => {
          if (type === item.comment.type && item.comment.text) {
            i++;
          }
        });
        if (i > 0) {
          data[type] = i;
        }
      });
      return data;
    },
    tags() {
      let data = [];
      this.items.map((item) => {
        if (item.tags) {
          item.tags.map((tag) => {
            const exist = data.some((el) => el.title === tag.text);
            if (exist) {
              data = data.map((obj) => {
                let temp = Object.assign({}, obj);
                if (temp.title === tag.text) {
                  temp.count += 1;
                }
                return temp;
              });
            } else {
              const temp = {
                title: tag.text,
                count: 1,
              };
              data.push(temp);
            }
          });
        }
      });
      return data;
    },
    followUp() {
      let data = 0;
      this.items.map((item) => {
        if (item.followUp) {
          data++;
        }
      });
      return data;
    },
    emojis() {
      let data = [];
      this.items.map((item) => {
        if (item.emoji) {
          item.emoji.map((emoji) => {
            const exist = data.some((el) => el.data === emoji.data);
            if (exist) {
              data = data.map((obj) => {
                let temp = Object.assign({}, obj);
                if (temp.data === emoji.data) {
                  temp.count++;
                }
                return temp;
              });
            } else {
              let temp = Object.assign({}, emoji);
              temp.count = 1;
              data.push(temp);
            }
          });
        }
      });
      return data;
    },
    summary() {
      let summary = "";
      this.items.map((item) => {
        if (item.comment.type === "Summary" && item.comment.text) {
          summary = item.comment.text;
        }
      });
      return summary;
    },
  },
  methods: {
    formatTime(timeInSeconds) {
      const seconds = ("0" + (timeInSeconds % 60)).slice(-2);
      const minutes = ("0" + (parseInt(timeInSeconds / 60, 10) % 60)).slice(-2);
      const hours = ("0" + (parseInt(timeInSeconds / 3600, 10) % 24)).slice(-2);

      return hours + ":" + minutes + ":" + seconds;
    },
    async initialize() {
      if (!window.ipc) return;

      await window.ipc
        .invoke(IPC_HANDLERS.PERSISTENCE, { func: IPC_FUNCTIONS.GET_ITEMS })
        .then((result) => {
          this.items = result;
        });
    },
    detectEnvironment() {
      const userAgent = navigator.userAgent;
      const platform =
        window.navigator?.userAgentData?.platform || window.navigator.platform;
      const macosPlatforms = ["Macintosh", "MacIntel", "MacPPC", "Mac68K"];
      const windowsPlatforms = ["Win32", "Win64", "Windows", "WinCE"];
      const iosPlatforms = ["iPhone", "iPad", "iPod"];
      if (macosPlatforms.indexOf(platform) !== -1) {
        this.os = "Mac OS";
      } else if (iosPlatforms.indexOf(platform) !== -1) {
        this.os = "iOS";
      } else if (windowsPlatforms.indexOf(platform) !== -1) {
        this.os = "Windows";
      } else if (/Android/.test(userAgent)) {
        this.os = "Android";
      } else if (/Linux/.test(platform)) {
        this.os = "Linux";
      }
      this.screenWidth = screen.width;
      this.screenHeight = screen.height;
    },
  },
};
</script>
<style scoped>
.wrapper {
  padding: 20px;
}
.header {
  padding: 20px 0;
  border-bottom: 2px solid #4c1d95;
}
.content {
  padding: 20px 0;
}
.summary {
  display: flex;
  flex-direction: column;
  row-gap: 5px;
  justify-content: flex-start;
}
.summary .summary-content {
  display: flex;
  flex-direction: row;
  column-gap: 5px;
}
.summary .summary-content span {
  font-style: normal;
  font-weight: 500;
  font-size: 12px;
  line-height: 16px;
  color: #6b7280;
}
.summary .summary-text {
  font-style: italic;
  font-weight: 500;
  font-size: 14px;
  line-height: 20px;
  color: #111827;
}
.timeline-item {
  height: auto;
  display: flex;
  align-items: center;
}
.timeline-item .v-timeline-item__body {
  max-width: calc(100% - 40px);
}
.image-wrapper {
  position: relative;
  display: flex;
  background: #fff;
  border: 1px solid #d1d5db;
  overflow: hidden;
}
.video-wrapper {
  position: relative;
  display: flex;
  background: #fff;
  border: 1px solid #d1d5db;
  overflow: hidden;
}
.v-icon.video-play {
  border: 1px solid #c7c7c8;
  border-radius: 50%;
  height: 56px;
  width: 56px;
  background-color: #c7c7c8;
  color: #17191a;
  opacity: 0.8;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
.audio-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 14px;
  background: #fff;
  border-radius: 6px;
  border: 1px solid #d1d5db;
}
.comment-wrapper {
  display: flex;
  background: #fff;
}
.comment-wrapper p {
  margin-bottom: 0 !important;
}
.comment-type {
  margin-right: 2px;
}
.filename-text {
  font-style: italic;
  font-size: 11px;
}
.note-wrapper {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  column-gap: 5px;
  padding: 10px 14px;
  background: #fff;
  border: 1px solid #d1d5db;
  border-radius: 6px;
}
.note-wrapper p {
  margin-bottom: 0 !important;
}
.audio-wrapper .audio-wave {
  flex-grow: 1;
}
.file-wrapper.image {
  position: relative;
  display: flex;
  background: #fff;
  border: 1px solid #d1d5db;
  overflow: hidden;
}
.file-wrapper.file {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 14px;
  background: #fff;
  border-radius: 6px;
  border: 1px solid #d1d5db;
}
.file-wrapper.file .file-name {
  font-size: 14px;
  font-weight: 500;
  font-style: normal;
  line-height: 16px;
  color: #6b7280;
}
.tags-wrapper .tag {
  margin-right: 5px;
}
.tags-wrapper .tag:last-child {
  margin-right: 0;
}
.detail-title {
  font-style: normal;
  font-weight: 600;
  font-size: 14px;
  line-height: 20px;
  color: #111827;
  margin-bottom: 1rem;
}
.detail-item {
  display: flex;
  flex-direction: column;
  row-gap: 5px;
  margin-bottom: 1rem;
}

.detail-item p {
  margin-bottom: 0;
}

.item-title {
  font-style: normal;
  font-weight: 600;
  font-size: 12px;
  line-height: 14px;
  letter-spacing: -0.005em;
  color: #111827;
}

.item-value {
  font-style: normal;
  font-weight: 400;
  font-size: 12px;
  line-height: 14px;
  letter-spacing: -0.005em;
  color: #6b7280;
}
</style>
