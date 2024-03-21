<template>
  <v-container class="wrapper">
    <div class="title">{{ $tc("caption.session_checklist", 1) }}</div>
    <p class="mt-2 mb-4">
      {{ $t("message.use_pre_post_test_checklist") }}
    </p>
    <div class="tab-bar">
      <v-tabs :height="26" hide-slider>
        <v-tab
          @click="tab = 'pre'"
          class="text-capitalize"
          :style="{ color: currentTheme.secondary }"
        >
          {{ $tc("caption.pre_session", 1) }}
        </v-tab>
        <v-tab
          @click="tab = 'post'"
          class="text-capitalize"
          :style="{ color: currentTheme.secondary }"
        >
          {{ $tc("caption.post_session", 1) }}
        </v-tab>
      </v-tabs>
    </div>
    <v-tabs-items v-model="tab">
      <v-tab-item class="presession-wrapper" value="pre" :transition="false">
        <div class="status">
          <v-switch
            :input-value="checklistPresessionStatus"
            :value="checklistPresessionStatus"
            inset
            hide-details
            dense
            class="mt-0 pt-0"
            @change="togglePresessionStatus"
          />
          <label>{{ $tc("caption.enable_checklist", 1) }}</label>
        </div>
        <div class="content">
          <div class="overlay" v-show="!checklistPresessionStatus">&nbsp;</div>
          <div class="check-list">
            <div
              class="one"
              v-for="task in checklistPresessionTasks"
              :key="task.id"
            >
              <div class="input-box">
                <input
                  type="text"
                  placeholder="Add task"
                  @input="
                    (evt) =>
                      $store.commit('config/editPresessionTaskContent', {
                        id: task.id,
                        content: evt.target.value,
                      })
                  "
                  :value="task.content"
                />
                <div class="check-box">
                  <input
                    type="checkbox"
                    class="item-select"
                    :value="task.required"
                    :checked="task.required"
                    @change="
                      (evt) =>
                        $store.commit('config/editPresessionTaskRequired', {
                          id: task.id,
                          value: evt.target.checked,
                        })
                    "
                  />
                  <span class="label">{{ $tc("caption.required", 1) }}</span>
                </div>
              </div>
              <div class="func-box">
                <v-icon
                  @click="$store.commit('config/deletePresessionTask', task.id)"
                  >mdi-delete</v-icon
                >
              </div>
            </div>
          </div>
          <div class="footer">
            <button
              class="link"
              @click="addTask"
              :style="{ color: currentTheme.secondary }"
            >
              {{ $tc("caption.add_another_task", 1) }}
            </button>
          </div>
        </div>
      </v-tab-item>
      <v-tab-item class="postsession-wrapper" value="post" :transition="false">
        <div class="status">
          <v-switch
            :value="checklistPostsessionStatus"
            :input-value="checklistPostsessionStatus"
            inset
            hide-details
            dense
            class="mt-0 pt-0"
            @change="togglePostsessionStatus"
          />
          <label>{{ $tc("caption.enable_checklist", 1) }}</label>
        </div>
        <div class="content">
          <div class="overlay" v-show="!checklistPostsessionStatus">&nbsp;</div>
          <div class="check-list">
            <div
              class="one"
              v-for="(task, index) in checklistPostsessionTasks"
              :key="task.id"
            >
              <div class="input-box">
                <input
                  type="text"
                  placeholder="Add task"
                  @input="
                    (evt) =>
                      $store.commit('config/editPostsessionTaskContent', {
                        id: task.id,
                        content: evt.target.value,
                      })
                  "
                  :value="task.content"
                />
                <div class="check-box">
                  <input
                    type="checkbox"
                    class="item-select"
                    :value="task.required"
                    :checked="task.required"
                    @input="
                      (evt) =>
                        $store.commit('config/editPostsessionTaskRequired', {
                          id: task.id,
                          value: evt.target.checked,
                        })
                    "
                  />
                  <span class="label">{{ $tc("caption.required", 1) }}</span>
                </div>
              </div>
              <div
                class="func-box"
                v-if="
                  (index === 0 && task.content !== '') ||
                  checklistPostsessionTasks.length > 1
                "
              >
                <v-icon
                  @click="
                    $store.commit('config/deletePostsessionTask', task.id)
                  "
                  >mdi-delete</v-icon
                >
              </div>
            </div>
          </div>
          <div class="footer">
            <button class="link" @click="addTask">
              {{ $tc("caption.add_another_task", 1) }}
            </button>
          </div>
        </div>
      </v-tab-item>
    </v-tabs-items>
    <!-- <div class="footer">
      <v-btn color="primary white__text text-capitalize" block>
        {{ $tc("caption.end_session", 1) }}
      </v-btn>
    </div> -->
  </v-container>
</template>
<script>
import { mapGetters } from "vuex";

export default {
  name: "ConfigCheckListTab",
  components: {},
  props: {},
  data() {
    return {
      tab: "pre",
    };
  },
  computed: {
    ...mapGetters({
      config: "config/fullConfig",
      checklistPresessionStatus: "config/checklistPresessionStatus",
      checklistPresessionTasks: "config/checklistPresessionTasks",
      checklistPostsessionTasks: "config/checklistPostsessionTasks",
      checklistPostsessionStatus: "config/checklistPostsessionStatus",
    }),
    currentTheme() {
      if (this.$vuetify.theme.dark) {
        return this.$vuetify.theme.themes.dark;
      } else {
        return this.$vuetify.theme.themes.light;
      }
    },
  },
  methods: {
    addTask: function () {
      if (this.tab === "pre") {
        this.$store.commit("config/addPresessionTask", {
          id: new Date().getTime(),
          content: "",
          required: false,
        });
      } else {
        this.$store.commit("config/addPostsessionTask", {
          id: new Date().getTime(),
          content: "",
          required: false,
        });
      }
    },
    togglePresessionStatus(value) {
      this.$store.commit("config/setPresessionStatus", !!value);
    },
    togglePostsessionStatus(value) {
      this.$store.commit("config/setPostsessionStatus", !!value);
    },
  },
};
</script>
<style scoped>
.wrapper {
  position: relative;
  display: flex;
  flex-direction: column;
  padding: 25px;
}
.tab-bar {
  margin-top: 20px;
}
.row {
  display: flex;
  column-gap: 10px;
}
.title {
  font-size: 14px;
  font-weight: 600;
  line-height: 20px;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}
.link {
  background-color: transparent !important;
  border: 0;
  outline: 0;
  color: #6d28d9;
  margin-top: 15px;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}
.status {
  padding-left: 10px;
  padding-top: 10px;

  display: flex;
  align-items: center;
}
.status > label {
  margin-top: -3px;
  font-style: normal;
  font-weight: 500;
  font-size: 13px;
  line-height: 16px;
  color: #6b7280;
}
.content {
  position: relative;
}
.content .overlay {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  z-index: 1;
  background-color: rgba(255, 255, 255, 0);
}
.check-list {
  display: flex;
  flex-direction: column;
  margin-top: 15px;
  max-height: 55vh;
  overflow-y: auto;
  row-gap: 10px;
  padding: 0 20px 0 0;
}
.check-list > .one {
  display: flex;
  justify-content: space-between;
  column-gap: 10px;
}
.check-list > .one > .input-box {
  display: flex;
  border: 0;
  column-gap: 10px;
  width: 400px;
}
.check-list > .one > .input-box > input {
  display: inline-flex;
  width: 100%;
  height: 32px;
  padding: 8px;

  justify-content: flex-start;
  align-items: center;
  background-color: white;
  border: 1px solid #d1d5db;
  box-shadow: 0px 1px 2px rgba(0, 0, 0, 0.05);
  border-radius: 6px;
  outline: 0;

  font-weight: 500;
  font-size: 13px;
  line-height: 16px;
  color: #6b7280;
}
.theme--dark .check-list > .one > .input-box > input[type="text"] {
  background-color: #6b7280;
  border: 0;
  color: white;
}
.check-list > .one > .input-box > .check-box {
  display: flex;
  column-gap: 10px;
  align-items: center;
}
.check-list > .one > .input-box > .check-box > .label {
  font-size: 14px;
  font-weight: 500;
  line-height: 20px;
  color: #6b7280;
}
.check-list > .one > .func-box {
  display: flex;
  justify-content: center;
  align-items: center;
}
.footer {
  display: block;
  width: calc(100% - 40px);
}
.footer > button {
  max-width: 60% !important;
}

.v-tab {
  line-height: 1.2;
}
.v-tab.v-tab--active {
  color: #6d28d9 !important;
}
</style>
