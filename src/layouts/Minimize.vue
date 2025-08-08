<template>
  <v-app class="app">
    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<script>
export default {
  name: "MinimizeLayout",
  data: () => ({}),
};
</script>
<style scoped>
.app {
  background-color: transparent;
}
</style>
