<template>
  <v-dialog
    v-bind="$attrs"
    v-on="$listeners"
    persistent
    width="100%"
    max-width="850px"
    eager
    transparent
  >
    <v-sheet
      outlined
      rounded
      :style="{
        backgroundColor: $theme.mainBg,
      }"
    >
      <SettingView />
      <div class="footer mr-4 mb-4 d-flex justify-end">
        <v-btn
          class="text-capitalize"
          fill
          small
          color="white"
          :style="{ color: $theme.black }"
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
  computed: {},
  methods: {
    handleClose() {
      this.$emit("close");
    },
  },
};
</script>

<style scoped></style>
