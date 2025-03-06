<template>
  <v-container class="timeline-wrapper">
    <v-row>
      <v-col cols="12" class="pa-0">
        <div
          class="timeline-wrap pt-3"
          @dragenter="dragEnter($event)"
          @dragleave="dragLeave($event)"
          @dragover="dragOver($event)"
          @drop="dropFile($event)"
        >
          <v-timeline align-top dense class="pt-0 timeline-theme">
            <v-timeline-item class="timeline-item" fill-dot large>
              <template v-slot:icon>
                <div class="start-end-wrapper">
                  <img
                    src="../assets/icon/timeline-icon/play.svg"
                    alt="play"
                    class="icon"
                  />
                </div>
              </template>
              <div class="duration-text mb-3 py-2">
                <div
                  class="d-flex fs-14 mb-1 font-weight-semibold"
                  :style="{ color: currentTheme.secondary }"
                >
                  {{ $tc("caption.session_started", 1) }}
                </div>
                <div class="date-text">
                  <span v-if="$store.state.session.started">{{
                    formatDate($store.state.session.started)
                  }}</span>
                  <span v-else>{{ formatDate(current) }}</span>
                </div>
              </div>
              <div class="d-flex justify-start align-center">
                <img
                  src="../assets/icon/timeline-icon/message.svg"
                  alt="message"
                  class="icon"
                />
                <img
                  src="../assets/icon/timeline-icon/face-smile.svg"
                  alt="emoticon"
                  class="icon mx-2"
                />
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
                v-for="(item, i) in filteredItemLists"
                :key="i"
                :class="`drag-item`"
                @dragstart="(event) => dragItem(event, item)"
              >
                <v-timeline-item
                  v-if="getType(item.fileType) === 'image'"
                  class="timeline-item"
                  :class="{
                    'active-item': selectedEvidenceStepId == item.stepID,
                  }"
                  large
                  fill-dot
                >
                  <template v-slot:icon>
                    <div class="dot-wrapper">
                      <img
                        :src="
                          selectedEvidenceStepId === item.stepID
                            ? require('@/assets/icon/timeline-icon/camera-blue.svg')
                            : require('@/assets/icon/timeline-icon/camera-gray.svg')
                        "
                        alt="camera"
                        class="icon"
                      />
                    </div>
                  </template>
                  <div class="d-flex flex-column screenshot">
                    <div
                      class="d-flex justify-space-between align-start mb-3 py-2"
                    >
                      <div class="duration-text">
                        <div
                          class="d-flex fs-14 mb-1 font-weight-semibold"
                          :style="{ color: currentTheme.secondary }"
                        >
                          {{ $tc("caption.screenshot", 1) }} •
                          {{ item?.comment?.type }}
                        </div>
                        <div class="date-text">
                          <span>{{ formatCreatedDate(item.createdAt) }}</span>
                        </div>
                      </div>
                      <div class="d-flex align-start">
                        <v-checkbox
                          :value="checkedItem(item.stepID)"
                          class="field-theme mt-0"
                          :ripple="false"
                          :item-value="item.stepID"
                          hide-details
                          off-icon="icon-checkbox-off"
                          on-icon="icon-checkbox-on"
                          @change="handleSelected($event, item.stepID)"
                        />
                      </div>
                    </div>
                    <div
                      class="image-wrapper mb-2"
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
                    <div v-if="item.tags.length" class="tags-wrapper mb-2">
                      <v-chip
                        v-for="(tag, i) in item.tags"
                        :key="i"
                        class="tag"
                        small
                        color="#ffffff"
                        text-color="#344054"
                      >
                        {{ tag.text }}
                      </v-chip>
                    </div>
                    <div class="actions-wrapper">
                      <div
                        class="d-flex justify-space-between align-center w-full"
                      >
                        <div>
                          <v-tooltip bottom>
                            <template v-slot:activator="{ on: tooltip }">
                              <v-btn
                                rounded
                                class="pa-0 mb-1"
                                depressed
                                height="24"
                                text
                                icon
                                width="24"
                                v-on="{
                                  ...tooltip,
                                }"
                              >
                                <img
                                  src="../assets/icon/timeline-icon/message.svg"
                                  width="20"
                                  height="20"
                                />
                              </v-btn>
                            </template>
                            <span>{{ $tc("caption.add_comment", 1) }}</span>
                          </v-tooltip>

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
                                    class="pa-0 mb-1 mx-2"
                                    depressed
                                    text
                                    icon
                                    height="24"
                                    width="24"
                                    v-on="{
                                      ...menu,
                                      ...tooltip,
                                    }"
                                    @click="handleSelectedItem(item.stepID)"
                                  >
                                    <img
                                      src="../assets/icon/timeline-icon/face-smile.svg"
                                      width="20"
                                      height="20"
                                    />
                                  </v-btn>
                                </template>
                                <span>{{
                                  $tc("caption.add_reaction", 1)
                                }}</span>
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

                          <template v-if="item.emoji.length">
                            <v-btn
                              rounded
                              depressed
                              class="pl-0 pr-1 mb-1"
                              height="20"
                              min-width="20"
                              text
                              style=""
                              v-for="(emoji, i) in item.emoji"
                              :key="i"
                              @click="removeEmoji(item.stepID, emoji)"
                            >
                              <span class="emoji-icon">{{ emoji.data }}</span>
                              <v-icon x-small>mdi-close</v-icon>
                            </v-btn>
                          </template>
                        </div>
                        <div>
                          <v-btn
                            rounded
                            depressed
                            class="text-capitalize rounded-lg white--text"
                            color="primary"
                            style=""
                            @click="editEvidence(item)"
                          >
                            {{ $tc("menu.edit", 1) }}
                          </v-btn>
                        </div>
                      </div>
                    </div>
                  </div>
                </v-timeline-item>
                <v-timeline-item
                  v-if="getType(item.fileType) === 'video'"
                  color="primary"
                  icon="mdi-video"
                  :class="{
                    'active-item': selectedEvidenceStepId == item.stepID,
                  }"
                  fill-dot
                >
                  <template v-slot:icon>
                    <div class="dot-wrapper">
                      <img
                        :src="
                          selectedEvidenceStepId === item.stepID
                            ? require('@/assets/icon/timeline-icon/video-blue.svg')
                            : require('@/assets/icon/timeline-icon/video-gray.svg')
                        "
                        alt="video"
                        class="icon"
                      />
                    </div>
                  </template>
                  <div class="d-flex flex-column">
                    <div
                      class="d-flex justify-space-between align-start mb-3 py-2"
                    >
                      <div class="duration-text">
                        <div
                          class="d-flex fs-14 mb-1 font-weight-semibold"
                          :style="{ color: currentTheme.secondary }"
                        >
                          {{ $tc("caption.video_record", 1) }} •
                          {{ item?.comment?.type }}
                        </div>
                        <div class="date-text">
                          <span>{{ formatCreatedDate(item.createdAt) }}</span>
                        </div>
                      </div>
                      <div class="d-flex align-center">
                        <v-checkbox
                          :value="checkedItem(item.stepID)"
                          class="field-theme mt-0"
                          :item-value="item.stepID"
                          :ripple="false"
                          hide-details
                          off-icon="icon-checkbox-off"
                          on-icon="icon-checkbox-on"
                          @change="handleSelected($event, item.stepID)"
                        />
                      </div>
                    </div>
                    <div
                      class="video-wrapper mb-2"
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
                    <div v-if="item.tags.length" class="tags-wrapper mb-2">
                      <v-chip
                        v-for="(tag, i) in item.tags"
                        :key="i"
                        class="tag"
                        small
                        color="#ffffff"
                        text-color="#344054"
                      >
                        {{ tag.text }}
                      </v-chip>
                    </div>
                    <div class="actions-wrapper">
                      <div
                        class="d-flex justify-space-between align-center w-full"
                      >
                        <div>
                          <v-tooltip bottom>
                            <template v-slot:activator="{ on: tooltip }">
                              <v-btn
                                rounded
                                class="pa-0 mb-1"
                                depressed
                                height="24"
                                text
                                icon
                                width="24"
                                v-on="{
                                  ...tooltip,
                                }"
                              >
                                <img
                                  src="../assets/icon/timeline-icon/message.svg"
                                  width="20"
                                  height="20"
                                />
                              </v-btn>
                            </template>
                            <span>{{ $tc("caption.add_comment", 1) }}</span>
                          </v-tooltip>
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
                                    class="pa-0 mb-1 mx-2"
                                    depressed
                                    text
                                    icon
                                    height="24"
                                    width="24"
                                    v-on="{
                                      ...menu,
                                      ...tooltip,
                                    }"
                                    @click="handleSelectedItem(item.stepID)"
                                  >
                                    <img
                                      src="../assets/icon/timeline-icon/face-smile.svg"
                                      width="20"
                                      height="20"
                                    />
                                  </v-btn>
                                </template>
                                <span>{{
                                  $tc("caption.add_reaction", 1)
                                }}</span>
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
                          <template v-if="item.emoji.length">
                            <v-btn
                              rounded
                              depressed
                              class="pl-0 pr-1 mb-1"
                              height="20"
                              min-width="20"
                              text
                              style=""
                              v-for="(emoji, i) in item.emoji"
                              :key="i"
                              @click="removeEmoji(item.stepID, emoji)"
                            >
                              <span class="emoji-icon">{{ emoji.data }}</span>
                              <v-icon x-small>mdi-close</v-icon>
                            </v-btn>
                          </template>
                        </div>
                        <div>
                          <v-btn
                            rounded
                            depressed
                            class="text-capitalize rounded-lg white--text"
                            color="primary"
                            style=""
                            @click="editEvidence(item)"
                          >
                            {{ $tc("menu.edit", 1) }}
                          </v-btn>
                        </div>
                      </div>
                    </div>
                  </div>
                </v-timeline-item>
                <v-timeline-item
                  v-if="getType(item.fileType) === 'audio'"
                  color="primary"
                  icon="mdi-microphone"
                  :class="{
                    'active-item': selectedEvidenceStepId == item.stepID,
                  }"
                  large
                  fill-dot
                >
                  <template v-slot:icon>
                    <div class="dot-wrapper">
                      <img
                        :src="
                          selectedEvidenceStepId === item.stepID
                            ? require('@/assets/icon/timeline-icon/microphone-blue.svg')
                            : require('@/assets/icon/timeline-icon/microphone-gray.svg')
                        "
                        alt="microphone"
                        class="icon"
                      />
                    </div>
                  </template>
                  <div class="d-flex flex-column">
                    <div
                      class="d-flex justify-space-between align-start mb-3 py-2"
                    >
                      <div class="duration-text">
                        <div
                          class="d-flex fs-14 mb-1 font-weight-semibold"
                          :style="{ color: currentTheme.secondary }"
                        >
                          {{ $tc("caption.audio", 1) }} •
                          {{ item?.comment?.type }}
                        </div>
                        <div class="date-text">
                          <span>{{ formatCreatedDate(item.createdAt) }}</span>
                        </div>
                      </div>
                      <div class="d-flex align-center">
                        <v-checkbox
                          :value="checkedItem(item.stepID)"
                          class="field-theme mt-0"
                          :ripple="false"
                          :item-value="item.stepID"
                          hide-details
                          off-icon="icon-checkbox-off"
                          on-icon="icon-checkbox-on"
                          @change="handleSelected($event, item.stepID)"
                        />
                      </div>
                    </div>
                    <WaveForm
                      class="mb-2 audio-wrapper"
                      :audioFile="item.filePath"
                    />
                    <div v-if="item?.tags?.length" class="tags-wrapper mb-2">
                      <v-chip
                        v-for="(tag, i) in item.tags"
                        :key="i"
                        class="tag"
                        small
                        color="#ffffff"
                        text-color="#344054"
                      >
                        {{ tag.text }}
                      </v-chip>
                    </div>
                    <div class="actions-wrapper">
                      <div
                        class="d-flex justify-space-between align-center w-full"
                      >
                        <div>
                          <v-tooltip bottom>
                            <template v-slot:activator="{ on: tooltip }">
                              <v-btn
                                rounded
                                class="pa-0 mb-1"
                                depressed
                                height="24"
                                text
                                icon
                                width="24"
                                v-on="{
                                  ...tooltip,
                                }"
                              >
                                <img
                                  src="../assets/icon/timeline-icon/message.svg"
                                  width="20"
                                  height="20"
                                />
                              </v-btn>
                            </template>
                            <span>{{ $tc("caption.add_comment", 1) }}</span>
                          </v-tooltip>
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
                                    class="pa-0 mb-1 mx-2"
                                    height="24"
                                    width="24"
                                    depressed
                                    text
                                    icon
                                    v-on="{
                                      ...menu,
                                      ...tooltip,
                                    }"
                                    @click="handleSelectedItem(item.stepID)"
                                  >
                                    <img
                                      src="../assets/icon/timeline-icon/face-smile.svg"
                                      width="20"
                                      height="20"
                                    />
                                  </v-btn>
                                </template>
                                <span>{{
                                  $tc("caption.add_reaction", 1)
                                }}</span>
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
                          <template v-if="item?.emoji?.length">
                            <v-btn
                              rounded
                              depressed
                              class="pl-0 pr-1 mb-1"
                              height="20"
                              min-width="20"
                              text
                              style=""
                              v-for="(emoji, i) in item.emoji"
                              :key="i"
                              @click="removeEmoji(item.stepID, emoji)"
                            >
                              <span class="emoji-icon">{{ emoji.data }}</span>
                              <v-icon x-small>mdi-close</v-icon>
                            </v-btn>
                          </template>
                        </div>
                        <div>
                          <v-btn
                            rounded
                            depressed
                            class="text-capitalize rounded-lg white--text"
                            color="primary"
                            style=""
                            @click="editEvidence(item)"
                          >
                            {{ $tc("menu.edit", 1) }}
                          </v-btn>
                        </div>
                      </div>
                    </div>
                  </div>
                </v-timeline-item>
                <v-timeline-item
                  v-if="
                    getType(item.fileType) === undefined &&
                    item?.comment?.type !== 'Summary' &&
                    item?.comment?.type
                  "
                  color="primary"
                  :class="{
                    'active-item': selectedEvidenceStepId == item.stepID,
                  }"
                  icon="mdi-file"
                  fill-dot
                >
                  <template v-slot:icon>
                    <div class="dot-wrapper">
                      <img
                        :src="
                          selectedEvidenceStepId === item.stepID
                            ? require('@/assets/icon/timeline-icon/message-blue.svg')
                            : require('@/assets/icon/timeline-icon/message-gray.svg')
                        "
                        alt="message"
                        class="icon"
                      />
                    </div>
                  </template>
                  <div class="d-flex flex-column">
                    <div
                      class="d-flex justify-space-between align-start mb-3 py-2"
                    >
                      <div class="duration-text">
                        <div
                          class="d-flex fs-14 mb-1 font-weight-semibold"
                          :style="{ color: currentTheme.secondary }"
                        >
                          {{ $tc("caption.your_details", 1) }} •
                          {{ item?.comment?.type }}
                        </div>
                        <div class="date-text">
                          <span>{{ formatCreatedDate(item.createdAt) }}</span>
                        </div>
                      </div>
                      <div class="d-flex align-center">
                        <v-checkbox
                          :value="checkedItem(item.stepID)"
                          class="field-theme mt-0"
                          :item-value="item.stepID"
                          :ripple="false"
                          hide-details
                          off-icon="icon-checkbox-off"
                          on-icon="icon-checkbox-on"
                          @change="handleSelected($event, item.stepID)"
                        />
                      </div>
                    </div>
                    <div
                      class="note-wrapper"
                      @click="handleItemClick(item.stepID)"
                    >
                      <span
                        class="fs-16"
                        v-html="item?.comment?.content"
                      ></span>
                    </div>
                    <div v-if="item?.tags?.length" class="tags-wrapper my-2">
                      <v-chip
                        v-for="(tag, i) in item.tags"
                        :key="i"
                        class="tag"
                        small
                        color="#ffffff"
                        text-color="#344054"
                      >
                        {{ tag.text }}
                      </v-chip>
                    </div>
                    <div class="actions-wrapper">
                      <div
                        class="d-flex justify-space-between align-center w-full"
                      >
                        <div>
                          <v-tooltip bottom>
                            <template v-slot:activator="{ on: tooltip }">
                              <v-btn
                                rounded
                                class="pa-0 mb-1"
                                depressed
                                height="24"
                                text
                                icon
                                width="24"
                                v-on="{
                                  ...tooltip,
                                }"
                              >
                                <img
                                  src="../assets/icon/timeline-icon/message.svg"
                                  width="20"
                                  height="20"
                                />
                              </v-btn>
                            </template>
                            <span>{{ $tc("caption.add_comment", 1) }}</span>
                          </v-tooltip>
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
                                    class="pa-0 mb-1 mx-2"
                                    height="24"
                                    depressed
                                    text
                                    icon
                                    width="24"
                                    v-on="{
                                      ...menu,
                                      ...tooltip,
                                    }"
                                    @click="handleSelectedItem(item.stepID)"
                                  >
                                    <img
                                      src="../assets/icon/timeline-icon/face-smile.svg"
                                      width="20"
                                      height="20"
                                    />
                                  </v-btn>
                                </template>
                                <span>{{
                                  $tc("caption.add_reaction", 1)
                                }}</span>
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
                          <template v-if="item?.emoji?.length">
                            <v-btn
                              rounded
                              depressed
                              class="pl-0 pr-1 mb-1"
                              height="20"
                              min-width="20"
                              text
                              style=""
                              v-for="(emoji, i) in item.emoji"
                              :key="i"
                              @click="removeEmoji(item.stepID, emoji)"
                            >
                              <span class="emoji-icon">{{ emoji.data }}</span>
                              <v-icon x-small>mdi-close</v-icon>
                            </v-btn>
                          </template>
                        </div>
                        <div>
                          <v-btn
                            rounded
                            depressed
                            class="text-capitalize rounded-lg white--text"
                            color="primary"
                            style=""
                            @click="editEvidence(item)"
                          >
                            {{ $tc("menu.edit", 1) }}
                          </v-btn>
                        </div>
                      </div>
                    </div>
                  </div>
                </v-timeline-item>
                <v-timeline-item
                  v-if="getType(item.fileType) === 'mindmap'"
                  color="primary"
                  icon="mdi-camera-plus"
                  :class="{
                    'active-item': selectedEvidenceStepId == item.stepID,
                  }"
                  fill-dot
                >
                  <template v-slot:icon>
                    <div class="dot-wrapper">
                      <img
                        :src="
                          selectedEvidenceStepId === item.stepID
                            ? require('@/assets/icon/timeline-icon/mindmap-blue.svg')
                            : require('@/assets/icon/timeline-icon/mindmap-gray.svg')
                        "
                        alt="mindmap"
                        class="icon"
                      />
                    </div>
                  </template>
                  <div class="d-flex flex-column map-wrapper">
                    <div class="d-flex justify-space-between py-2">
                      <div class="duration-text">
                        <div
                          class="d-flex fs-14 mb-1 font-weight-semibold"
                          :style="{ color: currentTheme.secondary }"
                        >
                          {{ $tc("caption.mind_map", 1) }} •
                          {{ item?.comment?.type }}
                        </div>
                        <div class="date-text">
                          <span>{{ formatCreatedDate(item.createdAt) }}</span>
                        </div>
                      </div>
                      <div class="d-flex align-center">
                        <v-checkbox
                          :value="checkedItem(item.stepID)"
                          class="field-theme mt-0"
                          :ripple="false"
                          :item-value="item.stepID"
                          hide-details
                          off-icon="icon-checkbox-off"
                          on-icon="icon-checkbox-on"
                          @change="handleSelected($event, item.stepID)"
                        />
                      </div>
                    </div>
                    <div
                      v-if="$isElectron"
                      class="image-wrapper mb-2"
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
                    <div v-else @click="handleItemClick(item.stepID)">
                      <svg :class="`mindmap-${item.attachmentID}`"></svg>
                    </div>
                    <div v-if="item?.tags?.length" class="tags-wrapper mb-2">
                      <v-chip
                        v-for="(tag, i) in item.tags"
                        :key="i"
                        class="tag"
                        small
                        color="#ffffff"
                        text-color="#344054"
                      >
                        {{ tag.text }}
                      </v-chip>
                    </div>
                    <div class="actions-wrapper">
                      <div
                        class="d-flex justify-space-between align-center w-full"
                      >
                        <div>
                          <v-tooltip bottom>
                            <template v-slot:activator="{ on: tooltip }">
                              <v-btn
                                rounded
                                class="pa-0 mb-1"
                                depressed
                                height="24"
                                text
                                icon
                                width="24"
                                v-on="{
                                  ...tooltip,
                                }"
                              >
                                <img
                                  src="../assets/icon/timeline-icon/message.svg"
                                  width="20"
                                  height="20"
                                />
                              </v-btn>
                            </template>
                            <span>{{ $tc("caption.add_comment", 1) }}</span>
                          </v-tooltip>
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
                                    class="pa-0 mb-1 mx-2"
                                    depressed
                                    text
                                    icon
                                    height="24"
                                    width="24"
                                    v-on="{
                                      ...menu,
                                      ...tooltip,
                                    }"
                                    @click="handleSelectedItem(item.stepID)"
                                  >
                                    <img
                                      src="../assets/icon/timeline-icon/face-smile.svg"
                                      width="20"
                                      height="20"
                                    />
                                  </v-btn>
                                </template>
                                <span>{{
                                  $tc("caption.add_reaction", 1)
                                }}</span>
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
                          <template v-if="item.emoji.length">
                            <v-btn
                              rounded
                              depressed
                              class="pl-0 pr-1 mb-1"
                              height="20"
                              min-width="20"
                              text
                              style=""
                              v-for="(emoji, i) in item.emoji"
                              :key="i"
                              @click="removeEmoji(item.stepID, emoji)"
                            >
                              <span class="emoji-icon">{{ emoji.data }}</span>
                              <v-icon x-small>mdi-close</v-icon>
                            </v-btn>
                          </template>
                        </div>
                        <div>
                          <v-btn
                            rounded
                            depressed
                            class="text-capitalize rounded-lg white--text"
                            color="primary"
                            style=""
                            @click="editEvidence(item)"
                          >
                            {{ $tc("menu.edit", 1) }}
                          </v-btn>
                        </div>
                      </div>
                    </div>
                  </div>
                </v-timeline-item>
                <v-timeline-item
                  v-if="item.comment?.type === 'Summary' && item.comment.text"
                  color="primary"
                  icon="mdi-pencil"
                  :class="{
                    'active-item': selectedEvidenceStepId == item.stepID,
                  }"
                  fill-dot
                >
                  <template v-slot:icon>
                    <div class="dot-wrapper">
                      <img
                        :src="
                          selectedEvidenceStepId === item.stepID
                            ? require('@/assets/icon/timeline-icon/message-blue.svg')
                            : require('@/assets/icon/timeline-icon/message-gray.svg')
                        "
                        alt="message"
                        class="icon"
                      />
                    </div>
                  </template>
                  <div class="d-flex flex-column">
                    <div
                      class="d-flex justify-space-between align-start mb-3 py-2"
                    >
                      <div class="duration-text">
                        <div
                          class="d-flex fs-14 mb-1 font-weight-semibold"
                          :style="{ color: currentTheme.secondary }"
                        >
                          {{ $tc("caption.your_details", 1) }} •
                          {{ item?.comment?.type }}
                        </div>
                        <div class="date-text">
                          <span>{{ formatCreatedDate(item.createdAt) }}</span>
                        </div>
                      </div>
                      <div class="d-flex align-center">
                        <v-checkbox
                          :value="checkedItem(item.stepID)"
                          class="field-theme mt-0"
                          :item-value="item.stepID"
                          :ripple="false"
                          off-icon="icon-checkbox-off"
                          hide-details
                          on-icon="icon-checkbox-on"
                          @change="handleSelected($event, item.stepID)"
                        />
                      </div>
                    </div>
                    <div
                      class="note-wrapper"
                      @click="handleItemClick(item.stepID)"
                    >
                      <span
                        class="fs-16"
                        v-html="item?.comment?.content"
                      ></span>
                    </div>
                    <div v-if="item.tags.length" class="tags-wrapper my-2">
                      <v-chip
                        v-for="(tag, i) in item.tags"
                        :key="i"
                        class="tag"
                        small
                        color="#ffffff"
                        text-color="#344054"
                      >
                        {{ tag.text }}
                      </v-chip>
                    </div>
                    <div class="actions-wrapper">
                      <div
                        class="d-flex justify-space-between align-center w-full"
                      >
                        <div>
                          <v-tooltip bottom>
                            <template v-slot:activator="{ on: tooltip }">
                              <v-btn
                                rounded
                                class="pa-0 mb-1"
                                depressed
                                height="24"
                                text
                                icon
                                width="24"
                                v-on="{
                                  ...tooltip,
                                }"
                              >
                                <img
                                  src="../assets/icon/timeline-icon/message.svg"
                                  width="20"
                                  height="20"
                                />
                              </v-btn>
                            </template>
                            <span>{{ $tc("caption.add_comment", 1) }}</span>
                          </v-tooltip>
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
                                    class="pa-0 mb-1 mx-2"
                                    height="24"
                                    depressed
                                    text
                                    icon
                                    width="24"
                                    v-on="{
                                      ...menu,
                                      ...tooltip,
                                    }"
                                    @click="handleSelectedItem(item.stepID)"
                                  >
                                    <img
                                      src="../assets/icon/timeline-icon/face-smile.svg"
                                      width="20"
                                      height="20"
                                    />
                                  </v-btn>
                                </template>
                                <span>{{
                                  $tc("caption.add_reaction", 1)
                                }}</span>
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
                          <template v-if="item.emoji.length">
                            <v-btn
                              rounded
                              depressed
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
                        </div>
                        <div>
                          <v-btn
                            rounded
                            depressed
                            class="text-capitalize rounded-lg white--text"
                            color="primary"
                            style=""
                            @click="editEvidence(item)"
                          >
                            {{ $tc("menu.edit", 1) }}
                          </v-btn>
                        </div>
                      </div>
                    </div>
                  </div>
                </v-timeline-item>
              </div>
            </draggable>
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
import WaveSurfer from "wavesurfer.js";
import WaveForm from "./WaveForm.vue";
import {
  d3Connections,
  d3Nodes,
  // d3PanZoom,
  onTick,
} from "@/modules/mindmap/utils/d3";
import { getViewBox } from "@/modules/mindmap/utils/dimensions";

import {
  // forceCollide,
  // forceLink,
  // forceManyBody,
  // forceSimulation,
  select,
} from "d3";
import { mapGetters } from "vuex";
import theme from "../mixins/theme";

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
    WaveForm,
  },
  props: {
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
      async handler() {
        this.itemLists = this.items;
        let newMap = { ...this.emojiMenu };
        this.itemLists.map(async (item) => {
          let temp = structuredClone(item);
          newMap[`menu-${temp.stepID}`] = false;
          return temp;
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
  mixins: [theme],
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
      posterUrl: null,
      selectedEvidence: null,
    };
  },
  computed: {
    ...mapGetters({
      items: "sessionItems",
    }),
    status() {
      return this.$store.state.session.status;
    },
    selectedEvidenceStepId() {
      return this.selectedEvidence?.stepID;
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
    filteredItemLists() {
      return Array.from(
        (this.itemLists || [])
          .reduce((map, item) => map.set(item.id, item), new Map())
          .values()
      );
    },
    mindmapItems() {
      return this.itemLists?.filter(
        (item) => item.fileType === "application/json"
      );
    },
  },
  mounted() {
    this.emojiMenu = {};
    this.itemLists.map(async (item) => {
      let temp = structuredClone(item);
      this.emojiMenu[`menu-${temp.stepID}`] = false;
      return temp;
    });
    this.$root.$on("set-selected-evidence", (selected) => {
      this.selectedEvidence = selected;
    });
    // this.renderAllMaps();
  },
  methods: {
    renderAllMaps() {
      this.mindmapItems.forEach((item) => {
        this.renderMap(item);
      });
    },
    renderMap(item) {
      const svgClass = `.mindmap-${item.attachmentID}`;
      const svg = select(svgClass);
      // Bind data to SVG elements and set all the properties to render them
      const connections = d3Connections(svg, item.content.connections);
      const { nodes } = d3Nodes(svg, item.content.nodes);
      onTick(connections, nodes);

      svg
        .attr("viewBox", getViewBox(nodes.data()))
        .on(".zoom", null)
        .on("mousedown.drag", null);
    },
    editEvidence(item) {
      this.$root.$emit("edit-evidence", item);
      this.selectedEvidence = item;
    },
    getType(type) {
      return FILE_TYPES[type];
    },
    formatTime(timeInSeconds) {
      const seconds = ("0" + (timeInSeconds % 60)).slice(-2);
      const minutes = ("0" + (parseInt(timeInSeconds / 60, 10) % 60)).slice(-2);
      const hours = ("0" + (parseInt(timeInSeconds / 3600, 10) % 24)).slice(-2);

      return hours + ":" + minutes + ":" + seconds;
    },
    formatDate(stringDate) {
      const localDate = stringDate ? new Date(stringDate) : new Date();
      const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];

      const month = months[localDate.getMonth()];
      const day = String(localDate.getDate()).padStart(2, "0");
      const year = localDate.getFullYear();
      const hours = String(localDate.getHours()).padStart(2, "0");
      const minutes = String(localDate.getMinutes()).padStart(2, "0");
      const seconds = String(localDate.getSeconds()).padStart(2, "0");
      return `${month} ${day}, ${year} ${hours}:${minutes}:${seconds}`;
    },
    formatCreatedDate(date) {
      const getDate = date ? new Date(parseInt(date, 10)) : new Date();
      const options = {
        month: "short",
        day: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      };
      return getDate.toLocaleString("en-US", options).replace(",", "");
    },
    async uploadEvidence() {
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

    checkedItem(id) {
      return this.selected.includes(id);
    },
    handleSelected($event, id) {
      if ($event && !this.selected.includes(id)) {
        this.selected.push(id);
      } else {
        this.selected = this.selected?.filter((n) => n != id);
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
        let temp = structuredClone(item);
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

      let modifiedItem = { ...item };
      modifiedItem.filePath = modifiedItem.filePath.split("?")[0];

      if (this.$isElectron) {
        // todo make dragging work in the web app
        this.itemDragging = true;
        await this.$electronService.dragItem(modifiedItem);
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
          this.evidenceData = data;
          this.addEvidenceDialog = true;
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
        let temp = structuredClone(item);
        if (temp.stepID === this.selectedId) {
          if (temp.emoji?.filter((item) => item.data === emoji.data).length) {
            temp.emoji = temp.emoji?.filter((item) => item.data !== emoji.data);
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
        let temp = structuredClone(item);
        if (temp.stepID === id) {
          temp.emoji = temp.emoji?.filter((item) => item.data !== emoji.data);
        }
        return temp;
      });
      this.saveData();
    },
    async saveData() {
      await this.$store.commit("setSessionItems", this.itemLists);
    },
    generatePoster(audioFilePath) {
      return new Promise((resolve, reject) => {
        const waveSurfer = WaveSurfer.create({
          container: document.createElement("div"),
          waveColor: "#6B7280",
          progressColor: "hsla(200, 100%, 30%, 0.5)",
          cursorColor: "#000",
          barWidth: 3,
        });

        waveSurfer.load(audioFilePath);

        waveSurfer.on("ready", () => {
          const peaks = waveSurfer.backend.getPeaks(512);
          if (!peaks) {
            reject("No peaks data available.");
            waveSurfer.destroy();
            return;
          }

          const canvas = document.createElement("canvas");
          const context = canvas.getContext("2d");
          canvas.width = 512;
          canvas.height = 128;

          context.fillStyle = "#8e8e8e";
          peaks.forEach((peak, index) => {
            const h = peak * canvas.height;
            context.fillRect(index, canvas.height / 2 - h / 2, 1, h);
          });

          const dataURL = canvas.toDataURL("image/png");
          resolve(dataURL);

          waveSurfer.destroy();
        });

        waveSurfer.on("error", (error) => {
          console.error("Error with WaveSurfer:", error);
          reject(error);
        });
      });
    },
  },
};
</script>
<style scoped>
::v-deep .options {
  display: none !important;
}
.timeline-wrap {
  overflow-y: auto;
  overflow-x: hidden;
  height: 100vh;
}
.timeline-wrapper {
  /* height: calc(100vh - 24px); */
  overflow-x: hidden;
  overflow-y: overlay;
}
.node-text {
  cursor: default !important;
}
.options .option {
  display: none;
  cursor: default;
}
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
  border-radius: 8px;
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
  padding: 1rem;
  border-radius: 8px;
  background-color: #f9fafb;
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
.pointerEventsDisable {
  pointer-events: none;
}
.start-end-wrapper {
  background-color: #475467;
  width: 100%;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
}
.dot-wrapper {
  background-color: #fff;
  width: 100%;
  height: 48px;
  display: flex;
  border: solid 1px #eaecf0;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
}
.duration-text {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
}
.date-text {
  font-size: 12px;
  font-weight: 400;
  color: #475467;
}
</style>
<style>
.tag {
  border: solid 1px #d0d5dd;
  border-radius: 6px !important;
  border-color: #d0d5dd !important;
  font-weight: 500;
  font-size: 14px !important;
}
.timeline-theme .v-timeline-item .v-timeline-item__divider {
  min-width: 48px;
}
.note-wrapper p {
  margin-bottom: 0px;
}
.v-timeline-item.active-item .image-wrapper,
.v-timeline-item.active-item .video-wrapper,
.v-timeline-item.active-item .note-wrapper,
.v-timeline-item.active-item .audio-wrapper {
  border: 2px solid #00000014;
  padding: 8px;
  background-color: #e2e7fe;
  border-radius: 8px;
}
.v-timeline-item.active-item .dot-wrapper {
  background-color: #e2e7fe !important;
}
</style>
