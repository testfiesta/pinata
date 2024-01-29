<template>
  <v-container>
    <v-row class="text-left">
      <v-col cols="12">
        <div class="title">
          <div
            class="subtitle-2 label-text"
            :style="{ color: currentTheme.secondary }"
            v-shortkey="titleHotkey"
            @shortkey="$hotkeyHelpers.focusField($refs, 'titleTextField')"
          >
            {{ $tc("caption.title", 1) }}
          </div>
          <v-text-field
            :placeholder="$t('message.enter_brief_charter_name')"
            autofocus
            outlined
            dense
            :height="35"
            :color="currentTheme.secondary"
            :loading="titleLoading"
            :append-icon="
              isAiAssistEnabled
                ? previousTitle
                  ? 'mdi-robot-off-outline'
                  : 'mdi-robot-outline'
                : ''
            "
            v-model="title"
            ref="titleTextField"
            @change="updateTitle"
            @click:append="handleAISuggestion('title', $event)"
          >
            <template v-slot:progress>
              <v-progress-linear
                :color="currentTheme.primary"
                absolute
                height="5"
                indeterminate
              ></v-progress-linear>
            </template>
          </v-text-field>
        </div>
        <div class="mt-4">
          <div
            class="subtitle-2 label-text"
            :style="{ color: currentTheme.secondary }"
            v-shortkey="charterHotkey"
            @shortkey="$hotkeyHelpers.focusField($refs, 'charter')"
          >
            {{ $tc("caption.charter", 1) }}
          </div>
          <v-tabs
            class="charter-tab"
            hide-slider
            :background-color="currentTheme.primary"
            :color="currentTheme.white"
            :height="32"
          >
            <v-tab ripple class="text-capitalize">
              {{ $tc("caption.editor", 1) }}
            </v-tab>
            <v-tab ripple class="text-capitalize">
              {{ $tc("caption.mind_map", 1) }}
            </v-tab>
            <v-tab-item :transition="false">
              <v-card
                v-if="charterLoading"
                class="loading-wrapper"
                outlined
                flat
              >
                <v-progress-circular
                  :color="currentTheme.primary"
                  size="70"
                  absolute
                  indeterminate
                ></v-progress-circular>
              </v-card>
              <v-tiptap
                v-else
                v-model="charter.content"
                :placeholder="$t('message.describe_test_charter')"
                ref="charter"
                :toolbar="[
                  'headings',
                  '|',
                  'bold',
                  'italic',
                  'underline',
                  '|',
                  'color',
                  '|',
                  'bulletList',
                  'orderedList',
                  '|',
                  'link',
                  'emoji',
                  'blockquote',
                  '|',
                  '#aiAssist',
                ]"
                @change="updateCharter()"
              >
                <template #aiAssist="">
                  <v-btn
                    v-if="isAiAssistEnabled"
                    icon
                    small
                    :title="$tc('caption.ai_assist', 1)"
                    @click="handleAISuggestion('charter', $event)"
                  >
                    <v-icon>{{
                      previousCharter?.content
                        ? "mdi-robot-off-outline"
                        : "mdi-robot-outline"
                    }}</v-icon>
                  </v-btn>
                </template>
              </v-tiptap>
            </v-tab-item>
            <v-tab-item :transition="false">
              <div class="mindmap-wrapper">
                <mindmap-editor
                  :nodesData="mindmap.nodes"
                  :connectionsData="mindmap.connections"
                  :edit="true"
                  :auto-save="true"
                  @submit-mindmap="handleMindmap"
                />
              </div>
            </v-tab-item>
          </v-tabs>
        </div>
        <div class="mt-4 timelimit">
          <div
            class="subtitle-2 label-text"
            :style="{ color: currentTheme.secondary }"
            v-shortkey="timeLimitHotkey"
            @shortkey="$hotkeyHelpers.focusField($refs, 'timeLimitTextField')"
          >
            {{ $tc("caption.time_limit", 1) }}
          </div>
          <div class="timer-box-wrapper">
            <v-text-field
              ref="timeLimitTextField"
              placeholder="00:00"
              v-mask="'##:##'"
              outlined
              dense
              v-model="duration"
              @change="handleDuration"
              hide-details="true"
              :disabled="this.$store.state.status !== 'pending'"
            />
            <span class="timer-box-wrapper-label">
              {{ $tc("caption.minute", 1) }}
            </span>
          </div>
        </div>
        <div class="mt-4 pre-cond">
          <div
            class="subtitle-2 label-text"
            :style="{ color: currentTheme.secondary }"
            v-shortkey="preconditionsHotkey"
            @shortkey="$hotkeyHelpers.focusField($refs, 'preconditions')"
          >
            {{ $tc("caption.preconditions", 1) }}
          </div>
          <v-card
            v-if="preconditionsLoading"
            class="loading-wrapper"
            outlined
            flat
          >
            <v-progress-circular
              :color="currentTheme.primary"
              size="70"
              absolute
              indeterminate
            ></v-progress-circular>
          </v-card>
          <v-tiptap
            v-else
            v-model="preconditions.content"
            :placeholder="$t('message.define_required_precondition')"
            ref="preconditions"
            :toolbar="[
              'headings',
              '|',
              'bold',
              'italic',
              'underline',
              '|',
              'color',
              '|',
              'bulletList',
              'orderedList',
              '|',
              'link',
              'emoji',
              'blockquote',
              '|',
              '#aiAssist',
            ]"
            @change="updatePreconditions"
          >
            <template #aiAssist="">
              <v-btn
                v-if="isAiAssistEnabled"
                icon
                small
                :title="$tc('caption.ai_assist', 1)"
                @click="handleAISuggestion('preconditions', $event)"
              >
                <v-icon>{{
                  previousPreconditions?.content
                    ? "mdi-robot-off-outline"
                    : "mdi-robot-outline"
                }}</v-icon>
              </v-btn>
            </template>
          </v-tiptap>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { VContainer, VRow, VCol, VTextField } from "vuetify/lib/components";
import MindmapEditor from "./MindmapEditor.vue";

import {
  DEFAULT_CHARTER_MAP_NODES,
  DEFAULT_CHARTER_MAP_CONNECTIONS,
  AI_ENABLED_FIELDS,
} from "../modules/constants";

import openAIIntegrationHelper from "../integrations/OpenAIIntegrationHelpers";
import { mapGetters } from "vuex";

export default {
  name: "TestWrapper",
  components: {
    VContainer,
    VRow,
    VCol,
    VTextField,
    MindmapEditor,
  },
  data() {
    return {
      title: this.$store.state.title,
      previousTitle: "",
      titleLoading: false,
      charter: {
        content: this.$store.state.charter.content,
        text: this.$store.state.charter.text,
      },
      previousCharter: {
        content: "",
        text: "",
      },
      charterLoading: false,
      mindmap: {
        nodes: DEFAULT_CHARTER_MAP_NODES,
        connections: DEFAULT_CHARTER_MAP_CONNECTIONS,
      },
      preconditions: {
        content: this.$store.state.preconditions.content,
        text: this.$store.state.preconditions.text,
      },
      previousPreconditions: {
        content: "",
        text: "",
      },
      preconditionsLoading: false,
      duration: "",
    };
  },
  computed: {
    ...mapGetters({
      isAiAssistEnabled: "config/isAiAssistEnabled",
      hotkeys: "config/hotkeys",
      config: "config/fullConfig",
      credentials: "auth/credentials",
    }),
    titleHotkey() {
      return this.$hotkeyHelpers.findBinding(
        "sessionPlanning.title",
        this.hotkeys
      );
    },
    charterHotkey() {
      return this.$hotkeyHelpers.findBinding(
        "sessionPlanning.charter",
        this.hotkeys
      );
    },
    timeLimitHotkey() {
      return this.$hotkeyHelpers.findBinding(
        "sessionPlanning.timeLimit",
        this.hotkeys
      );
    },
    preconditionsHotkey() {
      return this.$hotkeyHelpers.findBinding(
        "sessionPlanning.preconditions",
        this.hotkeys
      );
    },
    checkListHotkey() {
      return this.$hotkeyHelpers.findBinding(
        "sessionPlanning.checklist",
        this.hotkeys
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
  watch: {
    "$store.state.title": {
      deep: true,
      handler(newValue) {
        this.title = newValue;
      },
    },
    "$store.state.charter": {
      deep: true,
      handler(newValue) {
        this.charter.content = newValue.content;
        this.charter.text = newValue.text;
      },
    },
    "$store.state.preconditions": {
      deep: true,
      handler(newValue) {
        this.preconditions.content = newValue.content;
        this.preconditions.text = newValue.text;
      },
    },
    "$store.state.mindmap": {
      deep: true,
      handler(newValue) {
        this.mindmap.nodes = newValue.nodes;
        this.mindmap.connections = newValue.connections;
      },
    },
  },
  mounted() {
    this.$root.$on("reset-duration", () => {
      this.duration = "";
    });
    this.duration = this.formatDuration(this.$store.state.duration);
  },
  methods: {
    updateTitle() {
      this.$store.commit("setTitle", this.title);
    },
    updateCharter() {
      const regex = /(<([^>]+)>)/gi;
      this.charter.text = this.charter.content.replace(regex, "");
      this.$store.commit("setCharter", this.charter);
    },
    updatePreconditions() {
      const regex = /(<([^>]+)>)/gi;
      this.preconditions.text = this.preconditions.content.replace(regex, "");
      this.$store.commit("setPrecondition", this.preconditions);
    },
    async handleAISuggestion(field, event) {
      if (
        (this[field]?.trim && this[field]?.trim()) ||
        this[field]?.content?.trim()
      ) {
        let button = event.srcElement;
        let enable = true;
        let previousField =
          "previous" + field[0].toUpperCase() + field.substring(1);
        if (button.classList.contains("mdi-robot-off-outline")) {
          enable = false;
        }

        if (enable) {
          if (AI_ENABLED_FIELDS[field].type === "textField") {
            this[previousField] = this[field];
          } else {
            this[previousField] = Object.assign({}, this[field]);
          }
          this[field + "Loading"] = true;
          let response = await openAIIntegrationHelper.enhanceText(
            this.credentials,
            this.config,
            field,
            this[field]
          );
          if (response.error) {
            enable = false;
            if (AI_ENABLED_FIELDS[field].type === "textField") {
              this[previousField] = "";
            } else {
              this[previousField] = {
                content: "",
                text: "",
              };
            }
            this.$root.$emit(
              "set-snackbar",
              `${this.$tc("message.please_try_again", 1)} ${this.$tc(
                "message.error",
                1
              )}: ${response.error}`
            );
          } else {
            if (AI_ENABLED_FIELDS[field].type === "textField") {
              this[field] = response.content;
            } else {
              this[field].content = response.content;
            }
          }
          this[AI_ENABLED_FIELDS[field].callback]();
          this[field + "Loading"] = false;
        } else {
          this[field] = this[previousField];
          this[previousField] = "";
        }

        if (enable) {
          button.classList.remove("mdi-robot-outline");
          button.classList.add("mdi-robot-off-outline");
        } else {
          button.classList.remove("mdi-robot-off-outline");
          button.classList.add("mdi-robot-outline");
        }
      } else {
        this.$root.$emit(
          "set-snackbar",
          this.$tc("message.ai_assist_not_empty", 1)
        );
      }
    },
    formatDuration(secondsTotal) {
      if (
        secondsTotal === "" ||
        secondsTotal === 0 ||
        isNaN(secondsTotal) ||
        secondsTotal < 0
      ) {
        return "00:00";
      }

      const minutes = Math.floor(secondsTotal / 60);
      const seconds = secondsTotal % 60;

      const formattedMinutes = minutes.toString().padStart(2, "0");
      const formattedSeconds = seconds.toString().padStart(2, "0");

      return `${formattedMinutes}:${formattedSeconds}`;
    },
    handleDuration() {
      const timeArr = this.duration.split(":");
      let minutes = parseInt(timeArr[0], 10);
      let seconds = parseInt(timeArr[1], 10);
      if (Number.isNaN(minutes)) {
        minutes = 0;
      }
      if (Number.isNaN(seconds)) {
        seconds = 0;
      }
      if (seconds > 59) {
        this.duration = timeArr[0] + ":00";
        return;
      }
      const temp = minutes * 60 + seconds;
      this.$store.commit("setDuration", temp);
    },
    handleMindmap(value) {
      const newNodes = value.nodes.map((obj) => {
        return {
          id: obj.id,
          text: obj.text,
          fx: obj.fx,
          fy: obj.fy,
        };
      });
      const newConnections = value.connections.map((obj) => {
        return {
          source: obj.source.id,
          target: obj.target.id,
        };
      });
      const data = {
        nodes: newNodes,
        connections: newConnections,
      };
      this.$store.commit("setMindmap", data);
    },
  },
};
</script>

<style>
.v-icon.mdi.theme--light.mdi-robot-off-outline {
  color: rgba(255, 0, 0, 0.6) !important;
}
.v-icon.mdi.theme--dark.mdi-robot-off-outline {
  color: rgba(255, 0, 0, 1) !important;
}
.loading-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 250px;
}
</style>
<style scoped>
.timer-box-wrapper {
  display: flex;
  column-gap: 10px;
  align-items: center;
  max-width: 10em;
}
.timer-box-wrapper-label {
  color: #666;
}
.charter-tab {
  border-top-left-radius: 4px !important;
  border-top-right-radius: 4px !important;
}
.mindmap-wrapper {
  border: 1px solid #d1d5db;
  border-top: none;
  border-bottom-left-radius: 4px;
  border-bottom-right-radius: 4px;
}
</style>
