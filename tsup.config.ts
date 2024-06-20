import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  tsconfig: "./tsconfig.json",
  format: ["cjs", "esm"],
  splitting: false,
  target: "esnext",
  sourcemap: true,
  clean: true,
  dts: true,
});
