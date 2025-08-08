<template>
  <v-dialog
    v-bind="$attrs"
    v-on="$listeners"
    persistent
    width="50%"
    max-width="600px"
  >
    <v-sheet rounded :style="{ backgroundColor: currentTheme.background }">
      <v-card :style="{ backgroundColor: currentTheme.background }">
        <v-card-title
          v-if="credentials?.testfiesta"
          class="text"
          :style="{ color: currentTheme.secondary }"
        >
          Share {{ credentials?.testfiesta[0]?.user?.name }}'s session
        </v-card-title>
        <v-card-text class="text" :style="{ color: currentTheme.secondary }">
          <v-text-field
            v-model="sessionURL"
            disabled
            label="Copy Link"
            type="text"
            variant="outlined"
          >
            <template v-slot:prepend-inner>
              <v-icon icon="mdi-link" />
            </template>
          </v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-btn
            small
            :color="currentTheme.primary"
            class="text-capitalize btn"
            :style="{ color: currentTheme.white }"
            v-shortkey="confirmHotkey"
            @shortkey="handleCopy()"
            @click="handleCopy()"
          >
            {{ $tc("caption.copy_link", 1) }}
          </v-btn>
          <v-btn
            small
            :color="currentTheme.background"
            class="text-capitalize btn"
            :style="{ color: currentTheme.secondary }"
            v-shortkey="cancelHotkey"
            @shortkey="handleClose()"
            @click="handleClose()"
          >
            {{ $tc("caption.cancel", 1) }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-sheet>
  </v-dialog>
</template>

<script>
import { mapGetters } from "vuex";

export default {
  name: "ShareSessionDialog",
  props: {
    sessionLink: {
      type: String,
      default: () => "",
    },
  },
  data() {
    return {
      sessionURL: "",
    };
  },
  watch: {
    sessionLink: function () {
      this.sessionURL = this.sessionLink;
    },
  },
  computed: {
    ...mapGetters({
      hotkeys: "config/hotkeys",
      config: "config/fullConfig",
      credentials: "auth/credentials",
    }),
    confirmHotkey() {
      return this.$hotkeyHelpers.findBinding("general.save", this.hotkeys);
    },
    cancelHotkey() {
      return this.$hotkeyHelpers.findBinding("general.cancel", this.hotkeys);
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
    handleCopy() {
      if (navigator.clipboard && this.sessionURL) {
        navigator.clipboard
          .writeText(this.sessionURL)
          .then(() => {
            console.log("Link copied to clipboard successfully!");
          })
          .catch((err) => {
            // Handle possible errors during copy attempt
            console.error("Failed to copy the link: ", err);
          });
      } else {
        // Fallback for older browsers or environments where the Clipboard API is not available
        console.error("Clipboard API is not available.");
      }
    },
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
