<template>
  <v-container class="content-wrapper">
    <div class="title">{{ $tc("caption.hotkeys", 1) }}</div>
    <p class="subtitle-1 mb-4" :style="{ color: currentTheme.default }">
      {{ $t("message.speed_hotkey") }}
    </p>

    <v-row v-if="configToChange">
      <v-col cols="12" class="pa-4">
        <div class="mb-3 session-type">
          <p class="subtitle-1 mb-1" :style="{ color: currentTheme.secondary }">
            {{ $tc("caption.apply_to", 1) }}
          </p>
          <v-select
            :items="hotkeyPages"
            v-model="chosenPage"
            :label="$tc('caption.hotkey_pages', 1)"
            solo
            dense
            hide-details="true"
          ></v-select>
        </div>
        <div class="mb-3 precond">
          <v-list-item
            v-for="(bindings, key) in hotkeys[chosenPage]"
            :key="key"
          >
            <v-list-item-content>
              <v-list-item-title>
                {{ $tc(`hotkeys.${key}`, 1) }}:
              </v-list-item-title>
            </v-list-item-content>
            <v-list-item-action @click="showKeyCaptureDialog(key, bindings)">
              <v-btn fill small block>
                {{ $hotkeyHelpers.printBindings(bindings) }}
              </v-btn>
            </v-list-item-action>
          </v-list-item>
        </div>
      </v-col>
    </v-row>
    <KeyCaptureDialog
      v-model="keyCaptureDialog"
      @saveKeyBinding="saveKeyBinding"
      :selectedKey="selectedKey"
      :selectedBindings="selectedBindings"
    />
  </v-container>
</template>

<script>
import { HOTKEY_PAGES } from "../../modules/constants";

import KeyCaptureDialog from "../dialogs/KeyCaptureDialog.vue";
import { mapGetters } from "vuex";

export default {
  name: "HotkeyTab",
  components: {
    KeyCaptureDialog,
  },
  props: {},
  computed: {
    ...mapGetters({
      config: "config/fullConfig",
    }),
    currentTheme() {
      if (this.$vuetify.theme.dark) {
        return this.$vuetify.theme.themes.dark;
      } else {
        return this.$vuetify.theme.themes.light;
      }
    },
  },
  data() {
    return {
      configToChange: null,
      hotkeys: null,
      chosenPage: "",
      hotkeyPages: HOTKEY_PAGES,
      keyCaptureDialog: false,
      selectedKey: "",
      selectedBindings: [],
    };
  },
  created() {
    this.hotkeyPages = HOTKEY_PAGES.map((value) => {
      return {
        value,
        text: this.$tc(`hotkeys.${value}`, 1),
      };
    });
  },
  mounted() {
    this.configToChange = structuredClone(this.config);
    this.hotkeys = this.configToChange.hotkeys;
    if (this.chosenPage === "") {
      this.chosenPage = Object.keys(this.configToChange.hotkeys)[0];
    }
  },
  methods: {
    saveKeyBinding({ key, bindings }) {
      if (!key || !bindings) return;
      // Accept key and binding, then update and save
      this.hotkeys[this.chosenPage][key] = bindings;
      this.configToChange.hotkeys = this.hotkeys;

      this.$emit("submit-config", this.configToChange);

      this.keyCaptureDialog = false;
      this.selectedKey = "";
      this.selectedBindings = [];
    },
    showKeyCaptureDialog(key, bindings) {
      this.selectedKey = key;
      this.selectedBindings = bindings;
      this.keyCaptureDialog = true;
    },
  },
};
</script>
<style scoped>
.content-wrapper {
  width: 100%;
  overflow-y: auto;
}
.body-1 {
  font-style: normal !important;
  font-weight: 500 !important;
  font-size: 12px !important;
  line-height: 16px !important;
  letter-spacing: 0.05em !important;
  text-transform: uppercase !important;
  color: #6b7280 !important;
}
.subtitle-1 {
  font-style: normal !important;
  font-weight: 500 !important;
  font-size: 14px !important;
  line-height: 20px !important;
}
.caption {
  font-style: normal !important;
  font-weight: 500 !important;
  font-size: 13px !important;
  line-height: 16px !important;
  color: #6b7280;
}
</style>
