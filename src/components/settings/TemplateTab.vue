<template>
  <v-container class="content-wrapper">
    <div class="title">{{ $tc("caption.note_template", 1) }}</div>
    <p class="subtitle-1 mb-4" :style="{ color: currentTheme.default }">
      {{ $t("message.improve_note") }}
    </p>

    <v-row v-if="template">
      <v-col cols="12" class="pa-4">
        <div class="mb-3 session-type">
          <p class="subtitle-1 mb-1" :style="{ color: currentTheme.secondary }">
            {{ $tc("caption.apply_to", 1) }}
          </p>
          <v-select
            :items="evidenceTypes"
            v-model="type"
            :placeholder="$tc('caption.session_type', 1)"
            solo
            dense
            hide-details="true"
            @change="handleTemplate"
          ></v-select>
        </div>
        <div class="mb-3 precond">
          <v-tiptap
            label="Text"
            v-model="template.content"
            :placeholder="$t('message.default_template_text')"
            ref="text"
            :toolbar="[
              'headings',
              '|',
              'bold',
              'italic',
              'underline',
              '|',
              'color',
              '|',
              'bulletList',
              'orderedList',
              '|',
              'link',
              'emoji',
              'blockquote',
            ]"
            @input="updateText"
          >
          </v-tiptap>
        </div>
        <!--
        <div class="mb-3 issue">
          <div class="subtitle-2 label-text">Issue</div>
          <v-text-field
            :placeholder="$t('message.enter_title_for_project')"
            outlined
            dense
            :height="32"
            v-model="template.issue"
            hide-details="true"
          ></v-text-field>
        </div>
        <div class="mb-7 bug">
          <div class="subtitle-2 label-text">{{ $tc("caption.bug", 1) }}</div>
          <v-radio-group
            v-model="template.isBug"
            row
            class="ma-0 pa-0 radio-control"
            dense
            hide-details
          >
            <v-radio label="Yes" :value="true"></v-radio>
            <v-radio label="No" :value="false"></v-radio>
          </v-radio-group>
        </div>
        -->
        <div class="footer">
          <v-row>
            <v-col cols="6 pr-2">
              <v-btn
                small
                block
                color="white"
                class="text-capitalize"
                :style="{ color: currentTheme.black }"
                @click="handleCancel"
              >
                {{ $tc("caption.cancel", 1) }}
              </v-btn>
            </v-col>
            <v-col cols="6 pl-2">
              <v-btn
                small
                block
                color="primary"
                class="text-capitalize"
                @click="saveTemplate"
              >
                {{ $tc("caption.save_template", 1) }}
              </v-btn>
            </v-col>
          </v-row>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { mapGetters } from "vuex";
export default {
  name: "TemplateTab",
  components: {},
  props: {},
  computed: {
    ...mapGetters({
      config: "config/fullConfig",
    }),
    currentTheme() {
      if (this.$vuetify.theme.dark) {
        return this.$vuetify.theme.themes.dark;
      } else {
        return this.$vuetify.theme.themes.light;
      }
    },
  },
  data() {
    return {
      templatesToChange: null,
      configToChange: null,
      template: null,
      type: null,
      evidenceTypes: null,
    };
  },
  mounted() {
    this.templatesToChange = structuredClone(this.config.templates);
    this.configToChange = structuredClone(this.config);
    this.template = Object.values(this.configToChange.templates)[0];
    this.type = Object.keys(this.configToChange.templates)[0];
    this.evidenceTypes = Object.keys(this.configToChange.templates);
  },
  methods: {
    updateText() {
      const regex = /(<([^>]+)>)/gi;
      this.template.text = this.template.content.replace(regex, "");
    },
    handleTemplate() {
      this.template = Object.assign({}, this.templatesToChange[this.type]);
    },
    handleCancel() {
      this.template = Object.values(this.templatesToChange)[0];
      this.type = Object.keys(this.templatesToChange)[0];
    },
    saveTemplate() {
      this.templatesToChange[this.type] = this.template;
      this.configToChange.templates = this.templatesToChange;
      this.$emit("submit-config", this.configToChange);
      this.$root.$emit(
        "set-snackbar",
        this.$tc("caption.successfully_saved", 1)
      );
    },
  },
};
</script>
<style scoped>
.content-wrapper {
  width: 100%;
  overflow-y: auto;
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
}
.caption {
  font-style: normal !important;
  font-weight: 500 !important;
  font-size: 13px !important;
  line-height: 16px !important;
  color: #6b7280;
}
</style>
