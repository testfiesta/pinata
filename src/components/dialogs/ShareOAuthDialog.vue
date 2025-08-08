<template>
  <v-dialog
    v-bind="$attrs"
    v-on="$listeners"
    persistent
    width="100%"
    max-width="400px"
    eager
  >
    <v-sheet outlined rounded>
      <v-container>
        <v-card>
          <v-card-title class="body-1">
            {{ $tc("caption.custom_oauth_connections", 1) }}
          </v-card-title>
          <v-divider></v-divider>
          <v-container class="oauth-credentials-wrapper">
            <v-row>
              <v-col cols="12">
                <div v-if="serverOAuthCredentials.length > 0">
                  <div
                    v-for="(credential, i) in serverOAuthCredentials"
                    :key="i"
                  >
                    <v-card>
                      <div class="caption label-text">
                        <strong>{{ $tc("caption.instance_url", 1) }}</strong>
                        : {{ credential.url }}
                      </div>
                      <div class="caption label-text">
                        <strong>{{ $tc("caption.client_id", 1) }}</strong>
                        : {{ credential.clientId }}
                      </div>
                      <div class="caption label-text">
                        <strong>{{ $tc("caption.client_secret", 1) }}</strong>
                        : {{ credential.clientSecret }}
                      </div>
                    </v-card>
                  </div>
                </div>
                <div v-else>
                  <v-card>
                    <div class="caption label-text">
                      <strong>
                        {{ $tc("caption.no_server_oauth_creds", 1) }}
                      </strong>
                    </div>
                  </v-card>
                </div>
              </v-col>
            </v-row>
          </v-container>
          <v-divider></v-divider>
          <v-card-actions>
            <v-row class="action-wrapper">
              <v-col cols="6 pr-1">
                <v-btn
                  class="btn"
                  small
                  block
                  color="white"
                  @click="handleDone"
                >
                  {{ $tc("caption.done", 1) }}
                </v-btn>
              </v-col>
            </v-row>
          </v-card-actions>
        </v-card>
      </v-container>
    </v-sheet>
  </v-dialog>
</template>

<script>
import { mapGetters } from "vuex";

export default {
  name: "ShareOAuthDialog",
  components: {},
  props: {
    serverOAuthCredentials: {
      type: Array,
    },
  },
  computed: {
    ...mapGetters({
      credentials: "auth/credentials",
    }),
  },
  methods: {
    async handleDone() {
      this.$emit("close");
    },
  },
};
</script>
<style scoped>
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
</style>
