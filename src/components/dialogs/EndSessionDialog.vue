<template>
  <v-dialog v-bind="$attrs" v-on="$listeners" persistent width="350">
    <v-sheet outlined rounded>
      <v-card :style="{ backgroundColor: $theme.background }">
        <CheckTaskWrapper
          :tasks="$store.state.session.postSessionTasks"
          @taskToggle="handleTaskCheck"
        />
        <div class="footer">
          <v-btn
            :color="$theme.primary"
            :style="{ color: $theme.white }"
            class="btn-end"
            v-shortkey="confirmHotkey"
            @shortkey="endSession()"
            @click="endSession()"
          >
            {{ $tc("caption.end_session", 1) }}
          </v-btn>
          <v-btn
            :color="$theme.background"
            class="btn-end"
            :style="{ color: $theme.secondary }"
            v-shortkey="cancelHotkey"
            @shortkey="handleCancel()"
            @click="handleCancel()"
          >
            {{ $tc("caption.cancel", 1) }}
          </v-btn>
        </div>
      </v-card>
    </v-sheet>
  </v-dialog>
</template>
<script>
import CheckTaskWrapper from "../CheckTaskWrapper.vue";
import { mapGetters } from "vuex";

export default {
  name: "EndSessionDialog",
  components: {
    CheckTaskWrapper,
  },
  props: {
    postSessionData: {
      type: Object,
      default: () => {},
    },
  },
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
    tasks() {
      return this.postSessionData ? this.postSessionData.tasks : [];
    },
  },
  methods: {
    handleTaskCheck(taskId, checked) {
      this.$store.commit("togglePostSessionTask", {
        taskId,
        checked: !!checked,
      });
    },
    endSession: async function () {
      await this.$root.$emit("end-session");
      if (this.$store.getters.requiredPostSessionTasksChecked) {
        this.$emit("proceed", true);
      }
    },
    handleCancel: function () {
      this.$emit("proceed", false);
    },
  },
};
</script>
<style scoped>
.footer {
  padding: 15px;
  display: flex;
  column-gap: 10px;
}
.v-btn {
  flex: 1;
}
</style>
