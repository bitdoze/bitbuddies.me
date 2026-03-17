import { fileURLToPath, URL } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import viteReact from "@vitejs/plugin-react";
import { nitroV2Plugin } from "@tanstack/nitro-v2-vite-plugin";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { defineConfig } from "vite";
import viteTsConfigPaths from "vite-tsconfig-paths";

const resolveFromRoot = (path: string) =>
	fileURLToPath(new URL(path, import.meta.url));

const config = defineConfig({
	resolve: {
		alias: [
			{
				find: "@tiptap/core/jsx-runtime",
				replacement: resolveFromRoot("./node_modules/@tiptap/core/src/jsx-runtime.ts"),
			},
			{
				find: "@tiptap/core/jsx-dev-runtime",
				replacement: resolveFromRoot("./node_modules/@tiptap/core/src/jsx-runtime.ts"),
			},
			{
				find: "@tiptap/react/menus",
				replacement: resolveFromRoot(
					"./node_modules/@tiptap/react/src/menus/index.ts",
				),
			},
			{
				find: /^@tiptap\/([^/]+)$/,
				replacement: resolveFromRoot("./node_modules/@tiptap/$1/src/index.ts"),
			},
			{
				find: /^@tiptap\/pm\/(.+)$/,
				replacement: resolveFromRoot("./node_modules/@tiptap/pm/$1/index.ts"),
			},
		],
	},
	plugins: [
		viteTsConfigPaths({
			projects: ["./tsconfig.json"],
		}),
		nitroV2Plugin({
			preset: "bun",
		}),
		tailwindcss(),
		tanstackStart(),
		viteReact(),
	],
	optimizeDeps: {
		include: ["react-helmet-async"],
	},
	ssr: {
		noExternal: ["react-helmet-async"],
	},
});

export default config;
