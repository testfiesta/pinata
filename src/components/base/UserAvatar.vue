<template>
  <v-avatar
    v-bind="$attrs"
    :size="size"
    :color="systemAvatar?.backgroundColor ?? '#0c2ff3'"
    :style="{ '--system-icon-color': systemAvatar?.color ?? '#FFF' }"
    :class="{ 'org-avatar': isOrg }"
    v-on="$listeners"
  >
    <v-img
      v-if="avatar?.user || avatarSrc"
      :src="avatar?.user ?? avatarSrc"
      :lazy-src="avatarSrc"
      alt="logo"
    />

    <UserIcon
      v-else-if="(!avatar?.user && avatar?.system) || !placeHolderName"
      class="user-icon"
    />
    <span v-else class="white--text">
      {{ rawText ? name : placeHolderName }}
    </span>
  </v-avatar>
</template>
<script>
import { Avatars } from "@/constants/avatars.js";
import UserIcon from "@/assets/svg/UserIcon.svg";
export default {
  name: "UserAvatar",
  components: {
    UserIcon,
  },
  inheritAttrs: false,
  props: {
    avatar: {
      type: Object,
    },
    name: {
      type: String,
      required: false,
    },
    avatarSrc: {
      type: String,
    },
    rawText: {
      type: Boolean,
      default: false,
    },
    isOrg: {
      type: Boolean,
      default: false,
    },
    size: {
      type: Number,
      default: 40,
    },
  },
  computed: {
    placeHolderName() {
      if (!this.name) return null;

      const name = this.name.split(" ");
      return name.length > 1
        ? name[0].charAt(0) + name[1].charAt(0)
        : name[0].charAt(0);
    },
    systemAvatar() {
      const avatar = Avatars[this.avatar?.system];
      return avatar
        ? {
            backgroundColor: avatar.backgroundColor,
            color: avatar.color,
          }
        : {};
    },
  },
};
</script>
<style scoped>
.v-avatar span {
  font-weight: 500;
  font-size: 13px;
  color: #44546f;
  text-transform: uppercase;
}
::v-deep path {
  transform: scale(0.7);
  transform-origin: center;
  stroke: var(--system-icon-color);
}
.org-avatar {
  height: 1.2rem;
  min-width: 1.2rem;
  position: absolute !important;
  transform: translate(-15px, 21px) !important;
  font-size: 11px;
}
.org-avatar span {
  font-size: 11px;
}
</style>
