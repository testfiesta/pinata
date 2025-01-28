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
    />
  </div>
</template>

<script>
import DeleteConfirmDialog from "../components/dialogs/DeleteConfirmDialog.vue";

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
  },
};
</script>
