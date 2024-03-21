<template>
  <v-container fluid class="wrapper">
    <div class="content">
      <div class="content-top">
        <ReviewWrapper
          :item="item"
          :processing="processing"
          :configItem="config"
          :trigger-save="triggerSaveEvent"
          :auto-save="autoSaveEvent"
        />
      </div>
      <v-divider></v-divider>
      <div class="content-bottom">
        <div class="actions-wrapper">
          <template v-if="emojis.length">
            <v-btn
              rounded
              color="primary"
              class="pa-0 mb-1"
              height="26"
              min-width="45"
              v-for="(emoji, i) in emojis"
              :key="i"
              :disabled="processing"
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
                    :disabled="processing"
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
              v-model="followUp"
              :disabled="processing"
            />{{ $tc("caption.required_follow_up", 1) }}
          </label>
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
            v-model="comment.content"
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
        <div
          v-shortkey="tagsHotkey"
          @shortkey="$hotkeyHelpers.focusField($refs, 'tags')"
        >
          <vue-tags-input
            ref="tags"
            class="input-box"
            v-model="tagText"
            :tags="tags"
            :autocomplete-items="filteredTags"
            label="Tags"
            :max-tags="10"
            :maxlength="20"
            @tags-changed="handleTags"
            :placeholder="$t('message.insert_tag')"
            :disabled="processing"
          />
        </div>

        <div class="flex">
          <v-menu
            v-if="!createJiraTicket"
            top
            :offset-y="true"
            :close-on-content-click="false"
            ref="issueMenu"
            v-model="issueCreateDestinationMenu"
          >
            <template v-slot:activator="{ on: issueCreateDestinationMenu }">
              <v-tooltip top>
                <template v-slot:activator="{ on: onTooltip }">
                  <v-btn
                    id="btn__bug"
                    class="control-btn mx-1"
                    fab
                    outlined
                    small
                    color="default"
                    v-on="{ ...issueCreateDestinationMenu, ...onTooltip }"
                  >
                    <img
                      v-if="$vuetify.theme.dark === false"
                      :src="require('../assets/icon/bug.svg')"
                      width="24"
                      height="24"
                    />
                    <img
                      v-else
                      :src="require('../assets/icon/bug-gray.svg')"
                      width="24"
                      height="24"
                    />
                  </v-btn>
                </template>

                <span>{{ $tc("caption.create_new_issue", 1) }}</span>
              </v-tooltip>
            </template>
            <v-card class="mx-auto" width="150" tile>
              <v-list dense>
                <v-list-item
                  @click="
                    createJiraTicket = true;
                    issueCreateDestinationMenu = false;
                  "
                >
                  <v-list-item-icon class="mr-4">
                    <v-avatar size="24">
                      <img
                        :src="require('../assets/icon/jira.png')"
                        width="24"
                        alt="avatar"
                      />
                    </v-avatar>
                  </v-list-item-icon>
                  <v-list-item-content>
                    <v-list-item-title>{{
                      $tc("caption.jira", 1)
                    }}</v-list-item-title>
                  </v-list-item-content>
                </v-list-item>
              </v-list>
            </v-card>
          </v-menu>
          <v-btn
            v-if="createJiraTicket"
            class="text-capitalize pa-0 back-btn"
            plain
            @click="createJiraTicket = false"
            >{{ $tc("caption.cancel_creating_issue", 1) }}</v-btn
          >
        </div>
        <JiraAddIssueForm
          v-if="createJiraTicket"
          :credential-items="credentials.jira"
          :trigger-save="triggerJiraSaveTicket"
          :items="[item]"
          @issueAdded="handleSaveAndClose"
        />
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
            v-model="comment.type"
            :placeholder="$tc('caption.comment_type', 1)"
            :disabled="processing"
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
          @click="handleDiscard()"
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
          @click="handleSave()"
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

import {
  TEXT_TYPES,
  STATUSES,
  AI_ENABLED_FIELDS,
  FILE_TYPES,
} from "../modules/constants";

import openAIIntegrationHelper from "../integrations/OpenAIIntegrationHelpers";
import { mapGetters } from "vuex";
import jiraIntegrationHelper from "@/integrations/JiraIntegrationHelpers";
import JiraAddIssueForm from "@/components/jira/JiraAddIssueForm.vue";

export default {
  name: "AddEvidence",
  components: {
    ReviewWrapper,
    VueTagsInput,
    VEmojiPicker,
    JiraAddIssueForm,
  },
  data() {
    return {
      createJiraTicket: false,
      issueCreateDestinationMenu: false,
      item: {},
      items: [],
      comment: {
        type: "",
        content: "",
        text: "",
      },
      previousComment: {
        type: "",
        content: "",
        text: "",
      },
      commentLoading: false,
      name: "",
      tagText: "",
      tags: [],
      emojiMenu: false,
      emojis: [],
      followUp: false,
      commentTypes: Object.keys(TEXT_TYPES).filter(
        (item) => item !== "Summary"
      ),
      processing: true,
      triggerSaveEvent: false,
      triggerJiraSaveTicket: false,
      jiraTicketSaved: false,
      autoSaveEvent: false,
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
      hotkeys: "config/hotkeys",
      config: "config/fullConfig",
      credentials: "auth/credentials",
      defaultTags: "config/defaultTags",
      sessionItems: "sessionItems",
    }),
    filteredTags() {
      return this.allTags
        .filter((item) => {
          return item.toLowerCase().includes(this.tagText.toLowerCase());
        })
        .map((item) => {
          return { text: item };
        });
    },
    nameHotkey() {
      return this.$hotkeyHelpers.findBinding("evidence.name", this.hotkeys);
    },
    followUpHotkey() {
      return this.$hotkeyHelpers.findBinding("evidence.followUp", this.hotkeys);
    },
    commentHotkey() {
      return this.$hotkeyHelpers.findBinding("evidence.comment", this.hotkeys);
    },
    tagsHotkey() {
      return this.$hotkeyHelpers.findBinding("evidence.tags", this.hotkeys);
    },
    typeHotkey() {
      return this.$hotkeyHelpers.findBinding("evidence.type", this.hotkeys);
    },
    saveHotkey() {
      return this.$hotkeyHelpers.findBinding("evidence.save", this.hotkeys);
    },
    cancelHotkey() {
      return this.$hotkeyHelpers.findBinding("evidence.cancel", this.hotkeys);
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
    this.getAllTags();
    if (this.$isElectron) {
      this.$electronService.onActiveSession(this.activeSession);
    }

    // Focus on comment
    this.$refs.comment.editor.commands.focus();

    this.$root.$on("update-edit-item", this.updateEditItem);
    this.$root.$on("update-processing", this.updateProcessing);
    this.$root.$on("save-data", this.saveData);
  },
  watch: {
    createJiraTicket: async function (val) {
      if (val) {
        let response = await jiraIntegrationHelper.getAllProjects(
          this.credentials.jira
        );
        this.projects = response.projects;
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
    async activeSession(data) {
      // set theme mode
      const isDarkMode = this.config.theme === "dark";
      this.$vuetify.theme.dark = isDarkMode;
      localStorage.setItem("isDarkMode", isDarkMode);

      this.item = data;

      const splitName = this.item?.fileName.split(".") || [""];
      this.name = splitName.slice(0, -1).join(".");

      // optimize video
      if (FILE_TYPES[this.item.fileType] === "video") {
        await this.optimizeVideo();
      } else {
        this.processing = false;
      }

      // set comment type by config
      if (this.config.commentType && this.config.commentType !== "") {
        this.comment.type = this.config.commentType;
      }
      // set templates by config
      const template = this.config.templates[FILE_TYPES[this.item.fileType]];
      this.comment.content = template.content;
      this.comment.text = template.text;
    },
    toggleFollowUp() {
      this.followUp = !this.followUp;
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
    async getConfig() {
      const config = await this.$storageService.getConfig();
      this.$store.commit("config/setFullConfig", config);
    },
    async getCredentials() {
      const credentials = await this.$storageService.getCredentials();
      this.$store.commit("auth/setCredentials", credentials);
    },
    async optimizeVideo() {
      if (this.$isElectron) {
        // todo add web handler for this
        this.processing = true;

        const { status, message, fileSize, fileChecksum } =
          await this.$electronService.optimizeVideo(this.item.filePath);

        if (status === STATUSES.ERROR) {
          this.$root.$emit("set-snackbar", message);
          console.log(message);
        } else {
          this.item.fileSize = fileSize;
          this.item.fileChecksum = fileChecksum;
        }
        this.processing = false;
      }
    },
    updateComment() {
      const regex = /(<([^>]+)>)/gi;
      this.comment.text = this.comment.content.replace(regex, "");
    },
    updateEditItem(value) {
      this.item = value;
    },
    updateProcessing(value) {
      this.processing = value;
    },
    async handleDiscard() {
      if (this.$isElectron) {
        await this.$electronService.deleteFile(this.item.filePath);
        await this.$electronService.deleteFile(this.item.poster.filePath);
        await this.$electronService.closeAddWindow();
      }
    },
    async handleSave() {
      if (this.createJiraTicket) {
        this.triggerJiraSaveTicket = !this.triggerJiraSaveTicket;
      } else {
        await this.handleSaveAndClose();
      }
    },
    async handleSaveAndClose() {
      this.triggerSaveEvent = !this.triggerSaveEvent;
    },
    handleName() {
      this.item.fileName = this.name + this.fileSuffix;
    },
    handleTags(newTags) {
      this.tags = newTags;
    },
    handleFollowUp($event) {
      this.followUp = $event.target.checked;
    },
    selectEmoji(emoji) {
      this.emojiMenu = false;
      if (this.emojis.filter((item) => item.data === emoji.data).length) {
        this.emojis = this.emojis.filter((item) => item.data !== emoji.data);
      } else {
        this.emojis.push(emoji);
      }
    },
    removeEmoji(emoji) {
      this.emojis = this.emojis.filter((item) => item.data !== emoji.data);
    },
    async saveData() {
      const newItem = {
        ...this.item,
        comment: this.comment,
        tags: this.tags,
        emoji: this.emojis,
        followUp: this.followUp,
        timer_mark: this.item.timer_mark,
        createdAt: Date.now(),
      };
      this.items.push(newItem);
      await this.$store.commit("setSessionItems", this.items);
      if (this.$isElectron) {
        await this.$electronService.closeAddWindow();
      }
    },
    handleClear() {
      this.comment = {
        type: "Comment",
        content: "",
        text: "",
      };
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
.name-box {
  background: #fff;
  padding: 4px;
}
</style>
