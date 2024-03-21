<template>
  <div>
    <div class="preview-wrapper" v-if="isProcessing">
      <img
        :src="
          $isElectron
            ? `file://${editSessionItem.poster}`
            : editSessionItem.poster
        "
      />
      <div class="progress-bar">
        <v-progress-linear
          indeterminate
          striped
          height="10"
          color="primary"
        ></v-progress-linear>
        <div class="subtitle-2">{{ $tc("caption.optimizing", 1) }}</div>
      </div>
    </div>
    <div class="video-wrapper" v-if="!isProcessing">
      <div class="video-player">
        <video
          ref="videoPlayer"
          controls
          @loadedmetadata="logDuration"
          style="width: 100%"
        >
          <source
            :src="
              $isElectron
                ? `file://${editSessionItem.filePath}`
                : editSessionItem.filePath
            "
            type="video/webm"
          />
        </video>
      </div>
      <div class="video-control">
        <div class="cut-duration">
          <div class="start-time">
            <div
              class="subtitle-2 label-text"
              :style="{ color: currentTheme.secondary }"
            >
              {{ $tc("caption.start", 1) }}
            </div>
            <v-text-field
              placeholder="00:00"
              v-mask="'##:##'"
              outlined
              dense
              v-model="start"
              hide-details="true"
            ></v-text-field>
          </div>
          <div class="divider"><span>-</span></div>
          <div class="end-time">
            <div
              class="subtitle-2 label-text"
              :style="{ color: currentTheme.secondary }"
            >
              {{ $tc("caption.end", 1) }}
            </div>
            <v-text-field
              placeholder="00:00"
              v-mask="'##:##'"
              outlined
              dense
              v-model="end"
              hide-details="true"
            ></v-text-field>
          </div>
          <div class="duration-time">
            <span class="">
              {{ $tc("caption.length", 1) }}: {{ durationTime }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { STATUSES } from "../modules/constants";
export default {
  name: "VideoWrapper",
  components: {},
  props: {
    item: {
      type: Object,
      default: () => {},
    },
    processing: {
      type: Boolean,
      default: () => false,
    },
    triggerSave: {
      type: Boolean,
      default: () => false,
    },
  },
  watch: {
    item: function (newValue) {
      this.editSessionItem = newValue;
    },
    processing: function (newValue) {
      this.isProcessing = newValue;
    },
    triggerSave: function (oldValue, newValue) {
      if (oldValue !== newValue) {
        this.handleVideo(true);
      }
    },
  },
  data() {
    return {
      editSessionItem: this.item,
      start: "00:00",
      end: "00:00",
      isProcessing: this.processing,
      duration: 0,
    };
  },
  mounted() {},
  computed: {
    durationTime() {
      try {
        const date = new Date(null);
        const temp = parseFloat(this.duration).toFixed(2);
        date.setSeconds(temp);
        const result = date.toISOString().substr(14, 5);
        this.setEndTime(result);
        return result;
      } catch (e) {
        return "Infinite";
      }
    },
    currentTheme() {
      if (this.$vuetify.theme.dark) {
        return this.$vuetify.theme.themes.dark;
      } else {
        return this.$vuetify.theme.themes.light;
      }
    },
  },
  methods: {
    async handleVideo(needCallback = false) {
      const startVal = this.timeInSeconds(this.start);
      const endVal = this.timeInSeconds(this.end);
      this.handleProcessing(true);

      if (this.$isElectron) {
        const { status, message, item } =
          await this.$electronService.updateVideo(
            this.editSessionItem,
            startVal,
            endVal,
            parseInt(this.duration)
          );

        if (status === STATUSES.ERROR) {
          this.$root.$emit("set-snackbar", message);
          console.log(message);
        } else {
          this.editSessionItem.filePath = item.filePath;
          this.editSessionItem.fileSize = item.fileSize;
          this.editSessionItem.fileChecksum = item.fileChecksum;
          this.$root.$emit("update-edit-item", this.editSessionItem);
          if (needCallback) {
            this.$root.$emit("save-data", this.editSessionItem);
          }
        }
      } else {
        this.$root.$emit("update-edit-item", this.editSessionItem);
        if (needCallback) {
          this.$root.$emit("save-data", this.editSessionItem);
        }
      }

      this.handleProcessing(false);
    },
    handleProcessing(value) {
      this.isProcessing = value;
      this.$root.$emit("update-processing", this.isProcessing);
    },
    logDuration() {
      this.duration = this.$refs.videoPlayer.duration;
    },
    setEndTime(value) {
      this.end = value;
    },
    timeInSeconds(value) {
      const timeArr = value.split(":");
      const minutes = parseInt(timeArr[0]);
      const seconds = parseInt(timeArr[1]);
      const total = minutes * 60 + seconds;
      return total;
    },
  },
};
</script>
<style scoped>
.preview-wrapper {
  text-align: center;
  position: relative;
}
.preview-wrapper img {
  width: 100%;
  filter: brightness(0.5);
  z-index: 99;
}
.progress-bar {
  position: absolute;
  width: 100%;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  max-width: 300px;
  z-index: 999;
}
.progress-bar .subtitle-2 {
  font-size: 14px;
  color: #d1d5db;
}
.v-progress-linear {
  border-radius: 12px;
  height: 10px;
  width: 100%;
}
.video-wrapper {
  display: flex;
  flex-direction: column;
  row-gap: 10px;
}
.video-wrapper .video-control {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.video-wrapper .video-control .cut-duration {
  display: flex;
  column-gap: 5px;
}
.video-wrapper .video-control .cut-duration .start-time {
  width: 65px;
}
.video-wrapper .video-control .cut-duration .end-time {
  width: 65px;
}
.video-wrapper .video-control .cut-duration .divider {
  display: flex;
  align-items: center;
  font-style: normal;
  font-weight: 500;
  font-size: 13px;
  line-height: 16px;
  color: #6b7280;
  padding-top: 20px;
}
.video-wrapper .video-control .cut-duration .duration-time {
  display: flex;
  align-items: center;
}

.video-wrapper .video-control .cut-duration .duration-time span {
  font-style: normal;
  font-weight: 500;
  font-size: 13px;
  line-height: 16px;
  color: #6b7280;
  padding-top: 20px;
}
</style>
