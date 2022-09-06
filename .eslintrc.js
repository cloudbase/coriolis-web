module.exports = {
  env: {
    browser: true,
    es2021: true,
    jest: true,
    node: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier",
  ],
  overrides: [],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },
  plugins: ["react", "@typescript-eslint", "prettier", "coriolis-web"],
  settings: {
    "import/resolver": {
      typescript: {},
    },
    react: {
      version: "detect",
    },
  },
  ignorePatterns: ["*.svg", "*.png", "*.jpg", "*.jpeg", "*.woff"],
  rules: {
    "coriolis-web/import-no-duplicate-name": "error",
    "@typescript-eslint/ban-ts-comment": "off",
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-non-null-assertion": "off",
    "@typescript-eslint/no-empty-function": "off",
    "@typescript-eslint/no-non-null-asserted-optional-chain": "off",
  },
};
