<template>
  <v-container>
    <v-card :style="{ backgroundColor: currentTheme.background }">
      <v-card-title class="dialog-title">
        {{ $tc("caption.take_note", 1) }}
      </v-card-title>
      <v-divider></v-divider>
      <v-container class="note-wrapper">
        <v-row>
          <v-col cols="12">
            <v-tiptap
              v-model="comment.content"
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
              @input="handleNote"
            >
            </v-tiptap>
          </v-col>
        </v-row>
        <v-row class="mt-0">
          <v-col cols="12">
            <vue-tags-input
              class="input-box"
              v-model="tag"
              :tags="tags"
              :max-tags="10"
              :maxlength="20"
              @tags-changed="handleTags"
              :placeholder="$t('message.insert_tag')"
            />
          </v-col>
        </v-row>
        <v-row class="mt-0">
          <v-col class="pr-0">
            <div
              class="subtitle-2 label-text"
              :style="{ color: currentTheme.secondary }"
            >
              {{ $tc("caption.note_type", 1) }}
            </div>
            <v-select
              :items="commentTypes"
              v-model="comment.type"
              :placeholder="$tc('caption.comment_type', 1)"
              solo
              dense
              hide-details="true"
            ></v-select>
          </v-col>
          <v-col cols="auto" class="pl-0 d-flex align-end">
            <v-btn
              plain
              color="primary"
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
              color="white"
              :style="{ color: currentTheme.black }"
              @click="handleDiscard"
            >
              {{ $tc("caption.discard", 1) }}
            </v-btn>
          </v-col>
          <v-col cols="6 pl-1">
            <v-btn class="btn" small block color="primary" @click="handleSave">
              {{ $tc("caption.save", 1) }}
            </v-btn>
          </v-col>
        </v-row>
      </v-card-actions>
    </v-card>
  </v-container>
</template>
<script>
import VueTagsInput from "@johmun/vue-tags-input";

import {
  TEXT_TYPES,
  IPC_HANDLERS,
  IPC_FUNCTIONS,
  IPC_BIND_KEYS,
} from "../modules/constants";

export default {
  name: "NoteEditor",
  components: {
    VueTagsInput,
  },
  data() {
    return {
      config: {},
      comment: {
        type: "",
        content: "",
      },
      tag: "",
      tags: [],
      commentTypes: Object.keys(TEXT_TYPES).filter(
        (item) => item !== "Summary"
      ),
    };
  },
  created() {
    if (!window.ipc) return;

    window.ipc.on(IPC_BIND_KEYS.MODAL_DATA, (data) => {
      this.config = data;

      // set comment type by config
      if (this.config.commentType && this.config.commentType !== "") {
        this.comment.type = this.config.commentType;
      }

      // set templates by config
      const template = this.config.templates["Note"];
      this.comment.content = template.content;
      this.comment.text = template.text;
    });
  },
  computed: {
    currentTheme() {
      if (this.$vuetify.theme.dark) {
        return this.$vuetify.theme.themes.dark;
      } else {
        return this.$vuetify.theme.themes.light;
      }
    },
  },
  methods: {
    handleNote() {
      const regex = /(<([^>]+)>)/gi;
      this.comment.text = this.comment.content.replace(regex, "");
    },
    handleTags(newTags) {
      this.tags = newTags;
    },
    handleClear() {
      this.comment.type = "Comment";
      this.comment.content = "";
      this.comment.text = "";
    },
    handleSave() {
      if (!window.ipc) return;

      window.ipc.invoke(IPC_HANDLERS.WINDOW, {
        func: IPC_FUNCTIONS.CLOSE_MODAL_WINDOW,
        data: {
          bindKey: IPC_BIND_KEYS.CLOSED_NOTE_DIALOG,
          data: { comment: this.comment, tags: this.tags },
        },
      });
    },
    handleDiscard() {
      if (!window.ipc) return;

      window.ipc.invoke(IPC_HANDLERS.WINDOW, {
        func: IPC_FUNCTIONS.CLOSE_MODAL_WINDOW,
        data: {
          bindKey: IPC_BIND_KEYS.CLOSED_NOTE_DIALOG,
        },
      });
    },
  },
};
</script>
<style scoped>
.theme--dark .v-sheet.v-card {
  box-shadow: none;
}
</style>
