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
  </div>
</template>

<script>
export default {
  methods: {
    handleRestart() {
      this.$root.$emit("restart-session");
    },
  },
};
</script>
