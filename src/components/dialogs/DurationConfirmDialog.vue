<template>
  <v-dialog v-bind="$attrs" v-on="$listeners" persistent width="350">
    <v-sheet outlined rounded>
      <v-card :style="{ backgroundColor: currentTheme.background }">
        <LogoWrapper :height="20" :width="60" />
        <v-card-text class="text" :style="{ color: currentTheme.secondary }">
          {{ text || $t("message.confirm_delete") }}
        </v-card-text>
        <v-card-actions>
          <v-btn
            small
            :color="currentTheme.primary"
            :style="{ color: currentTheme.white }"
            class="text-capitalize btn"
            v-shortkey="proceedHotkey"
            @shortkey="handleProceed()"
            @click="handleProceed()"
          >
            {{ $tc("caption.proceed", 1) }}
          </v-btn>
          <v-btn
            small
            :color="currentTheme.background"
            :style="{ color: currentTheme.secondary }"
            class="text-capitalize btn"
            v-shortkey="endHotkey"
            @shortkey="handleEnd()"
            @click="handleEnd()"
          >
            {{ $tc("caption.end", 1) }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-sheet>
  </v-dialog>
</template>

<script>
import { mapGetters } from "vuex";
import LogoWrapper from "../LogoWrapper.vue";
export default {
  name: "DurationConfirmDialog",
  components: {
    LogoWrapper,
  },
  props: {
    title: String,
    text: String,
  },
  data() {
    return {};
  },
  computed: {
    ...mapGetters({
      hotkeys: "config/hotkeys",
    }),
    proceedHotkey() {
      return this.$hotkeyHelpers.findBinding("general.save", this.hotkeys);
    },
    endHotkey() {
      return this.$hotkeyHelpers.findBinding("general.cancel", this.hotkeys);
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
    handleProceed() {
      this.$emit("proceed");
    },
    handleEnd() {
      this.$emit("end");
    },
  },
};
</script>

<style scoped>
.v-card {
  padding: 24px;
}
.v-card__title {
  padding: 0;
  padding-top: 0.5rem;
  font-style: normal;
  font-weight: 600;
  font-size: 14px;
  line-height: 20px;
  color: #111827;
}
.v-card__text {
  padding: 0;
  padding-top: 0.5rem;
  font-style: normal;
  font-weight: 500;
  font-size: 13px;
  line-height: 16px;
  color: #6b7280;
}
.v-card__actions {
  padding: 0;
  padding-top: 1rem;
}
</style>
