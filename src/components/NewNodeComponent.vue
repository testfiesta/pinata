<template>
  <div>
    <v-card
      class="node-body"
      :class="{ selected: node.selected }"
      :style="{ borderColor: BorderColorByStatus[node.status] }"
      style="border: 3px solid #bb199a"
      @click="handleClick"
    >
      <v-card-actions style="justify-content: center">
        <v-btn icon color="#6b7280" @click="handleItemEdit">
          <i class="fas fa-edit" />
        </v-btn>
        <v-btn icon color="#6b7280" @click="handleRemove">
          <i class="fas fa-trash-alt" />
        </v-btn>
        <v-btn
          icon
          color="#6b7280"
          @click="handleConnect"
          :class="{ link: node.connectClicked }"
        >
          <i class="fas fa-link" />
        </v-btn>
      </v-card-actions>
      <v-divider></v-divider>
      <div class="node-content">{{ node.content }}</div>
      <div style="width: 100%">
        <div v-if="getType(node.fileType) === 'image'">
          <img
            class="screen-img"
            style="max-width: 100%"
            :src="$isElectron ? `file://${node.filePath}` : `${node.filePath}`"
          />
        </div>
        <div v-if="getType(node.fileType) === 'video'">
          <video
            controls
            style="width: 100%"
            :src="$isElectron ? `file://${node.filePath}` : `${node.filePath}`"
          />
        </div>
        <div v-if="getType(node.fileType) === 'audio'">
          <img
            style="max-width: 100%"
            :src="$isElectron ? `file://${node.poster}` : node.poster"
          />
        </div>
        <div v-if="getType(node.fileType) === 'mindmap'">
          <img
            class="screen-img"
            style="max-width: 100%"
            :src="$isElectron ? `file://${node.filePath}` : `${node.filePath}`"
          />
        </div>
        <div
          v-if="
            node.fileType === 'text/plain' && node.comment.type !== 'Summary'
          "
          class="node-file-content"
        >
          <span>{{ node.fileName }}</span>
        </div>
        <div
          v-if="
            node.fileType !== 'text/plain' &&
            getType(node.fileType) === undefined &&
            node.comment.type !== 'Summary'
          "
          class="node-file-content"
        >
          <v-icon x-large>mdi-file</v-icon>
          <span>{{ node.fileName }}</span>
        </div>
      </div>
      <div class="node-tags" @click="handleClickTagsInput">
        <vue-tags-input
          ref="tags"
          v-model="tag"
          class="input-box"
          :tags="tags"
          @tags-changed="(newTags) => handleTagsChanged(newTags)"
          label="Tags"
          :max-tags="10"
          :maxlength="20"
        />
      </div>
    </v-card>
  </div>
</template>

<script>
import VueTagsInput from "@johmun/vue-tags-input";
import { FILE_TYPES } from "@/modules/constants";
import { mapGetters } from "vuex";
export default {
  name: "NewNodeComponent",
  components: {
    VueTagsInput,
  },
  props: {
    node: {
      type: Object,
      default: () => {},
    },
    editable: {
      type: Boolean,
      default: false,
    },
    onEdit: {
      type: Function,
    },
    onSave: {
      type: Function,
    },
    onRemove: {
      type: Function,
    },
    onClick: {
      type: Function,
    },
    onConnect: {
      type: Function,
    },
    onTagsChanged: {
      type: Function,
    },
    onAttach: {
      type: Function,
    },
  },
  data() {
    return {
      tag: "",
      tags: this.node.tags ?? [],
      attachments: this.node.attachments ?? [],
      // border colors map with status as key
      content: "",
      status: "",
      BorderColorByStatus: {
        Passed: "green",
        Failed: "red",
        "In Progress": "yellow",
      },
      allTags: [],
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
          return item.toLowerCase().includes(this.tagText.toLowerCase());
        })
        .map((item) => {
          return { text: item };
        });
    },
  },
  mounted() {
    this.getAllTags();
  },
  methods: {
    handleClickTagsInput(e) {
      e.stopPropagation();
    },
    handleTagsChanged(newTags) {
      this.tags = newTags;
      this.onTagsChanged(newTags);
    },
    handleItemEdit(e) {
      e.stopPropagation();
      this.onEdit(this.node.stepID);
    },
    handleRemove(e) {
      e.stopPropagation();
      this.onRemove();
    },
    handleConnect(e) {
      e.stopPropagation();
      this.onConnect();
    },
    handleClick(e) {
      e.stopPropagation();
      this.content = this.node.content;
      this.status = this.node.status;
      this.onClick(e.altKey);
    },
    handleFileUpload(e) {
      e.stopPropagation();
      const file = e.target.files[0];
      const imageUrl = URL.createObjectURL(file);
      const fileType = file.type.split("/")[0];
      this.onAttach([...this.attachments, { type: fileType, url: imageUrl }]);
      console.log(this.attachments);
    },
    handleUpload(e) {
      e.stopPropagation();
    },
    updateNode() {
      alert("Update");
    },
    getType(type) {
      return FILE_TYPES[type];
    },
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
  },
};
</script>

<style>
.node-body {
  cursor: pointer;
  background-color: #fff;
  border-radius: 12px;
  width: 100%;
  height: 100%;
  padding: 8px;
  display: flex;
  justify-content: space-between;
  flex-flow: column;
  font-size: 10px;
  gap: 8px;
  transition: background-color 0.2s;
  z-index: 99999;
}

.node-body:hover {
  background-color: #c5ebdc;
}

.node-file-content {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.selected {
  background: #b2b7ee !important;
  box-shadow: 0px 1px 2px rgba(0, 0, 0, 0.05);
}

.link {
  background: #3a3a3a !important;
  box-shadow: 0px 1px 2px rgba(0, 0, 0, 0.05);
}

.options {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.node-content {
  text-align: center;
}

.vue-tags-input {
  background-color: #dce5eb !important;
}

.ti-input {
  border: unset !important;
  padding: 0 !important;
}

.ti-tags {
  padding: 0 !important;
}

.ti-tags li {
  padding: 2px 4px !important;
}

i {
  font-size: 10px; /* You can adjust the size as per your requirement */
}
</style>
