import Vue from 'vue'
import VueI18n from '../node_modules/vue-i18n/dist/vue-i18n.esm.js';
import { createI18n } from 'vue-i18n-bridge';
import messages from '@intlify/unplugin-vue-i18n/messages';

Vue.use(VueI18n, { bridge: true });

function transformMessages(obj, callback) {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }
  const newObj = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      newObj[key] = transformMessages(obj[key], callback);
    }
  }
  return callback(newObj);
}

const legacyMessages = transformMessages(messages, (value) => {
  if (value.loc) return value.loc.source;
  return value;
});

const i18nInstance = createI18n({
  legacy: true,
  locale: import.meta.env.VITE_APP_I18N_LOCALE || 'en',
  messages: legacyMessages,
  fallbackWarn: false,
  missingWarn: false
}, VueI18n);

export default i18nInstance;

export const t = (text, params) => i18nInstance.global.t(text, params);
