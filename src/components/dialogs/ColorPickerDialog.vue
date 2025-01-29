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
      <v-card :style="{ backgroundColor: currentTheme.background }">
        <v-card-title
          class="dialog-title"
          :style="{ color: currentTheme.secondary }"
        >
          {{ $tc("caption.color_picker", 1) }}
        </v-card-title>
        <v-divider></v-divider>
        <v-container class="about-wrapper">
          <div
            class="flex flex-row align-center justify-center w-full gap-sm mb-4"
          >
            <div>
              <v-btn
                :class="
                  active === 'fill'
                    ? 'btn secondary-btn btn-active'
                    : 'btn secondary-btn'
                "
                small
                block
                @click="handleActive('fill')"
              >
                <div class="flex flex-row align-center justify-center">
                  <img
                    :src="require('../../assets/icon/fill.svg')"
                    width="24"
                    height="24"
                  />
                  {{ $tc("caption.fill", 1) }}
                </div>
              </v-btn>
            </div>
            <div>
              <v-btn
                :class="
                  active === 'transparent'
                    ? 'btn secondary-btn btn-active'
                    : 'btn secondary-btn'
                "
                small
                block
                @click="handleActive('transparent')"
              >
                <div class="flex flex-row align-center justify-center">
                  <img
                    :src="require('../../assets/icon/transparent.svg')"
                    width="24"
                    height="24"
                  />
                  {{ $tc("caption.transparent", 1) }}
                </div>
              </v-btn>
            </div>
            <div>
              <v-btn
                :class="
                  active === 'nofill'
                    ? 'btn secondary-btn btn-active'
                    : 'btn secondary-btn'
                "
                small
                block
                @click="handleActive('nofill')"
              >
                <div class="flex flex-row align-center justify-center">
                  <img
                    :src="require('../../assets/icon/nofill.svg')"
                    width="24"
                    height="24"
                  />
                  {{ $tc("caption.no_fill", 1) }}
                </div>
              </v-btn>
            </div>
          </div>
          <div class="flex flex-column align-center justify-center">
            <div class="flex flex-row align-center justify-center w-full">
              <div
                v-for="color in colors1"
                :key="color"
                class="color-item"
                :class="
                  activeColor === color
                    ? 'color-item color-item-active'
                    : 'color-item'
                "
                @click="handleSetColorActive(color)"
                :style="{ backgroundColor: color }"
              />
              <div
                :style="{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #CCCCCC',
                }"
                @click="handleSetColorActive('#FFFFFF')"
                :class="
                  activeColor === '#FFFFFF'
                    ? 'color-item color-item-active'
                    : 'color-item'
                "
              ></div>
            </div>
            <div class="flex flex-row align-center justify-center w-full">
              <div
                v-for="color in colors2"
                :key="color"
                :class="
                  activeColor === color
                    ? 'color-item color-item-active'
                    : 'color-item'
                "
                @click="handleSetColorActive(color)"
                class="color-item"
                :style="{ backgroundColor: color }"
              />
              <ColorPanel :colorType="colorType" :style="{ margin: '5px' }" />
            </div>
          </div>
        </v-container>
        <v-divider></v-divider>
        <v-card-actions>
          <v-row class="action-wrapper">
            <v-col cols="6">
              <v-btn
                class="btn secondary-btn rounded-lg text-capitalize"
                fill
                block
                height="40px"
                depressed
                plain
                color="secondary"
                v-shortkey="closeHotkey"
                @shortkey="handleClose()"
                @click="handleClose()"
              >
                {{ $tc("caption.cancel", 1) }}
              </v-btn>
            </v-col>
            <v-col cols="6">
              <v-btn
                class="btn rounded-lg text-capitalize"
                block
                height="40px"
                depressed
                :color="currentTheme.primary"
                :style="{ color: currentTheme.white }"
                v-shortkey="saveHotkey"
                @shortkey="handleSave(activeColor, active)"
                @click="handleSave(activeColor, active)"
              >
                {{ $tc("caption.save", 1) }}
              </v-btn>
            </v-col>
          </v-row>
        </v-card-actions>
        <div></div>
      </v-card>
    </v-sheet>
  </v-dialog>
</template>

<script>
import { mapGetters } from "vuex";
import ColorPanel from "../mindmap/ColorPanel.vue";

export default {
  name: "ColorPickerDialog",
  props: {
    version: {
      type: String,
      default: () => "",
    },
    colorType: {
      type: String,
      default: () => "marker",
    },
    close: {
      type: Function,
    },
    save: {
      type: Function,
    },
  },
  components: {
    ColorPanel,
  },
  data() {
    return {
      active: "fill",
      activeColor: "#101828",
      colors1: [
        "#101828",
        "#98A2B3",
        "#F4284E",
        "#F79009",
        "#17B26A",
        "#0BA5EC",
        "#7A5AF8",
      ],
      colors2: [
        "#D0D5DD",
        "#EAECF0",
        "#FFB9C6",
        "#FFCA84",
        "#BFFFE1",
        "#B7E8FF",
        "#C7B9FF",
      ],
    };
  },
  mounted() {
    this.$root.$on("update-color-panel", this.handleUpdateColor);
  },
  computed: {
    ...mapGetters({
      config: "config/fullConfig",
    }),
    closeHotkey() {
      return this.$hotkeyHelpers.findBinding(
        "general.cancel",
        this.$store.getters["config/hotkeys"]
      );
    },
    saveHotkey() {
      return this.$hotkeyHelpers.findBinding(
        "general.save",
        this.$store.getters["config/hotkeys"]
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
    handleClose() {
      this.$emit("close");
    },
    handleSave(color, type) {
      this.$emit("save", { color, type });
    },
    handleActive(type) {
      this.active = type;
    },
    handleSetColorActive(color) {
      this.activeColor = color;
    },
    handleUpdateColor(color) {
      let index = this.colors1.indexOf(this.activeColor);
      if (index !== -1) this.colors1[index] = color;
      index = this.colors2.indexOf(this.activeColor);
      if (index !== -1) this.colors2[index] = color;
      this.activeColor = color;
    },
  },
};
</script>

<style scoped>
.dialog-title {
  /* border-bottom: 1px solid #e5e7eb; */
  font-size: 14px;
  font-style: normal;
  font-weight: 600;
  line-height: 20px;
  color: #111827;
  padding: 12px;
}
.dialog-content {
  max-height: 250px;
  overflow-y: auto;
}
.secondary-btn {
  background: #f2f4f7;
  font-weight: 700;
  box-shadow: 0px 1px 2px rgba(0, 0, 0, 0.05);
  border-radius: 8px;
}
.btn-active {
  border: 3px solid #dbe1fd;
}
.color-item {
  cursor: pointer;
  width: 30px;
  height: 30px;
  margin: 5px;
  border-radius: 50%;
}
.color-item-active {
  border: 2px solid #a8b0ca;
}
.about-wrapper {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  padding-top: 50px;
  padding-bottom: 50px;
}
.v-card__actions {
  padding: 12px;
}
</style>
