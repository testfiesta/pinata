<template>
  <v-container fluid style="min-height: 100vh" class="d-flex">
    <v-row>
      <v-col cols="3" class="wrapper pa-0">
        <div class="header">
          <LogoWrapper :height="34" :width="120" />
        </div>
        <div class="content">
          <TestWrapper :config-item="config" :credential-items="credentials" />
        </div>
        <div class="footer">
          <ExportPanel
            :items="items"
            :config-item="config"
            :credential-items="credentials"
          />
        </div>
      </v-col>
      <v-divider vertical></v-divider>
      <v-col cols="6" class="wrapper">
        <div
          v-if="Object.keys(editItem).length"
          class="d-flex flex-column"
          style="height: 100%"
        >
          <div class="flex-grow-1">
            <ReviewWrapper
              :item="editItem"
              :auto-save="autoSaveEvent"
              :configItem="config"
            />
          </div>
          <div class="flex-grow-0 mt-2">
            <div
              class="actions-wrapper mt-1 mb-2"
              v-if="
                editItem.fileType === 'image' ||
                editItem.fileType === 'video' ||
                editItem.fileType === 'audio'
              "
            >
              <template v-if="editItem.emoji.length">
                <v-btn
                  rounded
                  color="primary"
                  class="pa-0 mb-1"
                  height="26"
                  min-width="45"
                  style=""
                  v-for="(emoji, i) in editItem.emoji"
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
            <div class="check-box mb-2">
              <label
                ><input
                  type="checkbox"
                  name="follow_up"
                  class="item-select"
                  v-model="editItem.followUp"
                  @change="handleFollowUp($event)"
                />{{ $tc("caption.required_follow_up", 1) }}
              </label>
            </div>
            <v-tiptap
              v-model="editItem.comment.content"
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
              ]"
              @input="updateComment"
            >
            </v-tiptap>
            <vue-tags-input
              class="input-box mt-2"
              v-model="tag"
              :tags="editItem.tags"
              :max-tags="10"
              :maxlength="20"
              @tags-changed="handleTags"
              :placeholder="$t('message.insert_tag')"
            />
            <v-row class="mt-0 comment-wrapper">
              <v-col class="pr-0">
                <div
                  class="subtitle-2 label-text"
                  :style="{ color: currentTheme.secondary }"
                >
                  {{ $tc("caption.comment_type", 1) }}
                </div>
                <v-select
                  :items="commentTypes"
                  v-model="editItem.comment.type"
                  :placeholder="$tc('caption.comment_type', 1)"
                  solo
                  dense
                  @change="updateCommentType"
                  hide-details="true"
                ></v-select>
              </v-col>
              <v-col cols="auto" class="pl-0 d-flex align-end">
                <v-btn
                  plain
                  color="primary"
                  class="text-capitalize px-0"
                  @click="handleClear"
                >
                  {{ $tc("caption.clear", 1) }}
                </v-btn>
              </v-col>
            </v-row>
          </div>
        </div>
      </v-col>
      <v-divider vertical></v-divider>
      <v-col cols="3" class="wrapper pa-0">
        <div class="header">
          <SearchWrapper />
        </div>
        <div class="content my-1">
          <WorkspaceWrapper
            :items="searchItems"
            :selectedItems="selected"
            event-type="click"
            @activate-edit-session="activateEditSession"
          />
        </div>
        <div class="footer">
          <ControlPanel
            :selectedItems="selected"
            :items="items"
            :config-item="config"
            :credential-items="credentials"
            view-mode="normal"
          />
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import SearchWrapper from "../components/SearchWrapper.vue";
import TestWrapper from "../components/TestWrapper.vue";
import WorkspaceWrapper from "../components/WorkspaceWrapper.vue";
import ControlPanel from "../components/ControlPanel.vue";
import ExportPanel from "../components/ExportPanel.vue";
import LogoWrapper from "../components/LogoWrapper.vue";
import ReviewWrapper from "../components/ReviewWrapper.vue";

import VueTagsInput from "@johmun/vue-tags-input";
import { VEmojiPicker } from "v-emoji-picker";

import { TEXT_TYPES } from "@/modules/constants";

export default {
  name: "ResultView",
  components: {
    SearchWrapper,
    TestWrapper,
    WorkspaceWrapper,
    ControlPanel,
    ExportPanel,
    LogoWrapper,
    ReviewWrapper,
    VueTagsInput,
    VEmojiPicker,
  },
  props: {},
  watch: {},
  data() {
    return {
      items: [],
      config: {},
      credentials: {},
      editItem: {},
      commentTypes: Object.keys(TEXT_TYPES).filter(
        (item) => item !== "Summary"
      ),
      type: "Comment",
      emojiMenu: false,
      search: "",
      selected: [],
      autoSaveEvent: true,
      postsession: {
        tasks: [],
      },
      tag: "",
    };
  },
  created() {
    this.fetchItems();
    this.getConfig();
    this.getCredentials();
  },
  mounted() {
    this.$root.$on("submit-search", this.handleSearch);
    this.$root.$on("update-selected", this.updateSelected);
    this.$root.$on("save-data", this.saveData);
    this.$root.$on("update-edit-item", this.activateEditSession);

    if (this.$isElectron) {
      this.$electronService.onDataChange(this.fetchItems);
      this.$electronService.onConfigChange(this.getConfig);
      this.$electronService.onCredentialChange(this.getCredentials);
      this.$electronService.onMetaChange(() => {
        this.fetchItems();
        this.getConfig();
        this.getCredentials();
      });
    }
  },
  computed: {
    currentTheme() {
      if (this.$vuetify.theme.dark) {
        return this.$vuetify.theme.themes.dark;
      } else {
        return this.$vuetify.theme.themes.light;
      }
    },
    searchItems() {
      let tempItems = this.items;

      if (this.search !== "" && this.search) {
        tempItems = tempItems.filter((item) => {
          return item.comment.content
            .toUpperCase()
            .includes(this.search.toUpperCase());
        });
      }
      return tempItems;
    },
  },
  methods: {
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
    selectEmoji(emoji) {
      this.emojiMenu = false;
      if (
        this.editItem.emoji.filter((item) => item.data === emoji.data).length
      ) {
        this.editItem.emoji = this.editItem.emoji.filter(
          (item) => item.data !== emoji.data
        );
      } else {
        this.editItem.emoji.push(emoji);
      }
      this.saveData();
    },
    removeEmoji(emoji) {
      this.editItem.emoji = this.editItem.emoji.filter(
        (item) => item.data !== emoji.data
      );
      this.saveData();
    },
    handleSearch(val) {
      this.search = val;
    },
    updateComment() {
      const regex = /(<([^>]+)>)/gi;
      this.editItem.comment.text = this.editItem.comment.content.replace(
        regex,
        ""
      );
      this.saveData();
    },
    handleTags(newTags) {
      this.editItem.tags = newTags;
      this.saveData();
    },
    handleFollowUp($event) {
      this.editItem.followUp = $event.target.checked;
      this.saveData();
    },
    handleCommentType(val) {
      this.editItem.commentType = val;
      this.saveData();
    },
    saveData() {
      this.$storageService.updateItem(this.editItem);
    },
    handleClear() {
      this.editItem.comment = "";
      this.editItem.commentType = "Comment";
      this.saveData();
    },
    updateSelected(value) {
      this.selected = value;
    },
    activateEditSession(value) {
      this.editItem = value;
      this.saveData();
    },
  },
};
</script>

<style scoped>
.wrapper {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100%;
  overflow-y: auto;
}

.header {
  width: 100%;
  min-height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.content {
  flex-grow: 1;
  overflow: auto;
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
  align-items: center;
}
</style>
