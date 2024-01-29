<template>
  <v-container class="wrapper">
    <div class="content">
      <v-tiptap
        v-model="notes.content"
        :placeholder="$t('message.insert_note')"
        ref="notes"
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
        @input="handleNotes"
      >
      </v-tiptap>
      <div class="evidence-wrapper mt-3">
        <draggable
          v-model="itemLists"
          draggable=".draggable-item"
          class="draggable-wrapper"
          @change="handleChange"
        >
          <transition-group class="draggable-group mb-2">
            <div
              v-for="(item, i) in itemLists"
              :key="i"
              class="draggable-item notes-evidence"
            >
              <template v-if="item.sessionType === 'Screenshot'">
                <div class="d-flex justify-end align-center">
                  <input
                    type="checkbox"
                    class="item-select"
                    :value="item.stepID"
                    :checked="checkedItem(item.stepID)"
                    @change="handleSelected($event, item.stepID)"
                  />
                </div>
                <div
                  class="image-wrapper"
                  @click="handleItemClick(item.stepID)"
                >
                  <img
                    class="screen-img"
                    style="max-width: 100%"
                    :src="`file://${item.filePath}`"
                  />
                </div>
                <div class="comment-wrapper">
                  <span class="comment-type"
                    >{{
                      item.comment.text
                        ? item.comment.type + ": " + item.comment.text
                        : ""
                    }}
                  </span>
                </div>
                <div v-if="item.tags.length" class="tags-wrapper">
                  <v-chip
                    v-for="(tag, i) in item.tags"
                    :key="i"
                    class="tag"
                    small
                    color="#fee2e2"
                    text-color="#991b1b"
                  >
                    {{ tag.text }}
                  </v-chip>
                </div>
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
                      @click="removeEmoji(item.stepID, emoji)"
                    >
                      <span class="emoji-icon">{{ emoji.data }}</span>
                      <v-icon x-small>mdi-close</v-icon>
                    </v-btn>
                  </template>

                  <v-menu
                    v-model="emojiMenu[`menu-${item.stepID}`]"
                    :close-on-content-click="false"
                    right
                    bottom
                    nudge-bottom="4"
                    offset-y
                  >
                    <template v-slot:activator="{ on: menu }">
                      <v-tooltip bottom>
                        <template v-slot:activator="{ on: tooltip }">
                          <v-btn
                            rounded
                            class="pa-0 mb-1"
                            height="26"
                            min-width="35"
                            v-on="{
                              ...menu,
                              ...tooltip,
                            }"
                            @click="handleSelectedItem(item.stepID)"
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
                <div class="check-box mt-1">
                  <label
                    ><input
                      type="checkbox"
                      name="follow_up"
                      class="item-select"
                      v-model="item.followUp"
                      @change="handleFollowUp($event, item.stepID)"
                    />{{ $tc("caption.required_follow_up", 1) }}
                  </label>
                </div>
              </template>
              <template v-if="item.sessionType === 'Video'">
                <div class="d-flex justify-end align-center">
                  <input
                    type="checkbox"
                    class="item-select"
                    :value="item.stepID"
                    :checked="checkedItem(item.stepID)"
                    @change="handleSelected($event, item.stepID)"
                  />
                </div>
                <div
                  class="video-wrapper"
                  @click="handleItemClick(item.stepID)"
                >
                  <video
                    controls
                    style="width: 100%"
                    :src="`file://${item.filePath}`"
                  ></video>
                </div>
                <div class="comment-wrapper">
                  <span class="comment-type"
                    >{{
                      item.comment.text
                        ? item.comment.type + ": " + item.comment.text
                        : ""
                    }}
                  </span>
                </div>
                <div v-if="item.tags.length" class="tags-wrapper">
                  <v-chip
                    v-for="(tag, i) in item.tags"
                    :key="i"
                    class="tag"
                    small
                    color="#fee2e2"
                    text-color="#991b1b"
                  >
                    {{ tag.text }}
                  </v-chip>
                </div>
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
                      @click="removeEmoji(item.stepID, emoji)"
                    >
                      <span class="emoji-icon">{{ emoji.data }}</span>
                      <v-icon x-small>mdi-close</v-icon>
                    </v-btn>
                  </template>

                  <v-menu
                    v-model="emojiMenu[`menu-${item.stepID}`]"
                    :close-on-content-click="false"
                    right
                    bottom
                    nudge-bottom="4"
                    offset-y
                  >
                    <template v-slot:activator="{ on: menu }">
                      <v-tooltip bottom>
                        <template v-slot:activator="{ on: tooltip }">
                          <v-btn
                            rounded
                            class="pa-0 mb-1"
                            height="26"
                            min-width="35"
                            v-on="{
                              ...menu,
                              ...tooltip,
                            }"
                            @click="handleSelectedItem(item.stepID)"
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
                <div class="check-box mt-1">
                  <label
                    ><input
                      type="checkbox"
                      name="follow_up"
                      class="item-select"
                      v-model="item.followUp"
                      @change="handleFollowUp($event, item.stepID)"
                    />{{ $tc("caption.required_follow_up", 1) }}
                  </label>
                </div>
              </template>
              <template v-if="item.sessionType === 'Audio'">
                <div class="d-flex justify-end align-center">
                  <input
                    type="checkbox"
                    class="item-select"
                    :value="item.stepID"
                    :checked="checkedItem(item.stepID)"
                    @change="handleSelected($event, item.stepID)"
                  />
                </div>
                <div
                  class="audio-wrapper"
                  @click="handleItemClick(item.stepID)"
                >
                  <div class="audio-wave">
                    <img :src="item.poster" />
                  </div>
                  <div class="audio-play">
                    <v-icon medium>mdi-play-circle</v-icon>
                  </div>
                </div>
                <div class="comment-wrapper">
                  <span class="comment-type"
                    >{{
                      item.comment.text
                        ? item.comment.type + ": " + item.comment.text
                        : ""
                    }}
                  </span>
                </div>
                <div v-if="item.tags.length" class="tags-wrapper">
                  <v-chip
                    v-for="(tag, i) in item.tags"
                    :key="i"
                    class="tag"
                    small
                    color="#fee2e2"
                    text-color="#991b1b"
                  >
                    {{ tag.text }}
                  </v-chip>
                </div>
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
                      @click="removeEmoji(item.stepID, emoji)"
                    >
                      <span class="emoji-icon">{{ emoji.data }}</span>
                      <v-icon x-small>mdi-close</v-icon>
                    </v-btn>
                  </template>

                  <v-menu
                    v-model="emojiMenu[`menu-${item.stepID}`]"
                    :close-on-content-click="false"
                    right
                    bottom
                    nudge-bottom="4"
                    offset-y
                  >
                    <template v-slot:activator="{ on: menu }">
                      <v-tooltip bottom>
                        <template v-slot:activator="{ on: tooltip }">
                          <v-btn
                            rounded
                            class="pa-0 mb-1"
                            height="26"
                            min-width="35"
                            v-on="{
                              ...menu,
                              ...tooltip,
                            }"
                            @click="handleSelectedItem(item.stepID)"
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
                <div class="check-box mt-1">
                  <label
                    ><input
                      type="checkbox"
                      name="follow_up"
                      class="item-select"
                      v-model="item.followUp"
                      @change="handleFollowUp($event, item.stepID)"
                    />{{ $tc("caption.required_follow_up", 1) }}
                  </label>
                </div>
              </template>
              <template v-if="item.sessionType === 'Note'">
                <div class="d-flex justify-end align-center">
                  <input
                    type="checkbox"
                    class="item-select"
                    :value="item.stepID"
                    :checked="checkedItem(item.stepID)"
                    @change="handleSelected($event, item.stepID)"
                  />
                </div>
                <div class="note-wrapper" @click="handleItemClick(item.stepID)">
                  <span class="comment-type"
                    >{{ item.comment.type + ": " + item.comment.text }}
                  </span>
                </div>
                <div v-if="item.tags.length" class="tags-wrapper">
                  <v-chip
                    v-for="(tag, i) in item.tags"
                    :key="i"
                    class="tag"
                    small
                    color="#fee2e2"
                    text-color="#991b1b"
                  >
                    {{ tag.text }}
                  </v-chip>
                </div>
                <div class="check-box mt-1">
                  <label
                    ><input
                      type="checkbox"
                      name="follow_up"
                      class="item-select"
                      v-model="item.followUp"
                      @change="handleFollowUp($event, item.stepID)"
                    />{{ $tc("caption.required_follow_up", 1) }}
                  </label>
                </div>
              </template>
              <template v-if="item.sessionType === 'File'">
                <div class="d-flex justify-end align-center">
                  <input
                    type="checkbox"
                    class="item-select"
                    :value="item.stepID"
                    :checked="checkedItem(item.stepID)"
                    @change="handleSelected($event, item.stepID)"
                  />
                </div>
                <div
                  v-if="item.fileType === 'image'"
                  class="image-wrapper"
                  @click="handleItemClick(item.stepID)"
                >
                  <img
                    class="screen-img"
                    style="max-width: 100%"
                    :src="`file://${item.filePath}`"
                  />
                </div>
                <div
                  v-else-if="item.fileType === 'video'"
                  class="video-wrapper"
                  @click="handleItemClick(item.stepID)"
                >
                  <video
                    controls
                    style="width: 100%"
                    :src="`file://${item.filePath}`"
                  ></video>
                </div>
                <div
                  v-else-if="item.fileType === 'audio'"
                  class="audio-wrapper"
                  @click="handleItemClick(item.stepID)"
                >
                  <div class="audio-wave">
                    <img :src="item.poster" />
                  </div>
                  <div class="audio-play">
                    <v-icon medium>mdi-play-circle</v-icon>
                  </div>
                </div>
                <div
                  v-else
                  class="file-wrapper"
                  @click="handleItemClick(item.stepID)"
                >
                  <div class="file-name">
                    <span>{{ item.fileName }}</span>
                  </div>
                  <div class="file-icon">
                    <v-icon medium>mdi-file</v-icon>
                  </div>
                </div>
                <div class="comment-wrapper">
                  <span class="comment-type"
                    >{{
                      item.comment.text
                        ? item.comment.type + ": " + item.comment.text
                        : ""
                    }}
                  </span>
                </div>
                <div v-if="item.tags.length" class="tags-wrapper">
                  <v-chip
                    v-for="(tag, i) in item.tags"
                    :key="i"
                    class="tag"
                    small
                    color="#fee2e2"
                    text-color="#991b1b"
                  >
                    {{ tag.text }}
                  </v-chip>
                </div>
                <div class="check-box mt-1">
                  <label
                    ><input
                      type="checkbox"
                      name="follow_up"
                      class="item-select"
                      v-model="item.followUp"
                      @change="handleFollowUp($event, item.stepID)"
                    />{{ $tc("caption.required_follow_up", 1) }}
                  </label>
                </div>
              </template>
              <template v-if="item.sessionType === 'Mindmap'">
                <div class="d-flex justify-end align-center">
                  <input
                    type="checkbox"
                    class="item-select"
                    :value="item.stepID"
                    :checked="checkedItem(item.stepID)"
                    @change="handleSelected($event, item.stepID)"
                  />
                </div>
                <div
                  class="image-wrapper"
                  @click="handleItemClick(item.stepID)"
                >
                  <img
                    class="screen-img"
                    style="max-width: 100%"
                    :src="`file://${item.filePath}`"
                  />
                </div>
                <div class="comment-wrapper">
                  <span class="comment-type"
                    >{{
                      item.comment.text
                        ? item.comment.type + ": " + item.comment.text
                        : ""
                    }}
                  </span>
                </div>
                <div v-if="item.tags.length" class="tags-wrapper">
                  <v-chip
                    v-for="(tag, i) in item.tags"
                    :key="i"
                    class="tag"
                    small
                    color="#fee2e2"
                    text-color="#991b1b"
                  >
                    {{ tag.text }}
                  </v-chip>
                </div>
                <div class="check-box mt-1">
                  <label
                    ><input
                      type="checkbox"
                      name="follow_up"
                      class="item-select"
                      v-model="item.followUp"
                      @change="handleFollowUp($event, item.stepID)"
                    />{{ $tc("caption.required_follow_up", 1) }}
                  </label>
                </div>
              </template>
            </div>
          </transition-group>
        </draggable>
      </div>
    </div>
  </v-container>
</template>

<script>
import draggable from "vuedraggable";
import { VEmojiPicker } from "v-emoji-picker";
import { IPC_FUNCTIONS, IPC_HANDLERS } from "@/modules/constants";

export default {
  name: "NotesWrapper",
  components: {
    draggable,
    VEmojiPicker,
  },
  props: {
    items: {
      type: Array,
      default: () => [],
    },
    selectedItems: {
      type: Array,
      default: () => [],
    },
    eventType: {
      type: String,
      default: () => "",
    },
  },
  watch: {
    items: function (newValue) {
      this.itemLists = newValue
        .slice()
        .reverse()
        .filter((item) => item.sessionType !== "Summary");
      this.itemLists.map((item) => {
        this.emojiMenu[`menu-${item.stepID}`] = false;
      });
    },
    selectedItems: function (newValue) {
      this.selected = newValue;
    },
    eventType: function (newValue) {
      this.eventName = newValue;
    },
  },
  data() {
    return {
      notes: { text: "", content: "" },
      itemLists: this.items
        .slice()
        .reverse()
        .filter((item) => item.sessionType !== "Summary"),
      eventName: this.eventType,
      clicks: 0,
      selected: [],
      emojiMenu: {},
      selectedId: null,
    };
  },
  mounted() {
    this.itemLists.map((item) => {
      this.emojiMenu[`menu-${item.stepID}`] = false;
    });
    this.fetchNotes();
    this.$refs.notes.editor.commands.focus();
  },
  computed: {
    status() {
      return this.$store.state.status;
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
    async fetchNotes() {
      this.notes = await this.$storageService.getNotes();
    },
    async handleNotes() {
      const regex = /(<([^>]+)>)/gi;
      this.notes.text = this.notes.content.replace(regex, "");

      await this.$storageService.updateNotes(this.notes);
    },
    handleChange() {
      this.saveData();
    },
    checkedItem(id) {
      return this.selected.includes(id);
    },
    handleSelected($event, id) {
      if ($event.target.checked && !this.selected.includes(id)) {
        this.selected.push(id);
      } else {
        this.selected = this.selected.filter((n) => n != id);
      }
      this.$root.$emit("update-selected", this.selected);
    },
    handleItemClick(id) {
      this.clicks++;
      if (this.clicks === 1) {
        setTimeout(
          function () {
            switch (this.clicks) {
              case 1:
                if (this.eventName === "click") {
                  this.handleActivateEditSession(id);
                }
                break;
              default:
                if (this.eventName === "dblclick") {
                  this.handleActivateEditSession(id);
                }
            }
            this.clicks = 0;
          }.bind(this),
          200
        );
      }
    },
    handleActivateEditSession(id) {
      window.ipc
        .invoke(IPC_HANDLERS.PERSISTENCE, {
          func: IPC_FUNCTIONS.GET_ITEM_BY_ID,
          data: id,
        })
        .then((data) => {
          this.$emit("activate-edit-session", data);
        });
    },
    handleSelectedItem(id) {
      this.selectedId = id;
    },
    selectEmoji(emoji) {
      this.emojiMenu[`menu-${this.selectedId}`] = false;
      this.itemLists = this.itemLists.map((item) => {
        let temp = Object.assign({}, item);
        if (temp.stepID === this.selectedId) {
          if (temp.emoji.filter((item) => item.data === emoji.data).length) {
            temp.emoji = temp.emoji.filter((item) => item.data !== emoji.data);
          } else {
            temp.emoji.push(emoji);
          }
        }
        return temp;
      });
      this.saveData();
    },
    removeEmoji(id, emoji) {
      this.itemLists = this.itemLists.map((item) => {
        let temp = Object.assign({}, item);
        if (temp.stepID === id) {
          temp.emoji = temp.emoji.filter((item) => item.data !== emoji.data);
        }
        return temp;
      });
      this.saveData();
    },
    handleFollowUp($event, id) {
      this.itemLists = this.itemLists.map((item) => {
        let temp = Object.assign({}, item);
        if (temp.stepID === id) {
          temp.followUp = $event.target.checked;
        }
        return temp;
      });
      this.saveData();
    },
    async saveData() {
      await this.$storageService.updateItems(this.itemLists.slice().reverse());
    },
  },
};
</script>
<style scoped>
.wrapper {
  display: flex;
  flex-direction: column;
}
.content {
  overflow: hidden;
}
.evidence-wrapper {
  position: relative;
  width: 100%;
}
.draggable-wrapper {
  position: relative;
  width: 100%;
  overflow-x: scroll;
  overflow-y: hidden;
}
.draggable-group {
  width: 100%;
  display: flex;
  column-gap: 10px;
}
.notes-evidence.draggable-item {
  flex: 1;
  row-gap: 5px;
  min-width: calc(60% - 5px);
  max-width: calc(60% - 5px);
  border: 10px solid rgba(255, 173, 80, 0.25);
  background-color: rgba(255, 173, 80, 0.25);
}
.image-wrapper {
  position: relative;
  display: flex;
  background: #fff;
  border: 1px solid #d1d3db;
  border-radius: 4px;
  overflow: hidden;
  cursor: pointer;
}
.video-wrapper {
  position: relative;
  display: flex;
  background: #fff;
  border: 1px solid #d1d5db;
  overflow: hidden;
  cursor: pointer;
}
.audio-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 14px;
  background: #fff;
  border-radius: 6px;
  border: 1px solid #d1d5db;
  cursor: pointer;
}
.audio-wrapper .audio-wave {
  flex-grow: 1;
}
.audio-wrapper .audio-wave img {
  width: 100%;
}
.note-wrapper {
  display: flex;
  padding: 8px 14px;
  background: #fff;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  cursor: pointer;
}
.note-wrapper p {
  margin-bottom: 0 !important;
}
.file-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 14px;
  background: #fff;
  border-radius: 6px;
  border: 1px solid #d1d5db;
  cursor: pointer;
}
.file-wrapper .file-name {
  font-size: 14px;
  font-weight: 500;
  font-style: normal;
  line-height: 16px;
  color: #6b7280;
  cursor: pointer;
}
.comment-wrapper {
  display: flex;
  background: #fff;
}
.comment-wrapper p {
  margin-bottom: 0 !important;
}
.tags-wrapper .tag {
  margin-right: 5px;
}
.tags-wrapper .tag:last-child {
  margin-right: 0;
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
  margin-top: 10px;
  display: flex;
  justify-content: flex-end;
}
</style>
