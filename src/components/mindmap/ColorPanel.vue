<template>
  <div class="d-flex align-start">
    <v-menu
      v-model="menu"
      top
      nudge-bottom="105"
      nudge-left="16"
      :close-on-content-click="false"
    >
      <template v-slot:activator="{ on }">
        <img
          v-on="on"
          :style="swatchStyle"
          :src="require('../../assets/icon/color-panel.svg')"
          width="30"
          height="30"
        />
      </template>
      <v-card>
        <v-card-text class="pa-0">
          <v-color-picker v-model="color" />
        </v-card-text>
      </v-card>
    </v-menu>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
export default {
  name: "ColorPanel",
  props: {
    colorType: {
      type: String,
      default: () => "marker",
    },
  },
  watch: {
    colorType: function (newValue) {
      this.type = newValue;
    },
    color: function (newValue, oldValue) {
      if (newValue === oldValue) return;
      this.configToChange = structuredClone(this.config);
      this.configToChange.colors[this.type + "Color"] = newValue;
      this.handleConfig();
    },
  },
  created() {
    this.colors = this.config?.colors;
  },
  computed: {
    ...mapGetters({
      config: "config/fullConfig",
      credentials: "auth/credentials",
    }),
    showColor() {
      let colorType = this.type + "Color";
      return this.colors[colorType] ? this.colors[colorType] : "#1976D2FF";
    },
    swatchStyle() {
      return {
        cursor: "pointer",
        height: "30px",
        width: "30px",
        borderRadius: "50%",
        transition: "border-radius 200ms ease-in-out",
      };
    },
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
      type: this.colorType,
      colors: this.config?.colors,
      configToChange: null,
      menu: false,
      color: "#1976D2FF",
    };
  },
  methods: {
    handleConfig() {
      this.colors = this.configToChange.colors;
      this.$storageService.updateConfig(this.configToChange);
      this.$root.$emit("update-color-panel", this.color);
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
}
.subtitle-1 {
  font-style: normal !important;
  font-weight: 500 !important;
  font-size: 14px !important;
  line-height: 20px !important;
}
.note-caption {
  font-style: italic !important;
  font-weight: 500 !important;
  font-size: 13px !important;
  line-height: 16px !important;
  color: #6b7280;
}
.caption {
  font-style: normal !important;
  font-weight: 500 !important;
  font-size: 13px !important;
  line-height: 16px !important;
}
.v-radio .v-label {
  font-style: normal !important;
  font-weight: 500 !important;
  font-size: 14px !important;
  line-height: 20px !important;
}
.border-bottom {
  border-bottom: 1px solid #e5e7eb;
}
.theme--dark .border-bottom {
  border-color: #374151;
}
.theme--light .border-bottom {
  border-color: #e5e7eb;
}
.align-center {
  align-items: center;
}
</style>
