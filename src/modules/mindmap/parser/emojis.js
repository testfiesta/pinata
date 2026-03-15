// Regex that matches all emojis in a string.
const matchEmojis = /([\uD800-\uDBFF][\uDC00-\uDFFF])/g;

// Emoji to category table.
const conversionTable = {
  "🗺": "mindmap",
  "🌐": "wiki",
  "🗂": "stack exchange",
  "📝": "course",
  "📖": "free book",
  "📕": "non-free book",
  "📄": "paper",
  "👀": "video",
  "🖋": "article",
  "🗃": "blog",
  "🐙": "github",
  "👾": "interactive",
  "🖌": "image",
  "🎙": "podcast",
  "📮": "newsletter",
  "💬": "chat",
  "🎥": "youtube",
  "🤖": "reddit",
  "🔎": "quora",
  "🔗": undefined,
};

// Category to emoji table, based on the table above.
const revConversionTable = {};

Object.keys(conversionTable).forEach((key) => {
  revConversionTable[conversionTable[key]] = key;
});

/*
 * Return an emoji as a GitHub image.
 */
export const emojiTemplate = (unicode, category) =>
  `<img class="mindmap-emoji" title="${category}" src="https://assets-cdn.github.com/images/icons/emoji/unicode/${unicode}.png">`;

export const customEmojiTemplate = (emoji, category) =>
  `<img class="mindmap-emoji" title="${category}" src="https://assets-cdn.github.com/images/icons/emoji/${emoji}.png">`;

/*
 * Return the category represented by the given emoji.
 */
export const emojiToCategory = (emoji) => conversionTable[emoji] || "";

/*
 * Convert all emojis to an IMG tag.
 * The bitwise magic is explained at http://crocodillon.com/blog/parsing-emoji-unicode-in-javascript
 */
export const emojiToIMG = (html) =>
  /* eslint-disable no-bitwise */
  html.replace(matchEmojis, (match) => {
    switch (match) {
      case "🤖":
        return '<img class="mindmap-emoji reddit-emoji" title="reddit" src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTNpOQVZdTCyVamjJPl92KjaDHigNWVM8mOLHPRU4DHoVNJWxCg">';

      case "🗂":
        return '<img class="mindmap-emoji" title="stackexchange" src="https://cdn.sstatic.net/Sites/stackoverflow/company/img/logos/se/se-icon.png?v=93426798a1d4">';

      case "🐙":
        return customEmojiTemplate("octocat", "github");

      case "🔎":
        return '<img class="mindmap-emoji" title="quora" src="https://www.shareicon.net/data/2016/11/03/849470_social_512x512.png">';

      // Regular unicode Emojis.
      default: {
        // Keep the first 10 bits.
        const lead = match.charCodeAt(0) & 0x3ff;
        const trail = match.charCodeAt(1) & 0x3ff;

        // 0x[lead][trail]
        const unicode = ((lead << 10) + trail).toString(16);

        return emojiTemplate(`1${unicode}`, emojiToCategory(match));
      }
    }
  });

/*
 * Inverse of emojiToCategory, but instead of returning an emoji
 * returns an IMG tag corresponding to that emoji.
 */
export const categoryToIMG = (category) =>
  emojiToIMG(revConversionTable[category] || "");