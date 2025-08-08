<template>
  <div v-if="item" class="audio-wrapper">
    <div ref="waveform" class="mb-2 waveform"></div>
    <v-row>
      <v-col cols="12" class="progress-bar">
        <span class="time" :style="{ color: currentTheme.secondary }"
          >00:00</span
        >
        <div class="progress">
          <v-slider
            class="slider-theme"
            v-model="currentProgress"
            max="100"
            min="0"
            color="primary"
            step="1"
            thumb-label
            :thumb-size="20"
            hide-details
            hide-spin-buttons
            track-color="#F2F4F7"
            thumb-color="#FFFFFF"
            @change="syncSlideWithAudio"
          ></v-slider>
        </div>
        <!-- move prop from controlPanel and get colors from Vuetify.js -->
        <span class="time" :style="{ color: currentTheme.secondary }">{{
          durationTime
        }}</span>
      </v-col>
    </v-row>
    <v-row class="d-flex justify-space-between">
      <v-col cols="auto" class="pa-0 btn-panel">
        <v-btn
          id="btn_rewind"
          icon
          color="#6b7280"
          @click="wavesurfer.skipBackward(1)"
        >
          <v-icon>mdi-rewind</v-icon>
        </v-btn>
        <v-btn
          id="btn_play"
          v-if="!isPlaying"
          icon
          color="#6b7280"
          @click="wavesurfer.playPause()"
        >
          <v-icon>mdi-play-circle</v-icon>
        </v-btn>
        <v-btn
          id="btn_pause"
          v-if="isPlaying"
          icon
          color="#6b7280"
          @click="wavesurfer.playPause()"
        >
          <v-icon>mdi-pause-circle</v-icon>
        </v-btn>
        <v-btn
          id="btn_forward"
          icon
          color="#6b7280"
          @click="wavesurfer.skipForward(1)"
        >
          <v-icon>mdi-fast-forward</v-icon>
        </v-btn>
      </v-col>
      <v-col cols="auto" class="pa-0">
        <div class="volume-control">
          <div class="volume-btn">
            <v-btn
              id="btn_volume_off"
              v-if="!isMute"
              icon
              color="#111827"
              @click="toggleMute()"
            >
              <v-icon>mdi-volume-high</v-icon>
            </v-btn>
            <v-btn
              id="btn_volume_on"
              v-if="isMute"
              icon
              color="#111827"
              @click="toggleMute()"
            >
              <v-icon>mdi-volume-off</v-icon>
            </v-btn>
          </div>
          <div class="volume-progress">
            <v-slider
              class="slider-theme"
              v-model="volume"
              color="primary"
              step="1"
              thumb-label
              track-color="#F2F4F7"
              thumb-color="#FFFFFF"
              :thumb-size="20"
              hide-details
              hide-spin-buttons
              @change="setVolume()"
            ></v-slider>
          </div>
        </div>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import WaveSurfer from "wavesurfer.js";
import { STATUSES } from "@/modules/constants";
import { createImageForWeb } from "@/helpers/WebHelpers";

export default {
  name: "AudioWrapper",
  props: {
    item: {
      type: Object,
      default: () => {},
    },
    triggerSave: {
      type: Boolean,
      default: () => false,
    },
  },
  data() {
    return {
      sessionItem: this.item,
      wavesurfer: null,
      volume: 20,
      currentProgress: 0,
    };
  },
  watch: {
    item: function (newValue) {
      this.sessionItem = newValue;
    },
    triggerSave: function (oldValue, newValue) {
      if (oldValue !== newValue) {
        this.handleAudio();
      }
    },
  },
  computed: {
    currentTheme() {
      if (this.$vuetify.theme.dark) {
        return this.$vuetify.theme.themes.dark;
      } else {
        return this.$vuetify.theme.themes.light;
      }
    },
    isPlaying() {
      if (!this.wavesurfer) return false;

      return this.wavesurfer.isPlaying();
    },
    isMute() {
      return this.volume === 0;
    },
    durationTime() {
      let duration;
      if (!this.wavesurfer) {
        duration = 0;
      } else {
        duration = parseFloat(this.wavesurfer.getDuration()).toFixed(2);
      }

      const date = new Date(null);
      date.setSeconds(duration);
      const result = date.toISOString().substr(14, 5);
      return result;
    },
  },
  mounted() {
    if (!this.wavesurfer) {
      this.$nextTick(async () => {
        await this.createWaveSurfer();
      });
    }
  },
  methods: {
    async createWaveSurfer() {
      this.wavesurfer = WaveSurfer.create({
        container: this.$refs.waveform,
        // hideScrollbar: false,
        waveColor: "#6B7280",
        progressColor: "hsla(200, 100%, 30%, 0.5)",
        cursorColor: "#000",
        barWidth: 3,
      });
      const filePath = this.$isElectron
        ? `file://${this.item.filePath}`
        : this.item.filePath;

      this.wavesurfer.load(filePath);

      this.wavesurfer.on("audioprocess", () => {
        this.setCurrentProgress();
      });
    },
    setCurrentProgress() {
      if (!this.wavesurfer) return 0;

      // return this.wavesurfer.getCurrentTime();
      const duration = parseFloat(this.wavesurfer.getDuration());
      const current = parseFloat(this.wavesurfer.getCurrentTime());
      this.currentProgress = Math.round((current / duration) * 100);
    },
    syncSlideWithAudio() {
      this.wavesurfer.seekTo(this.currentProgress / 100);
    },
    setVolume() {
      const volume = Math.round(this.volume);
      if (volume === 0) {
        this.wavesurfer.setMute(true);
      } else {
        this.wavesurfer.setMute(false);
      }
      this.wavesurfer.setVolume(volume);
    },
    toggleMute() {
      this.volume = this.isMute ? 20 : 0;
      this.setVolume();
    },
    async handleAudio() {
      const uri = this.wavesurfer.exportImage("image/png", 1, "dataURL");
      console.log("Generated URI:", uri);

      if (this.$isElectron) {
        // Ensure sessionItem is serializable
        const sanitizedItem = JSON.parse(JSON.stringify(this.sessionItem));

        try {
          const posterResult = await this.$electronService.createImage(
            uri,
            true
          );
          console.log("Poster Result:", posterResult);

          if (posterResult.status === STATUSES.ERROR) {
            this.$root.$emit("set-snackbar", posterResult.message);
            console.error(
              "Unable to generate waveform image:",
              posterResult.message
            );
          }

          const audioResult = await this.$electronService.updateAudio(
            sanitizedItem
          );

          if (audioResult.status === STATUSES.ERROR) {
            this.$root.$emit("set-snackbar", audioResult.message);
            console.error("Unable to update audio file:", audioResult.message);
          }

          this.sessionItem = {
            ...sanitizedItem,
            poster: posterResult.item.filePath,
            ...audioResult.item,
          };
        } catch (error) {
          console.error("Error in Electron service:", error);
        }
      } else {
        const posterResult = createImageForWeb(uri);
        console.log("Poster Result (Web):", posterResult);

        this.sessionItem = {
          ...this.sessionItem,
          poster: posterResult.item.filePath,
        };
      }

      this.$root.$emit("update-edit-item", { ...this.sessionItem });
      this.$root.$emit("save-data", { ...this.sessionItem });
    },
  },
};
</script>
<style scoped>
.audio-wrapper {
  padding: 0 5px;
}
.progress-bar {
  display: flex;
  flex-direction: row;
  align-items: center;
  column-gap: 5px;
}
.progress-bar .time {
  font-style: normal;
  font-weight: 500;
  font-size: 14px;
  line-height: 24px;
  color: #1f2937;
}
.progress-bar .progress {
  flex-grow: 1;
}
.volume-control {
  display: flex;
  align-items: center;
}
.volume-control .volume-progress {
  width: 120px;
}
</style>
