<template>
  <div>
    <v-tooltip top>
      <template v-slot:activator="{ on: onTooltip }">
        <v-btn
          depressed
          height="40px"
          min-width="40px"
          class="rounded-lg text-capitalize px-0"
          v-on="{ ...onTooltip }"
          @click="handleRestart"
        >
          <img
            :src="require('../assets/icon/refresh.svg')"
            width="20"
            height="20"
          />
        </v-btn>
      </template>
      <span class="text-capitalize">{{
        $tc("caption.restart_session", 1)
      }}</span>
    </v-tooltip>
    <DeleteConfirmDialog
      v-model="deleteConfirmDialog"
      :text="$t('message.restart_session_description')"
      :btn-confirm-text="$tc('caption.restart', 1)"
      :title="$t('message.restart_session')"
      @cancel="deleteConfirmDialog = false"
      @confirm="confirmRestart"
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
    handleRestart() {
      this.deleteConfirmDialog = true;
    },
    async confirmRestart() {
      if (this.deleteConfirmDialog) {
        this.deleteConfirmDialog = false;
      }
      this.changeSessionStatus(SESSION_STATUSES.PENDING);
      this.$store.commit("resetState");
      await this.$storageService.resetData();
      if (this.$isElectron) {
        await this.$electronService.setWindowSize({ width: 800, height: 600 });
      }
      this.updateStoreSession();
      const currentPath = this.$router.history.current.path;
      if (currentPath !== "/main") {
        await this.$router.push({ path: "/main" });
      }
    },
    updateStoreSession(isForce = false) {
      this.$store.commit("updateSession", {
        status: SESSION_STATUSES.PENDING,
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
