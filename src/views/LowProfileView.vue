<template>
  <v-container>
    <div class="header">
      <v-btn class="maximize-btn" color="primary" plain @click="maximize">
        <v-icon>mdi-window-maximize</v-icon>
      </v-btn>
    </div>
    <div class="body">
      <div class="overlay" v-if="overlay"></div>
      <ControlPanel
        :selectedItems="selected"
        :items="items"
        :config-item="config"
        :credential-items="credentials"
        :srcId="sourceId"
        view-mode="mini"
        @add-item="addItem"
      />
    </div>
  </v-container>
</template>

<script>
import { mapGetters } from "vuex";
import ControlPanel from "../components/ControlPanel.vue";

import {
  IPC_HANDLERS,
  IPC_FUNCTIONS,
  IPC_BIND_KEYS,
} from "../modules/constants";

export default {
  name: "LowProfileView",
  components: {
    ControlPanel,
  },
  computed: {
    ...mapGetters({
      credentials: "auth/credentials",
      items: "sessionItems",
      config: "config/fullConfig",
    }),
  },
  data() {
    return {
      status: "",
      timer: 0,
      duration: 0,
      sourceId: "",
      overlay: false,
      selected: [],
    };
  },
  created() {
    this.$root.$on("source-id-changed", (sourceId) => {
      this.sourceId = sourceId;
    });

    if (!window.ipc) return;

    try {
      const t = JSON.parse(localStorage.getItem("state-data"));
      this.status = t.status;
      this.timer = t.timer;
      this.duration = t.duration;
      this.sourceId = t.sourceId;
      this.updateStoreSession();
    } catch (e) {
      console.log(e);
    }
  },
  mounted() {
    if (!window.ipc) return;

    window.ipc.on("OPEN_CHILD_WINDOW", () => {
      this.overlay = true;
      this.$forceUpdate();
    });
    window.ipc.on("CLOSE_CHILD_WINDOW", () => {
      this.overlay = false;
      this.$forceUpdate();
    });
  },
  methods: {
    maximize() {
      const data = {
        status: this.$store.state.session.status,
        timer: this.$store.state.session.timer,
        duration: this.$store.state.case.duration,
        sourceId: this.sourceId,
      };
      window.ipc.invoke(IPC_HANDLERS.WINDOW, {
        func: IPC_FUNCTIONS.CLOSE_LOWPROFILE_WINDOW,
        data: {
          data: data,
          bindKey: IPC_BIND_KEYS.CLOSED_MINIMIZE_WINDOW,
        },
      });
    },
    updateStoreSession() {
      this.$store.commit("updateSession", {
        status: this.status,
        timer: this.timer,
        duration: this.duration,
      });
    },
    addItem(data) {
      if (!window.ipc) return;

      // window.ipc.invoke(IPC_HANDLERS.PERSISTENCE, {
      //   func: IPC_FUNCTIONS.ADD_ITEM,
      //   data: data,
      // });
      this.$store.commit("addSessionItem", data);
    },
  },
};
</script>
<style scoped>
.v-application {
  background: transparent !important;
}
.container {
  padding: 0;
}
.header {
  display: flex;
  justify-content: flex-end;
  background: transparent;
  padding: 5px;
  width: 100%;
  height: 34px;
}
.header .maximize-btn {
  width: auto;
  height: auto;
  padding: 0;
  min-width: auto;
}
.header .maximize-btn .v-icon {
  color: #9859fb;
  font-size: 30px;
}
.body {
  position: relative;
}
.overlay {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  z-index: 1;
}
</style>
