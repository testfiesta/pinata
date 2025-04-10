<template>
  <div>
    <v-tooltip top>
      <template v-slot:activator="{ on: onTooltip }">
        <v-btn
          depressed
          height="40px"
          min-width="40px"
          class="rounded-lg text-capitalize px-0"
          color="rgba(251, 165, 181, 0.25)"
          v-on="{ ...onTooltip }"
          @click="handleDelete"
        >
          <img
            :src="require('../assets/icon/trash-red.svg')"
            width="20"
            height="20"
          />
        </v-btn>
      </template>
      <span class="text-capitalize">{{
        $tc("caption.delete_session", 1)
      }}</span>
    </v-tooltip>
    <DeleteConfirmDialog
      v-model="deleteConfirmDialog"
      :text="$t('message.restart_session_description')"
      :btn-confirm-text="$tc('caption.delete', 1)"
      :title="$t('message.delete_session')"
      @cancel="deleteConfirmDialog = false"
      @confirm="confirmDelete"
    />
  </div>
</template>

<script>
import DeleteConfirmDialog from "../components/dialogs/DeleteConfirmDialog.vue";
import { SESSION_STATUSES } from "@/modules/constants";

export default {
  components: {
    DeleteConfirmDialog,
  },
  data() {
    return {
      deleteConfirmDialog: false,
    };
  },
  methods: {
    handleDelete() {
      this.deleteConfirmDialog = true;
    },
    async confirmDelete() {
      if (this.deleteConfirmDialog) {
        this.deleteConfirmDialog = false;
      }
      this.changeSessionStatus(SESSION_STATUSES.END);
      this.updateStoreSession();
      this.$root.$emit("handle-mindmap");
      this.finishSession();
    },
    async finishSession() {
      const latestState = this.$store.state;
      await this.$storageService.resetData(latestState);
      this.$store.commit("clearState");
      await this.$router.push("/");
    },
    updateStoreSession(isForce = false) {
      this.$store.commit("updateSession", {
        status: SESSION_STATUSES.END,
        timer: 0,
        duration: 0,
        isForce,
      });
    },
    changeSessionStatus(status) {
      if (this.$isElectron) {
        this.$electronService.changeMenuBySessionStatus(status);
      }
    },
  },
};
</script>
