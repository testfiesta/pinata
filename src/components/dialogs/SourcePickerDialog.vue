<template>
  <v-dialog
    v-bind="$attrs"
    v-on="$listeners"
    persistent
    width="100%"
    eager
    content-class="rounded-12px"
    max-width="600px"
  >
    <v-sheet outlined rounded>
      <v-card :style="{ backgroundColor: currentTheme.background }">
        <v-card-title class="pa-6" :style="{ color: currentTheme.secondary }">
          <div class="d-flex justify-space-between align-center w-full">
            <span
              class="dialog-title fs-18 font-weight-semibold"
              :style="{ color: currentTheme.secondary }"
            >
              {{ $tc("message.select_window_to_record_session", 1) }}
            </span>
            <v-btn icon color="#98a2b3" @click="dialog = false">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </div>
        </v-card-title>
        <v-container>
          <v-row>
            <v-col cols="12" class="px-6 pt-0">
              <div class="wrapper">
                <v-radio-group v-model="activeSource">
                  <v-row class="session-list">
                    <v-col
                      class="session-item"
                      cols="6"
                      xs="6"
                      sm="4"
                      md="4"
                      v-for="item in sources"
                      :key="item.id"
                    >
                      <div
                        class="session-img cursor-pointer rounded-lg"
                        :class="{ selected: activeSource === item.id }"
                      >
                        <img
                          class="rounded-lg"
                          :src="item.thumbnail"
                          :alt="item.name"
                          @click="activeSource = item.id"
                        />
                      </div>
                      <div class="session-name mt-2">
                        <p
                          class="fs-16 font-weight-medium"
                          :style="{ color: currentTheme.secondary }"
                        >
                          {{ item.name }}
                        </p>
                      </div>
                      <div class="session-radio d-none">
                        <v-radio
                          dense
                          :value="item.id"
                          :ripple="false"
                        ></v-radio>
                      </div>
                    </v-col>
                  </v-row>
                </v-radio-group>
              </div>
            </v-col>
          </v-row>
        </v-container>
        <v-card-actions class="pa-0">
          <div
            class="d-flex justify-space-between align-center w-full px-6 pb-6"
          >
            <v-checkbox
              v-model="isTargetForAll"
              id="remember-me-checkbox"
              class="field-theme mt-0"
              hide-details
              :ripple="false"
              off-icon="icon-checkbox-off"
              on-icon="icon-checkbox-on"
              @change="setTargetForAll"
            >
              <template v-slot:label>
                <span class="fs-14" :style="{ color: currentTheme.secondary }">
                  {{ $tc("caption.keep_for_whole_session", 1) }}
                </span>
              </template>
            </v-checkbox>
            <div>
              <v-btn
                class="text-capitalize rounded-lg mr-3"
                :color="btnBg"
                v-shortkey="cancelHotkey"
                @shortkey="handleClose()"
                @click="handleClose()"
                depressed
              >
                {{ $tc("caption.cancel", 1) }}
              </v-btn>
              <v-btn
                class="text-capitalize rounded-lg"
                depressed
                :color="currentTheme.primary"
                :style="{ color: currentTheme.white }"
                :disabled="!activeSource"
                v-shortkey="confirmHotkey"
                @shortkey="handleSelect()"
                @click="handleSelect()"
              >
                {{ $tc("caption.select", 1) }}
              </v-btn>
            </div>
          </div>
        </v-card-actions>
      </v-card>
    </v-sheet>
  </v-dialog>
</template>

<script>
import { mapGetters } from "vuex";

export default {
  name: "SourcePickerDialog",
  props: {
    sources: {
      type: Array,
      default: () => [],
    },
    sourceId: {
      type: String,
      default: () => "",
    },
  },
  data() {
    return {
      activeSource: "",
      isTargetForAll: this.$store.state.session.isTargetForAll,
    };
  },
  watch: {
    sourceId: function () {
      this.activeSource = this.sourceId;
    },
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
    btnBg() {
      return this.$vuetify.theme.dark ? "#4B5563" : "#F2F4F7";
    },
  },
  methods: {
    handleClose() {
      this.activeSource = "";
      this.$root.$emit("close-sourcepickerdialog");
    },
    handleSelect() {
      this.$emit("submit-source", this.activeSource);
    },
    setTargetForAll() {
      this.$store.commit("setTargetForAll", this.isTargetForAll);
    },
    setActiveSource(value) {
      this.activeSource = value;
    },
  },
};
</script>

<style scoped>
.wrapper {
  display: flex;
  flex-direction: column;
  height: 400px;
  width: 100%;
  overflow-y: auto;
  overflow-x: hidden;
}

.header {
  width: 100%;
  padding: 15px;
  border-bottom: 1px solid #e5e7eb;
}

.theme--dark .header {
  border-color: #374151;
}

.header span {
  font-style: normal;
  font-weight: 600;
  font-size: 14px;
  line-height: 20px;
  color: #111827;
}

.content {
  flex-grow: 1;
  overflow: auto;
  padding: 15px;
}

.footer {
  width: 100%;
  padding: 15px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  column-gap: 12px;
}

.theme--dark .footer {
  border-color: #374151;
}

.session-list .session-item {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
}
.session-list .session-item .session-img {
  border-radius: 4px;
  display: flex;
  width: 100%;
  background: #000;
  justify-content: center;
}

.session-list .session-item .session-img img {
  height: 100px;
  max-width: 100%;
  object-fit: contain;
}

.session-list .session-item .session-name {
  padding: 5px;
  padding-bottom: 0;
  text-align: left;
  display: flex;
  justify-content: flex-start;
  width: 100%;
}
.session-list .session-item .session-name p {
  font-style: normal;
  font-weight: 500;
  font-size: 13px;
  line-height: 16px;
  text-align: center;
  color: #111827;
  margin-bottom: 0px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.v-input--selection-controls__input {
  width: 16px;
  height: 16px;
}
.session-img.selected {
  border: solid 3px #0c2ff3;
  border-radius: 8px;
}
.session-img {
  border: solid 3px transparent;
}
</style>
