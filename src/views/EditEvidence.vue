<template>
  <v-container fluid class="wrapper" v-if="Object.keys(item).length">
    <div class="content">
      <div
        class="content-top"
        v-if="Object.keys(item).length && getType(item.fileType) !== 'text'"
      >
        <ReviewWrapper
          :item="item"
          :configItem="config"
          :processing="processing"
          :trigger-save="triggerSaveEvent"
        />
      </div>
      <v-divider></v-divider>
      <div class="content-bottom">
        <div v-if="getType(item.fileType) !== 'text'">
          <div class="actions-wrapper">
            <template v-if="item.emoji.length">
              <v-btn
                rounded
                color="primary"
                class="pa-0 mb-1"
                height="26"
                min-width="45"
                style=""
                v-for="(emoji, i) in item.emoji"
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
                        :src="require('../assets/icon/add-emoticon.svg')"
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
          <div
            class="check-box"
            v-shortkey="followUpHotkey"
            @shortkey="toggleFollowUp()"
          >
            <label
              ><input
                type="checkbox"
                name="follow_up"
                class="item-select"
                v-model="item.followUp"
                @change="handleFollowUp($event)"
              />{{ $tc("caption.required_follow_up", 1) }}
            </label>
          </div>
        </div>
        <div
          v-shortkey="nameHotkey"
          @shortkey="$hotkeyHelpers.focusField($refs, 'nameTextField')"
        >
          <v-text-field
            name="name"
            color="secondary"
            :label="$tc('caption.filename', 1)"
            v-model="name"
            :suffix="fileSuffix"
            :disabled="processing"
            ref="nameTextField"
            @input="handleName"
          />
        </div>
        <v-card v-if="commentLoading" class="loading-wrapper" outlined flat>
          <v-progress-circular
            :color="currentTheme.primary"
            size="70"
            absolute
            indeterminate
          ></v-progress-circular>
        </v-card>
        <div
          v-else
          v-shortkey="commentHotkey"
          @shortkey="$hotkeyHelpers.focusField($refs, 'comment')"
        >
          <v-tiptap
            v-model="item.comment.content"
            :placeholder="$t('message.insert_comment')"
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
        </div>
        <div class="actions-wrapper" v-if="getType(item.fileType) === 'text'">
          <template v-if="item.emoji.length">
            <v-btn
              rounded
              color="primary"
              class="pa-0 mb-1"
              height="26"
              min-width="45"
              style=""
              v-for="(emoji, i) in item.emoji"
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
                      :src="require('../assets/icon/add-emoticon.svg')"
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
        <div
          v-shortkey="tagsHotkey"
          @shortkey="$hotkeyHelpers.focusField($refs, 'tags')"
        >
          <vue-tags-input
            ref="tags"
            class="input-box"
            v-model="tag"
            :tags="item.tags"
            :autocomplete-items="filteredTags"
            :max-tags="10"
            :maxlength="20"
            @tags-changed="handleTags"
            :placeholder="$t('message.insert_tag')"
          />
        </div>
        <div class="comment-type">
          <div
            :style="{ color: currentTheme.secondary }"
            v-shortkey="typeHotkey"
            @shortkey="openCommentType()"
          >
            {{ $tc("caption.comment_type", 1) }}
          </div>
          <v-select
            ref="commentType"
            :items="commentTypes"
            v-model="item.comment.type"
            :placeholder="$tc('caption.comment_type', 1)"
            solo
            dense
            hide-details="true"
          ></v-select>
        </div>
      </div>
    </div>
    <div class="footer">
      <v-btn
        class="text-capitalize"
        fill
        small
        color="white"
        :style="{ color: currentTheme.black }"
        @click="handleClear"
      >
        {{ $tc("caption.clear", 1) }}
      </v-btn>
      <div class="d-flex">
        <v-btn
          class="mr-2 text-capitalize"
          fill
          small
          color="white"
          :disabled="processing"
          :style="{ color: currentTheme.black }"
          v-shortkey="cancelHotkey"
          @shortkey="handleDiscard()"
          @click="handleDiscard"
        >
          {{ $tc("caption.discard", 1) }}
        </v-btn>
        <v-btn
          class="text-capitalize"
          fill
          small
          color="primary"
          :disabled="processing"
          v-shortkey="saveHotkey"
          @shortkey="handleSave()"
          @click="handleSave"
        >
          {{ $tc("caption.save", 1) }}
        </v-btn>
      </div>
    </div>
  </v-container>
</template>

<script>
import ReviewWrapper from "../components/ReviewWrapper.vue";
import VueTagsInput from "@johmun/vue-tags-input";
import { VEmojiPicker } from "v-emoji-picker";
import { mapGetters } from "vuex";

import {
  TEXT_TYPES,
  AI_ENABLED_FIELDS,
  FILE_TYPES,
} from "../modules/constants";

import openAIIntegrationHelper from "../integrations/OpenAIIntegrationHelpers";

export default {
  name: "EditEvidence",
  components: {
    ReviewWrapper,
    VueTagsInput,
    VEmojiPicker,
  },
  data() {
    return {
      item: {},
      items: [],
      config: {},
      credentials: {},
      previousComment: {
        type: "",
        content: "",
        text: "",
      },
      commentLoading: false,
      name: "",
      tag: "",
      emojiMenu: false,
      commentTypes: Object.keys(TEXT_TYPES).filter(
        (item) => item !== "Summary"
      ),
      processing: false,
      triggerSaveEvent: false,
      allTags: [],
    };
  },
  created() {
    this.fetchItems();
    this.getConfig();
    this.getCredentials();
  },
  computed: {
    ...mapGetters({
      defaultTags: "config/defaultTags",
      sessionItems: "sessionItems",
    }),
    filteredTags() {
      return this.allTags
        .filter((item) => {
          return item.toLowerCase().includes(this.tag.toLowerCase());
        })
        .map((item) => {
          return { text: item };
        });
    },
    nameHotkey() {
      return this.$hotkeyHelpers.findBinding(
        "evidence.name",
        this.config.hotkeys
      );
    },
    followUpHotkey() {
      return this.$hotkeyHelpers.findBinding(
        "evidence.followUp",
        this.config.hotkeys
      );
    },
    commentHotkey() {
      return this.$hotkeyHelpers.findBinding(
        "evidence.comment",
        this.config.hotkeys
      );
    },
    tagsHotkey() {
      return this.$hotkeyHelpers.findBinding(
        "evidence.tags",
        this.config.hotkeys
      );
    },
    typeHotkey() {
      return this.$hotkeyHelpers.findBinding(
        "evidence.type",
        this.config.hotkeys
      );
    },
    saveHotkey() {
      return this.$hotkeyHelpers.findBinding(
        "evidence.save",
        this.config.hotkeys
      );
    },
    cancelHotkey() {
      return this.$hotkeyHelpers.findBinding(
        "evidence.cancel",
        this.config.hotkeys
      );
    },
    aiAssistEnabled() {
      return this?.config?.ai?.enabled || false;
    },
    fileSuffix() {
      let splitName = [];
      if (this.item?.fileName) {
        splitName = this.item?.fileName.split(".");
      }
      return splitName.length > 1 ? "." + splitName[splitName.length - 1] : "";
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
    if (this.$isElectron) {
      this.$electronService.onActiveSession(this.activeSession);
    }
    this.getAllTags();
    this.$root.$on("update-edit-item", this.updateEditItem);
    this.$root.$on("update-processing", this.updateProcessing);
    this.$root.$on("save-data", this.saveData);
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
    getType(type) {
      return FILE_TYPES[type];
    },
    activeSession(data) {
      // set theme mode
      const isDarkMode = this.config.theme === "dark";
      this.$vuetify.theme.dark = isDarkMode;
      localStorage.setItem("isDarkMode", isDarkMode);

      // set templates
      this.item = data;

      const splitName = this.item?.fileName.split(".") || [""];
      this.name = splitName.slice(0, -1).join(".");

      this.processing = false;
    },
    toggleFollowUp() {
      this.item.followUp = !this.item.followUp;
    },
    openCommentType() {
      const input = this.$refs.commentType.$el.querySelector(
        "input:not([type=hidden]),textarea:not([type=hidden])"
      );
      input.click();
      input.focus();
    },
    async fetchItems() {
      this.items = await this.$storageService.getItems();
    },
    updateEditItem(value) {
      this.item = value;
    },
    updateProcessing(value) {
      this.processing = value;
    },
    async getConfig() {
      const config = await this.$storageService.getConfig();
      this.$store.commit("config/setFullConfig", config);
    },
    async getCredentials() {
      const credentials = await this.$storageService.getCredentials();
      this.$store.commit("auth/setCredentials", credentials);
    },
    updateComment() {
      const regex = /(<([^>]+)>)/gi;
      this.item.comment.text = this.item.comment.content.replace(regex, "");
    },
    selectEmoji(emoji) {
      this.emojiMenu = false;
      if (this.item.emoji.filter((item) => item.data === emoji.data).length) {
        this.item.emoji = this.item.emoji.filter(
          (item) => item.data !== emoji.data
        );
      } else {
        this.item.emoji.push(emoji);
      }
    },
    removeEmoji(emoji) {
      this.item.emoji = this.item.emoji.filter(
        (item) => item.data !== emoji.data
      );
    },
    handleClear() {
      this.item.comment.type = "Comment";
      this.item.comment.content = "";
      this.item.comment.text = "";
    },
    handleDiscard() {
      if (this.$isElectron) {
        this.$electronService.closeEditWindow();
      }
    },
    async handleSave() {
      if (FILE_TYPES[this.item.fileType] !== "text") {
        this.triggerSaveEvent = true;
      } else {
        await this.saveData(this.item);
      }
    },
    handleName() {
      this.item.fileName = this.name + this.fileSuffix;
    },
    handleTags(newTags) {
      this.item.tags = newTags;
    },
    handleFollowUp($event) {
      this.item.followUp = $event.target.checked;
    },
    async saveData(data) {
      if (data) {
        this.item.fileName = data.fileName;
        this.item.filePath = data.filePath;
        this.item.stepID = data.stepID;
        this.item.attachmentID = data.attachmentID;
      }

      this.$store.commit("updateSessionItem", this.item);
      if (this.$isElectron) {
        await this.$electronService.closeEditWindow();
      }
    },
    async handleAISuggestion(field, event) {
      if (
        (this.item[field]?.trim && this.item[field]?.trim()) ||
        this.item[field]?.content?.trim()
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
            this[previousField] = this.item[field];
          } else {
            this[previousField] = Object.assign({}, this.item[field]);
          }
          this[field + "Loading"] = true;
          let response = await openAIIntegrationHelper.enhanceText(
            this.credentials,
            this.config,
            field,
            this.item[field]
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
              this.item[field] = response.content;
            } else {
              this.item[field].content = response.content;
            }
          }
          this[AI_ENABLED_FIELDS[field].callback]();
          this[field + "Loading"] = false;
        } else {
          this.item[field] = this[previousField];
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
.wrapper {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100%;
  overflow-y: auto;
  padding: 0;
}
.content {
  flex-grow: 1;
  overflow: auto;
  display: flex;
  flex-direction: column;
}
.content .content-top {
  padding: 20px;
  flex-grow: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}
.file-wrapper {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  row-gap: 15px;
}
.file-wrapper .file-icon {
  padding: 30px;
  border-radius: 50%;
  border: 1px solid #d1d5db;
  box-shadow: 0px 1px 2px rgba(0, 0, 0, 0.05);
}
.file-wrapper .file-icon .v-icon {
  color: #6b7280;
  font-size: 50px;
}
.file-wrapper p {
  margin-bottom: 0;
  font-style: normal;
  font-weight: 700;
  font-size: 16px;
  line-height: 24px;
  color: #374151;
}
.content .content-bottom {
  padding: 20px;
  padding-bottom: 0;
  display: flex;
  flex-direction: column;
  row-gap: 10px;
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
.footer {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
}
</style>
