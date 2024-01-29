<template>
  <v-dialog
    v-bind="$attrs"
    v-on="$listeners"
    persistent
    width="50%"
    max-width="600px"
  >
    <v-sheet rounded :style="{ backgroundColor: currentTheme.background }">
      <div class="wrapper">
        <div class="content">
          <span :style="{ color: currentTheme.secondary }">
            <v-input disabled>
              {{ sessionURL }}
            </v-input>
          </span>
        </div>
        <div class="footer">
          <v-btn
            class="text-capitalize"
            small
            :color="currentTheme.background"
            v-shortkey="confirmHotkey"
            @shortkey="handleClose()"
            @click="handleClose()"
          >
            {{ $tc("caption.cancel", 1) }}
          </v-btn>
        </div>
      </div>
    </v-sheet>
  </v-dialog>
</template>

<script>
export default {
  name: "ShareSessionDialog",
  props: {
    configItem: {
      type: Object,
      default: () => {},
    },
    sessionLink: {
      type: String,
      default: () => "",
    },
  },
  data() {
    return {
      config: this.configItem,
      sessionURL: "",
    };
  },
  watch: {
    configItem: function (newValue) {
      this.config = newValue;
    },
    sessionLink: function () {
      this.sessionURL = this.sessionLink;
    },
  },
  computed: {
    confirmHotkey() {
      return this.$hotkeyHelpers.findBinding(
        "general.save",
        this.config.hotkeys
      );
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
    handleClose() {
      this.activeSource = "";
      this.$root.$emit("close-sharesessiondialog");
    },
  },
};
</script>

<style scoped>
.wrapper {
  display: flex;
  flex-direction: column;
  height: 400px;
  width: 100%;
  overflow-y: auto;
}

.header {
  width: 100%;
  padding: 15px;
  border-bottom: 1px solid #e5e7eb;
}

.theme--dark .header {
  border-color: #374151;
}

.header span {
  font-style: normal;
  font-weight: 600;
  font-size: 14px;
  line-height: 20px;
  color: #111827;
}

.content {
  flex-grow: 1;
  overflow: auto;
  padding: 15px;
}

.footer {
  width: 100%;
  padding: 15px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  column-gap: 12px;
}

.theme--dark .footer {
  border-color: #374151;
}

.session-list .session-item {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
}
.session-list .session-item .session-img {
  border-radius: 4px;
  display: flex;
  width: 100%;
  background: #000;
  justify-content: center;
}

.session-list .session-item .session-img img {
  height: 100px;
  max-width: 100%;
  object-fit: contain;
}

.session-list .session-item .session-name {
  padding: 5px;
  padding-bottom: 0;
  text-align: center;
  display: flex;
  justify-content: center;
  width: 100%;
}
.session-list .session-item .session-name p {
  font-style: normal;
  font-weight: 500;
  font-size: 13px;
  line-height: 16px;
  text-align: center;
  color: #111827;
  margin-bottom: 0px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.v-input--selection-controls__input {
  width: 16px;
  height: 16px;
}
</style>
