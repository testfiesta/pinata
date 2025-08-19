<template>
  <v-dialog
    v-bind="$attrs"
    v-on="$listeners"
    persistent
    width="420"
    content-class="rounded-12px"
  >
    <v-sheet outlined rounded>
      <v-card :style="{ backgroundColor: $theme.background }">
        <v-card-text class="text" :style="{ color: $theme.secondary }">
          <div class="d-flex justify-space-between align-center">
            <p
              class="text-theme-black font-weight-semibold fs-20 mb-0"
              :style="{ color: $theme.secondary }"
            >
              {{ title }}
            </p>
            <button @click="handleCancel">
              <v-icon>mdi-close</v-icon>
            </button>
          </div>
          <div class="flex mt-4">
            <p class="text-start fs-14 text-theme-secondary lh-20">
              {{ text || $t("message.confirm_delete") }}
            </p>
          </div>
        </v-card-text>
        <v-card-actions>
          <div class="d-flex justify-end align-center w-full">
            <v-btn
              depressed
              height="40px"
              class="text-capitalize btn rounded-lg mr-3"
              :style="{
                color: $theme.mainBgReverse,
              }"
              v-shortkey="cancelHotkey"
              @shortkey="handleCancel()"
              @click="handleCancel()"
            >
              {{ $tc("caption.cancel", 1) }}
            </v-btn>
            <v-btn
              ref="confirmBtn"
              depressed
              height="40px"
              :color="$theme.danger"
              class="text-capitalize btn rounded-lg"
              :style="{ color: $theme.white }"
              v-shortkey="confirmHotkey"
              @shortkey="handleConfirm()"
              @click="handleConfirm()"
            >
              {{ btnConfirmText || $tc("caption.confirm", 1) }}
            </v-btn>
          </div>
        </v-card-actions>
      </v-card>
    </v-sheet>
  </v-dialog>
</template>

<script>
import { mapGetters } from "vuex";
export default {
  name: "DeleteConfirmDialog",
  props: {
    title: String,
    text: String,
    btnConfirmText: String,
  },
  data() {
    return {};
  },
  computed: {
    ...mapGetters({
      hotkeys: "config/hotkeys",
    }),
    mainBgReverse() {
      return this.$vuetify.theme.dark ? "#F2F4F7" : "#161B26";
    },
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
<style>
.lh-20 {
  line-height: 20px;
}
</style>
