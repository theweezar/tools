import { defineConfig } from "eslint/config";
import { includeIgnoreFile } from "@eslint/compat";
import { fileURLToPath } from "node:url";

export default defineConfig([
  {
    files: ["**/*.js"],
    rules: {
      indent: ["error", 2, { SwitchCase: 1 }],
      semi: ["error", "always"],
      quotes: ["error", "double"]
    }
  },
  includeIgnoreFile(
    fileURLToPath(new URL(".eslintignore", import.meta.url)),
    ".eslintignore"
  ),
]);