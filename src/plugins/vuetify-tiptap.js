import { VTiptap } from '@yatt-ai/vuetify-tiptap';

export default {
  install: (app) => {
    app.component('VTiptap', VTiptap);
    app.component('v-tiptap', VTiptap); 
  }
};