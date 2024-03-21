<template>
  <v-container class="timeline-wrapper">
    <v-row>
      <v-col cols="12">
        <div
          class="subtitle-2 label-text"
          :style="{ color: currentTheme.secondary }"
        >
          {{ $tc("caption.session_started", 1) }}
        </div>
        <div class="mt-2 date-text">
          <v-icon>mdi-calendar-minus-outline</v-icon>
          <span v-if="$store.state.session.started">{{
            $store.state.session.started
          }}</span>
          <span v-else>{{ current }}</span>
        </div>
        <div
          class="timeline-wrap pt-3"
          @dragenter="dragEnter($event)"
          @dragleave="dragLeave($event)"
          @dragover="dragOver($event)"
          @drop="dropFile($event)"
        >
          <v-timeline align-top dense class="pt-0">
            <v-timeline-item
              class="timeline-item"
              color="primary"
              icon="mdi-play-circle"
              fill-dot
            >
              <div class="duration-text">
                <v-icon>mdi-clock-outline</v-icon>
                <span>{{ formatTime(0) }}</span>
              </div>
            </v-timeline-item>
            <draggable
              v-if="itemLists.length"
              v-model="itemLists"
              draggable=".drag-item"
              :animation="200"
              @change="handleChange"
            >
              <div
                v-for="(item, i) in itemLists"
                :key="i"
                :class="`drag-item`"
                @dragstart="dragStartHandler"
              >
                <v-timeline-item
                  v-if="getType(item.fileType) === 'image'"
                  color="primary"
                  icon="mdi-camera-plus"
                  fill-dot
                >
                  <div class="d-flex flex-column screenshot">
                    <div class="d-flex justify-space-between py-2">
                      <div class="duration-text">
                        <v-icon>mdi-clock-outline</v-icon>
                        <span>{{ formatTime(item.timer_mark) }}</span>
                        <span class="filename-text">({{ item.fileName }})</span>
                      </div>
                      <div class="d-flex align-center">
                        <input
                          type="checkbox"
                          class="item-select"
                          :value="item.stepID"
                          :checked="checkedItem(item.stepID)"
                          @change="handleSelected($event, item.stepID)"
                        />
                      </div>
                    </div>
                    <div
                      class="image-wrapper"
                      @click="handleItemClick(item.stepID)"
                    >
                      <img
                        class="screen-img"
                        style="max-width: 100%"
                        :src="
                          $isElectron
                            ? `file://${item.filePath}`
                            : `${item.filePath}`
                        "
                      />
                    </div>
                    <div class="comment-wrapper mt-2 mb-2 test">
                      <font-awesome-icon
                        :icon="textTypes[item.comment.type].icon"
                        class="mr-1"
                        :style="{
                          borderColor: textTypes[item.comment.type].fill,
                          color: textTypes[item.comment.type].fill,
                        }"
                        :border="true"
                      />
                      <span
                        class="comment-type"
                        :style="{ color: currentTheme.secondary }"
                      >
                        {{ item.comment.type }}:
                      </span>
                      <span v-html="item.comment.content"></span>
                    </div>
                    <div v-if="item.tags.length" class="tags-wrapper my-2">
                      <v-chip
                        v-for="(tag, i) in item.tags"
                        :key="i"
                        class="tag"
                        small
                        color="#fee2e2"
                        text-color="#991b1b"
                      >
                        {{ tag.text }}
                      </v-chip>
                    </div>
                    <div class="actions-wrapper">
                      <template v-if="item.emoji.length">
                        <v-btn
                          rounded
                          color="primary"
                          class="pa-0 mb-1"
                          height="26"
                          min-width="45"
                          style=""
                          v-for="(emoji, i) in item.emoji"
                          :key="i"
                          @click="removeEmoji(item.stepID, emoji)"
                        >
                          <span class="emoji-icon">{{ emoji.data }}</span>
                          <v-icon x-small>mdi-close</v-icon>
                        </v-btn>
                      </template>

                      <v-menu
                        v-model="emojiMenu[`menu-` + item.stepID]"
                        :close-on-content-click="false"
                        right
                        bottom
                        nudge-bottom="4"
                        offset-y
                      >
                        <template v-slot:activator="{ on: menu }">
                          <v-tooltip bottom>
                            <template v-slot:activator="{ on: tooltip }">
                              <v-btn
                                rounded
                                class="pa-0 mb-1"
                                height="26"
                                min-width="35"
                                v-on="{
                                  ...menu,
                                  ...tooltip,
                                }"
                                @click="handleSelectedItem(item.stepID)"
                              >
                                <img
                                  :src="
                                    require('../assets/icon/add-emoticon.svg')
                                  "
                                  width="24"
                                  height="24"
                                />
                              </v-btn>
                            </template>
                            <span>{{ $tc("caption.add_reaction", 1) }}</span>
                          </v-tooltip>
                        </template>
                        <v-card class="emoji-lookup">
                          <VEmojiPicker
                            labelSearch="Search"
                            lang="en-US"
                            @select="selectEmoji"
                          />
                        </v-card>
                      </v-menu>
                    </div>
                    <div class="check-box mt-1">
                      <label
                        ><input
                          type="checkbox"
                          name="follow_up"
                          class="item-select"
                          v-model="item.followUp"
                          @change="handleFollowUp($event, item.stepID)"
                        />{{ $tc("caption.required_follow_up", 1) }}
                      </label>
                    </div>
                  </div>
                </v-timeline-item>
                <v-timeline-item
                  v-if="getType(item.fileType) === 'video'"
                  color="primary"
                  icon="mdi-video"
                  fill-dot
                >
                  <div class="d-flex flex-column">
                    <div class="d-flex justify-space-between py-2">
                      <div class="duration-text">
                        <v-icon>mdi-clock-outline</v-icon>
                        <span>{{ formatTime(item.timer_mark) }}</span>
                        <span class="filename-text">({{ item.fileName }})</span>
                      </div>
                      <div class="d-flex align-center">
                        <input
                          type="checkbox"
                          class="item-select"
                          :value="item.stepID"
                          :checked="checkedItem(item.stepID)"
                          @change="handleSelected($event, item.stepID)"
                        />
                      </div>
                    </div>
                    <div
                      class="video-wrapper"
                      @click.prevent="handleItemClick(item.stepID)"
                    >
                      <video
                        controls
                        style="width: 100%"
                        :src="
                          $isElectron
                            ? `file://${item.filePath}`
                            : `${item.filePath}`
                        "
                      ></video>
                    </div>
                    <div class="comment-wrapper mt-2 mb-2">
                      <font-awesome-icon
                        :icon="textTypes[item.comment.type].icon"
                        class="mr-1"
                        :style="{
                          borderColor: textTypes[item.comment.type].fill,
                          color: textTypes[item.comment.type].fill,
                        }"
                        :border="true"
                      />
                      <span
                        class="comment-type"
                        :style="{ color: currentTheme.secondary }"
                      >
                        {{ item.comment.type }}:
                      </span>
                      <span v-html="item.comment.content"></span>
                    </div>
                    <div v-if="item.tags.length" class="tags-wrapper my-2">
                      <v-chip
                        v-for="(tag, i) in item.tags"
                        :key="i"
                        class="tag"
                        small
                        color="#fee2e2"
                        text-color="#991b1b"
                      >
                        {{ tag.text }}
                      </v-chip>
                    </div>
                    <div class="actions-wrapper">
                      <template v-if="item.emoji.length">
                        <v-btn
                          rounded
                          color="primary"
                          class="pa-0 mb-1"
                          height="26"
                          min-width="45"
                          style=""
                          v-for="(emoji, i) in item.emoji"
                          :key="i"
                          @click="removeEmoji(item.stepID, emoji)"
                        >
                          <span class="emoji-icon">{{ emoji.data }}</span>
                          <v-icon x-small>mdi-close</v-icon>
                        </v-btn>
                      </template>

                      <v-menu
                        v-model="emojiMenu[`menu-` + item.stepID]"
                        :close-on-content-click="false"
                        right
                        bottom
                        nudge-bottom="4"
                        offset-y
                      >
                        <template v-slot:activator="{ on: menu }">
                          <v-tooltip bottom>
                            <template v-slot:activator="{ on: tooltip }">
                              <v-btn
                                rounded
                                class="pa-0 mb-1"
                                height="26"
                                min-width="35"
                                v-on="{
                                  ...menu,
                                  ...tooltip,
                                }"
                                @click="handleSelectedItem(item.stepID)"
                              >
                                <img
                                  :src="
                                    require('../assets/icon/add-emoticon.svg')
                                  "
                                  width="24"
                                  height="24"
                                />
                              </v-btn>
                            </template>
                            <span>{{ $tc("caption.add_reaction", 1) }}</span>
                          </v-tooltip>
                        </template>
                        <v-card class="emoji-lookup">
                          <VEmojiPicker
                            labelSearch="Search"
                            lang="en-US"
                            @select="selectEmoji"
                          />
                        </v-card>
                      </v-menu>
                    </div>
                    <div class="check-box mt-1">
                      <label
                        ><input
                          type="checkbox"
                          name="follow_up"
                          class="item-select"
                          v-model="item.followUp"
                          @change="handleFollowUp($event, item.stepID)"
                        />{{ $tc("caption.required_follow_up", 1) }}
                      </label>
                    </div>
                  </div>
                </v-timeline-item>
                <v-timeline-item
                  v-if="getType(item.fileType) === 'audio'"
                  color="primary"
                  icon="mdi-microphone"
                  fill-dot
                >
                  <div class="d-flex flex-column">
                    <div class="d-flex justify-space-between py-2">
                      <div class="duration-text">
                        <v-icon>mdi-clock-outline</v-icon>
                        <span>{{ formatTime(item.timer_mark) }}</span>
                        <span class="filename-text">({{ item.fileName }})</span>
                      </div>
                      <div class="d-flex align-center">
                        <input
                          type="checkbox"
                          class="item-select"
                          :value="item.stepID"
                          :checked="checkedItem(item.stepID)"
                          @change="handleSelected($event, item.stepID)"
                        />
                      </div>
                    </div>
                    <div
                      class="audio-wrapper"
                      @click="handleItemClick(item.stepID)"
                    >
                      <div class="audio-wave">
                        <img
                          :src="
                            $isElectron
                              ? `file://${item.poster}`
                              : `${item.poster}`
                          "
                        />
                      </div>
                    </div>
                    <div class="comment-wrapper mt-2 mb-2">
                      <font-awesome-icon
                        :icon="textTypes[item.comment.type].icon"
                        class="mr-1"
                        :style="{
                          borderColor: textTypes[item.comment.type].fill,
                          color: textTypes[item.comment.type].fill,
                        }"
                        :border="true"
                      />
                      <span
                        class="comment-type"
                        :style="{ color: currentTheme.secondary }"
                      >
                        {{ item.comment.type }}:
                      </span>
                      <span v-html="item.comment.content"></span>
                    </div>
                    <div v-if="item.tags.length" class="tags-wrapper my-2">
                      <v-chip
                        v-for="(tag, i) in item.tags"
                        :key="i"
                        class="tag"
                        small
                        color="#fee2e2"
                        text-color="#991b1b"
                      >
                        {{ tag.text }}
                      </v-chip>
                    </div>
                    <div class="actions-wrapper">
                      <template v-if="item.emoji.length">
                        <v-btn
                          rounded
                          color="primary"
                          class="pa-0 mb-1"
                          height="26"
                          min-width="45"
                          style=""
                          v-for="(emoji, i) in item.emoji"
                          :key="i"
                          @click="removeEmoji(item.stepID, emoji)"
                        >
                          <span class="emoji-icon">{{ emoji.data }}</span>
                          <v-icon x-small>mdi-close</v-icon>
                        </v-btn>
                      </template>

                      <v-menu
                        v-model="emojiMenu[`menu-` + item.stepID]"
                        :close-on-content-click="false"
                        right
                        bottom
                        nudge-bottom="4"
                        offset-y
                      >
                        <template v-slot:activator="{ on: menu }">
                          <v-tooltip bottom>
                            <template v-slot:activator="{ on: tooltip }">
                              <v-btn
                                rounded
                                class="pa-0 mb-1"
                                height="26"
                                min-width="35"
                                v-on="{
                                  ...menu,
                                  ...tooltip,
                                }"
                                @click="handleSelectedItem(item.stepID)"
                              >
                                <img
                                  :src="
                                    require('../assets/icon/add-emoticon.svg')
                                  "
                                  width="24"
                                  height="24"
                                />
                              </v-btn>
                            </template>
                            <span>{{ $tc("caption.add_reaction", 1) }}</span>
                          </v-tooltip>
                        </template>
                        <v-card class="emoji-lookup">
                          <VEmojiPicker
                            labelSearch="Search"
                            lang="en-US"
                            @select="selectEmoji"
                          />
                        </v-card>
                      </v-menu>
                    </div>

                    <div class="check-box mt-1">
                      <label
                        ><input
                          type="checkbox"
                          name="follow_up"
                          class="item-select"
                          v-model="item.followUp"
                          @change="handleFollowUp($event, item.stepID)"
                        />{{ $tc("caption.required_follow_up", 1) }}
                      </label>
                    </div>
                  </div>
                </v-timeline-item>
                <v-timeline-item
                  v-if="getType(item.fileType) === 'text'"
                  color="primary"
                  icon="mdi-pencil"
                  fill-dot
                >
                  <div class="d-flex flex-column">
                    <div class="d-flex justify-space-between py-2">
                      <div class="duration-text">
                        <v-icon>mdi-clock-outline</v-icon>
                        <span>{{ formatTime(item.timer_mark) }}</span>
                      </div>
                      <div class="d-flex align-center">
                        <input
                          type="checkbox"
                          class="item-select"
                          :value="item.stepID"
                          :checked="checkedItem(item.stepID)"
                          @change="handleSelected($event, item.stepID)"
                        />
                      </div>
                    </div>
                    <div
                      class="note-wrapper"
                      @click="handleItemClick(item.stepID)"
                    >
                      <font-awesome-icon
                        :icon="textTypes[item.comment.type].icon"
                        class="mr-1"
                        :style="{
                          borderColor: textTypes[item.comment.type].fill,
                          color: textTypes[item.comment.type].fill,
                        }"
                        :border="true"
                      />
                      <span
                        class="comment-type"
                        :style="{ color: currentTheme.secondary }"
                      >
                        {{ item.comment.type }}:
                      </span>
                      <span v-html="item.comment.content"></span>
                    </div>
                    <div v-if="item.tags.length" class="tags-wrapper my-2">
                      <v-chip
                        v-for="(tag, i) in item.tags"
                        :key="i"
                        class="tag"
                        small
                        color="#fee2e2"
                        text-color="#991b1b"
                      >
                        {{ tag.text }}
                      </v-chip>
                    </div>
                    <div class="actions-wrapper">
                      <template v-if="item.emoji.length">
                        <v-btn
                          rounded
                          color="primary"
                          class="pa-0 mb-1"
                          height="26"
                          min-width="45"
                          style=""
                          v-for="(emoji, i) in item.emoji"
                          :key="i"
                          @click="removeEmoji(item.stepID, emoji)"
                        >
                          <span class="emoji-icon">{{ emoji.data }}</span>
                          <v-icon x-small>mdi-close</v-icon>
                        </v-btn>
                      </template>

                      <v-menu
                        v-model="emojiMenu[`menu-` + item.stepID]"
                        :close-on-content-click="false"
                        right
                        bottom
                        nudge-bottom="4"
                        offset-y
                      >
                        <template v-slot:activator="{ on: menu }">
                          <v-tooltip bottom>
                            <template v-slot:activator="{ on: tooltip }">
                              <v-btn
                                rounded
                                class="pa-0 mb-1"
                                height="26"
                                min-width="35"
                                v-on="{
                                  ...menu,
                                  ...tooltip,
                                }"
                                @click="handleSelectedItem(item.stepID)"
                              >
                                <img
                                  :src="
                                    require('../assets/icon/add-emoticon.svg')
                                  "
                                  width="24"
                                  height="24"
                                />
                              </v-btn>
                            </template>
                            <span>{{ $tc("caption.add_reaction", 1) }}</span>
                          </v-tooltip>
                        </template>
                        <v-card class="emoji-lookup">
                          <VEmojiPicker
                            labelSearch="Search"
                            lang="en-US"
                            @select="selectEmoji"
                          />
                        </v-card>
                      </v-menu>
                    </div>
                    <div class="check-box mt-1">
                      <label
                        ><input
                          type="checkbox"
                          name="follow_up"
                          class="item-select"
                          v-model="item.followUp"
                          @change="handleFollowUp($event, item.stepID)"
                        />{{ $tc("caption.required_follow_up", 1) }}
                      </label>
                    </div>
                  </div>
                </v-timeline-item>
                <v-timeline-item
                  v-if="
                    getType(item.fileType) === undefined &&
                    item.comment.type !== 'Summary'
                  "
                  color="primary"
                  icon="mdi-file"
                  fill-dot
                >
                  <div class="d-flex flex-column">
                    <div class="d-flex justify-space-between py-2">
                      <div class="duration-text">
                        <v-icon>mdi-clock-outline</v-icon>
                        <span> {{ formatTime(item.timer_mark) }}</span>
                        <span class="filename-text">({{ item.fileName }})</span>
                      </div>
                      <div class="d-flex align-center">
                        <input
                          type="checkbox"
                          class="item-select"
                          :value="item.stepID"
                          :checked="checkedItem(item.stepID)"
                          @change="handleSelected($event, item.stepID)"
                        />
                      </div>
                    </div>
                    <div
                      v-if="getType(item.fileType) === 'image'"
                      class="file-wrapper image"
                      @click="handleItemClick(item.stepID)"
                    >
                      <img
                        class="screen-img"
                        style="max-width: 100%"
                        :src="
                          this.$isElectron
                            ? `file://${item.filePath}`
                            : `${item.filePath}`
                        "
                      />
                    </div>
                    <div
                      v-else
                      class="file-wrapper file"
                      @click="handleItemClick(item.stepID)"
                    >
                      <div class="file-name">
                        <span>{{ item.fileName }}</span>
                      </div>
                      <div class="file-icon">
                        <v-icon medium>mdi-file</v-icon>
                      </div>
                    </div>
                    <div class="comment-wrapper mt-2 mb-2">
                      <font-awesome-icon
                        :icon="textTypes[item.comment.type].icon"
                        class="mr-1"
                        :style="{
                          borderColor: textTypes[item.comment.type].fill,
                          color: textTypes[item.comment.type].fill,
                        }"
                        :border="true"
                      />
                      <span
                        class="comment-type"
                        :style="{ color: currentTheme.secondary }"
                      >
                        {{ item.comment.type }}:
                      </span>
                      <span v-html="item.comment.content"></span>
                    </div>
                    <div v-if="item.tags.length" class="tags-wrapper my-2">
                      <v-chip
                        v-for="(tag, i) in item.tags"
                        :key="i"
                        class="tag"
                        small
                        color="#fee2e2"
                        text-color="#991b1b"
                      >
                        {{ tag.text }}
                      </v-chip>
                    </div>
                    <div class="actions-wrapper">
                      <template v-if="item.emoji.length">
                        <v-btn
                          rounded
                          color="primary"
                          class="pa-0 mb-1"
                          height="26"
                          min-width="45"
                          style=""
                          v-for="(emoji, i) in item.emoji"
                          :key="i"
                          @click="removeEmoji(item.stepID, emoji)"
                        >
                          <span class="emoji-icon">{{ emoji.data }}</span>
                          <v-icon x-small>mdi-close</v-icon>
                        </v-btn>
                      </template>

                      <v-menu
                        v-model="emojiMenu[`menu-` + item.stepID]"
                        :close-on-content-click="false"
                        right
                        bottom
                        nudge-bottom="4"
                        offset-y
                      >
                        <template v-slot:activator="{ on: menu }">
                          <v-tooltip bottom>
                            <template v-slot:activator="{ on: tooltip }">
                              <v-btn
                                rounded
                                class="pa-0 mb-1"
                                height="26"
                                min-width="35"
                                v-on="{
                                  ...menu,
                                  ...tooltip,
                                }"
                                @click="handleSelectedItem(item.stepID)"
                              >
                                <img
                                  :src="
                                    require('../assets/icon/add-emoticon.svg')
                                  "
                                  width="24"
                                  height="24"
                                />
                              </v-btn>
                            </template>
                            <span>{{ $tc("caption.add_reaction", 1) }}</span>
                          </v-tooltip>
                        </template>
                        <v-card class="emoji-lookup">
                          <VEmojiPicker
                            labelSearch="Search"
                            lang="en-US"
                            @select="selectEmoji"
                          />
                        </v-card>
                      </v-menu>
                    </div>
                    <div class="check-box mt-1">
                      <label
                        ><input
                          type="checkbox"
                          name="follow_up"
                          class="item-select"
                          v-model="item.followUp"
                          @change="handleFollowUp($event, item.stepID)"
                        />{{ $tc("caption.required_follow_up", 1) }}
                      </label>
                    </div>
                  </div>
                </v-timeline-item>
                <v-timeline-item
                  v-if="getType(item.fileType) === 'mindmap'"
                  color="primary"
                  icon="mdi-camera-plus"
                  fill-dot
                >
                  <div class="d-flex flex-column map-wrapper">
                    <div class="d-flex justify-space-between py-2">
                      <div class="duration-text">
                        <v-icon>mdi-clock-outline</v-icon>
                        <span>{{ formatTime(item.timer_mark) }}</span>
                        <span class="filename-text">({{ item.fileName }})</span>
                      </div>
                      <div class="d-flex align-center">
                        <input
                          type="checkbox"
                          class="item-select"
                          :value="item.stepID"
                          :checked="checkedItem(item.stepID)"
                          @change="handleSelected($event, item.stepID)"
                        />
                      </div>
                    </div>
                    <div
                      class="image-wrapper"
                      @click="handleItemClick(item.stepID)"
                    >
                      <img
                        class="screen-img"
                        style="max-width: 100%"
                        :src="
                          $isElectron
                            ? `file://${item.filePath}`
                            : `${item.filePath}`
                        "
                      />
                    </div>
                    <div class="comment-wrapper mt-2 mb-2">
                      <font-awesome-icon
                        :icon="textTypes[item.comment.type].icon"
                        class="mr-1"
                        :style="{
                          borderColor: textTypes[item.comment.type].fill,
                          color: textTypes[item.comment.type].fill,
                        }"
                        :border="true"
                      />
                      <span
                        class="comment-type"
                        :style="{ color: currentTheme.secondary }"
                      >
                        {{ item.comment.type }}:
                      </span>
                      <span v-html="item.comment.content"></span>
                    </div>
                    <div v-if="item.tags.length" class="tags-wrapper my-2">
                      <v-chip
                        v-for="(tag, i) in item.tags"
                        :key="i"
                        class="tag"
                        small
                        color="#fee2e2"
                        text-color="#991b1b"
                      >
                        {{ tag.text }}
                      </v-chip>
                    </div>
                    <div class="actions-wrapper">
                      <template v-if="item.emoji.length">
                        <v-btn
                          rounded
                          color="primary"
                          class="pa-0 mb-1"
                          height="26"
                          min-width="45"
                          style=""
                          v-for="(emoji, i) in item.emoji"
                          :key="i"
                          @click="removeEmoji(item.stepID, emoji)"
                        >
                          <span class="emoji-icon">{{ emoji.data }}</span>
                          <v-icon x-small>mdi-close</v-icon>
                        </v-btn>
                      </template>

                      <v-menu
                        v-model="emojiMenu[`menu-` + item.stepID]"
                        :close-on-content-click="false"
                        right
                        bottom
                        nudge-bottom="4"
                        offset-y
                      >
                        <template v-slot:activator="{ on: menu }">
                          <v-tooltip bottom>
                            <template v-slot:activator="{ on: tooltip }">
                              <v-btn
                                rounded
                                class="pa-0 mb-1"
                                height="26"
                                min-width="35"
                                v-on="{
                                  ...menu,
                                  ...tooltip,
                                }"
                                @click="handleSelectedItem(item.stepID)"
                              >
                                <img
                                  :src="
                                    require('../assets/icon/add-emoticon.svg')
                                  "
                                  width="24"
                                  height="24"
                                />
                              </v-btn>
                            </template>
                            <span>{{ $tc("caption.add_reaction", 1) }}</span>
                          </v-tooltip>
                        </template>
                        <v-card class="emoji-lookup">
                          <VEmojiPicker
                            labelSearch="Search"
                            lang="en-US"
                            @select="selectEmoji"
                          />
                        </v-card>
                      </v-menu>
                    </div>
                    <div class="check-box mt-1">
                      <label
                        ><input
                          type="checkbox"
                          name="follow_up"
                          class="item-select"
                          v-model="item.followUp"
                          @change="handleFollowUp($event, item.stepID)"
                        />{{ $tc("caption.required_follow_up", 1) }}
                      </label>
                    </div>
                  </div>
                </v-timeline-item>
                <v-timeline-item
                  v-if="item.comment.type === 'Summary' && item.comment.text"
                  color="primary"
                  icon="mdi-pencil"
                  fill-dot
                >
                  <div class="d-flex flex-column">
                    <div class="d-flex justify-space-between py-2">
                      <div class="duration-text">
                        <v-icon>mdi-clock-outline</v-icon>
                        <span>{{ formatTime(item.timer_mark) }}</span>
                      </div>
                      <div class="d-flex align-center">
                        <input
                          type="checkbox"
                          class="item-select"
                          :value="item.stepID"
                          :checked="checkedItem(item.stepID)"
                          @change="handleSelected($event, item.stepID)"
                        />
                      </div>
                    </div>
                    <div
                      class="note-wrapper"
                      @click="handleItemClick(item.stepID)"
                    >
                      <font-awesome-icon
                        :icon="textTypes[item.comment.type].icon"
                        class="mr-1"
                        :style="{
                          borderColor: textTypes[item.comment.type].fill,
                          color: textTypes[item.comment.type].fill,
                        }"
                        :border="true"
                      />
                      <span
                        class="comment-type"
                        :style="{ color: currentTheme.secondary }"
                      >
                        {{ item.comment.type }}:
                      </span>
                      <span v-html="item.comment.content"></span>
                    </div>
                  </div>
                </v-timeline-item>
              </div>
            </draggable>
            <v-timeline-item
              class="timeline-item pb-0"
              color="primary"
              icon="mdi-stop-circle"
              fill-dot
            >
              <div class="duration-text">
                <v-icon>mdi-clock-outline</v-icon>
                <span>{{ formatTime($store.state.session.timer) }}</span>
              </div>
            </v-timeline-item>
          </v-timeline>
        </div>
      </v-col>
    </v-row>
    <v-row
      :class="{ 'drop-indicator': true, hidden: !isDragging || itemDragging }"
      v-if="status !== 'pending' && status !== 'pause'"
    >
      <p>
        <img :src="require('../assets/icon/plus.svg')" width="24" height="24" />
      </p>
    </v-row>
    <v-row v-if="status !== 'pending' && status !== 'pause'">
      <v-col cols="12" class="text-center">
        <v-btn
          plain
          :style="{ color: currentTheme.secondary }"
          class="text-capitalize"
          @click="uploadEvidence"
        >
          {{ $tc("caption.upload_evidence", 1) }}
        </v-btn>
      </v-col>
    </v-row>
    <AddEvidenceDialog
      v-if="evidenceData"
      v-model="addEvidenceDialog"
      :item-data="evidenceData"
      @close="
        addEvidenceDialog = false;
        evidenceData = null;
      "
    />
    <EditEvidenceDialog
      v-if="itemToEdit"
      v-model="editEvidenceDialog"
      :item-data="itemToEdit"
      @close="
        editEvidenceDialog = false;
        itemToEdit = null;
      "
    />
  </v-container>
</template>

<script>
import {
  VContainer,
  VRow,
  VCol,
  VIcon,
  VTimeline,
  VTimelineItem,
  VBtn,
} from "vuetify/lib/components";
import { VEmojiPicker } from "v-emoji-picker";

import draggable from "vuedraggable";
import dayjs from "dayjs";

import { STATUSES, TEXT_TYPES, FILE_TYPES } from "@/modules/constants";
import AddEvidenceDialog from "@/components/dialogs/AddEvidenceDialog.vue";
import EditEvidenceDialog from "@/components/dialogs/EditEvidenceDialog.vue";

export default {
  name: "TimelineWrapper",
  components: {
    EditEvidenceDialog,
    AddEvidenceDialog,
    VContainer,
    VRow,
    VCol,
    VIcon,
    VTimeline,
    VTimelineItem,
    VBtn,
    VEmojiPicker,
    draggable,
  },
  props: {
    items: {
      type: Array,
      default: () => [],
    },
    selectedItems: {
      type: Array,
      default: () => [],
    },
    eventType: {
      type: String,
      default: () => "",
    },
  },
  watch: {
    items: {
      handler(newValue) {
        this.itemLists = newValue;
        let newMap = { ...this.emojiMenu };
        this.itemLists.map((item) => {
          newMap[`menu-${item.stepID}`] = false;
        });
        this.emojiMenu = newMap;
      },
      immediate: true,
    },
    selectedItems: function (newValue) {
      this.selected = newValue;
    },
    eventType: function (newValue) {
      this.eventName = newValue;
    },
  },
  data() {
    return {
      itemLists: [],
      selected: [],
      activeSession: {},
      itemToEdit: null,
      tags: "",
      eventName: this.eventType,
      textTypes: TEXT_TYPES,
      clicks: 0,
      isDragging: false,
      itemDragging: false,
      emojiMenu: {},
      selectedId: null,
      addEvidenceDialog: false,
      evidenceData: null,
      editEvidenceDialog: false,
    };
  },
  computed: {
    status() {
      return this.$store.state.session.status;
    },
    current() {
      return dayjs().format("MM-DD-YYYY");
    },
    currentTheme() {
      if (this.$vuetify.theme.dark) {
        return this.$vuetify.theme.themes.dark;
      } else {
        return this.$vuetify.theme.themes.light;
      }
    },
  },
  mounted() {
    this.emojiMenu = {};
    this.itemLists.map((item) => {
      this.emojiMenu[`menu-${item.stepID}`] = false;
    });
  },
  methods: {
    getType(type) {
      return FILE_TYPES[type];
    },
    formatTime(timeInSeconds) {
      const seconds = ("0" + (timeInSeconds % 60)).slice(-2);
      const minutes = ("0" + (parseInt(timeInSeconds / 60, 10) % 60)).slice(-2);
      const hours = ("0" + (parseInt(timeInSeconds / 3600, 10) % 24)).slice(-2);

      return hours + ":" + minutes + ":" + seconds;
    },
    async uploadEvidence() {
      console.log("upload evidence");
      // todo add relative handler for web app
      if (this.$isElectron) {
        const { status, message, item } =
          await this.$electronService.uploadEvidence();

        if (status === STATUSES.ERROR) {
          this.$root.$emit("set-snackbar", message);
        } else {
          const data = {
            ...item,
            timer_mark: this.$store.state.session.timer,
          };
          this.evidenceData = data;
          this.addEvidenceDialog = true;
        }
      }
    },
    async openEditorModal(data) {
      if (this.$isElectron) {
        // todo replace with vuetify dialog
        await this.$electronService.openAddWindow(data);
      }
    },
    checkedItem(id) {
      return this.selected.includes(id);
    },
    handleSelected($event, id) {
      if ($event.target.checked && !this.selected.includes(id)) {
        this.selected.push(id);
      } else {
        this.selected = this.selected.filter((n) => n != id);
      }
      this.$root.$emit("update-selected", this.selected);
    },
    handleChange() {
      this.saveData();
    },
    handleItemClick(id) {
      this.clicks++;
      if (this.clicks === 1) {
        setTimeout(
          function () {
            switch (this.clicks) {
              case 1:
                if (this.eventName === "click") {
                  this.handleActivateEditSession(id);
                }
                break;
              default:
                if (this.eventName === "dblclick") {
                  this.handleActivateEditSession(id);
                }
            }
            this.clicks = 0;
          }.bind(this),
          200
        );
      }
    },
    handleFollowUp($event, id) {
      this.itemLists = this.itemLists.map((item) => {
        let temp = Object.assign({}, item);
        if (temp.stepID === id) {
          temp.followUp = $event.target.checked;
        }
        return temp;
      });
      this.saveData();
    },
    async handleActivateEditSession(id) {
      this.itemToEdit = await this.$storageService.getItemById(id);
      this.editEvidenceDialog = true;
    },
    async dragItem(event, item) {
      event.preventDefault();
      if (this.$isElectron) {
        // todo make dragging work in the web app
        this.itemDragging = true;
        await this.$electronService.dragItem(item);
        this.itemDragging = false;
      }
    },
    async dropFile(event) {
      event.preventDefault();
      event.stopPropagation();
      this.isDragging = false;
      if (!this.itemDragging) {
        if (event.dataTransfer.files.length === 0 || !this.$isElectron) {
          return;
        }

        // TODO - Handle multiple files dropped.
        const { status, message, item } = await this.$electronService.dropFile(
          event
        );

        if (status === STATUSES.ERROR) {
          this.$root.$emit("set-snackbar", message);
        } else {
          const data = {
            ...item,
            timer_mark: this.$store.state.session.timer,
          };
          await this.openEditorModal(data);
        }
        this.isDragging = false;
      }
    },
    dragEnter(event) {
      event.preventDefault();
    },
    dragLeave(event) {
      this.isDragging = false;
      event.preventDefault();
    },
    dragOver(event) {
      this.isDragging = true;
      event.preventDefault();
      event.stopPropagation();
    },
    dragStartHandler(e) {
      const img = new Image();
      img.src = require("../assets/icon/drag-drop.png");
      e.dataTransfer.setDragImage(img, 0, 0);
    },
    handleSelectedItem(id) {
      this.selectedId = id;
    },
    selectEmoji(emoji) {
      this.emojiMenu[`menu-${this.selectedId}`] = false;

      this.itemLists = this.itemLists.map((item) => {
        let temp = Object.assign({}, item);
        if (temp.stepID === this.selectedId) {
          if (temp.emoji.filter((item) => item.data === emoji.data).length) {
            temp.emoji = temp.emoji.filter((item) => item.data !== emoji.data);
          } else {
            temp.emoji.push(emoji);
          }
        }
        return temp;
      });
      this.saveData();
    },
    removeEmoji(id, emoji) {
      this.itemLists = this.itemLists.map((item) => {
        let temp = Object.assign({}, item);
        if (temp.stepID === id) {
          temp.emoji = temp.emoji.filter((item) => item.data !== emoji.data);
        }
        return temp;
      });
      this.saveData();
    },
    async saveData() {
      await this.$store.commit("setSessionItems", this.itemLists);
    },
  },
};
</script>
<style scoped>
.icon {
  margin-top: 2px;
}
.hidden {
  display: none;
}
.timeline-item {
  height: auto;
  display: flex;
  align-items: center;
}
.image-wrapper {
  position: relative;
  display: flex;
  background: #fff;
  border: 1px solid #d1d3db;
  border-radius: 4px;
  overflow: hidden;
  cursor: pointer;
}
.video-wrapper {
  position: relative;
  display: flex;
  background: #fff;
  border: 1px solid #d1d5db;
  overflow: hidden;
  cursor: pointer;
}
.v-icon.video-play {
  border: 1px solid #c7c7c8;
  border-radius: 50%;
  height: 56px;
  width: 56px;
  background-color: #c7c7c8;
  color: #17191a;
  opacity: 0.8;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
.filename-text {
  font-style: italic;
  font-size: 11px;
}
.audio-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 14px;
  background: #fff;
  border-radius: 6px;
  border: 1px solid #d1d5db;
  cursor: pointer;
}
.comment-wrapper {
  display: flex;
}
.comment-type {
  font-weight: bold;
  margin-right: 4px;
}
.drop-indicator {
  border-radius: 15px;
  background: #eee;
  height: 10em;
}
.drop-indicator p {
  margin: auto;
  padding: 1em 2em;
  border-radius: 15px;
  border: 3px dashed #aaa;
}
.note-wrapper {
  display: flex;
  padding: 8px 14px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  cursor: pointer;
}
.audio-wrapper .audio-wave {
  flex-grow: 1;
}
.audio-wrapper .audio-wave img {
  width: 100%;
}
.file-wrapper.image {
  position: relative;
  display: flex;
  background: #fff;
  border: 1px solid #d1d5db;
  overflow: hidden;
  cursor: pointer;
}
.file-wrapper.file {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 14px;
  background: #fff;
  border-radius: 6px;
  border: 1px solid #d1d5db;
  cursor: pointer;
}
.file-wrapper.file .file-name {
  font-size: 14px;
  font-weight: 500;
  font-style: normal;
  line-height: 16px;
  color: #6b7280;
  cursor: pointer;
}
.tags-wrapper .tag {
  margin-right: 5px;
}
.tags-wrapper .tag:last-child {
  margin-right: 0;
}

.actions-wrapper {
  display: flex;
  column-gap: 3px;
  flex-wrap: wrap;
}
.actions-wrapper .v-btn.theme--dark {
  background-color: white;
  margin-left: 2px;
}
.emoji-icon {
  font-size: 18px;
  line-height: 1;
}
.check-box {
  display: flex;
  align-items: center;
}
.check-box > label {
  display: flex;
  column-gap: 5px;
  font-size: 13px;
  align-items: center;
  font-weight: 500;
  line-height: 20px;
  color: #6b7280;
}
</style>
