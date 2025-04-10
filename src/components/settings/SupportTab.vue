<template>
  <v-container class="content-wrapper">
    <v-row>
      <v-col cols="12" class="border-bottom pa-4">
        <p class="body-1">{{ $tc("caption.todo", 1) }}</p>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { mapGetters } from "vuex";

export default {
  name: "SupportTab",
  components: {},
  computed: {
    ...mapGetters({
      config: "config/fullConfig",
    }),
  },
  methods: {
    handleConfig() {
      this.$emit("submit-config", this.config);
    },
  },
};
</script>
<style scoped>
.content-wrapper {
  width: 100%;
  overflow-y: auto;
  height: 90vh;
}
.body-1 {
  font-style: normal !important;
  font-weight: 500 !important;
  font-size: 12px !important;
  line-height: 16px !important;
  letter-spacing: 0.05em !important;
  text-transform: uppercase !important;
  color: #6b7280 !important;
}
.subtitle-1 {
  font-style: normal !important;
  font-weight: 500 !important;
  font-size: 14px !important;
  line-height: 20px !important;
  color: #111827 !important;
}
.caption {
  font-style: normal !important;
  font-weight: 500 !important;
  font-size: 13px !important;
  line-height: 16px !important;
  color: #6b7280;
}
.jira-link {
  font-style: normal;
  font-weight: 500;
  font-size: 14px;
  line-height: 20px;
  color: #0a26c3;
  text-decoration: none;
}
.border-bottom {
  border-bottom: 1px solid #e5e7eb;
}
</style>
