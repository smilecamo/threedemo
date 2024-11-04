import { defineConfig } from "vite";
import ViteObfuscatePlugin from "vite-plugin-obfuscator";

export default defineConfig({
  build: {
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
      mangle: {
        toplevel: true,
        safari10: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
  plugins: [
    ViteObfuscatePlugin({
      obfuscatorOptions: {
        rotateStringArray: true,
        stringArray: true,
        stringArrayEncoding: ["base64"],
        deadCodeInjection: true,
        deadCodeInjectionThreshold: 0.4,
        debugProtection: true,
        debugProtectionInterval: true,
        disableConsoleOutput: true,
        selfDefending: true,
        splitStrings: true,
        splitStringsChunkLength: 5,
        transformObjectKeys: true,
        unicodeEscapeSequence: true,
      },
    }),
  ],
});
