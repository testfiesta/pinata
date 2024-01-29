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
          {{ $tc("caption.summarize_session", 1) }}
        </v-card-title>
        <v-divider></v-divider>
        <v-container>
          <v-row>
            <v-col cols="12">
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
              <v-tiptap
                v-else
                v-model="comment.content"
                :placeholder="$t('message.insert_summary')"
                ref="comment"
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
                @input="updateComment"
              >
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
              <div class="error px-2 py-1" v-if="isEmpty">
                <span style="color: #fff">{{
                  $tc("caption.required_field", 1)
                }}</span>
              </div>
            </v-col>
          </v-row>
          <v-row class="mt-0">
            <v-col>
              <div :style="{ color: currentTheme.secondary }">
                {{ $tc("caption.comment_type", 1) }}
              </div>
              <v-select
                :items="commentTypes"
                v-model="comment.type"
                :placeholder="$tc('caption.comment_type', 1)"
                solo
                dense
                disabled
                hide-details="true"
              ></v-select>
            </v-col>
          </v-row>
        </v-container>
        <v-divider></v-divider>
        <v-card-actions>
          <v-row class="action-wrapper">
            <v-col cols="6" class="pr-1">
              <v-btn
                class="btn px-8"
                small
                block
                :color="currentTheme.background"
                v-shortkey="cancelHotkey"
                @shortkey="handleCancel()"
                @click="handleCancel()"
              >
                {{ $tc("caption.cancel", 1) }}
              </v-btn>
            </v-col>
            <v-col cols="6" class="pr-1">
              <v-btn
                class="btn px-8"
                small
                block
                color="primary"
                v-shortkey="confirmHotkey"
                @shortkey="handleSave()"
                @click="handleSave()"
              >
                {{ $tc("caption.save", 1) }}
              </v-btn>
            </v-col>
          </v-row>
        </v-card-actions>
      </v-card>
    </v-sheet>
  </v-dialog>
</template>

<script>
import { TEXT_TYPES, AI_ENABLED_FIELDS } from "../../modules/constants";
import openAIIntegrationHelper from "../../integrations/OpenAIIntegrationHelpers";
import { mapGetters } from "vuex";

export default {
  name: "SummaryDialog",
  components: {},
  props: {
    configItem: {
      type: Object,
      default: () => {},
    },
    credentialItems: {
      type: Object,
      default: () => {},
    },
    summary: {
      type: Object,
      default: () => {},
    },
  },
  watch: {
    configItem: function (newValue) {
      this.config = newValue;
      this.isRequired = this.config.summaryRequired;
    },
    credentialItems: function (newValue) {
      this.credentials = newValue;
    },
    summary: function (newValue) {
      if (Object.keys(newValue).length) {
        this.comment.content = newValue.comment.content;
        this.comment.text = newValue.comment.text;
      }
    },
  },
  data() {
    return {
      config: this.configItem,
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
      commentLoading: false,
      commentTypes: Object.keys(TEXT_TYPES),
      isRequired: this.configItem.summaryRequired,
      isEmpty: false,
    };
  },
  destroyed() {
    this.handleClear();
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
    handleCancel() {
      this.$root.$emit("close-summarydialog");
    },
    handleSave() {
      if (this.isRequired && !this.validate()) {
        this.isEmpty = true;
        return;
      }
      this.$emit("submit-summary", this.comment);
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
  /* border-bottom: 1px solid #e5e7eb; */
  font-size: 14px;
  font-style: normal;
  font-weight: 600;
  line-height: 20px;
  padding: 12px;
}
.dialog-content {
  max-height: 250px;
  overflow-y: auto;
}
.v-card__actions {
  padding: 12px;
}
</style>
