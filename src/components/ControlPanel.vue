<template>
  <v-container>
    <div class="mini-ctrl-wrapper" v-if="viewMode === 'mini'">
      <!--<MinimizeControlWrapper
        :p-elapsed-time="elapsedTime"
        :p-status="status"
        @pause-session="pauseSession()"
        @resume-session="resumeSession()"
        @end-session="endSession()"
        @start-record-video="startRecordVideo()"
        @stop-record-video="stopRecordVideo()"
        @screenshot="handleScreenshot()"
        @start-record-audio="startRecordAudio()"
        @stop-record-audio="stopRecordAudio()"
        @show-note-dialog="showNoteDialog()"
        @show-mindmap-dialog="addMindmap()"
        @show-source-picker="showSourcePickerDialog()"
      />-->
    </div>
    <div className="nml-ctrl-wrapper" v-if="viewMode === 'normal'">
      <v-row class="text-center" v-if="status === 'pending'">
        <v-col cols="12" class="">
          <v-btn
            v-if="$store.state.session.quickTest"
            id="btn_new_quick_test"
            class="text-capitalize font-weight-regular"
            fill
            small
            block
            :color="currentTheme.primary"
            :style="{ color: currentTheme.white }"
            :height="30"
            @click="showSourcePickerDialog()"
          >
            {{ $tc("caption.start_quick_test", 1) }}
          </v-btn>
          <v-btn
            v-else
            id="btn_new_session"
            class="text-capitalize font-weight-regular"
            fill
            small
            block
            :color="currentTheme.primary"
            :style="{ color: currentTheme.white }"
            :height="30"
            @click="startNewSession()"
          >
            {{ $tc("caption.start_session", 1) }}
          </v-btn>
        </v-col>
      </v-row>
      <v-row class="mb-1" v-if="selected.length > 0">
        <v-col cols="6" class="pa-1">
          <v-btn
            id="btn_delete"
            fill
            small
            block
            :color="currentTheme.primary"
            :style="{ color: currentTheme.white }"
            @click="handleDeleteConfirmDialog"
          >
            <v-icon left>mdi-delete</v-icon> {{ $tc("caption.delete", 1) }}
          </v-btn>
        </v-col>
        <v-col cols="6" class="pa-1">
          <v-menu
            top
            :offset-y="true"
            :close-on-content-click="false"
            v-model="evidenceExportDestinationMenu"
          >
            <template v-slot:activator="{ on: evidenceExportDestinationMenu }">
              <v-tooltip top>
                <template v-slot:activator="{ on: onTooltip }">
                  <v-btn
                    id="btn_download"
                    fill
                    small
                    block
                    color="white"
                    :style="{ color: currentTheme.black }"
                    v-on="{ ...evidenceExportDestinationMenu, ...onTooltip }"
                  >
                    <v-icon left>mdi-download</v-icon>
                    {{ $tc("caption.export", 1) }}
                  </v-btn>
                </template>
                <span>{{ $tc("caption.export", 1) }}</span>
              </v-tooltip>
            </template>
            <v-card tile>
              <v-list dense>
                <v-list-item @click="exportItems">
                  <v-list-item-icon class="mr-4">
                    <v-icon>mdi-download</v-icon>
                  </v-list-item-icon>
                  <v-list-item-content>
                    <v-list-item-title>
                      {{ $tc("caption.save_as", 1) }}
                    </v-list-item-title>
                  </v-list-item-content>
                </v-list-item>
                <div v-if="credentials.jira && credentials.jira.length > 0">
                  <jira-export-session
                    :title="$tc(`caption.export_to_jira`, 1)"
                    :credential-items="credentials.jira"
                    :items="items"
                    :selected="selected"
                    @close-menu="() => (evidenceExportDestinationMenu = false)"
                  />
                </div>
                <div
                  v-if="credentials.testrail && credentials.testrail.length > 0"
                >
                  <test-rail-export-session
                    :title="$tc(`caption.export_to_testrail`, 1)"
                    :credential-items="credentials.testrail"
                    :items="items"
                    :selected="selected"
                  />
                </div>
                <div v-if="credentials.xray && credentials.xray.length > 0">
                  <xray-export-session
                    :title="$tc(`caption.export_to_xray`, 1)"
                    :credential-items="credentials.xray"
                    :items="items"
                    :selected="selected"
                  />
                </div>
              </v-list>
            </v-card>
          </v-menu>
        </v-col>
      </v-row>
      <v-row class="text-center control-btn-wrapper" v-if="status === 'end'">
        <v-col cols="12" class="d-flex justify-center px-0">
          <v-tooltip top v-if="status !== 'pause'">
            <template v-slot:activator="{ on }">
              <v-btn
                id="btn_resume"
                class="control-btn mx-1"
                fab
                outlined
                small
                color="default"
                v-on="on"
                @click="resume"
              >
                <v-icon v-if="$vuetify.theme.dark === false">
                  mdi-play-circle
                </v-icon>
                <v-icon color="#D1D5DB" v-else>mdi-play-circle</v-icon>
              </v-btn>
            </template>
            <span>{{ $tc("caption.resume_session", 1) }}</span>
          </v-tooltip>

          <v-tooltip top v-if="status !== 'pause'">
            <template v-slot:activator="{ on }">
              <v-btn
                id="btn_save"
                class="control-btn mx-1"
                fab
                outlined
                small
                color="default"
                v-on="on"
                @click="handleNewSessionDialog"
              >
                <v-icon v-if="$vuetify.theme.dark === false">
                  mdi-content-save
                </v-icon>
                <v-icon color="#D1D5DB" v-else>mdi-content-save</v-icon>
              </v-btn>
            </template>
            <span>{{ $tc("caption.save_session") }}</span>
          </v-tooltip>
          <v-tooltip top v-if="status !== 'pause'">
            <template v-slot:activator="{ on }">
              <v-btn
                id="btn_reset"
                class="control-btn mx-1"
                fab
                outlined
                small
                color="default"
                v-on="on"
                @click="handleResetConfirmDialog"
              >
                <v-icon v-if="$vuetify.theme.dark === false">
                  mdi-restart
                </v-icon>
                <v-icon color="#D1D5DB" v-else>mdi-restart</v-icon>
              </v-btn>
            </template>
            <span>{{ $tc("caption.restart_session", 1) }}</span>
          </v-tooltip>
          <v-tooltip top v-if="status !== 'pause'">
            <template v-slot:activator="{ on }">
              <v-btn
                id="btn_reset"
                class="control-btn mx-1"
                fab
                outlined
                small
                color="default"
                v-on="on"
                @click="finishSession"
              >
                <v-icon v-if="$vuetify.theme.dark === false">
                  mdi-close-circle
                </v-icon>
                <v-icon color="#D1D5DB" v-else>mdi-close-circle</v-icon>
              </v-btn>
            </template>
            <span>{{ $tc("caption.finish_session", 1) }}</span>
          </v-tooltip>
        </v-col>
      </v-row>
      <v-row
        class="text-center control-btn-wrapper"
        v-if="status !== 'pending' && status !== 'end'"
      >
        <v-col cols="12" class="d-flex justify-center px-0">
          <v-tooltip top v-if="status !== 'pause'">
            <template v-slot:activator="{ on }">
              <v-btn
                id="btn_pause_session"
                class="control-btn mx-1"
                fab
                outlined
                small
                color="default"
                v-on="on"
                v-shortkey="pauseHotkey"
                @shortkey="pauseSession()"
                @click="pauseSession()"
              >
                <img
                  v-if="$vuetify.theme.dark === false"
                  :src="require('../assets/icon/pause.svg')"
                  width="24"
                  height="24"
                />
                <img
                  v-else
                  :src="require('../assets/icon/pause-gray.svg')"
                  width="24"
                  height="24"
                />
              </v-btn>
            </template>
            <span>{{ $tc("caption.pause_session", 1) }}</span>
          </v-tooltip>
          <v-tooltip top v-if="status === 'pause'">
            <template v-slot:activator="{ on }">
              <v-btn
                id="btn_resume_session"
                class="control-btn mx-1"
                fab
                outlined
                small
                color="default"
                v-on="on"
                v-shortkey="resumeHotkey"
                @shortkey="resumeSession()"
                @click="resumeSession()"
              >
                <img
                  v-if="$vuetify.theme.dark === false"
                  :src="require('../assets/icon/play.svg')"
                  width="24"
                  height="24"
                />
                <img
                  v-else
                  :src="require('../assets/icon/play-gray.svg')"
                  width="24"
                  height="24"
                />
              </v-btn>
            </template>
            <span>{{ $tc("caption.resume_session", 1) }}</span>
          </v-tooltip>
          <v-tooltip top>
            <template v-slot:activator="{ on }">
              <v-btn
                id="btn_end_session"
                class="control-btn mx-1"
                fab
                outlined
                small
                color="default"
                v-on="on"
                v-shortkey="stopHotkey"
                @shortkey="endSession"
                @click="endSession"
              >
                <img
                  v-if="$vuetify.theme.dark === false"
                  :src="require('../assets/icon/stop.svg')"
                  width="24"
                  height="24"
                />
                <img
                  v-else
                  :src="require('../assets/icon/stop-gray.svg')"
                  width="24"
                  height="24"
                />
              </v-btn>
            </template>
            <span>{{ $tc("caption.end_session", 1) }}</span>
          </v-tooltip>
          <v-tooltip top v-if="!recordVideoStarted">
            <template v-slot:activator="{ on }">
              <v-btn
                id="btn_start_record_video"
                class="control-btn mx-1"
                fab
                outlined
                small
                color="default"
                :disabled="status === 'pause'"
                v-on="on"
                v-shortkey="startVideoHotkey"
                @shortkey="startRecordVideo()"
                @click="startRecordVideo()"
              >
                <img
                  v-if="$vuetify.theme.dark === false"
                  :src="require('../assets/icon/video-solid.svg')"
                  width="24"
                  height="24"
                />
                <img
                  v-else
                  :src="require('../assets/icon/video-solid-gray.svg')"
                  width="24"
                  height="24"
                />
              </v-btn>
            </template>
            <span>{{ $tc("caption.start_video_record", 1) }}</span>
          </v-tooltip>
          <v-tooltip top v-if="recordVideoStarted">
            <template v-slot:activator="{ on }">
              <v-btn
                id="btn_stop_record_video"
                class="control-btn mx-1"
                fab
                outlined
                small
                color="default"
                :disabled="status === 'pause'"
                v-on="on"
                v-shortkey="stopVideoHotkey"
                @shortkey="stopRecordVideo()"
                @click="stopRecordVideo()"
              >
                <img
                  v-if="$vuetify.theme.dark === false"
                  :src="require('../assets/icon/video-slash-solid.svg')"
                  width="24"
                  height="24"
                />
                <img
                  v-else
                  :src="require('../assets/icon/video-slash-solid-gray.svg')"
                  width="24"
                  height="24"
                />
              </v-btn>
            </template>
            <span>{{ $tc("caption.stop_video_record", 1) }}</span>
          </v-tooltip>
          <v-tooltip top>
            <template v-slot:activator="{ on }">
              <v-btn
                id="btn_screenshot"
                class="control-btn mx-1"
                fab
                outlined
                small
                color="default"
                :disabled="status === 'pause'"
                v-on="on"
                v-shortkey="screenshotHotkey"
                @shortkey="handleScreenshot()"
                @click="handleScreenshot()"
              >
                <img
                  v-if="$vuetify.theme.dark === false"
                  :src="require('../assets/icon/camera.svg')"
                  width="24"
                  height="24"
                />
                <img
                  v-else
                  :src="require('../assets/icon/camera-gray.svg')"
                  width="24"
                  height="24"
                />
              </v-btn>
            </template>
            <span>{{ $tc("caption.screenshot", 1) }}</span>
          </v-tooltip>
          <v-tooltip top v-if="!recordAudioStarted">
            <template v-slot:activator="{ on }">
              <v-btn
                id="btn_start_record_audio"
                class="control-btn mx-1"
                fab
                outlined
                small
                color="default"
                :disabled="status === 'pause'"
                v-on="on"
                v-shortkey="startAudioHotkey"
                @shortkey="startRecordAudio()"
                @click="startRecordAudio()"
              >
                <img
                  v-if="$vuetify.theme.dark === false"
                  :src="require('../assets/icon/microphone-solid.svg')"
                  width="28"
                  height="28"
                />
                <img
                  v-else
                  :src="require('../assets/icon/microphone-solid-gray.svg')"
                  width="28"
                  height="28"
                />
              </v-btn>
            </template>
            <span>{{ $tc("caption.start_audio_record", 1) }}</span>
          </v-tooltip>
          <v-tooltip top v-if="recordAudioStarted">
            <!-- TODO test same binding for start/stop -->
            <template v-slot:activator="{ on }">
              <v-btn
                id="btn_stop_record_audio"
                class="control-btn mx-1"
                fab
                outlined
                small
                color="default"
                v-on="on"
                :disabled="status === 'pause'"
                v-shortkey="stopAudioHotkey"
                @shortkey="stopRecordAudio()"
                @click="stopRecordAudio()"
              >
                <img
                  v-if="$vuetify.theme.dark === false"
                  :src="require('../assets/icon/microphone-slash-solid.svg')"
                  width="28"
                  height="28"
                />
                <img
                  v-else
                  :src="
                    require('../assets/icon/microphone-slash-solid-gray.svg')
                  "
                  width="28"
                  height="28"
                />
              </v-btn>
            </template>
            <span>{{ $tc("caption.stop_audio_record", 1) }}</span>
          </v-tooltip>
          <v-tooltip top>
            <template v-slot:activator="{ on }">
              <v-btn
                id="btn_note"
                class="control-btn mx-1"
                fab
                outlined
                small
                color="default"
                :disabled="status === 'pause'"
                v-on="on"
                v-shortkey="noteHotkey"
                @shortkey="showNoteDialog()"
                @click="showNoteDialog()"
              >
                <img
                  v-if="$vuetify.theme.dark === false"
                  :src="require('../assets/icon/pencil.svg')"
                  width="24"
                  height="24"
                />
                <img
                  v-else
                  :src="require('../assets/icon/pencil-gray.svg')"
                  width="24"
                  height="24"
                />
              </v-btn>
            </template>
            <span>{{ $tc("caption.note", 1) }}</span>
          </v-tooltip>
          <v-tooltip top>
            <template v-slot:activator="{ on }">
              <v-btn
                class="control-btn mx-1"
                fab
                outlined
                small
                color="default"
                :disabled="status === 'pause'"
                v-on="on"
                v-shortkey="mindmapHotkey"
                @shortkey="addMindmap()"
                @click="addMindmap()"
              >
                <img
                  v-if="$vuetify.theme.dark === false"
                  :src="require('../assets/icon/connect.svg')"
                  width="24"
                  height="24"
                />
                <img
                  v-else
                  :src="require('../assets/icon/connect-gray.svg')"
                  width="24"
                  height="24"
                />
              </v-btn>
            </template>
            <span>{{ $tc("caption.mind_map", 1) }}</span>
          </v-tooltip>
          <!--<v-tooltip top>
            <template v-slot:activator="{ on }">
              <v-btn
                class="control-btn mx-1"
                fab
                outlined
                small
                color="default"
                v-on="on"
                @click="minimize"
              >
                <img
                  v-if="$vuetify.theme.dark === false"
                  :src="require('../assets/icon/union.svg')"
                  width="24"
                  height="24"
                />
                <img
                  v-else
                  :src="require('../assets/icon/union-gray.svg')"
                  width="24"
                  height="24"
                />
              </v-btn>
            </template>
            <span>{{ $tc("caption.minimize", 1) }}</span>
          </v-tooltip>-->
          <v-menu offset-y>
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                id="btn_change_source"
                class="control-btn mx-1"
                fab
                outlined
                small
                color="default"
                v-on="on"
                v-bind="attrs"
                v-shortkey="changeSourceHotkey"
                @shortkey="showSourcePickerDialog()"
              >
                <v-icon v-if="$vuetify.theme.dark === false">
                  mdi-dots-vertical
                </v-icon>
                <v-icon color="#D1D5DB" v-else>mdi-dots-vertical</v-icon>
              </v-btn>
            </template>
            <v-list>
              <v-list-item
                @click="showSourcePickerDialog()"
                :disabled="
                  status === 'pause' || recordVideoStarted || recordAudioStarted
                "
              >
                <v-icon class="ddl-icon">mdi-fit-to-screen</v-icon>
                <v-list-item-content>
                  {{ $tc("caption.change_recording_target", 1) }}
                </v-list-item-content>
              </v-list-item>
              <v-list-item
                v-if="!$store.state.config.localOnly"
                @click="showShareSessionDialog()"
              >
                <v-icon class="ddl-icon">mdi-share-variant</v-icon>
                <v-list-item-content>
                  {{ $tc("caption.share_session", 1) }}
                </v-list-item-content>
              </v-list-item>
            </v-list>
          </v-menu>
        </v-col>
        <v-col
          cols="12"
          class="d-flex justify-center px-0 pt-0"
          v-if="credentials.jira && credentials.jira.length > 0"
          v-shortkey="createIssueHotkey"
          @shortkey="openIssueMenu"
        >
          <v-menu
            top
            :offset-y="true"
            :close-on-content-click="false"
            ref="issueMenu"
            v-model="issueCreateDestinationMenu"
          >
            <template v-slot:activator="{ on: issueCreateDestinationMenu }">
              <v-tooltip top>
                <template v-slot:activator="{ on: onTooltip }">
                  <v-btn
                    id="btn__bug"
                    class="control-btn mx-1"
                    fab
                    outlined
                    small
                    color="default"
                    v-on="{ ...issueCreateDestinationMenu, ...onTooltip }"
                  >
                    <img
                      v-if="$vuetify.theme.dark === false"
                      :src="require('../assets/icon/bug.svg')"
                      width="24"
                      height="24"
                    />
                    <img
                      v-else
                      :src="require('../assets/icon/bug-gray.svg')"
                      width="24"
                      height="24"
                    />
                  </v-btn>
                </template>

                <span>{{ $tc("caption.create_new_issue", 1) }}</span>
              </v-tooltip>
            </template>
            <v-card class="mx-auto" width="150" tile>
              <v-list dense>
                <jira-add-issue
                  :credential-items="credentials.jira"
                  :items="items"
                  :selected="selected"
                  @close-menu="() => (issueCreateDestinationMenu = false)"
                />
              </v-list>
            </v-card>
          </v-menu>
        </v-col>
      </v-row>
      <SourcePickerDialog
        v-model="sourcePickerDialog"
        :sources="sources"
        :sourceId="sourceId"
        :loaded="loaded"
        @submit-source="startSession"
      />
      <ShareSessionDialog
        v-if="isShareSessionAllowed"
        v-model="shareSessionDialog"
        :session-link="sessionLink"
        :credentialItems="credentials"
        :configItem="config"
      />
      <NoteDialog
        v-model="noteDialog"
        ref="noteDialog"
        :isVisible="noteDialog"
        :configItem="config"
        :credentialItems="credentials"
        @submit-note="addNote"
      />
      <SummaryDialog
        ref="summaryDialog"
        v-model="summaryDialog"
        :configItem="config"
        :credentialItems="credentials"
        :summary="summary"
        @submit-summary="addSummary"
      />
      <DeleteConfirmDialog
        v-model="deleteConfirmDialog"
        ref="deleteConfirmDialog"
        :text="$t('message.confirm_delete')"
        :configItem="config"
        @confirm="deleteItems"
        @cancel="deleteConfirmDialog = false"
      />
      <ResetConfirmDialog
        v-model="resetConfirmDialog"
        ref="resetConfirmDialog"
        :text="$t('message.confirm_reset')"
        @confirm="resetSession"
        @cancel="resetConfirmDialog = false"
      />
      <SaveConfirmDialog
        v-model="saveConfirmDialog"
        ref="saveConfirmDialog"
        :text="$t('message.confirm_session_saved')"
        :configItem="config"
        @confirm="handleSaveConfirmDialog"
      />
      <NewSessionDialog
        v-model="newSessionDialog"
        ref="newSessionDialog"
        :text="$t('message.confirm_save_progress')"
        :configItem="config"
        @save="saveSession(callback)"
        @discard="discardSession(callback)"
      />
      <DurationConfirmDialog
        v-model="durationConfirmDialog"
        :text="$t('message.confirm_proceed_session_time')"
        :configItem="config"
        @end="end"
        @proceed="proceed"
      />
      <AudioErrorDialog
        v-model="audioErrorDialog"
        :text="$t('message.error_recording_audio')"
        :configItem="config"
        @cancel="audioErrorDialog = false"
      />
      <EndSessionDialog
        v-model="endSessionDialog"
        :post-session-data="postSessionData"
        @proceed="closeEndSessionDialog"
      />
      <AddEvidenceDialog
        v-if="evidenceData"
        v-model="addEvidenceDialog"
        :item-data="evidenceData"
        @close="
          addEvidenceDialog = false;
          evidenceData = null;
        "
      />
    </div>
  </v-container>
</template>

<script>
import { VBtn, VCol, VContainer, VIcon, VRow } from "vuetify/lib/components";
import uuidv4 from "uuid";

import yattIntegrationHelper from "../integrations/YattIntegrationHelpers";

import SourcePickerDialog from "./dialogs/SourcePickerDialog.vue";
import ShareSessionDialog from "./dialogs/ShareSessionDialog.vue";
import NoteDialog from "./dialogs/NoteDialog.vue";
import SummaryDialog from "./dialogs/SummaryDialog.vue";
import DeleteConfirmDialog from "./dialogs/DeleteConfirmDialog.vue";
import ResetConfirmDialog from "./dialogs/ResetConfirmDialog.vue";
import SaveConfirmDialog from "./dialogs/SaveConfirmDialog.vue";
import NewSessionDialog from "./dialogs/NewSessionDialog.vue";
import DurationConfirmDialog from "./dialogs/DurationConfirmDialog.vue";
import AudioErrorDialog from "./dialogs/AudioErrorDialog.vue";
import EndSessionDialog from "./dialogs/EndSessionDialog.vue";
//import MinimizeControlWrapper from "../components/MinimizeControlWrapper.vue";
import JiraExportSession from "./jira/JiraExportSession";
import TestRailExportSession from "./testrail/TestRailExportSession";
import XrayExportSession from "./xray/XrayExportSession";
import AddEvidenceDialog from "@/components/dialogs/AddEvidenceDialog.vue";

import JiraAddIssue from "./jira/JiraAddIssue";

import {
  DEFAULT_MAP_CONNECTIONS,
  DEFAULT_MAP_NODES,
  SESSION_STATUSES,
  STATUSES,
  DEFAULT_FILE_TYPES,
  VIDEO_RESOLUTION,
} from "@/modules/constants";
import { mapGetters } from "vuex";
import {
  createAudioForWeb,
  createImageForWeb,
  createVideoForWeb,
  saveNoteForWeb,
} from "@/helpers/WebHelpers";

let mediaRecorder;
let audioContext;
let dest;
export default {
  name: "ControlPanel",
  components: {
    AddEvidenceDialog,
    VContainer,
    VRow,
    VCol,
    VBtn,
    VIcon,
    SourcePickerDialog,
    ShareSessionDialog,
    NoteDialog,
    SummaryDialog,
    DeleteConfirmDialog,
    ResetConfirmDialog,
    SaveConfirmDialog,
    NewSessionDialog,
    DurationConfirmDialog,
    AudioErrorDialog,
    EndSessionDialog,
    // MinimizeControlWrapper,
    JiraExportSession,
    TestRailExportSession,
    XrayExportSession,
    JiraAddIssue,
  },
  props: {
    selectedItems: {
      type: Array,
      default: () => [],
    },
    preSessionRequirementsMet: {
      type: Boolean,
      default: () => false,
    },
    viewMode: {
      type: String,
      default: () => "normal",
    },
    srcId: {
      type: String,
      default: () => "",
    },
  },
  created() {
    try {
      audioContext = new AudioContext();
      dest = audioContext.createMediaStreamDestination();
    } catch (e) {
      console.log(e);
    }
  },
  watch: {
    selectedItems: function (newValue) {
      this.selected = newValue;
    },
    mediaStream: function (newValue) {
      if (newValue) {
        const videoTrack = this.mediaStream.getVideoTracks()[0];

        videoTrack.addEventListener("ended", () => {
          console.log("The user has stopped sharing their screen.");
          this.mediaStream = null;
        });
      }
    },
    "$store.state.session.status": {
      deep: true,
      handler(newValue) {
        this.status = newValue;
        if (
          this.status === SESSION_STATUSES.START ||
          this.status === SESSION_STATUSES.RESUME ||
          this.status === SESSION_STATUSES.PROCEED
        ) {
          this.startInterval();
        } else {
          this.stopInterval();
        }
      },
    },
    "$store.state.session.timer": {
      deep: true,
      handler(newValue) {
        this.timer = newValue;
      },
    },
    "$store.state.case.duration": {
      deep: true,
      handler(newValue) {
        this.duration = newValue;
      },
    },
  },
  computed: {
    ...mapGetters({
      items: "sessionItems",
      hotkeys: "config/hotkeys",
      postSessionData: "config/postSessionData",
      config: "config/fullConfig",
      credentials: "auth/credentials",
    }),
    isShareSessionAllowed() {
      return !this.config.localOnly;
    },
    pauseHotkey() {
      return this.$hotkeyHelpers.findBinding("workspace.pause", this.hotkeys);
    },
    resumeHotkey() {
      return this.$hotkeyHelpers.findBinding("workspace.resume", this.hotkeys);
    },
    stopHotkey() {
      return this.$hotkeyHelpers.findBinding("workspace.stop", this.hotkeys);
    },
    startVideoHotkey() {
      return this.$hotkeyHelpers.findBinding(
        "workspace.videoStart",
        this.hotkeys
      );
    },
    stopVideoHotkey() {
      return this.$hotkeyHelpers.findBinding(
        "workspace.videoStop",
        this.hotkeys
      );
    },
    screenshotHotkey() {
      return this.$hotkeyHelpers.findBinding(
        "workspace.screenshot",
        this.hotkeys
      );
    },
    startAudioHotkey() {
      return this.$hotkeyHelpers.findBinding(
        "workspace.audioStart",
        this.hotkeys
      );
    },
    stopAudioHotkey() {
      return this.$hotkeyHelpers.findBinding(
        "workspace.audioStop",
        this.hotkeys
      );
    },
    noteHotkey() {
      return this.$hotkeyHelpers.findBinding("workspace.note", this.hotkeys);
    },
    mindmapHotkey() {
      return this.$hotkeyHelpers.findBinding("workspace.mindmap", this.hotkeys);
    },
    changeSourceHotkey() {
      return this.$hotkeyHelpers.findBinding(
        "workspace.changeSource",
        this.hotkeys
      );
    },
    createIssueHotkey() {
      return this.$hotkeyHelpers.findBinding(
        "workspace.createIssue",
        this.hotkeys
      );
    },
    elapsedTime() {
      const timer = this.timer;
      const date = new Date(null);
      date.setSeconds(timer);
      return date.toISOString().substr(11, 8);
    },
    currentTheme() {
      if (this.$vuetify.theme.dark) {
        return this.$vuetify.theme.themes.dark;
      } else {
        return this.$vuetify.theme.themes.light;
      }
    },
    summary() {
      let summary = {};
      this.items.map((item) => {
        if (item?.comment?.type === "Summary") {
          summary = item;
        }
      });
      return summary;
    },
  },
  data() {
    return {
      sourcePickerDialog: false,
      shareSessionDialog: false,
      noteDialog: false,
      summaryDialog: false,
      deleteConfirmDialog: false,
      resetConfirmDialog: false,
      saveConfirmDialog: false,
      newSessionDialog: false,
      durationConfirmDialog: false,
      audioErrorDialog: false,
      endSessionDialog: false,
      sources: [],
      sessionLink: "",
      sourceId: this.srcId,
      audioDevices: [],
      loaded: false,
      status: this.$store.state.session.status,
      recordVideoStarted: false,
      recordAudioStarted: false,
      interval: null,
      timer: this.$store.state.session.timer,
      duration: this.$store.state.case.duration,
      isDuration: false,
      started: "",
      ended: "",
      selected: [],
      callback: null,
      evidenceExportDestinationMenu: false,
      issueCreateDestinationMenu: false,
      evidenceData: null,
      addEvidenceDialog: false,
      mediaStream: null,
    };
  },
  mounted() {
    if (this.$isElectron) {
      this.$electronService.onNewSession(this.newSession);
      this.$electronService.onSaveSession(this.handleSaveConfirmDialog);
      this.$electronService.onResetSession(this.showResetConfirmDialog);
    }

    this.$root.$on("close-sourcepickerdialog", this.hideSourcePickerDialog);
    this.$root.$on("close-sharesessiondialog", this.hideShareSessionDialog);
    this.$root.$on("close-notedialog", this.hideNoteDialog);
    this.$root.$on("close-summarydialog", () => {
      this.summaryDialog = false;
    });

    if (
      this.$store.state.session.status === SESSION_STATUSES.START ||
      this.$store.state.session.status === SESSION_STATUSES.PROCEED ||
      this.$store.state.session.status === SESSION_STATUSES.RESUME
    ) {
      this.status = this.$store.state.session.status;
      this.timer = this.$store.state.session.timer;
      this.duration = this.$store.state.case.duration;
      if (this.$store.state.session.status === SESSION_STATUSES.START) {
        this.startSession(this.sourceId);
      }
      this.startInterval();
    }

    if (
      this.$store.state.session.quickTest &&
      this.$store.state.session.status === SESSION_STATUSES.PENDING
    ) {
      this.showSourcePickerDialog();
    }
  },
  beforeDestroy() {
    this.updateStoreSession(true);
    this.$root.$off("close-sourcepickerdialog", this.hideSourcePickerDialog);
    this.$root.$on("close-notedialog", this.hideNoteDialog);
    // clear timer
    clearInterval(this.interval);
    this.timer = 0;
  },
  destroyed() {
    this.updateStoreSession(true);
  },
  methods: {
    showResetConfirmDialog() {
      this.resetConfirmDialog = true;
    },
    newSession() {
      this.callback = () => this.startNewSessionFromFileMenu();
      this.handleNewSessionDialog();
    },
    openIssueMenu() {
      this.issueCreateDestinationMenu = true;
      setTimeout(() => {
        this.$refs.issueMenu.$children
          .slice(-1)[0]
          ?.$el.querySelector(".v-list-item")
          .focus();
      }, 150); // TODO - this is probably prone to race conditions
    },
    handleNewSessionDialog() {
      this.newSessionDialog = true;
      setTimeout(() => {
        this.$refs.newSessionDialog.$refs.confirmBtn.$el.focus();
      }, 100);
    },
    startNewSession() {
      this.$root.$emit("start-new-session");
      if (!this.preSessionRequirementsMet) {
        return;
      }
      this.newSessionFromButton();
      this.$store.commit("setSessionQuickTest", false);
      this.showSourcePickerDialog();
    },
    handleResetConfirmDialog() {
      this.resetConfirmDialog = true;
      setTimeout(() => {
        this.$refs.resetConfirmDialog.$refs.confirmBtn.$el.focus();
      }, 100);
    },
    handleSaveConfirmDialog() {
      this.saveConfirmDialog = true;
      setTimeout(() => {
        this.$refs.saveConfirmDialog.$refs.confirmBtn.$el.focus();
      }, 100);
    },
    fetchSources() {
      if (this.$isElectron) {
        return this.$electronService.getMediaSource();
      }
      // todo implement web version for this functionality
    },
    async showSourcePickerDialog() {
      if (this.$isElectron) {
        try {
          let data = await this.fetchSources();
          this.loaded = true;
          this.sources = data;

          if (this.viewMode === "normal") {
            this.sourcePickerDialog = true;
          } else {
            if (this.$isElectron) {
              await this.$electronService.openSourcePickerWindow(this.sources);
            }
          }
        } catch (err) {
          console.log(err);
        }
      } else {
        this.mediaStream = await navigator.mediaDevices.getDisplayMedia({
          video: {
            displaySurface: "window",
            cursor: "always",
          },
          audio: true,
        });

        await this.startSession();
      }
    },
    async showShareSessionDialog() {
      let savedSession = await yattIntegrationHelper.saveSession(
        this.credentials
      );
      if (savedSession?.error) {
        this.$root.$emit(
          "set-snackbar",
          `Unable to save session: ${savedSession.error}`
        );
      } else {
        this.sessionLink = savedSession?.link;
        this.shareSessionDialog = true;
      }
    },
    hideSourcePickerDialog() {
      this.sourcePickerDialog = false;
    },
    hideShareSessionDialog() {
      this.shareSessionDialog = false;
    },
    showNoteDialog() {
      if (this.viewMode === "normal") {
        this.noteDialog = true;
        setTimeout(() => {
          this.$refs.noteDialog.$refs.comment.editor.commands.focus();
        });
      } else {
        if (this.$isElectron) {
          this.$electronService.openNoteEditorWindow(this.config);
        }
      }
    },
    hideNoteDialog() {
      this.noteDialog = false;
    },
    handleDeleteConfirmDialog() {
      this.deleteConfirmDialog = true;
      setTimeout(() => {
        this.$refs.deleteConfirmDialog.$refs.confirmBtn.$el.focus();
      }, 100);
    },
    startInterval() {
      console.log("start interval");
      if (!this.interval) {
        this.interval = setInterval(() => {
          this.timer += 1;

          this.updateStoreSession();
          if (this.isDuration && this.duration <= 0) {
            this.durationConfirmDialog = true;
            this.isDuration = false;
            this.stopInterval();
          }
        }, 1000);
      }
    },
    stopInterval() {
      clearInterval(this.interval);
      this.interval = null;
      this.updateStoreSession();
    },
    updateStoreSession(isForce = false) {
      this.$store.commit("updateSession", {
        status: this.status,
        timer: this.timer,
        duration: this.duration,
        isForce,
      });
    },
    async startSession(id = null) {
      if (this.$isElectron) {
        this.sourceId = id;
      }
      this.sourcePickerDialog = false;

      this.timer = this.$store.state.session.timer;
      this.duration = this.$store.state.case.duration;
      if (this.duration > 0) {
        this.isDuration = true;
      }

      if (this.started === "") {
        this.started = this.getCurrentDateTime();
        this.$store.commit("setSessionStarted", this.started);
      }

      if (this.status !== SESSION_STATUSES.START) {
        console.log("start interval-2");
        this.status = SESSION_STATUSES.START;
        this.startInterval();
        this.changeSessionStatus(SESSION_STATUSES.START);
      }

      if (!this.$store.state.session.sessionID) {
        const data = {
          case: {
            title: this.$store.state.case.title,
            charter: this.$store.state.case.charter,
            preconditions: this.$store.state.case.preconditions,
            duration: this.$store.state.case.duration,
          },
          session: {
            status: this.$store.state.session.status,
            timer: this.$store.state.session.timer,
            started: this.$store.state.session.started,
            ended: this.$store.state.session.ended,
            quickTest: this.$store.state.session.quickTest,
            path: this.$route.path,
          },
        };

        await this.$storageService.createNewSession(data);
        if (this.$isElectron) {
          const caseID = await this.$storageService.getCaseId();
          const sessionID = await this.$storageService.getSessionId();
          this.$store.commit("setCaseID", caseID);
          this.$store.commit("setSessionID", sessionID);
        }
      }

      if (this.viewMode === "normal") {
        const currentPath = this.$router.history.current.path;
        if (currentPath !== "/main/workspace") {
          await this.$router.push({ path: "/main/workspace" });
        }
      }
    },
    pauseSession() {
      this.status = SESSION_STATUSES.PAUSE;
      this.changeSessionStatus(SESSION_STATUSES.PAUSE);
      this.stopInterval();
    },
    async resumeSession() {
      if (this.$isElectron) {
        this.fetchSources().then((data) => {
          const list = data.filter((v) => v.id === this.sourceId);
          if (list.length === 0) {
            this.showSourcePickerDialog();
          } else {
            this.status = SESSION_STATUSES.START;
            this.timer = this.$store.state.session.timer;
            console.log("start interval-3");
            this.startInterval();
          }
        });
      } else {
        if (!this.mediaStream) {
          await this.setMediaStream();
        }
        this.status = SESSION_STATUSES.START;
        this.timer = this.$store.state.session.timer;
        console.log("start interval-3");
        this.startInterval();
      }
    },
    endSession() {
      if (this.postSessionData.status) {
        this.showEndSessionDialog();
      } else {
        this.showSummaryDialog();
      }
    },
    async endSessionProcess() {
      this.sourceId = "";
      this.ended = this.getCurrentDateTime();
      this.$store.commit("setSessionEnded", this.ended);
      this.status = SESSION_STATUSES.END;
      this.changeSessionStatus(SESSION_STATUSES.END);
      this.stopInterval();
      await this.$router.push({ path: "/result" });
    },
    showSummaryDialog() {
      if (this.viewMode === "normal") {
        this.summaryDialog = true;

        setTimeout(() => {
          this.$refs.summaryDialog.$refs.comment.editor.commands.focus();
        }, 200);
      } else {
        if (this.$isElectron) {
          this.$electronService.openSummaryWindow(this.config);
        }
      }
    },
    showEndSessionDialog() {
      if (this.viewMode === "normal") {
        this.endSessionDialog = true;
      } else {
        if (this.$isElectron) {
          this.$electronService.openEndSessionWindow(this.config);
        }
      }
    },
    closeEndSessionDialog(status) {
      this.endSessionDialog = false;
      if (status) {
        this.showSummaryDialog();
      }
    },
    resume() {
      this.pauseSession();
      this.timer = this.$store.state.session.timer;
      this.updateStoreSession();
      const currentPath = this.$router.history.current.path;
      if (currentPath !== "/main/workspace") {
        this.$router.push({ path: "/main/workspace" });
      }
      if (this.$isElectron) {
        this.$electronService.setWindowSize({ width: 800, height: 600 });
      }
    },
    end() {
      this.durationConfirmDialog = false;
      this.endSession();
    },
    proceed() {
      this.durationConfirmDialog = false;
      this.status = SESSION_STATUSES.PROCEED;
      this.changeSessionStatus(SESSION_STATUSES.PROCEED);
      this.startInterval();
    },
    updateStatus(value) {
      this.status = value;
      this.changeSessionStatus(this.status);
      this.$store.commit("setStatus", this.status);
    },
    async setMediaStream() {
      this.mediaStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          displaySurface: "window",
          cursor: "always",
        },
        audio: true,
      });
    },
    async handleScreenshot() {
      if (this.$isElectron) {
        this.fetchSources().then((data) => {
          const list = data.filter((v) => v.id === this.sourceId);
          if (list.length === 0) {
            this.showSourcePickerDialog();
          } else {
            this.screenshotProcess();
          }
        });
      } else {
        if (!this.mediaStream) {
          await this.setMediaStream();
        }
        this.screenshotProcess();
      }
    },
    async screenshotProcess() {
      this.handleStream = (stream) => {
        const video = document.createElement("video");
        video.srcObject = stream;
        video.onloadedmetadata = async () => {
          const _this = video;
          video.play();
          const canvas = document.createElement("canvas");
          canvas.width = _this.videoWidth;
          canvas.height = _this.videoHeight;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          video.remove();
          const imgURI = canvas.toDataURL("image/png");
          stream.getTracks().forEach((track) => track.stop());

          if (this.$isElectron) {
            // todo add web implementation
            const { status, message, item } =
              await this.$electronService.createImage(imgURI);

            if (status === STATUSES.ERROR) {
              this.$root.$emit("set-snackbar", message);
              console.log(message);
            } else {
              const data = {
                ...item,
                timer_mark: this.timer,
              };
              this.evidenceData = data;
              this.addEvidenceDialog = true;
            }
          } else {
            const { item } = createImageForWeb(imgURI);
            const data = {
              ...item,
              timer_mark: this.timer,
            };
            this.evidenceData = data;
            this.addEvidenceDialog = true;
          }
        };
      };
      this.handleError = (error) => {
        console.log(error);
      };
      try {
        let stream;
        if (this.$isElectron) {
          stream = await navigator.mediaDevices.getUserMedia({
            audio: false,
            video: {
              mandatory: {
                chromeMediaSource: "desktop",
                chromeMediaSourceId: this.sourceId,
                minWidth: 1280,
                maxWidth: 10000,
                minHeight: 720,
                maxHeight: 4000,
              },
            },
          });
        } else {
          stream = this.mediaStream;
        }

        this.handleStream(stream);
      } catch (e) {
        this.handleError(e);
      }
    },
    async startRecordVideo() {
      if (this.$isElectron) {
        this.fetchSources().then((data) => {
          const list = data.filter((v) => v.id === this.sourceId);
          if (list.length === 0) {
            this.showSourcePickerDialog();
          } else {
            this.videoRecordProcess();
          }
        });
      } else {
        if (!this.mediaStream) {
          await this.setMediaStream();
        }
        this.videoRecordProcess();
      }
    },
    async videoRecordProcess() {
      this.handleStream = (stream) => {
        if (this.config.audioCapture && this.audioDevices.length > 0) {
          stream.addTrack(dest.stream.getAudioTracks()[0]);
        }
        const mimeType = MediaRecorder.isTypeSupported("video/webm; codecs=vp9")
          ? "video/webm; codecs=vp9"
          : "video/webm";
        // const mimeType = "video/webm;codecs=h264";
        mediaRecorder = new MediaRecorder(stream, {
          mimeType: mimeType,
        });
        let poster;
        let frames = [];
        mediaRecorder.onstart = () => {
          this.recordVideoStarted = true;
          const video = document.createElement("video");
          video.srcObject = stream;
          video.onloadedmetadata = async () => {
            video.play();
            const canvas = document.createElement("canvas");
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            video.remove();
            const imgURI = canvas.toDataURL("image/png");

            if (this.$isElectron) {
              const { status, message, item } =
                await this.$electronService.createImage(imgURI, true);

              if (status === STATUSES.ERROR) {
                this.$root.$emit("set-snackbar", message);
                console.log("Unable to generate poster for video: " + message);
              }
              poster = item.filePath;
            } else {
              const { item } = createImageForWeb(imgURI);
              poster = item.filePath;
            }
          };
        };
        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            frames.push(e.data);
          }
        };
        mediaRecorder.onstop = async () => {
          this.recordVideoStarted = false;
          const blob = new Blob(frames, { type: mimeType });
          const buffer = await blob.arrayBuffer();

          if (this.$isElectron) {
            const { status, message, item } =
              await this.$electronService.createVideo(buffer);
            if (status === STATUSES.ERROR) {
              this.$root.$emit("set-snackbar", message);
              console.log(message);
            } else {
              const data = {
                ...item,
                poster: poster,
                timer_mark: this.timer,
              };
              this.evidenceData = data;
              this.addEvidenceDialog = true;
            }
          } else {
            const { item } = createVideoForWeb(blob);
            const data = {
              ...item,
              poster: poster,
              timer_mark: this.timer,
            };
            this.evidenceData = data;
            this.addEvidenceDialog = true;
          }
        };
        // mediaRecorder.addEventListener("error", (event) => {
        //   console.error("MediaRecorder error:", event.error);
        // });
        frames = [];
        mediaRecorder.start(1000);
      };
      this.handleError = (error) => {
        console.log(error);
      };
      try {
        const videoQuality = this.config.videoQuality;
        let resolution;
        VIDEO_RESOLUTION.map((item) => {
          let temp = Object.assign({}, item);
          if (temp.type === videoQuality) {
            resolution = temp;
          }
        });

        let stream;
        if (this.$isElectron) {
          const constraints = {
            audio: false,
            video: {
              mandatory: {
                chromeMediaSource: "desktop",
                chromeMediaSourceId: this.sourceId,
                minWidth: resolution.width,
                maxWidth: resolution.width,
                minHeight: resolution.height,
                maxHeight: resolution.height,
              },
            },
          };
          if (this.config.audioCapture) {
            this.audioDevices = await this.getAudioSources();
            if (this.audioDevices.length > 0) {
              await this.setAudio(this.audioDevices);
            }
          }
          stream = await navigator.mediaDevices.getUserMedia(constraints);
        } else {
          stream = this.mediaStream;
        }

        await stream.getVideoTracks()[0].applyConstraints({ frameRate: 30 });
        this.handleStream(stream);
      } catch (e) {
        console.log(e);
      }
    },
    stopRecordVideo() {
      try {
        mediaRecorder.stop();
      } catch (error) {
        console.log(error);
      }
    },
    async getAudioSources() {
      return await navigator.mediaDevices.enumerateDevices().then((devices) => {
        const audioDevices = devices.filter(
          (d) =>
            d.kind === "audioinput" &&
            d.deviceId != "communications" &&
            d.deviceId != "default"
        );
        return audioDevices;
      });
    },
    async setAudio(source) {
      const audioStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          deviceId: source.deviceId,
          autoGainControl: false,
          latency: 0.0,
        },
      });
      let audioIn_01 = audioContext.createMediaStreamSource(audioStream);
      audioIn_01.connect(dest);
      return audioIn_01;
    },
    async startRecordAudio() {
      this.setAudioSource = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            audio: {
              deviceId: this.audioDevices[0].deviceId,
              autoGainControl: false,
              latency: 0.0,
            },
          });
          this.handleStream(stream);
        } catch (e) {
          this.handleError(e);
        }
      };
      this.handleStream = (stream) => {
        let recordedChunks = [];
        const option = {
          mimeType: "audio/webm",
        };
        mediaRecorder = new MediaRecorder(stream, option);
        mediaRecorder.onstart = () => {
          this.recordAudioStarted = true;
        };
        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            recordedChunks.push(e.data);
          }
        };
        mediaRecorder.onstop = async () => {
          this.recordAudioStarted = false;
          const blob = new Blob(recordedChunks, {
            type: "audio/mpeg-3",
          });
          const buffer = await blob.arrayBuffer();
          if (this.$isElectron) {
            const { status, message, item } =
              await this.$electronService.createAudio(buffer);

            if (status === STATUSES.ERROR) {
              this.$root.$emit("set-snackbar", message);
              console.log(message);
            } else {
              const data = {
                ...item,
                timer_mark: this.timer,
                poster: "",
              };
              this.evidenceData = data;
              this.addEvidenceDialog = true;
            }
            recordedChunks = [];
          } else {
            const { item } = createAudioForWeb(blob);
            const data = {
              ...item,
              timer_mark: this.timer,
              poster: "",
            };
            this.evidenceData = data;
            this.addEvidenceDialog = true;
          }
        };
        mediaRecorder.start(1000);
      };
      this.handleError = (error) => {
        console.log("Error:", error);
      };
      await navigator.mediaDevices.enumerateDevices().then((devices) => {
        this.audioDevices = devices.filter(
          (d) =>
            d.kind === "audioinput" &&
            d.deviceId != "communications" &&
            d.deviceId != "default"
        );
        console.log("audio devices:", this.audioDevices);
        if (!this.audioDevices.length) {
          this.audioErrorDialog = true;
          return;
        }
        this.setAudioSource();
      });
    },
    stopRecordAudio() {
      try {
        mediaRecorder.stop();
      } catch (error) {
        console.log(error);
      }
    },
    async openAddWindow(data) {
      if (this.$isElectron) {
        await this.$electronService.openAddWindow(data);
      }
    },
    async addNote(data) {
      if (this.$isElectron) {
        const { status, message, item } = await this.$storageService.saveNote(
          data.comment
        );
        if (status === STATUSES.ERROR) {
          this.$root.$emit("set-snackbar", message);
          console.log(message);
        } else {
          let newItem = {
            stepID: item.stepID,
            fileType: DEFAULT_FILE_TYPES["text"].type,
            fileName: item.fileName,
            filePath: item.filePath,
            comment: data.comment,
            tags: data.tags,
            emoji: data.emoji,
            followUp: data.followUp,
            timer_mark: this.timer,
            createdAt: Date.now(),
          };
          this.$emit("add-item", newItem);
          this.noteDialog = false;
        }
      } else {
        const { item } = saveNoteForWeb(data.comment);
        let newItem = {
          stepID: item.stepID,
          fileType: DEFAULT_FILE_TYPES["text"].type,
          fileName: item.fileName,
          filePath: item.filePath,
          comment: data.comment,
          tags: data.tags,
          emoji: data.emoji,
          followUp: data.followUp,
          timer_mark: this.timer,
          createdAt: Date.now(),
        };

        this.$emit("add-item", newItem);
        this.noteDialog = false;
      }
    },
    async addSummary(value) {
      // TODO - handle summary like a regular note and allow additional metadata
      const data = {
        stepID: uuidv4(),
        fileType: DEFAULT_FILE_TYPES["text"].type,
        comment: value,
        timer_mark: this.timer,
        createdAt: Date.now(),
      };
      if (Object.keys(this.summary).length) {
        delete data.stepID;
        const newSummary = {
          ...this.summary,
          ...data,
        };
        this.$emit("update-item", newSummary);
      } else {
        this.$emit("add-item", data);
      }
      this.summaryDialog = false;
      await this.endSessionProcess();
    },
    addMindmap() {
      // TODO - With transition to try mindmap format, UUID generation should
      //        move to CaptureUtility
      const stepID = uuidv4();
      const attachmentID = uuidv4();
      const data = {
        stepID,
        attachmentID,
        fileType: DEFAULT_FILE_TYPES["mindmap"].type,
        fileName: `mindmap-${attachmentID.substring(0, 5)}.png`,
        filePath: "",
        content: {
          nodes: DEFAULT_MAP_NODES,
          connections: DEFAULT_MAP_CONNECTIONS,
        },
        timer_mark: this.timer,
      };
      // this.openAddWindow(data);
      this.evidenceData = data;
      this.addEvidenceDialog = true;
    },
    async deleteItems() {
      this.$store.commit("deleteSessionItems", this.selected);
      this.selected = [];
      this.$root.$emit("update-selected", this.selected);
      this.deleteConfirmDialog = false;
    },
    async exportItems() {
      if (this.$isElectron) {
        await this.$electronService.exportItems(this.selected);
        this.selected = [];
        this.$root.$emit("update-selected", this.selected);
      }
      // todo add web handler for items export
    },
    async saveSession(callback = null) {
      this.newSessionDialog = false;
      const data = {
        case: {
          caseID: this.$store.state.case.caseID,
          title: this.$store.state.case.title,
          charter: this.$store.state.case.charter,
          mindmap: this.$store.state.case.mindmap,
          preconditions: this.$store.state.case.preconditions,
          duration: this.$store.state.case.duration,
        },
        session: {
          sessionID: this.$store.state.session.sessionID,
          status: this.$store.state.session.status,
          timer: this.$store.state.session.timer,
          started: this.$store.state.session.started,
          ended: this.$store.state.session.ended,
          quickTest: this.$store.state.session.quickTest,
          path: this.$route.path,
        },
      };
      const { status } = await this.$storageService.saveSession(data);
      if (status === STATUSES.SUCCESS && callback) {
        callback();
      }
    },
    discardSession(callback = null) {
      this.newSessionDialog = false;
      if (callback) {
        callback();
      }
    },

    async startNewSessionFromFileMenu() {
      // Emitting the reset-duration event
      this.$root.$emit("reset-duration");

      // Resetting state variables and store
      this.$store.commit("clearState");

      if (this.$isElectron) {
        this.$electronService.setWindowSize({ width: 800, height: 600 });
      }

      // Navigate to main page if not already there
      const currentPath = this.$router.history.current.path;
      if (currentPath !== "/main") {
        await this.$router.push({ path: "/main" });
      }
    },
    async newSessionFromButton() {
      // Update status and reset timers
      this.status = SESSION_STATUSES.PENDING;
      this.changeSessionStatus(SESSION_STATUSES.PENDING);
      this.timer = 0;
      this.isDuration = false;
      this.duration = this.$store.state.case.duration;

      // Clear dialogs
      this.sourcePickerDialog = false;
      this.noteDialog = false;
      this.summaryDialog = false;
      this.deleteConfirmDialog = false;
      this.resetConfirmDialog = false;
      this.saveConfirmDialog = false;
      this.newSessionDialog = false;
      this.durationConfirmDialog = false;
      this.audioErrorDialog = false;
      this.endSessionDialog = false;

      const data = {
        case: {
          title: this.$store.state.case.title,
          charter: this.$store.state.case.charter,
          preconditions: this.$store.state.case.preconditions,
          duration: this.$store.state.case.duration,
        },
        session: {
          status: this.$store.state.session.status,
          timer: this.$store.state.session.timer,
          started: this.$store.state.session.started,
          ended: this.$store.state.session.ended,
          quickTest: this.$store.state.session.quickTest,
          path: this.$route.path,
        },
      };

      await this.$storageService.createNewSession(data);
      await this.$storageService.resetData();

      const caseID = await this.$storageService.getCaseId();
      const sessionID = await this.$storageService.getSessionId();
      this.$store.commit("setCaseID", caseID);
      this.$store.commit("setSessionID", sessionID);

      // Stop any ongoing intervals
      this.stopInterval();
    },

    async finishSession() {
      this.$store.commit("clearState");
      await this.$storageService.resetData();
      await this.$router.push("/");
    },

    async resetSession() {
      if (this.resetConfirmDialog) {
        this.resetConfirmDialog = false;
      }

      this.status = SESSION_STATUSES.PENDING;
      this.changeSessionStatus(SESSION_STATUSES.PENDING);

      this.timer = 0;
      this.isDuration = false;

      this.$store.commit("resetState");

      await this.$storageService.resetData();
      if (this.$isElectron) {
        await this.$electronService.setWindowSize({ width: 800, height: 600 });
      }
      this.stopInterval();
      const currentPath = this.$router.history.current.path;
      if (currentPath !== "/main") {
        await this.$router.push({ path: "/main" });
      }
    },
    getCurrentDateTime() {
      const now = new Date();
      const currentDateTime =
        String(now.getHours()).padStart(2, "0") +
        ":" +
        String(now.getMinutes()).padStart(2, "0") +
        " | " +
        String(now.getMonth() + 1).padStart(2, "0") +
        "-" +
        String(now.getDate()).padStart(2, "0") +
        "-" +
        now.getFullYear();
      return currentDateTime;
    },
    changeSessionStatus(status) {
      if (this.$isElectron) {
        this.$electronService.changeMenuBySessionStatus(status);
      }
    },
    async minimize() {
      const data = {
        status: this.status,
        timer: this.timer,
        duration: this.duration,
        sourceId: this.sourceId,
      };
      localStorage.setItem("state-data", JSON.stringify(data));
      if (this.$isElectron) {
        await this.$electronService.openMinimizeWindow();
      }
    },
  },
};
</script>

<style scoped>
.ddl-icon {
  margin-right: 0.25em;
}
.mini-ctrl-wrapper {
  display: flex;
  flex-direction: column;
  column-gap: 5px;
  width: 100%;
}
.nml-ctrl-wrapper .control-btn-wrapper {
  background: #f3f4f6;
}
.v-btn--disabled img {
  opacity: 0.5;
}
.theme--dark .control-btn-wrapper {
  background-color: #374151;
}
.theme--dark .control-btn {
  background-color: #4b5563;
  border-color: #4b5563;
}
</style>
