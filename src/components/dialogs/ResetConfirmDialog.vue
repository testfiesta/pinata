<template>
  <v-dialog v-bind="$attrs" v-on="$listeners" persistent width="480">
    <v-sheet outlined class="rounded-lg">
      <v-card :style="{ backgroundColor: mainBg }">
        <v-card-text class="text pt-0">
          <div class="d-flex justify-space-between align-start">
            <p
              class="font-weight-bold text-h6 text-sm-h5 text-start"
              :style="{ color: currentTheme.secondary }"
            >
              {{ $t("message.go_back") }}
            </p>
            <button @click="handleCancel">
              <v-icon>mdi-close</v-icon>
            </button>
          </div>
          <div>
            <p class="fs-14">{{ $t("message.session_lost") }}</p>
          </div>
        </v-card-text>
        <v-card-actions>
          <div class="row">
            <v-col cols="6">
              <v-btn
                :color="btnBg"
                depressed
                class="text-capitalize rounded-lg"
                v-shortkey="cancelHotkey"
                @shortkey="handleCancel()"
                @click="handleCancel()"
                width="100%"
                height="40px"
              >
                {{ $tc("cancel", 1) }}
              </v-btn>
            </v-col>
            <v-col cols="6">
              <v-btn
                ref="confirmBtn"
                :color="currentTheme.primary"
                depressed
                class="text-capitalize rounded-lg white--text"
                v-shortkey="confirmHotkey"
                @shortkey="handleConfirm()"
                @click="handleConfirm()"
                width="100%"
                height="40px"
              >
                {{ $tc("confirm", 1) }}
              </v-btn>
            </v-col>
          </div>
        </v-card-actions>
      </v-card>
    </v-sheet>
  </v-dialog>
</template>

<script>
import { mapGetters } from "vuex";
import theme from "../../mixins/theme";
export default {
  name: "ResetConfirmDialog",
  props: {
    title: String,
    text: String,
  },
  mixins: [theme],
  data() {
    return {};
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
  },
  methods: {
    handleCancel() {
      this.$emit("cancel");
    },
    handleConfirm() {
      this.$emit("confirm");
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
