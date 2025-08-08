<template>
  <div class="flex flex-column justify-center align-center">
    <div class="mindmap-control-btn flex flex-row justify-center gap-md">
      <v-tooltip bottom>
        <template v-slot:activator="{ on }">
          <ColorPicker v-on="on" :currentColor="currentColor" />
        </template>
        <span>{{ $tc("caption.color", 1) }}</span>
      </v-tooltip>
      <v-divider vertical />
      <v-select
        v-model="shape"
        :items="shapeTypes"
        hide-details="true"
        style="width: 75px; height: 30px"
        color="secondary"
        solo
        dense
        @change="handleShape"
      >
        <template v-slot:selection="{ attr, on, item }">
          <div v-bind="attr" v-on="on" style="line-height: 0">
            <img
              :src="require('../../assets/icon/' + item + '.svg')"
              width="30"
              alt="avatar"
            />
          </div>
        </template>
        <template v-slot:item="{ item }">
          <div style="line-height: 0">
            <img
              :src="require('../../assets/icon/' + item + '.svg')"
              width="30"
              alt="avatar"
            />
          </div>
        </template>
      </v-select>
      <v-divider vertical />
      <v-select
        :items="commentTypes"
        style="width: 135px; height: 30px"
        color="secondary"
        v-model="commentType"
        :placeholder="$tc('caption.comment_type')"
        solo
        dense
        hide-details="true"
        @change="handleCommentType"
      ></v-select>

      <v-divider vertical />
      <v-btn class="btn" small @click="openTags = !openTags"> + Add Tag</v-btn>
      <v-divider vertical />
      <v-tooltip bottom>
        <template v-slot:activator="{ on }">
          <!-- <div class="mindmap-ctrl-btn" v-on="on">
            <v-btn icon color="#6b7280" @click="handleFileUpload"> -->
          <v-file-input
            v-on="on"
            type="file"
            hidden
            v-model="attachment"
            truncate-length="15"
            style="padding-top: 0px; margin-top: 0px"
            hide-input
            prepend-icon="mdi-upload"
            @change="handleFileUpload"
          />
          <!-- </v-btn>
          </div> -->
        </template>
        <span>{{ $tc("caption.upload_attachment", 1) }}</span>
      </v-tooltip>
      <v-divider vertical />
      <div>
        <v-btn icon small @click="handleAddNode" style="padding: 0; margin: 0">
          <v-icon>mdi-plus</v-icon>
        </v-btn>
      </div>
    </div>

    <div
      class="mindmap-control-btn mt-2"
      style="width: 350px; padding: 3px"
      v-if="openTags"
    >
      <v-combobox
        v-model="tags"
        :items="filteredTags"
        :label="$t('message.insert_tag')"
        multiple
        chips
        solo
        @change="handleTags"
        prepend-icon="mdi-database-search"
      >
        <template v-slot:selection="data">
          <v-chip
            v-bind="data.attrs"
            class="ma-2"
            close
            color="black"
            label
            outlined
            @click:close="data.parent.selectItem(data.item)"
          >
            {{ data.item }}
          </v-chip>
        </template>
      </v-combobox>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import ColorPicker from "./ColorPicker.vue";
import { TEXT_TYPES } from "@/modules/constants";

export default {
  name: "NodeDetailPad",
  data() {
    return {
      commentTypes: Object.keys(TEXT_TYPES).filter(
        (item) => item !== "Summary"
      ),
      shapeTypes: [
        "rectangle",
        "ellipse",
        "triangle",
        "downward-triangle",
        "diamond",
      ],
      commentType: "Comment",
      shape: "rectangle",
      tags: [],
      tag: "",
      openTags: false,
      id: "",
      attachment: null,
      attachments: [],
      allTags: [],
    };
  },
  components: {
    ColorPicker,
  },
  mounted() {
    this.commentType = this.currentCommentType;
    this.shape = this.currentShape;
    this.tags = this.currentTags.map((tag) => tag.text);
    this.id = this.currentId;
    this.attachments = this.currentAttachments;
    this.getAllTags();
  },
  computed: {
    ...mapGetters({
      hotkeys: "config/hotkeys",
      config: "config/fullConfig",
      sessionItems: "sessionItems",
      sessionNodes: "sessionNodes",
      defaultTags: "config/defaultTags",
    }),
    filteredTags() {
      let allTags = this.allTags
        .filter((item) => {
          return item.toLowerCase().includes(this.tag.toLowerCase());
        })
        .map((item) => {
          return item;
        });
      return allTags;
    },
    tagsHotkey() {
      return this.$hotkeyHelpers.findBinding("evidence.tags", this.hotkeys);
    },
  },
  watch: {
    currentCommentType: function (newValue) {
      this.commentType = newValue;
    },
    currentShape: function (newValue) {
      this.shape = newValue;
    },
    currentTags: function (newValue) {
      this.tags = newValue.map((tag) => tag.text);
    },
    currentAttachments: function (newValue) {
      this.attachments = newValue;
    },
    openTags: function () {
      this.getAllTags();
    },
  },
  props: {
    currentColor: {
      type: String,
      default: () => "",
    },
    currentShape: {
      type: String,
      default: () => "",
    },
    currentCommentType: {
      type: String,
      default: () => "Comment",
    },
    currentId: {
      type: String,
      default: () => "",
    },
    currentTags: {
      type: Array,
      default: () => [],
    },
    currentAttachments: {
      type: Array,
      default: () => [],
    },
  },
  methods: {
    handleShape() {
      this.$root.$emit("update:shape", this.shape);
    },
    handleCommentType() {
      this.$root.$emit("update:commentType", this.commentType);
    },
    handleTags(newTags) {
      let updatedTags = newTags.map((tag) => {
        return { text: tag, tiClasses: ["ti-valid"] };
      });
      this.$root.$emit("update:tags", updatedTags);
    },
    handleFileUpload() {
      this.attachments.push(this.attachment);
      this.$root.$emit("update:attachments", this.currentId, this.attachments);
    },
    handleAddNode() {
      this.$root.$emit("add:node", this.currentId);
    },
    getAllTags() {
      const defaultTagTexts = this.defaultTags
        .filter((tag) => tag.text !== "")
        .map((tag) => tag.text);
      let sessionItemsTagTexts = [],
        sessionNodesTagTexts = [];
      if (this.sessionItems.length > 0) {
        this.sessionItems.forEach((item) => {
          if (item.tags && item.tags.length > 0) {
            const tagTexts = item.tags.map((tag) => tag.text);
            sessionItemsTagTexts = sessionItemsTagTexts.concat(tagTexts);
          }
        });
      }
      if (this.sessionNodes.length > 0) {
        this.sessionNodes.forEach((node) => {
          if (node.tags && node.tags.length > 0) {
            const tagTexts = node.tags.map((tag) => tag.text);
            sessionNodesTagTexts = sessionNodesTagTexts.concat(tagTexts);
          }
        });
      }
      this.allTags = [
        ...new Set([
          ...defaultTagTexts,
          ...sessionItemsTagTexts,
          ...sessionNodesTagTexts,
        ]),
      ];
    },
  },
};
</script>

<style>
::deep(.mindmap-control-btn) {
  line-height: 1 !important;
}
</style>
