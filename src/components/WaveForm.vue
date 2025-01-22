<template>
  <div class="d-flex justify-start align-center">
    <v-btn
      class="pa-0 mr-3"
      height="44"
      width="44"
      fab
      color="primary"
      depressed
      @click="playPause"
    >
      <img :src="playPauseIcon" width="20" height="20" />
    </v-btn>
    <div class="d-flex flex-column align-start justify-start w-full">
      <div ref="waveform" class="waveform mb-1"></div>
      <span>{{ currentTime }} / {{ totalDuration }}</span>
    </div>
  </div>
</template>

<script>
import WaveSurfer from "wavesurfer.js";

export default {
  name: "WaveSurferPlayer",
  props: {
    audioFile: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      waveSurfer: null,
      isPlaying: false,
      currentTime: "00:00",
      totalDuration: "00:00",
    };
  },
  computed: {
    playPauseIcon() {
      return this.isPlaying
        ? require("../assets/icon/timeline-icon/play20px.svg")
        : require("../assets/icon/timeline-icon/pause20px.svg");
    },
  },
  mounted() {
    // Initialize WaveSurfer
    this.waveSurfer = WaveSurfer.create({
      container: this.$refs.waveform,
      waveColor: "#98A2B3",
      progressColor: "#182230",
      barWidth: 4,
      barGap: 2,
      barRadius: 2,
      responsive: true,
      height: 24,
    });

    // Load the audio file
    this.waveSurfer.load(this.audioFile);

    this.waveSurfer.on("play", () => {
      this.isPlaying = true;
    });
    this.waveSurfer.on("pause", () => {
      this.isPlaying = false;
    });
    this.waveSurfer.on("ready", () => {
      this.totalDuration = this.formatTime(this.waveSurfer.getDuration());
    });
    this.waveSurfer.on("audioprocess", () => {
      this.currentTime = this.formatTime(this.waveSurfer.getCurrentTime());
    });
  },
  methods: {
    playPause() {
      this.waveSurfer.playPause();
    },
    stop() {
      this.waveSurfer.stop();
      this.currentTime = "00:00";
      this.isPlaying = false;
    },
    formatTime(seconds) {
      const mins = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      return `${String(mins).padStart(2, "0")}:${String(secs).padStart(
        2,
        "0"
      )}`;
    },
  },
  beforeDestroy() {
    // Clean up WaveSurfer instance
    if (this.waveSurfer) {
      this.waveSurfer.destroy();
    }
  },
};
</script>

<style scoped>
.waveform {
  width: 100%;
  height: 24px;
}
</style>
