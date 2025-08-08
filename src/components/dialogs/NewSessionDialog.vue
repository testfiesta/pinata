<template>
  <v-dialog v-bind="$attrs" v-on="$listeners" persistent width="350">
    <v-sheet outlined rounded>
      <v-card :style="{ backgroundColor: currentTheme.background }">
        <v-card-text class="text" :style="{ color: currentTheme.secondary }">
          <div class="d-flex justify-space-between align-start">
            <p
              class="font-weight-medium fs-14 text-start"
              :style="{ color: currentTheme.secondary }"
            >
              {{ text }}
            </p>
            <button @click="$emit('discard')">
              <v-icon>mdi-close</v-icon>
            </button>
          </div>
        </v-card-text>
        <v-card-actions>
          <div class="row">
            <v-col cols="6">
              <v-btn
                ref="confirmBtn"
                depressed
                height="40px"
                width="100%"
                :color="currentTheme.primary"
                class="text-capitalize btn rounded-lg"
                :style="{ color: currentTheme.white }"
                v-shortkey="confirmHotkey"
                @shortkey="$emit('save')"
                @click="$emit('save')"
              >
                {{ $tc("caption.save", 1) }}
              </v-btn>
            </v-col>
            <v-col cols="6">
              <v-btn
                depressed
                height="40px"
                width="100%"
                :color="btnBg"
                class="text-capitalize btn rounded-lg"
                :style="{ color: currentTheme.secondary }"
                v-shortkey="cancelHotkey"
                @shortkey="$emit('discard')"
                @click="$emit('discard')"
              >
                {{ $tc("caption.discard", 1) }}
              </v-btn>
            </v-col>
          </div>
        </v-card-actions>
      </v-card>
    </v-sheet>
  </v-dialog>
</template>
<script>
import { mapGetters } from "vuex";
import theme from "../../mixins/theme";
export default {
  name: "NewSessionDialog",
  props: {
    title: String,
    text: String,
  },
  mixins: [theme],
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
  methods: {},
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
