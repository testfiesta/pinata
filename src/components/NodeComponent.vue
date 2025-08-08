<template>
  <div>
    <v-card
      class="node-body"
      :class="{ selected: node.selected }"
      :style="{ borderColor: BorderColorByStatus[node.status] }"
      style="border: 3px solid #bb199a"
      @click="handleClick"
    >
      <v-card-actions style="padding: 0px">
        <v-btn icon color="#6b7280" @click="handleAdd">
          <i class="fas fa-plus-circle" />
        </v-btn>
        <v-btn icon color="#6b7280" @click="handleRemove">
          <i class="fas fa-trash-alt" />
        </v-btn>
        <v-btn icon color="#6b7280" @click="handleUpload">
          <label :for="`uploadFile-${node.id}`">
            <i class="fas fa-file-lines" />
          </label>
          <input
            type="file"
            :id="`uploadFile-${node.id}`"
            hidden
            @change="handleFileUpload"
            @click="handleUpload"
          />
        </v-btn>
        <v-btn icon color="#6b7280" @click="handleConnect">
          <i class="fas fa-link" />
        </v-btn>
      </v-card-actions>
      <v-divider></v-divider>
      <div class="node-content">{{ node.content }}</div>
      <div class="node-attachments" v-if="attachments.length">
        <img
          :src="
            attachment.type === 'image'
              ? attachment.url
              : 'https://img.icons8.com/?size=256&id=77782&format=png'
          "
          v-for="(attachment, idx) in attachments"
          :key="idx"
        />
      </div>
      <div class="node-tags" @click="handleClickTagsInput">
        <vue-tags-input
          v-model="tag"
          :tags="tags"
          @tags-changed="(newTags) => handleTagsChanged(newTags)"
        />
      </div>
    </v-card>

    <node-edit-dialog
      v-model="nodeEditDialog"
      :title="content"
      :type="status"
      @save="handleSubmit"
      @cancel="nodeEditDialog = false"
    />
  </div>
</template>

<script>
import VueTagsInput from "@johmun/vue-tags-input";
import NodeEditDialog from "./dialogs/NodeEditDialog.vue";
export default {
  name: "NodeComponent",
  components: {
    VueTagsInput,
    NodeEditDialog,
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
    onAdd: {
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
      nodeEditDialog: false,
      content: "",
      status: "",
      BorderColorByStatus: {
        Passed: "green",
        Failed: "red",
        "In Progress": "yellow",
      },
    };
  },
  methods: {
    handleClickTagsInput(e) {
      e.stopPropagation();
    },
    handleTagsChanged(newTags) {
      this.tags = newTags;
      this.onTagsChanged(newTags);
    },
    handleAdd(e) {
      e.stopPropagation();
      this.content = "";
      this.status = "";
      this.nodeEditDialog = true;
    },
    handleSubmit(title, type) {
      if (this.content) this.onSave(title, type);
      else this.onAdd(title, type);
      this.nodeEditDialog = false;
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
      if (!e.altKey) this.nodeEditDialog = true;
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
  },
};
</script>

<style>
.node-body {
  cursor: pointer;
  background-color: #fff;
  border-radius: 12px;
  width: 100%;
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

.selected {
  background: #b2b7ee !important;
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

.node-attachments {
  display: flex;
  flex-wrap: wrap;
}

.node-attachments img {
  width: 24px;
  height: 24px;
  border-radius: 2px;
  gap: 2px;
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
