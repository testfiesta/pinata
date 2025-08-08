module.exports = {
  preset: "@vue/cli-plugin-unit-jest",
  moduleFileExtensions: ["js", "ts", "json", "vue"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "\\.(css|less)$": "<rootDir>/tests/styleMock.js",
    "vuetify/lib(.*)": "<rootDir>/node_modules/vuetify/es5$1",
  },
  modulePaths: ["<rootDir>/src", "<rootDir>/node_modules"],
  transform: {
    ".+\\.(css|styl|less|sass|scss|png|jpg|ttf|woff|woff2)$":
      "jest-transform-stub",
  },
  transformIgnorePatterns: ["<rootDir>/node_modules/(?!(vuetify)/)"],
  setupFilesAfterEnv: ["<rootDir>/tests/setup.js", "<rootDir>/tests/mocks.js"],
};
