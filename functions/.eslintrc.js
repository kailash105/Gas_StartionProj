module.exports = {
  root: true,
  env: {
    node: true,        // ✅ THIS IS THE FIX
    es2021: true
  },
  extends: ["eslint:recommended"],
  parserOptions: {
    ecmaVersion: 12
  },
};
