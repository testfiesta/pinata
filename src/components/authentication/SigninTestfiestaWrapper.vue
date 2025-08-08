<template>
  <v-container class="wrapper">
    <div class="header py-4">
      <v-btn class="text-capitalize pa-0 back-btn" plain @click="back()">
        <v-icon class="ma-0">mdi-chevron-left</v-icon>
        {{ $tc("caption.back", 1) }}
      </v-btn>
      <div class="subtitle-1 signup-title text-center">
        <span>{{ $tc("caption.signin_testfiesta", 1) }}</span>
      </div>
    </div>
    <div class="content mt-2">
      <v-form ref="form" v-model="valid" lazy-validation>
        <v-row>
          <v-col cols="12" class="d-flex justify-center pa-0">
            <img
              :src="require('../../assets/icon/testfiesta.png')"
              alt="testfiesta"
              width="60"
            />
          </v-col>
          <v-col cols="12" class="pa-0">
            <div class="subtitle-2 label-text">
              {{ $tc("caption.user_name", 1) }}
            </div>
            <div class="timer-box-wrapper">
              <v-text-field
                placeholder="test@example.com"
                outlined
                dense
                v-model="username"
                required
                :rules="rules.username"
              />
            </div>
          </v-col>
          <v-col cols="12" class="pa-0">
            <div class="subtitle-2 label-text">
              {{ $tc("caption.password", 1) }}
            </div>
            <div class="timer-box-wrapper">
              <v-text-field
                :append-icon="showEye ? 'mdi-eye' : 'mdi-eye-off'"
                outlined
                dense
                :type="showEye ? 'text' : 'password'"
                v-model="password"
                required
                :rules="rules.password"
                @click:append="showEye = !showEye"
              />
            </div>
          </v-col>
          <v-col cols="12" class="pa-0">
            <v-btn
              class="text-capitalize btn_signup"
              color="primary"
              fill
              small
              block
              :loading="loading"
              @click="signIn()"
            >
              {{ $tc("caption.sign_in", 1) }}
            </v-btn>
          </v-col>
        </v-row>
      </v-form>
    </div>
    <v-snackbar v-model="snackBar.enabled" timeout="3000">
      {{ snackBar.message }}
      <template v-slot:action="{ attrs }">
        <v-btn
          color="primary"
          text
          v-bind="attrs"
          @click="snackBar.enabled = false"
        >
          Close
        </v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>
<script>
import axios from "axios";
import dayjs from "dayjs";
import testfiestaIntegrationHelper from "../../integrations/TestfiestaIntegrationHelpers";
import { mapGetters } from "vuex";

export default {
  name: "SigninTestfiestaWrapper",
  props: {
    prevRoute: {
      type: Object,
      default: () => {},
    },
  },
  watch: {
    prevRoute: function (newValue) {
      this.previousRoute = newValue;
    },
  },
  computed: {
    ...mapGetters({
      credentials: "auth/credentials",
    }),
  },
  data() {
    return {
      previousRoute: this.prevRoute,
      username: "",
      password: "",
      showEye: false,
      loading: false,
      valid: true,
      rules: {
        // TODO - fix rules per actual requirements
        username: [
          (v) => !!v || "Username is required",
          (v) =>
            !v ||
            //  /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v) ||
            /.*/.test(v) ||
            "Username must be valid",
        ],
        password: [(v) => !!v || "Password is required"],
      },
      snackBar: {
        enabled: false,
        message: "",
      },
    };
  },
  methods: {
    back() {
      this.$router.back();
    },
    async signIn() {
      const isValid = this.$refs.form.validate();
      if (isValid) {
        this.loading = true;
        this.$root.$emit("overlay", true);
        const url = `${process.env.TESTFIESTA_API_URL}/app/signin`;
        await axios
          .post(url, {
            email: this.username,
            password: this.password,
          })
          .then((response) => {
            const date = dayjs().format("YYYY-MM-DD HH:mm:ss");
            const testfiestaData = {
              ...response.data,
              type: "bearer",
              loggedInAt: date,
            };

            this.credentials = testfiestaIntegrationHelper.saveCredentials(
              this.credentials,
              testfiestaData
            );

            this.snackBar.enabled = true;
            this.snackBar.message = this.$tc("caption.log_in_successful", 1);
            setTimeout(() => {
              this.loading = false;
              this.$root.$emit("overlay", false);

              this.back();
            }, 1000);
          })
          .catch((error) => {
            this.loading = false;
            this.$root.$emit("overlay", false);
            this.snackBar.enabled = true;
            this.snackBar.message = error
              ? error
              : this.$tc("caption.log_in_failed", 1);
          });
      }
    },
  },
};
</script>
<style scoped>
.wrapper {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100%;
  overflow-y: auto;
  max-width: 450px;
}
.header {
  display: flex;
  align-items: center;
  padding: 12px;
}
.header .back-btn {
  flex-grow: 0;
  display: flex;
  align-items: center;
  font-size: 14px;
  font-style: normal;
  font-weight: 500;
  line-height: 20px;
}
.header .signup-title {
  flex-grow: 1;
  font-style: normal;
  font-weight: 600;
  font-size: 16px;
  line-height: 24px;
  color: #111827;
  text-align: center;
}
.header .signup-title span {
  margin-left: -50px;
}
.content {
  background-color: #fff;
  border-radius: 8px;
  padding: 32px 40px;
}
</style>
