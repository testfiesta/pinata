export default {
  findBinding(key, bindingConfig) {
    let keys = key.split(".");
    let bindingCursor = bindingConfig;
    for (const k of keys) {
      if (bindingCursor) {
        bindingCursor = bindingCursor?.[k];
      }
    }
    if (bindingCursor && bindingCursor.constructor === String) {
      return this.findBinding(bindingCursor, bindingConfig);
    }
    return bindingCursor || [];
  },
  printBindings(directBinding, bindingConfig) {
    if (directBinding.constructor === Array) {
      return directBinding.join(" + ").toUpperCase();
    } else {
      return this.findBinding(directBinding, bindingConfig)
        .join(" + ")
        .toUpperCase();
    }
  },
  focusField(refs, label) {
    const el = refs[label]?.$el || refs[label];
    let input = el.querySelector(".ProseMirror");
    if (!input) {
      input = el.querySelector(
        "input:not([type=hidden]),textarea:not([type=hidden])"
      );
    }
    if (input) {
      setTimeout(() => {
        input.focus();
      });
    }
  },
};
