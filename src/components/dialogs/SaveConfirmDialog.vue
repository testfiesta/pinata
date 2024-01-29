<template>
  <v-dialog v-bind="$attrs" v-on="$listeners" persistent width="350">
    <v-sheet outlined rounded>
      <v-card :style="{ backgroundColor: currentTheme.background }">
        <LogoWrapper :height="20" :width="60" />
        <v-card-text class="text" :style="{ color: currentTheme.secondary }">
          {{ text }}
        </v-card-text>
        <v-card-actions>
          <v-btn
            small
            ref="confirmBtn"
            color="currentTheme.primary"
            class="text-uppercase btn"
            v-shortkey="confirmHotkey"
            @shortkey="handleConfirm()"
            @click="handleConfirm()"
          >
            {{ $tc("ok", 1) }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-sheet>
  </v-dialog>
</template>

<script>
import LogoWrapper from "../LogoWrapper.vue";
export default {
  name: "SaveConfirmDialog",
  components: {
    LogoWrapper,
  },
  props: {
    configItem: {
      type: Object,
      default: () => {},
    },
    title: String,
    text: String,
  },
  data() {
    return {
      config: this.configItem,
    };
  },
  watch: {
    configItem: function (newValue) {
      this.config = newValue;
    },
  },
  computed: {
    confirmHotkey() {
      return this.$hotkeyHelpers.findBinding(
        "general.save",
        this.config.hotkeys
      );
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
    handleConfirm() {
      this.$emit("confirm");
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
