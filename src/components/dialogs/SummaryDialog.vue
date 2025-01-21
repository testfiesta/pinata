<template>
  <div>
    <v-dialog
      v-bind="$attrs"
      v-on="$listeners"
      persistent
      width="100%"
      max-width="656px"
      eager
      content-class="rounded-12px"
    >
      <v-sheet outlined rounded>
        <v-card :style="{ backgroundColor: currentTheme.background }">
          <v-card-title class="pa-6" :style="{ color: currentTheme.secondary }">
            <div class="d-flex justify-space-between align-center w-full">
              <span class="dialog-title">
                {{ $tc("caption.test_session_summary", 1) }}
              </span>
              <div class="d-flex align-center justify-end">
                <v-select
                  :items="commentTypes"
                  v-model="comment.type"
                  :placeholder="$tc('caption.comment_type', 1)"
                  solo
                  dense
                  flat
                  :color="currentTheme.secondary"
                  :background-color="inputBg"
                  class="rounded-lg custom-select select-comment-type pa-0 mr-3"
                  append-icon="mdi-chevron-down"
                  :menu-props="{ offsetY: true }"
                  height="40px"
                  hide-details="true"
                ></v-select>
                <ExportButton
                  :items="exportButtonItems"
                  :config-item="exportButtonConfig"
                  :credential-items="exportButtonCredentials"
                />
              </div>
            </div>
          </v-card-title>
          <v-container>
            <v-row>
              <v-col cols="12" class="px-6 pt-0">
                <v-card
                  v-if="commentLoading"
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
                <div v-else>
                  <v-tiptap
                    class="tiptap-theme"
                    v-model="comment.content"
                    :placeholder="$t('message.insert_summary')"
                    ref="comment"
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
                    @input="updateComment"
                  >
                    <template #headings="{ editor }">
                      <v-select
                        v-model="selectedHeading"
                        :items="headingOptions"
                        :background-color="inputBg"
                        :color="currentTheme.secondary"
                        class="rounded-lg pa-0 mr-3"
                        item-text="text"
                        item-value="level"
                        width="100%"
                        height="40px"
                        solo
                        dense
                        flat
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
                        :class="{
                          'v-btn--active': editor.isActive('underline'),
                        }"
                      >
                        <img src="/tiptap/underline.svg" />
                      </v-btn>
                    </template>
                    <template #bulletList="{ editor }">
                      <v-btn
                        icon
                        small
                        @click="editor.chain().focus().toggleBulletList().run()"
                        :class="{
                          'v-btn--active': editor.isActive('bulletList'),
                        }"
                      >
                        <img src="/tiptap/list.svg" />
                      </v-btn>
                    </template>
                    <template #orderedList="{ editor }">
                      <v-btn
                        icon
                        small
                        @click="
                          editor.chain().focus().toggleOrderedList().run()
                        "
                        :class="{
                          'v-btn--active': editor.isActive('orderedList'),
                        }"
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
                        :class="{
                          'v-btn--active': editor.isActive('blockquote'),
                        }"
                      >
                        <img src="/tiptap/quotes.svg" />
                      </v-btn>
                    </template>
                    <template #aiAssist="">
                      <v-btn
                        v-if="aiAssistEnabled"
                        icon
                        small
                        :title="$tc('caption.ai_assist', 1)"
                        @click="handleAISuggestion('comment', $event)"
                      >
                        <v-icon>{{
                          previousComment?.content
                            ? "mdi-robot-off-outline"
                            : "mdi-robot-outline"
                        }}</v-icon>
                      </v-btn>
                    </template>
                  </v-tiptap>
                </div>
                <div class="error px-2 py-1" v-if="isEmpty">
                  <span style="color: #fff">{{
                    $tc("caption.required_field", 1)
                  }}</span>
                </div>
              </v-col>
            </v-row>
          </v-container>
          <v-card-actions>
            <div class="d-flex justify-end align-center w-full">
              <v-btn
                class="btn px-8 rounded-lg text-capitalize mr-3"
                height="40px"
                depressed
                :color="btnBg"
                :style="{ color: currentTheme.secondary }"
                v-shortkey="cancelHotkey"
                @shortkey="handleCancel()"
                @click="handleCancel()"
              >
                {{ $tc("caption.cancel", 1) }}
              </v-btn>
              <v-btn
                class="btn px-8 rounded-lg text-capitalize"
                height="40px"
                depressed
                :color="currentTheme.primary"
                :style="{ color: currentTheme.white }"
                v-shortkey="confirmHotkey"
                @shortkey="handleSave()"
                @click="handleSave()"
              >
                {{ $tc("caption.save", 1) }}
              </v-btn>
            </div>
          </v-card-actions>
        </v-card>
      </v-sheet>
    </v-dialog>
    <TipTapLinkDialog
      ref="linkModal"
      :placeholder="$tc('caption.enter_url', 1)"
    />
  </div>
</template>

<script>
import { TEXT_TYPES, AI_ENABLED_FIELDS } from "../../modules/constants";
import openAIIntegrationHelper from "../../integrations/OpenAIIntegrationHelpers";
import { mapGetters } from "vuex";
import TipTapLinkDialog from "./TipTapLinkDialog.vue";
import theme from "../../mixins/theme";
import ExportButton from "../ExportButton.vue";

export default {
  name: "SummaryDialog",
  components: {
    TipTapLinkDialog,
    ExportButton,
  },
  props: {
    summary: {
      type: Object,
      default: () => {},
    },
    exportButtonItems: {
      type: [String, Array],
    },
    exportButtonConfig: {
      type: Object,
    },
    exportButtonCredentials: {
      type: Object,
    },
  },
  watch: {
    config: function () {
      this.isRequired = this.config?.summaryRequired;
    },
    summary: function (newValue) {
      if (Object.keys(newValue).length) {
        this.comment.content = newValue.comment.content;
        this.comment.text = newValue.comment.text;
      }
    },
  },
  mixins: [theme],
  data() {
    return {
      comment: {
        type: "Summary",
        content: "",
        text: "",
      },
      previousComment: {
        type: "Summary",
        content: "",
        text: "",
      },
      headingOptions: [
        { text: "Normal Text", level: 0 }, // Normal text option
        { text: "Heading 1", level: 1 },
        { text: "Heading 2", level: 2 },
        { text: "Heading 3", level: 3 },
      ],
      selectedHeading: 0,
      commentLoading: false,
      commentTypes: Object.keys(TEXT_TYPES),
      isRequired: this.config?.summaryRequired,
      isEmpty: false,
    };
  },
  destroyed() {
    this.handleClear();
  },
  computed: {
    ...mapGetters({
      config: "config/fullConfig",
      credentials: "auth/credentials",
      hotkeys: "config/hotkeys",
    }),
    confirmHotkey() {
      return this.$hotkeyHelpers.findBinding("general.save", this.hotkeys);
    },
    cancelHotkey() {
      return this.$hotkeyHelpers.findBinding("general.cancel", this.hotkeys);
    },
    aiAssistEnabled() {
      return this?.config?.ai?.enabled || false;
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
    setHeading(editor, level) {
      if (level === 0) {
        editor.chain().focus().setParagraph().run();
      } else {
        editor.chain().focus().setHeading({ level }).run();
      }
    },
    handleCancel() {
      this.$root.$emit("close-summarydialog");
    },
    handleSave() {
      if (this.isRequired && !this.validate()) {
        this.isEmpty = true;
        return;
      }
      this.$emit("submit-summary", { ...this.comment });
    },
    handleClear() {
      this.comment.type = "Summary";
      this.comment.content = "";
      this.comment.text = "";
    },
    updateComment() {
      const regex = /(<([^>]+)>)/gi;
      this.comment.text = this.comment.content.replace(regex, "");
      if (this.isRequired && !this.validate()) {
        this.isEmpty = true;
      } else {
        this.isEmpty = false;
      }
    },
    validate() {
      if (!this.comment.text || this.comment.text === "") {
        return false;
      }
      return true;
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
  },
};
</script>

<style scoped>
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
.dialog-title {
  font-size: 18px;
  font-weight: 600;
  line-height: 28px;
}
.dialog-content {
  max-height: 250px;
  overflow-y: auto;
}
.v-card__actions {
  padding: 12px;
}
.select-comment-type {
  max-width: 132px;
}
</style>
