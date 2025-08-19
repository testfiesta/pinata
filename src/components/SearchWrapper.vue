<template>
  <v-text-field
    :placeholder="$tc('caption.search', 1)"
    class="rounded-lg"
    :background-color="$theme.inputBg"
    dense
    height="40px"
    flat
    solo
    v-model="search"
    hide-details
    @input="handleSearch"
  >
    <template v-slot:prepend-inner>
      <img src="../assets/icon/search.svg" alt="search" class="icon" />
    </template>
  </v-text-field>
</template>

<script>
export default {
  name: "SearchWrapper",
  components: {},
  computed: {},
  data() {
    return {
      search: "",
    };
  },
  methods: {
    handleSearch(val) {
      this.$root.$emit("submit-search", val);
    },
  },
};
</script>
<style>
.v-input__slot {
  font-size: 14px;
}
</style>
