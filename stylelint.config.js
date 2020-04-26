module.exports = {
  ignoreFiles: ["**/*.js", "**/*.vue", "**/*.svg"],
  processors: ["stylelint-processor-html"],
  extends: "stylelint-config-standard",
  plugins: ["stylelint-order", "stylelint-prettier", "stylelint-scss"],
  rules: {
    "at-rule-no-unknown": [
      true,
      {
        ignoreAtRules: ["function", "if", "each", "include", "mixin", "for"],
      },
    ],
    "no-empty-source": null,
    "prettier/prettier": true,
    "order/order": ["custom-properties", "declarations"],
    "order/properties-alphabetical-order": true,
  },
};
