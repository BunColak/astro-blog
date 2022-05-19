import { defineConfig } from 'astro/config';
import preact from '@astrojs/preact';

import svelte from "@astrojs/svelte";
import tailwind from "@astrojs/tailwind";

// https://astro.build/config
export default defineConfig({
  integrations: [preact(), svelte(), tailwind()]
});