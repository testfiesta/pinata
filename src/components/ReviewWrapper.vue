<template>
  <div
    class="review-wrapper"
    v-if="
      Object.keys(editSessionItem).length &&
      getType(editSessionItem.fileType) !== 'text'
    "
  >
    <div
      v-if="getType(editSessionItem.fileType) === 'image'"
      style="width: 100%; height: 100%"
    >
      <ImageEditor
        :item="editSessionItem"
        :trigger-save="triggerSaveEvent"
        :defaultColor="config.defaultColor"
        :editorId="uniqueId"
      />
    </div>
    <div v-else-if="getType(editSessionItem.fileType) === 'video'">
      <VideoWrapper
        :item="editSessionItem"
        :processing="processing"
        :trigger-save="triggerSaveEvent"
        :videoPlayerId="uniqueId"
      />
    </div>
    <div v-else-if="getType(editSessionItem.fileType) === 'audio'">
      <AudioWrapper :item="editSessionItem" :trigger-save="triggerSaveEvent" />
    </div>
    <div v-else-if="getType(editSessionItem.fileType) === 'mindmap'">
      <!-- <mindmap-editor
        :nodes-data="editSessionItem.content.nodes"
        :connections-data="editSessionItem.content.connections"
        :edit="true"
        :trigger-save="triggerSaveEvent"
        :auto-save="autoSaveEvent"
        @submit-mindmap="handleMindmap"
      /> -->
      <new-mindmap-editor
        :nodes-data="editSessionItem.content.nodes"
        :connections-data="editSessionItem.content.connections"
        :edit="true"
        :trigger-save="triggerSaveEvent"
        :auto-save="autoSaveEvent"
        @submit-mindmap="handleMindmap"
      />
    </div>
    <div v-else>
      <FileWrapper :item="editSessionItem" :trigger-save="triggerSaveEvent" />
    </div>
  </div>
</template>

<script>
import ImageEditor from "./ImageEditor.vue";
import VideoWrapper from "./VideoWrapper.vue";
import AudioWrapper from "./AudioWrapper.vue";
import FileWrapper from "./FileWrapper.vue";
// import MindmapEditor from "./MindmapEditor.vue";
import NewMindmapEditor from "./NewMindmapEditor.vue";

import { STATUSES, FILE_TYPES } from "../modules/constants";
import { createMindmapImageForWeb } from "@/helpers/WebHelpers";
import { mapGetters } from "vuex";

export default {
  name: "ReviewWrapper",
  components: {
    ImageEditor,
    VideoWrapper,
    AudioWrapper,
    FileWrapper,
    // MindmapEditor,
    NewMindmapEditor,
  },
  props: {
    item: {
      type: Object,
      default: () => {},
    },
    processing: {
      type: Boolean,
      default: () => false,
    },
    triggerSave: {
      type: Boolean,
      default: () => false,
    },
    autoSave: {
      type: Boolean,
      default: () => false,
    },
    currentView: {
      type: String,
      default: () => "",
    },
  },
  watch: {
    item: function (newValue) {
      this.editSessionItem = newValue;
    },
    triggerSave: function (newValue) {
      this.triggerSaveEvent = newValue;
    },
    autoSave: function (newValue) {
      this.autoSaveEvent = newValue;
    },
  },
  data() {
    return {
      editSessionItem: { ...this.item },
      triggerSaveEvent: this.triggerSave,
      autoSaveEvent: this.autoSave,
      currentViewName: this.currentView,
    };
  },
  computed: {
    ...mapGetters({
      config: "config/fullConfig",
    }),
    uniqueId() {
      return `image-editor-${Date.now()}`;
    },
  },
  methods: {
    getType(type) {
      return FILE_TYPES[type];
    },
    async handleMindmap(value) {
      this.editSessionItem.content.nodes = value.nodes;
      this.editSessionItem.content.connections = value.connections;
      if (this.$isElectron) {
        const { status, message, item } =
          await this.$electronService.updateImage(
            this.editSessionItem,
            value.imgURI
          );
        if (status === STATUSES.ERROR) {
          this.$root.$emit("set-snackbar", message);
          console.log(message);
        } else {
          this.editSessionItem.filePath =
            this.editSessionItem.filePath.substring(item.filePath.length) ===
            "?"
              ? item.filePath
              : item.filePath + "?";
          this.editSessionItem.fileSize = item.fileSize;
          this.editSessionItem.fileChecksum = item.fileChecksum;
          this.$root.$emit("update-edit-item", this.editSessionItem);
        }
      } else {
        const { item } = createMindmapImageForWeb({
          item: this.editSessionItem,
          url: value.imgURI,
        });
        this.editSessionItem.filePath = item.filePath;
        this.editSessionItem.fileSize = item.fileSize;
        this.editSessionItem.fileChecksum = item.fileChecksum;
      }

      this.$root.$emit("update-edit-item", this.editSessionItem);
      this.$root.$emit("save-data", this.editSessionItem);
    },
  },
};
</script>
<style scoped>
.review-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}
.review-wrapper > div {
  width: 100%;
}
</style>
