<template>
  <v-dialog v-bind="$attrs" v-on="$listeners" persistent width="350">
    <v-sheet outlined rounded>
      <v-card :style="{ backgroundColor: currentTheme.background }">
        <LogoWrapper :height="20" :width="60" />
        <v-card-text class="text" :style="{ color: currentTheme.secondary }">
          {{ $tc("dialog.global_hotkeys_notice_message") }}
        </v-card-text>
        <v-card-actions>
          <v-btn
            small
            ref="confirmBtn"
            :color="currentTheme.primary"
            class="text-capitalize btn"
            :style="{ color: currentTheme.white }"
            v-shortkey="confirmHotkey"
            @shortkey="enableGlobalHotkeys"
            @click="enableGlobalHotkeys"
          >
            {{ $tc("caption.enable_global_hotkeys") }}
          </v-btn>
          <v-btn
            small
            :color="currentTheme.background"
            class="text-capitalize btn"
            :style="{ color: currentTheme.secondary }"
            v-shortkey="cancelHotkey"
            @shortkey="maybeLater"
            @click="maybeLater"
          >
            {{ $tc("caption.maybe_later") }}
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
  name: "GlobalHotkeysNoticeDialog",
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
    confirmHotkey() {
      return this.$hotkeyHelpers.findBinding("general.save", this.hotkeys);
    },
    cancelHotkey() {
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
    enableGlobalHotkeys() {
      this.$store.commit("config/setUseGlobalHotkeys", true);
      this.$store.commit("config/setHasShownGlobalHotkeysNotice", true);
      this.$emit("registerGlobalHotkeys");
    },
    maybeLater() {
      this.$store.commit("config/setHasShownGlobalHotkeysNotice", true);
      this.$emit("close");
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
