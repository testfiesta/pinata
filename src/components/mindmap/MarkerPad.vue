<template>
  <div class="flex flex-row justify-center gap-md">
    <v-tooltip bottom>
      <template v-slot:activator="{ on }">
        <div @click="handleShape('rectangle')" v-on="on">
          <img
            width="24"
            height="24"
            :src="require('../../assets/icon/edit.svg')"
          />
        </div>
      </template>
      <span>{{ $tc("caption.marker", 1) }}</span>
    </v-tooltip>
    <v-tooltip bottom>
      <template v-slot:activator="{ on }">
        <div @click="handleShape('highlight')" v-on="on">
          <img
            width="24"
            height="24"
            :src="require('../../assets/icon/highlight.svg')"
          />
        </div>
      </template>
      <span>{{ $tc("caption.ellipse", 1) }}</span>
    </v-tooltip>
    <v-tooltip bottom>
      <template v-slot:activator="{ on }">
        <div @click="handleShape('triangle')" v-on="on">
          <img
            width="24"
            height="24"
            :src="require('../../assets/icon/thin.svg')"
          />
        </div>
      </template>
      <span>{{ $tc("caption.triangle", 1) }}</span>
    </v-tooltip>
    <v-tooltip bottom>
      <template v-slot:activator="{ on }">
        <div @click="handleShape('diamond')" v-on="on">
          <img
            width="24"
            height="24"
            :src="require('../../assets/icon/thick.svg')"
          />
        </div>
      </template>
      <span>{{ $tc("caption.downward-triangle", 1) }}</span>
    </v-tooltip>
  </div>
</template>

<script>
export default {
  name: "MarkerPad",
  props: {
    shape: {
      type: String,
      default: () => "",
    },
  },
  methods: {
    handleShape(shape) {
      this.$emit("update:shape", shape);
    },
  },
};
</script>
