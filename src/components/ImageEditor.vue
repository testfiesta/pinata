<template>
  <div
    class="d-flex flex-column"
    style="width: 100%; height: 100%; row-gap: 10px"
  >
    <div :ref="editorId" class="image-editor"></div>
  </div>
</template>

<script>
import ImageEditor from "tui-image-editor";
import "tui-image-editor/dist/tui-image-editor.css";
import "tui-color-picker/dist/tui-color-picker.css";

import { STATUSES } from "../modules/constants";
import { updateImageForWeb } from "@/helpers/WebHelpers";

export default {
  name: "EditorPanel",
  props: {
    item: {
      type: Object,
      default: () => ({}),
    },
    triggerSave: {
      type: Boolean,
      default: false,
    },
    defaultColor: {
      type: String,
      default: "#000000",
    },
    editorId: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      editSessionItem: this.item,
      imageEditorInst: null,
    };
  },
  watch: {
    item(newValue, oldValue) {
      this.editSessionItem = newValue;
      if (newValue.attachmentID !== oldValue.attachmentID) {
        this.reinitializeEditor();
      }
    },
    triggerSave(newValue) {
      if (newValue) {
        this.handleImage(true);
      }
    },
  },
  mounted() {
    this.initializeEditor();
  },
  beforeDestroy() {
    this.destroyEditor();
  },
  methods: {
    initializeEditor() {
      this.destroyEditor(); // Ensure any previous instance is removed

      if (!this.editSessionItem || !this.editSessionItem.filePath) return;

      try {
        let imgPath = this.editSessionItem.filePath;
        if (this.$isElectron) {
          imgPath = `file://${this.editSessionItem.filePath}`;
        }

        this.imageEditorInst = new ImageEditor(this.$refs[this.editorId], {
          includeUI: {
            loadImage: {
              path: imgPath,
              name: "image",
            },
            menu: ["draw", "shape", "resize", "text", "icon", "crop"],
            initMenu: "",
            uiSize: {
              width: "100%",
              height: "600px",
            },
            menuBarPosition: "bottom",
          },
          cssMaxHeight: 300,
          selectionStyle: {
            cornerSize: 20,
            rotatingPointOffset: 70,
          },
        });

        this.applyDefaultColors();
      } catch (e) {
        console.error(e);
      }
    },
    reinitializeEditor() {
      this.destroyEditor();
      this.initializeEditor();
    },
    destroyEditor() {
      if (this.imageEditorInst) {
        this.imageEditorInst.destroy();
        this.imageEditorInst = null;
      }
    },
    applyDefaultColors() {
      if (!this.imageEditorInst) return;

      const { draw, shape, text, icon } = this.imageEditorInst.ui;

      // Apply color settings to Draw menu
      draw.color = this.defaultColor;
      this.setPickerColor(draw._els.drawColorPicker, this.defaultColor);

      // Apply color settings to Shape menu
      shape.options.stroke = this.defaultColor;
      this.setPickerColor(shape.colorPickerControls[1], this.defaultColor);

      // Apply color settings to Text menu
      text._els.color = this.defaultColor;
      this.setPickerColor(text._els.textColorpicker, this.defaultColor);

      // Apply color settings to Icon menu
      icon.color = this.defaultColor;
      this.setPickerColor(icon._els.iconColorpicker, this.defaultColor);
    },
    setPickerColor(picker, color) {
      if (!picker) return;
      picker.color = color;
      picker.colorElement.style.backgroundColor = color;
      const preview = picker.colorpickerElement.querySelector(
        ".tui-colorpicker-palette-preview"
      );
      if (preview) {
        preview.style.backgroundColor = color;
        preview.style.color = color;
      }
    },
    async handleImage(needCallback = false) {
      if (!this.imageEditorInst) return;

      const imgURI = this.imageEditorInst.toDataURL();

      if (this.$isElectron) {
        const { status, message, item } =
          await this.$electronService.updateImage(this.editSessionItem, imgURI);
        if (status === STATUSES.ERROR) {
          this.$root.$emit("set-snackbar", message);
        } else {
          this.updateEditSessionItem(item);
          if (needCallback) {
            this.$root.$emit("save-data", this.editSessionItem);
          }
        }
      } else {
        const { item } = updateImageForWeb({
          item: this.editSessionItem,
          url: imgURI,
        });
        this.updateEditSessionItem(item);
        if (needCallback) {
          this.$root.$emit("save-data", this.editSessionItem);
        }
      }
    },
    updateEditSessionItem(item) {
      this.editSessionItem.filePath =
        this.editSessionItem.filePath.substring(item.filePath.length) === "?"
          ? item.filePath
          : item.filePath + "?";
      this.editSessionItem.fileSize = item.fileSize;
      this.editSessionItem.fileChecksum = item.fileChecksum;
      this.$root.$emit("update-edit-item", this.editSessionItem);
    },
  },
};
</script>

<style scoped>
.tui-image-editor {
  width: 300px;
  height: 90px;
  overflow: hidden;
}

.tui-image-editor-container {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  min-height: 300px;
  height: 100%;
  position: relative;
  background-color: #282828;
  overflow: hidden;
  letter-spacing: 0.3px;
}
</style>
