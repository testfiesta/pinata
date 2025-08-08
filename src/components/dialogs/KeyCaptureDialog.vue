<template>
  <v-dialog
    v-bind="$attrs"
    v-on="$listeners"
    persistent
    width="100%"
    max-width="500px"
    eager
  >
    <v-sheet outlined rounded>
      <v-card>
        <v-card-title class="body-1">
          {{ $tc("caption.key_capture", 1) }}
        </v-card-title>
        <v-card-text>
          <h1>{{ printBindings }}</h1>
        </v-card-text>
      </v-card>
    </v-sheet>
  </v-dialog>
</template>
<script>
import { mapGetters } from "vuex";

export default {
  name: "KeyCaptureDialog",
  components: {},
  props: {
    selectedKey: {
      type: String,
      default: () => "",
    },
    selectedBindings: {
      type: [Array, String],
      default: () => [],
    },
  },
  data() {
    return {
      closing: false,
      configKey: "",
      modifierKeys: [],
      characterKey: "",
    };
  },
  computed: {
    ...mapGetters({
      hotkeys: "config/hotkeys",
    }),
    printBindings() {
      if (!this.$hotkeyHelper) {
        return;
      }
      const currentBindings = [...this.modifierKeys, this.characterKey];
      return this.$hotkeyHelper.printBindings(currentBindings, this.hotkeys);
    },
    currentTheme() {
      if (this.$vuetify.theme.dark) {
        return this.$vuetify.theme.themes.dark;
      } else {
        return this.$vuetify.theme.themes.light;
      }
    },
  },
  mounted() {
    if (this.$el && this.$el.getAttribute("keydown-listener") !== "true") {
      document.addEventListener("keydown", (event) => {
        if (this.closing) return;

        let currentModifiers = [];
        if (event.ctrlKey) currentModifiers.push("ctrl");
        if (event.metaKey) currentModifiers.push("meta");
        if (event.altKey) currentModifiers.push("alt");
        if (event.shiftKey) currentModifiers.push("shift");
        if (currentModifiers.length > 0) {
          this.modifierKeys = currentModifiers;
        } else {
          this.modifierKeys = [];
        }
        if (event.key.length === 1 || event.key.length === 2) {
          // Non-control characters have a length of 1 (char keys) or 2 (f keys)
          this.characterKey = String.fromCharCode(event.which).toLowerCase();
          this.handleSave();
        } else {
          this.characterKey = "";
        }
      });
      this.$el.setAttribute("keydown-listener", "true");
    }
  },
  watch: {
    selectedKey: function (newValue) {
      this.configKey = newValue || "";
    },
    selectedBindings: function (newValue) {
      let temp = Object.assign([], newValue);
      this.characterKey = temp.pop() || "";
      this.modifierKeys = temp;
    },
  },
  methods: {
    handleSave() {
      // This prevents folks from swapping the keys during the delay between
      // saving and closing.
      this.closing = true;
      setTimeout(this.handleClose, 350);
    },
    handleClose() {
      // This is a weird hack because two of these show up in the component tree
      // in Vue Devtools - one without the props passed
      if (this.configKey && this.configKey.length > 0) {
        let bindings = [...this.modifierKeys, this.characterKey];

        this.$emit("saveKeyBinding", { key: this.configKey, bindings });
      }
      this.closing = false; // Reset closing after emitting the event
    },
  },
};
</script>
<style scoped>
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
  color: #111827 !important;
}
.caption {
  font-style: normal !important;
  font-weight: 500 !important;
  font-size: 13px !important;
  line-height: 16px !important;
  color: #6b7280;
}
</style>
