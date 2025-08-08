<template>
  <div class="logo-wrapper">
    <v-img
      :src="require('../assets/logo.svg')"
      contain
      :height="height"
      :width="width"
    />
  </div>
</template>

<script>
import { VImg } from "vuetify/lib/components";

export default {
  name: "LogoWrapper",
  components: { VImg },
  computed: {},
  data() {
    return {};
  },
  props: {
    height: {
      type: Number,
      default: () => 20,
    },
    width: {
      type: Number,
      default: () => 60,
    },
  },
};
</script>
