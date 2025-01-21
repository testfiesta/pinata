<template>
  <div>
    <v-menu
      bottom
      :offset-y="true"
      close-on-content-click
      v-model="evidenceExportDestinationMenu"
    >
      <template v-slot:activator="{ on: evidenceExportDestinationMenu }">
        <v-tooltip top>
          <template v-slot:activator="{ on: onTooltip }">
            <v-btn
              depressed
              height="40px"
              min-width="40px"
              class="rounded-lg text-capitalize"
              v-on="{ ...evidenceExportDestinationMenu, ...onTooltip }"
            >
              <img
                :src="require('../assets/icon/download.svg')"
                width="20"
                height="20"
              />
            </v-btn>
          </template>
          <span>{{ $tc("caption.export_session_report", 1) }}</span>
        </v-tooltip>
      </template>
      <v-card tile>
        <v-list dense>
          <v-list-item @click="exportSession('archive')">
            <v-list-item-icon class="mr-4">
              <img
                :src="require('../assets/icon/download.svg')"
                width="20"
                height="20"
              />
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title>
                {{ $tc("caption.save_as_zip", 1) }}
              </v-list-item-title>
            </v-list-item-content>
          </v-list-item>
          <v-list-item @click="exportSession('pdf')">
            <v-list-item-icon class="mr-4">
              <img
                :src="require('../assets/icon/download.svg')"
                width="20"
                height="20"
              />
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title>
                {{ $tc("caption.save_as_pdf", 1) }}
              </v-list-item-title>
            </v-list-item-content>
          </v-list-item>
          <div v-if="this.credentials.xray && this.credentials.xray.length > 0">
            <xray-export-session
              :title="$tc(`caption.export_to_xray`, 1)"
              :credential-items="credentials.xray"
              :selected="[]"
              :items="itemLists"
              @close-menu="() => (evidenceExportDestinationMenu = false)"
            />
          </div>
          <div
            v-if="
              this.credentials.zephyrSquad &&
              this.credentials.zephyrSquad.length > 0 &&
              // Adding the false to make it invisible
              false
            "
          >
            <zephyr-squad-export-session
              :title="$tc(`caption.export_to_zephyr_squad`, 1)"
              :credential-items="credentials.zephyrSquad"
              :selected="[]"
              :items="itemLists"
              @close-menu="() => (evidenceExportDestinationMenu = false)"
            />
          </div>
          <div
            v-if="
              this.credentials.zephyrScale &&
              this.credentials.zephyrScale.length > 0 &&
              // // Adding the false to make it invisible
              false
            "
          >
            <zephyr-scale-export-session
              :title="$tc(`caption.export_to_zephyr_scale`, 1)"
              :credential-items="credentials.zephyrScale"
              :selected="[]"
              :items="itemLists"
              @close-menu="() => (evidenceExportDestinationMenu = false)"
            />
          </div>
          <!-- TODO - What does it look like to export an entire session to a 3rd party service?
                <div
                  v-if="this.credentials.jira && this.credentials.jira.length > 0"
                >
                  <jira-export-session
                    :title="$tc(`caption.export_to_jira`, 1)"
                    :credential-items="credentials.jira"
                    :selected="[]"
                    :items="itemLists"
                    @close-menu="() => (evidenceExportDestinationMenu = false)"
                  />
                </div>
                <div
                  v-if="
                    this.credentials.testrail &&
                    this.credentials.testrail.length > 0
                  "
                >
                  <test-rail-export-session
                    :title="$tc(`caption.export_to_testrail`, 1)"
                    :credential-items="credentials.testrail"
                    :selected="[]"
                    :items="itemLists"
                    @close-menu="() => (evidenceExportDestinationMenu = false)"
                  />
                </div>
                -->
        </v-list>
      </v-card>
    </v-menu>
  </div>
</template>

<script>
//import JiraExportSession from "./jira/JiraExportSession";
//import TestRailExportSession from "./testrail/TestRailExportSession";
import XrayExportSession from "./xray/XrayExportSession";
import ZephyrSquadExportSession from "./zephyr/ZephyrSquadExportSession";
import ZephyrScaleExportSession from "./zephyr/ZephyrScaleExportSession";
import { mapGetters } from "vuex";

export default {
  name: "ExportButton",
  components: {
    //JiraExportSession,
    //TestRailExportSession,
    XrayExportSession,
    ZephyrSquadExportSession,
    ZephyrScaleExportSession,
  },
  props: {},

  computed: {
    ...mapGetters({
      itemLists: "sessionItems",
      config: "config/fullConfig",
      credentials: "auth/credentials",
    }),
  },
  data() {
    return {
      exportSessionDialog: false,
      evidenceExportDestinationMenu: false,
    };
  },
  mounted() {
    this.$root.$on("close-exportsessiondialog", () => {
      this.exportSessionDialog = false;
    });
  },
  methods: {
    async exportSession(type) {
      const { logo } = await this.$storageService.getConfig();
      const data = {
        title: this.$store.state.case.title,
        charter: this.$store.state.case.charter,
        preconditions: this.$store.state.case.preconditions,
        duration: this.$store.state.case.duration,
        timer: this.$store.state.session.timer,
        started: this.$store.state.session.started,
        ended: this.$store.state.session.ended,
        reportLogo: logo && logo.enabled,
        logoPath: logo && logo.path,
        type: type,
      };
      if (this.$isElectron) {
        await this.$electronService.exportSession(data);
      }
    },
  },
};
</script>
