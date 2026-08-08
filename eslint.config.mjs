import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Static assets served as-is — not project source (includes the
    // self-hosted CesiumJS build, pre-downloaded map tile packs, and the
    // static viveka-digvijaya/rkm-centres HTML/JS apps).
    "public/**",
  ]),
]);

export default eslintConfig;
