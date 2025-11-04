import globals from "globals";
import { defineConfig } from "eslint/config";

const rules = {
  "indent": ["error", 2, { "SwitchCase": 1 }],
  "semi": ["error", "always"],
  "quotes": ["error", "double"]
};

export default defineConfig([
  {
    files: ["**/*.js"], languageOptions: { sourceType: "script" },
    rules: rules
  },
  {
    files: ["**/*.{js,mjs,cjs}"], languageOptions: { globals: globals.browser },
    rules: rules
  },
]);
