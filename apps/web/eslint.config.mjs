import { dirname } from "path";
import { fileURLToPath } from "url";
import eslintRc from "@eslint/eslintrc";

const { FlatCompat } = eslintRc;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
];

export default eslintConfig;
