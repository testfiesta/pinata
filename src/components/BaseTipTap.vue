<template>
  <v-tiptap
    ref="editor"
    class="tiptap-theme"
    :value="value"
    :placeholder="placeholder"
    :toolbar="computedToolbar"
    @input="$emit('input', $event)"
  >
    <template #headings="{ editor }">
      <v-select
        v-model="selectedHeading"
        :items="headingOptions"
        class="rounded-lg custom-select"
        background-color="#F9F9FB"
        item-text="text"
        item-value="level"
        :placeholder="headingPlaceholder"
        append-icon="mdi-chevron-down"
        :menu-props="{ offsetY: true }"
        @change="setHeading(editor, $event)"
      />
    </template>
    <template #bold="{ editor }">
      <v-btn
        icon
        small
        @click="editor.chain().focus().toggleBold().run()"
        :class="{ 'v-btn--active': editor.isActive('bold') }"
      >
        <img src="/tiptap/bold.svg" alt="bold" />
      </v-btn>
    </template>
    <template #italic="{ editor }">
      <v-btn
        icon
        small
        @click="editor.chain().focus().toggleItalic().run()"
        :class="{ 'v-btn--active': editor.isActive('italic') }"
      >
        <img src="/tiptap/italic.svg" alt="italic" />
      </v-btn>
    </template>
    <template #underline="{ editor }">
      <v-btn
        icon
        small
        @click="editor.chain().focus().toggleUnderline().run()"
        :class="{ 'v-btn--active': editor.isActive('underline') }"
      >
        <img src="/tiptap/underline.svg" alt="underline" />
      </v-btn>
    </template>
    <template #bulletList="{ editor }">
      <v-btn
        icon
        small
        @click="editor.chain().focus().toggleBulletList().run()"
        :class="{ 'v-btn--active': editor.isActive('bulletList') }"
      >
        <img src="/tiptap/list.svg" alt="bulleted list" />
      </v-btn>
    </template>
    <template #orderedList="{ editor }">
      <v-btn
        icon
        small
        @click="editor.chain().focus().toggleOrderedList().run()"
        :class="{ 'v-btn--active': editor.isActive('orderedList') }"
      >
        <img src="/tiptap/list-number.svg" alt="numbered list" />
      </v-btn>
    </template>
    <template #link="{ editor }">
      <v-btn
        icon
        small
        @click="toggleLink(editor)"
        :class="{ 'v-btn--active': editor.isActive('link') }"
      >
        <img src="/tiptap/link.svg" alt="link" />
      </v-btn>
    </template>
    <template #blockquote="{ editor }">
      <v-btn
        icon
        small
        @click="editor.chain().focus().toggleBlockquote().run()"
        :class="{ 'v-btn--active': editor.isActive('blockquote') }"
      >
        <img src="/tiptap/quotes.svg" alt="blockquote" />
      </v-btn>
    </template>
    <template #aiAssist>
      <v-btn
        v-if="aiAssistEnabled"
        icon
        small
        :title="aiAssistTitle"
        @click="$emit('ai-assist-click', $refs.editor)"
      >
        <v-icon>{{ aiAssistIcon }}</v-icon>
      </v-btn>
    </template>
  </v-tiptap>
</template>

<script>
export default {
  name: "BaseTiptap",
  props: {
    value: {
      type: String,
      default: "",
    },
    placeholder: {
      type: String,
      default: "Type something...",
    },
    aiAssistEnabled: {
      type: Boolean,
      default: false,
    },
    aiAssistTitle: {
      type: String,
      default: "AI Assist",
    },
    aiAssistIcon: {
      type: String,
      default: "mdi-robot-outline",
    },
    headingPlaceholder: {
      type: String,
      default: "Heading",
    },
  },
  data() {
    return {
      headingOptions: [
        { text: "Normal Text", level: 0 },
        { text: "Heading 1", level: 1 },
        { text: "Heading 2", level: 2 },
        { text: "Heading 3", level: 3 },
      ],
      selectedHeading: 0,
    };
  },
  computed: {
    computedToolbar() {
      return [
        "#headings",
        "|",
        "#bold",
        "#italic",
        "#underline",
        "|",
        "#bulletList",
        "#orderedList",
        "|",
        "#link",
        "#blockquote",
        "|",
        "#aiAssist",
      ];
    },
  },
  methods: {
    setHeading(editor, level) {
      if (level === 0) {
        editor.chain().focus().setParagraph().run();
      } else {
        editor.chain().focus().setHeading({ level }).run();
      }
    },
    async toggleLink(editor) {
      const url = prompt("Enter URL", editor.getAttributes("link").href || "");
      if (url === null) return;
      if (url === "") {
        editor.chain().focus().unsetLink().run();
      } else {
        editor.chain().focus().setLink({ href: url }).run();
      }
    },
  },
};
</script>

<style scoped>
.v-btn--active {
  background-color: rgba(0, 0, 0, 0.1) !important;
}
.custom-select {
  min-width: 120px;
  max-width: 180px;
}
</style>
