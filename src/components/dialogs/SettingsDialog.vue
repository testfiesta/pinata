<template>
  <v-dialog
    v-bind="$attrs"
    v-on="$listeners"
    persistent
    width="100%"
    max-width="700px"
    eager
  >
    <v-sheet outlined rounded>
      <SettingView />
      <div class="footer mr-4 mb-4 d-flex justify-end">
        <v-btn
          class="text-capitalize"
          fill
          small
          color="white"
          :style="{ color: currentTheme.black }"
          @click="handleClose()"
        >
          {{ $tc("caption.close", 1) }}
        </v-btn>
      </div>
    </v-sheet>
  </v-dialog>
</template>

<script>
import SettingView from "@/views/SettingView.vue";
export default {
  name: "SettingsDialog",
  components: {
    SettingView,
  },
  props: {},
  watch: {},
  data() {
    return {};
  },
  computed: {
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
      this.$emit("close");
    },
  },
};
</script>

<style scoped></style>
