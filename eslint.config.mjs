// @ts-check
import withNuxt from "./.nuxt/eslint.config.mjs";

export default withNuxt({
  rules: {
    "@typescript-eslint/no-explicit-any": "off",
    "vue/html-self-closing": [
      "error",
      {
        html: {
          void: "always",
          normal: "any", // Allow both self-closing and non-self-closing for normal HTML elements
          component: "always",
        },
        svg: "always",
        math: "always",
      },
    ],
  },
});
