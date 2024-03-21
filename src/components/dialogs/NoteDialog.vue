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
        <v-card-title class="dialog-title">
          {{ $tc("caption.take_note", 1) }}
        </v-card-title>
        <v-divider></v-divider>
        <v-container class="note-wrapper">
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
                :placeholder="$t('message.insert_note')"
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
            </v-col>
          </v-row>
          <div class="actions-wrapper">
            <template v-if="emoji.length">
              <v-btn
                rounded
                color="primary"
                class="pa-0 mb-1"
                height="26"
                min-width="45"
                style=""
                v-for="(emoji, i) in emoji"
                :key="i"
                @click="removeEmoji(emoji)"
              >
                <span class="emoji-icon">{{ emoji.data }}</span>
                <v-icon x-small>mdi-close</v-icon>
              </v-btn>
            </template>

            <v-menu
              v-model="emojiMenu"
              :close-on-content-click="false"
              right
              bottom
              nudge-bottom="4"
              offset-y
            >
              <template v-slot:activator="{ on: emojiMenu }">
                <v-tooltip bottom>
                  <template v-slot:activator="{ on: tooltip }">
                    <v-btn
                      rounded
                      class="pa-0 mb-1"
                      height="26"
                      min-width="35"
                      v-on="{
                        ...emojiMenu,
                        ...tooltip,
                      }"
                    >
                      <img
                        :src="require('../../assets/icon/add-emoticon.svg')"
                        width="24"
                        height="24"
                      />
                    </v-btn>
                  </template>
                  <span>{{ $tc("caption.add_reaction", 1) }}</span>
                </v-tooltip>
              </template>
              <v-card class="emoji-lookup">
                <VEmojiPicker
                  labelSearch="Search"
                  lang="en-US"
                  @select="selectEmoji"
                />
              </v-card>
            </v-menu>
          </div>
          <div class="check-box">
            <label
              ><input
                type="checkbox"
                name="follow_up"
                class="item-select"
                v-model="followUp"
                @change="handleFollowUp($event)"
              />{{ $tc("caption.required_follow_up", 1) }}
            </label>
          </div>
          <v-row class="mt-0">
            <v-col cols="12">
              <vue-tags-input
                class="input-box"
                v-model="tag_text"
                :tags="tags"
                :autocomplete-items="filteredTags"
                :max-tags="10"
                :maxlength="20"
                @tags-changed="handleTags"
                :placeholder="$t('message.insert_tag')"
              />
            </v-col>
          </v-row>
          <v-row class="mt-0">
            <v-col class="pr-0">
              <div :style="{ color: currentTheme.secondary }">
                {{ $tc("caption.note_type", 1) }}
              </div>
              <v-select
                :items="commentTypes"
                v-model="comment.type"
                :placeholder="$tc('caption.comment_type')"
                solo
                dense
                hide-details="true"
              ></v-select>
            </v-col>
            <v-col cols="auto" class="pl-0 d-flex align-end">
              <v-btn
                plain
                :color="currentTheme.secondary"
                class="text-capitalize px-0 btn"
                @click="handleClear"
              >
                {{ $tc("caption.clear", 1) }}
              </v-btn>
            </v-col>
          </v-row>
        </v-container>
        <v-divider></v-divider>
        <v-card-actions>
          <v-row class="action-wrapper">
            <v-col cols="6 pr-1">
              <v-btn
                class="btn"
                small
                block
                :color="currentTheme.background"
                :style="{ color: currentTheme.secondary }"
                v-shortkey="cancelHotkey"
                @shortkey="handleDiscard()"
                @click="handleDiscard()"
              >
                {{ $tc("caption.discard", 1) }}
              </v-btn>
            </v-col>
            <v-col cols="6 pl-1">
              <v-btn
                class="btn"
                small
                block
                :color="currentTheme.primary"
                :style="{ color: currentTheme.white }"
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
import VueTagsInput from "@johmun/vue-tags-input";
import openAIIntegrationHelper from "../../integrations/OpenAIIntegrationHelpers";
import { mapGetters } from "vuex";

import { VEmojiPicker } from "v-emoji-picker";
import { TEXT_TYPES, AI_ENABLED_FIELDS } from "../../modules/constants";

export default {
  name: "NoteDialog",
  components: {
    VueTagsInput,
    VEmojiPicker,
  },
  props: {
    isVisible: {
      type: Boolean,
      require: true,
    },
    configItem: {
      type: Object,
      default: () => {},
    },
    credentialItems: {
      type: Object,
      default: () => {},
    },
  },
  watch: {
    isVisible(newVal) {
      if (newVal) {
        this.getAllTags();
      }
    },
    configItem: function (newValue) {
      this.config = newValue;
      this.resetData();
    },
    credentialItems: function (newValue) {
      this.credentials = newValue;
    },
  },
  data() {
    return {
      config: this.configItem,
      comment: {
        type:
          this.configItem &&
          this.configItem.commentType &&
          this.configItem.commentType !== ""
            ? this.configItem.commentType
            : "Comment",
        content: "",
        text: "",
      },
      previousComment: {
        type:
          this.configItem &&
          this.configItem.commentType &&
          this.configItem.commentType !== ""
            ? this.configItem.commentType
            : "Comment",
        content: "",
        text: "",
      },
      commentLoading: false,
      commentTypes: Object.keys(TEXT_TYPES).filter(
        (item) => item !== "Summary"
      ),
      tag_text: "",
      emojiMenu: false,
      tags: [],
      allTags: [],
      emoji: [],
      followUp: false,
    };
  },
  computed: {
    ...mapGetters({
      defaultTags: "config/defaultTags",
      sessionItems: "sessionItems",
    }),
    filteredTags() {
      return this.allTags
        .filter((item) => {
          return item.toLowerCase().includes(this.tag_text.toLowerCase());
        })
        .map((item) => {
          return { text: item };
        });
    },
    confirmHotkey() {
      return this.$hotkeyHelpers.findBinding(
        "general.save",
        this.config.hotkeys
      );
    },
    cancelHotkey() {
      return this.$hotkeyHelpers.findBinding(
        "general.cancel",
        this.config.hotkeys
      );
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
    getAllTags() {
      const defaultTagTexts = this.defaultTags
        .filter((tag) => tag.text !== "")
        .map((tag) => tag.text);
      let sessionTagTexts = [];
      if (this.sessionItems.length > 0) {
        this.sessionItems.forEach((item) => {
          if (item.tags && item.tags.length > 0) {
            const tagTexts = item.tags.map((tag) => tag.text);
            sessionTagTexts = sessionTagTexts.concat(tagTexts);
          }
        });
      }
      this.allTags = [...new Set([...defaultTagTexts, ...sessionTagTexts])];
    },
    resetData() {
      // set comment type by config
      if (this.config.commentType && this.config.commentType !== "") {
        this.comment.type = this.config.commentType;
      }

      if (this.$isElectron) {
        // set templates by config
        const template = this.config.templates["text"];

        this.comment.content = template.content;
        this.comment.text = template.text;
      }

      this.emojiMenu = false;
      this.tags = [];
      this.emoji = [];
      this.followUp = false;
    },
    selectEmoji(emoji) {
      this.emojiMenu = false;
      if (this.emoji.filter((item) => item.data === emoji.data).length) {
        this.emoji = this.emoji.filter((item) => item.data !== emoji.data);
      } else {
        this.emoji.push(emoji);
      }
    },
    removeEmoji(emoji) {
      this.emoji = this.emoji.filter((item) => item.data !== emoji.data);
    },
    handleDiscard() {
      this.$root.$emit("close-notedialog");
      this.resetData();
    },
    handleSave() {
      const commentCopy = JSON.parse(JSON.stringify(this.comment));
      const data = {
        comment: commentCopy,
        tags: this.tags,
        emoji: this.emoji,
        followUp: this.followUp,
      };
      this.$emit("submit-note", data);
      this.resetData();
    },
    handleClear() {
      this.comment.type = "Comment";
      this.comment.content = "";
      this.comment.text = "";
      this.tags = [];
    },
    updateComment() {
      const regex = /(<([^>]+)>)/gi;
      this.comment.text = this.comment.content.replace(regex, "");
    },
    handleTags(newTags) {
      this.tags = newTags;
    },
    handleFollowUp($event) {
      this.followUp = $event.target.checked;
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
.actions-wrapper {
  display: flex;
  column-gap: 3px;
  flex-wrap: wrap;
}
.actions-wrapper .v-btn.theme--dark {
  background-color: white;
  margin-left: 2px;
}
.emoji-icon {
  font-size: 18px;
  line-height: 1;
}
.check-box {
  display: flex;
  align-items: center;
}
.check-box > label {
  display: flex;
  column-gap: 5px;
  font-size: 13px;
  align-items: center;
  font-weight: 500;
  line-height: 20px;
  color: #6b7280;
}
</style>
