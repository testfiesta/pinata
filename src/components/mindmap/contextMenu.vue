<template>
  <v-menu :position-x="x" :position-y="y" absolute offset-y>
    <v-list>
      <v-list-item v-for="action in actions" :key="action.action">
        <v-list-item-title> {{ action.label }} </v-list-item-title>
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script>
export default {
  name: "ContextMenu",
  props: {
    actions: {
      type: Array,
      default: () => [],
    },
    x: {
      type: Number,
      default: 0,
    },
    y: {
      type: Number,
      default: 0,
    },
  },
  methods: {
    emitAction(action) {
      this.$emit("action-clicked", action);
    },
  },
};
</script>

<style scoped>
.context-menu {
  position: absolute;
  background: white;
  border: 1px solid #ccc;
  box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
  min-width: 150px;
}

.context-menu div {
  padding: 10px;
  cursor: pointer;
}

.context-menu div:hover {
  background-color: #f0f0f0;
}
</style>
