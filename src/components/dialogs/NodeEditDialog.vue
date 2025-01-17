<template>
  <v-dialog
    v-bind="$attrs"
    v-on="$listeners"
    persistent
    width="350"
    style="z-index: 10"
  >
    <v-sheet outlined rounded>
      <v-card :style="{ backgroundColor: currentTheme.background }">
        <v-card-text class="text" :style="{ color: currentTheme.secondary }">
          <v-form ref="form" v-model="valid">
            <div
              class="d-flex fs-14 text-theme-label mb-1 font-weight-medium"
              :style="{ color: currentTheme.secondary }"
            >
              {{ $tc("caption.node_title", 1) }}
            </div>
            <v-text-field
              v-model="text"
              :rules="textRules"
              autofocus
              class="rounded-lg"
              :background-color="inputBg"
              dense
              height="40px"
              :placeholder="$t('caption.enterNodeTitle')"
              flat
              solo
              required
            ></v-text-field>
          </v-form>
        </v-card-text>
        <div
          class="d-flex fs-14 text-theme-label mb-1 font-weight-medium"
          :style="{ color: currentTheme.secondary }"
        >
          {{ $tc("caption.status", 1) }}
        </div>
        <v-select
          label="Status"
          background-color="#F9F9FB"
          class="rounded-lg custom-select"
          item-text="text"
          item-value="level"
          width="100%"
          height="40px"
          solo
          flat
          :items="commentTypes"
          append-icon="mdi-chevron-down"
          :menu-props="{ offsetY: true }"
          v-model="status"
        ></v-select>
        <v-card-actions>
          <v-btn
            :color="currentTheme.primary"
            depressed
            class="text-capitalize rounded-lg white--text"
            v-shortkey="confirmHotkey"
            @shortkey="handleSave()"
            @click="handleSave()"
          >
            {{ $tc("caption.save", 1) }}
          </v-btn>
          <v-btn
            :color="btnBg"
            depressed
            class="text-capitalize rounded-lg"
            v-shortkey="cancelHotkey"
            @shortkey="handleCancel()"
            @click="handleCancel()"
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
import { TEXT_TYPES } from "@/modules/constants";
import theme from "../../mixins/theme";

export default {
  name: "NodeEditDialog",
  props: {
    title: {
      type: String,
      default: () => "",
    },
    type: {
      type: String,
      default: () => "",
    },
  },
  watch: {
    title: function () {
      this.text = this.title;
    },
    type: function () {
      this.status = this.type;
    },
  },
  mixins: [theme],
  data() {
    return {
      commentTypes: Object.keys(TEXT_TYPES).filter(
        (item) => item !== "Summary"
      ),
      text: "",
      status: "Comment",
      valid: false,
      textRules: [(v) => !!v || "Node title is required"],
    };
  },
  computed: {
    ...mapGetters({
      hotkeys: "config/hotkeys",
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
    handleCancel() {
      this.$emit("cancel");
    },
    handleSave() {
      if (this.$refs.form.validate()) {
        this.$emit("save", this.text, this.status);
        this.$refs.form.reset();
      }
    },
  },
};
</script>

<style scoped>
.v-card {
  padding: 24px;
}
.v-card__title {
  padding: 0;
  padding-top: 0.5rem;
  font-style: normal;
  font-weight: 600;
  font-size: 14px;
  line-height: 20px;
  color: #111827;
}
.v-card__text {
  padding: 0;
  padding-top: 0.5rem;
  font-style: normal;
  font-weight: 500;
  font-size: 13px;
  line-height: 16px;
  color: #6b7280;
}
.v-card__actions {
  padding: 0;
  padding-top: 1rem;
}
</style>
