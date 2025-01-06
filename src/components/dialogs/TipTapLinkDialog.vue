<template>
  <v-dialog
    v-model="dialog"
    persistent
    width="480px"
    content-class="rounded-lg link-dialog"
  >
    <v-sheet outlined class="rounded-lg">
      <v-card>
        <v-card-title>{{ title }}</v-card-title>
        <v-card-text>
          <v-text-field
            v-model="input"
            :placeholder="placeholder"
            autofocus
            class="rounded-lg mb-5"
            hide-details
            :background-color="inputBg"
            dense
            height="40px"
            flat
            solo
            label="URL"
          ></v-text-field>
        </v-card-text>
        <v-card-actions>
          <div class="row">
            <v-col cols="6">
              <v-btn
                :color="btnBg"
                depressed
                class="text-capitalize rounded-lg"
                @click="close(null)"
                width="100%"
                height="40px"
              >
                {{ $tc("cancel", 1) }}
              </v-btn>
            </v-col>
            <v-col cols="6">
              <v-btn
                ref="confirmBtn"
                :color="currentTheme.primary"
                depressed
                class="text-capitalize rounded-lg white--text"
                @click="close(input)"
                width="100%"
                height="40px"
              >
                {{ $tc("confirm", 1) }}
              </v-btn>
            </v-col>
          </div>
        </v-card-actions>
      </v-card>
    </v-sheet>
  </v-dialog>
</template>

<script>
import theme from "../../mixins/theme";

export default {
  props: {
    placeholder: {
      type: String,
    },
  },
  mixins: [theme],
  data() {
    return {
      dialog: false,
      title: "",
      input: "",
    };
  },
  methods: {
    open({ title, value }) {
      this.title = title;
      this.input = value || "";
      this.dialog = true;
      return new Promise((resolve) => {
        this.$once("close", (result) => resolve(result));
      });
    },
    close(result) {
      this.dialog = false;
      this.$emit("close", result);
    },
  },
};
</script>
