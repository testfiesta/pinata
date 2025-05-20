<template>
  <v-container class="wrapper">
    <div class="content">
      <v-tiptap
        :value="$store.state.session.notes.content"
        class="tiptap-theme"
        :placeholder="$t('message.insert_note')"
        ref="notes"
        :toolbar="[
          '#headings',
          '#bold',
          '#italic',
          '#underline',
          '#bulletList',
          '#orderedList',
          '#link',
          '#blockquote',
        ]"
        @input="updateNotes"
      >
        <template #headings="{ editor }">
          <v-select
            v-model="selectedHeading"
            :items="headingOptions"
            :background-color="inputBg"
            :color="currentTheme.secondary"
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
      </v-tiptap>
      <div class="evidence-wrapper mt-3">
        <draggable
          v-model="itemLists"
          draggable=".draggable-item"
          class="draggable-wrapper"
          :animation="200"
          @change="handleChange"
        >
          <transition-group class="draggable-group mb-2">
            <div
              v-for="(item, i) in itemLists"
              :key="i"
              class="draggable-item notes-evidence"
            >
              <template v-if="getType(item.fileType) === 'image'">
                <div class="d-flex justify-end align-center">
                  <v-checkbox
                    :value="checkedItem(item.stepID)"
                    class="field-theme mt-0"
                    :item-value="item.stepID"
                    :ripple="false"
                    off-icon="icon-checkbox-off"
                    on-icon="icon-checkbox-on"
                    @change="handleSelected($event, item.stepID)"
                    hide-details
                  />
                </div>
                <div
                  class="image-wrapper"
                  @click="handleItemClick(item.stepID)"
                >
                  <img
                    class="screen-img"
                    style="max-width: 100%"
                    :src="
                      $isElectron
                        ? `file://${item.filePath}`
                        : `${item.filePath}`
                    "
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
                    color="#ffffff"
                    text-color="#344054"
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
                      depressed
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
                            depressed
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
                  <v-checkbox
                    :item-value="item.followUp"
                    name="follow_up"
                    class="field-theme"
                    :ripple="false"
                    off-icon="icon-checkbox-off"
                    on-icon="icon-checkbox-on"
                    @change="handleFollowUp($event, item.stepID)"
                  >
                    <template v-slot:label>
                      <span
                        class="fs-14"
                        :style="{ color: currentTheme.secondary }"
                        >{{ $tc("caption.required_follow_up", 1) }}</span
                      >
                    </template>
                  </v-checkbox>
                </div>
              </template>
              <template v-if="getType(item.fileType) === 'video'">
                <div class="d-flex justify-end align-center">
                  <v-checkbox
                    :value="checkedItem(item.stepID)"
                    class="field-theme mt-0"
                    :item-value="item.stepID"
                    :ripple="false"
                    off-icon="icon-checkbox-off"
                    on-icon="icon-checkbox-on"
                    @change="handleSelected($event, item.stepID)"
                    hide-details
                  />
                </div>
                <div
                  class="video-wrapper"
                  @click.prevent="handleItemClick(item.stepID)"
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
                    color="#ffffff"
                    text-color="#344054"
                  >
                    {{ tag.text }}
                  </v-chip>
                </div>
                <div class="actions-wrapper">
                  <template v-if="item.emoji.length">
                    <v-btn
                      rounded
                      depressed
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
                            depressed
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
                  <v-checkbox
                    :item-value="item.followUp"
                    name="follow_up"
                    class="field-theme"
                    :ripple="false"
                    off-icon="icon-checkbox-off"
                    on-icon="icon-checkbox-on"
                    @change="handleFollowUp($event, item.stepID)"
                  >
                    <template v-slot:label>
                      <span
                        class="fs-14"
                        :style="{ color: currentTheme.secondary }"
                        >{{ $tc("caption.required_follow_up", 1) }}</span
                      >
                    </template>
                  </v-checkbox>
                </div>
              </template>
              <template v-if="getType(item.fileType) === 'audio'">
                <div class="d-flex justify-end align-center">
                  <v-checkbox
                    :value="checkedItem(item.stepID)"
                    class="field-theme mt-0"
                    :item-value="item.stepID"
                    :ripple="false"
                    off-icon="icon-checkbox-off"
                    on-icon="icon-checkbox-on"
                    @change="handleSelected($event, item.stepID)"
                    hide-details
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
                    color="#ffffff"
                    text-color="#344054"
                  >
                    {{ tag.text }}
                  </v-chip>
                </div>
                <div class="actions-wrapper">
                  <template v-if="item.emoji.length">
                    <v-btn
                      rounded
                      depressed
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
                            depressed
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
                  <v-checkbox
                    :item-value="item.followUp"
                    name="follow_up"
                    class="field-theme"
                    :ripple="false"
                    off-icon="icon-checkbox-off"
                    on-icon="icon-checkbox-on"
                    @change="handleFollowUp($event, item.stepID)"
                  >
                    <template v-slot:label>
                      <span
                        class="fs-14"
                        :style="{ color: currentTheme.secondary }"
                        >{{ $tc("caption.required_follow_up", 1) }}</span
                      >
                    </template>
                  </v-checkbox>
                </div>
              </template>
              <template v-if="getType(item.fileType) === 'text'">
                <div class="d-flex justify-end align-center">
                  <v-checkbox
                    :value="checkedItem(item.stepID)"
                    class="field-theme mt-0"
                    :item-value="item.stepID"
                    :ripple="false"
                    off-icon="icon-checkbox-off"
                    on-icon="icon-checkbox-on"
                    @change="handleSelected($event, item.stepID)"
                    hide-details
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
                    color="#ffffff"
                    text-color="#344054"
                  >
                    {{ tag.text }}
                  </v-chip>
                </div>
                <div class="check-box mt-1">
                  <v-checkbox
                    :item-value="item.followUp"
                    name="follow_up"
                    class="field-theme"
                    :ripple="false"
                    off-icon="icon-checkbox-off"
                    on-icon="icon-checkbox-on"
                    @change="handleFollowUp($event, item.stepID)"
                  >
                    <template v-slot:label>
                      <span
                        class="fs-14"
                        :style="{ color: currentTheme.secondary }"
                        >{{ $tc("caption.required_follow_up", 1) }}</span
                      >
                    </template>
                  </v-checkbox>
                </div>
              </template>
              <template v-if="getType(item.fileType) === undefined">
                <div class="d-flex justify-end align-center">
                  <v-checkbox
                    :value="checkedItem(item.stepID)"
                    class="field-theme mt-0"
                    :item-value="item.stepID"
                    :ripple="false"
                    off-icon="icon-checkbox-off"
                    on-icon="icon-checkbox-on"
                    @change="handleSelected($event, item.stepID)"
                    hide-details
                  />
                </div>
                <div
                  v-if="getType(item.fileType) === 'image'"
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
                  v-else-if="getType(item.fileType) === 'video'"
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
                  v-else-if="getType(item.fileType) === 'audio'"
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
                  class="note-wrapper"
                  @click="handleItemClick(item.stepID)"
                >
                  <font-awesome-icon
                    :icon="textTypes[item.comment.type].icon"
                    class="mr-1"
                    :style="{
                      borderColor: textTypes[item.comment.type].fill,
                      color: textTypes[item.comment.type].fill,
                    }"
                    :border="true"
                  />
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
                    color="#ffffff"
                    text-color="#344054"
                  >
                    {{ tag.text }}
                  </v-chip>
                </div>
                <div class="check-box mt-1">
                  <v-checkbox
                    :item-value="item.followUp"
                    name="follow_up"
                    class="field-theme"
                    :ripple="false"
                    off-icon="icon-checkbox-off"
                    on-icon="icon-checkbox-on"
                    @change="handleFollowUp($event, item.stepID)"
                  >
                    <template v-slot:label>
                      <span
                        class="fs-14"
                        :style="{ color: currentTheme.secondary }"
                        >{{ $tc("caption.required_follow_up", 1) }}</span
                      >
                    </template>
                  </v-checkbox>
                </div>
              </template>
              <template v-if="getType(item.fileType) === 'mindmap'">
                <div class="d-flex justify-end align-center">
                  <v-checkbox
                    :value="checkedItem(item.stepID)"
                    class="field-theme mt-0"
                    :item-value="item.stepID"
                    :ripple="false"
                    off-icon="icon-checkbox-off"
                    on-icon="icon-checkbox-on"
                    @change="handleSelected($event, item.stepID)"
                    hide-details
                  />
                </div>
                <div
                  class="image-wrapper"
                  @click="handleItemClick(item.stepID)"
                >
                  <img
                    class="screen-img"
                    style="max-width: 100%"
                    :src="
                      $isElectron
                        ? `file://${item.filePath}`
                        : `${item.filePath}`
                    "
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
                    color="#ffffff"
                    text-color="#344054"
                  >
                    {{ tag.text }}
                  </v-chip>
                </div>
                <div class="check-box mt-1">
                  <v-checkbox
                    :item-value="item.followUp"
                    name="follow_up"
                    class="field-theme"
                    :ripple="false"
                    off-icon="icon-checkbox-off"
                    on-icon="icon-checkbox-on"
                    @change="handleFollowUp($event, item.stepID)"
                  >
                    <template v-slot:label>
                      <span
                        class="fs-14"
                        :style="{ color: currentTheme.secondary }"
                        >{{ $tc("caption.required_follow_up", 1) }}</span
                      >
                    </template>
                  </v-checkbox>
                </div>
              </template>
            </div>
          </transition-group>
        </draggable>
      </div>
    </div>
    <EditEvidenceDialog
      v-if="itemToEdit"
      v-model="editEvidenceDialog"
      :item-data="itemToEdit"
      @close="
        editEvidenceDialog = false;
        itemToEdit = null;
      "
    />
  </v-container>
</template>

<script>
import draggable from "vuedraggable";
import { VEmojiPicker } from "v-emoji-picker";
import theme from "../mixins/theme";
import { debounce } from "lodash";
import { FILE_TYPES, TEXT_TYPES } from "../modules/constants";
import EditEvidenceDialog from "@/components/dialogs/EditEvidenceDialog.vue";

export default {
  name: "NotesWrapper",
  components: {
    draggable,
    VEmojiPicker,
    EditEvidenceDialog,
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
        .filter((item) => item?.comment?.type !== "Summary");
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
  mixins: [theme],
  data() {
    return {
      notes: { text: "", content: "" },
      itemLists: this.items
        .slice()
        .reverse()
        .filter((item) => item.comment.type !== "Summary"),
      eventName: this.eventType,
      clicks: 0,
      selected: [],
      emojiMenu: {},
      selectedId: null,
      textTypes: TEXT_TYPES,
      editEvidenceDialog: false,
      itemToEdit: null,
      headingOptions: [
        { text: "Normal Text", level: 0 }, // Normal text option
        { text: "Heading 1", level: 1 },
        { text: "Heading 2", level: 2 },
        { text: "Heading 3", level: 3 },
      ],
      selectedHeading: 0,
    };
  },
  created() {
    this.debouncedUpdateNotes = debounce(this.actualUpdateNotes, 500);
  },
  mounted() {
    this.itemLists.map((item) => {
      this.emojiMenu[`menu-${item.stepID}`] = false;
    });
    if (this.$isElectron) {
      this.fetchNotes();
    }
    this.$refs.notes.editor.commands.focus();
  },
  computed: {
    status() {
      return this.$store.state.session.status;
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
    getType(type) {
      return FILE_TYPES[type];
    },
    async fetchNotes() {
      const sessionNotes = await this.$storageService.getNotes();
      if (sessionNotes) {
        this.notes = sessionNotes;
      }

      await this.$store.commit("setSessionNotes", this.notes);
    },
    async actualUpdateNotes(notesContent) {
      const regex = /(<([^>]+)>)/gi;
      const notesText = notesContent.replace(regex, "");
      if (this.$isElectron) {
        await this.$storageService.updateNotes({
          content: notesContent,
          text: notesText,
        });
      }
      await this.$store.commit("setSessionNotes", {
        content: notesContent,
        text: notesText,
      });
    },
    async updateNotes(notesContent) {
      this.debouncedUpdateNotes(notesContent);
    },
    handleChange() {
      this.saveData();
    },
    checkedItem(id) {
      return this.selected.includes(id);
    },
    handleSelected($event, id) {
      if ($event && !this.selected.includes(id)) {
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

    async handleActivateEditSession(id) {
      console.log("Edit session notes", id);
      this.itemToEdit = await this.$storageService.getItemById(id);
      console.log("itemToEdit notes", this.itemToEdit);
      this.editEvidenceDialog = true;
    },
    handleSelectedItem(id) {
      this.selectedId = id;
    },
    selectEmoji(emoji) {
      this.emojiMenu[`menu-${this.selectedId}`] = false;
      this.itemLists = this.itemLists.map((item) => {
        let temp = structuredClone(item);
        if (temp.stepID === this.selectedId) {
          if (temp.emoji?.filter((item) => item.data === emoji.data).length) {
            temp.emoji = temp.emoji?.filter((item) => item.data !== emoji.data);
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
        let temp = structuredClone(item);
        if (temp.stepID === id) {
          temp.emoji = temp.emoji?.filter((item) => item.data !== emoji.data);
        }
        return temp;
      });
      this.saveData();
    },
    handleFollowUp($event, id) {
      this.itemLists = this.itemLists.map((item) => {
        let temp = structuredClone(item);
        if (temp.stepID === id) {
          temp.followUp = $event;
        }
        return temp;
      });
      this.saveData();
    },
    async saveData() {
      await this.$store.commit(
        "setSessionItems",
        this.itemLists.slice().reverse()
      );
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
  border: 10px solid #f9f9fb;
  background-color: #f9f9fb;
  border-radius: 0.5rem;
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
  margin-top: 1rem;
  margin-bottom: 1rem;
}
.comment-wrapper p {
  margin-bottom: 0 !important;
}
.tags-wrapper .tag {
  margin-right: 5px;
  margin-bottom: 1rem;
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
