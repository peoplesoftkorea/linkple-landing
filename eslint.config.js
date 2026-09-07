import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";

export default [
  { ignores: ["dist"] },
  {
    files: ["**/*.{js,jsx}"],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
        sourceType: "module",
      },
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      "no-unused-vars": [
        "error",
        { varsIgnorePattern: "^[A-Z_]", argsIgnorePattern: "^[A-Z_]" },
      ],
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
    },
  },
  {
    // 서버 코드는 브라우저가 아니라 Node 에서 돈다 — 전역이 다르다.
    files: ["server/**/*.js", "api/**/*.js", "prisma/**/*.js", "scripts/**/*.mjs", "vite.config.js"],
    languageOptions: {
      ecmaVersion: 2022,
      globals: { ...globals.node },
      parserOptions: { sourceType: "module" },
    },
    rules: {
      ...js.configs.recommended.rules,
      // Express 의 에러 핸들러는 인자가 넷이어야 에러 전용으로 인식된다.
      // 쓰지 않아도 next 를 지울 수 없다 — _ 로 시작하면 예외로 둔다.
      "no-unused-vars": [
        "error",
        { varsIgnorePattern: "^[A-Z_]", argsIgnorePattern: "^(_|[A-Z])" },
      ],
    },
  },
];
