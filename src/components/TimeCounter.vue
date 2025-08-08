<template>
  <v-container class="timecounter-wrapper">
    <v-row class="ma-0">
      <v-col cols="12" class="pa-0">
        <div class="time-wrapper">
          <div class="time">
            <span class="time-title">
              {{ $tc("caption.elapsed_time", 1) }}
            </span>
            <span class="time-value" :style="{ color: currentTheme.secondary }">
              {{ elapsedTime }}
            </span>
          </div>
          <div class="time">
            <span class="time-title" :class="{ overtime: isOverTimeLimit }">
              {{ $tc("caption.remaining_time", 1) }}
            </span>
            <span
              :class="[
                'time-value',
                this.$store.state.session.status,
                { overtime: isOverTimeLimit },
              ]"
              :style="{ color: currentTheme.secondary }"
              >{{ remainingTime }}</span
            >
          </div>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { VContainer, VRow, VCol } from "vuetify/lib/components";

export default {
  name: "TimeCounter",
  components: {
    VContainer,
    VRow,
    VCol,
  },
  data() {
    return {};
  },
  computed: {
    elapsedTime() {
      const timer = this.$store.state.session.timer;
      const date = new Date(null);
      date.setSeconds(timer);
      const result = date.toISOString().substr(11, 8);
      return result;
    },
    currentTheme() {
      if (this.$vuetify.theme.dark) {
        return this.$vuetify.theme.themes.dark;
      } else {
        return this.$vuetify.theme.themes.light;
      }
    },
    remainingTime() {
      const elapsedTime = this.$store.state.session.timer;
      const timer = this.$store.state.case.duration;
      const remainingSeconds = timer - elapsedTime;
      if (remainingSeconds >= 0) {
        const date = new Date(null);
        date.setSeconds(remainingSeconds);
        return date.toISOString().substr(11, 8);
      } else {
        return "00:00";
      }
    },
    isOverTimeLimit() {
      const elapsedTime = this.$store.state.session.timer;
      const timer = this.$store.state.case.duration;
      return timer - elapsedTime < 0;
    },
  },
};
</script>
<style scoped>
.timecounter-wrapper {
  border-top: 1px solid #e5e7eb;
  background: #f3f4f6;
}
.time-wrapper {
  display: flex;
  flex-direction: row;
  column-gap: 2rem;
  justify-content: center;
}
.time-wrapper .time {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.time-wrapper .time .time-title {
  font-size: 13px;
  color: #6b7280;
  line-height: 1;
}
.time-wrapper .time .time-value {
  font-size: 16px;
  color: #0a26c3;
}
.time-wrapper .time .time-value.proceed {
  color: #ff6000;
}

.theme--dark .timecounter-wrapper {
  background-color: #374151;
  border-top: 1px solid #4b5563;
}

.overtime {
  color: crimson !important;
  font-weight: bold;
}
</style>
