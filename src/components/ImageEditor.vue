<template>
  <div
    class="d-flex flex-column"
    style="width: 100%; height: 100%; row-gap: 10px"
  >
    <div class="image-editor" ref="imageEditor"></div>
  </div>
</template>

<script>
import ImageEditor from "tui-image-editor";
import "tui-image-editor/dist/tui-image-editor.css";
import "tui-color-picker/dist/tui-color-picker.css";

import { STATUSES } from "../modules/constants";

export default {
  name: "EditorPanel",
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
    defaultColor: {
      type: String,
      default: () => "#000000",
    },
  },
  watch: {
    item: function (newValue) {
      this.editSessionItem = newValue;
      this.imageEditorInst.destroy();
      this.imageEditorInst = null;
      this.handleEditor();
    },
    triggerSave: function (oldValue, newValue) {
      if (oldValue !== newValue) {
        this.handleImage(true);
      }
    },
  },
  data() {
    return {
      editSessionItem: this.item,
      imageEditorInst: null,
    };
  },
  mounted() {
    this.handleEditor();
  },
  methods: {
    handleEditor() {
      try {
        const imgPath = `file://${this.editSessionItem.filePath}`;
        this.imageEditorInst = new ImageEditor(
          document.querySelector(".image-editor"),
          {
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
          }
        );

        const drawColorPicker =
          this.imageEditorInst.ui.draw._els.drawColorPicker;
        this.imageEditorInst.ui.draw.color = this.defaultColor;
        drawColorPicker.colorElement.style.backgroundColor = this.defaultColor;
        drawColorPicker.colorpickerElement.querySelector(
          ".tui-colorpicker-palette-preview"
        ).style.backgroundColor = this.defaultColor;
        drawColorPicker.colorpickerElement.querySelector(
          ".tui-colorpicker-palette-preview"
        ).style.color = this.defaultColor;
        this.imageEditorInst.ui.draw.colorPickerInputBox.defaultValue =
          this.defaultColor;

        const shapeColorPicker =
          this.imageEditorInst.ui.shape.colorPickerControls[1];
        this.imageEditorInst.ui.shape.options.stroke = this.defaultColor;
        this.imageEditorInst.ui.shape._els.strokeColorpicker._color =
          this.defaultColor;
        shapeColorPicker.colorElement.style.backgroundColor = this.defaultColor;
        shapeColorPicker.colorpickerElement.querySelector(
          ".tui-colorpicker-palette-hex"
        ).defaultValue = this.defaultColor;
        shapeColorPicker.colorpickerElement.querySelector(
          ".tui-colorpicker-palette-preview"
        ).style.color = this.defaultColor;
        shapeColorPicker.colorpickerElement.querySelector(
          ".tui-colorpicker-palette-preview"
        ).style.backgroundColor = this.defaultColor;

        const textColorPicker =
          this.imageEditorInst.ui.text._els.textColorpicker;
        this.imageEditorInst.ui.text.colorPickerInputBox.defaultValue =
          this.defaultColor;
        this.imageEditorInst.ui.text._els.color = this.defaultColor;
        textColorPicker.color = this.defaultColor;
        textColorPicker.colorElement.style.backgroundColor = this.defaultColor;
        textColorPicker.colorpickerElement.querySelector(
          ".tui-colorpicker-palette-preview"
        ).style.color = this.defaultColor;
        textColorPicker.colorpickerElement.querySelector(
          ".tui-colorpicker-palette-preview"
        ).style.backgroundColor = this.defaultColor;

        const iconColorPicker =
          this.imageEditorInst.ui.icon._els.iconColorpicker;
        this.imageEditorInst.ui.icon.color = this.defaultColor;
        iconColorPicker.color = this.defaultColor;
        iconColorPicker.colorElement.style.backgroundColor = this.defaultColor;
        iconColorPicker.colorpickerElement.querySelector(
          ".tui-colorpicker-palette-preview"
        ).style.backgroundColor = this.defaultColor;
        iconColorPicker.colorpickerElement.querySelector(
          ".tui-colorpicker-palette-preview"
        ).style.color = this.defaultColor;
        this.imageEditorInst.ui.icon.colorPickerInputBox.defaultValue =
          this.defaultColor;
      } catch (e) {
        console.log(e);
      }
    },
    async handleImage(needCallback = false) {
      if (this.$isElectron) {
        // todo add web handler
        const imgURI = this.imageEditorInst.toDataURL();
        const { status, message, item } =
          await this.$electronService.updateImage(this.editSessionItem, imgURI);

        if (status === STATUSES.ERROR) {
          this.$root.$emit("set-snackbar", message);
        } else {
          // Force the timeline component to update the image through a fake QS
          this.editSessionItem.filePath =
            this.editSessionItem.filePath.substring(item.filePath.length) ===
            "?"
              ? item.filePath
              : item.filePath + "?";
          this.$root.$emit("update-edit-item", this.editSessionItem);
          if (needCallback) {
            this.$root.$emit("save-data", this.editSessionItem);
          }
        }
      }
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
