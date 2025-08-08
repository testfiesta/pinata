<template>
  <div class="wrapper">
    <div class="file-icon">
      <v-icon x-large>mdi-file</v-icon>
    </div>
    <p>{{ editSessionItem.fileName }}</p>
  </div>
</template>

<script>
export default {
  name: "FileWrapper",
  components: {},
  props: {
    item: {
      type: Object,
      default: () => {},
    },
    triggerSave: {
      type: Boolean,
      default: () => false,
    },
  },
  watch: {
    item: function (newValue) {
      this.editSessionItem = newValue;
    },
    triggerSave: function (newValue) {
      if (newValue) {
        this.$root.$emit("update-edit-item", this.editSessionItem);
        this.$root.$emit("save-data");
      }
    },
  },
  data() {
    return {
      editSessionItem: this.item,
    };
  },

  methods: {},
};
</script>
<style scoped>
.wrapper {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  row-gap: 15px;
}
.wrapper .file-icon {
  padding: 30px;
  border-radius: 50%;
  border: 1px solid #d1d5db;
  box-shadow: 0px 1px 2px rgba(0, 0, 0, 0.05);
}
.wrapper .file-icon .v-icon {
  color: #6b7280;
  font-size: 50px;
}
.wrapper p {
  margin-bottom: 0;
  font-style: normal;
  font-weight: 700;
  font-size: 16px;
  line-height: 24px;
  color: #374151;
}
</style>
