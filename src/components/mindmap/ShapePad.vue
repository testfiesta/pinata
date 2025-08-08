<template>
  <div class="flex flex-row justify-center gap-md">
    <v-tooltip bottom>
      <template v-slot:activator="{ on }">
        <div @click="handleShape('rectangle')" v-on="on">
          <img
            width="24"
            height="24"
            :src="require('../../assets/icon/rectangle.svg')"
          />
        </div>
      </template>
      <span>{{ $tc("caption.rectangle", 1) }}</span>
    </v-tooltip>
    <v-tooltip bottom>
      <template v-slot:activator="{ on }">
        <div @click="handleShape('ellipse')" v-on="on">
          <img
            width="24"
            height="24"
            :src="require('../../assets/icon/ellipse.svg')"
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
            :src="require('../../assets/icon/triangle.svg')"
          />
        </div>
      </template>
      <span>{{ $tc("caption.triangle", 1) }}</span>
    </v-tooltip>
    <v-tooltip bottom>
      <template v-slot:activator="{ on }">
        <div @click="handleShape('downward-triangle')" v-on="on">
          <img
            width="24"
            height="24"
            :src="require('../../assets/icon/downward-triangle.svg')"
          />
        </div>
      </template>
      <span>{{ $tc("caption.downward-triangle", 1) }}</span>
    </v-tooltip>
    <v-tooltip bottom>
      <template v-slot:activator="{ on }">
        <div @click="handleShape('diamond')" v-on="on">
          <img
            width="24"
            height="24"
            :src="require('../../assets/icon/diamond.svg')"
          />
        </div>
      </template>
      <span>{{ $tc("caption.diamond", 1) }}</span>
    </v-tooltip>
  </div>
</template>

<script>
export default {
  name: "ShapePad",
  props: {
    shape: {
      type: String,
      default: () => "",
    },
  },
  methods: {
    handleShape(shape) {
      this.$root.$emit("add-node:shape", shape);
    },
  },
};
</script>
