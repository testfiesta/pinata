<template>
  <div>
    <div class="text-left">
      <div>
        <div>
          <div
            class="d-flex fs-14 text-theme-label mb-1 font-weight-medium"
            :style="{ color: currentTheme.secondary }"
            v-shortkey="titleHotkey"
            @shortkey="$hotkeyHelpers.focusField($refs, 'titleTextField')"
          >
            {{ $tc("caption.session_name", 1) }}
          </div>
          <v-text-field
            :placeholder="$tc('caption.session_name', 1)"
            autofocus
            class="rounded-lg"
            :background-color="inputBg"
            dense
            height="40px"
            flat
            solo
            :color="currentTheme.secondary"
            :loading="titleLoading"
            :append-icon="
              isAiAssistEnabled
                ? previousTitle
                  ? 'mdi-robot-off-outline'
                  : 'mdi-robot-outline'
                : ''
            "
            :value="title"
            ref="titleTextField"
            style="width: 50%"
            @input="updateTitle"
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
            class="d-flex fs-14 text-theme-label mb-1 font-weight-medium"
            :style="{ color: currentTheme.secondary }"
            v-shortkey="charterHotkey"
            @shortkey="$hotkeyHelpers.focusField($refs, 'charter')"
            v-if="!isMindmap"
          >
            {{ $tc("caption.charter_description", 1) }}
          </div>
          <div v-if="!isMindmap">
            <v-card v-if="charterLoading" class="loading-wrapper" outlined flat>
              <v-progress-circular
                :color="currentTheme.primary"
                size="70"
                absolute
                indeterminate
              ></v-progress-circular>
            </v-card>
            <v-tiptap
              class="tiptap-theme"
              v-else
              :value="charter.content"
              :placeholder="$t('message.describe_test_charter')"
              ref="charter"
              :toolbar="[
                '#headings',
                '#bold',
                '#italic',
                '#underline',
                '#bulletList',
                '#orderedList',
                '#link',
                '#blockquote',
                '#aiAssist',
              ]"
              @input="updateCharter"
            >
              <template #headings="{ editor }">
                <v-select
                  v-model="selectedHeading"
                  :items="headingOptions"
                  background-color="#F9F9FB"
                  class="rounded-lg custom-select"
                  item-text="text"
                  item-value="level"
                  width="100%"
                  height="40px"
                  :placeholder="$t('Heading')"
                  append-icon="mdi-chevron-down"
                  :menu-props="{ offsetY: true }"
                  @change="setHeading(editor, $event)"
                />
              </template>
              <template #bold="{ editor }">
                <v-btn
                  icon
                  small
                  @click="editor.chain().focus().toggleBold().run()"
                  :class="{ 'v-btn--active': editor.isActive('bold') }"
                >
                  <img src="/tiptap/bold.svg" />
                </v-btn>
              </template>
              <template #italic="{ editor }">
                <v-btn
                  icon
                  small
                  @click="editor.chain().focus().toggleItalic().run()"
                  :class="{ 'v-btn--active': editor.isActive('italic') }"
                >
                  <img src="/tiptap/italic.svg" />
                </v-btn>
              </template>
              <template #underline="{ editor }">
                <v-btn
                  icon
                  small
                  @click="editor.chain().focus().toggleUnderline().run()"
                  :class="{ 'v-btn--active': editor.isActive('underline') }"
                >
                  <img src="/tiptap/underline.svg" />
                </v-btn>
              </template>
              <template #bulletList="{ editor }">
                <v-btn
                  icon
                  small
                  @click="editor.chain().focus().toggleBulletList().run()"
                  :class="{ 'v-btn--active': editor.isActive('bulletList') }"
                >
                  <img src="/tiptap/list.svg" />
                </v-btn>
              </template>
              <template #orderedList="{ editor }">
                <v-btn
                  icon
                  small
                  @click="editor.chain().focus().toggleOrderedList().run()"
                  :class="{ 'v-btn--active': editor.isActive('orderedList') }"
                >
                  <img src="/tiptap/list-number.svg" />
                </v-btn>
              </template>
              <template #link="{ editor }">
                <v-btn
                  icon
                  small
                  @click="toggleLink(editor)"
                  :class="{ 'v-btn--active': editor.isActive('link') }"
                >
                  <img src="/tiptap/link.svg" />
                </v-btn>
              </template>
              <template #blockquote="{ editor }">
                <v-btn
                  icon
                  small
                  @click="editor.chain().focus().toggleBlockquote().run()"
                  :class="{ 'v-btn--active': editor.isActive('blockquote') }"
                >
                  <img src="/tiptap/quotes.svg" />
                </v-btn>
              </template>
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
          </div>
          <div class="mindmap-wrapper" v-else>
            <new-mindmap-editor
              :nodesData="mindmap.nodes"
              :connectionsData="mindmap.connections"
              :edit="true"
              :auto-save="true"
              @submit-mindmap="handleMindmap"
            />
          </div>
        </div>
        <div class="mt-4 pre-cond">
          <div
            class="d-flex fs-14 text-theme-label mb-1 font-weight-medium"
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
            class="tiptap-theme"
            v-else
            :value="preconditions.content"
            :placeholder="$t('message.define_required_precondition')"
            ref="preconditions"
            :toolbar="[
              '#headings',
              '#bold',
              '#italic',
              '#underline',
              '#bulletList',
              '#orderedList',
              '#link',
              '#blockquote',
              '#aiAssist',
            ]"
            @input="updatePreconditions"
          >
            <template #headings="{ editor }">
              <v-select
                v-model="selectedHeading"
                :items="headingOptions"
                background-color="#F9F9FB"
                class="rounded-lg custom-select"
                item-text="text"
                item-value="level"
                width="100%"
                height="40px"
                :placeholder="$t('Heading')"
                append-icon="mdi-chevron-down"
                :menu-props="{ offsetY: true }"
                @change="setHeading(editor, $event)"
              />
            </template>
            <template #bold="{ editor }">
              <v-btn
                icon
                small
                @click="editor.chain().focus().toggleBold().run()"
                :class="{ 'v-btn--active': editor.isActive('bold') }"
              >
                <img src="/tiptap/bold.svg" />
              </v-btn>
            </template>
            <template #italic="{ editor }">
              <v-btn
                icon
                small
                @click="editor.chain().focus().toggleItalic().run()"
                :class="{ 'v-btn--active': editor.isActive('italic') }"
              >
                <img src="/tiptap/italic.svg" />
              </v-btn>
            </template>
            <template #underline="{ editor }">
              <v-btn
                icon
                small
                @click="editor.chain().focus().toggleUnderline().run()"
                :class="{ 'v-btn--active': editor.isActive('underline') }"
              >
                <img src="/tiptap/underline.svg" />
              </v-btn>
            </template>
            <template #bulletList="{ editor }">
              <v-btn
                icon
                small
                @click="editor.chain().focus().toggleBulletList().run()"
                :class="{ 'v-btn--active': editor.isActive('bulletList') }"
              >
                <img src="/tiptap/list.svg" />
              </v-btn>
            </template>
            <template #orderedList="{ editor }">
              <v-btn
                icon
                small
                @click="editor.chain().focus().toggleOrderedList().run()"
                :class="{ 'v-btn--active': editor.isActive('orderedList') }"
              >
                <img src="/tiptap/list-number.svg" />
              </v-btn>
            </template>
            <template #link="{ editor }">
              <v-btn
                icon
                small
                @click="toggleLink(editor)"
                :class="{ 'v-btn--active': editor.isActive('link') }"
              >
                <img src="/tiptap/link.svg" />
              </v-btn>
            </template>
            <template #blockquote="{ editor }">
              <v-btn
                icon
                small
                @click="editor.chain().focus().toggleBlockquote().run()"
                :class="{ 'v-btn--active': editor.isActive('blockquote') }"
              >
                <img src="/tiptap/quotes.svg" />
              </v-btn>
            </template>
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
        <div class="mt-4">
          <div
            class="d-flex fs-14 text-theme-label mb-1 font-weight-medium"
            :style="{ color: currentTheme.secondary }"
          >
            {{ $tc("caption.privacy", 1) }}
          </div>
          <v-select
            :items="privacy_modes"
            style="width: 50%"
            v-model="privacy"
            :placeholder="$tc('caption.comment_type')"
            background-color="#F9F9FB"
            class="rounded-lg custom-select"
            item-text="text"
            item-value="level"
            width="100%"
            append-icon="mdi-chevron-down"
            :menu-props="{ offsetY: true }"
            solo
            flat
            height="40px"
            hide-details="true"
          />
        </div>
        <div class="mt-4 timelimit">
          <div
            class="d-flex fs-14 text-theme-label mb-1 font-weight-medium"
            :style="{ color: currentTheme.secondary }"
            v-shortkey="timeLimitHotkey"
            @shortkey="$hotkeyHelpers.focusField($refs, 'timeLimitTextField')"
          >
            {{ $tc("caption.time_limit", 1) }} ({{
              $tc("caption.optional", 1)
            }})
          </div>
          <div class="timer-box-wrapper">
            <v-text-field
              ref="timeLimitTextField"
              placeholder="00:00"
              v-mask="'##:##'"
              autofocus
              class="rounded-lg"
              :background-color="inputBg"
              dense
              height="40px"
              flat
              solo
              v-model="duration"
              @change="handleDuration()"
              hide-details="true"
              :disabled="this.$store.state.session.status !== 'pending'"
            />
            <span class="timer-box-wrapper-label">
              {{ $tc("caption.minute", 1) }}
            </span>
          </div>
        </div>
      </div>
    </div>
    <TipTapLinkDialog
      ref="linkModal"
      :placeholder="$tc('caption.enter_url', 1)"
    />
  </div>
</template>

<script>
import { VTextField } from "vuetify/lib/components";
import NewMindmapEditor from "./NewMindmapEditor.vue";
import { debounce } from "lodash";
import theme from "../mixins/theme";
import TipTapLinkDialog from "./dialogs/TipTapLinkDialog.vue";

import {
  DEFAULT_CHARTER_MAP_NODES,
  DEFAULT_CHARTER_MAP_CONNECTIONS,
  AI_ENABLED_FIELDS,
} from "../modules/constants";

import openAIIntegrationHelper from "../integrations/OpenAIIntegrationHelpers";
import { mapGetters } from "vuex";

export default {
  name: "TestSettingWrapper",
  components: {
    VTextField,
    NewMindmapEditor,
    TipTapLinkDialog,
  },
  props: {
    isMindmap: {
      type: Boolean,
      default: () => false,
    },
  },
  mixins: [theme],
  data() {
    return {
      title: this.$store.state.case.title,
      previousTitle: "",
      titleLoading: false,
      charter: {
        content: this.$store.state.case.charter.content,
        text: this.$store.state.case.charter.text,
      },
      headingOptions: [
        { text: "Normal Text", level: 0 }, // Normal text option
        { text: "Heading 1", level: 1 },
        { text: "Heading 2", level: 2 },
        { text: "Heading 3", level: 3 },
      ],
      selectedHeading: 0,
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
        content: this.$store.state.case.preconditions.content,
        text: this.$store.state.case.preconditions.text,
      },
      previousPreconditions: {
        content: "",
        text: "",
      },
      preconditionsLoading: false,
      duration: "",
      privacy: "Private",
      privacy_modes: ["Private", "Public"],
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
    "$store.state.case.title": {
      deep: true,
      handler(newValue) {
        this.title = newValue;
      },
    },
    "$store.state.case.charter": {
      deep: true,
      handler(newValue) {
        this.charter.content = newValue.content;
        this.charter.text = newValue.text;
      },
    },
    "$store.state.case.preconditions": {
      deep: true,
      handler(newValue) {
        this.preconditions.content = newValue.content;
        this.preconditions.text = newValue.text;
      },
    },
    "$store.state.case.mindmap": {
      deep: true,
      handler(newValue) {
        this.mindmap.nodes = newValue.nodes;
        this.mindmap.connections = newValue.connections;
      },
    },
  },
  created() {
    this.debouncedUpdateTitle = debounce(this.actualUpdateTitle, 500);
    this.debouncedUpdateCharter = debounce(this.actualUpdateCharter, 500);
    this.debouncedUpdatePreconditions = debounce(
      this.actualUpdatePreconditions,
      500
    );
  },
  mounted() {
    this.$root.$on("reset-duration", () => {
      this.duration = "";
    });
    this.duration = this.formatDuration(this.$store.state.case.duration);
  },
  methods: {
    setHeading(editor, level) {
      if (level === 0) {
        editor.chain().focus().setParagraph().run();
      } else {
        editor.chain().focus().setHeading({ level }).run();
      }
    },
    async toggleLink(editor) {
      const url = await this.$refs.linkModal.open({
        title: "Enter URL",
        value: editor.getAttributes("link").href || "",
      });

      if (url === null) {
        return;
      }

      if (url === "") {
        editor.chain().focus().unsetLink().run();
        return;
      }

      editor.chain().focus().setLink({ href: url }).run();
    },
    actualUpdateTitle(title) {
      this.$store.commit("setCaseTitle", title);
    },
    updateTitle(title) {
      this.debouncedUpdateTitle(title);
    },
    actualUpdateCharter(charterContent) {
      const regex = /(<([^>]+)>)/gi;
      const charterText = charterContent.replace(regex, "");
      this.$store.commit("setCaseCharter", {
        content: charterContent,
        text: charterText,
      });
    },
    updateCharter(charterContent) {
      this.debouncedUpdateCharter(charterContent);
    },
    actualUpdatePreconditions(preconditionsContent) {
      const regex = /(<([^>]+)>)/gi;
      const preconditionsText = preconditionsContent.replace(regex, "");
      this.$store.commit("setCasePrecondition", {
        content: preconditionsContent,
        text: preconditionsText,
      });
    },
    updatePreconditions(preconditionsContent) {
      this.debouncedUpdatePreconditions(preconditionsContent);
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
      this.$store.commit("setCaseDuration", temp);
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
      this.$store.commit("setCaseMindmap", data);
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
  border-bottom-left-radius: 4px;
  border-bottom-right-radius: 4px;
}
</style>
